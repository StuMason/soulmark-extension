// Get DOM elements
const wordsContainer = document.getElementById('wordsContainer');
const recordButton = document.getElementById('recordButton');
const statusElement = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const soundVisualizer = document.getElementById('soundVisualizer');
const visualizerCanvas = document.getElementById('visualizerCanvas');

// Audio recording variables
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let soulmarkWords = [];
let tweetText = '';
let platform = 'twitter'; // Default platform

// Initialize popup
async function init() {
  // Load theme preference
  const { theme } = await chrome.storage.local.get('theme');
  if (theme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
  
  // Set up theme toggle
  setupThemeToggle();
  
  // Get the soulmark data from background script
  const response = await chrome.runtime.sendMessage({ action: 'getSoulmarkData' });
  
  if (response && response.data && response.data.words) {
    soulmarkWords = response.data.words;
    tweetText = response.data.text || '';
    platform = response.data.platform || 'twitter'; // Get platform from data
    displayWords(soulmarkWords);
    
    // Start recording automatically
    setTimeout(() => {
      startAutoRecording();
    }, 300); // Small delay to ensure UI is ready
  } else {
    statusElement.textContent = 'Error: No words to verify';
    statusElement.className = 'status error';
    recordButton.disabled = true;
  }
  
  // Record button is now just visual, no manual recording
}

// Display the words to speak
function displayWords(words) {
  wordsContainer.innerHTML = words.map(word => 
    `<span class="word">${word}</span>`
  ).join(' ');
}

// Record button is now just for display
function setupRecordButton() {
  // Button is purely visual during auto-recording
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
  statusElement.innerHTML = '<span class="loading"></span> Processing...';
}

// Process the recorded audio
async function processRecording(audioBlob) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('text', tweetText);  // Add full text for AI detection
    formData.append('words', JSON.stringify(soulmarkWords));
    formData.append('platform', platform);  // Use the actual platform
    
    // Generate message hash
    const messageHash = await generateHash(tweetText);
    formData.append('messageHash', messageHash);
    
    // Call unified Supabase Edge Function
    const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/verify-soulmark`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update UI - simple success message
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
      // Show error message with details
      let errorMsg = result.message || 'Verification failed';
      
      // Add specific verification failure details
      if (result.verifications) {
        const failedChecks = result.verifications
          .filter(v => !v.success)
          .map(v => v.type);
        if (failedChecks.length > 0) {
          errorMsg += ` (Failed: ${failedChecks.join(', ')})`;
        }
      }
      
      statusElement.textContent = errorMsg;
      statusElement.className = 'status error';
    }
    
  } catch (error) {
    console.error('Error processing recording:', error);
    statusElement.textContent = 'Error: Failed to verify';
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


// Auto-recording without countdown
async function startAutoRecording() {
  // Start recording immediately
  beginRecording();
}

async function beginRecording() {
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
    
    // Set up audio visualizer
    setupAudioVisualizer(stream);
    
    // Update UI
    recordButton.classList.add('recording');
    statusElement.textContent = 'Speak now!';
    statusElement.className = 'status';
    
    // Minimal timer with progress
    const recordButtonInner = recordButton.querySelector('.record-button-inner');
    const recordProgress = recordButton.querySelector('.record-progress');
    
    const startTime = Date.now();
    const visualDuration = 1500; // Show recording for 1.5 seconds
    const actualDuration = 3500; // Actually record for 3.5 seconds
    
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const visualProgress = Math.min((elapsed / visualDuration) * 100, 100);
      const degrees = (visualProgress / 100) * 360;
      recordProgress.style.background = `conic-gradient(var(--accent-primary) ${degrees}deg, transparent ${degrees}deg)`;
      
      // After visual completion, show "processing" but keep recording
      if (elapsed >= visualDuration && elapsed < actualDuration) {
        recordProgress.style.background = 'transparent';
        recordButtonInner.innerHTML = '<span class="loading"></span>';
        statusElement.textContent = 'Processing voice...';
        statusElement.className = 'status';
        // Hide visualizer to make it seem like we're done recording
        soundVisualizer.classList.remove('active');
      }
      
      // Actually stop recording after full duration
      if (elapsed >= actualDuration) {
        clearInterval(timerInterval);
        stopRecording();
      }
    }, 10); // Smooth 100fps updates
    
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
    
    // Show error state
    recordButton.disabled = true;
    recordButton.innerHTML = 'Error';
    
    // Add click handler for settings link
    document.getElementById('openSettings')?.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
}

// Theme toggle functionality
function setupThemeToggle() {
  themeToggle.addEventListener('click', async () => {
    const isCurrentlyDark = document.body.classList.contains('dark-theme');
    
    if (isCurrentlyDark) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      await chrome.storage.local.set({ theme: 'light' });
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      await chrome.storage.local.set({ theme: 'dark' });
    }
  });
}

// Audio visualizer
function setupAudioVisualizer(stream) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const ctx = visualizerCanvas.getContext('2d');
  const WIDTH = visualizerCanvas.width;
  const HEIGHT = visualizerCanvas.height;
  
  soundVisualizer.classList.add('active');
  
  function draw() {
    if (!isRecording) {
      soundVisualizer.classList.remove('active');
      return;
    }
    
    requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary');
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * HEIGHT;
      
      const gradient = ctx.createLinearGradient(0, HEIGHT - barHeight, 0, HEIGHT);
      gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary'));
      gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--accent-primary'));
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }
  
  draw();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);