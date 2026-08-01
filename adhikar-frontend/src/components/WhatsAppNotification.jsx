import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Bell, ExternalLink, Send, ShieldCheck } from 'lucide-react';

/**
 * WhatsAppNotification Component
 * Features:
 * - Toggle option: "Enable WhatsApp Updates"
 * - Phone number input field
 * - "WhatsApp Alerts Enabled ✓" status badge
 * - Simulated sending animation
 * - Simulated WhatsApp Push Notification Popup card
 */
const WhatsAppNotification = ({ 
  enabled, 
  onToggle, 
  phoneNumber, 
  onPhoneChange, 
  triggerNotification, 
  onCloseNotification,
  notificationData 
}) => {
  const [isSending, setIsSending] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (triggerNotification && enabled) {
      setIsSending(true);
      setShowPopup(false);

      const timer = setTimeout(() => {
        setIsSending(false);
        setShowPopup(true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [triggerNotification, enabled]);

  const closePopup = () => {
    setShowPopup(false);
    if (onCloseNotification) onCloseNotification();
  };

  return (
    <>
      {/* 1. UI Settings Panel (Can be embedded into form) */}
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0 font-bold">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800">WhatsApp Notification System</h4>
                {enabled && (
                  <span className="text-[10px] font-extrabold bg-[#25D366] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" /> Alerts Enabled ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Receive instant status updates, registration IDs & tracking links on WhatsApp.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              checked={enabled} 
              onChange={(e) => onToggle(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
          </label>
        </div>

        {/* Conditional Phone Input Field */}
        {enabled && (
          <div className="mt-4 pt-3 border-t border-[#dcfce7] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              WhatsApp Phone Number *
            </label>
            <div className="flex-1 flex items-center w-full">
              <span className="bg-[#dcfce7] text-[#15803d] font-bold text-xs px-3 py-2 border border-r-0 border-[#bbf7d0] rounded-l-md">
                🇮🇳 +91
              </span>
              <input 
                type="text" 
                value={phoneNumber} 
                onChange={(e) => onPhoneChange(e.target.value)} 
                placeholder="Enter 10 digit WhatsApp number" 
                className="flex-1 bg-white border border-[#bbf7d0] rounded-r-md px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#25D366]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Simulated Sending Loader Toast */}
      {isSending && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-[#25D366]/40 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="text-xs font-bold text-[#25D366] flex items-center gap-1">
              <Send className="w-3.5 h-3.5" /> Dispatching WhatsApp Notification...
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sending to +91 {phoneNumber || 'XXXXXXXXXX'}</p>
          </div>
        </div>
      )}

      {/* 3. Realistic WhatsApp Mobile Push Notification Popup Overlay */}
      {showPopup && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#25D366]/40 overflow-hidden animate-slide-down">
          
          {/* Push Notification Top Header */}
          <div className="bg-[#128C7E] px-4 py-2.5 flex items-center justify-between border-b border-[#075E54]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center shadow">
                <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-xs font-bold tracking-wide text-white">WHATSAPP</span>
              <span className="text-[10px] text-emerald-200">• Just now</span>
            </div>
            <button 
              onClick={closePopup}
              className="text-emerald-100 hover:text-white p-1 rounded-full hover:bg-[#075E54]/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp Message Card Body */}
          <div className="p-4 space-y-3">
            
            {/* Sender Title */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                <span className="text-xs font-extrabold text-white">Adhikar Official Grievance Bot</span>
              </div>
              <span className="text-[9px] bg-[#25D366]/20 text-[#25D366] font-mono px-2 py-0.5 rounded font-bold">VERIFIED</span>
            </div>

            {/* Chat Bubble Style Container */}
            <div className="bg-[#0b141a] border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-sans">
              <p className="font-bold text-[#25D366] flex items-center gap-1">
                📌 Grievance Registration Confirmation
              </p>
              
              <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <p><strong className="text-slate-400">Citizen:</strong> {notificationData?.userName || 'Demo User'}</p>
                <p><strong className="text-slate-400">Issue:</strong> {notificationData?.summary || 'Contaminated water supply in Ward 4'}</p>
                <p><strong className="text-slate-400">Registration ID:</strong> <span className="font-mono text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{notificationData?.regId || 'CPGRAMS-2026-98241'}</span></p>
                <p><strong className="text-slate-400">Status:</strong> <span className="text-[#25D366] font-bold">🟢 {notificationData?.status || 'Submitted Successfully'}</span></p>
              </div>

              {/* Dummy Link */}
              <div className="pt-2 border-t border-slate-800/80">
                <a 
                  href="#track" 
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                >
                  🔗 {notificationData?.trackingLink || `https://adhikar.gov.in/track/${notificationData?.regId || 'CPGRAMS-2026-98241'}`}
                  <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Simulated WhatsApp Push Notification</span>
              <span className="text-[#25D366] font-bold">Delivered ✓✓</span>
            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default WhatsAppNotification;
