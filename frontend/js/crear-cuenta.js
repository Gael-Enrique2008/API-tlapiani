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

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!correoRegex.test(correo)) {
            mensaje.textContent = "Ingresa una dirección de correo válida.";
            return;
    }

    if (password.length < 8) {
    mensaje.textContent = "La contraseña debe tener al menos 8 caracteres.";
    return;
    }

    if (!/[A-Z]/.test(password)) {
        mensaje.textContent = "La contraseña debe contener al menos una letra mayúscula.";
        return;
    }

    if (!/[a-z]/.test(password)) {
        mensaje.textContent = "La contraseña debe contener al menos una letra minúscula.";
        return;
    }

    if (!/[0-9]/.test(password)) {
        mensaje.textContent = "La contraseña debe contener al menos un número.";
        return;
    }

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