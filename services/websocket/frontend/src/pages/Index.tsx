import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import AiAssistantButton from "@/components/AiAssistantButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <div id="dashboard" className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>

      {/* Public Good Section */}
      <div className="bg-medical-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 italic">"CivicSense is more than a tool—it's a public good."</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-medical-secondary/10">
              <div className="text-medical-primary font-bold text-lg mb-2">Fight Misinformation</div>
              <p className="text-gray-600 text-sm">Centralizes verified city data to reduce panic during emergencies.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-medical-secondary/10">
              <div className="text-medical-primary font-bold text-lg mb-2">Equity Driven</div>
              <p className="text-gray-600 text-sm">Ensures critical alerts reach vulnerable populations first.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-medical-secondary/10">
              <div className="text-medical-primary font-bold text-lg mb-2">Decision Layer</div>
              <p className="text-gray-600 text-sm">Empowers citizens to make safer choices with real-time intelligence.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-medical-secondary/10">
              <div className="text-medical-primary font-bold text-lg mb-2">Global Scale</div>
              <p className="text-gray-600 text-sm">Built to integrate with municipal systems in any city, anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 font-medium">
            Designed to integrate with municipal APIs, transit systems, and emergency services worldwide.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            CivicSense is a real-time decision layer between cities and citizens.
          </p>
        </div>
      </div>

      <AiAssistantButton />
    </div>
  );
};

export default Index;
