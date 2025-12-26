import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Train, School, Zap } from 'lucide-react';

const Map = () => {
  const events = [
    { id: 1, type: 'emergency', title: 'Traffic Incident', location: 'Downtown', lat: 40.7580, lng: -73.9855, severity: 'high' },
    { id: 2, type: 'transit', title: 'Bus Delay', location: 'Midtown', lat: 40.7589, lng: -73.9851, severity: 'moderate' },
    { id: 3, type: 'education', title: 'School Event', location: 'Uptown', lat: 40.7614, lng: -73.9776, severity: 'low' },
    { id: 4, type: 'infrastructure', title: 'Maintenance Work', location: 'West Side', lat: 40.7549, lng: -73.9840, severity: 'moderate' }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="text-red-600" />;
      case 'transit': return <Train className="text-blue-600" />;
      case 'education': return <School className="text-green-600" />;
      case 'infrastructure': return <Zap className="text-yellow-600" />;
      default: return <MapPin />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Map</h1>
          <p className="text-gray-600">Interactive map showing real-time civic events in your area</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Map Placeholder */}
          <Card className="md:col-span-2 h-[600px]">
            <CardHeader>
              <CardTitle>Live Event Map</CardTitle>
              <CardDescription>Click on markers to see event details</CardDescription>
            </CardHeader>
            <CardContent className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-center">
                <MapPin size={64} className="mx-auto text-blue-600 mb-4" />
                <p className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</p>
                <p className="text-gray-600">
                  Map visualization with real-time event markers
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Integration ready for Google Maps, Mapbox, or Leaflet
                </p>
              </div>
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

            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
  );
};

export default Map;


