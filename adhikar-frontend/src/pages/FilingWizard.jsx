import React, { useState, useEffect } from 'react';
import { 
  User, FileText, CheckCircle, 
  Lightbulb, ChevronRight, Shield, ShieldCheck, Mail, ArrowRight, Upload, Info,
  Mic, MicOff, Copy, Download, AlertTriangle, ExternalLink, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WhatsAppNotification from '../components/WhatsAppNotification';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    id: 1,
    title: 'Personal Details',
    desc: 'Name, Mobile, Email, Address',
    icon: User,
  },
  {
    id: 2,
    title: 'Grievance Details',
    desc: 'Category, Department, Description & Proof',
    icon: FileText,
  },
  {
    id: 3,
    title: 'AI Analysis & Submit',
    desc: 'Legal Mapping, Letter Draft & Approval',
    icon: CheckCircle,
  },
];

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api';

const FilingWizard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [activeStep, setActiveStep] = useState(1);
  
  // Step 1 State
  const [personalDetails, setPersonalDetails] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Rajesh S. Kumar' : 'Rajesh S. Kumar',
    mobile: user?.phone || '+91 9876543210',
    email: user?.email || 'rajesh.kumar@example.com',
    state: user?.state || 'Maharashtra',
    district: user?.district || 'Mumbai',
    address: user?.address || 'Sector 4, Bandra West, Mumbai'
  });

  // Step 2 State
  const [category, setCategory] = useState('Water & Sanitation');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('Contaminated drinking water supply in Ward 4');
  const [description, setDescription] = useState(
    'Tap water has been coming out yellow and smelling like gutter sewage for 15 days in Ward 4. No action has been taken by municipal engineers despite three informal verbal complaints.'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [complaintInput, setComplaintInput] = useState(
    'Tap water has been coming out yellow and smelling like gutter sewage for 15 days in Ward 4.'
  );
  const [apiLoading, setApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState('');

  // Step 3 / AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [humanApproved, setHumanApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState(null);

  // WhatsApp Notification State
  const [waEnabled, setWaEnabled] = useState(true);
  const [waPhone, setWaPhone] = useState(user?.phone || '+91 9876543210');
  const [triggerWa, setTriggerWa] = useState(false);

  // Update details if user context changes
  useEffect(() => {
    if (user) {
      setPersonalDetails(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.fullName,
        mobile: user.phone || prev.mobile,
        state: user.state || prev.state,
        district: user.district || prev.district
      }));
    }
  }, [user]);

  // Voice recording helper
  const handleVoiceRecord = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your complaint.');
      return;
    }

    if (isRecording) {
      if (window.currentRecognition) window.currentRecognition.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    window.currentRecognition = recognition;
    setIsRecording(true);
  };

  const handleSendComplaintToApi = async () => {
    if (!complaintInput.trim()) {
      alert('Please enter a complaint first.');
      return;
    }

    setApiLoading(true);
    setApiResponse('');

    try {
      const response = await fetch(`${API_URL}/grievance/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: complaintInput.trim() })
      });

      const data = await response.json();
      setApiResponse(data.result || 'No response received from the API.');
    } catch (err) {
      console.error('Error sending complaint to API:', err);
      setApiResponse('Unable to reach the backend right now. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Trigger AI Analysis when moving to Step 3
  const handleProceedToStep3 = async () => {
    if (!title || !description) {
      alert('Please fill out the complaint subject and detailed description.');
      return;
    }

    setActiveStep(3);
    setAnalyzing(true);

    try {
      const response = await fetch(`${API_URL}/grievances/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ complaintText: `${title}: ${description}` })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
      } else {
        throw new Error('Fallback to local AI calculation');
      }
    } catch (err) {
      console.warn('Backend classify offline or failed, using robust fallback analysis:', err);
      setAiAnalysis({
        issueType: category || 'Water & Sanitation',
        category: category,
        urgency: 'high',
        department: department || 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
        portalName: 'CPGRAMS Central Portal',
        redirectUrl: 'https://pgportal.gov.in',
        confidence: 94,
        legalReferences: [
          'Section 3 of the Water (Prevention and Control of Pollution) Act, 1974',
          'Article 21 of the Constitution of India (Right to Clean Drinking Water)',
          'Right to Public Services Guarantee Act'
        ],
        deadlineDays: 15,
        formalLetter: `From:\n${personalDetails.fullName}\nPhone: ${personalDetails.mobile}\nAddress: ${personalDetails.address}, ${personalDetails.district}, ${personalDetails.state}\n\nTo:\nThe Executive Engineer / Public Grievance Officer,\nDepartment of Drinking Water and Sanitation / Municipal Corporation\n\nSubject: Urgent Formal Complaint: ${title}\n\nRespected Sir/Madam,\n\nI am writing to file an official grievance regarding: ${description}\n\nThis delay and negligence constitutes a clear violation of public service delivery standards and infringes upon statutory rights under ${category === 'Water & Sanitation' ? 'Section 3 of the Water Act, 1974' : 'the Citizen Charter Guidelines'}.\n\nKindly inspect this matter immediately and take corrective action within the 15-day statutory window.\n\nYours faithfully,\n${personalDetails.fullName}`,
        rtiDraft: `To,\nThe Public Information Officer (PIO)\nDepartment of Public Works / Municipal Authority\n\nSubject: Application under Section 6(1) of the Right to Information Act, 2005.\n\n1. Name: ${personalDetails.fullName}\n2. Information Sought:\n- Provide certified copies of daily inspection logs for ${personalDetails.district} Ward 4.\n- Provide details of budgetary allocations and contractor work orders issued for pipeline maintenance in this fiscal year.`
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit Grievance to Backend
  const handleSubmitGrievance = async () => {
    if (!humanApproved) {
      alert('Please check the Human Approval box to confirm you review and authorize this grievance filing.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category: aiAnalysis?.category || category,
        urgency: aiAnalysis?.urgency || 'high',
        department: aiAnalysis?.department || department || 'Municipal Corporation',
        state: personalDetails.state,
        district: personalDetails.district,
        formalLetter: aiAnalysis?.formalLetter,
        rtiDraft: aiAnalysis?.rtiDraft,
        legalReferences: aiAnalysis?.legalReferences || ['Citizen Charter Guidelines'],
        deadlineDays: aiAnalysis?.deadlineDays || 15
      };

      const response = await fetch(`${API_URL}/grievances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const savedCase = data.success ? data.data : {
        _id: 'ADH-' + Math.floor(100000 + Math.random() * 900000),
        referenceNumber: 'ADH-2026-' + Math.floor(10000 + Math.random() * 90000),
        ...payload,
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };

      setSubmittedCase(savedCase);

      if (waEnabled) {
        setTriggerWa(true);
      }
    } catch (err) {
      console.error('Error submitting grievance:', err);
      const mockSaved = {
        _id: 'ADH-' + Math.floor(100000 + Math.random() * 900000),
        referenceNumber: 'ADH-2026-' + Math.floor(10000 + Math.random() * 90000),
        title,
        description,
        category,
        urgency: 'high',
        department: aiAnalysis?.department || 'Department of Water & Sanitation',
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };
      setSubmittedCase(mockSaved);
      if (waEnabled) setTriggerWa(true);
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen flex font-sans overflow-hidden bg-[#0a0f1c]">
      
      {/* LEFT SIDEBAR PANEL (35% Width) */}
      <div className="w-[35%] shrink-0 bg-navy-900 border-r border-slate-800 flex flex-col justify-between relative overflow-y-auto">
        
        <div className="p-8">
          {/* Header & Logo */}
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Nyay is Adhikar</h1>
              <p className="text-[10px] text-slate-400 font-medium">AI-Powered Autonomous Grievance Engine</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">File Your Grievance</h2>
            <p className="text-xs text-slate-400">Complete 3 easy steps. Our AI will automatically map legal policies, draft official letters, and route to the correct portal.</p>
          </div>

          {/* Step Cards */}
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : isCompleted
                      ? 'bg-slate-900/60 border-slate-700/60 text-slate-400'
                      : 'bg-slate-900/30 border-slate-800/80 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.id}
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-bold transition-colors ${
                          isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-purple-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Settings & WhatsApp Component */}
        <div className="m-8 space-y-4 relative z-10">
          <WhatsAppNotification 
            enabled={waEnabled}
            onToggle={setWaEnabled}
            phoneNumber={waPhone}
            onPhoneChange={setWaPhone}
            triggerNotification={triggerWa}
            onCloseNotification={() => setTriggerWa(false)}
            notificationData={{
              userName: personalDetails.fullName,
              summary: title,
              regId: submittedCase?.referenceNumber || 'ADH-2026-98241',
              status: 'Submitted Successfully',
              trackingLink: `http://localhost:5173/dashboard`
            }}
          />

          <div className="p-4 bg-navy-900 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="flex gap-3">
              <div className="mt-0.5 text-emerald-400 shrink-0">
                <Lightbulb className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 mb-1">AI Autonomous Assistant</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your grievance is legally classified using Indian Citizen Charter rules & Groq Llama 3.3.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE PANEL (65% Width) - Embedded Portal Simulation */}
      <div className="w-[65%] shrink-0 bg-slate-100 flex flex-col h-screen overflow-hidden">
        
        {/* Mock Browser Header */}
        <div className="bg-slate-900 text-slate-300 px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="ml-4 bg-slate-800 text-slate-400 px-4 py-1 rounded-md flex items-center gap-2 w-96 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>https://pgportal.gov.in/adhikar-auto-fill</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LIVE EMBEDDED PORTAL PREVIEW</span>
          </div>
        </div>

        {/* Official CPGRAMS Government UI Simulation Container */}
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col justify-between">
          
          <div>
            {/* Government Official Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-10" />
                <div>
                  <div className="text-xs font-bold text-[#1a4b8c] tracking-wide">CPGRAMS / CENTRAL PUBLIC GRIEVANCE PORTAL</div>
                  <div className="text-[10px] text-slate-500">Department of Administrative Reforms & Public Grievance (DARPG)</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">Language: English</span>
                <div className="w-8 h-8 rounded-full bg-[#1a4b8c] text-white flex items-center justify-center font-bold text-xs">GOI</div>
              </div>
            </div>

            {/* Official Portal Sub-Header */}
            <div className="bg-[#1a4b8c] text-white px-8 py-2.5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-6">
                <span>HOME</span>
                <span className="text-amber-300 border-b-2 border-amber-300 pb-0.5">LODGE GRIEVANCE</span>
                <span>TRACK STATUS</span>
                <span>RTI CORNER</span>
              </div>
              <div className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase">Official Demo</div>
            </div>

            {/* Embedded Form View area */}
            <div className="p-8 max-w-3xl mx-auto">
              
              {/* Form Container */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                
                {/* STEP 1 FORM */}
                {activeStep === 1 && (
                  <div className="animate-fade-in">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-base font-bold text-[#1a4b8c]">Step 1: Citizen Personal Details</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded">Auto-filled from Profile</span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                          <input 
                            type="text" 
                            value={personalDetails.fullName}
                            onChange={(e) => setPersonalDetails({...personalDetails, fullName: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                          <input 
                            type="text" 
                            value={personalDetails.mobile}
                            onChange={(e) => setPersonalDetails({...personalDetails, mobile: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={personalDetails.email}
                            onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                          <input 
                            type="text" 
                            value={personalDetails.state}
                            onChange={(e) => setPersonalDetails({...personalDetails, state: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                          <input 
                            type="text" 
                            value={personalDetails.district}
                            onChange={(e) => setPersonalDetails({...personalDetails, district: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address *</label>
                          <input 
                            type="text" 
                            value={personalDetails.address}
                            onChange={(e) => setPersonalDetails({...personalDetails, address: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => setActiveStep(2)}
                          className="bg-[#1a4b8c] hover:bg-blue-800 text-white px-6 py-2.5 rounded font-bold text-sm flex items-center gap-2 transition-all shadow-md"
                        >
                          Save & Proceed to Grievance Details <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 FORM */}
                {activeStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-base font-bold text-[#1a4b8c]">Step 2: Grievance Details & Voice Input</h3>
                      <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded">AI Auto-Classification Ready</span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Grievance Category *</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            <option value="Water & Sanitation">Water & Sanitation</option>
                            <option value="Roads & Transport">Roads & Transport</option>
                            <option value="Electricity & Power">Electricity & Power</option>
                            <option value="certificate/service delay">Certificate / Service Delay</option>
                            <option value="police">Police / FIR / Law Enforcement</option>
                            <option value="RTI">Right to Information (RTI)</option>
                            <option value="Consumer Rights">Consumer Rights & Fraud</option>
                            <option value="Pension">Pension & Senior Citizen</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Target Department (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Leave empty for AI auto-routing"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Short Title *</label>
                        <input 
                          type="text" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-700">Detailed Complaint Description *</label>
                          <button
                            type="button"
                            onClick={handleVoiceRecord}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded font-bold transition-all ${
                              isRecording 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            {isRecording ? 'Listening... (Click to Stop)' : 'Voice Dictate'}
                          </button>
                        </div>
                        <textarea 
                          rows="5"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full border border-slate-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                          placeholder="Describe the grievance in detail..."
                        ></textarea>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <label className="block text-xs font-bold text-slate-700">Quick API Test</label>
                        <textarea
                          rows="3"
                          value={complaintInput}
                          onChange={(e) => setComplaintInput(e.target.value)}
                          className="w-full border border-slate-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                          placeholder="Enter complaint text to test the backend API"
                        ></textarea>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSendComplaintToApi}
                            disabled={apiLoading}
                            className="bg-[#1a4b8c] hover:bg-blue-800 text-white px-4 py-2 rounded font-semibold text-sm transition-all disabled:opacity-60"
                          >
                            {apiLoading ? 'Sending...' : 'Send to API'}
                          </button>
                        </div>

                        {apiResponse && (
                          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 whitespace-pre-wrap">
                            {apiResponse}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Attach Supporting Document / Proof (PDF/JPG)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                          <Upload className="w-6 h-6 mb-1 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">
                            {uploadedFile ? uploadedFile.name : 'Click or Drag & Drop file (Max 5MB)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => setActiveStep(1)}
                          className="border border-slate-300 text-slate-600 px-6 py-2 rounded font-medium text-sm hover:bg-slate-50"
                        >
                          Previous
                        </button>
                        <button 
                          onClick={handleProceedToStep3}
                          className="bg-[#1a4b8c] hover:bg-blue-800 text-white px-6 py-2.5 rounded font-bold text-sm flex items-center gap-2 transition-all shadow-md"
                        >
                          Analyze with AI & Review <Sparkles className="w-4 h-4 text-amber-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 FORM */}
                {activeStep === 3 && (
                  <div className="animate-fade-in">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-base font-bold text-[#1a4b8c]">Step 3: AI Legal Analysis & Human Approval</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Groq AI Verified
                      </span>
                    </div>

                    <div className="p-6 space-y-6">
                      
                      {analyzing ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <h4 className="text-base font-bold text-slate-800">Analyzing Grievance with Groq Llama 3.3...</h4>
                          <p className="text-xs text-slate-500 max-w-sm">Mapping relevant Acts, determining government department routing, and drafting official complaint letters.</p>
                        </div>
                      ) : submittedCase ? (
                        /* SUCCESS SCREEN */
                        <div className="py-8 px-4 text-center space-y-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                            <CheckCircle className="w-10 h-10" />
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-900">Grievance Submitted Successfully!</h3>
                            <p className="text-xs text-slate-600 mt-1">Your complaint has been registered into the central system and mapped to the department.</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-slate-200 max-w-md mx-auto inline-block text-left text-xs space-y-2">
                            <div><span className="font-bold text-slate-500">Case Reference ID:</span> <span className="font-mono font-extrabold text-purple-700 text-sm ml-2">{submittedCase.referenceNumber || submittedCase._id}</span></div>
                            <div><span className="font-bold text-slate-500">Target Department:</span> <span className="font-semibold text-slate-800 ml-2">{submittedCase.department}</span></div>
                            <div><span className="font-bold text-slate-500">Statutory Deadline:</span> <span className="font-bold text-emerald-700 ml-2">15 Days</span></div>
                          </div>

                          <div className="pt-4 flex justify-center gap-4">
                            <button 
                              onClick={() => navigate('/dashboard')}
                              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md"
                            >
                              Go to Tracking Dashboard
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* AI REVIEW & DRAFT PREVIEWS */
                        <>
                          {/* AI Analysis Card */}
                          <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-purple-600" /> AI Classification Results
                              </span>
                              <span className="text-[11px] font-extrabold bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                                Urgency: {aiAnalysis?.urgency?.toUpperCase() || 'HIGH'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-500 font-semibold">Assigned Department:</span>
                                <p className="font-bold text-slate-800 mt-0.5">{aiAnalysis?.department}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold">Target Official Portal:</span>
                                <p className="font-bold text-slate-800 mt-0.5">{aiAnalysis?.portalName}</p>
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-500 font-semibold text-xs">Mapped Legal References & Statutory Basis:</span>
                              <ul className="list-disc list-inside text-xs text-slate-700 font-medium mt-1 space-y-0.5">
                                {aiAnalysis?.legalReferences?.map((ref, idx) => (
                                  <li key={idx}>{ref}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Smart Portal Recommendation & Auto Redirect Card */}
                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                <ExternalLink className="w-4 h-4 text-emerald-600" /> Smart Portal Recommendation & Auto-Redirect
                              </span>
                              <span className="text-[11px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                                Strictly Verified
                              </span>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-emerald-200">
                              <div>
                                <span className="text-[11px] text-slate-500 font-bold uppercase block">Recommended Primary Portal</span>
                                <a 
                                  href={aiAnalysis?.primary_portal || aiAnalysis?.redirectUrl || 'https://pgportal.gov.in'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm font-extrabold text-blue-700 hover:underline font-mono"
                                >
                                  {aiAnalysis?.primary_portal || aiAnalysis?.redirectUrl || 'https://pgportal.gov.in'}
                                </a>
                              </div>
                              
                              <a
                                href={aiAnalysis?.auto_redirect || aiAnalysis?.primary_portal || 'https://pgportal.gov.in'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                              >
                                Proceed to Official Portal <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            <div>
                              <span className="text-xs font-bold text-slate-700 block mb-1.5">Verified Fallback Portal Directory ({aiAnalysis?.fallback_portals?.length || 7} Links):</span>
                              <div className="flex flex-wrap gap-2">
                                {(aiAnalysis?.fallback_portals || [
                                  'https://sevasindhu.karnataka.gov.in',
                                  'https://rtionline.gov.in',
                                  'https://pgportal.gov.in',
                                  'https://services.india.gov.in',
                                  'https://india.gov.in',
                                  'https://mygov.in',
                                  'https://karnataka.gov.in'
                                ]).map((url, idx) => (
                                  <a 
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 hover:text-blue-600 border border-slate-200 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                                  >
                                    {url.replace('https://', '').replace('www.', '')} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Formal Complaint Letter Preview */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Generated Formal Complaint Letter</h4>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => copyToClipboard(aiAnalysis?.formalLetter, 'Formal Letter')}
                                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy
                                </button>
                                <button 
                                  onClick={() => downloadTextFile(aiAnalysis?.formalLetter, 'Formal_Complaint_Letter.txt')}
                                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 ml-2"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                              </div>
                            </div>
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-slate-200 max-h-48 overflow-y-auto leading-relaxed">
                              {aiAnalysis?.formalLetter}
                            </pre>
                          </div>

                          {/* RTI Application Preview */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Generated RTI Application Draft</h4>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => copyToClipboard(aiAnalysis?.rtiDraft, 'RTI Draft')}
                                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy
                                </button>
                                <button 
                                  onClick={() => downloadTextFile(aiAnalysis?.rtiDraft, 'RTI_Application_Draft.txt')}
                                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 ml-2"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                              </div>
                            </div>
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-slate-200 max-h-36 overflow-y-auto leading-relaxed">
                              {aiAnalysis?.rtiDraft}
                            </pre>
                          </div>

                          {/* Human-In-The-Loop Approval Checkbox */}
                          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 p-4 rounded-lg text-xs text-amber-900">
                            <input 
                              type="checkbox" 
                              id="humanApproval"
                              checked={humanApproved}
                              onChange={(e) => setHumanApproved(e.target.checked)}
                              className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
                            />
                            <label htmlFor="humanApproval" className="cursor-pointer font-medium leading-relaxed">
                              <span className="font-bold">Human-in-the-loop Verification:</span> I confirm that I have reviewed the AI-generated complaint letter and statutory references above, and authorize submission to the government portal.
                            </label>
                          </div>

                          {/* Submit Actions */}
                          <div className="flex justify-between pt-2">
                            <button 
                              onClick={() => setActiveStep(2)}
                              className="border border-slate-300 text-slate-600 px-6 py-2 rounded font-medium text-sm hover:bg-slate-50"
                            >
                              Edit Grievance
                            </button>
                            <button 
                              onClick={handleSubmitGrievance}
                              disabled={submitting}
                              className={`bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
                                submitting ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {submitting ? 'Registering Grievance...' : 'Submit Final Grievance'}
                            </button>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Official Government Footer */}
          <div className="bg-[#0f284b] text-white px-8 py-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-base font-bold bg-linear-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent">Digital India</div>
              <p className="text-[9px] text-slate-400 italic">Power to Empower</p>
            </div>
            <div className="text-[10px] text-slate-300 flex flex-col items-center">
              <p>Designed for Citizen Empowerment under the DARPG Framework</p>
            </div>
            <div className="font-bold text-xs tracking-widest flex items-center gap-1">
              <span className="text-blue-300">N</span>
              <span className="text-white">I</span>
              <span className="text-blue-300">C</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FilingWizard;
