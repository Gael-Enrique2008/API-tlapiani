const API_URL = "https://api-tlapiani-1.onrender.com/api/auth/login";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const mensaje = document.getElementById("mensajeError");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const usuarioOCorreo = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value.trim();

        mensaje.textContent = "";

        if (!usuarioOCorreo || !password) {
            mensaje.textContent = "Por favor ingresa tu usuario o correo y contraseña.";
            return;
        }

        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuarioOCorreo,
                password
            })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = data.mensaje || "No se pudo iniciar sesión";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioOCorreo", usuarioOCorreo);

        window.location.href = "dispositivos.html";
    });
});