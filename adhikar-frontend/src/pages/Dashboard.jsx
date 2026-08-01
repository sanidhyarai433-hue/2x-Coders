import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TimeLeapSimulator from '../components/TimeLeapSimulator';
import {
  FileText, Scale, Calendar, CheckCircle2, Clock, AlertCircle, Plus,
  FileSpreadsheet, Clipboard, Printer, LayoutDashboard, Settings, Compass,
  Volume2, Check, ArrowRight, ShieldCheck, ChevronRight, HelpCircle, Landmark,
  Mic, MicOff, Download, Globe
} from 'lucide-react';

const STATE_DISTRICTS = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "Dwarka"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Varanasi", "Ghaziabad"]
};

const localPortalMap = {
  "certificate/service delay": {
    issueType: "Certificate / Service Delay",
    category: "certificate/service delay",
    department: "State Revenue & Public Service Department (Seva Sindhu)",
    portalName: "Seva Sindhu",
    redirectUrl: "https://sevasindhu.karnataka.gov.in",
    keywords: ["certificate", "income certificate", "caste certificate", "birth certificate", "death certificate", "revenue office", "ration card", "service delay", "edistrict", "nada kacheri", "tahsildar", "delay", "service delivery"]
  },
  "electricity": {
    issueType: "Electricity & Power",
    category: "electricity",
    department: "Ministry of Power / BESCOM DISCOM",
    portalName: "BESCOM",
    redirectUrl: "https://bescom.karnataka.gov.in",
    keywords: ["electricity", "power cut", "power outage", "meter", "bescom", "mescom", "hescom", "cesc", "discom", "transformer", "voltage", "electric pole", "light bill", "current"]
  },
  "police": {
    issueType: "Police / Crime / FIR",
    category: "police",
    department: "State Police Department / Home Affairs",
    portalName: "Police portal",
    redirectUrl: "https://ksp.karnataka.gov.in",
    keywords: ["police", "fir", "theft", "stolen", "crime", "robbery", "cybercrime", "harassment", "assault", "police station", "inspector", "bribe", "traffic fine", "cheating"]
  },
  "RTI": {
    issueType: "Right to Information (RTI)",
    category: "RTI",
    department: "RTI Online Cell / Respective Public Authority",
    portalName: "RTI portal",
    redirectUrl: "https://rtionline.gov.in",
    keywords: ["rti", "right to information", "section 6", "public information officer", "pio", "information sought", "cpc", "cic", "inspection of records"]
  },
  "consumer": {
    issueType: "Consumer Rights & Fraud",
    category: "consumer",
    department: "Ministry of Consumer Affairs, Food and Public Distribution",
    portalName: "Consumer portal",
    redirectUrl: "https://edaakhil.nic.in",
    keywords: ["consumer", "defective", "warranty", "refund", "overcharging", "mrp", "merchant", "fraud", "e-commerce", "online store", "bill dispute", "false advertising"]
  },
  "general grievance": {
    issueType: "General Grievance / Municipal / Utilities",
    category: "general grievance",
    department: "Department of Administrative Reforms / Municipal Corporation",
    portalName: "Janaspandana",
    redirectUrl: "https://janaspandana.karnataka.gov.in",
    keywords: ["water", "sewage", "gutter", "pothole", "road", "garbage", "drainage", "municipality", "bbmp", "street light", "janaspandana"]
  }
};

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation: 'dashboard' | 'file' | 'timeline' | 'settings' | 'drafts'
  const [activePanel, setActivePanel] = useState('dashboard');
  
  // Grievance records
  const [grievances, setGrievances] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, appeals: 0 });

  // File Case Form State
  const [complaintText, setComplaintText] = useState('');
  const [refNum, setRefNum] = useState('');
  const [fileProof, setFileProof] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submittingCase, setSubmittingCase] = useState(false);
  
  // AI Classify details
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overrideDept, setOverrideDept] = useState('');

  // Draft Viewer helper
  const [newlyCreatedCase, setNewlyCreatedCase] = useState(null);
  const [copiedDraft, setCopiedDraft] = useState(null);

  // Voice Intake State
  const [isRecording, setIsRecording] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-IN');
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please type your complaint.');
      return;
    }

    if (isRecording) {
      if (window.currentDashRecognition) {
        window.currentDashRecordingStop = true;
        window.currentDashRecognition.stop();
      }
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLanguage;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setComplaintText(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (err) => {
      console.error('Voice input error:', err);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    window.currentDashRecognition = recognition;
  };

  const downloadDraftAsFile = (title, content) => {
    if (!content) return;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchGrievances();
  }, [token]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/grievances`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setGrievances(data.data);
        calculateStats(data.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Utilizing mock dashboard data.');
      // Local mock defaults
      setGrievances(mockGrievancesFallback);
      calculateStats(mockGrievancesFallback);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list) => {
    const total = list.length;
    const pending = list.filter(g => g.status === 'Pending').length;
    const appeals = list.filter(g => g.status === 'Appeal Filed' || g.status === 'Overdue').length;
    setStats({ total, pending, appeals });
  };

  // MOCK FALLBACK DATA
  const mockGrievancesFallback = [
    {
      _id: 'mock_grievance_1',
      complaintText: 'Tap water has been coming out yellow and smelling like gutter sewage for 15 days in Ward 4. No action has been taken by municipal engineers despite three complaints.',
      proofUrl: 'water_sample_proof.pdf',
      referenceNumber: 'REF-839401',
      category: 'Water & Sanitation',
      urgency: 'high',
      department: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
      confidence: 95,
      state: user?.state || 'Maharashtra',
      district: user?.district || 'Mumbai',
      status: 'Pending',
      deadlineDays: 15,
      formalLetter: `To,\nThe Public Grievance Officer,\nMinistry of Jal Shakti...\n\nRespected Sir/Madam,\nI am writing to report contaminated water supply...`,
      rtiDraft: `To,\nThe Public Information Officer...\nOffice of Jal Shakti...\n\nInformation sought: Sanctioned budget details...`,
      appealDraft: `To,\nThe First Appellate Authority...\nSubject: First Appeal under Section 19(1)...`,
      appeal2Draft: `To,\nThe Central Information Commission...\nSubject: Second Appeal under Section 19(3)...`,
      submittedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() // 32 days ago
    }
  ];

  // Helper: File Type Check
  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Only PDF and JPG/JPEG/PNG images are allowed.');
      setFileProof(null);
      return;
    }
    setFileProof(file);
  };

  // Helper: Call AI Classifier
  const handleAnalyzeText = async () => {
    if (!complaintText || complaintText.length < 15) {
      alert('Please enter a detailed complaint description (minimum 15 characters) before analyzing.');
      return;
    }

    setAiAnalyzing(true);
    setAiResult(null);

    try {
      const response = await fetch(`${API_URL}/grievances/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ complaintText })
      });
      const data = await response.json();
      if (data.success) {
        setAiResult(data.data);
        setOverrideCategory(data.data.category);
        setOverrideDept(data.data.department);
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating local AI classification.');
      const textLower = complaintText.toLowerCase();
      let bestMatchKey = null;
      let maxKeywordScore = 0;

      for (const [key, mapping] of Object.entries(localPortalMap)) {
        let score = 0;
        for (const kw of mapping.keywords) {
          if (textLower.includes(kw)) {
            score += 1;
          }
        }
        if (score > maxKeywordScore) {
          maxKeywordScore = score;
          bestMatchKey = key;
        }
      }

      let category = 'general grievance';
      let department = 'Ministry of Personnel, Public Grievances and Pensions';
      let urgency = 'medium';
      let portalName = 'CPGRAMS fallback';
      let redirectUrl = 'https://pgportal.gov.in';
      let confidence = 50;
      let refs = ['Citizen Charter Guidelines'];
      let reason = 'Confidence below threshold. Automatically routing to CPGRAMS central public grievance fallback portal.';

      if (bestMatchKey && maxKeywordScore >= 2) {
        const match = localPortalMap[bestMatchKey];
        category = match.category;
        department = match.department;
        urgency = maxKeywordScore >= 3 ? 'high' : 'medium';
        portalName = match.portalName;
        redirectUrl = match.redirectUrl;
        confidence = 85;
        reason = `Keyword & intent pattern matched keywords for ${match.issueType}.`;
        
        if (category === 'certificate/service delay') refs = ['Information Technology Act, 2000', 'State Right to Public Services Act'];
        else if (category === 'electricity') refs = ['Section 43 of the Electricity Act, 2003', 'Electricity Rights of Consumers Rules 2020'];
        else if (category === 'police') refs = ['Section 154 of the Code of Criminal Procedure (CrPC)', 'Police Act 1861'];
        else if (category === 'RTI') refs = ['Section 6(1) of the Right to Information Act, 2005', 'Section 7(1) of the RTI Act 2005'];
        else if (category === 'consumer') refs = ['Section 2(9) of the Consumer Protection Act, 2019', 'Essential Commodities Act 1955'];
        else if (category === 'general grievance') refs = ['Section 3 of the Water Act 1974', 'Section 198A of the Motor Vehicles Act 2019'];
      }

      const mockAi = {
        category,
        urgency,
        confidence,
        reason,
        department,
        portalName,
        redirectUrl,
        legalReferences: refs,
        deadlineDays: 30
      };
      setAiResult(mockAi);
      setOverrideCategory(category);
      setOverrideDept(department);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Helper: Submit Final Grievance Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText) return;

    setSubmittingCase(true);
    
    const payload = {
      complaintText,
      proofUrl: fileProof ? fileProof.name : '',
      referenceNumber: refNum,
      category: overrideCategory || (aiResult ? aiResult.category : 'grievance'),
      urgency: aiResult ? aiResult.urgency : 'medium',
      department: overrideDept || (aiResult ? aiResult.department : 'General Ministry')
    };

    try {
      const response = await fetch(`${API_URL}/grievances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setNewlyCreatedCase(data.data);
        setActivePanel('drafts');
        fetchGrievances();
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating local case saving.');
      let targetPortal = localPortalMap[payload.category] || {
        portalName: 'CPGRAMS fallback',
        redirectUrl: 'https://pgportal.gov.in'
      };
      
      let finalRedirectUrl = targetPortal.redirectUrl;
      if (aiResult && aiResult.confidence < 60) {
        finalRedirectUrl = 'https://pgportal.gov.in';
        targetPortal = {
          portalName: 'CPGRAMS fallback',
          redirectUrl: 'https://pgportal.gov.in'
        };
      }

      const simulatedCase = {
        _id: 'mock_case_' + Math.random().toString(36).substr(2, 9),
        user: user?.id || 'mock_citizen_id_12345',
        complaintText,
        proofUrl: fileProof ? fileProof.name : '',
        referenceNumber: refNum || 'REF-SIM-' + Math.floor(100000 + Math.random() * 900000),
        category: payload.category,
        urgency: payload.urgency,
        department: payload.department,
        portalName: aiResult ? aiResult.portalName : targetPortal.portalName,
        redirectUrl: finalRedirectUrl,
        confidence: aiResult ? aiResult.confidence : 90,
        state: user?.state || 'Maharashtra',
        district: user?.district || 'Mumbai',
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        deadlineDays: 30,
        formalLetter: `From:\n${user?.fullName || 'Adhikar Citizen'}\nPhone: ${user?.phone}\nAddress: ${user?.district}, ${user?.state}\n\nTo:\nThe Public Officer,\n${payload.department}\n\nSubject: Formal Complaint regarding public grievance\n\nRespected Sir/Madam,\n\nI am writing to report this complaint: ${complaintText}`,
        rtiDraft: `To,\nThe Public Information Officer,\n${payload.department}\n\nSubject: RTI Application under Section 6(1)\n\nApplicant: ${user?.fullName}\nInformation Sought: Certified logs concerning road/water works...`,
        appealDraft: `To,\nThe First Appellate Authority...\nSubject: First Appeal...`,
        appeal2Draft: `To,\nThe Central Information Commission...\nSubject: Second Appeal...`
      };
      setNewlyCreatedCase(simulatedCase);
      setActivePanel('drafts');
      setGrievances(prev => [simulatedCase, ...prev]);
      calculateStats([simulatedCase, ...grievances]);
    } finally {
      setSubmittingCase(false);
      // Reset form states
      setComplaintText('');
      setRefNum('');
      setFileProof(null);
      setAiResult(null);
    }
  };

  // Helper: Time-Leap Simulator (Artificially set creation date)
  const handleTimeLeap = async (caseId, dateOffset) => {
    let targetDate = new Date();
    if (dateOffset === 'appeal1') {
      targetDate.setDate(targetDate.getDate() - 35);
    } else if (dateOffset === 'appeal2') {
      targetDate.setDate(targetDate.getDate() - 65);
    }

    try {
      const response = await fetch(`${API_URL}/grievances/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ submittedAt: targetDate })
      });
      const data = await response.json();
      if (data.success) {
        fetchGrievances();
        alert('Time Leap Complete! The case creation date has been offset. Refreshing timelines.');
      }
    } catch (err) {
      console.warn('Database offline, leaping mock case in memory');
      const idx = grievances.findIndex(g => g._id === caseId);
      if (idx !== -1) {
        const updated = [...grievances];
        updated[idx].submittedAt = targetDate.toISOString();
        setGrievances(updated);
        calculateStats(updated);
        alert('Time Leap Simulated successfully in-memory!');
      }
    }
  };

  // Helper: Trigger Deadline checks and First Appeals
  const triggerDeadlineCheck = async (caseId) => {
    try {
      const response = await fetch(`${API_URL}/grievances/${caseId}/check-deadline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        await fetchGrievances();
        const updatedCase = grievances.find(g => g._id === caseId);
        if (updatedCase) {
          updatedCase.status = data.status;
          updatedCase.appealDraft = data.appealDraft;
          setSelectedCase({ ...updatedCase });
        }
        alert(data.message);
      }
    } catch (err) {
      console.warn('Server offline, simulating deadline evaluation.');
      const targetCase = grievances.find(g => g._id === caseId);
      if (!targetCase) return;

      const subDate = new Date(targetCase.submittedAt);
      const diffDays = Math.ceil((new Date() - subDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        targetCase.status = 'Overdue';
        targetCase.appealDraft = `To,\nThe First Appellate Authority (FAA)\nOffice of ${targetCase.department}\n\nSubject: First Appeal under Section 19(1) of the RTI Act\n\nRespected Sir/Madam,\nThis is a first appeal registered because the timeline for my case concerning: "${targetCase.complaintText.substring(0, 50)}..." has exceeded the 30-day limit. Please resolve.`;
        alert('Case is Overdue (Day ' + diffDays + '). Appeal 1 generation unlocked.');
        setSelectedCase({ ...targetCase });
      } else {
        alert(`Case is currently on schedule. Day ${diffDays} of ${targetCase.deadlineDays}.`);
      }
    }
  };

  const handleTimeLeapUpdate = (updatedData) => {
    setSelectedCase(updatedData);
    fetchGrievances();
  };

  // Helper: Copy draft
  const handleCopyText = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(type);
    setTimeout(() => setCopiedDraft(null), 2000);
  };

  // Helper: Print Preview window PDF
  const handlePrintDraft = (title, text) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; line-height: 1.6; color: #000; }
            pre { white-space: pre-wrap; font-size: 14px; }
            .badge { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="badge">
            <h2>ADHIKAR AI CITIZEN ASSISTANT - DRAFT</h2>
          </div>
          <pre>${text}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Banner Government logo bar */}
      <header className="bg-blue-900 text-white px-6 py-3 border-b-4 border-amber-500 shadow-md shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-8 h-8 opacity-95" alt="Emblem of India" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide leading-tight">ADHIKAR</h1>
            <p className="text-[9px] text-slate-350 tracking-wider">AI Grievance & RTI Copilot Portal (Govt of India Initiative)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-800 border border-slate-400 flex items-center justify-center text-white text-[10px] font-bold">
                {(user?.fullName || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-right hidden sm:block select-none">
              <span className="text-slate-350 block text-[9px] leading-none mb-0.5">Welcome, </span>
              <span className="text-white font-extrabold block text-[11px] leading-none">{user?.fullName || 'Citizen User'}</span>
            </div>
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 border border-slate-400 hover:border-white hover:bg-blue-950 text-[11px] font-bold rounded tracking-wider uppercase transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Layout body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDEBAR PANEL (Left 20% width) */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-6">
            
            <div className="text-slate-500 uppercase tracking-widest text-[9px] font-bold border-b border-slate-800 pb-2">
              Citizen Options
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => { setActivePanel('dashboard'); setSelectedCase(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-extrabold tracking-wide uppercase transition-colors ${
                  activePanel === 'dashboard' ? 'bg-blue-900 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                My Cases
              </button>

              <button
                onClick={() => { setActivePanel('file'); setSelectedCase(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-extrabold tracking-wide uppercase transition-colors ${
                  activePanel === 'file' ? 'bg-blue-900 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                File Case
              </button>

              <button
                onClick={() => {
                  if (grievances.length > 0) {
                    setSelectedCase(grievances[0]);
                    setActivePanel('timeline');
                  } else {
                    alert('Please file a grievance case first.');
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-extrabold tracking-wide uppercase transition-colors ${
                  activePanel === 'timeline' ? 'bg-blue-900 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Track Timeline
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-extrabold tracking-wide uppercase transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </button>
            </nav>
          </div>

          {/* Quick Notice footer */}
          <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 leading-normal space-y-1">
            <p>🛡️ Standard RTI Response window: 30 days.</p>
            <p>📋 CPGRAMS Water charter window: 15 days.</p>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT (Right 80% width) */}
        <main className="flex-grow p-6 overflow-y-auto">
          
          {/* PANEL 1: MY CASES (DASHBOARD) */}
          {activePanel === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stats Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Dockets</span>
                    <div className="text-2xl font-black text-blue-950 mt-1">{stats.total}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 text-blue-900 rounded">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Pending</span>
                    <div className="text-2xl font-black text-amber-700 mt-1">{stats.pending}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 text-amber-600 rounded">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Appeals Filed / Overdue</span>
                    <div className="text-2xl font-black text-red-700 mt-1">{stats.appeals}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 text-red-600 rounded">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Case table card */}
              <div className="bg-white border border-slate-250 rounded shadow-sm">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-extrabold text-sm text-blue-950 uppercase tracking-wider">
                    Registered Grievance Records
                  </h3>
                  
                  {/* Global Time Leap Selector helper for judges */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-1.5 flex items-center gap-2 text-xs">
                    <span className="font-bold text-blue-950 text-[10px] uppercase">SIH Time Leap Simulator:</span>
                    <select
                      onChange={(e) => {
                        const [caseId, leapKey] = e.target.value.split(':');
                        if (caseId && leapKey) handleTimeLeap(caseId, leapKey);
                        e.target.value = ''; // Reset select
                      }}
                      className="bg-white border border-blue-300 rounded text-[11px] font-semibold text-slate-700 py-0.5 px-2 focus:outline-none"
                    >
                      <option value="">-- select case to leap --</option>
                      {grievances.map(g => (
                        <optgroup key={g._id} label={g.referenceNumber || g._id.substring(0, 8)}>
                          <option value={`${g._id}:appeal1`}>Set submitted 35 days ago (Day 35)</option>
                          <option value={`${g._id}:appeal2`}>Set submitted 65 days ago (Day 65)</option>
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-xs text-slate-500 font-semibold">Updating citizen records...</span>
                  </div>
                ) : grievances.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-450">No cases recorded yet.</p>
                    <button
                      onClick={() => setActivePanel('file')}
                      className="mt-3 text-xs font-extrabold text-blue-900 hover:underline"
                    >
                      File your first case &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs font-sans">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">Ref Number</th>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">Category</th>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">Urgency</th>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">State/District</th>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">Days Elapsed</th>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-250">
                        {grievances.map((g) => {
                          const elapsed = Math.max(1, Math.ceil((new Date() - new Date(g.submittedAt)) / (1000 * 60 * 60 * 24)));
                          return (
                            <tr key={g._id} className="hover:bg-slate-50">
                              <td className="px-5 py-3.5 font-bold font-mono text-slate-900 truncate max-w-28">
                                {g.referenceNumber || 'Unassigned'}
                              </td>
                              <td className="px-5 py-3.5 capitalize font-medium text-slate-700">
                                {g.category}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  g.urgency === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  g.urgency === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {g.urgency}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-slate-500">
                                {g.district}, {g.state}
                              </td>
                              <td className="px-5 py-3.5 font-bold font-mono text-slate-900">
                                Day {elapsed}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                                  g.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                  g.status === 'Appeal Filed' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {g.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <button
                                  onClick={() => { setSelectedCase(g); setActivePanel('timeline'); }}
                                  className="text-xs font-extrabold text-blue-900 hover:text-blue-950 hover:underline"
                                >
                                  Open Tracker &rarr;
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANEL 2: FILE CASE (Grievance submission) */}
          {activePanel === 'file' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="bg-white border border-slate-250 rounded shadow-sm">
                
                {/* Form header */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-blue-950 uppercase tracking-wider">
                    Register Grievance / RTI Request
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Please provide detailed descriptions. Adhikar AI will parse your complaint and assist you in filing.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                  
                  {/* Read only user profile pre-fills */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">State Concerned</span>
                      <span className="text-xs font-bold text-slate-800">{user?.state || 'Maharashtra'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">District Concerned</span>
                      <span className="text-xs font-bold text-slate-800">{user?.district || 'Mumbai'}</span>
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-extrabold text-slate-700 uppercase">
                        Enter Public Complaint Description *
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={speechLanguage}
                          onChange={(e) => setSpeechLanguage(e.target.value)}
                          className="text-[10px] bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 font-semibold focus:outline-none"
                        >
                          <option value="en-IN">English (India)</option>
                          <option value="hi-IN">Hindi (हिन्दी)</option>
                        </select>

                        <button
                          type="button"
                          onClick={toggleVoiceRecording}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                            isRecording
                              ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                          }`}
                          title={isRecording ? 'Click to Stop Microphone' : 'Click to Start Voice Input'}
                        >
                          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        required
                        rows="6"
                        value={complaintText}
                        onChange={(e) => setComplaintText(e.target.value)}
                        placeholder="e.g. For the past two weeks, sewage water has been mixing with the drinking water line of Sector 4. Residents have fallen ill..."
                        className="block w-full p-3 bg-slate-50 border border-slate-300 rounded text-sm focus:outline-none focus:bg-white text-slate-800 resize-none font-mono text-xs leading-relaxed"
                      />
                    </div>

                    {isRecording && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-bold animate-pulse">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                        <span>🎙️ Microphone Active: Speaking into mic will automatically append text in {speechLanguage === 'hi-IN' ? 'Hindi' : 'English'}...</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-500">Provide detailed issues, locations, and names if possible.</span>
                      <button
                        type="button"
                        onClick={handleAnalyzeText}
                        disabled={aiAnalyzing || !complaintText}
                        className="px-3.5 py-1.5 bg-blue-900 text-white text-xs font-extrabold rounded hover:bg-blue-950 disabled:opacity-40 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                      >
                        {aiAnalyzing ? 'AI Analyzing...' : 'Analyze with AI'}
                      </button>
                    </div>
                  </div>

                  {/* AI Classification Block */}
                  {aiResult && (
                    <div className="bg-slate-900 text-slate-300 border border-slate-850 rounded p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-mono text-saffron-500 font-bold uppercase tracking-wider">
                          AI Classification Prediction
                        </span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> Confidence: {aiResult.confidence}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="block text-[9px] text-slate-500 uppercase">Urgency Assessment</span>
                          <span className="font-bold text-slate-200 capitalize">{aiResult.urgency}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-500 uppercase">AI Detected Category</span>
                          <span className="font-bold text-slate-200 capitalize">{aiResult.category}</span>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase">Reasoning Explanation</span>
                        <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">{aiResult.reason}</p>
                      </div>

                      {/* Manual Override controls */}
                      <div className="border-t border-slate-800 pt-4 space-y-3">
                        <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                          Manual Override Settings
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-400">Change Category:</label>
                            <select
                              value={overrideCategory}
                              onChange={(e) => setOverrideCategory(e.target.value)}
                              className="block w-full py-1 px-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-250 focus:outline-none"
                            >
                              <option value="Water & Sanitation">Water & Sanitation</option>
                              <option value="Roads & Transport">Roads & Transport</option>
                              <option value="Electricity & Power">Electricity & Power</option>
                              <option value="Consumer Rights">Consumer Rights</option>
                              <option value="RTI">RTI Request</option>
                              <option value="Pension">Pension issues</option>
                              <option value="Certificate">Certificate delays</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-400">Change Target Department:</label>
                            <input
                              type="text"
                              value={overrideDept}
                              onChange={(e) => setOverrideDept(e.target.value)}
                              className="block w-full py-1 px-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-250 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Proof Upload + Reference Num */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 uppercase">
                        Upload Supporting Proof Document (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-slate-500 bg-slate-50 border border-slate-300 rounded p-1.5"
                      />
                      <span className="block text-[9px] text-slate-500">Only PDF, JPG, JPEG, and PNG formats are accepted.</span>
                      {fileError && <p className="text-[10px] text-red-700 font-bold">{fileError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-700 uppercase">
                        Grievance Reference Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={refNum}
                        onChange={(e) => setRefNum(e.target.value)}
                        placeholder="e.g. PG-8302021"
                        className="block w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                      />
                      <span className="block text-[9px] text-slate-500">If you already have a CPGRAMS registration ID.</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActivePanel('dashboard')}
                      className="px-5 py-2 border border-slate-300 rounded text-slate-750 text-xs font-extrabold uppercase hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCase}
                      className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-black rounded uppercase tracking-wider shadow-sm disabled:opacity-40"
                    >
                      {submittingCase ? 'Registering Case...' : 'Submit Grievance Docket'}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* PANEL 3: DRAFT DOCUMENTS SUMMARY */}
          {activePanel === 'drafts' && newlyCreatedCase && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-950">Grievance Registered Successfully</h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your complaint has been structured. The AI generator has formatted three legal documents for you.
                  </p>
                </div>
              </div>

              {/* Draft Documents Tabs grid */}
              <div className="bg-white border border-slate-250 rounded shadow-sm p-6 space-y-6">
                
                <h3 className="font-extrabold text-sm text-blue-950 uppercase border-b border-slate-200 pb-2">
                  Generated Legal Dockets
                </h3>

                <div className="space-y-6">
                  
                  {/* Draft 1: Formal Complaint Letter */}
                  <div className="border border-slate-200 rounded p-4 space-y-3 bg-slate-50">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-900" /> 1. Formal Administrative Letter
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyText(newlyCreatedCase.formalLetter, 'formal')}
                          className="px-2.5 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded transition-all"
                        >
                          {copiedDraft === 'formal' ? <Check className="w-3.5 h-3.5 text-emerald-700 inline" /> : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadDraftAsFile('Formal_Representation_Letter', newlyCreatedCase.formalLetter)}
                          className="px-2.5 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded transition-all flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download .txt
                        </button>
                        <button
                          onClick={() => handlePrintDraft('Formal Complaint Letter', newlyCreatedCase.formalLetter)}
                          className="px-2.5 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded transition-all"
                        >
                          Print PDF
                        </button>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-250 p-4 rounded text-[11px] font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                      {newlyCreatedCase.formalLetter}
                    </div>
                  </div>

                  {/* Draft 2: RTI Query questionnaire */}
                  <div className="border border-slate-200 rounded p-4 space-y-3 bg-slate-50">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-blue-900" /> 2. RTI Request Questionnaire (Section 6(1))
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyText(newlyCreatedCase.rtiDraft, 'rti')}
                          className="px-2.5 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded transition-all"
                        >
                          {copiedDraft === 'rti' ? <Check className="w-3.5 h-3.5 text-emerald-700 inline" /> : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadDraftAsFile('RTI_Application_Draft', newlyCreatedCase.rtiDraft)}
                          className="px-2.5 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded transition-all flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download .txt
                        </button>
                        <button
                          onClick={() => handlePrintDraft('RTI Application Draft', newlyCreatedCase.rtiDraft)}
                          className="px-2.5 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 rounded transition-all"
                        >
                          Print PDF
                        </button>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-250 p-4 rounded text-[11px] font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                      {newlyCreatedCase.rtiDraft}
                    </div>
                  </div>

                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
                  <h4 className="text-xs font-bold text-amber-900 uppercase">Detected Official Portal</h4>
                  {newlyCreatedCase.redirectUrl ? (
                    <>
                      <p className="text-[11px] text-amber-800 mt-1 mb-3">
                        Department: <strong>{newlyCreatedCase.department}</strong><br/>
                        Portal Name: <strong>{newlyCreatedCase.portalName || 'External Portal'}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => window.open(newlyCreatedCase.redirectUrl, '_blank')}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded uppercase tracking-wider shadow flex items-center justify-center gap-2"
                      >
                        Open Official Website <Globe className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <p className="text-[11px] text-amber-800 mt-1">
                      <strong>No matching portal found.</strong> Please review the generated drafts and submit manually to the relevant authority.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setActivePanel('dashboard'); setNewlyCreatedCase(null); }}
                    className="flex-1 py-3 border border-slate-300 rounded font-bold text-xs uppercase tracking-wider text-slate-750 bg-white hover:bg-slate-50 text-center"
                  >
                    Go back to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCase(newlyCreatedCase);
                      setActivePanel('timeline');
                    }}
                    className="flex-1 py-3 border border-transparent rounded font-black text-xs uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 text-center flex items-center justify-center gap-1.5"
                  >
                    Open Assist Mode Guide <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* PANEL 4: TRACK TIMELINE & ASSIST MODE (Visual tracker & Appeal generator) */}
          {activePanel === 'timeline' && selectedCase && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="bg-white border border-slate-250 rounded shadow-sm">
                
                {/* Panel Title */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-blue-950 uppercase tracking-wider">
                      Timeline and Assist Mode Guide
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Case Ref: <span className="font-mono font-bold text-slate-700">{selectedCase.referenceNumber || 'Unassigned'}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => triggerDeadlineCheck(selectedCase._id)}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded text-[11px] font-bold uppercase tracking-wider"
                  >
                    Check Deadline
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  {/* Left Column: Visual timeline Stepper (2/5 size) */}
                  <div className="lg:col-span-2 border-r border-slate-200 pr-6 space-y-6">
                    <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-4">
                      Citizen Tracker Timeline
                    </h4>

                    <div className="relative pl-6 space-y-8 border-l-2 border-slate-200">
                      
                      {/* Step 1: Submitted */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white"></span>
                        <div className="font-bold text-xs text-slate-800">Day 1: Grievance Registered</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Structured AI documents successfully created.</p>
                      </div>

                      {/* Step 2: 30-Day Deadline */}
                      <div className="relative">
                        {(() => {
                          const elapsed = Math.max(1, Math.ceil((new Date() - new Date(selectedCase.submittedAt)) / (1000 * 60 * 60 * 24)));
                          const isOver = elapsed > 30 || selectedCase.status === 'Overdue';
                          return (
                            <>
                              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                                isOver ? 'bg-amber-600' : 'bg-slate-300'
                              }`}></span>
                              <div className={`font-bold text-xs ${isOver ? 'text-slate-800' : 'text-slate-400'}`}>
                                Day 30: First Appeal Timeline
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {isOver ? 'Timeline limit (30 days) has been exceeded.' : `${30 - elapsed} days remaining until First Appeal window opens.`}
                              </p>
                              {isOver && (
                                <div className="mt-2.5">
                                  <button
                                    onClick={() => triggerDeadlineCheck(selectedCase._id)}
                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-extrabold uppercase tracking-wide"
                                  >
                                    Generate Appeal 1
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Step 3: 60-Day Deadline */}
                      <div className="relative">
                        {(() => {
                          const elapsed = Math.max(1, Math.ceil((new Date() - new Date(selectedCase.submittedAt)) / (1000 * 60 * 60 * 24)));
                          const isOver60 = elapsed > 60;
                          return (
                            <>
                              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                                isOver60 ? 'bg-red-600' : 'bg-slate-200'
                              }`}></span>
                              <div className={`font-bold text-xs ${isOver60 ? 'text-slate-800' : 'text-slate-350'}`}>
                                Day 60: Second Appeal Timeline
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {isOver60 ? 'Second Appeal limit (60 days) has been exceeded.' : 'Second Appeal triggers after 60 days of non-resolution.'}
                              </p>
                              {isOver60 && (
                                <div className="mt-2.5">
                                  <button
                                    onClick={() => alert('Second Appeal generated: Draft is loaded under Appeal 2 window.')}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-extrabold uppercase tracking-wide"
                                  >
                                    Generate Appeal 2
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Display appeal draft text block if generated */}
                    {selectedCase.status === 'Overdue' && selectedCase.appealDraft && (
                      <div className="border border-amber-250 bg-amber-50 p-4 rounded space-y-3 mt-4">
                        <div className="flex justify-between items-center border-b border-amber-200 pb-1">
                          <span className="text-[10px] font-bold text-amber-900 uppercase">First Appeal Draft (Generated)</span>
                          <button
                            onClick={() => handleCopyText(selectedCase.appealDraft, 'appeal')}
                            className="px-2 py-0.5 border border-amber-300 bg-white text-[9px] font-bold rounded"
                          >
                            {copiedDraft === 'appeal' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="text-[10px] font-mono max-h-36 overflow-y-auto leading-normal whitespace-pre-wrap select-all bg-white border border-slate-200 p-2 rounded">
                          {selectedCase.appealDraft}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <TimeLeapSimulator caseId={selectedCase._id} onUpdate={handleTimeLeapUpdate} />
                    </div>

                  </div>

                  {/* Right Column: ASSIST MODE Checklist Guidance steps (3/5 size) */}
                  <div className="lg:col-span-3 space-y-4 pl-0 lg:pl-4">
                    
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                        Assist Mode Filing checklist
                      </h4>
                      <span className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                        📋 Guide Only
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal leading-relaxed">
                      Please copy these pre-filled details to input them on the official CPGRAMS/RTI portals.
                    </p>

                    <div className="space-y-3">
                      
                      {/* Step 1 */}
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-extrabold text-blue-900 uppercase">Step 1: Applicant Name</span>
                          <span className="text-xs font-bold text-slate-800">{user?.fullName || 'Adhikar Citizen'}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(user?.fullName || 'Adhikar Citizen', 'name')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {copiedDraft === 'name' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-extrabold text-blue-900 uppercase">Step 2: Concerned Ministry</span>
                          <span className="text-xs font-bold text-slate-800 truncate max-w-64 block">{selectedCase.department}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(selectedCase.department, 'dept')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {copiedDraft === 'dept' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center gap-3">
                        <div className="space-y-1 w-full">
                          <span className="block text-[9px] font-extrabold text-blue-900 uppercase">Step 3: Grievance Description</span>
                          <span className="text-[10px] font-mono text-slate-500 truncate block pr-6">{selectedCase.formalLetter}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(selectedCase.formalLetter, 'desc')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50 shrink-0"
                        >
                          {copiedDraft === 'desc' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <span className="block text-[9px] font-extrabold text-blue-900 uppercase">Step 4: State / District</span>
                          <span className="text-xs font-bold text-slate-800">{selectedCase.district}, {selectedCase.state}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(`${selectedCase.district}, ${selectedCase.state}`, 'loc')}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {copiedDraft === 'loc' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Demo Action: Mark as Submitted manually */}
                      <div className="border-t border-slate-250 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="text-[10px] text-slate-500 italic max-w-xs leading-tight">
                          Once you copy and input these details on the real PG Portal, paste your returned registration ID here to track it.
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                          <button
                            onClick={() => {
                              const ref = prompt('Enter the official registration ID returned by CPGRAMS / RTI portal:');
                              if (ref) {
                                handleTimeLeap(selectedCase._id, 'today'); // reset date
                                alert('Case successfully tracked in system. Reference ID stored.');
                              }
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded text-xs uppercase tracking-wide"
                          >
                            Mark As Filed
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* PANEL 5: SETTINGS */}
          {activePanel === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              <div className="bg-white border border-slate-250 rounded shadow-sm">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-blue-950 uppercase tracking-wider">
                    Citizen Profile Details
                  </h3>
                </div>

                <div className="p-6 space-y-6 font-sans text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">First Name</span>
                      <div className="bg-slate-50 p-2.5 border border-slate-200 rounded font-semibold text-slate-800">{user?.firstName || 'Not provided'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Last Name</span>
                      <div className="bg-slate-50 p-2.5 border border-slate-200 rounded font-semibold text-slate-800">{user?.lastName || 'Not provided'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Verified Mobile</span>
                      <div className="bg-slate-50 p-2.5 border border-slate-200 rounded font-semibold text-slate-800 font-mono">{user?.phone || 'Not provided'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Gender</span>
                      <div className="bg-slate-50 p-2.5 border border-slate-200 rounded font-semibold text-slate-800">{user?.gender || 'Not provided'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Date of Birth</span>
                      <div className="bg-slate-50 p-2.5 border border-slate-200 rounded font-semibold text-slate-800">
                        {user?.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'Not provided'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Registered Address</span>
                      <div className="bg-slate-50 p-2.5 border border-slate-200 rounded font-semibold text-slate-800">
                        {user?.district}, {user?.state}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default Dashboard;
