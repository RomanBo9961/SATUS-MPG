let satusBadge = null;
let isShieldActive = true;
let activeLink = "";
let mouseTimer = null;

function initSatusSensor() {
  console.log("SATUS Shield: Sensor cargado...");
  
  satusBadge = document.createElement('div');
  satusBadge.innerHTML = `<img src="${chrome.runtime.getURL('satus_shield.png')}" style="width: 24px; pointer-events: none;">`;
  
  satusBadge.style.cssText = `
    position: absolute;
    display: none;
    cursor: pointer;
    z-index: 10000;
    filter: drop-shadow(0 0 8px rgba(205, 127, 50, 0.6)); 
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    user-select: none;
  `;

  document.body.appendChild(satusBadge);

  // Efecto visual al pasar el mouse por el escudo
  satusBadge.onmouseenter = () => satusBadge.style.transform = 'scale(1.2)';
  satusBadge.onmouseleave = () => satusBadge.style.transform = 'scale(1)';

  document.addEventListener('mouseover', handleMouseOver);
  
  satusBadge.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!activeLink) return;

    // 🚩 PRUEBA DE FUEGO 1: ¿Qué tiene la extensión en la mano antes de enviarlo?
    console.log("📝 URL EN CONTENT.JS (ANTES DE ENVIAR):", activeLink);

    // 🌀 Animación de carga: Brillo intenso y rotación
    satusBadge.style.filter = 'drop-shadow(0 0 15px rgba(205, 127, 50, 1))';
    satusBadge.style.transform = 'scale(1.3) rotate(360deg)';
    satusBadge.style.transition = 'transform 1s linear, filter 0.3s';

    chrome.runtime.sendMessage({ action: "ANALYZE_LINK", url: activeLink }, (response) => {
      // 🛡️ vuelve a stado normal
      satusBadge.innerHTML = `<img src="${chrome.runtime.getURL('satus_shield.png')}" style="width: 24px;">`;
      satusBadge.style.transform = 'scale(1) rotate(0deg)';
      satusBadge.style.filter = 'drop-shadow(0 0 8px rgba(205, 127, 50, 0.6))';
      satusBadge.style.transition = 'transform 0.2s';
      
      if (chrome.runtime.lastError || !response) {
        console.error("❌ Error de comunicación:", chrome.runtime.lastError);
        alert("❌ Error: No se pudo contactar con la central SATUS.");
      } else {
        alert("🤖 SATUS AI dice: " + response.status);
      }
    });
  };
}

function handleMouseOver(e) {
  if (!isShieldActive || e.target === satusBadge) return;

  const link = e.target.closest('a');
  if (link) {
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
      // CAPTURA PURA: Sin procesar, sin Regex, solo lo que dice el HTML
      const rawHref = link.getAttribute('href') || "";
      
      try {
        // Convertimos a URL absoluta usando el motor nativo de Chrome
        activeLink = new URL(rawHref, window.location.origin).href;
        
        const rect = link.getBoundingClientRect();
        satusBadge.style.display = 'block';
        satusBadge.style.top = (rect.top + window.scrollY - 22) + 'px';
        satusBadge.style.left = (rect.left + window.scrollX) + 'px';
        satusBadge.style.padding = "10px"; 
        satusBadge.style.marginTop = "-10px";
      } catch (err) {
        activeLink = "";
      }
    }, 10);
  } else {
    {
    clearTimeout(mouseTimer); 
    mouseTimer = setTimeout(() => {
      // Se oculta solo si el mouse NO está encima del escudo
      if (!satusBadge.matches(':hover')) {
        satusBadge.style.display = 'none';
      }
    }, 500); 
  }
  }
}

// --- ARRANQUE Y CONTROL ---
chrome.storage.local.get(['satusActive'], (result) => {
  isShieldActive = result.satusActive !== false;
  initSatusSensor();
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_SHIELD") {
    isShieldActive = request.status;
    if (!isShieldActive && satusBadge) satusBadge.style.display = 'none';
  }
});

function showSatusPopup(message, x, y) {
    const oldPopup = document.querySelector('.satus-popup');
    if (oldPopup) oldPopup.remove();

    const popup = document.createElement('div');
    popup.className = 'satus-popup';
    
    popup.innerHTML = `
        <div class="satus-popup-header">
            <span class="satus-logo">🛡️ SATUS Intelligence</span>
            <button class="satus-close" id="close-satus">×</button>
        </div>
        <div class="satus-popup-body">
            ${message.replace(/\n/g, '<br>')}
        </div>
        <div class="satus-popup-footer">
            Análisis en tiempo real ••• 
        </div>
    `;

    popup.style.top = (y + 30) + 'px';
    popup.style.left = x + 'px';

    document.body.appendChild(popup);

    document.getElementById('close-satus').onclick = () => popup.remove();
    
    // Auto-cerrar con Scroll
    window.addEventListener('scroll', () => popup.remove(), { once: true });
}

//Sincronizar automaticamente el token del ID de la extension
function syncAuth() {
  try {
    const token = localStorage.getItem('satusToken');
    const userRole = localStorage.getItem('user_role');
    const username = localStorage.getItem('username');

    if (chrome.runtime?.id) { 
      if (token) {
        // Enviar credenciales reales
        chrome.runtime.sendMessage({
          action: "SYNC_AUTH",
          token: token,
          user: { username, role: userRole }
        });
      } else {
        // LOGOUT / INVITADO
        chrome.runtime.sendMessage({
          action: "SYNC_AUTH",
          token: 'GUEST_TOKEN', 
          user: { username: 'INVITADO', role: 'GUEST' }
        });
      }
    }
  } catch (e) {
    // Silencio en páginas con Storage bloqueado
  }
}

syncAuth();
window.addEventListener('storage', syncAuth);