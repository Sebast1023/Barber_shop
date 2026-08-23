// ===============================
// DATOS DE LA CITA
// ===============================

let appointment = {
    service: null,
    barber: null,
    date: null,
    time: null,
    price: 0
};


// ===============================
// ELEMENTOS DEL HTML
// ===============================

const serviceOptions = document.querySelectorAll(".service-option");
const barberOptions = document.querySelectorAll(".barber-option");
const timeOptions = document.querySelectorAll(".time-options button");

const dateInput = document.querySelector(".date-input");

const summaries = document.querySelectorAll(".summary-item strong");

const serviceSummary = summaries[0];
const barberSummary = summaries[1];
const dateSummary = summaries[2];
const timeSummary = summaries[3];

const totalSummary = document.querySelector(
    ".summary-total strong"
);

const confirmButton = document.querySelector(
    ".confirm-button"
);


// ===============================
// SELECCIONAR SERVICIO
// ===============================

serviceOptions.forEach(option => {

    option.addEventListener("click", () => {

        // Quitar selección anterior
        serviceOptions.forEach(item => {
            item.classList.remove("selected");
        });

        // Marcar seleccionado
        option.classList.add("selected");

        // Obtener información
        const name = option.querySelector("h3").textContent;
        const priceText = option.querySelector("strong").textContent;

        const price = Number(
            priceText.replace("$", "").replace(".", "")
        );

        appointment.service = name;
        appointment.price = price;

        // Actualizar resumen
        serviceSummary.textContent = name;
        totalSummary.textContent = `$${price.toLocaleString("es-CO")}`;

    });

});


// ===============================
// SELECCIONAR BARBERO
// ===============================

barberOptions.forEach(option => {

    option.addEventListener("click", () => {

        // Quitar selección anterior
        barberOptions.forEach(item => {
            item.classList.remove("selected");
        });

        // Marcar seleccionado
        option.classList.add("selected");

        const name = option.querySelector("h3").textContent;

        appointment.barber = name;

        // Actualizar resumen
        barberSummary.textContent = name;

    });

});


// ===============================
// SELECCIONAR FECHA
// ===============================

dateInput.addEventListener("change", () => {

    appointment.date = dateInput.value;

    if (appointment.date) {

        const date = new Date(
            appointment.date + "T00:00:00"
        );

        const formattedDate = date.toLocaleDateString(
            "es-CO",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

        dateSummary.textContent = formattedDate;
    }

});


// ===============================
// SELECCIONAR HORA
// ===============================

timeOptions.forEach(option => {

    option.addEventListener("click", () => {

        timeOptions.forEach(item => {
            item.classList.remove("selected");
        });

        option.classList.add("selected");

        appointment.time = option.textContent;

        timeSummary.textContent = appointment.time;

    });

});


// ===============================
// CONFIRMAR CITA
// ===============================

confirmButton.addEventListener("click", () => {

    if (
        !appointment.service ||
        !appointment.barber ||
        !appointment.date ||
        !appointment.time
    ) {

        alert(
            "Por favor selecciona el servicio, barbero, fecha y horario."
        );

        return;
    }


    alert(
        `¡Cita confirmada!\n\n` +
        `Servicio: ${appointment.service}\n` +
        `Barbero: ${appointment.barber}\n` +
        `Fecha: ${appointment.date}\n` +
        `Hora: ${appointment.time}\n` +
        `Total: $${appointment.price.toLocaleString("es-CO")}`
    );

});