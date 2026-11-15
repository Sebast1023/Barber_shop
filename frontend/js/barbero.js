document.addEventListener("DOMContentLoaded", () => {
    verificarSesionBarbero();
});

async function verificarSesionBarbero() {
    const barberoId = localStorage.getItem("barbero_id");
    const barberoNombre = localStorage.getItem("barbero_nombre");

    // Si alguien intenta entrar aquí sin iniciar sesión, ¡lo devolvemos al login!
    if (!barberoId) {
        window.location.href = "login.html";
        return;
    }

    // Actualizamos el Navbar con el nombre del barbero
    document.getElementById("nombre-barbero").textContent = "👨‍💈 Hola, " + barberoNombre.split(" ")[0];
    
    // Lógica para cerrar sesión
    document.getElementById("btn-logout-barbero").addEventListener("click", () => {
        localStorage.removeItem("barbero_id");
        localStorage.removeItem("barbero_nombre");
        window.location.href = "../index.html"; // Lo devolvemos a la página pública
    });

    cargarCitasBarbero(barberoId);
}

async function cargarCitasBarbero(barberoId) {
    const contenedor = document.getElementById("citas-barbero-list");
    if (!contenedor) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/citas/barbero/${barberoId}/`);
        const citas = await response.json();

        contenedor.innerHTML = "";

        if (citas.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#ccc; margin-top:20px; font-size: 18px;'>No tienes citas pendientes asignadas. ¡A descansar! ☕</p>";
            return;
        }

        citas.forEach(cita => {
            const precioFormat = parseInt(cita.precio).toLocaleString("es-CO");
            
            const fechaObj = new Date(cita.fecha + "T00:00:00");
            const dia = fechaObj.getDate().toString().padStart(2, '0');
            const mes = fechaObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
            
            const articulo = document.createElement("article");
            articulo.className = "appointment-item"; 
            articulo.innerHTML = `
                <div class="appointment-calendar">
                    <span>${mes}</span>
                    <strong>${dia}</strong>
                </div>
                <div class="appointment-details">
                    <div class="appointment-title">
                        <div>
                            <h3>${cita.servicio}</h3>
                            <span class="appointment-status">⏳ PENDIENTE</span>
                        </div>
                        <strong class="appointment-price">$${precioFormat}</strong>
                    </div>
                    <div class="appointment-data">
                        <span style="color: #cda45e;">👤 Cliente: <strong>${cita.cliente}</strong></span>
                        <span>🕐 Hora: <strong>${cita.hora_inicio}</strong></span>
                    </div>
                    <div class="appointment-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                        <button onclick="actualizarEstadoCita(${cita.id_cita}, 'ATENDIDA')" style="background-color: #28a745; color: white; border: none; padding: 10px 18px; font-weight: bold; border-radius: 5px; cursor: pointer;">
                            Atendida
                        </button>
                        <button onclick="actualizarEstadoCita(${cita.id_cita}, 'NO ASISTIO')" style="background-color: #dc3545; color: white; border: none; padding: 10px 18px; font-weight: bold; border-radius: 5px; cursor: pointer;">
                            No asistió
                        </button>
                    </div>
                </div>
            `;
            contenedor.appendChild(articulo);
        });
    } catch (error) {
        console.error("Error cargando agenda:", error);
        contenedor.innerHTML = "<p>Error de conexión con la base de datos.</p>";
    }
}

async function actualizarEstadoCita(idCita, nuevoEstado) {
    const mensaje = nuevoEstado === 'ATENDIDA'
        ? "¿Confirmas que el cliente ya fue atendido?"
        : "¿Confirmas que el cliente NO asistió a la cita?";

    if (!confirm(mensaje)) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/citas/completar/${idCita}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (response.ok) {
            alert(`Cita marcada como ${nuevoEstado}.`);
            cargarCitasBarbero(localStorage.getItem("barbero_id"));
        } else {
            const data = await response.json();
            alert("No se pudo actualizar: " + (data.error || "Error en el servidor."));
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
}