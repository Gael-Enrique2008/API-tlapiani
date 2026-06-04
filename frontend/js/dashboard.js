const API_URL = "https://api-tlapiani-1.onrender.com/api/data";

const usuarioActivo = localStorage.getItem("usuarioOCorreo");
const usuarioActivoElemento = document.getElementById("usuarioActivo");
const btnLogout = document.getElementById("btnLogout");

if (usuarioActivoElemento) {
    usuarioActivoElemento.textContent = usuarioActivo || "Usuario";
}

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
          localStorage.removeItem("token");
        localStorage.removeItem("usuarioOCorreo");
        localStorage.removeItem("usuario");

        window.location.href = "login.html";
    });
}

async function cargarDashboard() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        const ultima = datos[0];

        if (!ultima) return;

        document.getElementById("phValor").textContent = ultima.ph + " pH";
        document.getElementById("tdsValor").textContent = ultima.tds + " ppm";
        document.getElementById("turbidityValor").textContent = ultima.turbidity + " NTU";
        document.getElementById("temperatureValor").textContent = ultima.temperature + " °C";
        document.getElementById("flowValor").textContent = ultima.flow + " L/min";

    } catch (error) {
        console.error(error);
    }
}

cargarDashboard();