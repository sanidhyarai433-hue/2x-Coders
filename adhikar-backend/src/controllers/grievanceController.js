const { Groq } = require('groq-sdk');
const Grievance = require('../models/Grievance');

// Initialize Groq client
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
  console.warn('WARNING: GROQ_API_KEY is not defined in process.env. Running with Mock AI mode.');
}

// In-memory list for demo when MongoDB is offline
let mockGrievances = [
  {
    _id: 'mock_grievance_1',
    user: 'mock_citizen_id_12345',
    complaintText: 'Tap water has been coming out yellow and smelling like gutter sewage for 15 days in Ward 4. No action has been taken by municipal engineers despite three complaints.',
    proofUrl: 'water_sample_proof.pdf',
    referenceNumber: 'REF-839401',
    category: 'Water & Sanitation',
    urgency: 'high',
    department: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
    confidence: 95,
    state: 'Maharashtra',
    district: 'Mumbai',
    status: 'Pending',
    deadlineDays: 15,
    formalLetter: `From:\nAdhikar Demo Citizen\nPhone: 9876543210\nAddress: Sector 4, Mumbai\n\nTo:\nThe Executive Engineer,\nMinistry of Jal Shakti / Department of Drinking Water and Sanitation\n\nSubject: Urgent Complaint: Contaminated Water Supply in Ward 4\n\nRespected Sir/Madam,\n\nI am writing to report a severe grievance regarding the drinking water supply in Ward 4, Mumbai. For the past 15 days, the tap water has been highly contaminated, presenting a dark yellow colour and a distinct sewage odour. This constitutes a severe health hazard.\n\nThis violates the standard quality levels under Section 3 of the Water Act, 1974 and infringes on my fundamental rights under Article 21 of the Constitution (Right to Clean Water).\n\nPlease investigate this matter immediately and restore clean water supply.\n\nYours faithfully,\nAdhikar Demo Citizen`,
    rtiDraft: `To,\nThe Public Information Officer\nOffice of the Ministry of Jal Shakti\n\nSubject: Application under Section 6(1) of the RTI Act, 2005.\n\n1. Name: Adhikar Demo Citizen\n2. Address: Sector 4, Mumbai\n3. Information Sought:\n- Provide copies of the daily water testing reports for Ward 4 between July 15 and July 30.\n- Provide details of maintenance budgets spent on pipeline repairs in Ward 4 in this fiscal year.`,
    appealDraft: '',
    appeal2Draft: '',
    submittedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000) // 32 days ago (Overdue for testing!)
  }
];

// Official Indian Rulebook for Category routing
const categoryRulebook = {
  "certificate/service delay": {
    ministry: "Ministry of Electronics and Information Technology / State Revenue Department",
    legalReferences: [
      "Information Technology Act, 2000 (Section 4 - Electronic records acceptance)",
      "State Right to Public Services Act (Timely issue of certificates)"
    ],
    deadlineDays: 15
  },
  "electricity": {
    ministry: "Ministry of Power / State Electricity Regulatory Commission",
    legalReferences: [
      "Section 43 of the Electricity Act, 2003 (Duty to supply electricity on request)",
      "Electricity (Rights of Consumers) Rules, 2020"
    ],
    deadlineDays: 7
  },
  "police": {
    ministry: "State Police Department / Home Affairs",
    legalReferences: [
      "Section 154 of the Code of Criminal Procedure (CrPC) - Mandatory FIR registration",
      "Police Act, 1861"
    ],
    deadlineDays: 15
  },
  "RTI": {
    ministry: "RTI Online Cell / Respective Public Authority",
    legalReferences: [
      "Section 6(1) of the Right to Information Act, 2005",
      "Section 7(1) of the RTI Act, 2005 (Mandatory 30-day response window)"
    ],
    deadlineDays: 30
  },
  "consumer": {
    ministry: "Ministry of Consumer Affairs, Food and Public Distribution",
    legalReferences: [
      "Section 2(9) of the Consumer Protection Act, 2019 (Consumer Rights)",
      "Essential Commodities Act, 1955 (Fair distribution of rations)"
    ],
    deadlineDays: 30
  },
  "general grievance": {
    ministry: "Department of Administrative Reforms / Municipal Corporation",
    legalReferences: [
      "Section 3 of the Water (Prevention and Control of Pollution) Act, 1974",
      "Section 198A of the Motor Vehicles (Amendment) Act, 2019"
    ],
    deadlineDays: 30
  },
  "Water & Sanitation": {
    ministry: "Ministry of Jal Shakti / Department of Drinking Water and Sanitation",
    legalReferences: [
      "Section 3 of the Water (Prevention and Control of Pollution) Act, 1974",
      "Article 21 of the Constitution of India (Right to Clean Drinking Water)"
    ],
    deadlineDays: 15
  },
  "Roads & Transport": {
    ministry: "Ministry of Road Transport and Highways",
    legalReferences: [
      "Section 198A of the Motor Vehicles (Amendment) Act, 2019",
      "Law of Torts (Negligence of Public Utility authorities in road maintenance)"
    ],
    deadlineDays: 30
  },
  "Electricity & Power": {
    ministry: "Ministry of Power / State Electricity Regulatory Commission",
    legalReferences: [
      "Section 43 of the Electricity Act, 2003 (Duty to supply electricity on request)",
      "Electricity (Rights of Consumers) Rules, 2020"
    ],
    deadlineDays: 7
  },
  "Consumer Rights": {
    ministry: "Ministry of Consumer Affairs, Food and Public Distribution",
    legalReferences: [
      "Section 2(9) of the Consumer Protection Act, 2019 (Consumer Rights)",
      "Essential Commodities Act, 1955 (Fair distribution of rations)"
    ],
    deadlineDays: 30
  },
  "Pension": {
    ministry: "Ministry of Personnel, Public Grievances and Pensions / Department of Pension & Pensioners Welfare",
    legalReferences: [
      "Central Civil Services (Pension) Rules, 2021",
      "Article 300A of the Constitution of India (Right to Property - Pension as earned right)"
    ],
    deadlineDays: 30
  },
  "Certificate": {
    ministry: "Ministry of Electronics and Information Technology / State Revenue Department",
    legalReferences: [
      "Information Technology Act, 2000 (Section 4 - Electronic records acceptance)",
      "State Right to Public Services Act (Timely issue of certificates)"
    ],
    deadlineDays: 15
  }
};

// Predefined Official Government Portals & Intent Mapping Engine
const officialPortalMap = {
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

// Keyword + Semantic Intent Classifier Function
const classifyGrievanceAndRoutePortal = async (complaintText) => {
  const textLower = complaintText.toLowerCase();

  // 1. Keyword Matching Score Calculation
  let bestMatchKey = null;
  let maxKeywordScore = 0;

  for (const [key, mapping] of Object.entries(officialPortalMap)) {
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

  let keywordMatchedCategory = bestMatchKey ? officialPortalMap[bestMatchKey] : null;
  let calculatedConfidence = maxKeywordScore >= 2 ? 88 : maxKeywordScore === 1 ? 55 : 40;

  // 2. Semantic Intent Classification via Groq Llama 3.3 (if available)
  if (groq) {
    try {
      const prompt = `Analyze this Indian citizen grievance text and determine intent:
      Text: "${complaintText}"

      Categories & Target Official Portals:
      - "certificate/service delay": Seva Sindhu (https://sevasindhu.karnataka.gov.in)
      - "electricity": BESCOM (https://bescom.karnataka.gov.in)
      - "police": Police portal (https://ksp.karnataka.gov.in)
      - "RTI": RTI portal (https://rtionline.gov.in)
      - "consumer": Consumer portal (https://edaakhil.nic.in)
      - "general grievance": Janaspandana (https://janaspandana.karnataka.gov.in)

      If confidence is below 60 or intent is ambiguous, specify CPGRAMS fallback (https://pgportal.gov.in).

      Output strict JSON:
      {
        "issueType": "Brief descriptive issue type",
        "category": "certificate/service delay" | "electricity" | "police" | "RTI" | "consumer" | "general grievance",
        "urgency": "low" | "medium" | "high",
        "confidence": 90,
        "department": "Department Name",
        "portalName": "Seva Sindhu" | "BESCOM" | "Police portal" | "RTI portal" | "Consumer portal" | "Janaspandana" | "CPGRAMS fallback",
        "redirectUrl": "https://...",
        "reason": "1-sentence intent explanation"
      }`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a legal-tech intent & government portal classifier for India. Always output valid JSON.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      const aiRes = JSON.parse(completion.choices[0].message.content.trim());
      if (aiRes && aiRes.portalName && aiRes.redirectUrl) {
        if ((aiRes.confidence || 70) < 60) {
          aiRes.portalName = "CPGRAMS fallback";
          aiRes.redirectUrl = "https://pgportal.gov.in";
          aiRes.category = "general grievance";
          aiRes.issueType = "General Public Grievance (CPGRAMS Fallback)";
        }
        return aiRes;
      }
    } catch (err) {
      console.warn('Groq Semantic Classification failed, falling back to Keyword matcher:', err.message);
    }
  }

  // 3. Fallback logic when Groq API key is offline or failed
  if (keywordMatchedCategory && calculatedConfidence >= 60) {
    return {
      issueType: keywordMatchedCategory.issueType,
      category: keywordMatchedCategory.category,
      urgency: maxKeywordScore >= 2 ? "high" : "medium",
      confidence: calculatedConfidence,
      department: keywordMatchedCategory.department,
      portalName: keywordMatchedCategory.portalName,
      redirectUrl: keywordMatchedCategory.redirectUrl,
      reason: `Keyword & intent pattern matched keywords for ${keywordMatchedCategory.issueType}.`
    };
  }

  // Low confidence / Unmatched Fallback -> CPGRAMS fallback
  return {
    issueType: "General Public Grievance (CPGRAMS Fallback)",
    category: "general grievance",
    urgency: "medium",
    confidence: 50,
    department: "Ministry of Personnel, Public Grievances and Pensions",
    portalName: "CPGRAMS fallback",
    redirectUrl: "https://pgportal.gov.in",
    reason: "Confidence below threshold (50%). Automatically routing to CPGRAMS central public grievance fallback portal."
  };
};

const classifyGrievance = async (complaintText) => {
  return await classifyGrievanceAndRoutePortal(complaintText);
};

// Helper 2: Route Category (hardcoded rulebook + Groq secondary inference)
const routeGrievance = async (category) => {
  // Check primary rulebook
  if (categoryRulebook[category]) {
    return {
      ministry: categoryRulebook[category].ministry,
      legalReferences: categoryRulebook[category].legalReferences,
      deadlineDays: categoryRulebook[category].deadlineDays
    };
  }

  // Secondary dynamic AI mapping
  if (!groq) {
    return {
      ministry: "Ministry of Public Grievances",
      legalReferences: ["Citizen Charter rules"],
      deadlineDays: 30
    };
  }

  try {
    const prompt = `Infer the appropriate Indian Government Ministry or Department, key legal references (Acts/Sections), and standard administrative resolution deadline (in days, as a number) for a complaint in the category: "${category}".
    
    Return a valid JSON object matching this schema:
    {
      "ministry": "Ministry Name / Department Name",
      "legalReferences": ["Act Reference 1", "Act Reference 2"],
      "deadlineDays": 30
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a government department routing advisor. Always return JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    return {
      ministry: result.ministry || 'Ministry of Personnel, Public Grievances and Pensions',
      legalReferences: result.legalReferences || ['Citizen Charter Standard Guidelines'],
      deadlineDays: result.deadlineDays || 30
    };
  } catch (err) {
    console.error('Groq Routing Error:', err.message);
    return {
      ministry: "Ministry of Public Grievances [Fallback]",
      legalReferences: ["Citizen Charter guidelines"],
      deadlineDays: 30
    };
  }
};

// Helper 3: AI Formal Complaint Letter Draft
const draftLetter = async (complaintText, ministry, legalReferences, citizenDetails) => {
  const fallbackText = `From:\n${citizenDetails.firstName} ${citizenDetails.lastName}\nPhone: ${citizenDetails.phone}\nAddress: ${citizenDetails.address || 'Not provided'}\n\nTo:\nThe Public Officer,\n${ministry}\n\nSubject: Formal Complaint regarding public grievance\n\nRespected Sir/Madam,\n\nI am writing to file a complaint regarding the following issue:\n${complaintText}\n\nThis violates standards under: ${legalReferences.join(', ')}.\n\nPlease resolve this at the earliest.\n\nYours faithfully,\n${citizenDetails.firstName} ${citizenDetails.lastName}`;

  if (!groq) {
    return fallbackText;
  }

  try {
    const prompt = `Write a formal administrative complaint letter in India.
    
    DETAILS:
    - From: ${citizenDetails.firstName} ${citizenDetails.lastName}, Phone: ${citizenDetails.phone}, Address: ${citizenDetails.address || 'Not provided'}
    - To: The Public Grievance Officer, ${ministry}
    - Details of Issue: ${complaintText}
    - Cited Legal Basis: ${legalReferences.join('; ')}
    
    Format the output professionally with clear "From", "To", "Subject", and formal salutations. Citing the legal references clearly. Write only the letter itself. Do not include markdown code block characters like \`\`\`.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a senior legal draftsman for Indian citizens. Write professional, respectful, formal letters.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile'
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq Drafting Error:', err.message);
    return fallbackText;
  }
};

// Helper 4: AI First Appeal Letter Draft
const draftAppeal = async (complaintText, ministry, legalReferences, daysLate, citizenDetails) => {
  const fallbackText = `From:\n${citizenDetails.firstName} ${citizenDetails.lastName}\nPhone: ${citizenDetails.phone}\nAddress: ${citizenDetails.address || 'Not provided'}\n\nTo:\nThe First Appellate Authority (FAA),\n${ministry}\n\nSubject: First Appeal under Section 19(1) of the RTI Act, 2005 / Citizen Charter rules\n\nRespected Sir/Madam,\n\nI had filed a grievance/application on this subject: "${complaintText}".\n\nAs per standard guidelines, the resolution deadline was capped. However, ${daysLate} days have passed beyond the mandated window, and no response has been received. This delay constitutes a denial of service.\n\nPlease direct the concerned officer to provide the response immediately.\n\nYours faithfully,\n${citizenDetails.firstName} ${citizenDetails.lastName}`;

  if (!groq) {
    return fallbackText;
  }

  try {
    const prompt = `Write a First Appeal letter under Section 19(1) of the Right to Information Act, 2005 (or Citizen Charter timeline rules) for a delayed grievance response.
    
    DETAILS:
    - Appellant: ${citizenDetails.firstName} ${citizenDetails.lastName}, Phone: ${citizenDetails.phone}, Address: ${citizenDetails.address || 'Not provided'}
    - Concern Department: ${ministry}
    - Original Complaint Text: ${complaintText}
    - Legal References: ${legalReferences.join('; ')}
    - Days Overdue: ${daysLate} days
    
    Format the letter professionally. Address it to the "First Appellate Authority (FAA)" of the department. Be firm and formal, demanding immediate disposal of the file. Write only the letter itself. Do not include markdown code block characters like \`\`\`.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a legal advisor writing an official first appeal docket for an overdue government case. Output only the letter text.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile'
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq Appeal Drafting Error:', err.message);
    return fallbackText;
  }
};


/* -------------------------------------------------------------
   Express Controller Actions
------------------------------------------------------------- */

// @desc    Trigger AI analysis on raw text (Dry Run / Classification)
// @route   POST /api/grievances/classify
// @access  Private
exports.analyzeGrievance = async (req, res) => {
  const { complaintText } = req.body;

  if (!complaintText) {
    return res.status(400).json({ success: false, message: 'Please provide complaint text' });
  }

  try {
    const citizen = req.user || { firstName: 'Citizen', lastName: '', phone: '9876543210', state: 'Maharashtra', district: 'Mumbai', address: '' };
    const classification = await classifyGrievanceAndRoutePortal(complaintText);
    const routing = await routeGrievance(classification.category);
    const letter = await draftLetter(complaintText, classification.department || routing.ministry, routing.legalReferences, citizen);
    const rti = await draftRti(complaintText, classification.department || routing.ministry, citizen);

    // Compute dynamic summary and next action
    const summary = complaintText.length > 120 ? complaintText.substring(0, 120) + '...' : complaintText;
    const nextAction = classification.urgency === 'high'
      ? `File Immediate Complaint on ${classification.portalName || 'official portal'}. Auto-redirect active.`
      : `Submit formal grievance letter directly via ${classification.portalName || 'official portal'}.`;

    res.status(200).json({
      success: true,
      data: {
        issueType: classification.issueType || classification.category,
        category: classification.category,
        urgency: classification.urgency || 'medium',
        confidence: classification.confidence || 75,
        reason: classification.reason,
        department: classification.department || routing.ministry,
        portalName: classification.portalName || 'CPGRAMS National Public Grievance Portal',
        redirectUrl: classification.redirectUrl || 'https://pgportal.gov.in',
        legalReferences: routing.legalReferences,
        deadlineDays: routing.deadlineDays,
        summary,
        nextAction,
        formalLetter: letter,
        rtiDraft: rti
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all grievances for logged in user
// @route   GET /api/grievances
// @access  Private
exports.getGrievances = async (req, res) => {
  try {
    let grievances;
    try {
      grievances = await Grievance.find({ user: req.user.id }).sort('-submittedAt');
    } catch (dbErr) {
      console.warn('Database offline, reading from mock lists');
      grievances = mockGrievances.filter(g => g.user.toString() === req.user.id.toString());
    }
    res.status(200).json({ success: true, count: grievances.length, data: grievances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single grievance
// @route   GET /api/grievances/:id
// @access  Private
exports.getGrievance = async (req, res) => {
  try {
    let grievance;
    try {
      grievance = await Grievance.findOne({ _id: req.params.id, user: req.user.id });
    } catch (dbErr) {
      console.warn('Database offline, reading from mock lists');
      grievance = mockGrievances.find(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
    }

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new grievance (runs classify -> route -> draft)
// @route   POST /api/grievances
// @access  Private
exports.createGrievance = async (req, res) => {
  const { complaintText, proofUrl, referenceNumber, category, urgency, department } = req.body;

  if (!complaintText) {
    return res.status(400).json({ success: false, message: 'Please add complaint text' });
  }

  try {
    // 1. Intent & Official Portal Classification
    const portalClass = await classifyGrievanceAndRoutePortal(complaintText);
    let finalCategory = category || portalClass.category || 'General';
    let finalUrgency = urgency || portalClass.urgency || 'medium';
    let confidence = portalClass.confidence || 85;
    let finalDept = department || portalClass.department;
    let portalName = portalClass.portalName;
    let redirectUrl = portalClass.redirectUrl;

    // 2. Routing (look up legal references & deadline days)
    const route = await routeGrievance(finalCategory);
    finalDept = finalDept || route.ministry;
    const finalRefs = route.legalReferences;
    const finalDeadline = route.deadlineDays;

    // Citizen details object
    const citizenDetails = {
      firstName: req.user.firstName || 'Adhikar',
      lastName: req.user.lastName || 'Citizen',
      phone: req.user.phone || '9876543210',
      address: `${req.user.district || 'District'}, ${req.user.state || 'State'}`
    };

    // 3. Draft letter
    const formalLetterText = await draftLetter(complaintText, finalDept, finalRefs, citizenDetails);

    // Static structures for RTI & Appeal drafts
    const rtiDraftText = `To,\nThe Public Information Officer (PIO)\nOffice of the ${finalDept}\n\nSubject: Application under Section 6(1) of the RTI Act, 2005.\n\n1. Applicant Name: ${citizenDetails.firstName} ${citizenDetails.lastName}\n2. Address: ${citizenDetails.address}\n3. Information Sought:\n- Provide copies of sanctioned work logs and budgets regarding: "${complaintText.substring(0, 100)}..."\n- Provide the names and designations of engineers responsible for monitoring service delivery.\n\nFee: A Rs. 10 postal order is enclosed.`;
    const appealTextDefault = `To,\nThe First Appellate Authority (FAA)\nOffice of the ${finalDept}\n\nSubject: First Appeal under Section 19(1) of the RTI Act, 2005\n\nRespected Sir/Madam,\n\nThis is a first appeal registered because the timeline for public services concerning "${complaintText.substring(0, 80)}..." has been exceeded without resolution. Kindly direct the PIO to take instant action.`;
    const appeal2TextDefault = `To,\nThe Central Information Commission (CIC)\n\nSubject: Second Appeal under Section 19(3) of the RTI Act, 2005\n\nRespected Commissioners,\n\nNo response has been received from either the PIO or the First Appellate Authority. This second appeal requests penalty orders against the defaulting public officer.`;

    let grievance;
    try {
      grievance = await Grievance.create({
        user: req.user.id,
        complaintText,
        proofUrl,
        referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        category: finalCategory,
        urgency: finalUrgency,
        department: finalDept,
        portalName,
        redirectUrl,
        confidence,
        state: req.user.state || 'Maharashtra',
        district: req.user.district || 'Mumbai',
        status: 'Pending',
        formalLetter: formalLetterText,
        rtiDraft: rtiDraftText,
        appealDraft: appealTextDefault,
        appeal2Draft: appeal2TextDefault,
        deadlineDays: finalDeadline,
        submittedAt: new Date()
      });
    } catch (dbErr) {
      console.warn('Database offline, saving in-memory');
      grievance = {
        _id: 'mock_grievance_' + Math.random().toString(36).substr(2, 9),
        user: req.user.id,
        complaintText,
        proofUrl,
        referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        category: finalCategory,
        urgency: finalUrgency,
        department: finalDept,
        portalName,
        redirectUrl,
        confidence,
        state: req.user.state || 'Maharashtra',
        district: req.user.district || 'Mumbai',
        status: 'Pending',
        formalLetter: formalLetterText,
        rtiDraft: rtiDraftText,
        appealDraft: appealTextDefault,
        appeal2Draft: appeal2TextDefault,
        deadlineDays: finalDeadline,
        submittedAt: new Date()
      };
      mockGrievances.unshift(grievance);
    }

    res.status(201).json({ success: true, data: grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check case deadline, generate appeal if overdue
// @route   POST /api/grievances/:id/check-deadline
// @access  Private
exports.checkDeadline = async (req, res) => {
  try {
    let grievance;
    try {
      grievance = await Grievance.findOne({ _id: req.params.id, user: req.user.id });
    } catch (dbErr) {
      console.warn('Database offline, fetching from mock list');
      grievance = mockGrievances.find(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
    }

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance record not found' });
    }

    // Date Logic
    const submittedDate = new Date(grievance.submittedAt);
    const deadlineDays = grievance.deadlineDays || 30;
    const deadlineDate = new Date(submittedDate.getTime() + deadlineDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const isOverdue = today > deadlineDate;

    if (isOverdue) {
      const daysLate = Math.ceil((today - deadlineDate) / (1000 * 60 * 60 * 24));
      
      const citizenDetails = {
        firstName: req.user.firstName || 'Adhikar',
        lastName: req.user.lastName || 'Citizen',
        phone: req.user.phone || '9876543210',
        address: `${req.user.district || 'District'}, ${req.user.state || 'State'}`
      };

      // Call AI to draft a First Appeal letter
      const routedRefs = categoryRulebook[grievance.category] ? categoryRulebook[grievance.category].legalReferences : ["Citizen Charter rules"];
      const appealText = await draftAppeal(grievance.complaintText, grievance.department, routedRefs, daysLate, citizenDetails);

      // Update Grievance
      try {
        grievance = await Grievance.findOneAndUpdate(
          { _id: req.params.id, user: req.user.id },
          { status: 'Overdue', appealDraft: appealText },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('Database offline, updating mock memory state');
        const idx = mockGrievances.findIndex(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
        if (idx !== -1) {
          mockGrievances[idx].status = 'Overdue';
          mockGrievances[idx].appealDraft = appealText;
          grievance = mockGrievances[idx];
        }
      }

      return res.status(200).json({
        success: true,
        overdue: true,
        daysLate,
        status: grievance.status,
        appealDraft: grievance.appealDraft,
        message: 'Deadline exceeded. First Appeal draft generated successfully.'
      });
    } else {
      const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
      return res.status(200).json({
        success: true,
        overdue: false,
        daysLeft,
        status: grievance.status,
        message: `Case is currently on schedule. ${daysLeft} days remaining.`
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate time passage for a grievance and trigger overdue appeal generation
// @route   POST /api/grievances/:id/time-leap
// @access  Private
exports.timeLeap = async (req, res) => {
  const { days } = req.body;

  if (!days || typeof days !== 'number' || days <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a positive days value' });
  }

  try {
    let grievance;
    try {
      grievance = await Grievance.findOne({ _id: req.params.id, user: req.user.id });
    } catch (dbErr) {
      console.warn('Database offline, fetching mock grievance for time-leap');
      grievance = mockGrievances.find(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
    }

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const originalSubmittedAt = new Date(grievance.submittedAt);
    const newSubmittedAt = new Date(originalSubmittedAt.getTime() - days * 24 * 60 * 60 * 1000);
    const deadlineDays = grievance.deadlineDays || 30;
    const deadlineDate = new Date(newSubmittedAt.getTime() + deadlineDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    const isOverdue = today > deadlineDate;

    let updatedGrievance = grievance;
    let appealText = grievance.appealDraft;

    if (isOverdue) {
      const daysLate = Math.ceil((today - deadlineDate) / (1000 * 60 * 60 * 24));

      const citizenDetails = {
        firstName: req.user.firstName || 'Adhikar',
        lastName: req.user.lastName || 'Citizen',
        phone: req.user.phone || '9876543210',
        address: `${req.user.district || 'District'}, ${req.user.state || 'State'}`
      };
      const routedRefs = categoryRulebook[grievance.category] ? categoryRulebook[grievance.category].legalReferences : ['Citizen Charter rules'];
      appealText = await draftAppeal(grievance.complaintText, grievance.department, routedRefs, daysLate, citizenDetails);

      try {
        updatedGrievance = await Grievance.findOneAndUpdate(
          { _id: req.params.id, user: req.user.id },
          { submittedAt: newSubmittedAt, status: 'Overdue', appealDraft: appealText },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('Database offline, updating mock grievance for overdue time-leap');
        const index = mockGrievances.findIndex(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
        if (index !== -1) {
          mockGrievances[index] = {
            ...mockGrievances[index],
            submittedAt: newSubmittedAt,
            status: 'Overdue',
            appealDraft: appealText
          };
          updatedGrievance = mockGrievances[index];
        }
      }

      return res.status(200).json({
        success: true,
        overdue: true,
        daysLate,
        data: updatedGrievance,
        message: 'Deadline missed — First Appeal auto-drafted.'
      });
    }

    try {
      updatedGrievance = await Grievance.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { submittedAt: newSubmittedAt },
        { new: true }
      );
    } catch (dbErr) {
      console.warn('Database offline, updating mock grievance submittedAt only');
      const index = mockGrievances.findIndex(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
      if (index !== -1) {
        mockGrievances[index] = {
          ...mockGrievances[index],
          submittedAt: newSubmittedAt
        };
        updatedGrievance = mockGrievances[index];
      }
    }

    return res.status(200).json({
      success: true,
      overdue: false,
      data: updatedGrievance,
      message: `Time leap applied: ${days} days earlier. Case is still within deadline.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update grievance details (e.g. tracking number, status, submission date for testing)
// @route   PUT /api/grievances/:id
// @access  Private
exports.updateGrievance = async (req, res) => {
  try {
    let grievance;
    try {
      grievance = await Grievance.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );
    } catch (dbErr) {
      console.warn('Database offline, updating mock grievance');
      const index = mockGrievances.findIndex(g => g._id === req.params.id && g.user.toString() === req.user.id.toString());
      if (index !== -1) {
        mockGrievances[index] = { ...mockGrievances[index], ...req.body };
        grievance = mockGrievances[index];
      }
    }

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
