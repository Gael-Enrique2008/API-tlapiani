document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const mensaje = document.getElementById("mensajeError");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!usuario || !password) {

            mensaje.textContent =
                "Por favor ingresa tu usuario o correo y contraseña.";

            return;
        }

        mensaje.textContent = "";

        console.log({
            usuario,
            password
        });

        // Aquí después haremos el fetch al backend
    });

});