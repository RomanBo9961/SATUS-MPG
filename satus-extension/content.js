let userRole = "GUEST";
let threatList = new Set();
let satusBadge = null;
let isShieldActive = true;
let activeLink = "";
let mouseTimer = null;

//DEF Centinela
async function sentinelScan() {
  if (userRole !== "PROLicense") return;
  console.log("🕵️ CENTINELA: Analizando hilos sucios en el DOM...");

  const links = Array.from(document.querySelectorAll("a"))
    .map((a) => a.href)
    .filter((href) => href.startsWith("http://"));

  if (links.length > 0) {
    chrome.runtime.sendMessage(
      { action: "BULK_CHECK", links: links.slice(0, 15) },
      (res) => {
        if (res?.threats) {
          res.threats.forEach((t) => threatList.add(t));
          if (threatList.size > 0) changeFaviconToSkull();
        }
      },
    );
  }
}

//Portal para ID
window.addEventListener("message", (event) => {
  if (
    event.source !== window ||
    !event.data ||
    event.data.source !== "SATUS_DASHBOARD"
  )
    return;
  if (event.data.action === "SYNC_AUTH") {
    console.log("🔗 [PUENTE] Identidad captada, sincronizando...");
    chrome.runtime.sendMessage(event.data);
  }
});

function bootstrapIdentity() {
  // Delay para asegurar que Background y Storage sincronizen
  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "GET_IDENTITY" }, (response) => {
      if (response) {
        userRole = response.role;
        console.log(`--- [CENTINELA] IDENTIDAD RECUPERADA: ${userRole} ---`);

        if (userRole === "PROLicense") {
          console.log("🛡️ MODO PRO DETECTADO: Protocolos activos.");

          checkPageIntegrity();
          sentinelScan();
        }
      }
    });
  }, 150);
}

// 2. Ejecuta al nacer la pestaña
bootstrapIdentity();

const style = document.createElement("style");
style.innerHTML = `
  @keyframes satus-pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.19); opacity: 1; filter: drop-shadow(0 0 25px rgba(205, 127, 50, 1)); }
    100% { transform: scale(1); opacity: 0.8; }
  }
`;
document.head.appendChild(style);

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

    // PRUEBA DE FUEGO 1: ¿Qué tiene la extensión en la mano antes de enviarlo?
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
        satusBadge.style.filter = "drop-shadow(0 0 8px #c09e2fbe)";
        satusBadge.style.transition = "transform 0.2s";

        if (chrome.runtime.lastError || !response) {
          console.error("❌ Error de comunicación:", chrome.runtime.lastError);
          alert("❌ Error: No se pudo contactar con la central SATUS.");
        } else {
          const fullMessage = response.status || response.message || "";

          if (!fullMessage) {
            console.error(
              "⚠️ [CENTINELA] Respuesta de análisis vacía o corrupta.",
            );
            return;
          }

          let parts = fullMessage.split("**");
          let shortMessage = fullMessage;

          if (parts.length > 9) {
            // Toma el final del bloque de "Resultado" y "Reputación"
            shortMessage = parts.slice(0, 9).join("**").trim() + "...";
          } else {
            // Si el mensaje es corto queda entero
            shortMessage = fullMessage.substring(0, 500).trim() + "...";
          }

          const displayMessage =
            shortMessage +
            " <br><br><b style='color: #aaa697be;'>[ FIN DE MINUTA ]</b>";

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
  window.addEventListener(
    "scroll",
    () => {
      setTimeout(() => {
        if (popup) popup.classList.add("satus-fade-out");
        setTimeout(() => popup.remove(), 500);
      }, 7000); // 7 segundos de cortesía
    },
    { once: true },
  );
}

//SCRIPT de bloque ACTIVO de URLS
async function checkPageIntegrity() {
  chrome.storage.local.get(["satusUser"], async (result) => {
    userRole = result.satusUser?.role || "GUEST";
    if (userRole !== "PROLicense") return;

    // Envio de la URL para analisis VT
    chrome.runtime.sendMessage(
      {
        action: "CHECK_PAGE_INTEGRITY",
        url: window.location.href,
      },
      (response) => {
        if (response?.isSafe) {
          console.log(
            "🔐 SATUS: Web Segura Confirmada. Sistema en Plano Secundario.",
          );
        } else {
          console.log("⚠️ SATUS: Web Cuestionable. Inicializando Bloqueos...");
        }

        if (response?.blacklistedLinks) {
          response.blacklistedLinks.forEach((link) => threatList.add(link));
          if (threatList.size > 0) {
            console.log(
              `💀 SATUS: ${threatList.size} Amenazas Neutralizadas en esta página.`,
            );
            // 💀 CAMBIO DE FAVICON (Opcional)
            changeFaviconToSkull();
          }
        }
      },
    );
  });
}

// INTERCEPCIÓN DE CLICS
document.addEventListener(
  "click",
  (e) => {
    if (userRole !== "PROLicense") return;

    const link = e.target.closest("a");
    if (link && threatList.has(link.href)) {
      e.preventDefault();
      e.stopPropagation();

      const warningHtml = `
  <div style="text-align: center;">
    <b class="satus-threat-alert">💀 [ ACCESO BLOQUEADO ]</b><br><br>
    <p style="color: #ccc; font-size: 11px;">El núcleo ha detectado este hilo contenedor de phishing o malware y a impedido el acceso para su seguridad.</p>
    <div id="btn-container"></div>
    <a href="${link.href}" target="_blank" style="color: #444; font-size: 9px; display: block; margin-top: 15px;">
        Entiendo el riesgo y aun asi deseo acceder...
    </a>
  </div>
`;

      showSatusPopup(warningHtml, e.pageX, e.pageY);

      setTimeout(() => {
        const container = document.getElementById("btn-container");
        if (container) {
          const btn = document.createElement("button");
          btn.innerText = "[ REGRESAR AL NÚCLEO ]";
          btn.className = "satus-main-btn"; // 👈 Usa el estilo unificado
          btn.onclick = () => document.querySelector(".satus-popup")?.remove();
          container.appendChild(btn);
        }
      }, 50);
    }
  },
  true,
);

function changeFaviconToSkull() {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  //emoji converso a img
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  ctx.font = "28px serif";
  ctx.fillText("💀", 0, 28);
  link.href = canvas.toDataURL();
  document.getElementsByTagName("head")[0].appendChild(link);
}

window.addEventListener("message", (event) => {
  // Solo mjs de web y marca propios
  if (
    event.source !== window ||
    !event.data ||
    event.data.source !== "SATUS_DASHBOARD"
  )
    return;

  if (event.data.action === "SYNC_AUTH") {
    console.log(
      "🔗 [PUENTE] Identidad captada vía PostMessage, sincronizando...",
    );
    chrome.runtime.sendMessage(event.data);
  }
});

initSatusSensor();
bootstrapIdentity();
