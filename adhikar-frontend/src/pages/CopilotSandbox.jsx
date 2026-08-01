import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Volume2, Clipboard, ChevronRight, Check, ShieldCheck, HelpCircle, ArrowLeft,
  Sparkles, Monitor, Key, Lock, AlertCircle, RefreshCw
} from 'lucide-react';

const CopilotSandbox = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Copilot step index: 0 = Ministry select, 1 = Description paste, 2 = Captcha & Submit
  const [activeStep, setActiveStep] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  // Simulator Form State
  const [simDept, setSimDept] = useState('');
  const [simDesc, setSimDesc] = useState('');
  const [simCaptcha, setSimCaptcha] = useState('');
  const [simCaptchaAnswer, setSimCaptchaAnswer] = useState('8K2P9');
  const [simSubmitted, setSimSubmitted] = useState(false);
  const [simError, setSimError] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  
  // Audio Guideline Narrator
  const [ttsActive, setTtsActive] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchGrievance = async () => {
      try {
        const response = await fetch(`${API_URL}/grievances/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setGrievance(data.data);
        }
      } catch (err) {
        console.warn('Backend server offline. Simulating grievance retrieval.');
        // Fallback detail matching
        const mockGrievance = {
          _id: id,
          title: 'High Fluoride and Sewage Mixing in Municipal Water',
          description: 'SUBJECT: Complaint regarding High Fluoride and Sewage Mixing in Municipal Water.\n\nDETAILS: Since July 15, the municipal tap water has been dark yellow and smelling of sewage. Multiple children in ward 4 have fallen ill.\n\nLEGAL BASIS: Section 3 of the Water Act, 1974; Article 21 of the Constitution (Right to Clean Water)',
          category: 'Water & Sanitation',
          ministry: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
          status: 'Ready to File',
          legalReferences: [
            'Section 3 of the Water Act, 1974',
            'Article 21 of the Constitution (Right to Clean Water)'
          ],
          copilotSteps: [
            {
              field: 'Ministry/Department',
              value: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
              helpText: 'Search and select "Ministry of Jal Shakti" inside the Department list.',
              selector: '#department'
            },
            {
              field: 'Grievance Description',
              value: 'SUBJECT: Complaint regarding High Fluoride and Sewage Mixing in Municipal Water.\n\nDETAILS: Since July 15, the municipal tap water has been dark yellow and smelling of sewage. Multiple children in ward 4 have fallen ill.\n\nLEGAL BASIS: Section 3 of the Water Act, 1974; Article 21 of the Constitution (Right to Clean Water)',
              helpText: 'Copy the AI-formatted text and paste it into the Grievance Description field.',
              selector: '#desc'
            }
          ]
        };
        setGrievance(mockGrievance);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievance();
  }, [id, token]);

  const speakGuidance = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.onstart = () => setTtsActive(true);
      utterance.onend = () => setTtsActive(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported on this browser.');
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleNextStep = () => {
    let nextAudio = '';
    if (activeStep === 0) {
      setActiveStep(1);
      nextAudio = 'Step 2: Copy the AI-structured grievance description from the left and paste it into the Grievance Description field in the PG Portal on the right.';
    } else if (activeStep === 1) {
      setActiveStep(2);
      nextAudio = 'Step 3: Because official portals require safety validation, please read the captcha code on the right and type it in. Then click Submit Grievance.';
    }
    if (nextAudio) speakGuidance(nextAudio);
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    setSimError('');

    if (!simDept) {
      setSimError('Please select the Ministry first.');
      return;
    }
    if (!simDesc || simDesc.length < 20) {
      setSimError('Please paste the structured Grievance Description.');
      return;
    }
    if (simCaptcha !== simCaptchaAnswer) {
      setSimError('Invalid Captcha. Please enter the exact code shown.');
      return;
    }

    setSimLoading(true);
    // Simulate API delay
    setTimeout(async () => {
      setSimSubmitted(true);
      setSimLoading(false);
      
      const officialRegNum = 'PMOPG/E/2026/' + Math.floor(100000 + Math.random() * 900000);

      // Call backend to update status & add tracking number
      try {
        await fetch(`${API_URL}/grievances/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: 'Filed',
            trackingNumber: officialRegNum
          })
        });
      } catch (err) {
        console.warn('Backend server offline during status update. Saved in-memory.');
      }
    }, 1500);
  };

  const refreshCaptcha = () => {
    const codes = ['8K2P9', 'XY74Q', 'MN98Z', '3P5TR'];
    const newCode = codes[Math.floor(Math.random() * codes.length)];
    setSimCaptchaAnswer(newCode);
    setSimCaptcha('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Synchronizing Copilot Sandbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-slate-950 border-t border-slate-900 font-sans">
      
      {/* LEFT PANEL: ADHIKAR COPILOT ASSISTANT (40% width) */}
      <div className="w-full lg:w-[40%] bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-850 border border-slate-750 text-[10px] text-saffron-500 font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500/10" /> Copilot Active
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-100">{grievance.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Copilot assists you in submitting this complaint directly to the government portal. Follow the checklist steps.
            </p>
          </div>

          {/* Stepper Guide */}
          <div className="space-y-3">
            
            {/* Step 1: Ministry Dropdown */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              activeStep === 0 ? 'bg-saffron-950/20 border-saffron-500/50 shadow-md' : 'bg-slate-850/60 border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep > 0 ? 'bg-ashoka-500 text-slate-950' : 'bg-saffron-500 text-slate-950'
                  }`}>
                    {activeStep > 0 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <h4 className={`text-sm font-bold ${activeStep === 0 ? 'text-slate-100' : 'text-slate-400'}`}>
                    Select Ministry/Department
                  </h4>
                </div>
                {activeStep === 0 && (
                  <button
                    onClick={() => speakGuidance('Step 1: Copy the mapped department on the left, and choose it in the ministry dropdown box on the right screen.')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Speak guidance text"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {activeStep === 0 && (
                <div className="mt-3.5 space-y-3 text-xs pl-9">
                  <p className="text-slate-400 leading-relaxed">
                    The government CPGRAMS portal needs this department selected:
                  </p>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-semibold text-slate-200 flex justify-between items-center gap-4">
                    <span className="truncate">{grievance.ministry}</span>
                    <button
                      onClick={() => copyToClipboard(grievance.ministry, 'dept')}
                      className="p-2 bg-slate-800 hover:bg-slate-750 text-saffron-500 rounded-md shrink-0 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === 'dept' ? <Check className="w-4 h-4 text-ashoka-500" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1 text-xs font-bold text-saffron-500 hover:text-saffron-400 mt-2"
                  >
                    Continue to Step 2 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Copy Description */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              activeStep === 1 ? 'bg-saffron-950/20 border-saffron-500/50 shadow-md' : 'bg-slate-850/60 border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeStep > 1 ? 'bg-ashoka-500 text-slate-950' : activeStep === 1 ? 'bg-saffron-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {activeStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <h4 className={`text-sm font-bold ${activeStep === 1 ? 'text-slate-100' : 'text-slate-500'}`}>
                    Paste Grievance Details
                  </h4>
                </div>
                {activeStep === 1 && (
                  <button
                    onClick={() => speakGuidance('Step 2: Copy the formatted complaint draft from the left and paste it inside the description box on the right.')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {activeStep === 1 && (
                <div className="mt-3.5 space-y-3 text-xs pl-9">
                  <p className="text-slate-400 leading-relaxed">
                    Copy this cleaned, law-linked AI draft and paste it into the Grievance Description on the right:
                  </p>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300 relative">
                    <div className="max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed pr-6 font-mono text-[11px]">
                      {grievance.description}
                    </div>
                    <button
                      onClick={() => copyToClipboard(grievance.description, 'desc')}
                      className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-750 text-saffron-500 rounded-md transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === 'desc' ? <Check className="w-3.5 h-3.5 text-ashoka-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1 text-xs font-bold text-saffron-500 hover:text-saffron-400 mt-2"
                  >
                    Continue to Step 3 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: CAPTCHA Verification */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              activeStep === 2 ? 'bg-saffron-950/20 border-saffron-500/50 shadow-md' : 'bg-slate-850/60 border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    simSubmitted ? 'bg-ashoka-500 text-slate-950' : activeStep === 2 ? 'bg-saffron-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {simSubmitted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                  </div>
                  <h4 className={`text-sm font-bold ${activeStep === 2 ? 'text-slate-100' : 'text-slate-500'}`}>
                    Solve CAPTCHA & Submit
                  </h4>
                </div>
                {activeStep === 2 && !simSubmitted && (
                  <button
                    onClick={() => speakGuidance('Step 3: Solve the captcha code on the right and click Submit Grievance. Captchas are safety systems of government portals, so Adhikar helps you enter it manually.')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {activeStep === 2 && !simSubmitted && (
                <div className="mt-3.5 space-y-2 text-xs pl-9 leading-relaxed text-slate-400">
                  <div className="bg-slate-900/60 border border-slate-805 rounded-xl p-3 flex gap-2.5 items-start">
                    <AlertCircle className="w-4 h-4 text-saffron-500 shrink-0 mt-0.5" />
                    <span>
                      Adhikar does NOT auto-submit captcha. Solve the CAPTCHA code manually on the right portal and click Submit to complete the filing.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success / Redirect Action */}
        {simSubmitted && (
          <div className="bg-ashoka-950/20 border border-ashoka-900/40 rounded-xl p-5 mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-ashoka-500" />
              <h3 className="font-extrabold text-sm text-slate-100">Grievance Successfully Registered</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adhikar Copilot has completed the guidance. The receipt has been logged. You can now track timelines and deadlines directly from your main dashboard.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-ashoka-500 text-slate-950 font-bold hover:bg-ashoka-650 transition-colors text-xs"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-4 mt-6">
          💡 **Why Split-Screen?** Government portal forms block automated bots. Adhikar uses this interactive side-by-side design to guide citizens through filing.
        </div>
      </div>

      {/* RIGHT PANEL: GOVERNMENT PORTAL SIMULATOR (60% width) */}
      <div className="w-full lg:w-[60%] bg-slate-950 p-6 flex flex-col justify-between">
        
        {/* Portal Simulated Window chrome decoration */}
        <div className="border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden bg-slate-900/40">
          
          {/* Mock Browser URL Bar */}
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-4 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500/80 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500/80 rounded-full"></span>
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-850 px-3 py-1 rounded-lg text-xs font-mono text-slate-500 flex items-center gap-1.5 select-none">
              <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>https://pgportal.gov.in/GrievanceEntry</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-[10px] text-slate-400 font-mono">
              <Monitor className="w-3.5 h-3.5 shrink-0" /> Portal Simulator
            </div>
          </div>

          {/* Simulated Page Content */}
          <div className="p-6 flex-1 overflow-y-auto bg-slate-100 text-slate-900">
            
            {!simSubmitted ? (
              <form onSubmit={handleSimulateSubmit} className="max-w-2xl mx-auto space-y-6">
                
                {/* Government Banner Header */}
                <div className="border-b-4 border-amber-600 pb-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-10 h-10 select-none opacity-90" alt="Emblem of India" />
                    <div>
                      <h3 className="font-extrabold text-sm tracking-wide text-slate-800">PGPORTAL (CPGRAMS)</h3>
                      <p className="text-[10px] font-semibold text-slate-600">Centralized Public Grievance Redress System</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-bold uppercase">
                    Department of Administrative Reforms
                  </div>
                </div>

                <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded p-3 leading-relaxed">
                  ⚠️ WARNING: Field validation is active. Ensure you enter the correct mapped Ministry and paste the structured details before entering CAPTCHA.
                </div>

                <div className="space-y-4">
                  {/* Ministry Select Field */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                      1. Ministry / Department Concerned <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={simDept}
                      onChange={(e) => setSimDept(e.target.value)}
                      className={`block w-full py-2 px-3 bg-white border border-slate-350 rounded shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        simDept && simDept.includes('Jal Shakti') ? 'border-emerald-500 ring-1 ring-emerald-500' : ''
                      }`}
                    >
                      <option value="">-- SELECT MINISTRY --</option>
                      <option value="Ministry of Jal Shakti / Department of Drinking Water and Sanitation">
                        Ministry of Jal Shakti / Department of Drinking Water and Sanitation
                      </option>
                      <option value="Ministry of Road Transport and Highways">
                        Ministry of Road Transport and Highways
                      </option>
                      <option value="Ministry of Power">
                        Ministry of Power
                      </option>
                      <option value="Ministry of Consumer Affairs, Food and Public Distribution">
                        Ministry of Consumer Affairs, Food and Public Distribution
                      </option>
                      <option value="Ministry of Education">
                        Ministry of Education
                      </option>
                    </select>
                    {simDept && simDept.includes('Jal Shakti') && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Mapped ministry correctly selected.</p>
                    )}
                  </div>

                  {/* Grievance Description Field */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                      2. Grievance Description (Max 4000 chars) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="7"
                      value={simDesc}
                      onChange={(e) => setSimDesc(e.target.value)}
                      placeholder="Paste the detailed grievance description..."
                      className={`block w-full p-3 bg-white border border-slate-350 rounded shadow-sm text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        simDesc && simDesc.includes('LEGAL BASIS') ? 'border-emerald-500 ring-1 ring-emerald-500' : ''
                      }`}
                    />
                    {simDesc && simDesc.includes('LEGAL BASIS') && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ AI-Structured draft successfully pasted.</p>
                    )}
                  </div>

                  {/* Upload Document */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                      3. Upload Supporting Document (Optional, PDF only)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        disabled
                        className="block w-full py-1.5 px-3 bg-white border border-slate-300 rounded text-xs text-slate-500"
                      />
                      <button type="button" disabled className="px-4 py-2 border border-slate-300 bg-slate-200 text-slate-600 text-xs font-bold rounded">
                        Browse
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-500">Only PDF documents up to 4MB are allowed.</span>
                  </div>

                  {/* Captcha Box */}
                  <div className="border border-slate-250 bg-slate-50 p-4 rounded flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                        4. Enter Captcha Security Code <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={simCaptcha}
                          onChange={(e) => setSimCaptcha(e.target.value)}
                          placeholder="Type code"
                          className="w-28 py-2 px-3 bg-white border border-slate-350 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50"
                          title="Refresh Captcha"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 text-slate-100 font-black tracking-wider text-xl px-5 py-2.5 rounded border border-slate-700 shadow-inner font-mono select-none">
                        {simCaptchaAnswer}
                      </div>
                      <span className="text-[10px] text-slate-500 max-w-24 leading-snug">
                        Security verification prevents automated abuse.
                      </span>
                    </div>
                  </div>

                  {simError && (
                    <div className="bg-red-50 border border-red-200 text-red-750 p-3 rounded text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{simError}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="px-5 py-2 bg-slate-300 hover:bg-slate-400 text-slate-850 font-bold rounded shadow-sm text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={simLoading}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded shadow text-xs transition-colors disabled:opacity-50"
                    >
                      {simLoading ? 'Submitting to PGPORTAL...' : 'SUBMIT GRIEVANCE'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Simulated Receipt Screen */
              <div className="max-w-xl mx-auto space-y-6 py-8">
                <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 p-4 rounded-xl flex gap-3 items-start shadow-sm">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <h4 className="font-extrabold text-sm">Grievance Registered Successfully</h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      Your complaint has been registered on the Centralized Public Grievance Redress System. An SMS and Email alert have been dispatched.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-250 rounded-xl shadow-lg p-6 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Official Receipt</span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      Date: {new Date().toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-xs font-sans pb-3">
                    <div className="text-slate-500 font-semibold col-span-1">Registration No:</div>
                    <div className="text-slate-900 font-black col-span-2 tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block self-start font-mono">
                      PMOPG/E/2026/839401
                    </div>

                    <div className="text-slate-500 font-semibold col-span-1">Name of Complainant:</div>
                    <div className="text-slate-900 font-bold col-span-2">Adhikar Demo Citizen</div>

                    <div className="text-slate-500 font-semibold col-span-1">Ministry Concerned:</div>
                    <div className="text-slate-900 font-bold col-span-2 leading-tight">{simDept}</div>

                    <div className="text-slate-500 font-semibold col-span-1">Complaint Category:</div>
                    <div className="text-slate-900 font-bold col-span-2">{grievance.category}</div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Grievance Description Logged</div>
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px] text-slate-700 font-mono max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                      {simDesc}
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 leading-snug">
                  🛡️ This is a simulated transaction receipt matching CPGRAMS registration outcomes.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopilotSandbox;
