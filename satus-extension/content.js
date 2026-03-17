// content.js - El "ojo" selectivo de SATUS con reacción en vivo
let satusBadge = null;
let isShieldActive = true;
let activeLink = "";

// 1. FUNCIÓN DE INICIALIZACIÓN (Crea el escudo y los eventos)
function initSatusSensor() {
  console.log("🛡️ SATUS Shield: Sensor de proximidad cargado...");
  
  satusBadge = document.createElement('div');
  satusBadge.innerHTML = '🛡️';
  satusBadge.style.cssText = `
    position: absolute;
    display: none;
    cursor: pointer;
    z-index: 10000;
    font-size: 18px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    transition: transform 0.2s;
  `;
  document.body.appendChild(satusBadge);

  // Escuchamos el mouse
  document.addEventListener('mouseover', handleMouseOver);
  
  // Acción al hacer clic (Tu lógica original con efectos)
  satusBadge.onclick = (e) => {
    e.preventDefault();
    console.log("🛡️ Enviando reporte al cerebro SATUS...");
    satusBadge.innerText = '🌀'; 
    satusBadge.style.transform = 'scale(1.2)';

    chrome.runtime.sendMessage({ action: "ANALYZE_LINK", url: activeLink }, (response) => {
      satusBadge.innerText = '🛡️';
      satusBadge.style.transform = 'scale(1)';
      if (chrome.runtime.lastError || !response) {
        alert("❌ Error: No se pudo contactar con el servidor SATUS.");
      } else {
        alert("🤖 SATUS AI dice: " + response.status);
      }
    });
  };
}

// 2. MANEJADOR DE HOVER (Solo funciona si isShieldActive es true)
function handleMouseOver(e) {
  if (!isShieldActive) return;

  const link = e.target.closest('a');
  if (link && link.href.startsWith('http')) {
    activeLink = link.href;
    const rect = link.getBoundingClientRect();
    satusBadge.style.display = 'block';
    satusBadge.style.top = (rect.top + window.scrollY - 20) + 'px';
    satusBadge.style.left = (rect.left + window.scrollX + (rect.width / 2)) + 'px';
  } else if (e.target !== satusBadge) {
    satusBadge.style.display = 'none';
  }
}

// --- ARRANQUE Y CONTROL DE ESTADO ---

// A. Al cargar la página: Leemos cómo está el switch
chrome.storage.local.get(['satusActive'], (result) => {
  isShieldActive = result.satusActive !== false;
  initSatusSensor();
  
  if (!isShieldActive) {
    console.log("🛡️ SATUS Shield: Iniciado en modo DESACTIVADO.");
  }
});

// B. ESCUCHA EN VIVO: El popup nos avisa si el usuario mueve el switch
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_SHIELD") {
    isShieldActive = request.status;
    console.log(isShieldActive ? "🛡️ SATUS Activado en vivo" : "🛡️ SATUS Desactivado en vivo");
    
    // Si se desactiva, ocultamos el escudo inmediatamente
    if (!isShieldActive && satusBadge) {
      satusBadge.style.display = 'none';
    }
  }
});
