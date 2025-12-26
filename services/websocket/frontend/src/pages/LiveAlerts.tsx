import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { wsService } from '@/utils/websocket';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  category: string;
  timestamp: string;
  location?: string;
}

const LiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Heavy Traffic on I-95',
      message: 'Expect delays due to accident near Exit 12',
      severity: 'moderate',
      category: 'Transit',
      timestamp: new Date().toISOString(),
      location: 'I-95 North'
    },
    {
      id: '2',
      title: 'School Closure Alert',
      message: 'Lincoln Elementary closed today due to weather conditions',
      severity: 'high',
      category: 'Education',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      location: 'Downtown'
    },
    {
      id: '3',
      title: 'Power Outage Resolved',
      message: 'Power restored to affected areas in West Side',
      severity: 'info',
      category: 'Infrastructure',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      location: 'West Side'
    }
  ]);

  useEffect(() => {
    const subscription = wsService.messages$.subscribe((msg) => {
      if (msg.type === 'kafka_update') {
        // Add new alert from Kafka
        const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          title: msg.data?.title || 'New Alert',
          message: msg.data?.message || 'Check local authorities for details',
          severity: msg.data?.severity || 'info',
          category: msg.data?.category || 'General',
          timestamp: new Date().toISOString(),
          location: msg.data?.location
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 20));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="text-red-600" />;
      case 'high': return <AlertCircle className="text-orange-600" />;
      case 'moderate': return <Info className="text-yellow-600" />;
      case 'low': return <Info className="text-blue-600" />;
      default: return <CheckCircle className="text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Live Alerts</h1>
          <p className="text-gray-600">Real-time updates on civic events, emergencies, and service disruptions</p>
        </div>

        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <CardDescription className="flex gap-2 mt-1">
                        <Badge variant="outline">{alert.category}</Badge>
                        {alert.location && <Badge variant="secondary">{alert.location}</Badge>}
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{alert.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {alerts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <p className="text-xl font-semibold text-gray-900 mb-2">All Clear!</p>
              <p className="text-gray-600">No active alerts in your area</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveAlerts;


