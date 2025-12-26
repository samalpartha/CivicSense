import { Shield } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <Shield className="w-8 h-8 text-medical-primary" fill="#2563EB" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xl font-bold text-medical-primary leading-tight">CivicSense</span>
        <span className="text-sm text-medical-secondary leading-tight">Real-Time Intelligence</span>
      </div>
    </div>
  );
};

export default Logo;