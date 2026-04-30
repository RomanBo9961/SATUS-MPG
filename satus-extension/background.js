// 1. Menú Contextual (Click derecho)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeWithSatus",
    title: "🛡️ Analizar link con SATUS",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeWithSatus") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (url) => { alert("SATUS está procesando: " + url); },
      args: [info.linkUrl]
    });
  }
});

// 2. RECEPTOR ÚNICO DE MENSAJES (Sincronización y Escaneo)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // A. Sincronización de Identidad (procedente del content.js)
  if (request.action === "SYNC_AUTH") {
    const token = request.token || 'GUEST_TOKEN'; 
    chrome.storage.local.set({ 
      satusToken: request.token,
      satusUser: request.user
    }, () => {
      console.log("🔄 [SATUS] Identidad sincronizada con éxito.");
    });
    return false; 
  }

  // B. Orden de Escaneo (procedente del content.js en respuesta al click de 🛡️)
  if (request.action === "ANALYZE_LINK") {
    chrome.storage.local.get(['satusToken'], (result) => {
      const token = result.satusToken || 'GUEST_TOKEN';

      fetch("http://localhost:3000/api/detections/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ url: request.url })
      })
      .then(res => {
        if (res.status === 401) throw new Error("Nodo no autorizado. Inicie sesión en la web.");
        return res.json();
      })
      .then(data => sendResponse({ status: data.message }))
      .catch(err => sendResponse({ status: err.message }));
    });
    return true; // Mantiene el canal abierto para el fetch asíncrono
  }
});
