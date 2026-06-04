const API_URL = "https://api-tlapiani-1.onrender.com/api";
const token = localStorage.getItem("token");
const dispositivoSeleccionado = localStorage.getItem("dispositivoSeleccionado");

const dispositivoActual = document.getElementById("dispositivoActual");
const mensajeDashboard = document.getElementById("mensajeDashboard");

const valorFlow = document.getElementById("valorFlow");
const valorTds = document.getElementById("valorTds");
const valorFecha = document.getElementById("valorFecha");

const estadoAgua = document.getElementById("estadoAgua");
const descripcionEstado = document.getElementById("descripcionEstado");

if (!dispositivoSeleccionado) {
    dispositivoActual.textContent = "Sin dispositivo seleccionado";
    mensajeDashboard.textContent = "Selecciona un dispositivo desde Mis dispositivos para consultar sus mediciones.";
} else {
    dispositivoActual.textContent = dispositivoSeleccionado;
    mensajeDashboard.textContent = "Mostrando las mediciones más recientes de este dispositivo.";
    cargarResumenDispositivo();
}

async function cargarResumenDispositivo() {
    try {
        const response = await fetch(`${API_URL}/data?device_id=${dispositivoSeleccionado}`, {
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`
    }
});

        const data = await response.json();

        if (!response.ok) {
            mensajeDashboard.textContent = data.mensaje || "No se pudieron cargar las mediciones.";
            return;
        }

        

        if (medicionesDispositivo.length === 0) {
            valorFlow.textContent = "--";
            valorTds.textContent = "--";
            valorFecha.textContent = "--";
            estadoAgua.textContent = "Sin mediciones";
            descripcionEstado.textContent = "Este dispositivo aún no tiene mediciones registradas.";
            return;
        }

        const ultimaMedicion = medicionesDispositivo[0];

        valorFlow.textContent = `${ultimaMedicion.flow ?? "--"} L/min`;
        valorTds.textContent = `${ultimaMedicion.tds ?? "--"} ppm`;

        const fecha = new Date(ultimaMedicion.timestamp);
        valorFecha.textContent = fecha.toLocaleString("es-MX");

        evaluarEstadoAgua(ultimaMedicion);

    } catch (error) {
        mensajeDashboard.textContent = "Error de conexión con el servidor.";
    }
}

function evaluarEstadoAgua(medicion) {
    const tds = Number(medicion.tds);

    if (tds <= 500) {
        estadoAgua.textContent = "Normal";
        descripcionEstado.textContent = "Los valores registrados se encuentran dentro de un rango aceptable.";
    } else if (tds <= 1000) {
        estadoAgua.textContent = "Alerta";
        descripcionEstado.textContent = "El nivel de sólidos disueltos es elevado. Se recomienda revisar el agua.";
    } else {
        estadoAgua.textContent = "Riesgo";
        descripcionEstado.textContent = "El nivel de sólidos disueltos es alto. Se recomienda evitar su consumo directo.";
    }
}