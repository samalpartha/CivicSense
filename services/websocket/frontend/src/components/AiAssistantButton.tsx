import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import ChatBox from "./ChatBox";

const AiAssistantButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [autoQuery, setAutoQuery] = useState<string | undefined>(undefined);
  const [activeLocation, setActiveLocation] = useState<{ name: string, zip: string, lat: number, lon: number } | undefined>(undefined);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsChatOpen(true);
      if (e.detail?.autoQuery) {
        setAutoQuery(e.detail.autoQuery);
      }
      if (e.detail?.activeLocation) {
        setActiveLocation(e.detail.activeLocation);
      }
      if (e.detail?.activeAlerts) {
        setActiveAlerts(e.detail.activeAlerts);
      }
    };
    window.addEventListener('civic:open-chat', handleOpenChat);
    return () => window.removeEventListener('civic:open-chat', handleOpenChat);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-medical-primary text-white p-4 rounded-full shadow-lg hover:bg-medical-primary/90 transition-colors"
      >
        <Bot size={24} />
      </button>
      <ChatBox
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setAutoQuery(undefined);
          setActiveLocation(undefined);
        }}
        autoQuery={autoQuery}
        activeLocation={activeLocation}
        activeAlerts={activeAlerts}
      />
    </>
  );
};

export default AiAssistantButton;