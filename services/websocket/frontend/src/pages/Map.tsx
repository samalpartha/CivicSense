import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, AlertTriangle, Train, School, Zap, Search, Crosshair } from 'lucide-react';
import { APIProvider, Map as GoogleMap, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { wsService, ChatMessage } from '@/utils/websocket';

// Helper component to access map instance
const MapUpdater = ({ center }: { center: google.maps.LatLngLiteral }) => {
  const map = useMap();

  if (map) {
    map.panTo(center);
  }
  return null;
};

// Event interface
interface CivicEvent {
  id: number | string;
  type: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

const Map = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Default center (New York)
  const [center, setCenter] = useState({ lat: 40.7580, lng: -73.9855 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initial Seed Data
  const initialEvents: CivicEvent[] = [
    { id: 1, type: 'emergency', title: 'Traffic Incident', location: 'Downtown', lat: 40.7580, lng: -73.9855, severity: 'high' },
    { id: 2, type: 'transit', title: 'Bus Delay', location: 'Midtown', lat: 40.7589, lng: -73.9851, severity: 'moderate' },
    { id: 3, type: 'education', title: 'School Event', location: 'Uptown', lat: 40.7614, lng: -73.9776, severity: 'low' },
    { id: 4, type: 'infrastructure', title: 'Maintenance Work', location: 'West Side', lat: 40.7549, lng: -73.9840, severity: 'moderate' }
  ];

  const [events, setEvents] = useState<CivicEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CivicEvent | null>(null);

  const placesLib = useMapsLibrary('places');
  const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([]);

  // Fetch real places near the center
  useEffect(() => {
    if (!placesLib || !center) return;

    const svc = new placesLib.PlacesService(document.createElement('div'));
    const request: google.maps.places.PlaceSearchRequest = {
      location: center,
      radius: 2000, // 2km radius
      type: 'point_of_interest' // Broad category to get schools, parks, etc.
    };

    svc.nearbySearch(request, (results, status) => {
      if (status === placesLib.PlacesServiceStatus.OK && results) {
        // Filter for useful types
        const relevantPlaces = results.filter(p =>
          p.types?.some(t => ['school', 'park', 'transit_station', 'local_government_office', 'health'].includes(t)) || true
        ).slice(0, 20); // Keep top 20
        setNearbyPlaces(relevantPlaces);
      }
    });
  }, [placesLib, center]);

  // WebSocket and Dynamic Simulation Logic
  useEffect(() => {
    // Connect to WebSocket if not already connected
    if (!wsService.isConnected()) {
      wsService.connect();
    }

    const handleMessage = (msg: ChatMessage) => {
      if (msg.type === 'kafka_update' && msg.data) {
        // Handle real-time event from backend
        // Assuming msg.data contains { type, title, location, lat, lng, severity }
        // or mapping it accordingly
        const newEvent: CivicEvent = {
          id: msg.data.id || Date.now(),
          type: msg.data.type || 'general',
          title: msg.data.title || 'New Real-time Alert',
          location: msg.data.location || 'Unknown Location',
          lat: msg.data.lat,
          lng: msg.data.lng,
          severity: msg.data.severity || 'low'
        };

        if (newEvent.lat && newEvent.lng) {
          setEvents(prev => [newEvent, ...prev]);
        }
      }
    };

    wsService.addMessageHandler(handleMessage);

    // Dynamic Simulation - using REAL places if available, fallback to random
    const intervalId = setInterval(() => {
      let simulatedEvent: CivicEvent;
      const types = ['emergency', 'transit', 'education', 'infrastructure'];
      const severities = ['low', 'moderate', 'high'];

      if (nearbyPlaces.length > 0) {
        // Use Real Place
        const randomPlace = nearbyPlaces[Math.floor(Math.random() * nearbyPlaces.length)];
        // Safety check
        if (!randomPlace.geometry?.location) return;

        let eventType = types[Math.floor(Math.random() * types.length)];
        if (randomPlace.types?.includes('school')) eventType = 'education';
        if (randomPlace.types?.includes('transit_station')) eventType = 'transit';
        if (randomPlace.types?.includes('park')) eventType = 'infrastructure';

        const titles = {
          'emergency': ['Police Activity', 'Medical Assist', 'Fire Alarm'],
          'transit': ['Bus Delay', 'Station Maintenance', 'Service Alert'],
          'education': ['School Event', 'Dismissal Traffic', 'Sports Game'],
          'infrastructure': ['Road Work', 'Water Main Break', 'Power Assessment']
        };
        const possibleTitles = titles[eventType as keyof typeof titles] || titles['infrastructure'];
        const randomTitle = possibleTitles[Math.floor(Math.random() * possibleTitles.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)] as CivicEvent['severity'];

        simulatedEvent = {
          id: Date.now(),
          type: eventType,
          title: randomTitle,
          location: randomPlace.name || 'Local Landmark',
          lat: randomPlace.geometry.location.lat(),
          lng: randomPlace.geometry.location.lng(),
          severity: randomSeverity
        };
      } else {
        // Fallback if no places found (or API quota issue)
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)] as CivicEvent['severity'];
        const genericLocations = ['Main Street', 'Downtown', 'Business District', 'City Center'];
        const randomLat = center.lat + (Math.random() - 0.5) * 0.02;
        const randomLng = center.lng + (Math.random() - 0.5) * 0.02;

        simulatedEvent = {
          id: Date.now(),
          type: randomType,
          title: 'Local Alert (Simulated)',
          location: genericLocations[Math.floor(Math.random() * genericLocations.length)],
          lat: randomLat,
          lng: randomLng,
          severity: randomSeverity
        };
      }

      setEvents(prev => {
        // Avoid duplicates
        if (prev.some(e => e.location === simulatedEvent.location && e.title === simulatedEvent.title)) return prev;
        const updated = [simulatedEvent, ...prev];
        return updated.slice(0, 50);
      });

    }, 5000); // Faster updates (every 5s) to ensure visibility

    return () => {
      wsService.removeMessageHandler(handleMessage);
      clearInterval(intervalId);
    };
  }, [center, nearbyPlaces]); // Rerun if center or places change


  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="text-red-600" />;
      case 'transit': return <Train className="text-blue-600" />;
      case 'education': return <School className="text-green-600" />;
      case 'infrastructure': return <Zap className="text-yellow-600" />;
      default: return <MapPin />;
    }
  };

  const getPinColor = (type: string) => {
    switch (type) {
      case 'emergency': return '#ef4444'; // red-500
      case 'transit': return '#3b82f6'; // blue-500
      case 'education': return '#22c55e'; // green-500
      case 'infrastructure': return '#eab308'; // yellow-500
      default: return '#6b7280'; // gray-500
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);

    try {
      // In a real app with restricted keys, you would use the Geocoding API directly or via a backend proxy
      // For this demo, we'll try to use the Geocoding API if enabled, otherwise fallback/mock
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setEvents([]); // Clear old events to prevent static data from persisting
        setCenter({ lat, lng });
      } else {
        alert('Location not found. Please try a valid Zip Code or City Name.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true); // Reuse loading state
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEvents([]); // Clear old events
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsSearching(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to retrieve your location.');
          setIsSearching(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Map</h1>
            <p className="text-gray-600">Real-time civic events in your area</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Enter Zip Code or City..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? '...' : 'Search'}
            </Button>
            <Button variant="outline" size="icon" onClick={handleCurrentLocation} title="Use My Location">
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Map Component */}
          <Card className="md:col-span-2 h-[600px] overflow-hidden">
            <CardHeader>
              <CardTitle>Live Event Map</CardTitle>
              <CardDescription>Click on markers to see event details</CardDescription>
            </CardHeader>
            <CardContent className="h-full p-0">
              <APIProvider apiKey={API_KEY}>
                <div style={{ height: '530px', width: '100%' }}>
                  <GoogleMap
                    defaultCenter={center}
                    defaultZoom={14}
                    disableDefaultUI={false}
                    zoomControl={true}
                  >
                    <MapUpdater center={center} />

                    {events.map((event) => (
                      <Marker
                        key={event.id}
                        position={{ lat: event.lat, lng: event.lng }}
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}

                    {selectedEvent && (
                      <InfoWindow
                        position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
                        onCloseClick={() => setSelectedEvent(null)}
                      >
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            {getIcon(selectedEvent.type)}
                            <h3 className="font-bold text-sm">{selectedEvent.title}</h3>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{selectedEvent.location}</p>
                          <Badge variant={selectedEvent.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {selectedEvent.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </div>
              </APIProvider>
            </CardContent>
          </Card>

          {/* Event List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Events</CardTitle>
                <CardDescription>{events.length} events in your area</CardDescription>
              </CardHeader>
            </Card>

            <div className="h-[500px] md:h-[600px] overflow-y-auto space-y-4 pr-2">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedEvent?.id === event.id ? 'border-primary ring-1 ring-primary' : ''}`}
                  onClick={() => {
                    setSelectedEvent(event);
                    setCenter({ lat: event.lat, lng: event.lng }); // Zoom to event on click
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {getIcon(event.type)}
                      <div className="flex-1">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <CardDescription className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{event.location}</Badge>
                          <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'}>
                            {event.severity}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-1" />
                      {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;


