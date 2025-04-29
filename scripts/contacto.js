import { mostrarNotificacion } from './main.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-contacto");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const nombre = form.nombre.value.trim();
            const email = form.email.value.trim();
            const mensaje = form.mensaje.value.trim();

            if (nombre && email && mensaje) {
                mostrarNotificacion("¡Gracias por su mensaje!", "contacto");
                form.reset();
            } else {
                mostrarNotificacion("Por favor, complete todos los campos.", "contacto");
            }
        });
    }
});

/*
function mostrarNotificacion(mensaje) {
    const noti = document.getElementById("notificaciones");
    if (!noti) return;

    noti.textContent = mensaje;
    noti.classList.remove("oculto");
    noti.classList.add("mostrar");

    setTimeout(() => {
        noti.classList.remove("mostrar");
        setTimeout(() => noti.classList.add("oculto"), 400); // Espera a que se oculte con animación
    }, 3000);
}
*/