const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-medical-secondary to-medical-primary py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real-Time Public Safety Intelligence
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Stay informed about emergencies, transit, infrastructure, and civic events as they happen. Ask our AI copilot anything about your city.
          </p>
          <button className="bg-white text-medical-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Ask About Your Area
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;