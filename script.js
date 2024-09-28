document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const imageUpload = document.getElementById('imageUpload');
  const imageCanvas = document.getElementById('imageCanvas');
  const dropArea = document.getElementById('dropArea');
  const zoomRange = document.getElementById('zoomRange');
  const exportButton = document.getElementById('exportButton');
  const ctx = imageCanvas.getContext('2d');

  // State variables
  let image = null;
  let scale = 1;
  let originX = 0;
  let originY = 0;
  let isDragging = false;
  let startX, startY;
  let lastTouchDistance = 0;
  let isClick = true;

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Handle file drop
  dropArea.addEventListener('drop', handleDrop, false);
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  // Trigger file upload dialog
  dropArea.addEventListener('click', () => {
    if (!image) {
      imageUpload.click();
    }
  });

  // Handle file selection
  imageUpload.addEventListener('change', function(event) {
    const files = event.target.files;
    handleFiles(files);
  });

  // Process uploaded files
  function handleFiles(files) {
    const file = files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        image = new Image();
        image.src = e.target.result;
        image.onload = function() {
          resetImagePosition();
          drawImage();
          imageCanvas.style.display = 'block';
          dropArea.querySelector('p').style.display = 'none';
        };
      };
      reader.readAsDataURL(file);
    }
  }

  // Reset image position and scale
  function resetImagePosition() {
    scale = 1;
    zoomRange.value = 1;
    originX = (imageCanvas.width - image.width) / 2;
    originY = (imageCanvas.height - image.height) / 2;
  }

  // Draw the image on canvas
  function drawImage() {
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(image, originX, originY, image.width * scale, image.height * scale);
  }

  // Handle zoom input
  zoomRange.addEventListener('input', handleZoom);

  function handleZoom() {
    const previousScale = scale;
    scale = parseFloat(this.value);
    const mouseX = imageCanvas.width / 2;
    const mouseY = imageCanvas.height / 2;
    const imageX = (mouseX - originX) / previousScale;
    const imageY = (mouseY - originY) / previousScale;

    originX = mouseX - imageX * scale;
    originY = mouseY - imageY * scale;

    drawImage();
  }

  // Mouse event listeners
  imageCanvas.addEventListener('mousedown', startDragging);
  imageCanvas.addEventListener('mousemove', drag);
  imageCanvas.addEventListener('mouseup', stopDragging);
  imageCanvas.addEventListener('mouseleave', cancelDragging);

  // Touch event listeners
  imageCanvas.addEventListener('touchstart', handleTouchStart);
  imageCanvas.addEventListener('touchmove', handleTouchMove);
  imageCanvas.addEventListener('touchend', stopDragging);

  // Start dragging
  function startDragging(e) {
    if (image) {
      isDragging = true;
      isClick = true;
      startX = (e.clientX || e.touches[0].clientX) - originX;
      startY = (e.clientY || e.touches[0].clientY) - originY;
      imageCanvas.style.cursor = 'grabbing';
    }
  }

  // Handle dragging
  function drag(e) {
    if (isDragging) {
      isClick = false;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      originX = clientX - startX;
      originY = clientY - startY;
      drawImage();
    }
  }

  // Stop dragging
  function stopDragging() {
    if (isDragging && isClick && image) {
      imageUpload.click();
    }
    isDragging = false;
    isClick = true;
    imageCanvas.style.cursor = 'grab';
  }

  // Cancel dragging (e.g., when mouse leaves canvas)
  function cancelDragging() {
    isDragging = false;
    isClick = true;
    imageCanvas.style.cursor = 'grab';
  }

  // Handle touch start
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      lastTouchDistance = getTouchDistance(e.touches);
    } else {
      startDragging(e);
    }
  }

  // Handle touch move (for dragging and pinch-to-zoom)
  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const distanceDiff = currentDistance - lastTouchDistance;
      const zoomSensitivity = 0.005;
      scale += distanceDiff * zoomSensitivity;
      scale = Math.max(0.1, Math.min(scale, 3));
      zoomRange.value = scale;
      handleZoom.call(zoomRange);
      lastTouchDistance = currentDistance;
    } else {
      drag(e);
    }
  }

  // Calculate distance between two touch points
  function getTouchDistance(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  // Handle export button click
  exportButton.addEventListener('click', function() {
    if (image) {
      const webpImage = imageCanvas.toDataURL('image/webp');
      const link = document.createElement('a');
      link.href = webpImage;
      link.download = 'exported-image.webp';
      link.click();
    } else {
      alert('กรุณาอัปโหลดรูปภาพก่อนส่งออก');
    }
  });
});