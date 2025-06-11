// Store the current soulmark data temporarily
let currentSoulmarkData = null;

// Import config (this will be available in service worker context)
importScripts('../config.js');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSoulmarkPopup') {
    // Store the data for the popup
    currentSoulmarkData = request.data;
    
    // Open the popup
    chrome.action.openPopup();
    
    sendResponse({ success: true });
  } else if (request.action === 'getSoulmarkData') {
    // Send the stored data to the popup
    sendResponse({ data: currentSoulmarkData });
  } else if (request.action === 'clearSoulmarkData') {
    // Clear the data after use
    currentSoulmarkData = null;
    sendResponse({ success: true });
  } else if (request.action === 'soulmarkComplete') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        // Send the soulmark code back to the content script
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'insertSoulmark',
          code: request.code
        });
      }
    });
    
    sendResponse({ success: true });
  } else if (request.action === 'getConfig') {
    // Send config to content script
    sendResponse({ config: CONFIG });
  }
  
  return true; // Keep the message channel open for async responses
});

// Generate a random soulmark code
function generateSoulmarkCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Export for use in popup if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSoulmarkCode };
}