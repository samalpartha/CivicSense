/**
 * WebSocket service for CivicSense chatbot.
 * Manages real-time communication with the backend.
 */

import { Subject, Observable } from 'rxjs';

export interface ChatMessage {
    type: 'query' | 'response' | 'status' | 'error' | 'system' | 'kafka_update' | 'response_start' | 'response_token' | 'response_end';
    message?: string;
    token?: string;
    answer?: string;
    sources?: string[];
    severity?: string;
    affected_areas?: string[];
    timestamp?: string;
    data?: any;
}

export interface ChatContext {
    user_type?: 'parent' | 'senior' | 'worker' | 'student' | 'general';
    location?: string;
    language?: string;
    active_alerts?: any[];
    zip_code?: string;
    city?: string;
    coordinates?: { lat: number; lon: number };
}

type MessageHandler = (message: ChatMessage) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private static instance: WebSocketService;
    private messageHandlers: Set<MessageHandler> = new Set();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 3000;

    // RxJS Subject for reactive streams
    private messageSubject = new Subject<ChatMessage>();
    public messages$: Observable<ChatMessage> = this.messageSubject.asObservable();

    private statusSubject = new Subject<'connecting' | 'connected' | 'disconnected'>();
    public status$: Observable<'connecting' | 'connected' | 'disconnected'> = this.statusSubject.asObservable();

    private constructor() {
        // Don't auto-connect on instantiation
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        // Replace http/https with ws/wss
        const wsBase = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        const wsUrl = `${wsBase}/ws/chat`;

        console.log(`Connecting to WebSocket: ${wsUrl}`);
        this.statusSubject.next('connecting');

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('Connected to CivicSense WebSocket');
                this.reconnectAttempts = 0;
                this.statusSubject.next('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: ChatMessage = JSON.parse(event.data);
                    this.notifyHandlers(message);
                    this.messageSubject.next(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from WebSocket');
                this.statusSubject.next('disconnected');
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.statusSubject.next('disconnected');
            this.attemptReconnect();
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting in ${this.reconnectDelay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    private notifyHandlers(message: ChatMessage) {
        this.messageHandlers.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }

    addMessageHandler(handler: MessageHandler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler: MessageHandler) {
        this.messageHandlers.delete(handler);
    }

    sendQuery(message: string, context?: ChatContext): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return false;
        }

        const query = {
            type: 'query',
            message: message,
            context: context || { user_type: 'general', language: 'en' }
        };

        try {
            this.ws.send(JSON.stringify(query));
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    sendMessage(message: string, context?: ChatContext): boolean {
        return this.sendQuery(message, context);
    }

    sendPing() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
        }
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const wsService = WebSocketService.getInstance();
