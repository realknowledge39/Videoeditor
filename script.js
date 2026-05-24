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
    status.textContent = `Video loaded: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
    generateBtn.style.display = 'inline-block';
  };
}

generateBtn.addEventListener('click', generateRandomFrames);

async function generateRandomFrames() {
  framesContainer.innerHTML = '';
  status.textContent = 'Extracting random frames...';

  const duration = video.duration;
  const numFrames = 6; // Change to 5 if you want
  const screenshots = [];

  for (let i = 0; i < numFrames; i++) {
    // Pick random time
    const randomTime = Math.random() * duration * 0.9; // avoid very end

    video.currentTime = randomTime;

    await new Promise(resolve => {
      video.onseeked = () => {
        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imgUrl = canvas.toDataURL('image/jpeg', 0.9);
        screenshots.push(imgUrl);

        // Display
        const div = document.createElement('div');
        div.className = 'frame';
        div.innerHTML = `
          <img src="${imgUrl}" style="width:100%; display:block;">
          <p>Frame ${i+1} - ${randomTime.toFixed(2)}s</p>
        `;
        framesContainer.appendChild(div);

        resolve();
      };
    });

    // Small delay to prevent skipping
    await new Promise(r => setTimeout(r, 300));
  }

  status.textContent = '✅ Done! 6 random frames generated.';
  downloadBtn.style.display = 'inline-block';
}

// Download as collage
downloadBtn.addEventListener('click', () => {
  const finalCanvas = document.createElement('canvas');
  const cols = 3;
  const rows = 2;
  const thumbWidth = 400;
  const thumbHeight = 225;

  finalCanvas.width = thumbWidth * cols;
  finalCanvas.height = thumbHeight * rows;
  const fCtx = finalCanvas.getContext('2d');

  const images = framesContainer.querySelectorAll('img');
  images.forEach((img, index) => {
    const x = (index % cols) * thumbWidth;
    const y = Math.floor(index / cols) * thumbHeight;
    fCtx.drawImage(img, x, y, thumbWidth, thumbHeight);
  });

  const link = document.createElement('a');
  link.download = 'video-frames-collage.jpg';
  link.href = finalCanvas.toDataURL('image/jpeg', 0.95);
  link.click();
});