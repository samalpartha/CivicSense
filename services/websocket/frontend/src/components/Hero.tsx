const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-medical-secondary to-medical-primary py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Real-time civic intelligence that helps people stay safe.
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto font-light">
            Stay informed, prepared, and connected before emergencies escalate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10 text-left">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-white font-semibold mb-1">Protect Families</div>
              <div className="text-white/80 text-sm">Real-time alerts for neighborhood safety.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-white font-semibold mb-1">Accelerate Response</div>
              <div className="text-white/80 text-sm">Reduce emergency response times.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-white font-semibold mb-1">Build Trust</div>
              <div className="text-white/80 text-sm">Verified civic information source.</div>
            </div>
          </div>

          <button
            onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-medical-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Ask CivicSense: What should I know right now?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;