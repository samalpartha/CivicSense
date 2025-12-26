import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Brain, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Zap className="text-blue-600" size={32} />,
      title: 'Real-Time Intelligence',
      description: 'Powered by Confluent Kafka and Flink for streaming data processing at scale'
    },
    {
      icon: <Brain className="text-purple-600" size={32} />,
      title: 'AI-Powered Copilot',
      description: 'Google Gemini AI with RAG for intelligent, context-aware responses'
    },
    {
      icon: <Shield className="text-green-600" size={32} />,
      title: 'Public Safety Focus',
      description: 'Dedicated to keeping citizens informed and safe in real-time'
    },
    {
      icon: <Users className="text-orange-600" size={32} />,
      title: 'For Everyone',
      description: 'Accessible guidance for parents, seniors, workers, students, and all citizens'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About CivicSense</h1>
            <p className="text-xl text-gray-600">
              Your Real-Time Public Safety & Services Intelligence Copilot
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <p>
                CivicSense transforms how citizens interact with real-time civic information. Built on cutting-edge
                streaming technology and AI, we turn fragmented city data into clear, actionable guidance.
              </p>
              <p>
                Unlike traditional alert systems that broadcast generic messages, CivicSense understands your context
                and provides personalized, timely information when you need it most.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">Confluent Cloud</p>
                  <p className="text-sm text-gray-600">Kafka & Flink</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-purple-900">Google Cloud</p>
                  <p className="text-sm text-gray-600">Gemini AI</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-900">MongoDB Atlas</p>
                  <p className="text-sm text-gray-600">Vector Search</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;


