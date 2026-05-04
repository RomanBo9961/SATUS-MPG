document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shield-toggle');
  const statusText = document.getElementById('status-text');
  const btnDashboard = document.getElementById('go-dashboard');
  const userRoleDisplay = document.getElementById('user-role');

  // BUSCA IDENTIDAD EN ALMACENAMIENTO DE LA EXTENSIÓN
  chrome.storage.local.get(['satusUser'], (result) => {
    if (result.satusUser) {
      const { username, role } = result.satusUser;
      
      // Formatea "NAME | ROLE"
      userRoleDisplay.innerText = `${username.toUpperCase()} | ${role}`;
      
      // INVITADO o GUEST sin brillo neón
      if (role === 'GUEST' || username === 'INVITADO') {
        userRoleDisplay.classList.remove('online');
      } else {
        userRoleDisplay.classList.add('online');
      }
    } else {
      userRoleDisplay.innerText = 'ACCESO ESTANDAR';
      userRoleDisplay.classList.remove('online');
    }
  });

  // 1. Chrome devuelve el estado del switch
  chrome.storage.local.get(['satusActive'], (result) => {
    const isActive = result.satusActive !== false; 
    toggle.checked = isActive;
    actualizarInterfaz(isActive);
  });

  // 2. Guarda el estado => si el usuario mueve el switch
  toggle.addEventListener('change', () => {
    const isActive = toggle.checked;
    chrome.storage.local.set({ satusActive: isActive }, () => {
      actualizarInterfaz(isActive);
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && tab.url.startsWith('http')) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "TOGGLE_SHIELD", 
              status: isActive 
            }).catch(() => {});
          }
        });
      });
    });
  });

  function actualizarInterfaz(isActive) {
    if (isActive) {
      statusText.innerText = "Activa";
      statusText.className = "value online";
    } else {
      statusText.innerText = "Inactiva";
      statusText.className = "value";
    }
  }

  btnDashboard.onclick = () => {
    chrome.tabs.create({ url: 'http://localhost:4200' });
  };
});