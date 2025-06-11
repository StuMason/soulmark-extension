// Common words to skip when selecting words for verification
const COMMON_WORDS = new Set([
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

// Find the tweet compose area and inject button
function injectSoulmarkButton() {
  // Initial scan
  scanForTweetButtons();
  
  // Look for tweet compose areas
  const observer = new MutationObserver((mutations) => {
    scanForTweetButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function scanForTweetButtons() {
  // Find the tweet button in the compose area
  const tweetButtons = document.querySelectorAll('[data-testid="tweetButtonInline"], [data-testid="tweetButton"]');
  
  tweetButtons.forEach(tweetButton => {
    // Check if we already added a button here
    const parent = tweetButton.parentElement;
    if (parent && !parent.querySelector('.soulmark-button')) {
      createSoulmarkButton(parent, tweetButton);
    }
  });
}

function createSoulmarkButton(parent, tweetButton) {
  const soulmarkButton = document.createElement('button');
  soulmarkButton.className = 'soulmark-button';
  soulmarkButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="8" cy="8" r="3" fill="currentColor"/>
    </svg>
    <span>Soulmark</span>
  `;
  
  soulmarkButton.addEventListener('click', handleSoulmarkClick);
  
  // Insert before the tweet button
  parent.insertBefore(soulmarkButton, tweetButton);
}

function handleSoulmarkClick(event) {
  event.preventDefault();
  event.stopPropagation();
  
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('[Soulmark] Extension context invalidated. Please refresh the page.');
    alert('Soulmark extension was updated. Please refresh the page to continue.');
    return;
  }
  
  // Find the tweet text
  const tweetText = getTweetText();
  if (!tweetText) {
    console.error('Could not find tweet text');
    return;
  }
  
  // Select random meaningful words
  const words = selectRandomWords(tweetText, 3);
  if (words.length === 0) {
    console.error('No meaningful words found in tweet');
    return;
  }
  
  try {
    // Send message to background script to open popup
    chrome.runtime.sendMessage({
      action: 'openSoulmarkPopup',
      data: {
        text: tweetText,
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

function getTweetText() {
  // Try different selectors for the tweet compose area
  const selectors = [
    '[data-testid="tweetTextarea_0"]',
    '[role="textbox"][data-text="true"]',
    '.DraftEditor-content',
    '[contenteditable="true"][role="textbox"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent || element.innerText || '';
    }
  }
  
  return null;
}

function selectRandomWords(text, count) {
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

// Listen for messages from background script
if (chrome.runtime?.id) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'insertSoulmark') {
      insertSoulmarkCode(request.code);
      sendResponse({ success: true });
    }
  });
}

// Insert the soulmark code into the tweet
function insertSoulmarkCode(code) {
  const selectors = [
    '[data-testid="tweetTextarea_0"]',
    '[role="textbox"][data-text="true"]',
    '.DraftEditor-content',
    '[contenteditable="true"][role="textbox"]',
    '[data-slate-editor="true"]',
    'div[contenteditable="true"]'
  ];
  
  let inserted = false;
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    
    for (const element of elements) {
      // Check if this is actually a tweet compose area
      if (element.getAttribute('data-testid') === 'tweetTextarea_0' || 
          element.closest('[data-testid="tweetTextarea_0"]') ||
          (element.getAttribute('contenteditable') === 'true' && element.closest('form'))) {
        
        // Focus the element
        element.focus();
        
        // Try different methods to insert text
        try {
          // Method 1: Direct text content manipulation
          const currentText = element.textContent || element.innerText || '';
          const soulmarkText = ` [SM:${code}]`;
          
          // Method 2: Use execCommand
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, currentText + soulmarkText);
          
          // Trigger various events to ensure Twitter updates
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new InputEvent('input', { 
            bubbles: true,
            cancelable: true,
            data: soulmarkText
          }));
          
          inserted = true;
          break;
        } catch (error) {
          console.error('[Soulmark] Error inserting text:', error);
        }
      }
    }
    
    if (inserted) break;
  }
  
  if (!inserted) {
    // Try one more time with a delay
    setTimeout(() => {
      const textarea = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (textarea) {
        textarea.focus();
        document.execCommand('insertText', false, ` [SM:${code}]`);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 500);
  }
}

// Cache for verification results
const verificationCache = new Map();

// Scan for soulmark codes in tweets
async function scanForSoulmarks() {
  const soulmarkPattern = /\[SM:([a-z0-9]{7})\]/gi;
  
  // Find all tweet text elements
  const tweetTextElements = document.querySelectorAll('[data-testid="tweetText"]');
  
  // Collect all codes to verify
  const codesToVerify = [];
  const elementMap = new Map();
  
  for (const element of tweetTextElements) {
    // Skip if already processed
    if (element.hasAttribute('data-soulmark-scanned')) continue;
    element.setAttribute('data-soulmark-scanned', 'true');
    
    const text = element.textContent;
    const matches = [...text.matchAll(soulmarkPattern)];
    
    for (const match of matches) {
      const fullCode = match[0]; // [SM:xxxxx]
      const codeOnly = match[1]; // xxxxx
      
      if (!verificationCache.has(fullCode)) {
        codesToVerify.push(fullCode);
      }
      
      // Map code to element for later processing
      if (!elementMap.has(fullCode)) {
        elementMap.set(fullCode, []);
      }
      elementMap.get(fullCode).push({ element, fullCode, codeOnly });
    }
  }
  
  // Batch verify new codes
  if (codesToVerify.length > 0) {
    await Promise.all(codesToVerify.map(code => verifySoulmark(code)));
  }
  
  // Replace codes and add badges for verified soulmarks
  for (const [code, items] of elementMap) {
    const verification = verificationCache.get(code);
    
    if (verification && verification.valid) {
      items.forEach(({ element, fullCode, codeOnly }) => {
        // Replace the code with an elegant indicator
        replaceSoulmarkCode(element, fullCode, codeOnly, verification);
        // Add verification badge to the tweet actions
        addVerificationBadge(element, verification);
      });
    }
  }
}

// Verify a soulmark code
async function verifySoulmark(code) {
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
async function loadConfig() {
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

// Replace soulmark code with elegant indicator
function replaceSoulmarkCode(element, fullCode, codeOnly, verification) {
  // Get the text content
  let html = element.innerHTML;
  
  // Create the replacement indicator
  const indicator = `<span class="soulmark-indicator" data-code="${codeOnly}" title="Soulmark verified ${verification.age}">◉</span>`;
  
  // Replace the code with the indicator
  const newHtml = html.replace(fullCode, indicator);
  
  if (html === newHtml) {
    // Try a different approach - look for text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes(fullCode)) {
        const span = document.createElement('span');
        span.className = 'soulmark-indicator';
        span.setAttribute('data-code', codeOnly);
        span.setAttribute('title', `Soulmark verified ${verification.age}`);
        span.textContent = '◉';
        
        const newText = node.textContent.replace(fullCode, '');
        const parts = node.textContent.split(fullCode);
        
        const parent = node.parentNode;
        parent.insertBefore(document.createTextNode(parts[0]), node);
        parent.insertBefore(span, node);
        parent.insertBefore(document.createTextNode(parts[1] || ''), node);
        parent.removeChild(node);
        
        // Add click handler
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          showSoulmarkDetails(codeOnly, verification);
        });
        
        break;
      }
    }
  } else {
    // Update the element
    element.innerHTML = newHtml;
    
    // Add click handler to show details
    const indicatorElement = element.querySelector(`.soulmark-indicator[data-code="${codeOnly}"]`);
    if (indicatorElement) {
      indicatorElement.addEventListener('click', (e) => {
        e.stopPropagation();
        showSoulmarkDetails(codeOnly, verification);
      });
    }
  }
}

// Show soulmark details in a tooltip
function showSoulmarkDetails(code, verification) {
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
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" stroke="#D4722C" stroke-width="2"/>
        <circle cx="10" cy="10" r="4" fill="#D4722C"/>
      </svg>
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

// Add verification badge to tweet
function addVerificationBadge(tweetElement, verification) {
  // Find the parent tweet article
  const tweetArticle = tweetElement.closest('article');
  if (!tweetArticle) return;
  
  // Find the action bar (like, retweet, etc.)
  const actionBar = tweetArticle.querySelector('[role="group"]');
  if (!actionBar || actionBar.querySelector('.soulmark-badge')) return;
  
  // Create verification badge
  const badge = document.createElement('div');
  badge.className = 'soulmark-badge';
  badge.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="#D4722C" fill-opacity="0.1" stroke="#D4722C" stroke-width="1.5"/>
      <path d="M5 8L7 10L11 6" stroke="#D4722C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="soulmark-badge-text">Soulmarked ${verification.age}</span>
  `;
  
  // Add hover tooltip
  badge.title = `Verified human ${verification.age} • ${verification.wordCount} words spoken${verification.hasUser ? ' • Authenticated' : ''}`;
  
  // Insert before the first action button
  actionBar.insertBefore(badge, actionBar.firstChild);
}

// Observe for new tweets
function observeNewTweets() {
  const observer = new MutationObserver((mutations) => {
    // Debounce scanning
    clearTimeout(observeNewTweets.timeout);
    observeNewTweets.timeout = setTimeout(() => {
      scanForSoulmarks();
    }, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectSoulmarkButton();
    scanForSoulmarks();
    observeNewTweets();
  });
} else {
  injectSoulmarkButton();
  scanForSoulmarks();
  observeNewTweets();
}