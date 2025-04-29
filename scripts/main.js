import { productos } from './productos.js';

document.addEventListener("DOMContentLoaded", () => {

    renderizarProductos();

    const productosContainer = document.getElementById("productos-container");

    productosContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-agregar")) {
            const id = parseInt(e.target.dataset.id);
            agregarAlCarrito(id);
        }
    });


    // Botón para abrir el modal
    const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
    if (btnAbrirCarrito) {
        btnAbrirCarrito.addEventListener("click", abrirModalCarrito);
    }

    // Mostrar el valor del slider de precio en tiempo real
    const inputPrecio = document.getElementById("filtro-precio");
    const precioValor = document.getElementById("precio-valor");
    const fitroBusqueda = document.getElementById("filtro-busqueda");
    const ordenarPor = document.getElementById("ordenar-por");

    inputPrecio.addEventListener("input", () => {
        precioValor.textContent = `$${inputPrecio.value}`;
    });

    //Botón aplicar filtros
    document.getElementById("btn-aplicar-filtros").addEventListener("click", () => {
        renderizarProductos();
    });

    // Botón limpiar filtros
    document.getElementById("btn-limpiar-filtros").addEventListener("click", () => {
        document.getElementById("filtro-categoria").value = "todas";
        inputPrecio.value = 200000;
        precioValor.textContent = "$200000";
        fitroBusqueda.value = "";
        ordenarPor.value = "default"
        renderizarProductos();
    });

});


function cargarSeccion(seccion) {
    fetch(`./src/sections/${seccion}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('contenido-principal').innerHTML = html;

            if (seccion === "productos") {
                cargarProductos(); // Si es productos, llama tu función de renderizado
            }
            if (seccion === "inicio") {
                mostrarProductosDestacados(); // Si es inicio, muestra destacados
            }
        })
        .catch(error => console.error('Error al cargar la sección:', error));
}


let carrito = [];

function renderizarProductos() {
    const contenedor = document.getElementById("productos-container");
    contenedor.innerHTML = "";

    const categoriaSeleccionada = document.getElementById("filtro-categoria").value;
    const precioMaximo = parseInt(document.getElementById("filtro-precio").value);
    const textoBusqueda = document.getElementById("filtro-busqueda").value.toLowerCase();
    const ordenSeleccionado = document.getElementById("ordenar-por").value;

    const productosFiltrados = productos.filter(p => {
        const coincideCategoria = categoriaSeleccionada === "todas" || p.categoria === categoriaSeleccionada;
        const coincidePrecio = p.precio <= precioMaximo;
        const coincideBusqueda = p.nombre.toLowerCase().includes(textoBusqueda) || p.descripcion.toLowerCase().includes(textoBusqueda);
        return coincideCategoria && coincidePrecio && coincideBusqueda;
    });

    switch (ordenSeleccionado) {
        case "precio-asc":
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case "precio-desc":
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
        case "nombre-asc":
            productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case "nombre-desc":
            productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
            break;
    }

    productosFiltrados.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" />
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p><strong>Precio:</strong> $${producto.precio}</p>
        <p><strong>Stock:</strong> ${producto.stock}</p>
        <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);
    })
}

/*
function mostrarProductosDestacados() {
    const contenedor = document.getElementById("productos-destacados");
    const productosDestacados = productos.slice(0, 4); // Ejemplo: mostrar solo 4 productos

    productosDestacados.forEach(producto => {
        const card = document.createElement("div");
        card.className = "producto-card";

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-descripcion">${producto.descripcion}</p>
            <p class="producto-precio">$${producto.precio}</p>
        `;

        contenedor.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", mostrarProductosDestacados);
*/


/*************************** CARRITO ************************/
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const existente = carrito.find(item => item.id === id);

    if (producto.stock <= 0) {
        alert("¡Sin stock disponible!");
        return;
    }

    if (existente) {
        if (existente.cantidad < producto.stock) {
            existente.cantidad++;
        } else {
            alert("No hay más stock disponible.");
            return;
        }
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
    mostrarNotificacion(`Se agregó ${producto.nombre} al carrito`, "agregado");
}

function eliminarDelCarrito(id) {
    const index = carrito.findIndex(item => item.id === id);
    if (index !== -1) {
        carrito.splice(index, 1);
        actualizarCarrito();
        mostrarNotificacion("Producto eliminado del carrito", "eliminado");
    }
}


function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
    document.getElementById("carrito-detalle").classList.add("oculto");
    mostrarNotificacion(`Carrito vaciado`, "vaciado");
}


function actualizarCarrito() {
    const lista = document.getElementById("lista-carrito");
    const totalEl = document.getElementById("total");
    const countEl = document.getElementById("cart-count");

    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío.</p>`;
        totalEl.textContent = "0";
        countEl.textContent = "0";
        return;
    }

    carrito.forEach(item => {
        total += item.precio * item.cantidad;

        const li = document.createElement("li");
        li.innerHTML = `
            <div class="carrito-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="carrito-detalle">
                    <p>${item.nombre}</p>
                    <small>Cantidad: ${item.cantidad}</small>
                </div>
                <p>$${item.precio * item.cantidad}</p>
                <button class="btn-eliminar" data-id="${item.id}">&times;</button>
            </div>
        `;

        lista.appendChild(li);
    });

    totalEl.textContent = total;
    countEl.textContent = carrito.reduce((acc, el) => acc + el.cantidad, 0);

    // Agregamos los eventos a los botones eliminar
    const botonesEliminar = document.querySelectorAll(".btn-eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            console.log("Eliminando producto con ID:", id);
            eliminarDelCarrito(id);
        });
    });
}

renderizarProductos();

const carritoDetalle = document.getElementById("carrito-detalle")

function abrirModalCarrito() {
    carritoDetalle.classList.remove("oculto", "ocultando");
    carritoDetalle.classList.add("mostrando");
    actualizarCarrito();
}

function cerrarModalCarrito() {
    carritoDetalle.classList.remove("mostrando");
    carritoDetalle.classList.add("ocultando");
    carritoDetalle.classList.add("oculto");

    //     // Esperar a que termine la animación (300ms) antes de ocultar
    //     setTimeout(() => {
    //         carritoDetalle.classList.add("oculto");
    //     }, 10);
}

// Cerrar al hacer clic fuera del modal
document.getElementById("modal-carrito").addEventListener("click", function (e) {
    if (e.target === this) {
        cerrarModalCarrito();
    }
});

// Botón para cerrar el modal
const btnCerrarCarrito = document.querySelector(".cerrar");
if (btnCerrarCarrito) {
    btnCerrarCarrito.addEventListener("click", cerrarModalCarrito);
}

window.agregarAlCarrito = agregarAlCarrito;
window.abrirModalCarrito = abrirModalCarrito;
window.cerrarModalCarrito = cerrarModalCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.actualizarCarrito = actualizarCarrito;


/*************************** NOTIFICACIONES ************************/

export function mostrarNotificacion(mensaje, tipo = "agregado") {
    const contenedor = document.getElementById("notificaciones");
    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);

    // Elegimos emoji según el tipo
    let emoji = "";
    switch (tipo) {
        case "agregado":
            emoji = "🛒"; break;
        case "eliminado":
            emoji = "❌"; break;
        case "vaciado":
            emoji = "🧹"; break;
        case "contacto":
            emoji = "📝"; break;
    }

    toast.textContent = `${emoji} ${mensaje}`;

    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // mismo tiempo que dura la animación
}
