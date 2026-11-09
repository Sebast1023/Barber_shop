// ===============================
// DATOS DE LA CITA
// ===============================
let appointment = {
    service: null,
    servicio_id: null,
    barber: null,
    barbero_id: null,
    date: null,
    time: null,
    price: 0
};

// ===============================
// ELEMENTOS DEL HTML ESTÁTICOS
// ===============================
const timeOptions = document.querySelectorAll(".time-options button");
const dateInput = document.querySelector(".date-input");
const summaries = document.querySelectorAll(".summary-item strong");
const serviceSummary = summaries[0];
const barberSummary = summaries[1];
const dateSummary = summaries[2];
const timeSummary = summaries[3];
const totalSummary = document.querySelector(".summary-total strong");
const confirmButton = document.querySelector(".confirm-button");

const servicesContainer = document.querySelector(".service-options");
const barbersContainer = document.querySelector(".barber-options");

// ===============================
// 1. CARGAR SERVICIOS DESDE DJANGO
// ===============================
async function cargarServicios() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/servicios/');
        const servicios = await response.json();
        servicesContainer.innerHTML = ''; 
        
        servicios.forEach(servicio => {
            const precioFormat = parseInt(servicio.precio).toLocaleString("es-CO");
            const btn = document.createElement('button');
            btn.className = 'service-option';
            btn.innerHTML = `
                <div>
                    <h3>${servicio.nombre}</h3>
                    <p>${servicio.descripcion || '1 hora'}</p>
                </div>
                <strong>$${precioFormat}</strong>
            `;
            
            btn.addEventListener("click", () => {
                document.querySelectorAll(".service-option").forEach(item => item.classList.remove("selected"));
                btn.classList.add("selected");
                
                appointment.service = servicio.nombre;
                // Respaldo por si Django lo llama 'id' o 'id_servicio'
                appointment.servicio_id = servicio.id_servicio || servicio.id; 
                appointment.price = parseInt(servicio.precio);
                
                serviceSummary.textContent = servicio.nombre;
                totalSummary.textContent = `$${appointment.price.toLocaleString("es-CO")}`;
            });
            servicesContainer.appendChild(btn);
        });
    } catch (error) {
        console.error("Error cargando servicios:", error);
    }
}

// ===============================
// 2. CARGAR BARBEROS DESDE DJANGO
// ===============================
async function cargarBarberos() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/barberos/');
        const barberos = await response.json();
        barbersContainer.innerHTML = ''; 
        
        barberos.forEach(barbero => {
            const iniciales = barbero.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
            const btn = document.createElement('button');
            btn.className = 'barber-option';
            btn.innerHTML = `
                <div class="barber-avatar">${iniciales}</div>
                <div>
                    <h3>${barbero.nombre}</h3>
                    <p>${barbero.experiencia || 'Barbero profesional'}</p>
                </div>
            `;
            
            btn.addEventListener("click", () => {
                document.querySelectorAll(".barber-option").forEach(item => item.classList.remove("selected"));
                btn.classList.add("selected");
                
                appointment.barber = barbero.nombre;
                appointment.barbero_id = barbero.id_barbero || barbero.id;
                barberSummary.textContent = barbero.nombre;
            });
            barbersContainer.appendChild(btn);
        });
    } catch (error) {
        console.error("Error cargando barberos:", error);
    }
}

// Inicializar funciones
document.addEventListener("DOMContentLoaded", () => {
    cargarServicios();
    cargarBarberos();
});

// ===============================
// SELECCIONAR FECHA (CÓDIGO ORIGINAL)
// ===============================
dateInput.addEventListener("change", () => {
    appointment.date = dateInput.value;
    if (appointment.date) {
        const date = new Date(appointment.date + "T00:00:00");
        const formattedDate = date.toLocaleDateString("es-CO", {day: "2-digit", month: "2-digit", year: "numeric"});
        dateSummary.textContent = formattedDate;
    }
});

// ===============================
// SELECCIONAR HORA (CÓDIGO ORIGINAL)
// ===============================
timeOptions.forEach(option => {
    option.addEventListener("click", () => {
        timeOptions.forEach(item => { item.classList.remove("selected"); });
        option.classList.add("selected");
        appointment.time = option.textContent;
        timeSummary.textContent = appointment.time;
    });
});

// ===============================
// CONFIRMAR CITA (HACIA LA BD)
// ===============================
confirmButton.addEventListener("click", async () => {
    // 1. Validar que todo esté lleno
    if (!appointment.servicio_id || !appointment.barbero_id || !appointment.date || !appointment.time) {
        alert("Por favor selecciona el servicio, barbero, fecha y horario.");
        console.log("Estado actual de la cita (faltan datos):", appointment); 
        return;
    }

    // 2. Extraer el número entero de la hora (ej. "14:00" -> 14)
    const horaEntera = parseInt(appointment.time.split(":")[0]);

    // 3. Preparar el JSON para Django
    const clienteId = localStorage.getItem("cliente_id");
    
    if (!clienteId) {
        alert("Debes iniciar sesión para agendar una cita.");
        window.location.href = "login.html";
        return;
    }

    const datosCita = {
        fecha: appointment.date,
        hora_inicio: horaEntera,
        servicio: appointment.servicio_id,
        barbero: appointment.barbero_id,
        cliente: parseInt(clienteId), // <- Toma el ID real del usuario logueado
        estado: 'PENDIENTE'
    };

    // 4. Enviar a PostgreSQL vía Django
    try {
        const response = await fetch('http://127.0.0.1:8000/api/citas/crear/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCita)
        });

        if (response.ok) {
            alert(`¡Cita confirmada con éxito!\nTe esperamos el ${appointment.date} a las ${appointment.time}.`);
            window.location.href = "../index.html"; 
        } else {
            const errores = await response.json();
            console.error("Errores desde Django:", errores);
            alert("Por favor selecciona el servicio, barbero, fecha y horario.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Hubo un error de conexión con el servidor.");
    }
});