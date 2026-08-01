import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mic, MicOff, AlertCircle, FileText, Scale, Landmark, ShieldCheck, ArrowRight,
  Globe, Volume2
} from 'lucide-react';
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

const FilingWizard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water & Sanitation');
  const [language, setLanguage] = useState('en-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // AI structured preview state
  const [structuredPreview, setStructuredPreview] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check if web speech is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your grievance.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();

    // Store recognition object so we can stop it on toggle
    window.currentRecognition = recognition;
  };

  useEffect(() => {
    return () => {
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill out all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/grievances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category })
      });
      const data = await response.json();
      if (data.success) {
        setStructuredPreview(data.data);
        if (data.data) {
          console.log("Portal identified:", data.data.portalName);
        }
      }
    } catch (err) {
      console.warn('Backend server offline. Simulating AI analysis locally.');
      const textLower = description.toLowerCase();
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

      let matchedCategory = 'general grievance';
      let ministry = 'Ministry of Personnel, Public Grievances and Pensions';
      let portalName = 'CPGRAMS fallback';
      let redirectUrl = 'https://pgportal.gov.in';
      let legalReferences = ['Citizen Charter Guidelines'];

      if (bestMatchKey && maxKeywordScore >= 2) {
        const match = localPortalMap[bestMatchKey];
        matchedCategory = match.category;
        ministry = match.department;
        portalName = match.portalName;
        redirectUrl = match.redirectUrl;
        
        if (matchedCategory === 'certificate/service delay') legalReferences = ['Information Technology Act, 2000', 'State Right to Public Services Act'];
        else if (matchedCategory === 'electricity') legalReferences = ['Section 43 of the Electricity Act, 2003', 'Electricity Rights of Consumers Rules 2020'];
        else if (matchedCategory === 'police') legalReferences = ['Section 154 of the Code of Criminal Procedure (CrPC)', 'Police Act 1861'];
        else if (matchedCategory === 'RTI') legalReferences = ['Section 6(1) of the Right to Information Act, 2005', 'Section 7(1) of the RTI Act 2005'];
        else if (matchedCategory === 'consumer') legalReferences = ['Section 2(9) of the Consumer Protection Act, 2019', 'Essential Commodities Act 1955'];
        else if (matchedCategory === 'general grievance') legalReferences = ['Section 3 of the Water Act 1974', 'Section 198A of the Motor Vehicles Act 2019'];
      }

      const mockResult = {
        _id: 'mock_grievance_' + Math.random().toString(36).substr(2, 9),
        title,
        description,
        category: matchedCategory,
        ministry,
        legalReferences,
        status: 'Ready to File',
        portalName,
        redirectUrl,
        copilotSteps: [
          {
            field: 'Grievance Description',
            value: `SUBJECT: Complaint regarding ${title}.\n\nDETAILS: ${description}\n\nLEGAL BASIS: ${legalReferences.join('; ')}`,
            helpText: 'Click to copy this formatted draft.',
            selector: '#grievance_description'
          },
          {
            field: 'Department',
            value: ministry,
            helpText: `Select ${ministry} in ${portalName}.`,
            selector: '#department_dropdown'
          }
        ]
      };
      setStructuredPreview(mockResult);
      // Auto-redirect removed per new requirement
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100">
          File a Public Grievance
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Describe the public grievance in your own words, using voice or text. Adhikar AI will map it to the right ministry and draft the official compliant.
        </p>
      </div>

      {!structuredPreview ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
            
            {/* Category selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Grievance Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-150 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm"
              >
                <option value="Water & Sanitation">Water & Sanitation (Jal Shakti)</option>
                <option value="Roads & Transport">Roads & Highway Maintenance</option>
                <option value="Electricity & Power">Electricity Board complaints</option>
                <option value="Consumer Rights">Consumer Protection / Ration Card</option>
                <option value="Education">Public Schools & Colleges</option>
                <option value="Health & Public Safety">Hospitals & Public Health</option>
                <option value="Others">Others / Public Grievance</option>
              </select>
            </div>

            {/* Subject Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Brief Title / Subject
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sewage mixing in water supply of Ward 4"
                className="block w-full py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-150 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Description / Speech box */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Detailed Description (Speak or Write)
                </label>
                {speechSupported && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-transparent text-xs text-slate-400 focus:outline-none border-b border-slate-700 pb-0.5 cursor-pointer"
                    >
                      <option value="en-IN" className="bg-slate-900">English (India)</option>
                      <option value="hi-IN" className="bg-slate-900">Hindi (हिन्दी)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="relative">
                <textarea
                  required
                  rows="6"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your complaint here. Explain what happened, where, and for how long..."
                  className="block w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-150 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm resize-none"
                />

                {/* Speech Microphone Trigger */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`absolute bottom-4 right-4 p-3 rounded-full flex items-center justify-center border shadow-md transition-all duration-300 ${
                      isRecording
                        ? 'bg-red-500 text-slate-950 border-red-400 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-saffron-500 border-slate-750'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Voice Intake'}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 mt-3 text-xs text-red-400 animate-pulse">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                  <span>Voice Intake Active. Speak into your microphone in selected language...</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-saffron-500 disabled:opacity-50 transition-all duration-300"
          >
            {submitting ? 'Structuring Grievance with AI...' : 'Analyze & Structure with AI'}
          </button>
        </form>
      ) : (
        /* AI Structuring preview */
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
            {/* Visual top border saffron-green-white */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron-500 via-slate-100 to-ashoka-500"></div>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-saffron-500 font-bold bg-slate-900 border border-slate-800 px-3 py-1 rounded">
                AI Classification Complete
              </span>
              <ShieldCheck className="w-6 h-6 text-ashoka-500" />
            </div>

            <div className="space-y-6">
              {/* Target Ministry */}
              <div className="flex items-start gap-4">
                <Landmark className="w-6 h-6 text-saffron-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Authority Mapping</h4>
                  <p className="text-base font-bold text-slate-200 mt-0.5">{structuredPreview.ministry}</p>
                </div>
              </div>

              {/* Formatted Draft */}
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-saffron-500 shrink-0 mt-1" />
                <div className="w-full">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Draft Summary (Cleaned & Formatted)</h4>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-2 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {structuredPreview.description}
                  </div>
                </div>
              </div>

              {/* Legal Cites */}
              <div className="flex items-start gap-4">
                <Scale className="w-6 h-6 text-saffron-500 shrink-0 mt-1" />
                <div className="w-full">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Legal Cites & Citizens Rights Found</h4>
                  <ul className="mt-2 space-y-2">
                    {structuredPreview.legalReferences.map((law, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-350 bg-slate-900/60 border border-slate-800/80 px-3.5 py-2.5 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-saffron-500 rounded-full"></div>
                        {law}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {structuredPreview.redirectUrl ? (
              <button
                onClick={() => window.open(structuredPreview.redirectUrl, '_blank')}
                className="w-full sm:w-2/3 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 transition-all duration-300 shadow-lg"
              >
                Access {structuredPreview.portalName || 'External'} Link <Globe className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <div className="w-full sm:w-2/3 flex items-center justify-center px-4 py-4 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 text-center">
                No matching portal found. Please use the Copilot Assistant.
              </div>
            )}
            <button
              onClick={() => navigate(`/copilot/${structuredPreview._id}`)}
              className="w-full sm:w-1/3 flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all duration-300 shadow-lg border border-slate-700"
            >
              Launch Copilot <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilingWizard;
