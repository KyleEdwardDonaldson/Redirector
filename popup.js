// popup.js - Quick access popup functionality
let rules = [];
let stats = {};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('openOptions').addEventListener('click', openOptions);
  document.getElementById('toggleAll').addEventListener('click', toggleAllRules);
}

// Load data from storage
function loadData() {
  chrome.storage.sync.get(['redirectionRules', 'redirectionStats'], (data) => {
    if (chrome.runtime.lastError) {
      console.error('[Popup] Error loading from storage:', chrome.runtime.lastError);
      rules = [];
      stats = {};
    } else {
      rules = (data && data.redirectionRules) || [];
      stats = (data && data.redirectionStats) || {};
    }

    updateStats();
    renderRules();
  });
}

// Update statistics display
function updateStats() {
  const activeRules = rules.filter(r => r.enabled).length;
  const totalRedirects = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);

  document.getElementById('activeRules').textContent = `${activeRules} / ${rules.length}`;
  document.getElementById('totalRedirects').textContent = totalRedirects;

  // Update toggle all button text
  const toggleBtn = document.getElementById('toggleAll');
  if (activeRules === 0) {
    toggleBtn.textContent = 'Enable All Rules';
  } else {
    toggleBtn.textContent = 'Disable All Rules';
  }
}

// Render rules list
function renderRules() {
  const container = document.getElementById('rulesList');

  // Clear container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (rules.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = 'No rules configured';
    container.appendChild(emptyDiv);
    return;
  }

  rules.forEach((rule, index) => {
    const div = document.createElement('div');
    div.className = `rule-item ${!rule.enabled ? 'rule-disabled' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'rule-toggle';
    checkbox.checked = rule.enabled;
    checkbox.addEventListener('change', () => toggleRule(index));

    const text = document.createElement('div');
    text.className = 'rule-text';
    text.textContent = `${rule.source} → ${rule.destination}`;
    text.title = `${rule.source} → ${rule.destination}`;

    div.appendChild(checkbox);
    div.appendChild(text);
    container.appendChild(div);
  });
}

// Toggle a single rule
function toggleRule(index) {
  rules[index].enabled = !rules[index].enabled;
  chrome.storage.sync.set({ redirectionRules: rules }, () => {
    updateStats();
    renderRules();
  });
}

// Toggle all rules
function toggleAllRules() {
  const activeRules = rules.filter(r => r.enabled).length;
  const shouldEnable = activeRules === 0;

  rules.forEach(rule => {
    rule.enabled = shouldEnable;
  });

  chrome.storage.sync.set({ redirectionRules: rules }, () => {
    updateStats();
    renderRules();
  });
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.redirectionRules || changes.redirectionStats) {
    loadData();
  }
});
