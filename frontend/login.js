const API_URL = "https://api-tlapiani-1.onrender.com/api/auth/login";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;
    const mensaje = document.getElementById("mensajeLogin");

    mensaje.textContent = "";

    if (!correo || !password) {
        mensaje.textContent = "Debes ingresar correo y contraseña";
        return;
    }

    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo,
            password
        })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
        mensaje.textContent = data.mensaje || "No se pudo iniciar sesión";
        return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    window.location.href = "dashboard.html";
});