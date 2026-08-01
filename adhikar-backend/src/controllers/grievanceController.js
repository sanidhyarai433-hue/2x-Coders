const Grievance = require('../models/Grievance');

// In-memory store for demonstration if MongoDB connection is offline
let mockGrievances = [
  {
    _id: 'mock_grievance_1',
    user: 'mock_citizen_id_12345',
    title: 'High Fluoride and Sewage Mixing in Municipal Water',
    description: 'Since July 15, the municipal tap water has been dark yellow and smelling of sewage. Multiple children in ward 4 have fallen ill. Local water department has ignored 3 calls.',
    category: 'Water & Sanitation',
    ministry: 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation',
    legalReferences: [
      'Section 3 of the Water (Prevention and Control of Pollution) Act, 1974',
      'Article 21 of the Constitution of India (Right to Clean Drinking Water as part of Right to Life)'
    ],
    status: 'Ready to File',
    trackingNumber: '',
    copilotSteps: [
      { field: 'Grievance Description', value: 'High Fluoride and sewage mixing in Municipal Water. Tap water is yellow/sewage smelling in Ward 4. No action taken by local engineer. Health hazard to residents.', helpText: 'Paste this into CPGRAMS Description box.', selector: '#grievance_desc' },
      { field: 'Ministry/Department', value: 'Ministry of Jal Shakti', helpText: 'Select "Ministry of Jal Shakti" from the ministry dropdown.', selector: '#ministry_dropdown' }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

// @desc    Get all grievances for logged in user
// @route   GET /api/grievances
// @access  Private
exports.getGrievances = async (req, res) => {
  try {
    let grievances;
    try {
      grievances = await Grievance.find({ user: req.user.id }).sort('-createdAt');
    } catch (dbErr) {
      console.warn('Database offline, using mock grievance list');
      grievances = mockGrievances.filter(g => g.user === req.user.id);
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
      console.warn('Database offline, reading from mock storage');
      grievance = mockGrievances.find(g => g._id === req.params.id && g.user === req.user.id);
    }

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new grievance (with AI Structuring mock)
// @route   POST /api/grievances
// @access  Private
exports.createGrievance = async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ success: false, message: 'Please add all required fields' });
  }

  // Pre-mapping based on categories to simulate precise AI legal translation
  let ministry = 'Ministry of Public Grievances';
  let legalReferences = [];

  switch (category) {
    case 'Water & Sanitation':
      ministry = 'Ministry of Jal Shakti / Department of Drinking Water and Sanitation';
      legalReferences = [
        'Section 3 of the Water (Prevention and Control of Pollution) Act, 1974',
        'Article 21 of the Constitution of India (Right to Clean Drinking Water)'
      ];
      break;
    case 'Roads & Transport':
      ministry = 'Ministry of Road Transport and Highways';
      legalReferences = [
        'Section 198A of the Motor Vehicles (Amendment) Act, 2019 (Failure to maintain design standards)',
        'Law of Torts (Negligence of Public Utility authorities)'
      ];
      break;
    case 'Electricity & Power':
      ministry = 'Ministry of Power';
      legalReferences = [
        'Section 43 of the Electricity Act, 2003 (Duty to supply on request)',
        'Electricity Consumer Rights Rules, 2020'
      ];
      break;
    case 'Consumer Rights':
      ministry = 'Ministry of Consumer Affairs, Food and Public Distribution';
      legalReferences = [
        'Section 2(9) of the Consumer Protection Act, 2019 (Definition of Consumer Rights)',
        'Right to seek redressal against unfair trade practices'
      ];
      break;
    default:
      ministry = 'Ministry of Personnel, Public Grievances and Pensions';
      legalReferences = ['Citizen Charter Act principles (Standard service delivery timeline)'];
  }

  const copilotSteps = [
    {
      field: 'Grievance Description',
      value: `SUBJECT: Complaint regarding ${title}.\n\nDETAILS: ${description}\n\nLEGAL BASIS: ${legalReferences.join('; ')}`,
      helpText: 'Click to copy this formatted draft and paste it into the main Grievance Description field.',
      selector: '#grievance_description'
    },
    {
      field: 'Ministry/Department Select',
      value: ministry,
      helpText: `Navigate the dropdown tree to select: ${ministry}`,
      selector: '#department_dropdown'
    }
  ];

  try {
    let grievance;
    try {
      grievance = await Grievance.create({
        user: req.user.id,
        title,
        description,
        category,
        ministry,
        legalReferences,
        status: 'Ready to File',
        copilotSteps
      });
    } catch (dbErr) {
      console.warn('Database offline, storing grievance in-memory');
      grievance = {
        _id: 'mock_grievance_' + Math.random().toString(36).substr(2, 9),
        user: req.user.id,
        title,
        description,
        category,
        ministry,
        legalReferences,
        status: 'Ready to File',
        copilotSteps,
        createdAt: new Date()
      };
      mockGrievances.push(grievance);
    }

    res.status(201).json({ success: true, data: grievance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update grievance details (e.g. tracking number, status)
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
      const index = mockGrievances.findIndex(g => g._id === req.params.id && g.user === req.user.id);
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
