import React, { useState } from 'react';
import { 
  User, FileText, CheckCircle, 
  Lightbulb, ChevronRight, Shield, ShieldCheck, Mail, ArrowRight, Upload, Info
} from 'lucide-react';
import WhatsAppNotification from '../components/WhatsAppNotification';

const steps = [
  {
    id: 1,
    title: 'Personal Details',
    subtitle: 'Fill in your personal and contact details',
    details: ['Full Name', 'Mobile Number', 'Email ID', 'Address'],
  },
  {
    id: 2,
    title: 'Grievance Details',
    subtitle: 'Provide details about your grievance',
    details: ['Grievance Category', 'Department', 'Subject', 'Description'],
  },
  {
    id: 3,
    title: 'Review & Submit',
    subtitle: 'Review your details and submit',
    details: ['Review Information', 'Attachments (if any)', 'Submit Grievance'],
  }
];

const AdhikarSplitDemo = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [waEnabled, setWaEnabled] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [triggerWa, setTriggerWa] = useState(false);

  const handleSubmit = () => {
    if (waEnabled) {
      setTriggerWa(true);
      setTimeout(() => setTriggerWa(false), 2000);
    } else {
      alert("Submitted successfully!");
    }
  };

  return (
    <div className="min-h-screen flex font-sans overflow-hidden bg-[#0a0f1c]">
      
      {/* LEFT SIDE (35%) */}
      <div className="w-full lg:w-[35%] flex flex-col h-screen border-r border-slate-800/50 bg-[#0a0f1c] text-slate-200 relative z-10">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Nyay is Adhikar</h1>
              <p className="text-[10px] text-slate-400 font-medium">AI-Powered Grievance Assistant</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            File Your Grievance in <span className="text-emerald-400">3 Easy Steps</span>
          </h2>
        </div>

        {/* Steps Container */}
        <div className="flex-1 px-8 overflow-y-auto relative pb-8">
          
          {/* Vertical connecting line */}
          <div className="absolute left-[51px] top-6 bottom-8 w-px bg-slate-800 z-0"></div>

          <div className="space-y-4 relative z-10">
            {steps.map((step, index) => {
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left transition-all duration-300 rounded-xl p-5 border relative overflow-hidden flex gap-4 ${
                    isActive 
                      ? 'bg-[#111827] border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-[#111827]/50 border-transparent hover:bg-[#111827]/80'
                  }`}
                >
                  {/* Step Number Circle */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm relative z-10 transition-colors duration-300 ${
                    isActive 
                      ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : isCompleted 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.id}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      Step {step.id}: {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{step.subtitle}</p>
                    
                    {/* Active State Details */}
                    {isActive && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs mb-3 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> In Progress
                        </div>
                        <div className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 opacity-50" />
                                {detail}
                              </div>
                              {idx === 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Completed State Details */}
                    {!isActive && (
                      <div className="mt-3 space-y-1.5 opacity-50">
                        <div className="flex items-center gap-2 text-blue-400 text-xs mb-2">
                          <CheckCircle className="w-3.5 h-3.5" /> {isCompleted ? 'Completed' : 'Pending'}
                        </div>
                        {step.details.slice(0, 2).map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-400">
                            <CheckCircle className="w-3 h-3" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="m-8 space-y-4 relative z-10">
          <WhatsAppNotification 
            enabled={waEnabled}
            onToggle={setWaEnabled}
            phoneNumber={waPhone}
            onPhoneChange={setWaPhone}
            triggerNotification={triggerWa}
            onCloseNotification={() => setTriggerWa(false)}
            notificationData={{
              userName: 'Demo User',
              summary: 'Contaminated water supply in Ward 4',
              regId: 'CPGRAMS-2026-98241',
              status: 'Submitted Successfully',
              trackingLink: 'https://adhikar.gov.in/track/CPGRAMS-2026-98241'
            }}
          />

          <div className="p-5 bg-[#0f172a] border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="flex gap-3">
              <div className="mt-0.5 text-emerald-400 shrink-0">
                <Lightbulb className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 mb-1">AI Assistant Tip</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We'll help you fill the form correctly and ensure it reaches the right department.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE (65%) */}
      <div className="hidden lg:flex flex-col w-[65%] h-screen bg-[#1e1e1e] relative">
        
        {/* Browser Topbar (Dark Safari/Chrome style) */}
        <div className="h-12 bg-[#2d2d2d] border-b border-[#1a1a1a] flex items-center px-4 gap-4 shrink-0">
          <div className="flex gap-4 text-[#8a8a8a]">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <ArrowRight className="w-4 h-4 opacity-50" />
          </div>
          <div className="bg-[#1e1e1e] rounded-md px-4 py-1.5 text-xs text-[#a0a0a0] flex-1 max-w-xl flex items-center gap-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            https://pgportal.gov.in
          </div>
          <div className="bg-[#1e1e1e] rounded px-3 py-1.5 text-xs text-white ml-auto">
            comments
          </div>
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 overflow-y-auto bg-white relative flex flex-col">
          
          {/* CPGRAMS Header */}
          <div className="bg-white px-8 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-12 w-8 object-contain" />
              <div>
                <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">CPGRAMS</h2>
                <p className="text-[11px] text-[#4a4a4a]">Centralized Public Grievance <br/>Redress And Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-blue-900 font-black italic text-xl flex items-center gap-1">
                G2<span className="text-orange-500">O</span>
              </div>
              <button className="px-4 py-1.5 border border-blue-100 bg-blue-50 text-blue-600 rounded text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" /> Sign In
              </button>
            </div>
          </div>

          {/* CPGRAMS Navbar */}
          <div className="bg-[#1a4b8c] text-white px-8 py-2.5 flex items-center gap-8 text-sm font-medium shrink-0">
            <span className="cursor-pointer hover:text-blue-200">Home</span>
            <span className="cursor-pointer font-bold border-b-2 border-white pb-1 -mb-1">Lodge Grievance</span>
            <span className="cursor-pointer hover:text-blue-200">View Status</span>
            <span className="cursor-pointer hover:text-blue-200">Nodal PG Officers</span>
            <span className="cursor-pointer hover:text-blue-200">Redress Process</span>
            <span className="cursor-pointer hover:text-blue-200">Grievance ▾</span>
            <span className="cursor-pointer hover:text-blue-200">Feedback</span>
            <span className="cursor-pointer hover:text-blue-200">Contact Us</span>
            <span className="cursor-pointer hover:text-blue-200">FAQ</span>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <h3 className="text-[#1a4b8c] text-xl font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Lodge a Grievance
                </h3>
                <span className="text-xs font-semibold text-red-600">* Mandatory Fields</span>
              </div>

              {/* Dynamic Step Forms */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                
                {/* Step 1 Form */}
                {activeStep === 1 && (
                  <div className="animate-fade-in">
                    <div className="border-b border-slate-200 px-6 py-4">
                      <h4 className="text-base font-bold text-[#1a4b8c]">Step 1: Personal Details</h4>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="Enter your full name" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">Mobile Number <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="Enter 10 digit mobile number" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">Email ID</label>
                          <input type="email" placeholder="Enter your email id" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">Address <span className="text-red-500">*</span></label>
                          <textarea rows="3" placeholder="Enter your complete address" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">State <span className="text-red-500">*</span></label>
                          <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                            <option>-- Select State --</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">District <span className="text-red-500">*</span></label>
                          <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                            <option>-- Select District --</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-center gap-2 text-sm text-blue-800">
                        <Info className="w-4 h-4 text-blue-600" />
                        All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button onClick={() => setActiveStep(2)} className="bg-[#1a4b8c] hover:bg-blue-800 text-white px-6 py-2 rounded flex items-center gap-2 font-medium text-sm transition-colors">
                          Save & Next <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 Form */}
                {activeStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="border-b border-slate-200 px-6 py-4">
                      <h4 className="text-base font-bold text-[#1a4b8c]">Step 2: Grievance Details</h4>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">Grievance Category <span className="text-red-500">*</span></label>
                          <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                            <option>-- Select Category --</option>
                            <option>Water & Sanitation</option>
                            <option>Electricity</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">Ministry/Department <span className="text-red-500">*</span></label>
                          <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                            <option>-- Select Department --</option>
                          </select>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="block text-sm font-semibold text-slate-700">Subject <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="Brief subject of your grievance" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="block text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></label>
                          <textarea rows="5" placeholder="Detailed description of the grievance (Max 4000 characters)" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"></textarea>
                          <div className="text-right text-[10px] text-slate-500">0 / 4000</div>
                        </div>
                        <div className="space-y-2 col-span-2 border-t border-slate-200 pt-4">
                          <label className="block text-sm font-semibold text-slate-700">Attach Supporting Document (Optional)</label>
                          <div className="border-2 border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 cursor-pointer hover:bg-slate-100">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-sm">Click to upload file (PDF, JPG, PNG)</span>
                            <span className="text-xs mt-1">Max size: 4MB</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <button onClick={() => setActiveStep(1)} className="border border-slate-300 text-slate-600 px-6 py-2 rounded flex items-center gap-2 font-medium text-sm transition-colors hover:bg-slate-50">
                          Previous
                        </button>
                        <button onClick={() => setActiveStep(3)} className="bg-[#1a4b8c] hover:bg-blue-800 text-white px-6 py-2 rounded flex items-center gap-2 font-medium text-sm transition-colors">
                          Save & Next <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 Form */}
                {activeStep === 3 && (
                  <div className="animate-fade-in">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                      <h4 className="text-base font-bold text-[#1a4b8c]">Step 3: Review & Submit</h4>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-200">Ready for submission</span>
                    </div>
                    <div className="p-6 space-y-6">
                      
                      <div className="bg-slate-50 border border-slate-200 rounded p-4">
                        <h5 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 mb-3">Applicant Overview</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">Demo User</span></div>
                          <div><span className="text-slate-500">Mobile:</span> <span className="font-medium text-slate-800">+91 9876543210</span></div>
                          <div><span className="text-slate-500">State:</span> <span className="font-medium text-slate-800">Karnataka</span></div>
                          <div><span className="text-slate-500">District:</span> <span className="font-medium text-slate-800">Bengaluru</span></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded p-4">
                        <h5 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 mb-3">Grievance Overview</h5>
                        <div className="space-y-3 text-sm">
                          <div><span className="text-slate-500">Category:</span> <span className="font-medium text-slate-800">Water & Sanitation</span></div>
                          <div><span className="text-slate-500">Department:</span> <span className="font-medium text-slate-800">Municipal Corporation</span></div>
                          <div><span className="text-slate-500">Subject:</span> <span className="font-medium text-slate-800">Contaminated water supply in Ward 4</span></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-4 rounded text-sm text-amber-800">
                        <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                        <label>I hereby declare that the information provided above is true to the best of my knowledge.</label>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <button onClick={() => setActiveStep(2)} className="border border-slate-300 text-slate-600 px-6 py-2 rounded flex items-center gap-2 font-medium text-sm transition-colors hover:bg-slate-50">
                          Previous
                        </button>
                        <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded font-bold text-sm transition-colors shadow-md shadow-green-600/20">
                          Submit Final Grievance
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* CPGRAMS Footer */}
          <div className="bg-[#0f284b] text-white px-8 py-4 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold bg-linear-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent">Digital India</div>
              <p className="text-[9px] text-slate-400 italic">Power to Empower</p>
            </div>
            <div className="text-[10px] text-slate-300 flex flex-col items-center">
              <div className="flex gap-4 mb-1">
                <span className="hover:underline cursor-pointer">Terms & Conditions</span>
                <span className="text-slate-600">|</span>
                <span className="hover:underline cursor-pointer">Privacy Policy</span>
                <span className="text-slate-600">|</span>
                <span className="hover:underline cursor-pointer">Copyright Policy</span>
              </div>
              <p>Content Owned by Department of Administrative Reforms and Public Grievances</p>
            </div>
            <div className="font-bold text-sm tracking-widest flex items-center gap-1">
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

export default AdhikarSplitDemo;
