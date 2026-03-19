// content.js - El "ojo" selectivo de SATUS con reacción en vivo
let satusBadge = null;
let isShieldActive = true;
let activeLink = "";

// 1. FUNCIÓN DE INICIALIZACIÓN (Crea el escudo y los eventos)
function initSatusSensor() {
  console.log("🛡️ SATUS Shield: Sensor cargado...");
  
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
    user-select: none;
  `;
  document.body.appendChild(satusBadge);

  // Escuchamos el mouse en el documento
  document.addEventListener('mouseover', handleMouseOver);
  
  // Acción al hacer clic
  satusBadge.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 🔹 Bloquea que el clic active el link de abajo
    
    if (!activeLink) return;

    console.log("🛡️ Enviando reporte a la central SATUS...");
    satusBadge.innerText = '🌀'; 
    satusBadge.style.transform = 'scale(1.2)';

    chrome.runtime.sendMessage({ action: "ANALYZE_LINK", url: activeLink }, (response) => {
      satusBadge.innerText = '🛡️';
      satusBadge.style.transform = 'scale(1)';
      if (chrome.runtime.lastError || !response) {
        alert("❌ Error: No se pudo contactar con el servidor de SATUS.");
      } else {
        alert("🤖 SATUS AI dice: " + response.status);
      }
    });
  };
}

// 2. DRIVER DE HOVER (Detección de links mejorada)
function handleMouseOver(e) {
  if (!isShieldActive) return;

  // Si el mouse está sobre el escudo mismo, no hacemos nada para evitar ruido
  if (e.target === satusBadge) return;

  const link = e.target.closest('a');
  
  if (link) {
    const rawHref = link.getAttribute('href');
    // 🔹 Convertimos a URL absoluta real para evitar caracteres duplicados
    if (rawHref && (rawHref.startsWith('http') || rawHref.startsWith('/') || rawHref.startsWith('#'))) {
      try {
        activeLink = new URL(rawHref, window.location.origin).href;
        
        const rect = link.getBoundingClientRect();
        satusBadge.style.display = 'block';
        satusBadge.style.top = (rect.top + window.scrollY - 22) + 'px';
        satusBadge.style.left = (rect.left + window.scrollX + (rect.width / 2) - 10) + 'px';
      } catch (err) {
        console.error("❌ Error procesando URL:", err);
      }
    }
  } else {
    // Si el mouse no está sobre un link ni sobre el escudo, lo ocultamos
    satusBadge.style.display = 'none';
  }
}

// --- ARRANQUE Y CONTROL DE ESTADO ---

// A. Al cargar la página: Leemos el estado del switch
chrome.storage.local.get(['satusActive'], (result) => {
  isShieldActive = result.satusActive !== false;
  initSatusSensor();
});

// B. Escucha en vivo para el switch del popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_SHIELD") {
    isShieldActive = request.status;
    if (!isShieldActive && satusBadge) {
      satusBadge.style.display = 'none';
    }
  }
});
