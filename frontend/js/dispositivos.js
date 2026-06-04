const usuarioActivo = localStorage.getItem("usuarioOCorreo");
const usuarioActivoElemento = document.getElementById("usuarioActivo");
const btnLogout = document.getElementById("btnLogout");

const btnAgregar = document.getElementById("btnAgregarDispositivo");
const inputDevice = document.getElementById("deviceId");
const inputName = document.getElementById("deviceName");
const mensaje = document.getElementById("mensajeDispositivo");
const lista = document.getElementById("listaDispositivos");

let dispositivos = JSON.parse(localStorage.getItem("dispositivos")) || [];

if (usuarioActivoElemento) {
    usuarioActivoElemento.textContent = usuarioActivo || "Usuario";
}

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioOCorreo");
        localStorage.removeItem("dispositivoSeleccionado");

        window.location.href = "login.html";
    });
}

function mostrarDispositivos() {
    if (dispositivos.length === 0) {
        lista.innerHTML = "<p>Aún no hay dispositivos registrados.</p>";
        return;
    }

    lista.innerHTML = "";

    dispositivos.forEach((dispositivo) => {
        const card = document.createElement("div");
        card.className = "info-card mt-3";

        card.innerHTML = `
            <h4>${dispositivo.nombre}</h4>
            <p><strong>ID:</strong> ${dispositivo.id}</p>
            <button class="map-button">
                Entrar al dashboard
            </button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            localStorage.setItem("dispositivoSeleccionado", dispositivo.id);
            window.location.href = "dashboard.html";
        });

        lista.appendChild(card);
    });
}

btnAgregar.addEventListener("click", () => {
    const deviceId = inputDevice.value.trim();
    const deviceName = inputName.value.trim();

    if (!deviceId) {
        mensaje.textContent = "Ingresa el ID del dispositivo.";
        return;
    }

    const nuevoDispositivo = {
        id: deviceId,
        nombre: deviceName || "Dispositivo sin nombre"
    };

    dispositivos.push(nuevoDispositivo);
    localStorage.setItem("dispositivos", JSON.stringify(dispositivos));

    mensaje.textContent = "Dispositivo agregado correctamente.";

    inputDevice.value = "";
    inputName.value = "";

    mostrarDispositivos();
});

mostrarDispositivos();