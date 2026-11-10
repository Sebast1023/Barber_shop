document.addEventListener("DOMContentLoaded", () => {
    cargarMisCitas();
});

async function cargarMisCitas() {
    const clienteId = localStorage.getItem("cliente_id");
    
    // Si no hay sesión, al login
    if (!clienteId) {
        window.location.href = "login.html";
        return;
    }

    // Seleccionamos tus dos secciones exactas del HTML
    const seccionProximas = document.querySelector(".appointments-section:not(.history)");
    const seccionHistorial = document.querySelector(".appointments-section.history");

    if (!seccionProximas || !seccionHistorial) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/citas/cliente/${clienteId}/`);
        const citas = await response.json();

        // Extraemos los títulos y el botón de "+ Nueva cita" para no borrarlos
        const htmlEncabezadoProximas = seccionProximas.querySelector(".section-heading").outerHTML;
        const htmlEncabezadoHistorial = seccionHistorial.querySelector(".section-heading").outerHTML;

        // Vaciamos las secciones estáticas y volvemos a poner los encabezados
        seccionProximas.innerHTML = htmlEncabezadoProximas;
        seccionHistorial.innerHTML = htmlEncabezadoHistorial;

        let contadorProximas = 0;
        let contadorHistorial = 0;

        citas.forEach(cita => {
            const precioFormat = parseInt(cita.precio).toLocaleString("es-CO");
            
            // Separar la fecha (ej: 2026-08-25 -> 25 AGO 2026)
            const fechaObj = new Date(cita.fecha + "T00:00:00");
            const dia = fechaObj.getDate().toString().padStart(2, '0');
            const mes = fechaObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
            const anio = fechaObj.getFullYear();

            // Si la cita está PENDIENTE, va a la sección superior
            if (cita.estado === 'PENDIENTE') {
                contadorProximas++;
                const articulo = document.createElement("article");
                articulo.className = "appointment-item";
                
                articulo.innerHTML = `
                    <div class="appointment-calendar">
                        <span>${mes}</span>
                        <strong>${dia}</strong>
                        <span>${anio}</span>
                    </div>
                    <div class="appointment-details">
                        <div class="appointment-title">
                            <div>
                                <h3>${cita.servicio}</h3>
                                <span class="appointment-status">${cita.estado}</span>
                            </div>
                            <strong class="appointment-price">$${precioFormat}</strong>
                        </div>
                        <div class="appointment-data">
                            <span>✂️ ${cita.barbero}</span>
                            <span>🕐 ${cita.hora_inicio}</span>
                        </div>
                        <div class="appointment-actions">
                            <button class="cancel-button" onclick="prepararCancelacion(${cita.id_cita})">Cancelar cita</button>
                        </div>
                    </div>
                `;
                seccionProximas.appendChild(articulo);
            
            // Si está COMPLETADA o CANCELADA, va al Historial
            } else {
                contadorHistorial++;
                const articulo = document.createElement("article");
                articulo.className = "history-item";
                
                // Pintamos de verde si está completada, o de otro color si está cancelada
                const claseEstado = cita.estado === 'COMPLETADA' ? 'completed-status' : 'appointment-status'; 

                articulo.innerHTML = `
                    <div>
                        <h3>${cita.servicio}</h3>
                        <span>${cita.barbero}</span>
                    </div>
                    <div>
                        <span>${dia} ${mes} ${anio}</span>
                    </div>
                    <div>
                        <strong>$${precioFormat}</strong>
                        <span class="${claseEstado}">${cita.estado}</span>
                    </div>
                `;
                seccionHistorial.appendChild(articulo);
            }
        });

        // Mensajes por si alguna sección queda vacía
        if (contadorProximas === 0) {
            seccionProximas.innerHTML += "<p style='margin: 20px 0; color: #666;'>No tienes citas próximas agendadas.</p>";
        }
        if (contadorHistorial === 0) {
            seccionHistorial.innerHTML += "<p style='margin: 20px 0; color: #666;'>Aún no tienes un historial de citas.</p>";
        }

    } catch (error) {
        console.error("Error cargando el historial de citas:", error);
    }
}

async function prepararCancelacion(idCita) {
    // 1. Preguntamos para evitar clics por accidente
    const confirmar = confirm("¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.");
    
    if (!confirmar) return;

    // 2. Enviamos la petición a Django
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/citas/cancelar/${idCita}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert("Tu cita ha sido cancelada con éxito.");
            // Recargamos la lista automáticamente para que la tarjeta baje al Historial
            cargarMisCitas(); 
        } else {
            const errores = await response.json();
            alert("No se pudo cancelar la cita: " + (errores.error || "Error desconocido."));
        }
    } catch (error) {
        console.error("Error al cancelar la cita:", error);
        alert("Hubo un error de conexión con el servidor.");
    }
}