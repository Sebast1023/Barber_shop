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
        
        // Buscamos el campo cédula. Si no existe aún en el HTML, generamos una aleatoria por ahora para que no falle PostgreSQL
        const cedulaInput = document.querySelector("#cedula");
        const cedula = cedulaInput ? cedulaInput.value : Math.floor(Math.random() * 1000000000).toString();

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
const loginForm = document.querySelector("#loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const correo = document.querySelector("#email").value;
        const contrasena = document.querySelector("#password").value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            if (response.ok) {
                const data = await response.json();
                // Guardar la sesión en la memoria del navegador
                localStorage.setItem("cliente_id", data.id_cliente);
                localStorage.setItem("cliente_nombre", data.nombre);
                
                alert(`¡Bienvenido de vuelta, ${data.nombre}!`);
                window.location.href = "../index.html";
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Correo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Hubo un error de conexión con el servidor.");
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