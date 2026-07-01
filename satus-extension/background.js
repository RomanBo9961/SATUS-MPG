// 1. Menú Contextual (Click derecho)
const IS_DEVELOPMENT = false;

const BACKEND_URL = IS_DEVELOPMENT
  ? "http://localhost:3000/api"
  : "https://satus-ecosystem.onrender.com";

const FRONTEND_URL = IS_DEVELOPMENT
  ? "http://localhost:4200"
  : "https://onrender.com";

let currentSatusUser = { username: "INVITADO", role: "GUEST" };

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeWithSatus",
    title: "Analizar link con SATUS",
    contexts: ["link"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeWithSatus") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (url) => {
        alert("SATUS está procesando: " + url);
      },
      args: [info.linkUrl],
    });
  }
});

// 2. RECEPTOR ÚNICO DE MENSAJES (Sincronización y Escaneo)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // A. Sincronización de Id(procedente del content.js)
  if (request.action === "SYNC_AUTH") {
    if (request.token && request.token !== "GUEST_TOKEN") {
      currentSatusUser = request.user;

      // Guardado asíncrono
      chrome.storage.local.set(
        {
          satusToken: request.token,
          satusUser: request.user,
        },
        () => {
          console.log("💾 [CENTRAL] Identidad PRO anclada en el búnker.");
        },
      );
    }

    // LOGOUT / Bajar a GUEST (peticion del Dash)
    else if (request.token === "GUEST_TOKEN") {
      currentSatusUser = { username: "INVITADO", role: "GUEST" };
      chrome.storage.local.set(
        {
          satusToken: "GUEST_TOKEN",
          satusUser: currentSatusUser,
        },
        () => {
          console.log("🔌 [CENTRAL] Vínculo cerrado. GUEST por defecto.");
          chrome.tabs.query({}, (tabs) => {
            if (tabs && tabs.length > 0) {
              tabs.forEach((tab) => {
                //if (tab.url && tab.url.includes("localhost:4200")) {
                if (tab.url && tab.url.includes(FRONTEND_URL)) {
                  console.log(
                    `🛰️ [CENTRAL] Forzando purga de localStorage en: ${tab.id}`,
                  );

                  chrome.scripting
                    .executeScript({
                      target: { tabId: tab.id },
                      func: () => {
                        console.log(
                          "🔌 [SATUS SHIELD] Purga atómica ejecutada desde la central.",
                        );
                        localStorage.clear();
                        //window.location.href = "http://localhost:4200/login";
                        window.location.href = `${FRONTEND_URL}/login`;
                      },
                    })
                    .catch(() => {});
                }
              });
            }
          });
        },
      );
      return false;
    }
    return false;
  }

  if (request.action === "GET_IDENTITY") {
    if (currentSatusUser && currentSatusUser.role !== "GUEST") {
      sendResponse(currentSatusUser);
      return false;
    } else {
      chrome.storage.local.get(["satusUser"], (result) => {
        if (result.satusUser && result.satusUser.role !== "GUEST") {
          currentSatusUser = result.satusUser; // Sincronizamos la RAM
          sendResponse(result.satusUser);
        } else {
          sendResponse(currentSatusUser);
        }
      });
      return true;
    }
  }

  // B. Orden de Escaneo (procedente del content.js en respuesta al click de 🛡️)
  if (request.action === "ANALYZE_LINK") {
    chrome.storage.local.get(["satusToken"], (result) => {
      const token = result.satusToken || "GUEST_TOKEN";

      //fetch("http://localhost:3000/api/detections/scan", {
      fetch(`${BACKEND_URL}/detections/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: request.url }),
      })
        .then((res) => {
          if (res.status === 401)
            throw new Error("Nodo no autorizado. Inicie sesión en la web.");
          return res.json();
        })
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ error: true, message: err.message }));
    });
    return true; // Mantiene el canal abierto para el fetch asíncrono
  }

  // C. [NIVEL PRO] VERIFICACIÓN DE INTEGRIDAD DEL SITIO (Al cargar la página)
  if (request.action === "CHECK_PAGE_INTEGRITY") {
    chrome.storage.local.get(["satusToken"], (result) => {
      const token = result.satusToken || "GUEST_TOKEN";

      //fetch("http://localhost:3000/api/detections/check-integrity", {
      fetch(`${BACKEND_URL}/detections/check-integrity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: request.url }),
      })
        .then((res) => res.json())
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ isSafe: false, error: err.message }));
    });
    return true;
  }

  // D. [NIVEL PRO] ANÁLISIS DE ENLACES EXTERNOS (Modo Centinela)
  if (request.action === "BULK_CHECK") {
    chrome.storage.local.get(["satusToken"], (result) => {
      const token = result.satusToken || "GUEST_TOKEN";

      //fetch("http://localhost:3000/api/detections/bulk-check", {
      fetch(`${BACKEND_URL}/detections/bulk-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ links: request.links }),
      })
        .then((res) => res.json())
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ threats: [] }));
    });
    return true;
  }
});
