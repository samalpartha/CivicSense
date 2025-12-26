import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  Cloud,
  CloudRain,
  Sun,
  Wind
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Active Alerts', value: '7', change: '+2', icon: <AlertTriangle />, color: 'text-red-600' },
    { title: 'Events Today', value: '24', change: '+5', icon: <Activity />, color: 'text-blue-600' },
    { title: 'Active Users', value: '1,234', change: '+89', icon: <Users />, color: 'text-green-600' },
    { title: 'Response Time', value: '1.2s', change: '-0.3s', icon: <TrendingUp />, color: 'text-purple-600' }
  ];

  const recentAlerts = [
    { id: 1, title: 'Traffic incident on Main St', severity: 'high', time: '5 min ago', category: 'Transit' },
    { id: 2, title: 'Weather advisory issued', severity: 'moderate', time: '15 min ago', category: 'Weather' },
    { id: 3, title: 'School event scheduled', severity: 'low', time: '1 hour ago', category: 'Education' }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>{' '}
                from last hour
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest civic events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{alert.category}</Badge>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                    className="ml-2"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Weather</CardTitle>
            <CardDescription>Current conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Sun className="mx-auto text-yellow-500 mb-4" size={64} />
              <div className="text-4xl font-bold text-gray-900 mb-2">72°F</div>
              <p className="text-gray-600 mb-4">Partly Cloudy</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Wind size={16} />
                  <span>12 mph</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CloudRain size={16} />
                  <span>20%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Event Categories</CardTitle>
          <CardDescription>Distribution of events by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Emergency', count: 3, color: 'bg-red-100 text-red-800' },
              { label: 'Transit', count: 8, color: 'bg-blue-100 text-blue-800' },
              { label: 'Infrastructure', count: 5, color: 'bg-yellow-100 text-yellow-800' },
              { label: 'Education', count: 8, color: 'bg-green-100 text-green-800' }
            ].map((category, index) => (
              <div key={index} className={`p-4 rounded-lg ${category.color}`}>
                <div className="text-2xl font-bold">{category.count}</div>
                <div className="text-sm">{category.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


