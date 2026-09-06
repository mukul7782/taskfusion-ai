'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Clock, CheckCircle2, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

export function AISprintAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/analytics');
      const json = await res.json();
      if (json.ai) setData(json);
    } catch (e) {
      console.error('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-3 text-sky-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Gemini AI is analyzing sprint telemetry...</span>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, ai } = data;

  return (
    <div className="space-y-6">
      {/* AI Sprint Health Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/20 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Gemini Sprint Health Intelligence
              </h3>
              <p className="text-xs text-slate-400">AI-generated velocity assessment and forecasts</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Refresh Intelligence"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 mb-4">
          "{ai.summaryText}"
        </p>

        {/* AI Recommendations */}
        {ai.recommendations && ai.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">AI Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {ai.recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Productivity Score</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">{ai.productivityScore}/100</h4>
            <p className="text-[11px] text-emerald-400 mt-0.5">High Velocity</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Focus Hours */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Focus Hours</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">{ai.focusHours} hrs</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{ai.distractionHours} hrs distraction</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Story Points */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Story Points Done</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">
              {metrics.completedStoryPoints} / {metrics.totalStoryPoints}
            </h4>
            <p className="text-[11px] text-indigo-400 mt-0.5">
              {metrics.totalStoryPoints > 0
                ? Math.round((metrics.completedStoryPoints / metrics.totalStoryPoints) * 100)
                : 0}% completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Predicted Completion */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Est. Days to Finish</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">~{ai.predictedCompletionDays} Days</h4>
            <p className="text-[11px] text-amber-400 mt-0.5">AI Completion Forecast</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}