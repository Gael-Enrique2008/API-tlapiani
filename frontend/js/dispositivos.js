const API_URL = "https://api-tlapiani-1.onrender.com/api";

const token = localStorage.getItem("token");
const usuarioActivo = localStorage.getItem("usuarioOCorreo");

const usuarioActivoElemento = document.getElementById("usuarioActivo");
const btnLogout = document.getElementById("btnLogout");

const btnAgregar = document.getElementById("btnAgregarDispositivo");
const inputDevice = document.getElementById("deviceId");
const inputName = document.getElementById("deviceName");
const mensaje = document.getElementById("mensajeDispositivo");
const lista = document.getElementById("listaDispositivos");

if (!token) {
    window.location.href = "login.html";
}

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

async function cargarDispositivos() {
    try {
        lista.innerHTML = "<p>Cargando dispositivos...</p>";

        const response = await fetch(`${API_URL}/auth/devices`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            lista.innerHTML = `<p>${data.mensaje || "Error al cargar dispositivos."}</p>`;
            return;
        }

        mostrarDispositivos(data.dispositivos);

    } catch (error) {
        lista.innerHTML = "<p>Error de conexión con el servidor.</p>";
    }
}

function mostrarDispositivos(dispositivos) {
    if (!dispositivos || dispositivos.length === 0) {
        lista.innerHTML = "<p>Aún no hay dispositivos registrados.</p>";
        return;
    }

    lista.innerHTML = "";

    dispositivos.forEach((dispositivo) => {
        const card = document.createElement("div");
        card.className = "info-card mt-3";

        card.innerHTML = `
            <h4>${dispositivo.nombre}</h4>
            <p><strong>ID:</strong> ${dispositivo.device_id}</p>
            <button class="map-button">
                Entrar al dashboard
            </button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            localStorage.setItem("dispositivoSeleccionado", dispositivo.device_id);
            window.location.href = "dashboard.html";
        });

        lista.appendChild(card);
    });
}

btnAgregar.addEventListener("click", async () => {
    console.log("Click en agregar");

    const deviceId = inputDevice.value.trim();
    const deviceName = inputName.value.trim();

    console.log("Device ID:", deviceId);
    console.log("Token:", token);

    if (!deviceId) {
        mensaje.textContent = "Ingresa el ID del dispositivo.";
        return;
    }

    try {
        mensaje.textContent = "Registrando dispositivo...";

        const response = await fetch(`${API_URL}/auth/devices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                device_id: deviceId,
                nombre: deviceName || "Dispositivo Tlapiani"
            })
        });

        console.log("Status:", response.status);

        const data = await response.json();
        console.log("Respuesta:", data);

        if (!response.ok) {
            mensaje.textContent = data.mensaje || "No se pudo registrar el dispositivo.";
            return;
        }

        mensaje.textContent = "Dispositivo agregado correctamente.";

        inputDevice.value = "";
        inputName.value = "";

        cargarDispositivos();

    } catch (error) {
        console.error("Error fetch:", error);
        mensaje.textContent = "Error de conexión con el servidor.";
    }
});

/*btnAgregar.addEventListener("click", async () => {
    const deviceId = inputDevice.value.trim();
    const deviceName = inputName.value.trim();

    if (!deviceId) {
    mensaje.textContent = "Ingresa el ID del dispositivo.";
    return;
    }

    try {
        mensaje.textContent = "Registrando dispositivo...";

        const response = await fetch(`${API_URL}/auth/devices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                device_id: deviceId,
                nombre: deviceName || "Dispositivo Tlapiani"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            mensaje.textContent = data.mensaje || "No se pudo registrar el dispositivo.";
            return;
        }

        mensaje.textContent = "Dispositivo agregado correctamente.";

        inputDevice.value = "";
        inputName.value = "";

        cargarDispositivos();

    } catch (error) {
        mensaje.textContent = "Error de conexión con el servidor.";
    }
});/*

//cargarDispositivos();