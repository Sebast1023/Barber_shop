// ===============================
// REGISTRO
// ===============================

const registerForm = document.querySelector("#registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const password = document.querySelector("#password").value;
        const confirmPassword = document.querySelector("#confirmPassword").value;

        // Comprobar que las contraseñas coincidan
        if (password !== confirmPassword) {

            alert("Las contraseñas no coinciden.");

            return;
        }

        // Simulación de creación de cuenta
        alert("¡Cuenta creada con éxito!");

        // Llevar al usuario al login
        window.location.href = "login.html";

    });

}
// ===============================
// INICIO DE SESIÓN
// ===============================

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        // Volver a la página principal
        window.location.href = "../index.html";

    });

}
// ===============================
// RECUPERAR CONTRASEÑA
// ===============================

const recoverForm = document.querySelector("#recoverForm");

if (recoverForm) {

    recoverForm.addEventListener("submit", (event) => {

        event.preventDefault();

        alert(
            "Si existe una cuenta asociada a este correo, " +
            "recibirás instrucciones para recuperar tu contraseña."
        );

        window.location.href = "login.html";

    });

}