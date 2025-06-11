// Get DOM elements
const wordsContainer = document.getElementById('wordsContainer');
const recordButton = document.getElementById('recordButton');
const statusElement = document.getElementById('status');
const waveform = document.getElementById('waveform');

// Audio recording variables
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let soulmarkWords = [];
let tweetText = '';

// Initialize popup
async function init() {
  // Get the soulmark data from background script
  const response = await chrome.runtime.sendMessage({ action: 'getSoulmarkData' });
  
  if (response && response.data && response.data.words) {
    soulmarkWords = response.data.words;
    tweetText = response.data.text || '';
    displayWords(soulmarkWords);
  } else {
    statusElement.textContent = 'Error: No words to verify';
    statusElement.className = 'status error';
    recordButton.disabled = true;
  }
  
  // Set up record button
  setupRecordButton();
}

// Display the words to speak
function displayWords(words) {
  wordsContainer.innerHTML = words.map(word => 
    `<span class="word">${word}</span>`
  ).join(' ');
}

// Set up the record button functionality
function setupRecordButton() {
  // Mouse events
  recordButton.addEventListener('mousedown', startRecording);
  recordButton.addEventListener('mouseup', stopRecording);
  recordButton.addEventListener('mouseleave', stopRecording);
  
  // Touch events for mobile
  recordButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startRecording();
  });
  recordButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopRecording();
  });
}

// Start recording audio
async function startRecording() {
  if (isRecording) return;
  
  try {
    // Get stored microphone preference
    const { selectedMicrophone } = await chrome.storage.local.get('selectedMicrophone');
    
    // Request microphone permission with specific device if selected
    const constraints = {
      audio: selectedMicrophone ? { deviceId: selectedMicrophone } : true
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Create media recorder
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Process the recording
      await processRecording(audioBlob);
    };
    
    // Start recording
    mediaRecorder.start();
    isRecording = true;
    
    // Update UI
    recordButton.classList.add('recording');
    statusElement.textContent = 'Recording...';
    statusElement.className = 'status';
    waveform.classList.add('active');
    
  } catch (error) {
    console.error('Error accessing microphone:', error);
    
    let errorMessage = 'Error: Could not access microphone';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Microphone access denied. Please allow microphone permissions.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No microphone found. Please connect a microphone.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Microphone is already in use by another application.';
    }
    
    statusElement.innerHTML = `
      ${errorMessage}<br>
      <a href="#" id="openSettings" style="color: #D4722C; text-decoration: underline;">Open Settings</a>
    `;
    statusElement.className = 'status error';
    
    // Add click handler for settings link
    document.getElementById('openSettings')?.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
}

// Stop recording audio
function stopRecording() {
  if (!isRecording || !mediaRecorder) return;
  
  mediaRecorder.stop();
  isRecording = false;
  
  // Update UI
  recordButton.classList.remove('recording');
  waveform.classList.remove('active');
  statusElement.innerHTML = '<span class="loading"></span> Processing...';
}

// Process the recorded audio
async function processRecording(audioBlob) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('words', JSON.stringify(soulmarkWords));
    
    // Generate message hash
    const messageHash = await generateHash(tweetText);
    formData.append('messageHash', messageHash);
    
    // Call Supabase Edge Function
    const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/verify-voice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update UI
      statusElement.textContent = 'Verified! Adding soulmark...';
      statusElement.className = 'status success';
      
      // Mark words as spoken
      document.querySelectorAll('.word').forEach(el => el.classList.add('spoken'));
      
      // Extract code without SM: prefix (if included)
      const code = result.code.replace('SM:', '');
      
      // Send code back to content script
      await chrome.runtime.sendMessage({
        action: 'soulmarkComplete',
        code: code
      });
      
      // Close popup after delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      // Show error message
      let errorMsg = result.message || 'Verification failed';
      if (result.debug && result.debug.expectedWords && result.debug.spokenWords) {
        errorMsg += `. Heard: "${result.debug.spokenWords.join(' ')}"`;
      }
      statusElement.textContent = errorMsg;
      statusElement.className = 'status error';
    }
    
  } catch (error) {
    console.error('Error processing recording:', error);
    statusElement.textContent = 'Error: Failed to verify voice';
    statusElement.className = 'status error';
  }
}

// Convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Generate SHA-256 hash of text
async function generateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);