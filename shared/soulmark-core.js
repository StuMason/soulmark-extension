// Shared Soulmark functionality that works across all platforms

// Common words to skip when selecting words for verification
export const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'is', 'are',
  'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
  'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any', 'few',
  'more', 'most', 'other', 'such', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'my', 'your', 'his', 'her', 'its', 'our'
]);

// Select random meaningful words from text
export function selectRandomWords(text, count) {
  // Split text into words and filter out common ones
  const words = text.split(/\s+/)
    .map(word => word.replace(/[.,!?;:'"()[\]{}]/g, '').toLowerCase())
    .filter(word => word.length > 2 && !COMMON_WORDS.has(word));
  
  // Remove duplicates
  const uniqueWords = [...new Set(words)];
  
  // If we have fewer unique words than requested, return all
  if (uniqueWords.length <= count) {
    return uniqueWords;
  }
  
  // Randomly select words
  const selected = [];
  const indices = new Set();
  
  while (selected.length < count && indices.size < uniqueWords.length) {
    const index = Math.floor(Math.random() * uniqueWords.length);
    if (!indices.has(index)) {
      indices.add(index);
      selected.push(uniqueWords[index]);
    }
  }
  
  return selected;
}

// Open soulmark popup with data
export function openSoulmarkPopup(text, words) {
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('[Soulmark] Extension context invalidated. Please refresh the page.');
    alert('Soulmark extension was updated. Please refresh the page to continue.');
    return;
  }
  
  try {
    // Send message to background script to open popup
    chrome.runtime.sendMessage({
      action: 'openSoulmarkPopup',
      data: {
        text: text,
        words: words
      }
    }, response => {
      if (chrome.runtime.lastError) {
        console.error('[Soulmark] Error:', chrome.runtime.lastError.message);
        alert('Soulmark extension needs to be reloaded. Please refresh the page.');
      }
    });
  } catch (error) {
    console.error('[Soulmark] Failed to send message:', error);
    alert('Soulmark extension was updated. Please refresh the page to continue.');
  }
}

// Cache for verification results
const verificationCache = new Map();

// Verify a soulmark code
export async function verifySoulmark(code) {
  // Check cache first
  if (verificationCache.has(code)) {
    return verificationCache.get(code);
  }
  
  try {
    // Load config if not already loaded
    if (typeof CONFIG === 'undefined') {
      await loadConfig();
    }
    
    // Remove brackets and SM: prefix for API call
    const cleanCode = code.replace(/^\[SM:/i, '').replace(/\]$/, '');
    
    const response = await fetch(
      `${CONFIG.SUPABASE_URL}/functions/v1/check-soulmark?code=${encodeURIComponent(cleanCode)}`,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        }
      }
    );
    
    const result = await response.json();
    
    // Cache the result
    verificationCache.set(code, result);
    
    // Clear cache after 5 minutes
    setTimeout(() => verificationCache.delete(code), 5 * 60 * 1000);
    
    return result;
  } catch (error) {
    console.error('Error verifying soulmark:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

// Load config dynamically
export async function loadConfig() {
  return new Promise((resolve) => {
    if (!chrome.runtime?.id) {
      console.error('[Soulmark] Extension context not available');
      resolve();
      return;
    }
    
    try {
      chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Soulmark] Error loading config:', chrome.runtime.lastError.message);
        } else if (response && response.config) {
          window.CONFIG = response.config;
        }
        resolve();
      });
    } catch (error) {
      console.error('[Soulmark] Failed to load config:', error);
      resolve();
    }
  });
}

// Listen for soulmark completion messages
export function setupSoulmarkListener(insertCallback) {
  if (chrome.runtime?.id) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'insertSoulmark') {
        insertCallback(request.code);
        sendResponse({ success: true });
      }
    });
  }
}

// Create soulmark icon SVG
export function createSoulmarkIcon(size = 20) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="4" fill="currentColor"/>
    </svg>
  `;
}

// Show soulmark details in a tooltip
export function showSoulmarkDetails(code, verification, event) {
  // Remove any existing tooltip
  const existingTooltip = document.querySelector('.soulmark-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'soulmark-tooltip';
  tooltip.innerHTML = `
    <div class="soulmark-tooltip-header">
      ${createSoulmarkIcon()}
      <strong>Soulmark Verified</strong>
    </div>
    <div class="soulmark-tooltip-content">
      <p>Human verified ${verification.age}</p>
      <p>${verification.wordCount} words spoken</p>
      <p class="soulmark-code">Code: SM:${code}</p>
    </div>
  `;
  
  // Position near cursor
  document.body.appendChild(tooltip);
  
  // Remove on click outside
  setTimeout(() => {
    document.addEventListener('click', function removeTooltip() {
      tooltip.remove();
      document.removeEventListener('click', removeTooltip);
    });
  }, 100);
}