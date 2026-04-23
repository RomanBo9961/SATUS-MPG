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
      func: (url) => { alert("SATUS está analizando: " + url); },
      args: [info.linkUrl]
    });
  }
});

// 2. RECIBIR TOKEN DESDE LA WEB (Angular)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "SET_TOKEN") {
    chrome.storage.local.set({ 
      satusToken: request.token,
      satusUser: request.user
    }, () => {
      console.log("🔑 [Satus_Central] Token y Perfil sincronizados.");
    });
  }
  return true;
});

// ORDEN DE ESCANEO DESDE EL ESCUDO (content.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ANALYZE_LINK") {
    chrome.storage.local.get(['satusToken'], (result) => {
      const token = result.satusToken;

      fetch("http://localhost:3000/api/detections/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ url: request.url })
      })
      .then(res => {
        if (res.status === 401) throw new Error("Nodo no autorizado. Inicie sesión.");
        return res.json();
      })
      .then(data => sendResponse({ status: data.message }))
      .catch(err => sendResponse({ status: err.message }));
    });
    return true; 
  }

  
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "SET_TOKEN") {
    // Guarda el token automáticamente cuando haces login en la web
    chrome.storage.local.set({ 
      satusToken: request.token,
      satusUser: request.user
    }, () => {
      console.log("🔑 [SATUS_CENTRAL] Token sincronizado automáticamente.");
      if (sendResponse) sendResponse({ success: true });
    });
  }
  return true;
  });