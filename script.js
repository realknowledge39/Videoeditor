const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const videoUrlInput = document.getElementById('video-url');
const loadUrlBtn = document.getElementById('load-url-btn');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const framesContainer = document.getElementById('frames');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const status = document.getElementById('status');

let currentVideoUrl = null;

// File & URL handling (same as before)
dropZone.addEventListener('click', () => videoUpload.click());
videoUpload.addEventListener('change', e => handleFile(e.target));

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#ff4d4d'; });
dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = '#666');
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.borderColor = '#666';
  handleFile(e.dataTransfer);
});

loadUrlBtn.addEventListener('click', () => {
  const url = videoUrlInput.value.trim();
  if (!url) return status.textContent = "❌ Enter a URL";
  loadVideo(url, "Online Video");
});

function handleFile(source) {
  const file = source.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadVideo(url, file.name);
}

function loadVideo(src, name) {
  currentVideoUrl = src;
  video.src = src;
  video.onloadedmetadata = () => {
    status.textContent = `✅ Loaded: ${name}`;
    generateBtn.style.display = 'inline-block';
  };
  video.onerror = () => status.textContent = "❌ Failed to load video";
}

generateBtn.addEventListener('click', generateRandomFrames);

async function generateRandomFrames() {
  framesContainer.innerHTML = '';
  status.textContent = 'Extracting 6 random frames...';

  const duration = video.duration || 60;
  const numFrames = 6;

  for (let i = 0; i < numFrames; i++) {
    const randomTime = Math.random() * duration * 0.85;
    video.currentTime = randomTime;

    await new Promise(resolve => {
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imgUrl = canvas.toDataURL('image/jpeg', 0.88);
        
        const div = document.createElement('div');
        div.className = 'frame';
        div.innerHTML = `<img src="${imgUrl}"><p>${randomTime.toFixed(2)}s</p>`;
        framesContainer.appendChild(div);

        resolve();
      };
    });

    await new Promise(r => setTimeout(r, 300));
  }

  status.textContent = '✅ Frames ready!';
  downloadBtn.style.display = 'inline-block';
}

// ================== PREMIUM COLLAGE ==================
downloadBtn.addEventListener('click', () => {
  const images = framesContainer.querySelectorAll('img');
  if (images.length === 0) return;

  // Premium Collage Size (Tall like movie poster)
  const canvasWidth = 1200;
  const canvasHeight = 2000;

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvasWidth;
  finalCanvas.height = canvasHeight;
  const ctx = finalCanvas.getContext('2d');

  // Dark elegant background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Mixed layout similar to your screenshot
  const positions = [
    {x: 50, y: 50, w: 500, h: 700},     // Vertical 1
    {x: 650, y: 50, w: 500, h: 300},    // Horizontal 1
    {x: 650, y: 400, w: 500, h: 700},   // Vertical 2
    {x: 50, y: 800, w: 500, h: 300},    // Horizontal 2
    {x: 50, y: 1150, w: 500, h: 700},   // Vertical 3
    {x: 650, y: 1150, w: 500, h: 700}   // Vertical 4
  ];

  images.forEach((img, i) => {
    const pos = positions[i];
    if (pos) {
      ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
      
      // Optional subtle border
      ctx.strokeStyle = '#ffffff22';
      ctx.lineWidth = 8;
      ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
    }
  });

  const link = document.createElement('a');
  link.download = 'premium-video-frames.jpg';
  link.href = finalCanvas.toDataURL('image/jpeg', 0.95);
  link.click();

  status.textContent = '✅ Premium collage downloaded!';
});