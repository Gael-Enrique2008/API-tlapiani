const API_URL = "https://api-tlapiani-1.onrender.com/api/data";

async function cargarDashboard() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        const ultima = datos[0];

        if (!ultima) {
            console.log("No hay mediciones");
            return;
        }

        document.getElementById("phValor").textContent =
            ultima.ph + " pH";

        document.getElementById("tdsValor").textContent =
            ultima.tds + " ppm";

        document.getElementById("turbidityValor").textContent =
            ultima.turbidity + " NTU";

        document.getElementById("temperatureValor").textContent =
            ultima.temperature + " °C";

        document.getElementById("flowValor").textContent =
            ultima.flow + " L/min";

        document.getElementById("phEstado").textContent = ultima.estado;
        document.getElementById("tdsEstado").textContent = ultima.estado;
        document.getElementById("turbidityEstado").textContent = ultima.estado;

    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

cargarDashboard();