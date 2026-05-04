const style = document.createElement("style");
style.innerHTML = `
  @keyframes satus-pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.19); opacity: 1; filter: drop-shadow(0 0 25px rgba(205, 127, 50, 1)); }
    100% { transform: scale(1); opacity: 0.8; }
  }
`;
document.head.appendChild(style);

let satusBadge = null;
let isShieldActive = true;
let activeLink = "";
let mouseTimer = null;

function initSatusSensor() {
  console.log("SATUS Shield: Sensor cargado...");

  satusBadge = document.createElement("div");
  satusBadge.innerHTML = `<img src="${chrome.runtime.getURL("satus_shield.png")}" style="width: 24px; pointer-events: none; scale(0,9);">`;

  satusBadge.style.cssText = `
    position: absolute;
    display: none;
    cursor: pointer;
    z-index: 10000;
    filter: drop-shadow(0 0 8px rgba(139, 134, 128, 0.9)); 
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    user-select: none;
  `;

  document.body.appendChild(satusBadge);

  // Efecto visual al pasar el mouse por el escudo
  satusBadge.onmouseenter = () => (satusBadge.style.transform = "scale(1.017)");
  satusBadge.onmouseleave = () => (satusBadge.style.transform = "scale(0.9)");

  document.addEventListener("mouseover", handleMouseOver);

  satusBadge.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeLink) return;

    // 🚩 PRUEBA DE FUEGO 1: ¿Qué tiene la extensión en la mano antes de enviarlo?
    console.log("📝 URL EN CONTENT.JS (ANTES DE ENVIAR):", activeLink);

    // ACTIVACIÓN DEL PULSO
    satusBadge.style.animation = "satus-pulse 0.8s infinite ease-in-out";

    chrome.runtime.sendMessage(
      { action: "ANALYZE_LINK", url: activeLink },
      (response) => {
        // vuelve a stado normal
        satusBadge.style.animation = "none";
        satusBadge.innerHTML = `<img src="${chrome.runtime.getURL("satus_shield.png")}" style="width: 24px;">`;
        satusBadge.style.transform = "scale(1)";
        satusBadge.style.filter =
          "drop-shadow(0 0 8px #c09e2fbe)";
        satusBadge.style.transition = "transform 0.2s";

        if (chrome.runtime.lastError || !response) {
          console.error("❌ Error de comunicación:", chrome.runtime.lastError);
          alert("❌ Error: No se pudo contactar con la central SATUS.");
        } else {
          const fullMessage = response.status;
    
    let parts = fullMessage.split('**');
    let shortMessage = fullMessage;

    if (parts.length > 9) {
        // Toma el final del bloque de "Resultado" y "Reputación"
        shortMessage = parts.slice(0, 9).join('**').trim() + "...";
    } else {
        // Si el mensaje es corto queda entero
        shortMessage = fullMessage.substring(0, 500).trim() + "...";
    }

    const displayMessage = shortMessage + " <br><br><b style='color: #aaa697be;'>[ FIN DE MINUTA ]</b>";

    const popupContent = `<div class="satus-info-box" style="font-size: 11px; line-height: 1.4; color: #e0e0e0;">${displayMessage}</div><div style="margin-top: 15px; border-top: 1px solid #c09e2fcc; padding-top: 10px;"><a href="http://localhost:4200/dashboard" target="_blank" style="color: #c09e2fbe; text-decoration: none; font-size: 10px; font-weight: bold; letter-spacing: 1px; display: block;">> REPORTE DETALLADO</a></div>`;

    showSatusPopup(popupContent, e.pageX, e.pageY);
        }
      },
    );
  };
}

function handleMouseOver(e) {
  if (!isShieldActive || e.target === satusBadge) return;

  const link = e.target.closest("a");
  if (link) {
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
      // CAPTURA PURA: Sin procesar, sin Regex, solo lo que dice el HTML
      const rawHref = link.getAttribute("href") || "";

      try {
        // Convertimos a URL absoluta usando el motor nativo de Chrome
        activeLink = new URL(rawHref, window.location.origin).href;

        const rect = link.getBoundingClientRect();
        satusBadge.style.display = "block";
        satusBadge.style.top = rect.top + window.scrollY - 22 + "px";
        satusBadge.style.left = rect.left + window.scrollX + "px";
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
        if (!satusBadge.matches(":hover")) {
          satusBadge.style.display = "none";
        }
      }, 500);
    }
  }
}

// --- ARRANQUE Y CONTROL ---
chrome.storage.local.get(["satusActive"], (result) => {
  isShieldActive = result.satusActive !== false;
  initSatusSensor();
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_SHIELD") {
    isShieldActive = request.status;
    if (!isShieldActive && satusBadge) satusBadge.style.display = "none";
  }
});

function showSatusPopup(message, x, y) {
  const oldPopup = document.querySelector(".satus-popup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.className = "satus-popup";

  popup.innerHTML = `
        <div class="satus-popup-header">
            <span class="satus-logo">🛰️ SATUS Informó:</span>
            <button class="satus-close" id="close-satus">×</button>
        </div>
        <div class="satus-popup-body">
            ${message.replace(/\n/g, "<br>")}
        </div>
        <div class="satus-popup-footer">
            SATUS Card  
        </div>
    `;

  popup.style.top = y + 30 + "px";
  popup.style.left = x + "px";

  document.body.appendChild(popup);

  document.getElementById("close-satus").onclick = () => popup.remove();

  // Auto-cerrar con Scroll
window.addEventListener("scroll", () => {
    setTimeout(() => {
        if (popup) popup.classList.add('satus-fade-out'); 
        setTimeout(() => popup.remove(), 500); 
    }, 7000); // 7 segundos de cortesía
  }, { once: true });

}

//Sincronizar automaticamente el token del ID de la extension
function syncAuth() {
  try {
    const token = localStorage.getItem("satusToken");
    const userRole = localStorage.getItem("user_role");
    const username = localStorage.getItem("username");

    if (chrome.runtime?.id) {
      if (token) {
        // Enviar credenciales reales
        chrome.runtime.sendMessage({
          action: "SYNC_AUTH",
          token: token,
          user: { username, role: userRole },
        });
      } else {
        // LOGOUT / INVITADO
        chrome.runtime.sendMessage({
          action: "SYNC_AUTH",
          token: "GUEST_TOKEN",
          user: { username: "INVITADO", role: "GUEST" },
        });
      }
    }
  } catch (e) {
    // Silencio en páginas con Storage bloqueado
  }
}

syncAuth();
window.addEventListener("storage", syncAuth);
