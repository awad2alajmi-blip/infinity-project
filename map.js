let mapInitialized = false; 

function drawPath() {
  const svg = document.getElementById('svgPath');
  const nodes = document.querySelectorAll('#paths .landmark'); 
  if (!svg || nodes.length === 0) return;

  let d = "";
  const DISC_RADIUS = 42.5; 

  nodes.forEach((node, i) => {
    const x = node.offsetLeft + DISC_RADIUS;
    const y = node.offsetTop + DISC_RADIUS;

    if(i === 0) d += `M ${x} ${y}`;
    else {
      const prevX = nodes[i-1].offsetLeft + DISC_RADIUS;
      const prevY = nodes[i-1].offsetTop + DISC_RADIUS;
      const cp1x = (prevX + x) / 2;
      d += ` C ${cp1x} ${prevY}, ${cp1x} ${y}, ${x} ${y}`;
    }
  });

  svg.innerHTML = `<path d="${d}" class="path-line" />`;
}

const container = document.getElementById('mapContainer');
let isDragging = false;
let startX, startY, startScrollX, startScrollY;

if (container) {
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    container.style.cursor = 'grabbing';
    startX = e.clientX;
    startY = e.clientY;
    startScrollX = container.scrollLeft;
    startScrollY = container.scrollTop;
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    container.scrollLeft = startScrollX - dx;
    container.scrollTop = startScrollY - dy;
  });
}

function initializeMapLogic() {
    if (container && !mapInitialized) {
        const contentWidth = 2200;
        const containerWidth = container.clientWidth;
        const contentHeight = 1200;
        const containerHeight = container.clientHeight;

        container.scrollLeft = (contentWidth / 2) - (containerWidth / 2);
        container.scrollTop = (contentHeight / 2) - (containerHeight / 2);
        mapInitialized = true; 
    }
    drawPath(); 
}

// تشغيل عند التحميل
window.addEventListener('load', () => {
  document.querySelectorAll('.landmark').forEach(l => {
    l.addEventListener('click', () => {
      const vidId = l.getAttribute('data-video');
      openVideoModal(vidId);
    });
  });

  const splash = document.getElementById('splash');
  setTimeout(() => {
    if(splash) splash.classList.add('hide');
    if (window.__showTab) window.__showTab('streamers');
  }, 1100);
});