document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("shield-toggle");
  const statusText = document.getElementById("status-text");
  const btnDashboard = document.getElementById("go-dashboard");
  const userRoleDisplay = document.getElementById("user-role");

  function updateDisplay(user) {
    if (user) {
      const name = user.username || "INVITADO";
      const role = user.role || "GUEST";
      userRoleDisplay.innerText = `${name.toUpperCase()} | ${role}`;

      if (role === "GUEST" || name === "INVITADO") {
        userRoleDisplay.classList.remove("online");
      } else {
        userRoleDisplay.classList.add("online");
      }
    }
  }

  // 🛰️ PREGUNTA AL BACKGROUND AL ABRIR
  chrome.runtime.sendMessage({ action: "GET_IDENTITY" }, (response) => {
    console.log("🕵️ POPUP RECIBIÓ DEL BG:", response);

    if (response && response.role !== "GUEST") {
      updateDisplay(response);
    } else {
      // 2. Si el background no sabe, mirar el Storage (Lo que antes funcionaba)
      chrome.storage.local.get(["satusUser"], (result) => {
        console.log("🕵️ POPUP RECIBIÓ DEL STORAGE:", result.satusUser);
        updateDisplay(result.satusUser);
      });
    }
  });

  // 1. Chrome devuelve el estado del switch
  chrome.storage.local.get(["satusActive"], (result) => {
    const isActive = result.satusActive !== false;
    toggle.checked = isActive;
    actualizarInterfaz(isActive);
  });

  // 2. Guarda el estado => si el usuario mueve el switch
  toggle.addEventListener("change", () => {
    const isActive = toggle.checked;
    chrome.storage.local.set({ satusActive: isActive }, () => {
      actualizarInterfaz(isActive);
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url && tab.url.startsWith("http")) {
            chrome.tabs
              .sendMessage(tab.id, {
                action: "TOGGLE_SHIELD",
                status: isActive,
              })
              .catch(() => {});
          }
        });
      });
    });
  });

  function actualizarInterfaz(isActive) {
    statusText.innerText = isActive ? "Activa" : "Inactiva";
    statusText.className = isActive ? "value online" : "value";
  }

  btnDashboard.onclick = () => {
    chrome.tabs.create({ url: "http://localhost:4200" });
  };
});
