// options.js - Enhanced with rule management, import/export, and statistics
let rules = [];
let stats = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadRules();
  loadStats();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('addRule').addEventListener('click', addNewRule);
  document.getElementById('importRules').addEventListener('click', importRules);
  document.getElementById('exportRules').addEventListener('click', exportRules);
  document.getElementById('clearStats').addEventListener('click', clearStatistics);
  document.getElementById('fileInput').addEventListener('change', handleFileImport);
}

// Load rules from storage
function loadRules() {
  chrome.storage.sync.get('redirectionRules', (data) => {
    if (chrome.runtime.lastError) {
      console.error('[Options] Error loading rules:', chrome.runtime.lastError);
      rules = [];
    } else {
      rules = (data && data.redirectionRules) || [];
    }
    console.log('[Options] Loaded rules from storage:', rules);
    renderRules();
  });
}

// Load statistics from storage
function loadStats() {
  chrome.storage.sync.get('redirectionStats', (data) => {
    if (chrome.runtime.lastError) {
      console.error('[Options] Error loading stats:', chrome.runtime.lastError);
      stats = {};
    } else {
      stats = (data && data.redirectionStats) || {};
    }
    renderStats();
  });
}

// Save rules to storage
function saveRules() {
  console.log('[Options] Saving rules to storage:', rules);
  chrome.storage.sync.set({ redirectionRules: rules }, () => {
    if (chrome.runtime.lastError) {
      console.error('[Options] Error saving rules:', chrome.runtime.lastError);
      showStatus('Error saving rules: ' + chrome.runtime.lastError.message, 'error');
    } else {
      console.log('[Options] Rules saved successfully');
      showStatus('Rules saved successfully!', 'success');
    }
  });
}

// Render rules table
function renderRules() {
  const tbody = document.getElementById('rulesBody');
  tbody.innerHTML = '';

  console.log('[Options] Rendering rules. Count:', rules.length);

  if (rules.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-state';
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No rules configured. Click "Add Rule" to create one.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  rules.forEach((rule, index) => {
    console.log('[Options] Rendering rule', index, ':', rule);
    const row = document.createElement('tr');

    // Create enabled checkbox
    const enabledCell = document.createElement('td');
    enabledCell.className = 'col-enabled';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = rule.enabled;
    checkbox.addEventListener('change', () => {
      rules[index].enabled = checkbox.checked;
      saveRules();
    });
    enabledCell.appendChild(checkbox);

    // Create source input
    const sourceCell = document.createElement('td');
    sourceCell.className = 'col-source';
    const sourceInput = document.createElement('input');
    sourceInput.type = 'text';
    sourceInput.className = 'url-input';
    sourceInput.value = rule.source || '';
    sourceInput.placeholder = 'https://example.com/old';
    sourceInput.addEventListener('change', () => {
      const value = sourceInput.value;
      if (!validateUrl(value) && value !== '') {
        showStatus('Invalid URL format', 'error');
        return;
      }
      rules[index].source = value;
      console.log('[Options] Updated source for rule', index, ':', value);
      saveRules();
    });
    sourceCell.appendChild(sourceInput);

    // Create destination input
    const destCell = document.createElement('td');
    destCell.className = 'col-dest';
    const destInput = document.createElement('input');
    destInput.type = 'text';
    destInput.className = 'url-input';
    destInput.value = rule.destination || '';
    destInput.placeholder = 'https://example.com/new';
    destInput.addEventListener('change', () => {
      const value = destInput.value;
      if (!validateUrl(value) && value !== '') {
        showStatus('Invalid URL format', 'error');
        return;
      }
      rules[index].destination = value;
      console.log('[Options] Updated destination for rule', index, ':', value);
      saveRules();
    });
    destCell.appendChild(destInput);

    // Create delete button
    const actionsCell = document.createElement('td');
    actionsCell.className = 'col-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-small btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this rule?')) {
        rules.splice(index, 1);
        renderRules();
        saveRules();
      }
    });
    actionsCell.appendChild(deleteBtn);

    // Append all cells to row
    row.appendChild(enabledCell);
    row.appendChild(sourceCell);
    row.appendChild(destCell);
    row.appendChild(actionsCell);

    tbody.appendChild(row);
  });
}

// Render statistics table
function renderStats() {
  const tbody = document.getElementById('statsBody');
  tbody.innerHTML = '';

  const statEntries = Object.values(stats);

  if (statEntries.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-state';
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No redirections yet';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  // Sort by count descending
  statEntries.sort((a, b) => b.count - a.count);

  statEntries.forEach(stat => {
    const row = document.createElement('tr');
    const lastRedirect = stat.lastRedirect ? new Date(stat.lastRedirect).toLocaleString() : 'Never';

    // Source cell
    const sourceCell = document.createElement('td');
    sourceCell.className = 'url-cell';
    sourceCell.textContent = stat.source;
    row.appendChild(sourceCell);

    // Destination cell
    const destCell = document.createElement('td');
    destCell.className = 'url-cell';
    destCell.textContent = stat.destination;
    row.appendChild(destCell);

    // Count cell
    const countCell = document.createElement('td');
    countCell.textContent = stat.count;
    row.appendChild(countCell);

    // Last redirect cell
    const dateCell = document.createElement('td');
    dateCell.textContent = lastRedirect;
    row.appendChild(dateCell);

    tbody.appendChild(row);
  });
}

// Add a new rule
function addNewRule() {
  console.log('[Options] Adding new rule');
  rules.push({
    source: '',
    destination: '',
    enabled: true
  });
  console.log('[Options] Rules array after adding:', rules);
  renderRules();
  saveRules();
}

// Import rules
function importRules() {
  document.getElementById('fileInput').click();
}

// Handle file import
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      // Support both old and new formats
      if (Array.isArray(importedData)) {
        rules = importedData;
      } else if (typeof importedData === 'object') {
        // Convert old format to new format
        rules = Object.entries(importedData).map(([source, destination]) => ({
          source,
          destination,
          enabled: true
        }));
      }

      renderRules();
      chrome.storage.sync.set({ redirectionRules: rules }, () => {
        showStatus('Rules imported successfully!', 'success');
      });
    } catch (error) {
      showStatus('Error importing rules: Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);

  // Reset file input
  event.target.value = '';
}

// Export rules
function exportRules() {
  const dataStr = JSON.stringify(rules, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `url-redirector-rules-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showStatus('Rules exported successfully!', 'success');
}

// Clear statistics
function clearStatistics() {
  if (confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
    stats = {};
    chrome.storage.sync.set({ redirectionStats: {} }, () => {
      renderStats();
      showStatus('Statistics cleared', 'success');
    });
  }
}

// Validate URL
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Show status message
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status status-${type}`;
  statusDiv.style.display = 'block';

  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.redirectionStats) {
    stats = changes.redirectionStats.newValue || {};
    renderStats();
  }
});