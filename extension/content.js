console.log("Adhikar AI Copilot Extension active on portal.");

// Injects custom style indicator
const addStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .adhikar-highlight {
      border: 2px solid #FF9933 !important;
      background-color: rgba(255, 153, 51, 0.05) !important;
    }
    .adhikar-btn {
      background: linear-gradient(135deg, #FF9933 0%, #e67e1a 100%) !important;
      color: #0f172a !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 6px 12px !important;
      font-size: 11px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
      margin-left: 8px !important;
      display: inline-block !important;
      font-family: Arial, sans-serif !important;
    }
    .adhikar-btn:hover {
      background: #e67e1a !important;
    }
  `;
  document.head.appendChild(style);
};

// Check for target fields and append helpers
const injectHelpers = () => {
  // 1. CPGRAMS description field selector: typical IDs are #GrievanceText or #GrievanceTextarea or names
  const descField = document.querySelector('textarea[name*="grievance"]') || document.querySelector('#GrievanceText') || document.querySelector('#desc');
  
  if (descField && !document.querySelector('#adhikar-desc-helper-btn')) {
    descField.classList.add('adhikar-highlight');
    
    // Create prefill helper button
    const btn = document.createElement('button');
    btn.id = 'adhikar-desc-helper-btn';
    btn.className = 'adhikar-btn';
    btn.type = 'button';
    btn.innerText = '📋 Paste Adhikar Draft';
    
    btn.addEventListener('click', async () => {
      try {
        // Read text from user clipboard
        const text = await navigator.clipboard.readText();
        if (text) {
          descField.value = text;
          // Trigger change events so React/Vue on the target page registers input
          descField.dispatchEvent(new Event('input', { bubbles: true }));
          descField.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          alert("Adhikar Clipboard is empty. Please copy the draft from Adhikar Web first!");
        }
      } catch (err) {
        alert("Clipboard access denied. Please paste it manually, or allow clipboard permissions for this extension.");
      }
    });
    
    // Append button after textarea
    descField.parentNode.insertBefore(btn, descField.nextSibling);
  }

  // 2. Ministry Dropdown
  const deptDropdown = document.querySelector('select[name*="ministry"]') || document.querySelector('select[name*="department"]') || document.querySelector('#department');
  if (deptDropdown && !document.querySelector('#adhikar-dept-helper-btn')) {
    deptDropdown.classList.add('adhikar-highlight');
  }
};

// Start injection loop
addStyles();
setInterval(injectHelpers, 2000); // Poll since portals load views dynamically
