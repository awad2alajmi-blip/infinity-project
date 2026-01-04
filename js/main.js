// ==========================================
// 1. Central Configuration (Auto System)
// ==========================================
const STREAMERS_CONFIG = {
    "GhTzy":    { name: "GhTzy", color: "#fe8f1c", avatar: "assets/GHTZY.webp" },
    "3Yazan":   { name: "3Yazan", color: "#1a5a7d", avatar: "assets/3YAZAN.webp" },
    "LNXX":     { name: "LNXX", color: "#efefef", avatar: "assets/LNXX.webp" },
    "ik70n":    { name: "ik70n", color: "#c59392", avatar: "assets/IK70N.webp" },
    "IA7MD":    { name: "IA7MD", color: "#fcb58f", avatar: "assets/IA7MD.webp" },
    "M8Y8":     { name: "M8Y8", color: "#ffffff", avatar: "assets/M8Y8.webp" },
    "IIYousf":  { name: "IIYousf", color: "#6f8bbd", avatar: "assets/llYOUSF.webp" },
    "SkyHunter":{ name: "SkyHunter", color: "#14c7e8", avatar: "assets/skyhunter.webp" }
};

let streamData = {}; 
let currentDate = new Date(2026, 0, 1); // Start at Jan 2026

// ==========================================
// 2. Main Logic & Init
// ==========================================

function showTab(id) {
    const sections = document.querySelectorAll('main .section');
    const tabs = document.querySelectorAll('nav.topnav a[data-tab]');
    const targetSection = document.getElementById(id);

    if (!targetSection) return;

    sections.forEach(s => s.classList.remove('active'));
    tabs.forEach(a => a.classList.remove('active'));

    targetSection.classList.add('active');
    const activeTab = document.querySelector(`nav.topnav a[data-tab="${id}"]`);
    if (activeTab) activeTab.classList.add('active');

    // Trigger map drawing if paths tab is selected
    if (id === 'paths' && typeof drawPath === 'function') {
        setTimeout(drawPath, 50); // Small delay to ensure visible
    }
}

// Security & Key Interceptors
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) return false;
    if (e.ctrlKey && e.keyCode == 85) return false;
};

window.addEventListener('load', () => {
    // Splash Screen
    const splash = document.getElementById('splash');
    setTimeout(() => {
        if (splash) splash.classList.add('hide');

        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(hash)) {
            showTab(hash);
        } else {
            showTab('streamers'); 
        }
    }, 1100);

    // Nav Listeners
    document.querySelectorAll('nav.topnav a[data-tab]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            showTab(tab.dataset.tab);
        });
    });

    // Modal Triggers
    document.querySelectorAll('.landmark').forEach(l => {
        l.addEventListener('click', () => {
            const vidId = l.getAttribute('data-video');
            if (typeof openVideoModal === 'function') openVideoModal(vidId);
        });
    });

    // Init Logic
    init3DCards();
    
    // NEW: Fetch Data for Challenge
    fetchStreamsData();
});

// ==========================================
// 3. Challenge & Automation Logic
// ==========================================

async function fetchStreamsData() {
    try {
        const response = await fetch('streams.json');
        if (!response.ok) throw new Error("Failed to load stream data");
        streamData = await response.json();
        initChallengeUI();
    } catch (error) {
        console.warn("Could not load streams.json, initializing empty calendar.", error);
        initChallengeUI(); 
    }
}

function initChallengeUI() {
    updateProgressStats();
    renderCalendar();

    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if(prevBtn) prevBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };
    if(nextBtn) nextBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };
}

function updateProgressStats() {
    let totalHours = 0;
    const GOAL = 1000;

    // Calculate total
    Object.values(streamData).forEach(dayArr => {
        dayArr.forEach(s => totalHours += (s.hours || 0));
    });

    // Update Elements
    const elCurrent = document.getElementById('streamingHours');
    const elRemain = document.getElementById('hoursRemaining');
    const elPercent = document.getElementById('completionPercent');
    const elBar = document.getElementById('streamingProgress');

    if(elCurrent) animateValue(elCurrent, 0, totalHours, 1500);
    
    const remaining = Math.max(GOAL - totalHours, 0);
    if(elRemain) elRemain.innerText = remaining.toFixed(1);

    const pct = Math.min((totalHours / GOAL) * 100, 100).toFixed(1);
    if(elPercent) elPercent.innerText = pct + '%';
    if(elBar) elBar.style.width = pct + '%';
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('currentMonthLabel');
    if (!grid || !label) return;

    grid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    
    label.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day-tile empty';
        grid.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayStreams = streamData[dateKey];

        const tile = document.createElement('div');
        tile.className = 'day-tile';
        
        let html = `<span class="day-num">${day}</span>`;

        if (dayStreams && dayStreams.length > 0) {
            tile.classList.add('has-stream');
            html += `<div class="day-dots">`;
            dayStreams.forEach(s => {
                const conf = STREAMERS_CONFIG[s.streamerId] || { color: '#fff' };
                html += `<div class="stream-dot" style="background:${conf.color};color:${conf.color}"></div>`;
            });
            html += `</div>`;

            // Events
            tile.onclick = (e) => showTooltip(e, dayStreams, dateKey);
            tile.onmouseenter = (e) => showTooltip(e, dayStreams, dateKey);
            tile.onmouseleave = hideTooltip;
        }

        tile.innerHTML = html;
        grid.appendChild(tile);
    }
}

function showTooltip(e, streams, date) {
    const tooltip = document.getElementById('streamTooltip');
    const content = tooltip.querySelector('.tooltip-content');
    
    let html = `<div class="tooltip-date">${date}</div>`;

    streams.forEach(s => {
        const conf = STREAMERS_CONFIG[s.streamerId] || { name: s.streamerId, color: '#fff', avatar: 'assets/LOGO.png' };
        html += `
            <div class="tooltip-row">
                <img src="${conf.avatar}" class="t-avatar" alt="img">
                <div class="t-info">
                    <span class="t-name" style="color:${conf.color}">${conf.name}</span>
                    <span class="t-game">${s.game}</span>
                </div>
                <div class="t-hours">${s.hours}س</div>
            </div>
        `;
    });

    content.innerHTML = html;
    tooltip.classList.add('active');

    // Positioning
    const rect = e.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Center tooltip above tile
    let top = rect.top + window.scrollY - tooltipRect.height - 10;
    let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

function hideTooltip() {
    document.getElementById('streamTooltip').classList.remove('active');
}

// ==========================================
// 4. Utility Functions (Modal, 3D Cards, Anim)
// ==========================================

function openVideoModal(videoSource) {
    const videoModal = document.getElementById('video-modal');
    const modalContent = videoModal.querySelector('.video-modal-content');
    const videoIframe = document.getElementById('video-iframe');

    const oldVideo = document.getElementById('video-player');
    if (oldVideo) oldVideo.remove();

    videoIframe.src = "";
    videoIframe.style.display = 'none';

    if (videoSource.includes('.mp4')) {
        const videoElement = document.createElement('video');
        videoElement.id = 'video-player';
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.src = videoSource.startsWith('assets/') ? videoSource : 'assets/' + videoSource;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.display = 'block';
        modalContent.appendChild(videoElement);
        videoModal.style.display = 'flex';
    } else {
        videoIframe.style.display = 'block';
        let url = videoSource;
        if (videoSource.length === 11) { 
            url = `https://www.youtube.com/embed/${videoSource}?autoplay=1&rel=0`;
        }
        videoIframe.src = url;
        videoModal.style.display = 'flex';
    }
}

function closeVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const videoIframe = document.getElementById('video-iframe');
    const videoPlayer = document.getElementById('video-player');

    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = "";
        videoPlayer.load();
        videoPlayer.remove();
    }
    if (videoIframe) videoIframe.src = "";
    videoModal.style.display = 'none';
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
             obj.innerHTML = end; 
        }
    };
    window.requestAnimationFrame(step);
}

function init3DCards(){
  const cards = document.querySelectorAll('.card');
  function hexToRgb(hex){
    const h = (hex || '#14c7e8').replace('#','').trim();
    const full = h.length===3 ? h.split('').map(c=>c+c).join('') : h;
    const n = parseInt(full,16);
    return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
  }

  cards.forEach(card=>{
    const avatar = card.querySelector('.avatar');
    const glow = card.querySelector('.glow');
    const data = (card.dataset.col||'').split(',');
    const color = (data[0]||'#14c7e8').trim();
    const rgb = hexToRgb(color);

    if(avatar && !card.classList.contains('game-card')) {
      avatar.style.boxShadow = `0 12px 36px rgba(${rgb},0.12)`;
    }

    card.addEventListener('mouseenter', ()=>{
      if(glow){
        glow.style.background = `radial-gradient(circle at 50% 45%, rgba(${rgb},0.38), transparent 55%)`;
        glow.style.opacity = '1';
      }
    });

    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width/2, cy = r.height/2;
      const dx = (x-cx)/cx, dy = (y-cy)/cy;
      const rx = (-dy * 8).toFixed(2), ry = (dx * 8).toFixed(2);
      
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
      if(avatar) avatar.style.transform = `translateZ(24px)`;
    });

    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
      if(avatar) avatar.style.transform = '';
      if(glow) glow.style.opacity = '0';
    });

    card.style.opacity = 0;
    card.style.transform = 'translateY(6px)';
    setTimeout(()=>{
      card.style.transition = 'transform .5s cubic-bezier(.2,.9,.3,1), opacity .5s ease';
      card.style.opacity = 1;
      card.style.transform = 'none';
    }, 140 + Math.random()*260);
  });
}
