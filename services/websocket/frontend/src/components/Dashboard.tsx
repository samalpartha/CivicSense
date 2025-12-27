import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Shield,
  Zap,
  School,
  Bus,
  Play,
  RotateCcw,
  Stethoscope,
  Briefcase,
  Clock,
  RefreshCw,
  Navigation,
  MapPin,
  CheckCircle,
  EyeOff,
  Eye
} from 'lucide-react';

interface AlertState {
  status: 'active' | 'acknowledged' | 'dismissed';
  timestamp: Date;
}
import { AlertDetailModal } from './AlertDetailModal';

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
  const [flinkStats, setFlinkStats] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState<Date>(new Date());
  const [lastStatsUpdate, setLastStatsUpdate] = useState<Date>(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [alertStates, setAlertStates] = useState<Record<string, AlertState>>({});

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

  // Fetch Weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/weather?city=Hartford');
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
    const interval = setInterval(fetchWeather, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  // Fetch Real-Time Stats from Flink SQL
  useEffect(() => {
    const fetchFlinkStats = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/stats/realtime');
        if (res.ok) {
          const data = await res.json();
          setFlinkStats(data);
          setLastStatsUpdate(new Date());
          console.log('📊 Flink stats updated:', data);
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

  // Persona-specific dashboard configurations
  const personaConfigs: Record<string, any> = {
    parent: {
      stats: [
        { title: 'School Alerts', value: '2', change: 'Early dismissal', icon: <School />, color: 'text-orange-600', context: 'Hartford Elementary, Lincoln MS' },
        { title: 'Child-Safe Routes', value: '5', change: 'Active', icon: <MapPin />, color: 'text-green-600', context: 'Avoiding flood zones' },
        { title: 'Air Quality', value: 'Good', change: 'Safe for outdoor play', icon: <Wind />, color: 'text-blue-600', context: 'AQI: 45' },
        { title: 'Family Events', value: '3', change: 'Cancelled', icon: <Users />, color: 'text-yellow-600', context: 'Due to weather' }
      ]
    },
    senior: {
      stats: [
        { title: 'Heat Advisories', value: '0', change: 'All clear', icon: <Sun />, color: 'text-green-600', context: 'Temp 27°F' },
        { title: 'Mobility Alerts', value: '1', change: 'Icy sidewalks', icon: <Navigation />, color: 'text-orange-600', context: 'Main St area' },
        { title: 'Medical Facilities', value: '12', change: 'All open', icon: <Stethoscope />, color: 'text-blue-600', context: 'Routes clear' },
        { title: 'Support Services', value: '24/7', change: 'Available', icon: <Shield />, color: 'text-purple-600', context: 'Senior hotline active' }
      ]
    },
    commuter: {
      stats: [
        { title: 'Transit Delays', value: '1', change: 'I-91 incident', icon: <Bus />, color: 'text-red-600', context: 'Major traffic accident' },
        { title: 'Alt Routes', value: '4', change: 'Available', icon: <Navigation />, color: 'text-green-600', context: 'Via I-84, Route 2' },
        { title: 'Traffic Level', value: 'Heavy', change: '+15min avg', icon: <AlertTriangle />, color: 'text-orange-600', context: 'Evening rush' },
        { title: 'Park & Ride', value: '3', change: 'Spaces available', icon: <Briefcase />, color: 'text-blue-600', context: 'Open lots' }
      ]
    },
    student: {
      stats: [
        { title: 'Campus Alerts', value: '1', change: 'Library closed early', icon: <School />, color: 'text-orange-600', context: 'Weather precaution' },
        { title: 'Study Spaces', value: '8', change: 'Open', icon: <Briefcase />, color: 'text-green-600', context: 'Union, Science Bldg' },
        { title: 'Bus Routes', value: '2', change: 'Delayed', icon: <Bus />, color: 'text-yellow-600', context: 'Routes 4, 7' },
        { title: 'Events Today', value: '5', change: 'Postponed', icon: <Users />, color: 'text-blue-600', context: 'Due to weather' }
      ]
    },
    responder: {
      stats: [
        { title: 'Active Incidents', value: '3', change: 'In progress', icon: <AlertTriangle />, color: 'text-red-600', context: 'Flood, accident, fire' },
        { title: 'Units Deployed', value: '12', change: '80% capacity', icon: <Users />, color: 'text-orange-600', context: 'Zone A, B, D' },
        { title: 'Response Time', value: '45s', change: 'Optimal', icon: <Zap />, color: 'text-green-600', context: 'All zones covered' },
        { title: 'Dispatch Queue', value: '2', change: 'Pending', icon: <Activity />, color: 'text-yellow-600', context: 'Non-critical' }
      ]
    }
  };

  // Storytelling Stats
  const stats = isDemoMode ? [
    { title: 'Active Alerts', value: '12', change: '+8 (CRITICAL)', icon: <AlertTriangle />, color: 'text-red-600', context: 'Flash Flood Warning Active' },
    { title: 'Events Today', value: '35', change: '+12', icon: <Activity />, color: 'text-orange-600', context: 'High Public Risk Detected' },
    { title: 'Impacted Families', value: '2,450', change: '+1,200', icon: <Users />, color: 'text-yellow-600', context: 'Evacuation Zone A' },
    { title: 'Response Time', value: '45s', change: '-15% vs Avg', icon: <TrendingUp />, color: 'text-green-600', context: 'Emergency Ops Active' }
  ] : (persona !== 'all' && personaConfigs[persona]) ? personaConfigs[persona].stats : [
    {
      title: 'Active Alerts',
      value: flinkStats?.active_alerts?.toString() || '3',
      change: flinkStats ? 'Live from Flink' : 'Loading...',
      icon: <Shield />,
      color: 'text-blue-600',
      context: flinkStats?.source || 'Routine Operations'
    },
    {
      title: 'Events Today',
      value: flinkStats?.events_today?.toString() || '14',
      change: flinkStats && flinkStats.window_type ? '5-min window' : '+2',
      icon: <Activity />,
      color: 'text-blue-600',
      context: flinkStats?.processing_engine || 'Community & Transit'
    },
    { title: 'Households Protected', value: '14,500', change: '+12 today', icon: <Users />, color: 'text-green-600', context: 'Active Monitoring' },
    { title: 'Avg Response Time', value: '1.2s', change: 'Optimal', icon: <Zap />, color: 'text-purple-600', context: 'System Healthy' }
  ];

  // Alerts Database
  const allAlerts = [
    { id: 1, title: 'Flash Flood Warning', severity: 'high', time: '2 min ago', category: 'Emergency', impact: 'Evacuation required for Zone A', persona: ['parent', 'senior', 'responder'] },
    { id: 2, title: 'Major Traffic Accident I-91', severity: 'high', time: '10 min ago', category: 'Transit', impact: '2hr Delay / Hospital Route Blocked', persona: ['commuter', 'responder', 'parent'] },
    { id: 3, title: 'School Early Dismissal', severity: 'moderate', time: '30 min ago', category: 'Education', impact: 'Parents pickup required by 1PM', persona: ['parent', 'student'] },
    { id: 4, title: 'Heat Advisory', severity: 'moderate', time: '1 hour ago', category: 'Weather', impact: 'Check on seniors / Hydration stations open', persona: ['senior', 'parent', 'responder'] },
    { id: 5, title: 'Downtown Festival Road Closure', severity: 'low', time: '3 hours ago', category: 'Community', impact: 'Main St closed 9AM-5PM', persona: ['student', 'commuter', 'all'] },
    { id: 6, title: 'Routine Water Maintenance', severity: 'low', time: '5 hours ago', category: 'Infrastructure', impact: 'Low pressure in North End', persona: ['all'] },
  ];

  // Logic to show alerts based on Mode & Persona
  const alertsToShow = isDemoMode
    ? allAlerts.filter(a => ['high', 'moderate'].includes(a.severity)) // Show Crisis stuff
    : allAlerts.filter(a => persona === 'all' || a.persona.includes(persona));

  const sortedAlerts = alertsToShow.sort((a, b) => {
    // High severity first in demo mode
    if (isDemoMode) return a.severity === 'high' ? -1 : 1;
    return 0;
  });

  return (
    <div className="space-y-6">

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="font-semibold text-gray-700">I am a:</span>
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Civic Manager (Default)</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="senior">Senior Citizen</SelectItem>
              <SelectItem value="commuter">Commuter</SelectItem>
              <SelectItem value="responder">First Responder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant={isDemoMode ? "destructive" : "default"}
          onClick={() => setIsDemoMode(!isDemoMode)}
          className="w-full md:w-auto gap-2"
        >
          {isDemoMode ? <RotateCcw size={16} /> : <Play size={16} />}
          {isDemoMode ? "Exit Emergency Simulation" : "▶ Demo Emergency Scenario"}
        </Button>
      </div>

      {/* Statistics Grid (Storytelling) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={isDemoMode && stat.title === 'Active Alerts' ? 'border-red-500 bg-red-50 animate-pulse' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-1">
                <span className={stat.change.includes('+') ? 'text-green-600' : 'text-blue-600'}>
                  {stat.change}
                </span>
              </p>
              <div className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full w-fit mt-2">
                {stat.context}
              </div>
              {/* Real-time indicator */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatDistanceToNow(lastStatsUpdate)} ago
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${refreshCountdown === 0 ? 'animate-spin' : ''}`} />
                  {refreshCountdown}s
                </span>
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
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-l-4 shadow-sm cursor-pointer hover:scale-[1.02] ${alertStates[alert.id]?.status === 'dismissed' ? 'opacity-50 grayscale bg-gray-50' :
                    alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'moderate' ? 'bg-orange-50 border-orange-400' :
                        'bg-white border-blue-400 border-l-blue-500 hover:shadow-md'
                    } transition-all mb-3`}>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold ${alert.severity === 'high' ? 'text-red-900' : 'text-gray-900'}`}>{alert.title}</p>
                      {alert.severity === 'high' && <Badge variant="destructive" className="animate-pulse shadow-sm">CRITICAL</Badge>}
                      {alert.severity === 'moderate' && <Badge variant="secondary" className="bg-orange-200 text-orange-900 border-none">IMPORTANT</Badge>}

                      {/* Lifecycle Status Badges */}
                      {alertStates[alert.id]?.status === 'acknowledged' && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center gap-1">
                          <CheckCircle size={10} /> Read
                        </Badge>
                      )}

                      {alertStates[alert.id]?.status === 'dismissed' && (
                        <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50 flex items-center gap-1">
                          <EyeOff size={10} /> Archived
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">Why it matters: {alert.impact}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white/50">{alert.category}</Badge>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                        {alert.time}
                      </span>
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

    </div >
  );
};

export default Dashboard;
