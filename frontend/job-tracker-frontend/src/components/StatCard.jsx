import React from 'react';

export default function StatCard({ title, count, icon: Icon, colorClass }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{count}</h3>
            </div>
            <div className={`p-4 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}