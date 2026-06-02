const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
        e.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href = "login.html";
    });
}