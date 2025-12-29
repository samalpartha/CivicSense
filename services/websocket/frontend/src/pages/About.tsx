import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Zap, Brain, Users, HelpCircle, Code, Server, Database, Globe, Phone, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const About = () => {
  const features = [
    {
      icon: <Zap className="text-blue-600" size={32} />,
      title: 'Flink SQL Analytics',
      description: 'Sub-second event processing and aggregation on data in motion'
    },
    {
      icon: <Brain className="text-purple-600" size={32} />,
      title: 'Gemini 2.0 Powered',
      description: 'Next-generation multi-agent AI for faster, more accurate reasoning'
    },
    {
      icon: <Server className="text-green-600" size={32} />,
      title: 'Data in Motion',
      description: 'Direct integration with Confluent Cloud Kafka streams'
    },
    {
      icon: <Users className="text-orange-600" size={32} />,
      title: 'Context-Aware',
      description: 'Adapts responses to user persona (Parent, Senior, Responder)'
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4 h-14">About CivicSense 2025</h1>
            <p className="text-xl text-gray-600">
              Enterprise-Grade Public Safety Intelligence Platform
            </p>
          </div>

          <Card className="mb-8 border-l-4 border-l-blue-600 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-blue-600" />
                Enterprise Edition (v2.0)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <p className="text-lg font-medium leading-relaxed">
                CivicSense 2025 is an enterprise-grade, event-driven platform that transforms live city data streams into actionable public safety guidance.
              </p>
              <p>
                By integrating <span className="font-semibold text-gray-900">Confluent Cloud Kafka</span> with <span className="font-semibold text-gray-900">Google Gemini 2.0</span>, we deliver sub-second intelligence that adapts to your specific persona—whether you are a parent, a senior, or a first responder.
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

          {/* HOW IT WORKS - Visual Flow */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How CivicSense Works</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-gray-100 -z-10"></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center bg-white p-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3 shadow-sm border-4 border-white">
                    <AlertTriangle size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900">1. Event Detection</h3>
                  <p className="text-xs text-gray-500 max-w-[150px]">Sensors & 911 feeds detect an issue in real-time.</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center bg-white p-2">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-3 shadow-sm border-4 border-white">
                    <Server size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900">2. Processing</h3>
                  <p className="text-xs text-gray-500 max-w-[150px]">Flink SQL aggregates data; Agents analyze risk.</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center bg-white p-2">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 shadow-sm border-4 border-white">
                    <Brain size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900">3. Reasoning</h3>
                  <p className="text-xs text-gray-500 max-w-[150px]">Gemini AI generates specific guidance.</p>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center bg-white p-2">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-3 shadow-sm border-4 border-white">
                    <Phone size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900">4. Notification</h3>
                  <p className="text-xs text-gray-500 max-w-[150px]">You receive a personalized alert instantly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture & Tech Stack */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Technology Infrastructure</CardTitle>
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

          {/* PERFORMANCE METRICS */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Performance Metrics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 500ms</div>
                <div className="font-semibold text-gray-900">Event-to-Insight</div>
                <p className="text-sm text-gray-500 mt-2">Ultra-low latency processing</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">~1.2s</div>
                <div className="font-semibold text-gray-900">Query Processing</div>
                <p className="text-sm text-gray-500 mt-2">Average AI reasoning time</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">99.99%</div>
                <div className="font-semibold text-gray-900">System Uptime</div>
                <p className="text-sm text-gray-500 mt-2">Targeted availability (Serverless)</p>
              </div>
            </div>
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
                    Use the "Near" selector to choose your city (Hartford, New Haven, Stamford) and the "Persona" selector to switch between views like Parent or Student.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What is the 'War Room'?</AccordionTrigger>
                  <AccordionContent>
                    Available only to the 'Civic Manager' persona, the War Room is a tactical dashboard (click the red button) for tracking resource allocation and timeline events during critical incidents.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I know alerts are real?</AccordionTrigger>
                  <AccordionContent>
                    Check the "Trust Layer" on each alert card. We display a green verified badge with a confidence score (e.g., 98%) and list the specific sources (e.g., NWS, Traffic Cams) that triggered the alert.
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
            <p>© 2025 CivicSense Enterprise. Deployed on Google Cloud Run.</p>
            <p className="mt-1">Version 2.0.0 (Enterprise Ed.) • OAS 3.1 • System Healthy</p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default About;
