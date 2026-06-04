const API_URL = "https://api-tlapiani-1.onrender.com/api";

const tokenHistorial = localStorage.getItem("token");
const dispositivoSeleccionado = localStorage.getItem("dispositivoSeleccionado");

const dispositivoActual = document.getElementById("dispositivoActual");
const mensajeHistorial = document.getElementById("mensajeHistorial");
const tablaHistorial = document.getElementById("tablaHistorial");

const totalRegistros = document.getElementById("totalRegistros");
const estadoFrecuente = document.getElementById("estadoFrecuente");
const totalAlertas = document.getElementById("totalAlertas");
const ultimaLectura = document.getElementById("ultimaLectura");

if (!dispositivoSeleccionado) {
    dispositivoActual.textContent = "Sin dispositivo";
    mensajeHistorial.textContent =
        "Selecciona un dispositivo desde Mis dispositivos.";

    tablaHistorial.innerHTML = `
        <tr>
            <td colspan="8">No hay dispositivo seleccionado.</td>
        </tr>
    `;
} else {
    dispositivoActual.textContent = dispositivoSeleccionado;
    cargarHistorial();
}

async function cargarHistorial() {
    try {
        mensajeHistorial.textContent = "Cargando mediciones...";

        const response = await fetch(
            `${API_URL}/data?device_id=${dispositivoSeleccionado}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${tokenHistorial}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            mensajeHistorial.textContent =
                data.mensaje || "No se pudo cargar el historial.";
            return;
        }

        if (!data || data.length === 0) {
            mensajeHistorial.textContent =
                "Este dispositivo aún no tiene mediciones registradas.";

            totalRegistros.textContent = "0";
            estadoFrecuente.textContent = "--";
            totalAlertas.textContent = "0";
            ultimaLectura.textContent = "--";

            tablaHistorial.innerHTML = `
                <tr>
                    <td colspan="8">Sin mediciones registradas.</td>
                </tr>
            `;
            return;
        }

        mensajeHistorial.textContent =
            `Se encontraron ${data.length} mediciones recientes.`;

        mostrarTarjetas(data);
        mostrarTabla(data);

    } catch (error) {
        console.error("ERROR HISTORIAL:", error);
        mensajeHistorial.textContent = "Error de conexión con el servidor.";
    }
}

function mostrarTarjetas(mediciones) {
    totalRegistros.textContent = mediciones.length;

    const alertas = mediciones.filter(m =>
        m.estado === "alerta" || m.estado === "riesgo"
    );

    totalAlertas.textContent = alertas.length;

    const estados = {};

    mediciones.forEach(m => {
        const estado = m.estado || "sin estado";
        estados[estado] = (estados[estado] || 0) + 1;
    });

    let frecuente = "--";
    let mayor = 0;

    Object.keys(estados).forEach(estado => {
        if (estados[estado] > mayor) {
            mayor = estados[estado];
            frecuente = estado;
        }
    });

    estadoFrecuente.textContent = frecuente;

    const ultima = mediciones[0];

    if (ultima.timestamp) {
        const fecha = new Date(ultima.timestamp);
        ultimaLectura.textContent = fecha.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit"
        });
    } else {
        ultimaLectura.textContent = "--";
    }
}

function mostrarTabla(mediciones) {
    tablaHistorial.innerHTML = "";

    mediciones.forEach((medicion) => {
        const fila = document.createElement("tr");

        let fechaTexto = "--";
        let horaTexto = "--";

        if (medicion.timestamp) {
            const fecha = new Date(medicion.timestamp);

            fechaTexto = fecha.toLocaleDateString("es-MX");
            horaTexto = fecha.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        const estado = medicion.estado || "Sin estado";

        let claseEstado = "status-normal";

        if (estado === "alerta") {
            claseEstado = "status-alert";
        }

        if (estado === "riesgo") {
            claseEstado = "status-risk";
        }

        fila.innerHTML = `
            <td>${fechaTexto}</td>
            <td>${horaTexto}</td>
            <td>${medicion.ph ?? "--"}</td>
            <td>${medicion.turbidity ?? "--"} NTU</td>
            <td>${medicion.tds ?? "--"} ppm</td>
            <td>${medicion.temperature ?? "--"} °C</td>
            <td>${medicion.flow ?? "--"} L/min</td>
            <td><span class="${claseEstado}">${estado}</span></td>
        `;

        tablaHistorial.appendChild(fila);
    });
}