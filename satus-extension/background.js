// Este script corre en el "cerebro" del navegador
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
    console.log("🛡️ Cerebro recibió URL:", request.url);
    
    // AQUÍ es donde haremos el fetch a http://localhost:3000/detections
    // Por ahora simulamos una respuesta rápida
    setTimeout(() => {
      sendResponse({ status: "Procesando con IA... (conexion con NestJS)" });
    }, 500);

    return true; // Mantiene el canal abierto para respuestas asíncronas
  }
});
