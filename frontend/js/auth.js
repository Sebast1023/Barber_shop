// ===============================
// REGISTRO
// ===============================
const registerForm = document.querySelector("#registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const nombre = document.querySelector("#name").value;
        const correo = document.querySelector("#email").value;
        const telefono = document.querySelector("#phone").value;
        const contrasena = document.querySelector("#password").value;
        const confirmPassword = document.querySelector("#confirmPassword").value;
        const cedula = document.querySelector("#cedula").value;


        if (contrasena !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const datosRegistro = { nombre, correo, telefono, contrasena, cedula };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/registro/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosRegistro)
            });

            if (response.ok) {
                alert("¡Cuenta creada con éxito! Revisa tu correo electrónico.");
                window.location.href = "login.html";
            } else {
                const errores = await response.json();
                console.error("Errores:", errores);
                alert("Error en el registro. Verifica los datos ingresados.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    });
}

// ===============================
// INICIO DE SESIÓN
// ===============================
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Ajusta los IDs si en tu HTML se llaman diferente ("email" y "password")
        const correo = document.getElementById("email").value;
        const contrasena = document.getElementById("password").value;

        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo: correo.trim(), contrasena: contrasena.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                // Separamos los caminos
                if (data.rol === 'CLIENTE') {
                    localStorage.setItem("cliente_id", data.id);
                    localStorage.setItem("cliente_nombre", data.nombre);
                    window.location.href = "../index.html"; 
                    
                } else if (data.rol === 'BARBERO') {
                    localStorage.setItem("barbero_id", data.id);
                    localStorage.setItem("barbero_nombre", data.nombre);
                    window.location.href = "panel-barbero.html"; 
                    
                } else {
                    alert("Error: Tu usuario no tiene un rol asignado válido.");
                }
            } else {
                alert("Error al iniciar sesión: " + (data.error || "Datos incorrectos"));
            }
        } catch (error) {
            console.error("Error en el login:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}

// ===============================
// RECUPERAR CONTRASEÑA (Pendiente de lógica backend)
// ===============================
const recoverForm = document.querySelector("#recoverForm");
if (recoverForm) {
    recoverForm.addEventListener("submit", (event) => {
        event.preventDefault();
        alert("Si existe una cuenta asociada a este correo, recibirás instrucciones para recuperar tu contraseña.");
        window.location.href = "login.html";
    });
}