import { Search } from "lucide-react";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-medical-secondary to-medical-primary pt-32 pb-12 hero-section-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto">
            Real-time civic intelligence<br className="hidden md:block" /> that helps people stay safe.
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Stay informed, prepared, and connected before emergencies escalate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            <button
              onClick={() => {
                document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('civic:hero-action', { detail: { persona: 'parent' } }));
              }}
              className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 text-center shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer hover:bg-white/20 group"
            >
              <div className="text-white font-semibold mb-1 group-hover:text-amber-200 transition-colors">Protect Families</div>
              <div className="text-white/90 text-sm">Real-time alerts for neighborhood safety.</div>
            </button>

            <button
              onClick={() => {
                document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('civic:hero-action', { detail: { persona: 'responder' } }));
              }}
              className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 text-center shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer hover:bg-white/20 group"
            >
              <div className="text-white font-semibold mb-1 group-hover:text-blue-200 transition-colors">Accelerate Response</div>
              <div className="text-white/90 text-sm">Reduce emergency response times.</div>
            </button>

            <button
              onClick={() => {
                document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('civic:hero-action', { detail: { persona: 'all' } }));
              }}
              className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 text-center shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer hover:bg-white/20 group"
            >
              <div className="text-white font-semibold mb-1 group-hover:text-green-200 transition-colors">Build Trust</div>
              <div className="text-white/90 text-sm">Verified civic information source.</div>
            </button>
          </div>

          <button
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
            className="group bg-white text-medical-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
          >
            Ask CivicSense: What should I know right now?
            <Search className="w-5 h-5 text-gray-400 group-hover:text-medical-primary transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;