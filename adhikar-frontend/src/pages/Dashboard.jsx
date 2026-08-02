import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Clock, AlertCircle, FileText, Calendar, User, 
  MapPin, HelpCircle, Shield, ArrowRight, Download, Send, 
  Bell, Eye, Lock, Heart, ChevronDown, Copy, CheckCircle, X, Sparkles, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api';

const CountUp = ({ end, duration = 1200 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count}</>;
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, appeals: 0 });
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedLeapId, setSelectedLeapId] = useState('');
  const [leaping, setLeaping] = useState(false);

  // Appeal Generation & State
  const [generatingAppealLevel, setGeneratingAppealLevel] = useState(null);
  const [appealData, setAppealData] = useState(null);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  // Fetch Grievances from Backend API
  useEffect(() => {
    fetchGrievances();
  }, [token]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/grievances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setGrievances(data.data);
        calculateStats(data.data);
      } else {
        throw new Error('Using fallback grievances list');
      }
    } catch (err) {
      console.warn('Backend server unreachable or no token, loading standard grievances dataset:', err);
      const fallbackList = [
        {
          _id: 'mock_grievance_1',
          referenceNumber: 'ADH-2026-839401',
          title: 'Contaminated water supply in Ward 4',
          complaintText: 'Tap water has been coming out yellow and smelling like gutter sewage for 15 days in Ward 4. No action has been taken by municipal engineers despite three complaints.',
          category: 'Water & Sanitation',
          urgency: 'high',
          department: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
          state: 'Maharashtra',
          district: 'Mumbai',
          status: 'Pending',
          appeal_level: 0,
          deadlineDays: 15,
          submittedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 days ago -> Overdue!
          legalReferences: [
            'Section 3 of the Water (Prevention and Control of Pollution) Act, 1974',
            'Article 21 of the Constitution of India (Right to Clean Water)'
          ],
          formalLetter: `To,\nThe Public Grievance Officer,\nMinistry of Jal Shakti / Department of Drinking Water and Sanitation\n\nSubject: Formal Complaint regarding Contaminated Water Supply in Ward 4\n\nRespected Sir/Madam,\n\nI am writing to file a complaint regarding tap water coming out yellow and smelling like gutter sewage for 15 days in Ward 4. This constitutes a severe public health hazard and violates standards under Section 3 of the Water Act, 1974.\n\nPlease investigate immediately and restore safe drinking water supply.\n\nYours faithfully,\nRajesh S. Kumar`,
          rtiDraft: `To,\nThe Public Information Officer (PIO)\nOffice of Ministry of Jal Shakti\n\nSubject: Application under Section 6(1) of the RTI Act, 2005.\n\n1. Provide certified copies of water testing reports for Ward 4 between July 1 and July 30.\n2. Provide budgetary details allocated for pipeline repair.`
        },
        {
          _id: 'mock_grievance_2',
          referenceNumber: 'ADH-2026-104928',
          title: 'Delay in Income Certificate Issuance',
          complaintText: 'Applied for income certificate 40 days ago at Tahsildar office. Document verification completed but officer delaying approval without reason.',
          category: 'certificate/service delay',
          urgency: 'medium',
          department: 'State Revenue Department (Seva Sindhu)',
          state: 'Karnataka',
          district: 'Bengaluru',
          status: 'Pending',
          appeal_level: 0,
          deadlineDays: 15,
          submittedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          legalReferences: [
            'State Right to Public Services Guarantee Act',
            'Section 4 of the Information Technology Act, 2000'
          ],
          formalLetter: `To,\nThe Tahsildar / Public Officer,\nState Revenue Department\n\nSubject: Complaint regarding 40-day delay in Income Certificate Issuance\n\nRespected Sir,\nMy application for Income Certificate has been pending for 40 days despite full documentation. Under the Sakala Right to Services Act, the prescribed limit is 15 days.\n\nPlease issue the certificate without further delay.`,
          rtiDraft: `To,\nThe Public Information Officer,\nTahsildar Office\n\nInformation sought: Name and designation of the officer responsible for processing Application No. IC-2026-991.`
        }
      ];
      setGrievances(fallbackList);
      calculateStats(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list) => {
    const total = list.length;
    const pending = list.filter(g => g.status === 'Pending' || g.status === 'Submitted').length;
    const appeals = list.filter(g => g.status === 'Appeal Filed' || g.status === 'Overdue' || g.appeal_level > 0 || calculateDaysElapsed(g.submittedAt) > (g.deadlineDays || 15)).length;
    setStats({ total, pending, appeals });
  };

  const calculateDaysElapsed = (submittedAt) => {
    if (!submittedAt) return 0;
    const diffTime = Math.abs(new Date() - new Date(submittedAt));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // SIH Time Leap Simulator Trigger
  const handleTimeLeap = async () => {
    if (!selectedLeapId) {
      alert('Please select a case from the SIH Time Leap dropdown first.');
      return;
    }

    setLeaping(true);
    try {
      const response = await fetch(`${API_URL}/grievances/${selectedLeapId}/time-leap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Time Leap Simulated! Case status updated to "${data.data.status}". Appeal Level 1 enabled.`);
        fetchGrievances();
      } else {
        throw new Error('Local Leap Simulation');
      }
    } catch (err) {
      // Local Time Leap Fallback
      setGrievances(prev => prev.map(g => {
        if (g._id === selectedLeapId || g.referenceNumber === selectedLeapId) {
          return {
            ...g,
            status: 'Overdue',
            daysElapsed: (g.daysElapsed || 33) + 30,
            appealDraft: `To,\nThe First Appellate Authority (FAA)\n${g.department}\n\nSubject: FIRST APPEAL under Section 19(1) of the RTI Act / Service Guarantee Rules\n\nRespected Sir/Madam,\n\nI filed a grievance (${g.referenceNumber}) on ${new Date(g.submittedAt).toLocaleDateString()}. The statutory 15-day resolution limit expired over 30 days ago. No resolution has been provided.\n\nI pray that the Appellate Authority direct immediate resolution and penalize the defaulting officer under the Right to Services Act.\n\nYours faithfully,\nRajesh S. Kumar`
          };
        }
        return g;
      }));
      alert('Time Leap Simulated (+30 Days)! Deadline exceeded. Appeal Level 1 enabled.');
    } finally {
      setLeaping(false);
    }
  };

  // Generate Appeal Level 1 or Level 2 via API
  const handleGenerateAppeal = async (level) => {
    if (!selectedCase) return;
    setGeneratingAppealLevel(level);
    setAppealData(null);

    try {
      const response = await fetch(`${API_URL}/generate-appeal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          caseId: selectedCase._id,
          referenceNumber: selectedCase.referenceNumber || selectedCase._id,
          complaintText: selectedCase.complaintText || selectedCase.description,
          category: selectedCase.category,
          department: selectedCase.department,
          level
        })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAppealData(resJson.data);
      } else {
        throw new Error('Local Appeal Generation Fallback');
      }
    } catch (err) {
      // Fallback local appeal generation
      const isLvl2 = level === 2;
      setAppealData({
        appeal_level: level,
        referenceNumber: selectedCase.referenceNumber || selectedCase._id,
        appeal_letter: isLvl2 
          ? `From:\nRajesh S. Kumar\nPhone: +91 9876543210\nAddress: Sector 4, Bandra West, Mumbai\n\nTo:\nThe Central / State Information Commission & Chief Appellate Officer,\n${selectedCase.department}\n\nSubject: SECOND APPEAL & STERN ESCALATION under Section 19(3) of RTI Act 2005 / Citizen Charter Penal Provisions\n\nReference Case ID: ${selectedCase.referenceNumber || selectedCase._id}\n\nRespected High Commission,\n\nI am compelled to submit this Second Statutory Appeal regarding grievance: "${selectedCase.complaintText || selectedCase.title}".\n\nDespite submitting a formal complaint and a subsequent Level 1 First Appeal, the respondent public authority has displayed complete administrative inertia. This is a severe breach under the Right to Information Act and Public Service Guarantee Act.\n\nI pray that this Commission:\n1. Direct immediate resolution and disposal of the grievance file.\n2. Invoke penal proceedings under Section 20 of the RTI Act against the defaulting Public Information Officer.\n\nYours faithfully,\nRajesh S. Kumar`
          : `From:\nRajesh S. Kumar\nPhone: +91 9876543210\nAddress: Sector 4, Bandra West, Mumbai\n\nTo:\nThe First Appellate Authority (FAA),\n${selectedCase.department}\n\nSubject: FIRST APPEAL under Section 19(1) of the RTI Act, 2005 / Citizen Charter rules\n\nReference Case ID: ${selectedCase.referenceNumber || selectedCase._id}\n\nRespected Sir/Madam,\n\nI had filed an official grievance regarding: "${selectedCase.complaintText || selectedCase.title}".\n\nAs per standard guidelines, the resolution deadline was capped at 15 days. However, the statutory deadline has passed with no response or resolution from the department.\n\nPlease direct the concerned officer to provide immediate resolution.\n\nYours faithfully,\nRajesh S. Kumar`,
        primary_portal: isLvl2 ? 'https://pgportal.gov.in' : (selectedCase.category?.toLowerCase().includes('police') ? 'https://ksp.karnataka.gov.in' : 'https://rtps.karnataka.gov.in'),
        fallback_portals: [
          'https://pgportal.gov.in',
          'https://rtionline.gov.in',
          'https://services.india.gov.in',
          'https://india.gov.in',
          'https://mygov.in',
          'https://karnataka.gov.in',
          'https://cybercrime.gov.in'
        ],
        auto_redirect: isLvl2 ? 'https://pgportal.gov.in' : 'https://rtps.karnataka.gov.in'
      });
    } finally {
      setGeneratingAppealLevel(null);
    }
  };

  // Submit Appeal Level 1 or Level 2 to Backend DB
  const handleSubmitAppeal = async (level) => {
    if (!selectedCase || !appealData) return;

    setSubmittingAppeal(true);
    try {
      const response = await fetch(`${API_URL}/grievances/${selectedCase._id}/submit-appeal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          level,
          letter: appealData.appeal_letter
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        alert(`Appeal Level ${level} Submitted & Registered Successfully! Case status updated.`);
      }
    } catch (err) {
      alert(`Appeal Level ${level} Saved Local State!`);
    } finally {
      setSubmittingAppeal(false);
      // Update local state
      setSelectedCase(prev => ({
        ...prev,
        appeal_level: level,
        status: `Appeal ${level} Submitted`,
        ...(level === 1 ? { appeal1_letter: appealData.appeal_letter, appeal1_date: new Date() } : { appeal2_letter: appealData.appeal_letter, appeal2_date: new Date() })
      }));
      setGrievances(prev => prev.map(g => g._id === selectedCase._id ? { ...g, appeal_level: level, status: `Appeal ${level} Submitted` } : g));
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const downloadTextFile = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] font-sans antialiased text-slate-800">
      
      {/* LEFT SIDEBAR */}
      <div className="w-70 shrink-0 bg-linear-to-b from-[#110c2e] to-[#201547] flex flex-col relative overflow-hidden z-20 shadow-2xl">
        
        {/* Top Flag Graphic overlay */}
        <div className="absolute top-0 left-0 w-full h-32 opacity-90 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 0 L100 0 L100 20 Q 75 40 50 20 T 0 20 Z" fill="#FF9933" />
            <path d="M0 15 L100 15 L100 35 Q 75 55 50 35 T 0 35 Z" fill="#FFFFFF" />
            <path d="M0 30 L100 30 L100 50 Q 75 70 50 50 T 0 50 Z" fill="#138808" />
            <circle cx="50" cy="27" r="7" fill="#000080" opacity="0.9" />
          </svg>
        </div>

        {/* Spacer for flag */}
        <div className="h-28"></div>

        {/* Navigation Menu */}
        <div className="px-6 flex-1 flex flex-col mt-4">
          <h3 className="text-[11px] font-bold text-slate-400 tracking-widest mb-4">CITIZEN SERVICES</h3>
          
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-linear-to-r from-purple-600 to-fuchsia-600 rounded-xl text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/30 transition-transform hover:scale-[1.02]">
              <FolderOpen className="w-5 h-5" />
              <span>My Cases</span>
            </button>
            
            <button 
              onClick={() => navigate('/new-case')}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all"
            >
              <FileText className="w-5 h-5 opacity-70" />
              <span>File a Case</span>
            </button>

            <button 
              onClick={() => navigate('/split-demo')}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-amber-300 hover:bg-white/10 rounded-xl font-medium transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Embedded Portal Demo</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all">
              <User className="w-5 h-5 opacity-70" />
              <span>Profile Settings</span>
            </button>
          </div>

          {/* Bottom Callout Card */}
          <div className="mt-auto mb-8 bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/30"></div>
            
            <Shield className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-white font-bold text-base mb-1">Your Voice.<br/>Our Responsibility.</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">Empowering citizens. Building a transparent India.</p>
            
            <button className="w-full py-2.5 px-4 bg-transparent border border-purple-400/50 hover:bg-purple-500/20 text-white text-sm font-semibold rounded-lg flex justify-between items-center transition-colors">
              Know Your Rights
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Footer Contact */}
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400">We are here to help you</p>
              <p className="text-sm font-bold text-white">24x7 <span className="font-normal text-slate-300">Grievance Support</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-14 bg-slate-100 flex items-center justify-center rounded border border-slate-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-10 opacity-80" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#110c2e] tracking-tight leading-none mb-1">ADHIKAR</h1>
              <p className="text-xs font-semibold text-slate-500">AI Grievance & RTI Capitol Portal</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex w-3 h-2 flex-col">
                  <div className="bg-saffron-500 h-full w-full"></div>
                  <div className="bg-white h-full w-full"></div>
                  <div className="bg-[#138808] h-full w-full"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Government of India Initiative</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                R
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Welcome,</p>
                <div className="flex items-center gap-1 cursor-pointer">
                  <p className="text-sm font-bold text-slate-800">{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Rajesh S. Kumar'}</p>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="w-px h-8 bg-slate-200"></div>
            
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">3</span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="ml-2 px-6 py-2.5 bg-linear-to-r from-orange-500 to-pink-500 text-white font-bold text-sm rounded-full shadow-[0_4px_15px_rgba(249,115,22,0.3)]"
            >
              LOG OUT
            </motion.button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <motion.div 
            className="max-w-6xl mx-auto space-y-8 pb-10"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="bg-linear-to-r from-purple-900 via-indigo-900 to-[#110c2e] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-white drop-shadow-sm">
                  Welcome back, {user?.firstName || 'Rajesh'} <motion.span 
                    className="inline-block origin-bottom-right"
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                  >👋</motion.span>
                </h2>
                <p className="text-indigo-200 font-medium text-lg max-w-lg">Track and manage your grievances efficiently with our AI-powered portal.</p>
              </div>
              
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/10 transition-colors duration-1000"></div>
              <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            </motion.div>

            {/* Dynamic Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <motion.div variants={itemVariants} className="bg-linear-to-br from-emerald-50/50 to-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-100/50 relative overflow-hidden group hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex flex-col relative z-10 h-full">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">TOTAL DOCKETS</h3>
                  <div className="text-4xl font-extrabold text-emerald-500 mb-1 tracking-tight">
                    <CountUp end={stats.total || grievances.length} />
                  </div>
                  <p className="text-xs font-bold text-emerald-600/80 bg-emerald-50 inline-block px-2 py-1 rounded w-fit">All Time Registered</p>
                </div>
                <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <FolderOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-40 h-20 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-emerald-500" fill="none" strokeWidth="4">
                    <path d="M0,50 Q25,20 50,40 T100,10" />
                  </svg>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div variants={itemVariants} className="bg-linear-to-br from-orange-50/50 to-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100/50 relative overflow-hidden group hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex flex-col relative z-10 h-full">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ACTIVE PENDING</h3>
                  <div className="text-4xl font-extrabold text-orange-500 mb-1 tracking-tight">
                    <CountUp end={stats.pending || 1} />
                  </div>
                  <p className="text-xs font-bold text-orange-600/80 bg-orange-50 inline-block px-2 py-1 rounded w-fit">In Resolution Process</p>
                </div>
                <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-40 h-20 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-orange-500" fill="none" strokeWidth="4">
                    <path d="M0,50 Q25,30 50,45 T100,15" />
                  </svg>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div variants={itemVariants} className="bg-linear-to-br from-rose-50/50 to-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100/50 relative overflow-hidden group hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex flex-col relative z-10 h-full">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">APPEALS / OVERDUE</h3>
                  <div className="text-4xl font-extrabold text-rose-500 mb-1 tracking-tight">
                    <CountUp end={stats.appeals || 1} />
                  </div>
                  <p className="text-xs font-bold text-rose-600/80 bg-rose-50 inline-block px-2 py-1 rounded w-fit">Requires Escalation</p>
                </div>
                <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-40 h-20 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-rose-500" fill="none" strokeWidth="4">
                    <path d="M0,40 Q30,50 60,30 T100,20" />
                  </svg>
                </div>
              </motion.div>

            </div>

            {/* Table Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">REGISTERED GRIEVANCE RECORDS</h2>
                </div>
                
                {/* SIH TIME LEAP SIMULATOR CONTROLS */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-purple-50 rounded-lg border border-purple-100 px-4 py-2">
                    <span className="text-xs font-bold text-purple-900 mr-3 uppercase tracking-wider">SIH TIME LEAP SIMULATOR:</span>
                    <select 
                      value={selectedLeapId}
                      onChange={(e) => setSelectedLeapId(e.target.value)}
                      className="bg-transparent text-sm font-medium text-slate-700 outline-none pr-4 cursor-pointer border-l border-purple-200 pl-3"
                    >
                      <option value="">-- Select case to leap --</option>
                      {grievances.map(g => (
                        <option key={g._id} value={g._id}>
                          {g.referenceNumber || g._id} (Forward 30 days)
                        </option>
                      ))}
                    </select>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTimeLeap}
                    disabled={leaping}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4 text-white" />
                    {leaping ? 'Leaping...' : 'Leap +30 Days'}
                  </motion.button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref Number</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Urgency</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">State/District</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Days Elapsed</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    initial="hidden"
                    animate="show"
                    variants={containerVariants}
                    className="divide-y divide-slate-100"
                  >
                    {grievances.map((g) => {
                      const days = calculateDaysElapsed(g.submittedAt);
                      const isOverdue = days > (g.deadlineDays || 15) || g.status === 'Overdue' || g.appeal_level > 0;

                      return (
                        <motion.tr 
                          key={g._id} 
                          variants={itemVariants} 
                          onClick={() => { setSelectedCase(g); setAppealData(null); }}
                          className="hover:bg-purple-50/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-5 font-bold text-slate-800 text-sm">
                            {g.referenceNumber || g._id}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-slate-800 block leading-tight">{g.category || 'General'}</span>
                                <span className="text-[11px] text-slate-500 block truncate max-w-50">{g.department}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-block px-3 py-1 font-bold text-xs rounded border uppercase tracking-wider ${
                              g.urgency === 'high' 
                                ? 'bg-red-50 text-red-600 border-red-100' 
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {g.urgency || 'HIGH'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">{g.district || 'Mumbai'}, {g.state || 'Maharashtra'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-bold text-slate-800">
                                Day <span className={`text-base ${isOverdue ? 'text-red-600 font-extrabold' : ''}`}>{days}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-block px-4 py-1.5 font-bold text-xs rounded-full border ${
                              g.appeal_level === 2
                                ? 'bg-red-200 text-red-900 border-red-300'
                                : g.appeal_level === 1
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : isOverdue 
                                ? 'bg-red-100 text-red-700 border-red-200' 
                                : 'bg-purple-100 text-purple-700 border-purple-200'
                            }`}>
                              {g.appeal_level === 2 ? 'Appeal 2 Submitted' : g.appeal_level === 1 ? 'Appeal 1 Submitted' : isOverdue ? 'Escalation Available' : g.status || 'Pending'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            </motion.div>

            {/* Banner Section */}
            <motion.div variants={itemVariants} className="rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-linear-to-r from-purple-100 via-pink-50 to-emerald-50 border border-white">
              <div className="relative z-10 p-8 md:p-10 md:w-1/2">
                <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 mb-5">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#110c2e] mb-2">Transparent Today, Better Tomorrow.</h2>
                <p className="text-purple-900 font-medium text-lg">Your feedback drives real change.</p>
              </div>
              
              <div className="absolute right-0 bottom-0 w-1/2 h-full hidden md:block opacity-90 mix-blend-multiply">
                <div className="w-full h-full bg-no-repeat bg-bottom-right bg-contain" style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Parliament_House_of_India_New_Delhi.jpg/800px-Parliament_House_of_India_New_Delhi.jpg')"}}></div>
                <div className="absolute inset-0 bg-linear-to-r from-pink-50 to-transparent"></div>
                <div className="absolute inset-0 bg-linear-to-t from-emerald-50/50 to-transparent"></div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-extrabold text-slate-500 tracking-wider uppercase mb-4 pl-2">QUICK ACTIONS</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/new-case')}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col items-start gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800 text-base mb-1">File a New Case</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Raise your grievance<br/>with ease</p>
                  </div>
                  <div className="mt-auto w-full flex justify-end text-purple-600 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => navigate('/split-demo')}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col items-start gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800 text-base mb-1">Embedded Demo</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">View split-screen<br/>portal preview</p>
                  </div>
                  <div className="mt-auto w-full flex justify-end text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col items-start gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800 text-base mb-1">RTI Request</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Submit your RTI<br/>application</p>
                  </div>
                  <div className="mt-auto w-full flex justify-end text-pink-600 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col items-start gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800 text-base mb-1">Download Guide</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Know your rights<br/>& procedures</p>
                  </div>
                  <div className="mt-auto w-full flex justify-end text-orange-600 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>

              </div>
            </motion.div>

          </motion.div>
        </main>

        {/* Footer Bar */}
        <footer className="h-14 bg-[#110c2e] shrink-0 px-8 flex items-center justify-between z-10 mt-auto">
          <div className="flex items-center gap-8 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Transparent</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Accountable</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span>Made for Citizens, Driven by Technology</span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          </div>
        </footer>

      </div>

      {/* CASE DETAILS MODAL / DRAWER WITH COMPLETE AUTO-ESCALATION ENGINE */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-linear-to-r from-purple-900 to-indigo-900 text-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest block">CASE RECORD DETAILS</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-extrabold uppercase">
                      Level {selectedCase.appeal_level || 0} Escalation Engine
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-mono">{selectedCase.referenceNumber || selectedCase._id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* 1. INTERACTIVE TIMELINE STEPPER */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 tracking-wider">Statutory Case Lifecycle & Escalation Timeline</h4>
                  
                  <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-bold">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-slate-800">1. Complaint</span>
                      <span className="text-[9px] text-slate-400 font-normal">Filed</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-slate-800">2. AI Processed</span>
                      <span className="text-[9px] text-slate-400 font-normal">Mapped</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm ${
                        calculateDaysElapsed(selectedCase.submittedAt) > (selectedCase.deadlineDays || 15)
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-slate-800">3. Deadline</span>
                      <span className="text-[9px] font-normal text-slate-500">{selectedCase.deadlineDays || 15} Days Limit</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm ${
                        selectedCase.appeal_level >= 1
                          ? 'bg-amber-500 text-white'
                          : calculateDaysElapsed(selectedCase.submittedAt) > (selectedCase.deadlineDays || 15)
                          ? 'bg-red-100 text-red-600 border border-red-300 animate-pulse'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-slate-800">4. Appeal 1</span>
                      <span className="text-[9px] font-normal text-slate-500">
                        {selectedCase.appeal_level >= 1 ? 'Submitted' : 'First Appellate'}
                      </span>
                    </div>

                    {/* Step 5 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm ${
                        selectedCase.appeal_level >= 2
                          ? 'bg-purple-600 text-white'
                          : selectedCase.appeal_level === 1
                          ? 'bg-orange-100 text-orange-600 border border-orange-300'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-slate-800">5. Appeal 2</span>
                      <span className="text-[9px] font-normal text-slate-500">
                        {selectedCase.appeal_level >= 2 ? 'Commission' : 'Higher Authority'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. ESCALATION ALERTS & DYNAMIC ACTION BAR */}
                {calculateDaysElapsed(selectedCase.submittedAt) > (selectedCase.deadlineDays || 15) && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-red-900">
                          {selectedCase.appeal_level === 1
                            ? 'No response after Appeal 1 (Level 2 Escalation Enabled)'
                            : selectedCase.appeal_level === 2
                            ? 'Appeal Level 2 Submitted to High Commission'
                            : 'Your case exceeded the statutory resolution timeline!'}
                        </h4>
                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                          {selectedCase.appeal_level === 1
                            ? '15-30 days have elapsed since Appeal 1 with no resolution. You are entitled to file a Level 2 Second Appeal to the State / Central Information Commission.'
                            : selectedCase.appeal_level === 2
                            ? 'Level 2 Second Appeal has been formally lodged with statutory penal provisions.'
                            : `Resolution deadline of ${selectedCase.deadlineDays || 15} days was exceeded by ${calculateDaysElapsed(selectedCase.submittedAt) - (selectedCase.deadlineDays || 15)} days. Enable Appeal Level 1 to escalate.`}
                        </p>
                      </div>
                    </div>

                    {/* DYNAMIC ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-red-200">
                      {selectedCase.appeal_level < 1 && (
                        <button
                          onClick={() => handleGenerateAppeal(1)}
                          disabled={generatingAppealLevel === 1}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          {generatingAppealLevel === 1 ? 'Generating Appeal 1...' : 'Generate Appeal Level 1'}
                        </button>
                      )}

                      {selectedCase.appeal_level === 1 && (
                        <button
                          onClick={() => handleGenerateAppeal(2)}
                          disabled={generatingAppealLevel === 2}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-300" />
                          {generatingAppealLevel === 2 ? 'Generating Appeal 2...' : 'Generate Appeal Level 2 (High Commission)'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. GENERATED APPEAL DRAFT & PORTAL REDIRECT PREVIEW */}
                {appealData && (
                  <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                      <span className="text-xs font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" /> AI Generated Appeal Level {appealData.appeal_level} Draft
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        Ready for Submission
                      </span>
                    </div>

                    {/* Letter Preview */}
                    <div className="bg-white p-3.5 rounded border border-amber-200">
                      <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-1.5">
                        <span className="text-xs font-bold text-slate-700">Formal Appeal Level {appealData.appeal_level} Letter</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(appealData.appeal_letter, `Appeal ${appealData.appeal_level}`)}
                            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button 
                            onClick={() => downloadTextFile(appealData.appeal_letter, `Appeal_Level_${appealData.appeal_level}_${appealData.referenceNumber}.txt`)}
                            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </div>
                      <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                        {appealData.appeal_letter}
                      </pre>
                    </div>

                    {/* Portal Routing & Redirect */}
                    <div className="bg-white p-3.5 rounded border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Target Appeal Authority Portal</span>
                        <a 
                          href={appealData.primary_portal || 'https://pgportal.gov.in'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-extrabold text-blue-700 hover:underline font-mono"
                        >
                          {appealData.primary_portal || 'https://pgportal.gov.in'}
                        </a>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitAppeal(appealData.appeal_level)}
                          disabled={submittingAppeal}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {submittingAppeal ? 'Submitting...' : `Submit Appeal ${appealData.appeal_level}`}
                        </button>

                        <a
                          href={appealData.auto_redirect || appealData.primary_portal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1 shadow-sm"
                        >
                          Proceed to Appeal Portal <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. META SUMMARY & ORIGINAL COMPLAINT DETAILS */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div><span className="text-slate-500 font-semibold">Category:</span> <span className="font-bold text-slate-800">{selectedCase.category}</span></div>
                  <div><span className="text-slate-500 font-semibold">Urgency:</span> <span className="font-bold text-red-600 uppercase">{selectedCase.urgency || 'HIGH'}</span></div>
                  <div><span className="text-slate-500 font-semibold">Department:</span> <span className="font-bold text-slate-800">{selectedCase.department}</span></div>
                  <div><span className="text-slate-500 font-semibold">Days Elapsed:</span> <span className="font-bold text-purple-700">{calculateDaysElapsed(selectedCase.submittedAt)} Days</span></div>
                </div>

                {/* Complaint Summary */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase mb-1">Grievance Description:</h4>
                  <p className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200 leading-relaxed">{selectedCase.complaintText || selectedCase.description}</p>
                </div>

                {/* Formal Letter */}
                {selectedCase.formalLetter && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-xs text-slate-700 uppercase">Official Formal Complaint Letter:</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyToClipboard(selectedCase.formalLetter, 'Letter')}
                          className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button 
                          onClick={() => downloadTextFile(selectedCase.formalLetter, `Letter_${selectedCase.referenceNumber}.txt`)}
                          className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                    <pre className="text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded border border-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">{selectedCase.formalLetter}</pre>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="px-6 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-900"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
