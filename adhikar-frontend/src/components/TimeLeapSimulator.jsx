import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Sparkles, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const TimeLeapSimulator = ({ caseId, onUpdate }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');

  const simulateLeap = async (days) => {
    setLoading(true);
    setVariant('info');
    setMessage('Simulating time passage...');
    const start = Date.now();

    try {
      const response = await fetch(`${API_URL}/grievances/${caseId}/time-leap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ days })
      });
      const data = await response.json();

      const elapsed = Date.now() - start;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }

      if (data.success) {
        if (data.overdue) {
          setVariant('warning');
          setMessage('⚠️ Deadline missed — First Appeal auto-drafted');
        } else {
          setVariant('success');
          setMessage(`⏱️ Time leap applied: ${days} days earlier.`);
        }
        if (typeof onUpdate === 'function') {
          onUpdate(data.data);
        }
      } else {
        setVariant('error');
        setMessage(data.message || 'Time-Leap simulation failed.');
      }
    } catch (err) {
      console.warn('TimeLeapSimulator error:', err);
      const elapsed = Date.now() - start;
      if (elapsed < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
      }
      setVariant('error');
      setMessage('Unable to reach backend. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getMessageClasses = () => {
    if (variant === 'warning') return 'border-amber-300 bg-amber-50 text-amber-900';
    if (variant === 'success') return 'border-emerald-300 bg-emerald-50 text-emerald-900';
    if (variant === 'error') return 'border-rose-300 bg-rose-50 text-rose-900';
    return 'border-slate-300 bg-slate-950 text-slate-100';
  };

  return (
    <div className="border border-amber-400/70 bg-amber-950/5 p-4 rounded-3xl shadow-sm ring-1 ring-amber-500/10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
            ⏱️ Time-Leap Simulator
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Artificially accelerate the case timeline to preview overdue appeal drafting.
          </p>
        </div>
        <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => simulateLeap(30)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/60 bg-amber-500 text-slate-950 px-4 py-3 font-semibold transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Clock className="w-4 h-4" />
          Jump 30 Days
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => simulateLeap(60)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/60 bg-slate-950 text-amber-400 px-4 py-3 font-semibold transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AlertTriangle className="w-4 h-4" />
          Jump 60 Days
        </button>
      </div>

      <div className={`mt-4 rounded-2xl border px-4 py-3 text-[12px] ${getMessageClasses()} transition-all duration-300 ${message ? 'opacity-100' : 'opacity-0'}`}>
        {message || 'Use the buttons above to simulate deadline passage.'}
      </div>
    </div>
  );
};

export default TimeLeapSimulator;
