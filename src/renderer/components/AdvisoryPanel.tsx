import React from 'react';
import { AdvisoryMessage } from '../types';

interface AdvisoryPanelProps {
    messages: AdvisoryMessage[];
}

export const AdvisoryPanel: React.FC<AdvisoryPanelProps> = ({ messages }) => {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'blocking': return 'bg-red-900 border-red-500 text-red-100';
            case 'caution': return 'bg-orange-900 border-orange-500 text-orange-100';
            case 'recommendation': return 'bg-yellow-900 border-yellow-500 text-yellow-100';
            default: return 'bg-blue-900 border-blue-500 text-blue-100';
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Methodology Champion: Startup</h2>
            {messages.length === 0 ? (
                <p className="text-gray-400 italic">No active recommendations. Compliance levels optimal.</p>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className={`p-4 border rounded-lg shadow-lg ${getSeverityStyles(msg.severity)} animate-pulse`}>
                        <div className="flex justify-between items-start">
                            <span className="uppercase text-xs font-black tracking-widest opacity-70">{msg.severity}</span>
                            <span className="text-xs opacity-50">{new Date(msg.triggered_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-2 font-medium">{msg.message_template}</p>
                        <details className="mt-2 text-sm opacity-80">
                            <summary className="cursor-pointer hover:underline">Tell Me More</summary>
                            <div className="mt-2 space-y-2">
                                <p>{msg.explanation}</p>
                                <div className="bg-black bg-opacity-30 p-2 rounded">
                                    <span className="font-bold">Next Step:</span> {msg.suggested_action}
                                </div>
                            </div>
                        </details>
                    </div>
                ))
            )}
        </div>
    );
};
