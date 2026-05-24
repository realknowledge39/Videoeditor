// Download as collage (Updated for vertical layout)
downloadBtn.addEventListener('click', () => {
  const images = framesContainer.querySelectorAll('img');
  if (images.length === 0) return;

  const numFrames = images.length;
  const thumbWidth = 800;
  const thumbHeight = Math.floor(thumbWidth * 9 / 16); // 16:9 ratio

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = thumbWidth;
  finalCanvas.height = thumbHeight * numFrames;

  const fCtx = finalCanvas.getContext('2d');

  images.forEach((img, index) => {
    fCtx.drawImage(img, 0, index * thumbHeight, thumbWidth, thumbHeight);
  });

  const link = document.createElement('a');
  link.download = 'video-frames-vertical.jpg';
  link.href = finalCanvas.toDataURL('image/jpeg', 0.95);
  link.click();
});