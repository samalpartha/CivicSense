import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, AlertCircle } from "lucide-react";
import { wsService, ChatMessage } from "../utils/websocket";
import Markdown from "react-markdown";
import { allAlerts } from "@/data/mockData";


interface ChatBoxProps {
    isOpen: boolean;
    onClose: () => void;
    autoQuery?: string;
    activeLocation?: {
        name: string;
        zip: string;
        lat: number;
        lon: number;
    };
    activeAlerts?: any[];
}

interface Message {
    text: string;
    isUser: boolean;
    severity?: string;
    sources?: string[];
    timestamp?: string;
}

const ChatBox = ({ isOpen, onClose, autoQuery, activeLocation, activeAlerts }: ChatBoxProps) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "👋 **Welcome to CivicSense!**\n\n" +
                "I'm your Real-Time Public Safety & Services Intelligence Copilot.\n\n" +
                "I can help you with:\n" +
                "- 🚨 Emergency alerts and safety guidance\n" +
                "- 🚇 Transit and transportation updates\n" +
                "- 🏫 School closures and education information\n" +
                "- ⚡ Infrastructure issues (power, water, internet)\n" +
                "- 📍 Location-specific civic services\n\n" +
                "💬 *Ask me anything about safety, services, or events in your area!*\n",
            isUser: false
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [currentAlerts, setCurrentAlerts] = useState<any[]>(activeAlerts || allAlerts);

    useEffect(() => {
        if (activeAlerts) {
            setCurrentAlerts(activeAlerts);
        }
    }, [activeAlerts]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, isLoading]);

    useEffect(() => {
        // Connect to WebSocket
        wsService.connect();

        // Subscribe to messages
        const messagesSub = wsService.messages$.subscribe((msg) => {
            console.log('Received message:', msg);

            if (msg.type === 'kafka_update' && msg.data) {
                console.log('ChatBox received live update:', msg.data);
                // Map Kafka event to Alert format
                const raw = msg.data;
                const newAlert = {
                    id: raw.event_id || Date.now(),
                    title: raw.type ? raw.type.replace('_', ' ').toUpperCase() : 'ALERT',
                    severity: raw.severity || 'moderate',
                    time: 'Just now',
                    category: raw.type || 'general',
                    impact: raw.message || 'New incident reported',
                    location: raw.area || 'General',
                    persona: raw.affected_groups || ['all'],
                    sources: ['Live Stream'],
                    confidence: 1.0
                };
                setCurrentAlerts(prev => [newAlert, ...prev]);
            }

            if (msg.type === 'system') {
                setIsConnected(true);
                setMessages(prev => [...prev, {
                    text: msg.message || 'Connected',
                    isUser: false
                }]);
            } else if (msg.type === 'response_start') {
                // Initialize streaming message
                setMessages(prev => [...prev, {
                    text: '', // Empty intially
                    isUser: false,
                    severity: msg.severity,
                    sources: msg.sources,
                    timestamp: msg.timestamp,
                    isStreaming: true
                }]);
                setIsLoading(false); // UI shows streaming message instead of loading bubble
            } else if (msg.type === 'response_token') {
                // Append token to last message
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && !lastMsg.isUser) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, text: lastMsg.text + msg.token }
                        ];
                    }
                    return prev;
                });
            } else if (msg.type === 'response_end') {
                // Finalize message (optional cleanup)
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, isStreaming: false }
                        ];
                    }
                    return prev;
                });
            } else if (msg.type === 'response') {
                // Legacy non-streaming support
                setMessages(prev => [...prev, {
                    text: msg.message || msg.answer || 'No response',
                    isUser: false,
                    severity: msg.severity,
                    sources: msg.sources,
                    timestamp: msg.timestamp
                }]);
                setIsLoading(false);
            } else if (msg.type === 'status') {
                console.log('Status:', msg.message);
            } else if (msg.type === 'error') {
                setMessages(prev => [...prev, {
                    text: msg.message || 'An error occurred',
                    isUser: false,
                    severity: 'error'
                }]);
                setIsLoading(false);
            }
        });

        // Subscribe to connection status
        const statusSub = wsService.status$.subscribe((status) => {
            if (status === 'connected') {
                setIsConnected(true);
            } else if (status === 'disconnected') {
                setIsConnected(false);
            }
        });

        // Check initial connection status
        setIsConnected(wsService.isConnected());

        return () => {
            messagesSub.unsubscribe();
            statusSub.unsubscribe();
        };
    }, []);

    // Logic to handle autoQuery
    useEffect(() => {
        if (isOpen && autoQuery && isConnected) {
            handleSendMessage(autoQuery, activeAlerts);
        } else if (isOpen && autoQuery && !isConnected) {
            // Wait for connection then send
            const sub = wsService.status$.subscribe(status => {
                if (status === 'connected') {
                    handleSendMessage(autoQuery, activeAlerts);
                    sub.unsubscribe();
                }
            });
            return () => sub.unsubscribe();
        }
    }, [isOpen, autoQuery, isConnected]);

    const handleSendMessage = (text: string, alerts?: any[]) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { text: text, isUser: true }]);
        setIsLoading(true);

        const sent = wsService.sendMessage(text, {
            user_type: 'general',
            language: 'en',
            active_alerts: alerts || currentAlerts,
            location: activeLocation ? `${activeLocation.name} (${activeLocation.zip})` : 'Hartford, CT',
            zip_code: activeLocation?.zip,
            city: activeLocation?.name,
            coordinates: activeLocation ? { lat: activeLocation.lat, lon: activeLocation.lon } : undefined
        });

        if (!sent) {
            setMessages(prev => [...prev, {
                text: "I'm having trouble connecting right now. Please check your connection and try again.",
                isUser: false,
                severity: 'error'
            }]);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !isConnected) return;

        handleSendMessage(message);
        setMessage("");
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed bottom-20 right-4 w-[700px] h-[500px] bg-white rounded-xl shadow-2xl animate-slide-up border border-gray-100">
            <div
                className="flex items-center justify-between bg-gradient-to-r from-medical-primary to-medical-accent text-white p-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Bot size={20} />
                    </div>
                    <div>
                        <span className="font-semibold">CivicSense Assistant</span>
                        <div className="flex items-center gap-2 text-xs opacity-90">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col h-[calc(100%-80px)]">
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.isUser
                                        ? 'bg-medical-primary text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}>

                                    {/* Helper Metadata (Severity) */}
                                    {!msg.isUser && msg.severity && (
                                        <div className={`mb-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1
                                            ${msg.severity === 'high' || msg.severity === 'critical' ? 'text-red-500' :
                                                msg.severity === 'moderate' ? 'text-orange-500' : 'text-blue-500'}`}>
                                            <AlertCircle size={12} />
                                            {msg.severity} Severity
                                        </div>
                                    )}

                                    {/* Message Body */}
                                    <div className={`prose prose-sm max-w-none ${msg.isUser ? 'prose-invert' : ''}`}>
                                        <Markdown>{msg.text}</Markdown>
                                    </div>

                                    {/* Streaming Indicator */}
                                    {/* @ts-ignore */}
                                    {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-medical-primary animate-pulse">|</span>}


                                    {/* Sources Footer */}
                                    {!msg.isUser && msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs text-gray-500">
                                            <span className="font-semibold">Sources:</span>
                                            {msg.sources.map((src, i) => (
                                                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                    {src}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    {msg.timestamp && (
                                        <div className={`text-[10px] mt-2 opacity-70 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                            placeholder={isConnected ? "Type your message..." : "Connecting..."}
                            disabled={!isConnected || isLoading}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || !isConnected || isLoading}
                            className="p-2 bg-medical-primary text-white rounded-full hover:bg-medical-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;