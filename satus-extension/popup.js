document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shield-toggle');
  const statusText = document.getElementById('status-text');
  const btnDashboard = document.getElementById('go-dashboard');

  // 1. RECUPERAR: Al abrir el popup, preguntamos a Chrome cómo estaba el switch
  chrome.storage.local.get(['satusActive'], (result) => {
    // Si es la primera vez (undefined), asumimos que está ACTIVADO (true)
    const isActive = result.satusActive !== false; 
    toggle.checked = isActive;
    actualizarInterfaz(isActive);
  });

  // 2. GUARDAR: Cuando el usuario mueve el switch
  toggle.addEventListener('change', () => {
    const isActive = toggle.checked;
    
    // Guardamos la elección en el "disco duro" de la extensión
    chrome.storage.local.set({ satusActive: isActive }, () => {
      actualizarInterfaz(isActive);
      
        // COMUNICACIÓN EN VIVO: Avisar a todas las pestañas del cambio
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          // Solo enviamos mensaje a pestañas con URLs reales (http/https)
          if (tab.url && tab.url.startsWith('http')) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "TOGGLE_SHIELD", 
              status: isActive 
            }).catch(err => {
              // Silenciamos errores en pestañas donde el script no cargó
              console.log("Pestaña no lista para recibir mensajes.");
            });
          }
        });
      });
    });
  });

  // Función para no repetir código visual
  function actualizarInterfaz(isActive) {
    if (isActive) {
      statusText.innerText = "Activa";
      statusText.className = "value online";
    } else {
      statusText.innerText = "Inactiva";
      statusText.className = "value";
    }
  }

  // Abrir el Dashboard
  btnDashboard.onclick = () => {
    chrome.tabs.create({ url: 'http://localhost:4200' });
  };
});
