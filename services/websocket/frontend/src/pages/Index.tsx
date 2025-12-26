import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import AiAssistantButton from "@/components/AiAssistantButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
      <AiAssistantButton />
    </div>
  );
};

export default Index;
