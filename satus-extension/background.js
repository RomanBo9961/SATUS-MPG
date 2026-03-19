chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeWithSatus",
    title: "🛡️ Analizar link con SATUS",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeWithSatus") {
    // mensaje rápido de test
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (url) => { alert("SATUS está analizando este link: " + url); },
      args: [info.linkUrl]
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ANALYZE_LINK") {
    console.log("🛡️ Central recibió enlace:", request.url);
    
   // Petición POST al endpoint en NestJS
    fetch("http://localhost:3000/detections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: request.url })
    })
    .then(response => {
      if (!response.ok) throw new Error("Error en el servidor SATUS");
      return response.json();
    })
    .then(data => {
      // Respuesta de AI al content.js
      sendResponse({ status: data.message });
    })
    .catch(error => {
      console.error("❌ Error de conexión:", error);
      sendResponse({ status: "Error: El servidor SATUS no responde." });
    });

    return true; // Mantiene el canal abierto para la respuesta asíncrona del fetch
  }
});
