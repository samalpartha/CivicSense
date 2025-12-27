import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Zap, Brain, Users, HelpCircle, Code, Server, Database, Globe, Phone, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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



  const techStack = [
    { name: 'Confluent Cloud', desc: 'Kafka & Flink SQL for real-time streaming', icon: <Server size={20} /> },
    { name: 'Google Cloud', desc: 'Gemini 2.0 & Vertex AI', icon: <Brain size={20} /> },
    { name: 'MongoDB Atlas', desc: 'Vector Search for RAG', icon: <Database size={20} /> },
    { name: 'React + Vite', desc: 'Frontend Dashboard', icon: <Code size={20} /> },
    { name: 'FastAPI', desc: 'Python Backend Services', icon: <Zap size={20} /> },
    { name: 'Open-Meteo', desc: 'Real-time Weather Data', icon: <Globe size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 h-14">About CivicSense</h1>
            <p className="text-xl text-gray-600">
              Your Real-Time Public Safety & Services Intelligence Copilot
            </p>
          </div>

          <Card className="mb-8 border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <p className="text-lg leading-relaxed">
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
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Architecture & Tech Stack */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>Enterprise-grade real-time processing pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {techStack.map((tech, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                      <div className="mt-1 text-gray-500">{tech.icon}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{tech.name}</p>
                        <p className="text-xs text-gray-500">{tech.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help & Support */}
          <Card id="help">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="text-blue-600" />
                <CardTitle>Help & Support</CardTitle>
              </div>
              <CardDescription>Common questions and emergency contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I personalize my alerts?</AccordionTrigger>
                  <AccordionContent>
                    Use the "Persona" selector on the dashboard (top right) to switch between views like Parent, Senior, or Commuter. The dashboard will automatically reconfigure to show the most relevant metrics for you.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is the data real-time?</AccordionTrigger>
                  <AccordionContent>
                    Yes. CivicSense connects to live city data streams via Confluent Kafka. The dashboard updates every 5 seconds, and weather data is pulled live from local sensors. Look for the "Live" indicator on weather and "Updated X sec ago" timestamps.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What should I do in an emergency?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">If you are in immediate danger, <strong>call 911</strong> immediately.</p>
                    <p>You can use the red "Call 911" button in any Alert Detail modal to trigger this call directly from the app.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Emergency Disclaimer</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    CivicSense is an informational tool. Always follow official instructions from local authorities and emergency responders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 CivicSense Project. Built for the Hackathon.</p>
            <p className="mt-1">Version 1.0.0 • Production Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
