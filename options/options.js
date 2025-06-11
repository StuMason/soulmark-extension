// DOM elements
const microphoneSelect = document.getElementById('microphone-select');
const refreshButton = document.getElementById('refresh-devices');
const testButton = document.getElementById('test-microphone');
const testStatus = document.getElementById('test-status');
const visualizer = document.getElementById('audio-visualizer');
const canvas = document.getElementById('visualizer-canvas');
const anonymousMode = document.getElementById('anonymous-mode');
const saveButton = document.getElementById('save-settings');
const saveStatus = document.getElementById('save-status');

// Audio visualization
let audioContext = null;
let analyser = null;
let microphone = null;
let animationId = null;
const canvasCtx = canvas.getContext('2d');

// Initialize settings
async function init() {
  await loadSettings();
  await refreshAudioDevices();
}

// Load saved settings
async function loadSettings() {
  const settings = await chrome.storage.local.get(['selectedMicrophone', 'anonymousMode']);
  
  if (settings.selectedMicrophone) {
    microphoneSelect.value = settings.selectedMicrophone;
  }
  
  if (settings.anonymousMode !== undefined) {
    anonymousMode.checked = settings.anonymousMode;
  }
}

// Refresh audio devices
async function refreshAudioDevices() {
  refreshButton.classList.add('spinning');
  
  try {
    // Request permission first
    await navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    // Clear existing options
    microphoneSelect.innerHTML = '<option value="">Default Microphone</option>';
    
    // Add audio input devices
    audioInputs.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Microphone ${microphoneSelect.options.length}`;
      microphoneSelect.appendChild(option);
    });
    
    // Restore saved selection
    const { selectedMicrophone } = await chrome.storage.local.get('selectedMicrophone');
    if (selectedMicrophone) {
      microphoneSelect.value = selectedMicrophone;
    }
    
  } catch (error) {
    console.error('Error enumerating devices:', error);
    testStatus.textContent = 'Error: Could not access audio devices';
    testStatus.className = 'test-status error';
  }
  
  setTimeout(() => {
    refreshButton.classList.remove('spinning');
  }, 500);
}

// Test microphone
async function testMicrophone() {
  if (microphone) {
    stopTesting();
    return;
  }
  
  try {
    const constraints = {
      audio: microphoneSelect.value ? { deviceId: microphoneSelect.value } : true
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Set up audio context and analyser
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    microphone.connect(analyser);
    
    // Update UI
    testButton.textContent = 'Stop Testing';
    testStatus.textContent = 'Microphone active - speak to see levels';
    testStatus.className = 'test-status success';
    visualizer.classList.add('active');
    
    // Start visualization
    function draw() {
      animationId = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.fillStyle = '#FFFEF7';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const r = 212;
        const g = 114 + (dataArray[i] / 255) * 50;
        const b = 44;
        
        canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    }
    
    draw();
    
  } catch (error) {
    console.error('Error accessing microphone:', error);
    
    let errorMessage = 'Error: Could not access microphone';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Microphone access denied. Please allow permissions in your browser.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No microphone found. Please connect a microphone.';
    }
    
    testStatus.textContent = errorMessage;
    testStatus.className = 'test-status error';
  }
}

// Stop testing
function stopTesting() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  if (microphone) {
    microphone.disconnect();
    microphone.mediaStream.getTracks().forEach(track => track.stop());
    microphone = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  testButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1C8.34315 1 7 2.34315 7 4V10C7 11.6569 8.34315 13 10 13C11.6569 13 13 11.6569 13 10V4C13 2.34315 11.6569 1 10 1Z" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 8V10C5 12.7614 7.23858 15 10 15C12.7614 15 15 12.7614 15 10V8M10 15V19M7 19H13" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    Test Microphone
  `;
  testStatus.textContent = '';
  visualizer.classList.remove('active');
  
  // Clear canvas
  canvasCtx.fillStyle = '#FFFEF7';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
}

// Save settings
async function saveSettings() {
  const settings = {
    selectedMicrophone: microphoneSelect.value,
    anonymousMode: anonymousMode.checked
  };
  
  try {
    await chrome.storage.local.set(settings);
    
    saveStatus.textContent = 'Settings saved!';
    saveStatus.className = 'save-status success show';
    
    setTimeout(() => {
      saveStatus.classList.remove('show');
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    saveStatus.textContent = 'Error saving settings';
    saveStatus.className = 'save-status error show';
  }
}

// Event listeners
refreshButton.addEventListener('click', refreshAudioDevices);
testButton.addEventListener('click', testMicrophone);
saveButton.addEventListener('click', saveSettings);

// Initialize on load
init();