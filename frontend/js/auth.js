const authToken = localStorage.getItem("token");
const usuarioActivo = localStorage.getItem("usuarioOCorreo");

if (!authToken) {
    window.location.href = "login.html";
}

const usuarioActivoElemento = document.getElementById("usuarioActivo");

if (usuarioActivoElemento) {
    usuarioActivoElemento.textContent = usuarioActivo || "Usuario";
}

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioOCorreo");
        localStorage.removeItem("dispositivoSeleccionado");

        window.location.href = "login.html";
    });
}