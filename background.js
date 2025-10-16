// background.js - Background script for URL redirector
let redirectionRules = [];
let redirectionStats = {};

// Normalize URL for matching (remove protocol and www)
function normalizeUrl(url) {
  let normalized = url;

  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');

  // Remove www. prefix
  normalized = normalized.replace(/^www\./, '');

  return normalized;
}

// Extract protocol from URL
function getProtocol(url) {
  const match = url.match(/^(https?:\/\/)/);
  return match ? match[1] : 'https://';
}

// Initialize data from storage
chrome.storage.sync.get(['redirectionRules', 'redirectionStats'], (data) => {
  if (chrome.runtime.lastError) {
    console.error('[Redirector] Error loading from storage:', chrome.runtime.lastError);
    redirectionRules = [];
    redirectionStats = {};
  } else {
    redirectionRules = (data && data.redirectionRules) || [];
    redirectionStats = (data && data.redirectionStats) || {};
  }
  console.log('[Redirector] Extension loaded. Rules count:', redirectionRules.length);
  console.log('[Redirector] Rules:', JSON.stringify(redirectionRules, null, 2));
});

// Save stats to storage
function saveStats() {
  chrome.storage.sync.set({ redirectionStats });
}

// Log a redirect
function logRedirect(source, destination, timestamp) {
  const key = `${source} -> ${destination}`;
  if (!redirectionStats[key]) {
    redirectionStats[key] = {
      source,
      destination,
      count: 0,
      lastRedirect: null
    };
  }
  redirectionStats[key].count++;
  redirectionStats[key].lastRedirect = timestamp;
  saveStats();
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.redirectionRules) {
    redirectionRules = changes.redirectionRules.newValue || [];
  }
  if (changes.redirectionStats) {
    redirectionStats = changes.redirectionStats.newValue || {};
  }
});

// Handle redirects using webRequest API (still supported in MV3 for Firefox)
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;

    // Skip extension URLs and data URLs
    if (url.startsWith('moz-extension://') || url.startsWith('data:')) {
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    console.log('[Redirector] Checking:', normalizedUrl);

    // Check each rule
    for (let rule of redirectionRules) {
      if (!rule.enabled) continue;

      const source = rule.source;
      const dest = rule.destination;
      const normalizedSource = normalizeUrl(source);

      console.log('[Redirector] Testing:', normalizedSource);

      // Check if normalized URLs match (exact match or path under source)
      if (normalizedUrl === normalizedSource || normalizedUrl.startsWith(normalizedSource + '/')) {
        let redirectUrl;

        // If it's an exact match, use the destination as-is
        if (normalizedUrl === normalizedSource) {
          redirectUrl = dest;
        } else {
          // If there's a path after the source, append it to the destination
          const pathAfterSource = normalizedUrl.substring(normalizedSource.length);
          redirectUrl = dest + pathAfterSource;
        }

        // Ensure the redirect URL has a protocol
        if (!redirectUrl.match(/^https?:\/\//)) {
          const protocol = getProtocol(url);
          redirectUrl = protocol + redirectUrl;
        }

        console.log('[Redirector] MATCH! Redirecting to:', redirectUrl);

        // Log the redirect
        logRedirect(source, dest, Date.now());

        return { redirectUrl };
      }
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame"] },
  ["blocking"]
);