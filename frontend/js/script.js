// js/script.js

document.addEventListener("DOMContentLoaded", () => {
    verificarSesionIndex();
    cargarServiciosIndex();
    cargarBarberosIndex();
});

// ===============================
// 1. CARGAR SERVICIOS EN EL INICIO
// ===============================
async function cargarServiciosIndex() {
    // Seleccionamos el contenedor específico de la sección de servicios
    const contenedor = document.querySelector("#servicios .services-container");
    if (!contenedor) return;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/servicios/');
        const servicios = await response.json();
        
        // Limpiamos las tarjetas estáticas de prueba
        contenedor.innerHTML = ''; 

        servicios.forEach(servicio => {
            const precioFormat = parseInt(servicio.precio).toLocaleString("es-CO");
            
            const articulo = document.createElement("article");
            articulo.className = "service-card";
            articulo.innerHTML = `
                <h3>${servicio.nombre}</h3>
                <p>${servicio.descripcion || 'Servicio profesional de barbería a tu medida.'}</p>
                <span>$${precioFormat}</span>
            `;
            
            contenedor.appendChild(articulo);
        });
    } catch (error) {
        console.error("Error cargando los servicios en el inicio:", error);
    }
}

// ===============================
// 2. CARGAR BARBEROS EN EL INICIO
// ===============================
async function cargarBarberosIndex() {
    // Seleccionamos el contenedor específico de la sección de barberos
    const contenedor = document.querySelector("#barberos .services-container");
    if (!contenedor) return;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/barberos/');
        const barberos = await response.json();
        
        // Limpiamos las tarjetas estáticas de prueba
        contenedor.innerHTML = ''; 

        barberos.forEach(barbero => {
            const articulo = document.createElement("article");
            articulo.className = "service-card";
            
            // Si no hay descripción (porque la BD no lo exige), ponemos una por defecto
            articulo.innerHTML = `
                <h3>${barbero.nombre}</h3>
                <p>Especialista en cuidado masculino con excelente atención y cortes impecables.</p>
                <span>${barbero.experiencia || 'Barbero profesional'}</span>
            `;
            
            contenedor.appendChild(articulo);
        });
    } catch (error) {
        console.error("Error cargando los barberos en el inicio:", error);
    }
}

// ===============================
// 3. VERIFICAR SESIÓN EN EL INICIO
// ===============================
function verificarSesionIndex() {
    const navButtons = document.querySelector(".nav-buttons");
    if (!navButtons) return;

    // Leer los datos de la memoria del navegador
    const clienteId = localStorage.getItem("cliente_id");
    const clienteNombre = localStorage.getItem("cliente_nombre");

    if (clienteId) {
        // Extraemos solo el primer nombre para que el botón no quede tan largo
        const nombreCorto = clienteNombre ? clienteNombre.split(" ")[0] : "Perfil";

        // Reemplazamos los botones originales por los de usuario logueado
        navButtons.innerHTML = `
            <span style="color: #ccc; margin-right: 20px; font-size: 14px;">Hola, ${nombreCorto}</span>
            <a href="pages/perfil.html" class="btn-login">Mi perfil</a>
            <button id="btn-logout" class="btn-secondary" style="margin-right: 15px; cursor: pointer; background: transparent;">Cerrar sesión</button>
            <a href="pages/agendar.html" class="btn-primary">Agendar cita</a>
        `;

        // Lógica para cerrar sesión
        document.getElementById("btn-logout").addEventListener("click", () => {
            // Borramos los datos de la memoria
            localStorage.removeItem("cliente_id");
            localStorage.removeItem("cliente_nombre");
            
            // Recargamos la página para volver al estado normal
            window.location.reload();
        });
    }
}