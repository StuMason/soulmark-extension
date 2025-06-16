// LinkedIn integration for Soulmark
// TODO: Import shared functionality once modules are supported in content scripts
// For now, we'll duplicate some code

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

// Map to store intervals for each button
const monitoringIntervals = new WeakMap();

// Find LinkedIn post/comment areas and inject button
function injectSoulmarkButton() {
  console.log('[Soulmark LinkedIn] Starting injection...');
  
  // Initial scan
  scanForPostAreas();
  
  // Look for new post areas
  const observer = new MutationObserver((mutations) => {
    scanForPostAreas();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function scanForPostAreas() {
  console.log('[Soulmark LinkedIn] Scanning for post areas...');
  
  // Look for the post creation modal/editor
  const postEditors = document.querySelectorAll('.share-creation-state__text-editor, .ql-editor[contenteditable="true"]');
  console.log(`[Soulmark LinkedIn] Found ${postEditors.length} post editors`);
  
  if (postEditors.length > 0) {
    // Look for the button carousel/list in the post creation modal
    const buttonLists = document.querySelectorAll('.artdeco-carousel__slider, ul[class*="share-creation"]');
    console.log(`[Soulmark LinkedIn] Found ${buttonLists.length} button lists`);
    
    buttonLists.forEach(list => {
      if (!list.querySelector('.soulmark-list-item')) {
        console.log('[Soulmark LinkedIn] Adding soulmark button to carousel');
        addSoulmarkToCarousel(list);
      }
    });
    
    // Also find the Post button in the modal footer
    const postButtons = document.querySelectorAll('button[aria-label="Post"], .share-actions__primary-action');
    console.log(`[Soulmark LinkedIn] Found ${postButtons.length} post buttons in modal`);
    
    // Also try to find by looking for buttons that contain "Post" text
    const allButtons = document.querySelectorAll('button');
    const postButtonsByText = Array.from(allButtons).filter(btn => 
      btn.textContent.trim() === 'Post' && 
      !btn.querySelector('.soulmark-button')
    );
    console.log(`[Soulmark LinkedIn] Found ${postButtonsByText.length} buttons with "Post" text`);
    
    // Use whichever we found
    const finalPostButtons = postButtons.length > 0 ? postButtons : postButtonsByText;
    
    finalPostButtons.forEach(button => {
      // Look for the actions container that holds the Post button
      const actionsContainer = button.closest('.share-box_actions, .share-actions');
      const container = actionsContainer || button.parentElement;
      
      if (container && !container.querySelector('.soulmark-button')) {
        console.log('[Soulmark LinkedIn] Adding soulmark button to post modal');
        // Insert before the Post button, not after
        const soulmarkButton = createSoulmarkButtonElement(false);
        container.insertBefore(soulmarkButton, button);
      }
    });
  }
  
  // LinkedIn comment sections - look for ALL ql-editors that might be comments
  const allEditors = document.querySelectorAll('.ql-editor[data-placeholder*="comment" i], .ql-editor[aria-placeholder*="comment" i]');
  console.log(`[Soulmark LinkedIn] Found ${allEditors.length} comment editors (ql-editor)`);
  
  allEditors.forEach(editor => {
    // Walk up the DOM to find the comment form structure
    let current = editor;
    let foundButton = false;
    
    // Go up max 10 levels to find a submit button
    for (let i = 0; i < 10 && current && !foundButton; i++) {
      current = current.parentElement;
      if (!current) break;
      
      // Look for buttons in this container
      const buttons = current.querySelectorAll('button');
      buttons.forEach(button => {
        // Check if this is likely a submit button
        const buttonText = button.textContent.trim().toLowerCase();
        const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
        
        if ((buttonText === 'post' || buttonText === 'comment' || buttonText.includes('reply') || 
             ariaLabel.includes('post') || ariaLabel.includes('comment') || ariaLabel.includes('reply')) &&
            !button.closest('.soulmark-button') &&
            !current.querySelector('.soulmark-button')) {
          
          console.log(`[Soulmark LinkedIn] Found comment button: "${buttonText}" with aria-label: "${ariaLabel}"`);
          const container = button.parentElement;
          
          if (container) {
            console.log('[Soulmark LinkedIn] Adding soulmark button to comment box');
            createSoulmarkButton(container, button, true);
            foundButton = true;
          }
        }
      });
    }
  });
  
  // Also try a different approach - look for comment forms
  const commentForms = document.querySelectorAll('form[class*="comment"], div[class*="comment-box"], div[class*="comments-comment"], .comments-comment-box__submit-button--cr');
  console.log(`[Soulmark LinkedIn] Found ${commentForms.length} comment forms`);
  
  // Also specifically look for the comment submit button
  const commentSubmitButtons = document.querySelectorAll('.comments-comment-box__submit-button--cr, button[class*="comment"][class*="submit"]');
  console.log(`[Soulmark LinkedIn] Found ${commentSubmitButtons.length} comment submit buttons`);
  
  commentSubmitButtons.forEach(button => {
    if (!button.parentElement.querySelector('.soulmark-button')) {
      console.log('[Soulmark LinkedIn] Adding soulmark button next to comment submit button');
      createSoulmarkButton(button.parentElement, button, true);
    }
  });
  
  commentForms.forEach(form => {
    if (form.querySelector('.soulmark-button')) return; // Already has button
    
    const buttons = form.querySelectorAll('button');
    buttons.forEach(button => {
      const buttonText = button.textContent.trim().toLowerCase();
      if ((buttonText === 'post' || buttonText === 'comment' || buttonText === 'reply') && 
          !button.parentElement.querySelector('.soulmark-button')) {
        console.log('[Soulmark LinkedIn] Adding soulmark button to comment form button:', buttonText);
        createSoulmarkButton(button.parentElement, button, true);
      }
    });
  });
}

function addSoulmarkToCarousel(carousel) {
  // Create a list item matching LinkedIn's structure
  const li = document.createElement('li');
  li.className = 'artdeco-carousel__item ember-view share-creation-state__promoted-detour-button-item soulmark-list-item';
  li.style.width = '71.2px';
  li.tabIndex = -1;
  
  li.innerHTML = `
    <div data-test-display="display" class="artdeco-carousel__item-container">
      <div>
        <span class="artdeco-hoverable-trigger artdeco-hoverable-trigger--content-placed-top artdeco-hoverable-trigger--is-hoverable ember-view">
          <button aria-label="Add soulmark verification" class="share-promoted-detour-button soulmark-carousel-button" type="button">
            <span class="share-promoted-detour-button__icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#D4722C" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#D4722C"/>
              </svg>
            </span>
          </button>
        </span>
      </div>
    </div>
  `;
  
  // Add click handler
  const button = li.querySelector('.soulmark-carousel-button');
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSoulmarkClick(false);
  });
  
  // Monitor text for enabling/disabling
  startMonitoringText(button, false);
  
  // Insert at the beginning of the carousel
  carousel.insertBefore(li, carousel.firstChild);
}

function createSoulmarkButtonElement(isComment = false) {
  const soulmarkButton = document.createElement('button');
  soulmarkButton.className = 'soulmark-button soulmark-icon-only';
  soulmarkButton.disabled = true;
  soulmarkButton.title = 'Add a soulmark to verify you\'re human';
  soulmarkButton.style.cssText = `
    margin-right: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
  `;
  soulmarkButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="4" fill="currentColor"/>
    </svg>
  `;
  
  soulmarkButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSoulmarkClick(isComment);
  });
  
  // Monitor text for changes
  startMonitoringText(soulmarkButton, isComment);
  
  return soulmarkButton;
}

function createSoulmarkButton(parent, referenceButton, isComment = false) {
  const soulmarkButton = createSoulmarkButtonElement(isComment);
  // Insert before the post/comment button
  parent.insertBefore(soulmarkButton, referenceButton);
}

function startMonitoringText(button, isComment) {
  // Check text immediately
  updateButtonState(button, isComment);
  
  // Set up interval to check periodically
  const interval = setInterval(() => {
    updateButtonState(button, isComment);
  }, 200);
  
  // Store interval for cleanup
  monitoringIntervals.set(button, interval);
}

function updateButtonState(button, isComment) {
  const text = getLinkedInText(isComment);
  if (!text) {
    button.disabled = true;
    button.classList.add('disabled');
    console.log('[Soulmark LinkedIn] Button disabled - no text found');
    return;
  }
  
  // Check if we have enough meaningful words
  const words = selectRandomWords(text, 3);
  console.log('[Soulmark LinkedIn] Button state update - words found:', words.length);
  if (words.length >= 1) {
    button.disabled = false;
    button.classList.remove('disabled');
    console.log('[Soulmark LinkedIn] Button ENABLED');
  } else {
    button.disabled = true;
    button.classList.add('disabled');
    console.log('[Soulmark LinkedIn] Button disabled - no meaningful words');
  }
}

function getLinkedInText(isComment = false) {
  // Try different selectors for LinkedIn's editor
  const selectors = isComment ? [
    '.ql-editor[data-placeholder*="comment" i]',
    '.comments-comment-box .ql-editor',
    '.comment-box .ql-editor',
    '.editor-content.ql-container .ql-editor',
    '[aria-placeholder*="comment" i][contenteditable="true"]',
    '[contenteditable="true"][role="textbox"]'
  ] : [
    '.share-creation-state__text-editor .ql-editor',
    '.ql-editor[contenteditable="true"]:not([data-placeholder*="comment" i])',
    '[contenteditable="true"][role="textbox"]:not([aria-placeholder*="comment" i])',
    '.editor-content .ql-editor'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    // Get the visible/active editor
    for (const element of elements) {
      if (element && element.offsetParent !== null) {
        // LinkedIn uses Quill editor, need to get text without formatting
        const text = element.textContent || element.innerText || '';
        if (text.trim()) {
          console.log(`[Soulmark LinkedIn] Found text in ${selector}: "${text.substring(0, 50)}..."`);
          return text;
        }
      }
    }
  }
  
  console.log('[Soulmark LinkedIn] No text found in editors');
  return null;
}

function handleSoulmarkClick(isComment = false) {
  console.log('[Soulmark LinkedIn] handleSoulmarkClick called, isComment:', isComment);
  
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.error('[Soulmark] Extension context invalidated. Please refresh the page.');
    alert('Soulmark extension was updated. Please refresh the page to continue.');
    return;
  }
  
  // Find the text
  const text = getLinkedInText(isComment);
  console.log('[Soulmark LinkedIn] Text found:', text ? `"${text.substring(0, 50)}..."` : 'null');
  if (!text) {
    console.error('Could not find LinkedIn text');
    return;
  }
  
  // Select random meaningful words
  const words = selectRandomWords(text, 3);
  console.log('[Soulmark LinkedIn] Selected words:', words);
  if (words.length === 0) {
    console.error('No meaningful words found in post');
    return;
  }
  
  try {
    console.log('[Soulmark LinkedIn] Sending message to background script...');
    // Send message to background script to open popup
    chrome.runtime.sendMessage({
      action: 'openSoulmarkPopup',
      data: {
        text: text,
        words: words,
        platform: 'linkedin'
      }
    }, response => {
      console.log('[Soulmark LinkedIn] Response from background:', response);
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

// Insert the soulmark code into LinkedIn post/comment
function insertSoulmarkCode(code) {
  const selectors = [
    '.share-creation-state__text-editor .ql-editor',
    '.comments-comment-box__form .ql-editor',
    '.ql-editor[contenteditable="true"]',
    '[contenteditable="true"][role="textbox"]'
  ];
  
  let inserted = false;
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.isContentEditable) {
      // Focus the element
      element.focus();
      
      // Get current content
      const currentText = element.textContent || '';
      const soulmarkText = ` [SM:${code}]`;
      
      // Insert at the end
      element.textContent = currentText + soulmarkText;
      
      // Trigger input event for LinkedIn
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      // For Quill editor, might need to trigger specific events
      const event = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: soulmarkText
      });
      element.dispatchEvent(event);
      
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    console.error('[Soulmark] Could not insert code into LinkedIn editor');
  }
}

// Scan for soulmark codes in LinkedIn posts
async function scanForSoulmarks() {
  const soulmarkPattern = /\[SM:([a-z0-9]{7})\]/gi;
  
  // Find all post/comment text elements
  const textSelectors = [
    '.feed-shared-text', // Main feed posts
    '.comment-item__main-content', // Comments
    '.feed-shared-update-v2__description', // Alternative post selector
    'span[dir="ltr"]' // Generic text spans
  ];
  
  const textElements = [];
  textSelectors.forEach(selector => {
    textElements.push(...document.querySelectorAll(selector));
  });
  
  for (const element of textElements) {
    // Skip if already processed
    if (element.hasAttribute('data-soulmark-scanned')) continue;
    element.setAttribute('data-soulmark-scanned', 'true');
    
    const text = element.textContent;
    const matches = [...text.matchAll(soulmarkPattern)];
    
    for (const match of matches) {
      const fullCode = match[0]; // [SM:xxxxx]
      const codeOnly = match[1]; // xxxxx
      
      // Verify and replace
      const verification = await verifySoulmark(fullCode);
      if (verification && verification.valid) {
        replaceSoulmarkCode(element, fullCode, codeOnly, verification);
        addVerificationBadge(element, verification);
      }
    }
  }
}

// Verify soulmark (simplified version - shared code would be better)
async function verifySoulmark(code) {
  try {
    const config = await getConfig();
    const cleanCode = code.replace(/^\[SM:/i, '').replace(/\]$/, '');
    
    const response = await fetch(
      `${config.SUPABASE_URL}/functions/v1/check-soulmark?code=${encodeURIComponent(cleanCode)}`,
      {
        headers: {
          'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`,
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying soulmark:', error);
    return { valid: false };
  }
}

// Get config from background script
async function getConfig() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
      if (response && response.config) {
        resolve(response.config);
      }
    });
  });
}

// Replace soulmark code with indicator
function replaceSoulmarkCode(element, fullCode, codeOnly, verification) {
  const html = element.innerHTML;
  const indicator = `<span class="soulmark-indicator" data-code="${codeOnly}" title="Soulmark verified ${verification.age}">◉</span>`;
  element.innerHTML = html.replace(fullCode, indicator);
  
  // Add click handler
  const indicatorElement = element.querySelector(`.soulmark-indicator[data-code="${codeOnly}"]`);
  if (indicatorElement) {
    indicatorElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showSoulmarkDetails(codeOnly, verification);
    });
  }
}

// Add verification badge to LinkedIn post
function addVerificationBadge(textElement, verification) {
  // Find the parent post container
  const postContainer = textElement.closest('.feed-shared-update-v2') || 
                       textElement.closest('.comment-item');
  if (!postContainer) return;
  
  // Find the actions bar
  const actionsBar = postContainer.querySelector('.social-actions-bar') || 
                    postContainer.querySelector('.comment-item__actions');
  if (!actionsBar || actionsBar.querySelector('.soulmark-badge')) return;
  
  // Create verification badge
  const badge = document.createElement('div');
  badge.className = 'soulmark-badge';
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    margin: 0 8px;
    cursor: pointer;
  `;
  badge.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="8" stroke="#D4722C" stroke-width="1.5"/>
      <circle cx="9" cy="9" r="3.5" fill="#D4722C"/>
    </svg>
  `;
  
  badge.title = `Verified human ${verification.age}`;
  
  // Insert at the beginning of actions
  actionsBar.insertBefore(badge, actionsBar.firstChild);
}

// Show soulmark details tooltip
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
      <p class="soulmark-code">Code: SM:${code}</p>
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Remove on click outside
  setTimeout(() => {
    document.addEventListener('click', function removeTooltip() {
      tooltip.remove();
      document.removeEventListener('click', removeTooltip);
    });
  }, 100);
}

// Observe for new posts/comments
function observeNewContent() {
  const observer = new MutationObserver((mutations) => {
    // Debounce scanning
    clearTimeout(observeNewContent.timeout);
    observeNewContent.timeout = setTimeout(() => {
      scanForSoulmarks();
      // Also rescan for new comment boxes
      scanForPostAreas();
    }, 500);
    
    // Quick check for new comment editors
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          // Check if this is or contains a comment editor
          const editors = node.querySelectorAll ? 
            node.querySelectorAll('.ql-editor[data-placeholder*="comment" i], .ql-editor[aria-placeholder*="comment" i]') : [];
          if (editors.length > 0 || (node.classList && node.classList.contains('ql-editor'))) {
            console.log('[Soulmark LinkedIn] New comment editor detected, scanning...');
            clearTimeout(observeNewContent.quickTimeout);
            observeNewContent.quickTimeout = setTimeout(() => {
              scanForPostAreas();
            }, 100);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-placeholder', 'aria-placeholder']
  });
}

// Initialize when DOM is ready
console.log('[Soulmark LinkedIn] Script loaded on:', window.location.href);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Soulmark LinkedIn] DOM loaded, initializing...');
    injectSoulmarkButton();
    scanForSoulmarks();
    observeNewContent();
  });
} else {
  console.log('[Soulmark LinkedIn] DOM already loaded, initializing...');
  injectSoulmarkButton();
  scanForSoulmarks();
  observeNewContent();
}