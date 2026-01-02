import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { Bot } from "lucide-react";
import ChatBox from "./ChatBox";

const AiAssistantButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [autoQuery, setAutoQuery] = useState<string | undefined>(undefined);
  const [activeLocation, setActiveLocation] = useState<{ name: string, zip: string, lat: number, lon: number } | undefined>(undefined);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      if (e.detail?.activeLocation) {
        // Force synchronous update to ensure ChatBox receives the new location immediately on mount
        flushSync(() => {
          setActiveLocation(e.detail.activeLocation);
        });
      }
      if (e.detail?.activeAlerts) {
        flushSync(() => {
          setActiveAlerts(e.detail.activeAlerts);
        });
      }

      setIsChatOpen(true);
      if (e.detail?.autoQuery) {
        setAutoQuery(e.detail.autoQuery);
      }
    };

    const handleLocationUpdate = (e: any) => {
      if (e.detail?.activeLocation) {
        setActiveLocation(e.detail.activeLocation);
      }
    };

    window.addEventListener('civic:open-chat', handleOpenChat);
    window.addEventListener('civic:location-update', handleLocationUpdate);

    return () => {
      window.removeEventListener('civic:open-chat', handleOpenChat);
      window.removeEventListener('civic:location-update', handleLocationUpdate);
    };
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
          // Do NOT clear activeLocation, so it persists for next open
        }}
        autoQuery={autoQuery}
        activeLocation={activeLocation}
        activeAlerts={activeAlerts}
      />
    </>
  );
};

export default AiAssistantButton;