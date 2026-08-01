import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, ShieldAlert, FileText, Clipboard, Printer, Scale, ArrowRight, BookOpen } from 'lucide-react';

const RtiWizard = () => {
  const navigate = useNavigate();

  const [authority, setAuthority] = useState('Municipal Corporation Department');
  const [informationSeek, setInformationSeek] = useState('');
  const [timePeriod, setTimePeriod] = useState('FY 2025-2026');
  
  const [submitting, setSubmitting] = useState(false);
  const [generatedRti, setGeneratedRti] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!informationSeek) {
      alert('Please describe what information you want to request.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Structure questions using standard RTI best practices (concrete request, certified copies, no why/opinions)
      const questions = [
        `1. Provide the certified copy of the project plan and work order sanctioned for "${informationSeek}" covering the period ${timePeriod}.`,
        `2. Provide the total budget allocated, released, and actually spent on the aforementioned project/work.`,
        `3. Provide the name, designation, and official contact details of the contractor and executive engineer responsible for executing this project.`,
        `4. Provide the certified copy of the inspection reports and completion certificates submitted for this project till date.`
      ];

      const fullDraft = `To,
The Public Information Officer (PIO)
Office of the ${authority}
State Department / Public Authority

Subject: Application under Section 6(1) of the Right to Information Act, 2005.

1. Name of Applicant: Adhikar Demo Citizen
2. Address: Sector 4, Ward 12, Metro City, Pin: 400001
3. Information Sought:
Regarding the execution and financial details of: "${informationSeek}" for the period ${timePeriod}.

Particulars of Information Required:
${questions.join('\n\n')}

4. I state that the information sought does not fall within the restrictions contained in Section 8 and 9 of the RTI Act, 2005 and to the best of my knowledge it pertains to your office.
5. Application Fee: I have enclosed the required application fee of Rs. 10/- (Rupees Ten Only) via Postal Order / Demand Draft No. _________________ dated ______________.

Place: Metro City
Date: ${new Date().toLocaleDateString('en-IN')}

_______________________
Signature of Applicant`;

      setGeneratedRti({
        authority,
        informationSeek,
        timePeriod,
        questions,
        fullDraft
      });
      setSubmitting(false);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRti.fullDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>RTI Application - Section 6(1)</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; line-height: 1.6; }
            pre { white-space: pre-wrap; font-size: 14px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005</h2>
          </div>
          <pre>${generatedRti.fullDraft}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          RTI Application Builder <FileSpreadsheet className="w-8 h-8 text-saffron-500" />
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Generate bulletproof RTI applications. The AI structures raw requests into legal records requests (avoiding opinions/reasons which authorities reject).
        </p>
      </div>

      {!generatedRti ? (
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
            
            {/* Warning on common mistake */}
            <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 flex gap-3 items-start text-xs leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-200">Avoid Rejections!</span>
                <p className="text-slate-400 mt-1">
                  Under the RTI Act, you can only ask for existing records, work orders, logbooks, or budgets. Asking questions like "Why has the road not been repaired?" is considered asking for opinions and is grounds for immediate rejection. Adhikar structures this as a request for "certified copies of inspection reports".
                </p>
              </div>
            </div>

            {/* Target Authority */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Target Public Authority
              </label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="block w-full py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-150 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm"
              >
                <option value="Municipal Corporation Department">Municipal Corporation / Local Body</option>
                <option value="National Highways Authority of India (NHAI)">National Highways Authority (NHAI)</option>
                <option value="State Electricity Distribution Company">State Power Discom / EB</option>
                <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
                <option value="Department of Public Health & Family Welfare">Public Health Department</option>
              </select>
            </div>

            {/* What you seek */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                What information / record do you want to request?
              </label>
              <textarea
                required
                rows="4"
                value={informationSeek}
                onChange={(e) => setInformationSeek(e.target.value)}
                placeholder="e.g. The repair and allocation of funds for the main road in Sector 12, Ward 3"
                className="block w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-150 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Concerned Time Period
              </label>
              <input
                type="text"
                required
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                placeholder="e.g. FY 2024 - 2025"
                className="block w-full py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-150 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 disabled:opacity-50 transition-all duration-300"
          >
            {submitting ? 'Structuring RTI Questions...' : 'Draft RTI Application'}
          </button>
        </form>
      ) : (
        /* RTI Output View */
        <div className="space-y-6 animate-fadeIn">
          
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-saffron-500" />
                <h3 className="font-extrabold text-sm text-slate-200">Generated Section 6(1) Draft</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-ashoka-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-saffron-500" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Printable Draft Preview */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl font-mono text-xs leading-relaxed text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap select-text border-l-4 border-l-saffron-500">
              {generatedRti.fullDraft}
            </div>

            {/* What to do next instructions */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 space-y-3 text-xs leading-relaxed text-slate-400">
              <h4 className="font-bold text-slate-250 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-saffron-500" /> What is the filing process?
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 pl-1.5 text-slate-400">
                <li>Click **Print / Save PDF** to save the document.</li>
                <li>Affix a **Rs. 10 Court Fee Stamp** or attach a **Rs. 10 Indian Postal Order (IPO)** payable to "Accounts Officer".</li>
                <li>Submit it via **Speed Post** or hand-deliver it to the concerned PIO's office.</li>
                <li>By law (Section 7), the authority is required to provide the information within **30 days** of receipt.</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setGeneratedRti(null)}
              className="flex-1 py-3 px-4 border border-slate-700 rounded-xl font-bold text-slate-300 hover:bg-slate-905 transition-all text-sm"
            >
              Draft Another RTI
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 bg-saffron-500 hover:bg-saffron-600 transition-all text-sm flex items-center justify-center gap-1.5"
            >
              Finish & Return <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RtiWizard;
