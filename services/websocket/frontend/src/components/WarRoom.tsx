import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Truck, AlertTriangle, MapPin, Zap, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WarRoomProps {
    onClose: () => void;
    location: { name: string; lat: number; lon: number };
}

const WarRoom = ({ onClose, location }: WarRoomProps) => {
    const [simStep, setSimStep] = useState(0); // 0: Assessment, 1: Processing, 2: Success

    const handleAuthorize = () => {
        setSimStep(1);
        setTimeout(() => setSimStep(2), 2500); // Fake processing delay
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-6xl h-[85vh] flex flex-col bg-slate-950 border-slate-800 text-slate-100 shadow-2xl relative overflow-hidden">

                {/* Header */}
                <CardHeader className="bg-slate-900/50 border-b border-slate-800 flex flex-row items-center justify-between py-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <AlertTriangle className="text-red-500 animate-pulse" />
                                WAR ROOM: COMMAND CENTER [{location.name}]
                            </CardTitle>
                            {simStep < 2 ? (
                                <Badge variant="destructive" className="animate-pulse bg-red-600">🔴 ACTIVE EMERGENCY</Badge>
                            ) : (
                                <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500">🟢 CRISIS STABILIZED</Badge>
                            )}
                        </div>
                        <CardDescription className="text-slate-400 text-xs mt-1">Mode: Multi-Agency Coordination • {location.name} Ops</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        Close View
                    </Button>
                </CardHeader>

                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">

                    {/* Left Panel: Geospatial / Context */}
                    <div className="col-span-12 lg:col-span-8 p-6 border-r border-slate-800 flex flex-col relative bg-slate-950/50">

                        {/* Map Visualization Mockup */}
                        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden group">

                            {/* Map Layers */}
                            <div
                                className="absolute inset-0 opacity-20 bg-cover bg-center grayscale mix-blend-screen transition-all duration-1000"
                                style={{
                                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${location.lon},${location.lat},12,0/800x600?access_token=YOUR_TOKEN')`
                                }}
                            />

                            {/* Custom Map Elements (CSS Drawing for demo) */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* River Zone */}
                                <div className={`absolute top-1/4 right-1/3 w-32 h-64 bg-blue-500/20 blur-xl rounded-full ${simStep < 2 ? 'animate-pulse' : ''}`}></div>

                                {/* I-91 Line */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-slate-700"></div>

                                {/* Bottleneck Point */}
                                {simStep < 2 && (
                                    <div className="absolute top-1/2 left-1/2 -ml-1 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                                )}

                                {/* Success State */}
                                {simStep === 2 && (
                                    <div className="absolute top-1/2 left-1/2 -ml-1 text-green-500 flex flex-col items-center animate-in zoom-in-50 duration-500">
                                        <ShieldCheck size={48} />
                                        <span className="font-bold bg-slate-900/80 px-2 py-1 rounded mt-2">TRAFFIC CLEARED</span>
                                    </div>
                                )}
                            </div>

                            {/* Map Overlays */}
                            <div className="absolute top-4 left-4 space-y-2">
                                <Badge variant="outline" className="bg-red-900/80 text-white border-red-500 flex gap-1">
                                    <MapPin size={10} /> Zone A: Evacuation Active
                                </Badge>
                                <Badge variant="outline" className="bg-black/50 text-slate-300 border-slate-600 flex gap-1">
                                    I-91: Congested (Black Line)
                                </Badge>
                            </div>

                        </div>

                        {/* Live Log */}
                        <div className="h-48 mt-4 bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-xs overflow-y-auto">
                            <h4 className="text-slate-400 mb-2 font-bold flex items-center gap-2"><Activity size={12} /> Live Communication Log</h4>
                            <div className="space-y-2 text-slate-300">
                                <div className="opacity-50">12:22:15 [System] Evacuation alert delivered to 98% of Zone A.</div>
                                <div className="opacity-70">12:23:04 [River PD] "Water breaching lower banks. We need that intersection cleared."</div>
                                <div className="text-red-300">12:24:10 [911 Dispatch] "Receiving calls from trapped motorists on off-ramp."</div>
                                {simStep >= 1 && (
                                    <div className="text-blue-300 animate-in slide-in-from-left">12:25:00 [CMD] AUTHORIZING TRAFFIC OVERRIDE PROTOCOL...</div>
                                )}
                                {simStep >= 2 && (
                                    <>
                                        <div className="text-green-400 animate-in slide-in-from-left delay-150">12:25:05 [System] Signals Main & Elm set to GREEN LOCK.</div>
                                        <div className="text-green-400 animate-in slide-in-from-left delay-300">12:25:45 [Drone-1] Visual confirmation: Bottleneck clearing.</div>
                                        <div className="text-green-400 animate-in slide-in-from-left delay-500">12:26:00 [EMS-4] "We are moving. ETA to hospital 3 mins."</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Decision & Assets */}
                    <div className="col-span-12 lg:col-span-4 p-6 flex flex-col gap-6 bg-slate-900/30">

                        {/* Resource Board */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Asset Allocation</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'River PD', status: 'Deployed', val: '3 Units', color: 'text-blue-400' },
                                    { name: 'Public Works', status: 'En Route', val: '2 Trucks (8m)', color: 'text-yellow-400' },
                                    { name: 'EMS Units', status: simStep === 2 ? 'Moving' : 'STUCK', val: '4 Ambulances', color: simStep === 2 ? 'text-green-400' : 'text-red-500 animate-pulse' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                                        <span className="text-sm font-medium text-slate-300">{item.name}</span>
                                        <span className={`text-xs font-bold ${item.color}`}>{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Critical Decision Block */}
                        <div className={`flex-1 rounded-xl p-5 border-2 transition-all duration-500 flex flex-col justify-between
                            ${simStep === 0 ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' :
                                simStep === 1 ? 'bg-blue-950/20 border-blue-500/50' :
                                    'bg-green-950/20 border-green-500/50'
                            }`}>

                            <div>
                                <h3 className={`text-lg font-bold flex items-center gap-2 mb-2
                                    ${simStep === 0 ? 'text-red-400' : simStep === 1 ? 'text-blue-400' : 'text-green-400'}`}>
                                    {simStep === 0 && <AlertTriangle />}
                                    {simStep === 1 && <Activity className="animate-spin" />}
                                    {simStep === 2 && <CheckCircle />}
                                    {simStep === 0 ? "CONFLICT DETECTED" : simStep === 1 ? "EXECUTING..." : "SUCCESS"}
                                </h3>

                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {simStep === 0 && "Traffic from I-91 accident is blocking Zone A evacuation route. EMS units are trapped."}
                                    {simStep === 1 && "Overriding traffic signals at Main & Elm. Rerouting PD units to off-ramp..."}
                                    {simStep === 2 && "Traffic flow restored. Evacuation capacity increased by 40%. EMS en route to alternate hospital."}
                                </p>
                            </div>

                            {simStep === 0 && (
                                <div className="space-y-3 mt-4">
                                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-xs text-red-200">
                                        <strong>Recommended:</strong> Override Signals (Main & Elm) + Block Off-Ramp.
                                    </div>
                                    <Button onClick={handleAuthorize} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-900/20 animate-pulse">
                                        <Zap className="mr-2 fill-current" /> AUTHORIZE OVERRIDE
                                    </Button>
                                </div>
                            )}

                            {simStep === 2 && (
                                <div className="mt-4">
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded text-center">
                                        <span className="text-green-400 font-bold text-lg">Crisis Averted</span>
                                    </div>
                                    <Button variant="outline" onClick={onClose} className="w-full mt-3 border-slate-700 hover:bg-slate-800">
                                        Return to Dashboard
                                    </Button>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </Card>
        </div>
    );
};

export default WarRoom;
