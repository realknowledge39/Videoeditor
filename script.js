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

// File Upload
dropZone.addEventListener('click', () => videoUpload.click());
videoUpload.addEventListener('change', e => handleFile(e.target));

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#ff4d4d'; });
dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = '#666');
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.borderColor = '#666';
  handleFile(e.dataTransfer);
});

// URL Load
loadUrlBtn.addEventListener('click', () => {
  const url = videoUrlInput.value.trim();
  if (!url) {
    status.textContent = "❌ Please enter a URL";
    return;
  }
  loadVideoFromUrl(url);
});

function handleFile(source) {
  const file = source.files ? source.files[0] : source.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadVideo(url, file.name);
}

function loadVideoFromUrl(url) {
  status.textContent = "Loading video...";
  loadVideo(url, "Online Video");
}

function loadVideo(src, name) {
  currentVideoUrl = src;
  video.src = src;

  video.onloadedmetadata = () => {
    status.textContent = `✅ Loaded: ${name}`;
    generateBtn.style.display = 'inline-block';
  };

  video.onerror = () => {
    status.textContent = "❌ Failed to load video. Try direct .mp4 link (YouTube/Instagram often blocked).";
    generateBtn.style.display = 'none';
  };
}

generateBtn.addEventListener('click', generateRandomFrames);

async function generateRandomFrames() {
  if (!video.src) return;

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

        const imgUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        const div = document.createElement('div');
        div.className = 'frame';
        div.innerHTML = `<img src="${imgUrl}"><p>${randomTime.toFixed(2)}s</p>`;
        framesContainer.appendChild(div);

        resolve();
      };
    });

    await new Promise(r => setTimeout(r, 300));
  }

  status.textContent = '✅ Frames generated!';
  downloadBtn.style.display = 'inline-block';
}

// Download Collage (9:16)
downloadBtn.addEventListener('click', () => {
  const images = framesContainer.querySelectorAll('img');
  const collageWidth = 720;
  const collageHeight = Math.floor(collageWidth * 16 / 9);

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = collageWidth;
  finalCanvas.height = collageHeight;
  const fCtx = finalCanvas.getContext('2d');
  fCtx.fillStyle = '#000';
  fCtx.fillRect(0, 0, collageWidth, collageHeight);

  const thumbW = collageWidth / 2;
  const thumbH = collageHeight / 3;

  images.forEach((img, i) => {
    const x = (i % 2) * thumbW;
    const y = Math.floor(i / 2) * thumbH;
    fCtx.drawImage(img, x, y, thumbW, thumbH);
  });

  const link = document.createElement('a');
  link.download = 'video-frames-9-16.jpg';
  link.href = finalCanvas.toDataURL('image/jpeg', 0.92);
  link.click();
});