import React, { useState, useEffect } from 'react';
import { 
  FileText, BrainCircuit, Navigation, Activity, 
  ChevronRight, CheckCircle2, ShieldCheck, Globe, Maximize2, X, ExternalLink, RefreshCw
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'File Complaint',
    description: 'User enters their grievance via voice or text in their native language.',
    icon: FileText,
    url: 'https://adhikar.gov.in/app/input'
  },
  {
    id: 2,
    title: 'AI Classification',
    description: 'Adhikar AI parses intent, maps legal rights, and identifies the target department.',
    icon: BrainCircuit,
    url: 'https://adhikar.gov.in/ai-core/processing'
  },
  {
    id: 3,
    title: 'Department Routing',
    description: 'The AI acts as an agent, automatically filling the official department portal form.',
    icon: Navigation,
    url: 'https://sevasindhu.karnataka.gov.in/auto-fill',
    isExternal: true
  },
  {
    id: 4,
    title: 'Resolution Tracking',
    description: 'Continuous monitoring of the portal for status updates and deadline alerts.',
    icon: Activity,
    url: 'https://sevasindhu.karnataka.gov.in/track-status',
    isExternal: true
  }
];

const FutureScopeDemo = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Simulate loading state on step change
  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate iframe restriction error on external government portals
      if (steps.find(s => s.id === activeStep)?.isExternal) {
        setIframeError(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeStep]);

  const currentStepData = steps.find(s => s.id === activeStep);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-6 h-6 opacity-95" alt="Emblem" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-wide leading-none">ADHIKAR FUTURE VISION</h1>
            <p className="text-[10px] text-saffron-500 font-bold tracking-widest uppercase mt-1">Autonomous Grievance Agent Demo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
            Simulation Mode
          </span>
        </div>
      </header>

      {/* Main Split Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT SIDE: Step-by-step Process */}
        <div className="w-full lg:w-1/3 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden relative z-10 shadow-2xl">
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Execution Flow</h2>
            
            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                const isPast = activeStep > step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left transition-all duration-300 rounded-xl p-4 border relative ${
                      isActive 
                        ? 'bg-linear-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/50 shadow-lg shadow-blue-900/20 scale-100' 
                        : isPast
                          ? 'bg-slate-900 border-slate-800 opacity-60 scale-95'
                          : 'bg-slate-900/50 border-transparent hover:bg-slate-800 scale-95'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 p-2 rounded-lg shrink-0 transition-colors ${
                        isActive ? 'bg-blue-500 text-white' : isPast ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isActive ? 'text-blue-400' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                          Step {step.id}: {step.title}
                        </h3>
                        <p className={`mt-1.5 text-xs leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0">
            <button 
              onClick={() => setActiveStep(prev => Math.min(prev + 1, steps.length))}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              Continue with this procedure <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Browser Window Simulation */}
        <div className="flex-1 p-0 sm:p-6 bg-slate-950 flex flex-col overflow-hidden relative">
          
          <div className="flex-1 w-full mx-auto flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-700/50 bg-white">
            
            {/* Mock Browser Header */}
            <div className="bg-slate-800 p-3 flex items-center gap-4 shrink-0 border-b border-slate-900">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="flex-1 bg-slate-900/80 rounded-md py-1.5 px-3 flex items-center gap-2 border border-slate-700/50 text-slate-400 transition-all">
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
                <span className="text-xs font-mono truncate">
                  {currentStepData.url}
                </span>
              </div>
            </div>

            {/* Browser Content Area (Iframe / Fallback container) */}
            <div className="flex-1 relative bg-slate-100 flex flex-col overflow-hidden">
              
              {isLoading && (
                <div className="absolute inset-0 z-50 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <h3 className="text-slate-800 font-bold text-sm uppercase tracking-widest">Connecting to Portal...</h3>
                  <p className="text-slate-500 text-xs mt-2 font-mono">{currentStepData.url}</p>
                </div>
              )}

              {/* If iframe restricted, show realistic simulated UI fallback */}
              {iframeError ? (
                <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto animate-fade-in text-slate-800 relative w-full">
                  
                  {/* Fake Government UI Header inside the fallback */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-r from-amber-600 to-amber-700 flex items-center px-6 shadow-md z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-full mr-4"></div>
                    <div>
                      <h2 className="text-white font-bold text-sm">{currentStepData.title}</h2>
                      <p className="text-amber-100 text-[10px] uppercase tracking-wider">{new URL(currentStepData.url).hostname}</p>
                    </div>
                  </div>

                  {/* Warning overlay to explain fallback */}
                  <div className="mt-20 max-w-2xl w-full bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm relative z-20">
                    <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-amber-900 mb-2">Government Portal Restricted Embedding</h3>
                    <p className="text-sm text-amber-800/80 mb-6 max-w-lg mx-auto">
                      The official portal <span className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">{new URL(currentStepData.url).hostname}</span> does not allow iframing (X-Frame-Options: SAMEORIGIN). Below is a simulated view of what the agent is doing.
                    </p>
                    <button 
                      onClick={() => window.open(currentStepData.url, '_blank')}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 mx-auto transition-colors shadow-md"
                    >
                      Open in new tab (Fallback) <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Simulated DOM interactions based on step */}
                  <div className="mt-8 max-w-2xl w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative z-20">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                      <h4 className="font-bold text-slate-700 text-sm">Simulated Live View</h4>
                    </div>
                    <div className="p-8">
                      {activeStep === 3 && (
                        <div className="space-y-4">
                          <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                            <div className="h-10 bg-emerald-50 border border-emerald-200 rounded w-full flex items-center px-3 relative overflow-hidden">
                              <span className="text-emerald-800 text-xs font-mono z-10">Adhikar Citizen</span>
                              <div className="absolute inset-0 bg-emerald-100/50 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                            <div className="h-24 bg-emerald-50 border border-emerald-200 rounded w-full flex p-3 relative overflow-hidden">
                              <span className="text-emerald-800 text-xs font-mono z-10">Auto-filled grievance description...</span>
                              <div className="absolute inset-0 bg-emerald-100/50 animate-pulse delay-75"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeStep === 4 && (
                        <div className="space-y-6">
                           <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
                           <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-emerald-500 shrink-0"></div>
                             <div className="h-2 bg-emerald-200 w-full rounded"></div>
                             <div className="w-8 h-8 rounded-full bg-emerald-500 shrink-0"></div>
                             <div className="h-2 bg-slate-200 w-full rounded"></div>
                             <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                           </div>
                           <p className="text-center text-xs text-slate-500 mt-4 font-mono">Status: Awaiting Department Response</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                /* Native Views (No restrictions simulated) */
                <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in text-slate-800 h-full w-full">
                  {activeStep === 1 && (
                     <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-lg w-full text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Hi, I am Adhikar AI.</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Please tell me what issue you are facing today. You can speak in your local language.
                        </p>
                        <div className="bg-slate-100 rounded-xl p-4 text-left border border-slate-200">
                          <p className="text-xs text-slate-700 font-mono font-bold">Citizen Input:</p>
                          <p className="text-sm text-slate-900 mt-2">"My water supply in Ward 4 has been contaminated with sewage for 5 days. I need help."</p>
                        </div>
                      </div>
                  )}
                  {activeStep === 2 && (
                    <div className="relative w-full max-w-md h-full flex flex-col items-center justify-center">
                      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
                      <div className="relative bg-white border border-slate-200 shadow-xl rounded-2xl p-6 space-y-6 w-full">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                          <BrainCircuit className="w-8 h-8 text-blue-600 animate-pulse" />
                          <div>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Cognitive Engine</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Parsing Grievance Data...</p>
                          </div>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                            <span className="text-slate-500">Intent:</span>
                            <span className="text-emerald-600 font-bold">Public Utility Complaint</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                            <span className="text-slate-500">Legal Act:</span>
                            <span className="text-amber-600 font-bold">Section 3, Water Act 1974</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                            <span className="text-slate-500">Target Portal:</span>
                            <span className="text-blue-600 font-bold">Seva Sindhu (Karnataka)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureScopeDemo;
