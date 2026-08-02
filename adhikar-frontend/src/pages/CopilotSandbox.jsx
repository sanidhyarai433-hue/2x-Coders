import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Volume2, Clipboard, ChevronRight, Check, ShieldCheck, HelpCircle, ArrowLeft,
  Sparkles, Monitor, Key, Lock, AlertCircle, RefreshCw, Globe, MousePointer, Activity
} from 'lucide-react';

const CopilotSandbox = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Core Sandbox states
  const [complaintText, setComplaintText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  
  // Active step: 
  // 0 = Scan raw complaint
  // 1 = Select Ministry
  // 2 = Paste Description
  // 3 = CAPTCHA Solve
  // 4 = Complete / Success Receipt
  const [activeStep, setActiveStep] = useState(0);
  const [copiedField, setCopiedField] = useState(null);
  
  // Right side portal simulator form states
  const [simDept, setSimDept] = useState('');
  const [simDesc, setSimDesc] = useState('');
  const [simCaptcha, setSimCaptcha] = useState('');
  const [simCaptchaAnswer, setSimCaptchaAnswer] = useState('8K2P9');
  const [simSubmitted, setSimSubmitted] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');

  // Floating cursor simulator states
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);
  const [smartHint, setSmartHint] = useState('');
  
  // Text-To-Speech (audio narrator) state
  const [ttsActive, setTtsActive] = useState(false);

  // DOM Refs for cursor target calculation
  const sandboxRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  const deptSelectRef = useRef(null);
  const descTextareaRef = useRef(null);
  const captchaInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Portal Mappings for AI Scan fallback
  const portalConfigs = {
    "certificate/service delay": {
      category: "certificate/service delay",
      portalName: "Seva Sindhu Portal",
      redirectUrl: "https://sevasindhu.karnataka.gov.in",
      themeColor: "from-blue-600 to-indigo-700",
      accentBg: "bg-blue-50 border-blue-200 text-blue-900",
      accentText: "text-blue-600",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      department: "State Revenue & Public Service Department (Seva Sindhu)",
      logoText: "SEVA SINDHU",
      legalBasis: ["Information Technology Act, 2000", "State Right to Public Services Act (SLA: 15 Days)"]
    },
    "electricity": {
      category: "electricity",
      portalName: "BESCOM Portal",
      redirectUrl: "https://bescom.karnataka.gov.in",
      themeColor: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-50 border-amber-200 text-amber-950",
      accentText: "text-amber-600",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      department: "Ministry of Power / BESCOM DISCOM",
      logoText: "BESCOM ONLINE",
      legalBasis: ["Section 43 of the Electricity Act, 2003 (SLA: 7 Days)", "Electricity (Rights of Consumers) Rules, 2020"]
    },
    "police": {
      category: "police",
      portalName: "Police Portal",
      redirectUrl: "https://ksp.karnataka.gov.in",
      themeColor: "from-indigo-600 to-slate-800",
      accentBg: "bg-indigo-50 border-indigo-200 text-indigo-950",
      accentText: "text-indigo-600",
      badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      department: "State Police Department / Home Affairs",
      logoText: "POLICE CITIZEN CORNER",
      legalBasis: ["Section 154 of the Code of Criminal Procedure (CrPC)", "Police Standards Act, 1861"]
    },
    "RTI": {
      category: "RTI",
      portalName: "RTI portal",
      redirectUrl: "https://rtionline.gov.in",
      themeColor: "from-slate-700 to-slate-900",
      accentBg: "bg-slate-100 border-slate-300 text-slate-900",
      accentText: "text-slate-700",
      badgeColor: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      department: "RTI Online Cell / Respective Public Authority",
      logoText: "RTI ONLINE",
      legalBasis: ["Section 6(1) of the Right to Information Act, 2005", "Section 7(1) of the RTI Act, 2005 (30-day window)"]
    },
    "consumer": {
      category: "consumer",
      portalName: "Consumer portal",
      redirectUrl: "https://edaakhil.nic.in",
      themeColor: "from-emerald-600 to-teal-800",
      accentBg: "bg-emerald-50 border-emerald-200 text-emerald-950",
      accentText: "text-emerald-600",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      department: "Ministry of Consumer Affairs, Food and Public Distribution",
      logoText: "E-DAAKHIL",
      legalBasis: ["Section 2(9) of the Consumer Protection Act, 2019", "Consumer Protection Rules, 2020"]
    },
    "general grievance": {
      category: "general grievance",
      portalName: "Janaspandana",
      redirectUrl: "https://janaspandana.karnataka.gov.in",
      themeColor: "from-saffron-500 to-rose-600",
      accentBg: "bg-orange-50 border-orange-200 text-orange-950",
      accentText: "text-orange-600",
      badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      department: "Department of Administrative Reforms / Municipal Corporation",
      logoText: "JANASPANDANA IPGRS",
      legalBasis: ["Citizen Charter Standard Guidelines", "State Public Grievance Disposal Act"]
    },
    "CPGRAMS fallback": {
      category: "general grievance",
      portalName: "CPGRAMS fallback",
      redirectUrl: "https://pgportal.gov.in",
      themeColor: "from-slate-800 to-slate-950",
      accentBg: "bg-slate-100 border-slate-300 text-slate-900",
      accentText: "text-slate-600",
      badgeColor: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      department: "Ministry of Personnel, Public Grievances and Pensions",
      logoText: "CPGRAMS NATIONAL PORTAL",
      legalBasis: ["Central Public Grievance Redress System Guidelines (30-day resolution)"]
    }
  };

  // Sample Cases to inject
  const sampleComplaints = [
    {
      title: "Caste Certificate Application Delay",
      text: "I applied for my income and caste certificate on Seva Sindhu 45 days ago (Application Ref: RD-829103). The Revenue Nodal Officer has not forwarded the file. Tahsildar office refuses to reply.",
      category: "certificate/service delay"
    },
    {
      title: "Daily Power Cuts & Voltage Fluctuations",
      text: "Our building in Ward 4 experiences frequent power cuts daily between 7 PM and 11 PM. Fluctuations are so bad that my refrigerator compressor failed yesterday. BESCOM engineers refuse to attend calls.",
      category: "electricity"
    },
    {
      title: "Cyber Theft / Wallet Fraud FIR",
      text: "Rs. 25,000 was debited from my savings account through a fraudulent UPI link today. The local police station refuses to file an FIR, telling me to contact the bank instead.",
      category: "police"
    },
    {
      title: "RTI Request for Municipal Audit",
      text: "I seek certified copies of the contractor agreements, final budgets, and quality check logs for the asphalt road laying in Sector 4 completed on June 2026. Request under Section 6(1) of RTI Act.",
      category: "RTI"
    },
    {
      title: "Warranty Claim Rejected",
      text: "I purchased an air conditioner on July 10, 2026, with a 2-year comprehensive warranty. It stopped cooling last week. The seller refuses to replace it and is overcharging for repairs.",
      category: "consumer"
    }
  ];

  // Narration helper using browser speech synthesis
  const speakNarrator = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.05;
      utterance.onstart = () => setTtsActive(true);
      utterance.onend = () => setTtsActive(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Run the simulated AI Scan matrix scanning
  const runAiScan = (text) => {
    if (!text || text.trim().length < 10) return;
    setIsScanning(true);
    setScanProgress(0);
    speakNarrator("Starting Adhikar AI Cognitive Scanner. Mapping your grievance intent to predefined administrative categories.");

    // Progress bar simulation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => finalizeScan(text), 400);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const finalizeScan = (text) => {
    setIsScanning(false);
    
    // Keyword analysis locally to match category
    const textLower = text.toLowerCase();
    let detectedCat = "CPGRAMS fallback";

    if (textLower.includes("certificate") || textLower.includes("seva sindhu") || textLower.includes("caste") || textLower.includes("service delay")) {
      detectedCat = "certificate/service delay";
    } else if (textLower.includes("electricity") || textLower.includes("power") || textLower.includes("transformer") || textLower.includes("voltage") || textLower.includes("bescom")) {
      detectedCat = "electricity";
    } else if (textLower.includes("police") || textLower.includes("fir") || textLower.includes("theft") || textLower.includes("stolen") || textLower.includes("assault")) {
      detectedCat = "police";
    } else if (textLower.includes("rti") || textLower.includes("right to information") || textLower.includes("section 6")) {
      detectedCat = "RTI";
    } else if (textLower.includes("consumer") || textLower.includes("warranty") || textLower.includes("refund") || textLower.includes("merchant")) {
      detectedCat = "consumer";
    } else if (textLower.includes("water") || textLower.includes("sewage") || textLower.includes("road") || textLower.includes("pothole") || textLower.includes("garbage")) {
      detectedCat = "general grievance";
    }

    const config = portalConfigs[detectedCat];
    const generatedLetter = `FROM:\nAdhikar Demo Citizen\nPhone: +91 98765 43210\n\nTO:\nThe Public Grievance Nodal Officer,\n${config.department}\n\nSUBJECT: Formal Citizen Representation regarding ${detectedCat.toUpperCase()} issue.\n\nCOMPLAINT DESCRIPTION:\n${text}\n\nLEGAL REMEDIES CITED:\n${config.legalBasis.map(x => `- ${x}`).join('\n')}\n\nKindly resolve this at the earliest.\n\nYours faithfully,\nAdhikar Citizen`;

    setAiResult({
      config,
      text,
      generatedLetter
    });
    
    setActiveStep(1);
    setSmartHint(`AI Decoded Category: "${config.category.toUpperCase()}". Target Portal identified as "${config.portalName}". Click "Continue with this procedure" to proceed.`);
    speakNarrator(`Scan completed with ninety four percent confidence. Mapped to ${config.portalName} under category ${config.category}.`);
  };

  // Animate the cursor to glide from Left panel button to Right panel form input
  const animateCursorToTarget = (targetRef, callback) => {
    if (!targetRef.current || !sandboxRef.current) return;

    setCursorVisible(true);
    setSmartHint("Anti-Gravity Auto-pilot engaged. Simulating cursor movement...");
    
    // Get sandbox container offset
    const sandboxRect = sandboxRef.current.getBoundingClientRect();
    
    // Position start at a relative point on the left side
    const startX = sandboxRect.width * 0.25;
    const startY = window.innerHeight * 0.5;

    // Set initial position
    setCursorPos({ x: startX, y: startY });

    // Force reflow
    setTimeout(() => {
      // Get target input box center relative to sandbox container
      const targetRect = targetRef.current.getBoundingClientRect();
      const targetX = targetRect.left - sandboxRect.left + (targetRect.width / 2);
      const targetY = targetRect.top - sandboxRect.top + (targetRect.height / 2);

      // Slide to target
      setCursorPos({ x: targetX, y: targetY });

      // Click event timing
      setTimeout(() => {
        setCursorClicking(true);
        setTimeout(() => {
          setCursorClicking(false);
          setCursorVisible(false);
          if (callback) callback();
        }, 300);
      }, 1250); // Matches glide transitions
    }, 50);
  };

  // Simulates character-by-character typing animation
  const typeTextSimulated = (text, updateFn, doneCallback) => {
    let index = 0;
    const chunk = Math.ceil(text.length / 25); // Faster typing chunks for large text
    const interval = setInterval(() => {
      index += chunk;
      if (index >= text.length) {
        updateFn(text);
        clearInterval(interval);
        if (doneCallback) doneCallback();
      } else {
        updateFn(text.substring(0, index));
      }
    }, 45);
  };

  // The BIG BUTTON action to guide users step by step
  const handleContinueProcedure = () => {
    if (activeStep === 0) {
      if (!complaintText) return;
      runAiScan(complaintText);
    } else if (activeStep === 1) {
      // Step 1: Select Ministry
      const deptValue = aiResult.config.department;
      animateCursorToTarget(deptSelectRef, () => {
        setSimDept(deptValue);
        setActiveStep(2);
        setSmartHint("Ministry successfully selected! Step 2: Auto-filling the legal-basis complaint description.");
        speakNarrator("Step one completed. Mapped department has been selected on the portal.");
      });
    } else if (activeStep === 2) {
      // Step 2: Paste Description
      const descValue = aiResult.generatedLetter;
      animateCursorToTarget(descTextareaRef, () => {
        typeTextSimulated(descValue, setSimDesc, () => {
          setActiveStep(3);
          setSmartHint("Grievance description formatted and auto-typed. Step 3: Please solve the CAPTCHA manually.");
          speakNarrator("Step two completed. Law-linked complaint representation has been filled in. For security validation, please solve the CAPTCHA code manually.");
        });
      });
    } else if (activeStep === 3) {
      // Step 3: Point to Captcha
      animateCursorToTarget(captchaInputRef, () => {
        captchaInputRef.current.focus();
        setSmartHint("Security validation focused. Enter the CAPTCHA code shown next to it and press Submit.");
      });
    }
  };

  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    setSimError('');

    if (!simDept) {
      setSimError('Please select the Ministry/Department first.');
      return;
    }
    if (!simDesc || simDesc.length < 20) {
      setSimError('Grievance description field must be populated.');
      return;
    }
    if (simCaptcha !== simCaptchaAnswer) {
      setSimError('Invalid CAPTCHA code. Verification failed.');
      return;
    }

    setSimLoading(true);
    speakNarrator("Registering grievance parameters into security registry database.");
    
    setTimeout(() => {
      setSimSubmitted(true);
      setSimLoading(false);
      setActiveStep(4);
      setSmartHint("Grievance Filed! Official receipt logged securely under Indian administrative protocols.");
      speakNarrator("Registration successful. Grievance has been logged and reference ticket generated.");
    }, 1800);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const selectSample = (sample) => {
    setComplaintText(sample.text);
    setSmartHint(`Sample Loaded: "${sample.title}". Click "Engage AI Classifier" to run matrix mapping.`);
    speakNarrator(`Sample grievance loaded: ${sample.title}`);
  };

  const refreshCaptcha = () => {
    const codes = ['8K2P9', 'XY74Q', 'MN98Z', '3P5TR', 'DK89W'];
    const newCode = codes[Math.floor(Math.random() * codes.length)];
    setSimCaptchaAnswer(newCode);
    setSimCaptcha('');
  };

  return (
    <div 
      ref={sandboxRef}
      className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-slate-950 text-slate-150 relative overflow-hidden font-sans"
    >
      {/* MOCK CURSOR ELEMENT */}
      {cursorVisible && (
        <div 
          className={`absolute pointer-events-none z-50 transition-all duration-[1250ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
            cursorClicking ? 'scale-75' : 'scale-100'
          }`}
          style={{ 
            left: `${cursorPos.x}px`, 
            top: `${cursorPos.y}px`,
            transform: 'translate(-6px, -4px)' 
          }}
        >
          <MousePointer className="w-5 h-5 text-saffron-500 fill-saffron-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] animate-pulse" />
          {cursorClicking && (
            <div className="absolute top-1 left-1 w-8 h-8 -translate-x-1/2 -translate-y-1/2 border border-saffron-500 rounded-full animate-ping"></div>
          )}
        </div>
      )}

      {/* LEFT PANEL: ADHIKAR ANTI-GRAVITY COPILOT (45% Width) */}
      <div 
        ref={leftPanelRef}
        className="w-full lg:w-[45%] bg-slate-900/90 border-r border-slate-800/80 p-6 flex flex-col justify-between overflow-y-auto backdrop-blur-md relative select-none"
      >
        <div className="space-y-6">
          {/* Dashboard Back Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-saffron-400 font-mono font-bold uppercase tracking-wider shadow">
              <Activity className="w-3.5 h-3.5 text-saffron-500 animate-pulse" /> Copilot Sandbox
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-saffron-500 fill-saffron-500/10" />
              Anti-Gravity Copilot Assistant
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Experience zero-friction administrative filing. Input your grievance below, then let Adhikar AI auto-route and fill the portal form dynamically.
            </p>
          </div>

          {/* Smart Contextual Hint Bar */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 shadow-inner">
            <HelpCircle className="w-5 h-5 text-saffron-500 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-saffron-500 uppercase tracking-widest">Smart Hints & Info</span>
              <p className="text-xs text-slate-300 leading-normal font-medium">
                {smartHint || "Engage the scanner by inputting a grievance or selecting one of the simulated templates."}
              </p>
            </div>
          </div>

          {/* STEP 0: AI Grievance Scanner (Visible before mapping is finished) */}
          {activeStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                  Select A Demo Complaint Template
                </label>
                <div className="flex flex-wrap gap-2">
                  {sampleComplaints.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSample(sample)}
                      className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-lg text-[11px] font-semibold text-slate-300 transition-all active:scale-[0.98]"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                  Or Describe Custom Grievance
                </label>
                <textarea
                  rows="4"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Explain your problem (e.g. Electricity bill overcharge, delayed birth certificate, road repair negligence)..."
                  className="block w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs leading-relaxed"
                />
              </div>

              {isScanning ? (
                <div className="space-y-2 bg-slate-950 p-4 border border-slate-855 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-mono text-saffron-500 uppercase">
                    <span>Mapping intent...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-saffron-500 to-amber-500 rounded-full transition-all duration-75"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => runAiScan(complaintText)}
                  disabled={!complaintText || complaintText.trim().length < 10}
                  className="w-full py-3.5 px-4 bg-linear-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-xl shadow-saffron-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  Engage AI Classifier
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          )}

          {/* Stepper Steps (Visible after mapping is finished) */}
          {activeStep > 0 && aiResult && (
            <div className="space-y-3.5 animate-scale-up">
              
              {/* Target Portal Mapped Card */}
              <div className="bg-slate-950/85 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-saffron-500 uppercase tracking-widest">Mapping Analysis Target</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-ashoka-500/10 text-emerald-400 border border-ashoka-500/20">
                    94% confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3.5 text-xs font-medium">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Target Portal</span>
                    <span className="text-slate-200 font-extrabold">{aiResult.config.portalName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Service Category</span>
                    <span className="text-slate-200 font-extrabold capitalize">{aiResult.config.category}</span>
                  </div>
                </div>
                <div className="border-t border-slate-900 pt-2.5">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase mb-1">CITED STATUTE REMEDIES</span>
                  <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                    {aiResult.config.legalBasis.map((law, i) => (
                      <li key={i}>{law}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step 1 Selector */}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 1 ? 'bg-saffron-950/10 border-saffron-500/50 shadow-lg shadow-saffron-950/10' : 'bg-slate-850/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeStep > 1 ? 'bg-emerald-500 text-slate-950' : 'bg-saffron-500 text-slate-950'
                  }`}>
                    {activeStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${activeStep === 1 ? 'text-slate-100' : 'text-slate-500'}`}>
                    Select Target Department
                  </h4>
                </div>
                {activeStep === 1 && (
                  <div className="mt-3 pl-8 text-xs space-y-2">
                    <p className="text-slate-400 leading-relaxed">
                      Select the correct department in the portal drop-down list on the right.
                    </p>
                    <div className="bg-slate-950 border border-slate-855 p-2.5 rounded-lg font-mono text-[10px] flex justify-between items-center text-slate-200">
                      <span className="truncate mr-2">{aiResult.config.department}</span>
                      <button 
                        onClick={() => copyToClipboard(aiResult.config.department, 'dept')}
                        className="p-1.5 bg-slate-800 hover:bg-slate-755 rounded text-saffron-500"
                        title="Copy"
                      >
                        {copiedField === 'dept' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 Description */}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 2 ? 'bg-saffron-950/10 border-saffron-500/50 shadow-lg shadow-saffron-950/10' : 'bg-slate-850/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeStep > 2 ? 'bg-emerald-500 text-slate-950' : activeStep === 2 ? 'bg-saffron-500 text-slate-950' : 'bg-slate-800 text-slate-605'
                  }`}>
                    {activeStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${activeStep === 2 ? 'text-slate-100' : 'text-slate-500'}`}>
                    Paste Complaint details
                  </h4>
                </div>
                {activeStep === 2 && (
                  <div className="mt-3 pl-8 text-xs space-y-2">
                    <p className="text-slate-400 leading-relaxed">
                      Copy the generated legal representation and type it inside the portal description area.
                    </p>
                    <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-300 relative">
                      <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap font-mono text-[9px] leading-relaxed pr-6">
                        {aiResult.generatedLetter}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(aiResult.generatedLetter, 'desc')}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-750 rounded text-saffron-500"
                        title="Copy"
                      >
                        {copiedField === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3 Solve Captcha */}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${
                activeStep === 3 ? 'bg-saffron-950/10 border-saffron-500/50 shadow-lg shadow-saffron-950/10' : 'bg-slate-850/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeStep > 3 ? 'bg-emerald-500 text-slate-950' : activeStep === 3 ? 'bg-saffron-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                  }`}>
                    {activeStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                  </div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${activeStep === 3 ? 'text-slate-100' : 'text-slate-500'}`}>
                    CAPTCHA Verification
                  </h4>
                </div>
                {activeStep === 3 && (
                  <div className="mt-3 pl-8 text-xs space-y-2">
                    <p className="text-slate-400 leading-relaxed">
                      Administrative security locks require manual validation. Read the CAPTCHA code and type it in.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Floating guidance Action Center containing the BIG BUTTON */}
        <div className="mt-8 border-t border-slate-800/80 pt-5 space-y-4">
          {activeStep > 0 && activeStep < 4 && (
            <button
              onClick={handleContinueProcedure}
              className="w-full py-4 px-4 bg-linear-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all duration-300 shadow-xl shadow-saffron-500/20 hover:shadow-saffron-500/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue with this procedure
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}

          {activeStep === 4 && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4.5 space-y-3.5 animate-scale-up">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" /> Grievance Filed Successfully
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The mock submission was logged into the portal receipt list. You can track this case from the main panel.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 text-xs font-black uppercase rounded-lg hover:bg-emerald-450 transition-colors"
              >
                Go back to Dashboard
              </button>
            </div>
          )}

          <div className="text-[9px] text-slate-550 leading-normal flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0 text-slate-655" />
            <span>
              <strong>Privacy Protocol Active</strong>: The split screen acts inside a local sandbox frame. No credentials or biometrics leave your browser context.
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: DUMMY GOVERNMENT PORTAL SIMULATOR (55% Width) */}
      <div 
        ref={rightPanelRef}
        className="w-full lg:w-[55%] bg-slate-950 p-6 flex flex-col justify-between relative"
      >
        <div className="border border-slate-800/80 rounded-2xl flex-1 flex flex-col overflow-hidden bg-slate-900/20 shadow-2xl relative">
          
          {/* Mock Browser Header URL Bar */}
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center gap-4 shrink-0 backdrop-blur select-none">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 bg-red-500/60 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500/60 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500/60 rounded-full"></span>
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-850 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-500 flex items-center gap-1.5 select-none overflow-hidden truncate">
              <Lock className="w-3.5 h-3.5 text-slate-605 shrink-0" />
              <span className="truncate">
                {aiResult 
                  ? `${aiResult.config.redirectUrl}/Entry` 
                  : "https://pgportal.gov.in/GrievanceEntry"}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-[9px] text-slate-400 font-mono shrink-0">
              <Monitor className="w-3 h-3 shrink-0" /> Portal Simulator
            </div>
          </div>

          {/* Portal Page Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-850 p-6">
            
            {activeStep === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
                <div className="w-16 h-16 rounded-full bg-slate-200/50 border-2 border-dashed border-slate-450 flex items-center justify-center text-slate-400">
                  <Activity className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-extrabold text-slate-800">Awaiting AI Mapping Intent</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Write or select a complaint template on the left panel, and click "Engage AI Classifier" to boot up this portal's layout.
                  </p>
                </div>
              </div>
            )}

            {activeStep > 0 && aiResult && !simSubmitted && (
              <form onSubmit={handleSimulateSubmit} className="space-y-5 animate-scale-up">
                
                {/* Government Portal Logo / Header Banner */}
                <div className={`pb-3 border-b-4 flex flex-col sm:flex-row justify-between items-center gap-3 select-none ${
                  aiResult.config.category === 'certificate/service delay' ? 'border-blue-600' :
                  aiResult.config.category === 'electricity' ? 'border-amber-500' :
                  aiResult.config.category === 'police' ? 'border-indigo-600' :
                  aiResult.config.category === 'RTI' ? 'border-slate-700' :
                  aiResult.config.category === 'consumer' ? 'border-emerald-600' :
                  'border-orange-500'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                      className="w-10 h-10 opacity-90 select-none pointer-events-none" 
                      alt="Govt Logo" 
                    />
                    <div>
                      <h3 className="font-black text-[13px] tracking-wide text-slate-900 uppercase">
                        {aiResult.config.logoText}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-550">Government Portal Registry Desk</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Official Grievance Entry Desk
                  </span>
                </div>

                {/* Validation Advice Alert Box */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>
                    <strong>Field Validation Active</strong>: Ensure you fill the mapped Ministry and paste the structured details before entering CAPTCHA.
                  </span>
                </div>

                {/* Input 1: Ministry Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-700 uppercase">
                    1. Ministry / Department Concerned <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    ref={deptSelectRef}
                    value={simDept}
                    onChange={(e) => setSimDept(e.target.value)}
                    className={`block w-full py-2.5 px-3 bg-white border rounded shadow-sm text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-semibold ${
                      simDept === aiResult.config.department 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900' 
                        : 'border-slate-300 text-slate-700'
                    }`}
                  >
                    <option value="">-- SELECT MINISTRY / BOARD --</option>
                    <option value={aiResult.config.department}>{aiResult.config.department}</option>
                    <option value="Ministry of General Administration / Central Fallback">Ministry of General Administration</option>
                    <option value="Ministry of Information Technology">Ministry of Information Technology</option>
                    <option value="Department of Urban Planning and Services">Department of Urban Planning and Services</option>
                  </select>
                </div>

                {/* Input 2: Grievance Text Area */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-700 uppercase">
                    2. Detailed Description of Grievance <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    ref={descTextareaRef}
                    rows="6"
                    value={simDesc}
                    onChange={(e) => setSimDesc(e.target.value)}
                    placeholder="Provide description..."
                    className={`block w-full p-3 bg-white border rounded shadow-sm text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      simDesc.includes("LEGAL REMEDIES CITED")
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900' 
                        : 'border-slate-300 text-slate-700'
                    }`}
                  />
                </div>

                {/* Dummy File Upload Section */}
                <div className="space-y-1 select-none pointer-events-none">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">
                    3. Upload Supporting Document (PDF Only, Max 4MB)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      disabled 
                      placeholder="No file chosen" 
                      className="flex-1 py-1.5 px-3 bg-slate-100 border border-slate-350 rounded text-[11px] text-slate-550" 
                    />
                    <button type="button" className="px-4 py-1.5 border border-slate-300 bg-slate-200 text-slate-600 text-xs font-bold rounded">
                      Browse
                    </button>
                  </div>
                </div>

                {/* Input 3: CAPTCHA Solver Box */}
                <div className="border border-slate-200 bg-slate-100 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between select-none">
                  <div className="space-y-1 shrink-0">
                    <label className="block text-[10px] font-black text-slate-700 uppercase">
                      4. Captcha Verification <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        ref={captchaInputRef}
                        type="text"
                        required
                        value={simCaptcha}
                        onChange={(e) => setSimCaptcha(e.target.value)}
                        placeholder="Type Code"
                        className={`w-28 py-2 px-3 bg-white border rounded text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold ${
                          simCaptcha === simCaptchaAnswer 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                            : 'border-slate-350'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="p-2 text-slate-650 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-colors"
                        title="Refresh CAPTCHA"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-slate-50 font-black tracking-widest text-lg px-4 py-2 rounded shadow-inner font-mono select-none">
                      {simCaptchaAnswer}
                    </div>
                    <span className="text-[9px] text-slate-500 max-w-24 leading-snug">
                      Captcha checks prevent automated script spam.
                    </span>
                  </div>
                </div>

                {simError && (
                  <div className="bg-red-55 border border-red-200 text-red-750 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-650" />
                    <span>{simError}</span>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 select-none">
                  <button
                    ref={submitButtonRef}
                    type="submit"
                    disabled={simLoading}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded shadow text-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {simLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    SUBMIT GRIEVANCE
                  </button>
                </div>

              </form>
            )}

            {/* Simulated Receipt screen on Submission success */}
            {simSubmitted && aiResult && (
              <div className="max-w-xl mx-auto space-y-5 py-4 animate-scale-up select-none">
                <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 p-4 rounded-xl flex gap-3 items-start shadow-sm">
                  <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-600" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">Registration Acknowledged</h4>
                    <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                      Your complaint has been successfully registered on the portal. An official reference receipt code is generated.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-5 space-y-4">
                  <div className="border-b border-slate-200 pb-2.5 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Citizen Service Receipt</span>
                    <span className="text-[10px] font-mono font-bold text-slate-700">
                      Date: {new Date().toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-y-3.5 gap-x-2 text-[11px] font-sans pb-2">
                    <div className="text-slate-500 font-bold col-span-1">Ticket Reference:</div>
                    <div className="text-emerald-700 font-black col-span-2 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block self-start">
                      REG-{Math.floor(1000000 + Math.random() * 9000000)}
                    </div>

                    <div className="text-slate-500 font-bold col-span-1">Registered Complainant:</div>
                    <div className="text-slate-900 font-extrabold col-span-2">Adhikar Citizen</div>

                    <div className="text-slate-500 font-bold col-span-1">Nodal Ministry:</div>
                    <div className="text-slate-900 font-extrabold col-span-2 leading-tight">{simDept}</div>

                    <div className="text-slate-500 font-bold col-span-1">Portal Source:</div>
                    <div className="text-slate-900 font-extrabold col-span-2">{aiResult.config.portalName}</div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Grievance Record log</div>
                    <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[9px] text-slate-700 font-mono max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                      {simDesc}
                    </div>
                  </div>
                </div>

                <p className="text-center text-[9px] text-slate-500 leading-normal">
                  🛡️ Simulated receipt generated locally to verify integration compatibility.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default CopilotSandbox;
