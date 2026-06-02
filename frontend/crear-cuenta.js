const API_URL = "https://api-tlapiani-1.onrender.com/api/auth/register";

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const username = document.getElementById("username").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const mensaje = document.getElementById("mensajeRegistro");

    if (password !== confirmPassword) {
        mensaje.textContent = "Las contraseñas no coinciden";
        return;
    }

    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            apellido,
            username,
            correo,
            password,
            celular: "",
        })
    });

    const data = await respuesta.json();

    mensaje.textContent = data.mensaje;

    if (respuesta.ok) {
        window.location.href = "login.html";
    }
});