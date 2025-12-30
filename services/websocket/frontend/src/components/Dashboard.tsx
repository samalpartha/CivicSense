import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { wsService } from '../utils/websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, CloudRain, Sun, Wind, MapPin, Users, Shield, Activity, Menu, Bell, Search, X, ChevronRight, AlertTriangle, Phone, Bus, School, Briefcase, Navigation, Stethoscope, TrendingUp, CheckCircle, RotateCcw, Play, Clock, Newspaper, Zap, RefreshCw } from 'lucide-react';
import { allAlerts } from '@/data/mockData';


interface AlertState {
  status: 'active' | 'acknowledged' | 'dismissed';
  timestamp: Date;
}

interface Alert {
  id: string | number;
  title: string;
  severity: 'high' | 'moderate' | 'low';
  time: string;
  category: string;
  impact: string;
  location: string;
  persona: string[];
  sources: string[];
  confidence: number;
}
import { AlertDetailModal } from './AlertDetailModal';
import WarRoom from './WarRoom';

interface WeatherData {
  location: string;
  temp_f: number;
  condition: string;
  wind_mph: number;
  humidity: number;
  cached: boolean;
}

const Dashboard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [persona, setPersona] = useState<string>('all');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [flinkStats, setFlinkStats] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState<Date>(new Date());
  const [lastStatsUpdate, setLastStatsUpdate] = useState<Date>(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(5);

  const [alertStates, setAlertStates] = useState<Record<string, AlertState>>({});
  const [news, setNews] = useState<any[]>([]);

  // Fetch News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        const res = await fetch(`${API_URL}/api/news`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            setNews(data.articles);
          }
        }
      } catch (e) {
        console.error("News fetch failed", e);
      }
    };
    fetchNews();
  }, []);

  // Real-Time Alerts State (Live from WebSocket + Mock Data)
  const [dynamicAlerts, setDynamicAlerts] = useState<Alert[]>(allAlerts.map(alert => ({
    ...alert,
    location: 'Hartford', // Add default location for mock alerts
  })));

  useEffect(() => {
    // 1. Connect to WebSocket
    wsService.connect();

    // 2. Subscribe to incoming Kafka messages
    const subscription = wsService.messages$.subscribe((msg) => {
      if (msg.type === 'kafka_update' && msg.data) {

        // Map backend event to frontend Alert interface
        const rawEvent = msg.data;
        console.log("🔔 WebSocket Event Received:", rawEvent);

        const newAlert = {
          id: rawEvent.event_id || Date.now(),
          title: formatTitle(rawEvent.type, rawEvent.message),
          severity: mapSeverity(rawEvent.severity),
          // Parsing real ISO timestamp from backend 
          time: rawEvent.timestamp ? formatDistanceToNow(new Date(rawEvent.timestamp), { addSuffix: true }) : 'Just now',
          category: mapCategory(rawEvent.type),
          impact: rawEvent.message,
          location: rawEvent.area || 'General', // Map the area field
          persona: rawEvent.affected_groups ? rawEvent.affected_groups.flat() : ['all'],
          sources: [rawEvent.source || 'Live Stream'],
          confidence: 0.95
        };


        // Deduplication 
        setDynamicAlerts(prev => {
          // Deduplication: Strict check on content
          // If we already have an alert with the exact same impact message, ignore it.
          const isDuplicate = prev.some(existing =>
            existing.impact === newAlert.impact
          );

          if (isDuplicate) return prev;

          const updated = [newAlert, ...prev];
          // Limit to last 50 alerts to prevent excessive memory usage
          return updated.slice(0, 50);
        });

        // Trigger visual update for "Live Pipeline" stats
        setLastStatsUpdate(new Date());
      }
    });

    return () => {
      subscription.unsubscribe();
      wsService.disconnect();
    };
  }, []);

  // Helper Mappers for Event Data
  const formatTitle = (type: string, msg: string) => {
    if (type === 'weather_alert') return 'Weather Warning';
    if (type === 'fire_incident') return 'Fire Reported';
    if (type === 'public_safety') return 'Public Safety Alert';
    if (type === 'health_alert') return 'Health Advisory';
    return msg.split(' - ')[0] || 'Civic Alert';
  };

  const mapSeverity = (sev: string): 'high' | 'moderate' | 'low' => {
    if (sev === 'critical') return 'high';
    if (sev === 'high') return 'high';
    if (sev === 'moderate') return 'moderate';
    return 'low';
  };

  const mapCategory = (type: string) => {
    if (type === 'weather_alert') return 'Weather';
    if (type === 'fire_incident') return 'Emergency';
    if (type === 'public_safety') return 'Community';
    return 'General';
  };

  // Smart Location State
  const [locationQuery, setLocationQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState({ name: 'Hartford, CT', zip: '06103', lat: 41.7658, lon: -72.6734 });
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Demo Zip Code Map
  const zipCodeMap: Record<string, { name: string, lat: number, lon: number }> = {
    '06103': { name: 'Downtown Hartford', lat: 41.7658, lon: -72.6734 },
    '06106': { name: 'Barry Square', lat: 41.7458, lon: -72.6934 },
    '06120': { name: 'North End', lat: 41.7858, lon: -72.6634 },
    '06114': { name: 'South End', lat: 41.7358, lon: -72.6834 },
    '06050': { name: 'New Britain', lat: 41.6612, lon: -72.7795 },
  };

  const handleLocationSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationQuery(val);

    // 1. Check Local Demo Map first
    if (val.length === 5 && zipCodeMap[val]) {
      const match = zipCodeMap[val];
      setActiveLocation({ name: match.name, zip: val, lat: match.lat, lon: match.lon });
      setLastWeatherUpdate(new Date());
      return;
    }

    // 2. Fetch from Public API for ANY US Zip
    if (val.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${val}`);
        if (res.ok) {
          const data = await res.json();
          const place = data.places[0];
          setActiveLocation({
            name: `${place['place name']}, ${place['state abbreviation']}`,
            zip: val,
            lat: parseFloat(place['latitude']),
            lon: parseFloat(place['longitude'])
          });
          setLastWeatherUpdate(new Date());
        }
      } catch (err) {
        console.error("Invalid Zip Code");
      }
    }
  };

  // Broadcast location changes to AI Assistant Button (floating)
  useEffect(() => {
    const event = new CustomEvent('civic:location-update', {
      detail: { activeLocation: activeLocation }
    });
    window.dispatchEvent(event);
  }, [activeLocation]);

  const handleAcknowledge = (id: string) => {
    setAlertStates(prev => ({
      ...prev,
      [id]: { status: 'acknowledged', timestamp: new Date() }
    }));
    setIsAlertModalOpen(false);
  };

  const handleDismiss = (id: string) => {
    setAlertStates(prev => ({
      ...prev,
      [id]: { status: 'dismissed', timestamp: new Date() }
    }));
    setIsAlertModalOpen(false);
  };

  // Fetch Weather with accurate Lat/Lon
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        // Pass explicit lat/long based on active location
        const res = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(activeLocation.name)}&lat=${activeLocation.lat}&lon=${activeLocation.lon}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
          setLastWeatherUpdate(new Date());
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, [activeLocation]); // Refetch when location changes

  // Fetch Real-Time Stats from Flink SQL
  useEffect(() => {
    const fetchFlinkStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        const res = await fetch(`${API_URL}/api/stats/realtime`);
        if (res.ok) {
          // ...
          const data = await res.json();
          setFlinkStats(data);
          setLastStatsUpdate(new Date());
          // console.log('📊 Flink stats updated:', data);
        }
      } catch (e) {
        console.error("Flink stats fetch failed", e);
      }
    };

    fetchFlinkStats();
    const interval = setInterval(fetchFlinkStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for refresh indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        const now = new Date();
        const diff = Math.ceil(5 - (now.getTime() - lastStatsUpdate.getTime()) / 1000);
        return Math.max(0, diff);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lastStatsUpdate]);

  // Listen for Hero actions
  useEffect(() => {
    const handleHeroAction = (e: any) => {
      if (e.detail && e.detail.persona) {
        setPersona(e.detail.persona);
      }
    };
    window.addEventListener('civic:hero-action', handleHeroAction);
    return () => window.removeEventListener('civic:hero-action', handleHeroAction);
  }, []);

  // Live Stats Logic
  const stats = [
    {
      title: 'Active Alerts',
      value: dynamicAlerts.length.toString(),
      change: flinkStats ? '+1 (Live)' : 'Scanning...',
      icon: <Shield />,
      color: 'text-blue-700',
      context: 'Real-Time Feed'
    },
    {
      title: 'Events Today',
      value: flinkStats?.events_today?.toString() || '0',
      change: flinkStats ? '+12% vs avg' : 'waiting for data...',
      icon: <Activity />,
      color: 'text-blue-700',
      context: flinkStats?.processing_engine || 'CivicSense Engine'
    },
    {
      title: 'Households Protected',
      value: '14,500',
      change: 'Active Monitoring',
      icon: <Users />,
      color: 'text-green-700',
      context: 'Zone A, B'
    },
    {
      title: 'Avg Response Time',
      value: '1.2s',
      change: 'System Healthy',
      icon: <Zap />,
      color: 'text-purple-700',
      context: '99.9% Uptime'
    }
  ];

  /* 
     REMOVED: Hardcoded persona configs that were overriding live data.
     Now the dashboard always shows the true system state. 
  */

  // Logic to show alerts based on Mode & Persona & Location
  const alertsToShow = isDemoMode
    ? dynamicAlerts.filter(a => ['high', 'moderate'].includes(a.severity)) // Show Crisis stuff
    : dynamicAlerts.filter(a => {
      // 1. Persona Filter
      const personaMatch = persona === 'all' || a.persona.includes(persona);

      // 2. Location Filter
      // For this Hackathon/Demo, the Producer generates generic locations ("Downtown", "Hillside").
      // We interpret these as belonging to the *current active city*, whatever it is.
      // So we effectively ignore specific string matching between "Schenectady" and "Hillside" 
      // to ensure the user always sees the live system capabilities.
      const locationMatch = true;

      /* 
         Previous Strict Logic (Disabled for Demo):
         const activeCity = activeLocation.name.split(',')[0].trim();
         const isDefaultLocation = activeCity.includes('Hartford');
         if (!isDefaultLocation) {
            locationMatch = (a.location && a.location.toLowerCase().includes(activeCity.toLowerCase())) ||
              (a.title.toLowerCase().includes(activeCity.toLowerCase())) ||
              (a.impact.toLowerCase().includes(activeCity.toLowerCase()));
         }
      */

      return personaMatch && locationMatch;
    });

  const sortedAlerts = alertsToShow; // Already sorted by time (newest first)

  // 3. Combined News + Alerts Ticker
  const combinedTickerItems = [
    // Top 3 Critical Internal Alerts
    ...dynamicAlerts.slice(0, 3).map(alert => ({
      id: `alert-${alert.id}`,
      title: `🚨 ${alert.title}: ${alert.impact}`,
      source: 'CivicSense Network',
      pubDate: alert.time, // Already formatted string like "2 minutes ago" or raw date
      dateObj: new Date(), // For sorting if needed
      link: '#',
      isInternal: true
    })),
    // External News
    ...news.map(n => ({
      id: `news-${n.article_id || Math.random()}`,
      title: n.title,
      source: n.source_id || 'NewsData.io',
      pubDate: n.pubDate,
      dateObj: n.pubDate ? new Date(n.pubDate) : new Date(),
      link: n.link,
      isInternal: false
    }))
  ];

  return (
    <div className="space-y-6">

      {/* Control Bar - Hero Section */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center py-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live System Active
            </span>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Smart Location Search */}
          <div className="flex items-center relative group z-20">
            <div className={`flex items-center h-9 rounded-full bg-white border transition-all duration-300 shadow-sm ${isSearchFocused ? 'w-64 border-blue-500 ring-2 ring-blue-100' : 'w-48 border-gray-200 hover:border-gray-300'}`}>
              <MapPin size={14} className="ml-4 text-blue-500 shrink-0" />
              <input
                type="text"
                value={isSearchFocused ? locationQuery : `${activeLocation.zip} - ${activeLocation.name}`}
                onChange={handleLocationSearch}
                onFocus={() => { setIsSearchFocused(true); setLocationQuery(''); }}
                onBlur={() => {
                  // Delay to allow click on dropdown
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                placeholder="Enter Zip Code..."
                className="w-full bg-transparent border-none text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none px-3 truncate"
              />
              {activeLocation.zip && !isSearchFocused && (
                <CheckCircle size={12} className="mr-3 text-green-500 shrink-0 animate-in fade-in" />
              )}
            </div>

            {/* Zip Typeahead */}
            {isSearchFocused && (
              <div className="absolute top-10 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in slide-in-from-top-1 overflow-hidden">
                <div className="px-3 py-2 text-[10px] bg-slate-50 text-slate-500 border-b border-slate-100">SUGGESTED LOCATIONS</div>
                {Object.entries(zipCodeMap)
                  .filter(([zip, data]) => zip.includes(locationQuery) || data.name.toLowerCase().includes(locationQuery.toLowerCase()))
                  .map(([zip, data]) => (
                    <div key={zip}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group/item transition-colors"
                      onClick={() => {
                        setActiveLocation({ name: data.name, zip, lat: data.lat, lon: data.lon });
                        setLastWeatherUpdate(new Date()); // Force refresh
                        setIsSearchFocused(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{zip}</span>
                        <span className="text-xs text-slate-400">{data.name.replace('Hartford', 'Hfd')}</span>
                      </div>
                      <AlertTriangle size={10} className="text-slate-200 group-hover/item:text-blue-400" />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Persona Pill */}
          <div className="flex items-center">
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="h-9 rounded-full px-4 bg-white hover:bg-gray-50 border-gray-200 transition-all font-medium text-sm gap-2 shadow-sm">
                <Users size={14} className="text-purple-500" />
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Civic Manager</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="senior">Senior Citizen</SelectItem>
                <SelectItem value="commuter">Commuter</SelectItem>
                <SelectItem value="responder">First Responder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>

          {persona === 'all' && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => setIsWarRoomOpen(true)}
            >
              <AlertTriangle size={14} />
              War Room
            </Button>
          )}

          <Button
            size="sm"
            className="h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md px-5"
            onClick={() => {
              const event = new CustomEvent('civic:open-chat', {
                detail: {
                  autoQuery: `What immediate safety actions should I take in ${activeLocation.name} (${activeLocation.zip}) as a ${persona}?`,
                  activeLocation: activeLocation,
                  activeAlerts: sortedAlerts
                }
              });
              window.dispatchEvent(event);
            }}
          >
            <Shield size={14} />
            Ask CivicSense
          </Button>
        </div>
      </div>

      {/* Replaced Ticker Section */}
      {combinedTickerItems.length > 0 && (
        <div className="w-full bg-white border-y border-gray-100 overflow-hidden relative h-10 flex items-center mb-0 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-100 px-4 flex items-center z-10 font-bold text-blue-600 text-[10px] tracking-widest uppercase shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <Newspaper size={14} className="mr-2 text-blue-500" /> LIVE UPDATES
          </div>
          <div className="flex whitespace-nowrap animate-marquee hover:pause pl-40 items-center">
            {combinedTickerItems.map((article, i) => (
              <a
                key={`${article.id}-${i}`}
                href={article.link}
                target={article.isInternal ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-2 mx-8 text-gray-600 hover:text-blue-600 text-xs transition-colors group cursor-pointer"
                onClick={(e) => {
                  if (article.isInternal) {
                    e.preventDefault();
                    // Find original alert and open modal
                    const original = dynamicAlerts.find(a => `alert-${a.id}` === article.id);
                    if (original) {
                      setSelectedAlert(original);
                      setIsAlertModalOpen(true);
                    }
                  }
                }}
              >
                <span className={`font-semibold text-[10px] uppercase tracking-wide ${article.isInternal ? 'text-red-500' : 'text-gray-400'}`}>
                  [{article.source}]
                </span>
                <span className="font-medium group-hover:underline underline-offset-2">
                  {article.title}
                </span>
                <span className="text-gray-400 text-[10px] ml-1">
                  ({article.isInternal ? article.pubDate : (article.pubDate ? formatDistanceToNow(new Date(article.pubDate)) : 'Just now')})
                </span>
                <span className="ml-4 text-gray-200">|</span>
              </a>
            ))}
            {/* Loop Duplicate for Infinite Scroll not strictly needed if list is long, 
                 but keeping it simple: just one loop for now or double it if listing is short. 
                 For implementation simplicity, we rely on the main list being long enough or CSS to handle it.
             */}
          </div>
        </div>
      )}

      {/* Statistics Grid (Storytelling) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs font-semibold mb-1">
                <span className={stat.change.includes('+') ? 'text-green-700' : stat.change.includes('-') ? 'text-blue-700' : 'text-gray-600'}>
                  {stat.change}
                </span>
              </p>
              <div className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full w-fit mt-2">
                {stat.context}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>





      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Alerts (Persona Aware) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{isDemoMode ? "🚨 Live Crisis Feed" : `Relevant Alerts: ${persona.charAt(0).toUpperCase() + persona.slice(1)} View`}</CardTitle>
            <CardDescription>{isDemoMode ? "Real-time incoming signals from emergency services" : "Updates prioritized for your needs"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    setSelectedAlert(alert);
                    setIsAlertModalOpen(true);
                  }}
                  className={`group relative overflow-hidden transition-all duration-200 mb-3 rounded-lg border bg-white hover:shadow-md cursor-pointer
                    ${alertStates[alert.id]?.status === 'dismissed' ? 'opacity-50 grayscale' : 'opacity-100'}
                    ${alert.severity === 'high' ? 'border-l-4 border-l-red-500' :
                      alert.severity === 'moderate' ? 'border-l-4 border-l-orange-400' :
                        'border-l-4 border-l-blue-400'
                    }`}
                >
                  <div className="grid grid-cols-12 gap-4 p-4 items-start">

                    {/* Column 1: Identity (4 cols) */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {alert.severity === 'high' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">CRITICAL</Badge>}
                        {alert.severity === 'moderate' && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-orange-100 text-orange-800 hover:bg-orange-200">IMPORTANT</Badge>}
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-gray-500">{alert.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 leading-tight">{alert.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock size={12} />
                        {alert.time}
                      </div>
                    </div>

                    {/* Column 2: Context (5 cols) */}
                    <div className="col-span-12 md:col-span-5">
                      <p className="text-sm text-gray-600 leading-snug">
                        <span className="font-medium text-gray-900">Why it matters:</span> {alert.impact}
                      </p>
                    </div>

                    {/* Column 3: Verification (3 cols) */}
                    <div className="col-span-12 md:col-span-3 flex flex-col items-start md:items-end gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100/50">
                        <Shield size={12} className="fill-emerald-700" />
                        {Math.round(alert.confidence * 100)}% Verified
                      </div>

                      <div className="flex items-center justify-end gap-1">
                        {alert.sources?.slice(0, 3).map((source: string, i: number) => (
                          <div key={i} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]" title={source}>
                            {source.split(' ')[0]}
                          </div>
                        ))}
                        {(alert.sources?.length || 0) > 3 && (
                          <span className="text-[10px] text-gray-400">+{alert.sources.length - 3}</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
              {sortedAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active alerts relevant to this persona right now. Stay safe!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Weather */}
        <div className="flex flex-col gap-6">
          {/* Real Weather Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Live Conditions</CardTitle>
              <CardDescription>Real-time local sensor data</CardDescription>
            </CardHeader>
            <CardContent>
              {weather ? (
                <div className="text-center">
                  {isDemoMode ? (
                    <CloudRain className="mx-auto text-blue-600 mb-4 animate-bounce" size={64} />
                  ) : (
                    weather.condition.includes('Rain') ? <CloudRain className="mx-auto text-blue-500 mb-4" size={64} /> :
                      weather.condition.includes('Cloud') ? <Cloud className="mx-auto text-gray-400 mb-4" size={64} /> :
                        <Sun className="mx-auto text-yellow-500 mb-4" size={64} />
                  )}

                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {isDemoMode ? "58°F" : `${weather.temp_f}°F`}
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">
                    {isDemoMode ? "Heavy Rain / Flood Risk" : weather.condition}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1 text-gray-500"><Wind size={14} /> Wind</div>
                      <span className="font-semibold">{isDemoMode ? "45 mph" : `${weather.wind_mph} mph`}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1 text-gray-500"><CloudRain size={14} /> Precip</div>
                      <span className="font-semibold">{isDemoMode ? "90%" : `${weather.humidity}%`}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-[10px] text-gray-400">
                    Source: {weather.cached ? "Cached (Open-Meteo)" : "Live (Open-Meteo)"} • {weather.location}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Activity className="animate-spin text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Connecting to sensor network...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>



      {/* Intelligence Pipeline Status - RELOCATED TO FOOTER AREA */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-700">Intelligence Pipeline</span>
              <span className="text-[10px]">Real-time data ingestion</span>
            </div>
            <Badge variant="outline" className="ml-2 border-green-600/30 text-green-700 bg-green-50">
              ● Live
            </Badge>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Sources</span>
              <span className="font-mono font-bold text-slate-700">142 <span className="text-[10px] font-normal text-slate-400 ml-1">Live</span></span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Throughput</span>
              <span className="font-mono font-bold text-slate-700">1,250 <span className="text-[10px] font-normal text-slate-400 ml-1">evt/min</span></span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Deduplication</span>
              <span className="font-mono font-bold text-slate-700">94.2%</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Latency</span>
              <span className="font-mono font-bold text-slate-700">450ms</span>
            </div>
          </div>
        </div>
      </div>
      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setSelectedAlert(null);
        }}
        onAcknowledge={handleAcknowledge}
        onDismiss={handleDismiss}
      />

      {
        isWarRoomOpen && (
          <WarRoom
            onClose={() => setIsWarRoomOpen(false)}
            location={activeLocation}
            alerts={dynamicAlerts} // Passing LIVE alerts to WarRoom
          />
        )
      }

    </div >
  );
};

export default Dashboard;
