import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Scale, Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight,
  Sparkles, Compass, Plus
} from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, pending: 0, resolved: 0 });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const response = await fetch(`${API_URL}/grievances`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setGrievances(data.data);
          calculateStats(data.data);
        }
      } catch (err) {
        console.warn('Backend server offline. Setting up dashboard mock data.');
        // Fallback demo data
        const mockGrievances = [
          {
            _id: 'mock_grievance_1',
            title: 'High Fluoride and Sewage Mixing in Municipal Water',
            description: 'Municipal tap water has been dark yellow and smelling of sewage since July 15. Multiple children in ward 4 have fallen ill.',
            category: 'Water & Sanitation',
            ministry: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
            legalReferences: [
              'Section 3 of the Water Act, 1974',
              'Article 21 of the Constitution (Right to Clean Water)'
            ],
            status: 'Ready to File',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'mock_grievance_2',
            title: 'Unlawful Power Cuts and Voltage Fluctuations',
            description: 'Daily unannounced power outages lasting 4-6 hours in the local sub-division, damaging home electronic appliances.',
            category: 'Electricity & Power',
            ministry: 'Ministry of Power',
            legalReferences: [
              'Section 43 of the Electricity Act, 2003',
              'Electricity Consumer Rights Rules, 2020'
            ],
            status: 'Draft',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setGrievances(mockGrievances);
        calculateStats(mockGrievances);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [token]);

  const calculateStats = (list) => {
    const active = list.length;
    const pending = list.filter(g => g.status === 'Ready to File').length;
    const resolved = list.filter(g => g.status === 'Resolved').length;
    setStats({ active, pending, resolved });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'Ready to File':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-saffron-950/40 text-saffron-400 border border-saffron-900/50 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> Ready to File
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            Citizen Adhikar Dashboard <Sparkles className="w-6 h-6 text-saffron-500 fill-saffron-500/10" />
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Draft grievances, prepare Right to Information (RTI) claims, and get assisted filing copilot guides.
          </p>
        </div>
        <Link
          to="/file"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 text-slate-950 font-bold hover:from-saffron-600 hover:to-amber-600 transition-all duration-300 transform active:scale-95 shadow-lg shadow-saffron-500/10 self-start md:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Draft New Case
        </Link>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-400">Total Dockets</div>
            <div className="text-3xl font-black text-slate-100 mt-1">{stats.active}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-saffron-500">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-400">Ready to File</div>
            <div className="text-3xl font-black text-slate-100 mt-1">{stats.pending}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-400">Resolved Grievances</div>
            <div className="text-3xl font-black text-slate-100 mt-1">{stats.resolved}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-ashoka-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Grievances + Help Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grievances list (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            Active Grievance Dockets
          </h3>

          {loading ? (
            <div className="glass rounded-2xl p-12 border border-slate-800 text-center">
              <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 text-sm">Fetching citizen records...</p>
            </div>
          ) : grievances.length === 0 ? (
            <div className="glass rounded-2xl p-12 border border-slate-800 text-center">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-base font-bold text-slate-350">No grievances found</h4>
              <p className="text-slate-500 text-xs mt-1">Submit your first issue using our speech or text guides.</p>
              <Link
                to="/file"
                className="inline-block mt-4 text-xs font-bold text-saffron-500 hover:underline"
              >
                Get Started &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((g) => (
                <div
                  key={g._id}
                  className="glass rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-slate-900 border border-slate-800 text-saffron-500">
                        {g.category}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(g.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-200 tracking-wide">
                      {g.title}
                    </h4>

                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-saffron-500 shrink-0" />
                      <span>{g.ministry}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                    {getStatusBadge(g.status)}
                    <Link
                      to={`/copilot/${g._id}`}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-950 bg-saffron-500 hover:bg-saffron-600 rounded-lg transition-all duration-300"
                    >
                      Copilot Assist <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info & Legal Help Cards (Right 1 column) */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-200">Adhikar Knowledge Hub</h3>

          <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-saffron-500" />
              Citizen Charter Timelines
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Under administrative guidelines, departments are mandated to resolve public grievances within standard timelines:
            </p>
            <div className="space-y-2 border-t border-slate-800 pt-3 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Drinking Water:</span>
                <span className="text-saffron-500 font-bold">15 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Power Supply:</span>
                <span className="text-saffron-500 font-bold">7 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Public Security:</span>
                <span className="text-saffron-500 font-bold">30 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RTI Responses:</span>
                <span className="text-ashoka-500 font-bold">30 Days</span>
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-[10px] text-slate-500">
              📌 If your timeline is exceeded, Adhikar helps you draft legal appeals and direct letters automatically.
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-850 bg-gradient-to-tr from-saffron-950/20 to-ashoka-950/10 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-200">RTI vs. Public Grievance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use **Public Grievance** (CPGRAMS) if you want a public service fixed.
              Use **RTI** (Right to Information) if you want official documents, work orders, or contract details from a public authority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
