import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, AlertCircle } from "lucide-react";
import { wsService, ChatMessage } from "../utils/websocket";
import Markdown from "react-markdown";
import { allAlerts } from "@/data/mockData";


interface ChatBoxProps {
    isOpen: boolean;
    onClose: () => void;
    autoQuery?: string;
}

interface Message {
    text: string;
    isUser: boolean;
    severity?: string;
    sources?: string[];
    timestamp?: string;
}

const ChatBox = ({ isOpen, onClose, autoQuery }: ChatBoxProps) => {
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

            if (msg.type === 'system') {
                setIsConnected(true);
                setMessages(prev => [...prev, {
                    text: msg.message || 'Connected',
                    isUser: false
                }]);
            } else if (msg.type === 'response') {
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
            handleSendMessage(autoQuery);
        } else if (isOpen && autoQuery && !isConnected) {
            // Wait for connection then send
            const sub = wsService.status$.subscribe(status => {
                if (status === 'connected') {
                    handleSendMessage(autoQuery);
                    sub.unsubscribe();
                }
            });
            return () => sub.unsubscribe();
        }
    }, [isOpen, autoQuery, isConnected]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { text: text, isUser: true }]);
        setIsLoading(true);

        const sent = wsService.sendMessage(text, {
            user_type: 'general',
            language: 'en',
            active_alerts: allAlerts
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
                        <div className="flex items-center gap-1 text-xs opacity-90">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="h-[380px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.isUser
                                ? "bg-medical-primary text-white"
                                : "bg-white text-gray-800"
                                }`}
                            style={{ whiteSpace: "pre-line" }}
                        >
                            <Markdown>{msg.text}</Markdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-white p-3 rounded-2xl shadow-sm">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-medical-primary rounded-full animate-bounce"
                                    style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-medical-primary rounded-full animate-bounce"
                                    style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-medical-primary rounded-full animate-bounce"
                                    style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-0" />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-medical-primary text-white p-3 rounded-full hover:bg-medical-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !isConnected}
                        title={!isConnected ? 'Connecting...' : 'Send message'}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;