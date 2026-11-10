document.addEventListener("DOMContentLoaded", () => {
    verificarSesionNavbar();
    cargarPerfil();
});

// ===============================
// 1. ACTUALIZAR EL NAVBAR (Cerrar sesión)
// ===============================
function verificarSesionNavbar() {
    const navButtons = document.querySelector(".nav-buttons");
    if (!navButtons) return;

    const clienteId = localStorage.getItem("cliente_id");
    const clienteNombre = localStorage.getItem("cliente_nombre");

    if (clienteId) {
        const nombreCorto = clienteNombre ? clienteNombre.split(" ")[0] : "Perfil";

        navButtons.innerHTML = `
            <span style="color: #ccc; margin-right: 20px; font-size: 14px;">Hola, ${nombreCorto}</span>
            <button id="btn-logout" class="btn-secondary" style="margin-right: 15px; cursor: pointer; background: transparent;">Cerrar sesión</button>
        `;

        document.getElementById("btn-logout").addEventListener("click", () => {
            localStorage.removeItem("cliente_id");
            localStorage.removeItem("cliente_nombre");
            window.location.href = "../index.html"; 
        });
    }
}

// ===============================
// 2. CARGAR LOS DATOS DESDE POSTGRESQL
// ===============================
async function cargarPerfil() {
    const clienteId = localStorage.getItem("cliente_id");

    if (!clienteId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/perfil/${clienteId}/`);
        
        if (response.ok) {
            const perfil = await response.json();

            // --- A. LLENAR DATOS PERSONALES ---
            // Buscamos los 3 <strong> dentro de .profile-info (Nombre, Correo, Teléfono)
            const datosPersonales = document.querySelectorAll(".profile-info .info-item strong");
            
            if (datosPersonales.length >= 3) {
                datosPersonales[0].textContent = perfil.nombre;
                datosPersonales[1].textContent = perfil.correo;
                datosPersonales[2].textContent = perfil.telefono;
            }

            // --- B. LLENAR PRÓXIMA CITA ---
            // Tu HTML tiene dos .profile-card, la segunda (índice 1) es la de la cita
            const tarjetas = document.querySelectorAll(".profile-card");
            
            if (tarjetas.length >= 2) {
                const seccionCita = tarjetas[1];
                const tarjetaInterna = seccionCita.querySelector(".appointment-card");
                const etiquetaEstado = seccionCita.querySelector(".status");

                if (perfil.proxima_cita) {
                    // Darle formato a la fecha visualmente
                    const fechaObj = new Date(perfil.proxima_cita.fecha + "T00:00:00");
                    const dia = fechaObj.getDate().toString().padStart(2, '0');
                    const mes = fechaObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
                    const anio = fechaObj.getFullYear();

                    if (etiquetaEstado) etiquetaEstado.textContent = "PENDIENTE";

                    // Inyectar los datos reales sin romper tus estilos
                    tarjetaInterna.innerHTML = `
                        <div class="appointment-date">
                            <span>${mes}</span>
                            <strong>${dia}</strong>
                            <span>${anio}</span>
                        </div>
                        <div class="appointment-info">
                            <h3>${perfil.proxima_cita.servicio}</h3>
                            <p>✂️ ${perfil.proxima_cita.barbero}</p>
                            <span>🕐 ${perfil.proxima_cita.hora}</span>
                        </div>
                    `;
                } else {
                    // Si no tiene citas próximas, mostramos un mensaje sutil
                    if (etiquetaEstado) etiquetaEstado.style.display = "none";
                    tarjetaInterna.innerHTML = `
                        <div style="width: 100%; text-align: center; padding: 20px 0;">
                            <p style="color: #666;">No tienes citas próximas agendadas.</p>
                        </div>
                    `;
                }
            }
            // --- C. BOTÓN DE EDITAR TELÉFONO ---
            const btnEditar = document.querySelector(".edit-button");
            if (btnEditar) {
                // Removemos eventos previos para evitar duplicados si la página hace re-renders raros
                const nuevoBtn = btnEditar.cloneNode(true);
                btnEditar.replaceWith(nuevoBtn);
                
                nuevoBtn.addEventListener("click", async () => {
                    // Pedimos el nuevo teléfono mostrando el actual como sugerencia
                    const nuevoTelefono = prompt("Actualizar teléfono:", perfil.telefono);
                    
                    // Validamos que haya escrito algo y que sea diferente al actual
                    if (nuevoTelefono && nuevoTelefono.trim() !== "" && nuevoTelefono !== perfil.telefono) {
                        try {
                            const patchResponse = await fetch(`http://127.0.0.1:8000/api/perfil/actualizar/${clienteId}/`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ telefono: nuevoTelefono.trim() })
                            });
                            
                            if (patchResponse.ok) {
                                alert("¡Tu teléfono ha sido actualizado!");
                                window.location.reload(); // Recargamos para ver el cambio
                            } else {
                                alert("Hubo un error al actualizar el teléfono.");
                            }
                        } catch (error) {
                            console.error("Error actualizando perfil:", error);
                            alert("Error de conexión con el servidor.");
                        }
                    }
                });
            }
        } else {
            console.error("Error cargando los datos de la base de datos.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}