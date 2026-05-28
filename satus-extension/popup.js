document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("shield-toggle"),
    statusText = document.getElementById("status-text");
  const authBtn = document.getElementById("auth-action-btn"),
    dashLink = document.getElementById("go-dashboard-link");
  const userRoleDisplay = document.getElementById("user-role");

  function updateDisplay(user) {
    const name = user?.username || "INVITADO",
      role = user?.role || "GUEST",
      isGuest = role === "GUEST" || name === "INVITADO";
    userRoleDisplay.innerText = `${name.toUpperCase()} | ${role}`;
    userRoleDisplay.classList.toggle("online", !isGuest);

    // Intercambiar estados y acciones según MongoDB
    authBtn.innerText = isGuest ? "[ INICIAR SESIÓN ]" : "[ CERRAR SESIÓN ]";
    authBtn.onclick = () =>
      isGuest
        ? chrome.tabs.create({ url: "http://localhost:4200/login" })
        : logoutSession();

    dashLink.innerText = isGuest
      ? "// SATUS ENGINE //"
      : "> ACCEDER DASHBOARD <";
    dashLink.style.color = isGuest ? "#444" : "#c09e2fbe";
    dashLink.onclick = isGuest
      ? null
      : () => chrome.tabs.create({ url: "http://localhost:4200/dashboard" });
  }

  // Degrada el token en background.js y refresca la pestaña activa
  const logoutSession = () => {
    chrome.runtime.sendMessage(
      {
        action: "SYNC_AUTH",
        token: "GUEST_TOKEN",
        user: { username: "INVITADO", role: "GUEST" },
      },
      () => {
        updateDisplay({ username: "INVITADO", role: "GUEST" });

        // DISPARADOR AL CONTEXTO DE LA WEB A TRAVES DEL EVENTLIST DEL CONTENT
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs && tabs[0];
          if (activeTab && activeTab.id) {
            console.log(
              `🔌 [POPUP] Envio de orden de destrcc de sesion directa a la pestaña: ${activeTab.id}`,
            );

            chrome.tabs
              .sendMessage(activeTab.id, { action: "FORCE_WEB_LOGOUT" })
              .catch(() => {});
          }
        });
      },
    );
  };

  // Recupera la identidad real de la sesión
  chrome.runtime.sendMessage({ action: "GET_IDENTITY" }, (res) =>
    res?.role
      ? updateDisplay(res)
      : chrome.storage.local.get(["satusUser"], (s) =>
          updateDisplay(s.satusUser),
        ),
  );

  // Recupera el estado actual en la interfaz
  chrome.storage.local.get(["satusActive"], (s) => {
    toggle.checked = s.satusActive !== false;
    statusText.innerText = toggle.checked ? "Activa" : "Inactiva";
    statusText.className = toggle.checked ? "value online" : "value";
  });

  // Comunica el apagado del escudo a todas las pestañas
  toggle.onchange = () =>
    chrome.storage.local.set({ satusActive: toggle.checked }, () => {
      statusText.innerText = toggle.checked ? "Activa" : "Inactiva";
      statusText.className = toggle.checked ? "value online" : "value";
      chrome.tabs.query({}, (tabs) =>
        tabs.forEach(
          (t) =>
            t.url?.startsWith("http") &&
            chrome.tabs
              .sendMessage(t.id, {
                action: "TOGGLE_SHIELD",
                status: toggle.checked,
              })
              .catch(() => {}),
        ),
      );
    });
});
