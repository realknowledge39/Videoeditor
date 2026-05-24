const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const framesContainer = document.getElementById('frames');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const status = document.getElementById('status');

let videoFile = null;

dropZone.addEventListener('click', () => videoUpload.click());
videoUpload.addEventListener('change', handleFile);

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.borderColor = '#ff4d4d';
});
dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = '#666');
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.borderColor = '#666';
  handleFile(e.dataTransfer);
});

function handleFile(e) {
  const file = e.target?.files?.[0] || e.files?.[0];
  if (!file) return;

  videoFile = file;
  const url = URL.createObjectURL(file);
  video.src = url;

  video.onloadedmetadata = () => {
    status.textContent = `Video loaded: ${file.name}`;
    generateBtn.style.display = 'inline-block';
  };
}

generateBtn.addEventListener('click', generateRandomFrames);

async function generateRandomFrames() {
  framesContainer.innerHTML = '';
  status.textContent = 'Extracting 6 random frames...';

  const duration = video.duration;
  const numFrames = 6;
  const screenshots = [];

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
        div.innerHTML = `
          <img src="${imgUrl}">
          <p>${(randomTime).toFixed(2)}s</p>
        `;
        framesContainer.appendChild(div);

        resolve();
      };
    });

    await new Promise(r => setTimeout(r, 250));
  }

  status.textContent = '✅ 6 frames generated!';
  downloadBtn.style.display = 'inline-block';
}

// Download in 9:16 Vertical Collage
downloadBtn.addEventListener('click', () => {
  const images = framesContainer.querySelectorAll('img');
  const numFrames = images.length;
  
  const collageWidth = 720;           // Width for 9:16
  const collageHeight = Math.floor(collageWidth * 16 / 9);  // Height for 9:16

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = collageWidth;
  finalCanvas.height = collageHeight;
  
  const fCtx = finalCanvas.getContext('2d');
  fCtx.fillStyle = '#000000';
  fCtx.fillRect(0, 0, collageWidth, collageHeight);

  const thumbWidth = collageWidth / 2;
  const thumbHeight = collageHeight / 3;

  images.forEach((img, index) => {
    const x = (index % 2) * thumbWidth;
    const y = Math.floor(index / 2) * thumbHeight;
    fCtx.drawImage(img, x, y, thumbWidth, thumbHeight);
  });

  const link = document.createElement('a');
  link.download = 'video-frames-9-16.jpg';
  link.href = finalCanvas.toDataURL('image/jpeg', 0.92);
  link.click();
});