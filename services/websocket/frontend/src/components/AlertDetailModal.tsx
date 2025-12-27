import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Clock, AlertTriangle, Phone, Map, Navigation, Share2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Alert {
    id: string;
    title: string;
    location: string;
    time: string;
    severity: string;
    category: string;
    description: string;
    whyItMatters?: string;
}

interface AlertDetailModalProps {
    alert: Alert | null;
    isOpen: boolean;
    onClose: () => void;
    onAcknowledge?: (id: string) => void;
    onDismiss?: (id: string) => void;
}

const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'critical': return 'text-red-600 bg-red-50 border-red-200';
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
};

const getRecommendedActions = (category: string, severity: string) => {
    const actions: Record<string, string[]> = {
        'Flash Flood': [
            'Move to higher ground immediately',
            'Avoid walking or driving through flood waters',
            'Listen to local emergency services for evacuation orders',
            'Prepare emergency supplies (water, food, medications)'
        ],
        'Traffic': [
            'Use alternate routes if possible',
            'Allow extra travel time',
            'Follow traffic officer directions',
            'Consider public transit alternatives'
        ],
        'School': [
            'Arrange early pickup for children',
            'Check school website for detailed information',
            'Plan after-school care if needed',
            'Contact school office if you have questions'
        ],
        'Fire': [
            'Evacuate immediately if in affected area',
            'Close all windows and doors',
            'Follow designated evacuation routes',
            'Do not return until authorities declare area safe'
        ],
        'default': [
            'Stay informed through official channels',
            'Follow local authority guidance',
            'Share information with family members',
            'Prepare emergency contact list'
        ]
    };

    return actions[category] || actions.default;
};


const getEmergencyResources = (alert: Alert) => [
    {
        label: 'Call 911',
        icon: Phone,
        variant: 'destructive' as const,
        action: () => {
            if (confirm('Call Emergency Services (911)?')) {
                window.location.href = 'tel:911';
            }
        }
    },
    {
        label: 'Find Shelter',
        icon: Map,
        variant: 'outline' as const,
        action: () => {
            // Use alert location or default to Hartford
            const searchQuery = encodeURIComponent(`emergency shelter near ${alert.location || 'Hartford, CT'}`);
            window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
        }
    },
    {
        label: 'Get Directions',
        icon: Navigation,
        variant: 'outline' as const,
        action: () => {
            // Try to get user's location and navigate away from danger
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        // Navigate to safe area (away from alert location)
                        const safeAreaQuery = encodeURIComponent('safe area emergency shelter');
                        window.open(
                            `https://www.google.com/maps/dir/${latitude},${longitude}/${safeAreaQuery}`,
                            '_blank'
                        );
                    },
                    () => {
                        // Fallback if geolocation fails
                        const query = encodeURIComponent(`directions to safety from ${alert.location}`);
                        window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                    }
                );
            } else {
                const query = encodeURIComponent(`evacuation routes ${alert.location}`);
                window.open(`https://www.google.com/maps/search/${query}`, '_blank');
            }
        }
    },
    {
        label: 'Share Alert',
        icon: Share2,
        variant: 'outline' as const,
        action: async () => {
            const shareData = {
                title: `CivicSense Alert: ${alert.title}`,
                text: `${alert.severity.toUpperCase()} ALERT - ${alert.title}\n\nLocation: ${alert.location}\nTime: ${alert.time}\n\nWhat happened: ${alert.description}\n\nStay safe and follow official guidance.`,
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(
                        `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
                    );
                    window.alert('✅ Alert details copied to clipboard! Share with your family and friends.');
                }
            } catch (err) {
                console.error('Share failed:', err);
            }
        }
    }
];

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, isOpen, onClose, onAcknowledge, onDismiss }) => {
    if (!alert) return null;

    const severityColor = getSeverityColor(alert.severity);
    const actions = getRecommendedActions(alert.category, alert.severity);
    const resources = getEmergencyResources(alert);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold mb-2">{alert.title}</DialogTitle>
                            <DialogDescription className="text-base">
                                Full event details and recommended actions
                            </DialogDescription>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border-2 font-bold text-sm ${severityColor}`}>
                            {alert.severity.toUpperCase()}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Event Details */}
                    <section className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Event Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{alert.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="w-5 h-5 text-blue-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium">{alert.time}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">Description</p>
                            <p className="text-base">{alert.description}</p>
                        </div>
                        {alert.whyItMatters && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    Why It Matters
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">{alert.whyItMatters}</p>
                            </div>
                        )}
                    </section>

                    {/* Recommended Actions */}
                    <section>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Recommended Actions
                        </h3>
                        <ul className="space-y-2">
                            {actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-sm font-bold">{idx + 1}</span>
                                    </div>
                                    <p className="text-sm">{action}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Emergency Resources */}
                    <section>
                        <h3 className="font-semibold text-lg mb-3">Emergency Resources</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {resources.map((resource, idx) => (
                                <Button
                                    key={idx}
                                    variant={resource.variant}
                                    className={`flex flex-col items-center gap-2 h-auto py-4 ${resource.variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' : ''}`}
                                    onClick={resource.action}
                                >
                                    <resource.icon className="w-6 h-6" />
                                    <span className="text-xs text-center">{resource.label}</span>
                                </Button>
                            ))}
                        </div>
                    </section>

                    {/* Status Updates */}
                    <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-center">
                            <span className="font-semibold">Live Updates:</span> This alert is actively monitored.
                            You'll receive notifications as the situation evolves.
                        </p>
                    </section>
                </div>

                <div className="flex gap-3 mt-6 border-t pt-4 justify-end">
                    {onDismiss && (
                        <Button variant="ghost" onClick={() => onDismiss(alert.id)}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Dismiss
                        </Button>
                    )}
                    {onAcknowledge && (
                        <Button variant="default" onClick={() => onAcknowledge(alert.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Read
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
