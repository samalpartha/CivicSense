export const allAlerts = [
    {
        id: 1,
        title: 'Flash Flood Warning',
        severity: 'high',
        time: '2 min ago',
        category: 'Emergency',
        impact: 'Evacuation required for Zone A',
        persona: ['parent', 'senior', 'responder'],
        sources: ['NWS', 'River Gauge #4', 'PD Dispatch'],
        confidence: 0.98
    },
    {
        id: 2,
        title: 'Major Traffic Accident I-91',
        severity: 'high',
        time: '10 min ago',
        category: 'Transit',
        impact: '2hr Delay / Hospital Route Blocked',
        persona: ['commuter', 'responder', 'parent'],
        sources: ['CT DOT', 'Waze Aggregation', 'Traffic Cams'],
        confidence: 0.95
    },
    {
        id: 3,
        title: 'School Early Dismissal',
        severity: 'moderate',
        time: '30 min ago',
        category: 'Education',
        impact: 'Parents pickup required by 1PM',
        persona: ['parent', 'student'],
        sources: ['Hartford Public Schools SDK', 'Parent Alert System'],
        confidence: 1.0
    },
    {
        id: 4,
        title: 'Heat Advisory',
        severity: 'moderate',
        time: '1 hour ago',
        category: 'Weather',
        impact: 'Check on seniors / Hydration stations open',
        persona: ['senior', 'parent', 'responder'],
        sources: ['Open-Meteo', 'City Health Dept'],
        confidence: 0.85
    },
    {
        id: 5,
        title: 'Downtown Festival Road Closure',
        severity: 'low',
        time: '3 hours ago',
        category: 'Community',
        impact: 'Main St closed 9AM-5PM',
        persona: ['student', 'commuter', 'all'],
        sources: ['City Permits', 'Event Calendar'],
        confidence: 0.90
    },
    {
        id: 6,
        title: 'Routine Water Maintenance',
        severity: 'low',
        time: '5 hours ago',
        category: 'Infrastructure',
        impact: 'Low pressure in North End',
        persona: ['all'],
        sources: ['MDC Utility Feed'],
        confidence: 1.0
    },
];
