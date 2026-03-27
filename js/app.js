const contadorJugadores = document.getElementById("contadorJugadores");
const jugadores = [];

const nombreInput = document.getElementById("nombre");
const ladoSelect = document.getElementById("lado");
const btnAgregar = document.getElementById("btnAgregar");
const listaJugadores = document.getElementById("listaJugadores");
const btnSortear = document.getElementById("btnSortear");
const resultado = document.getElementById("resultado");
const btnLimpiar = document.getElementById("btnLimpiar");
const cantidadCanchasSelect = document.getElementById("cantidadCanchas");
const heroTitulo = document.getElementById("heroTitulo");
const heroResumen = document.getElementById("heroResumen");
const statJugadores = document.getElementById("statJugadores");
const statDrives = document.getElementById("statDrives");
const statReveses = document.getElementById("statReveses");
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalMensaje = document.getElementById("modalMensaje");
const modalAceptar = document.getElementById("modalAceptar");
const modalCancelar = document.getElementById("modalCancelar");
const toast = document.getElementById("toast");

btnAgregar.addEventListener("click", agregarJugador);
btnSortear.addEventListener("click", generarSorteo);
btnLimpiar.addEventListener("click", limpiarJugadores);

cargarJugadores();
cargarUltimoSorteo();

function mostrarConfirm(titulo, mensaje) {
    return new Promise((resolve) => {
        modalTitulo.textContent = titulo;
        modalMensaje.textContent = mensaje;

        modal.classList.add("activo");

        const limpiar = () => {
            modal.classList.remove("activo");
            modalAceptar.onclick = null;
            modalCancelar.onclick = null;
        };

        modalAceptar.onclick = () => {
            limpiar();
            resolve(true);
        };

        modalCancelar.onclick = () => {
            limpiar();
            resolve(false);
        };
    });
}

function mostrarAlerta(titulo, mensaje) {
    modalTitulo.textContent = titulo;
    modalMensaje.textContent = mensaje;

    modalCancelar.style.display = "none";
    modalAceptar.textContent = "OK";

    modal.classList.add("activo");

    modalAceptar.onclick = () => {
        modal.classList.remove("activo");
        modalCancelar.style.display = "block";
        modalAceptar.textContent = "Aceptar";
    };
}

let toastTimeout;

function mostrarToast(mensaje, tipo = "success") {
    if (!toast) return;

    toast.textContent = mensaje;
    toast.className = `toast ${tipo}`;

    clearTimeout(toastTimeout);

    requestAnimationFrame(() => {
        toast.classList.add("activo");
    });

    toastTimeout = setTimeout(() => {
        toast.classList.remove("activo");
    }, 2200);
}

function agregarJugador() {
    const nombre = nombreInput.value.trim();
    const lado = ladoSelect.value;

    if (!nombre) {
        mostrarAlerta("Atención", "Escribí un nombre");
        return;
    }

    jugadores.push({ nombre, lado });
    nombreInput.value = "";
    guardarJugadores();
    renderJugadores();
    mostrarToast("Jugador agregado 🎾", "success");
}

function actualizarDashboard() {
    const total = jugadores.length;
    const drives = jugadores.filter(j => j.lado === "drive").length;
    const reveses = jugadores.filter(j => j.lado === "reves").length;

    statJugadores.textContent = total;
    statDrives.textContent = drives;
    statReveses.textContent = reveses;

    if (total === 0) {
        heroTitulo.textContent = "Listo para sortear";
        heroResumen.textContent = "Cargá jugadores, elegí canchas y generá el sorteo.";
        return;
    }

    if (total < 4) {
        heroTitulo.textContent = "Faltan jugadores";
        heroResumen.textContent = "Todavía hay pocos jugadores para armar partidos completos.";
        return;
    }

    heroTitulo.textContent = "Todo listo";
    heroResumen.textContent = `Tenés ${total} jugadores cargados para generar el sorteo.`;

    if (total === 0) {
        heroTitulo.textContent = "Listo para sortear";
        heroResumen.textContent = "Cargá jugadores, elegí canchas y generá el sorteo.";
        return;
    }

    if (total < 4) {
        heroTitulo.textContent = "Faltan jugadores";
        heroResumen.textContent = "Todavía hay pocos jugadores para armar partidos completos.";
        return;
    }

    if (drives === 0 || reveses === 0) {
        heroTitulo.textContent = "Lados incompletos";
        heroResumen.textContent = "Necesitás al menos un drive y un revés para formar parejas.";
        return;
    }

    heroTitulo.textContent = "Todo listo";
    heroResumen.textContent = `Tenés ${total} jugadores cargados para generar el sorteo.`;
}

function renderJugadores() {
    listaJugadores.innerHTML = "";

    contadorJugadores.textContent = `${jugadores.length} jugador${jugadores.length === 1 ? "" : "es"} cargado${jugadores.length === 1 ? "" : "s"}`;

    actualizarDashboard();

    if (jugadores.length === 0) {
        listaJugadores.innerHTML = `
      <li>
        <div class="subtexto">Todavía no cargaste jugadores</div>
      </li>
    `;
        return;
    }

    jugadores.forEach((jugador, index) => {
        const li = document.createElement("li");

        const claseTag = jugador.lado === "drive" ? "tag-drive" : "tag-reves";
        const textoLado = jugador.lado === "drive" ? "Drive" : "Revés";

        li.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <div>
          <strong style="font-size:16px;">${jugador.nombre}</strong>
          <div style="margin-top:6px;">
            <span class="tag ${claseTag}">${textoLado}</span>
          </div>
        </div>

        <button onclick="eliminarJugador(${index})" class="btn-eliminar">
        🗑️
        </button>
      </div>
    `;

        listaJugadores.appendChild(li);
    });
}

async function limpiarJugadores() {
    const confirmar = await mostrarConfirm(
        "Confirmar",
        "¿Querés borrar todos los jugadores?"
    );

    if (!confirmar) return;

    jugadores.length = 0;
    guardarJugadores();
    limpiarUltimoSorteo();
    renderJugadores();
    resultado.innerHTML = "";
    mostrarToast("Lista borrada", "info");
}

function guardarJugadores() {
    localStorage.setItem("jugadoresPadel", JSON.stringify(jugadores));
}

function cargarJugadores() {
    const guardados = localStorage.getItem("jugadoresPadel");

    if (guardados) {
        const datos = JSON.parse(guardados);
        jugadores.push(...datos);
        renderJugadores();
    }
}

function eliminarJugador(index) {
    jugadores.splice(index, 1);
    guardarJugadores();
    limpiarUltimoSorteo();
    renderJugadores();
    resultado.innerHTML = "";
    mostrarToast("Jugador eliminado", "info");
}

function guardarUltimoSorteo(html) {
    localStorage.setItem("ultimoSorteoPadel", html);
}

function cargarUltimoSorteo() {
    const ultimoSorteo = localStorage.getItem("ultimoSorteoPadel");

    if (ultimoSorteo) {
        resultado.innerHTML = ultimoSorteo;
    }
}

function limpiarUltimoSorteo() {
    localStorage.removeItem("ultimoSorteoPadel");
}

function mezclarArray(array) {
    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function generarSorteo() {
    const { parejas, sobrantes } = generarParejas();

    if (parejas.length < 2) {
        mostrarAlerta("Atención", "Se necesitan al menos 2 parejas para generar partidos");
        return;
    }

    const cantidadCanchas = Number(cantidadCanchasSelect.value);
    const { partidos, espera } = generarPartidos(parejas);

    const partidosEnCanchas = partidos.slice(0, cantidadCanchas);
    const partidosEnEspera = partidos.slice(cantidadCanchas);

    let html = `
    <h3>🎯 Resultado del sorteo</h3>
    <p class="subtexto">
      ${parejas.length} parejas generadas · ${partidos.length} partidos posibles · ${cantidadCanchas} cancha/s seleccionada/s
    </p>
  `;

    if (partidosEnCanchas.length > 0) {
        html += `<div class="resultado-seccion-titulo">🏟️ En cancha</div>`;

        partidosEnCanchas.forEach((p, index) => {
            html += `
        <div class="partido-card cancha">
          <div class="partido-header">
            <span class="partido-badge">Cancha ${index + 1}</span>
            <span class="partido-tipo">Partido activo</span>
          </div>

          <div class="pareja-linea">
            ${p.pareja1.jugador1} + ${p.pareja1.jugador2}
          </div>

          <div class="vs-box">
            <span class="vs-texto">VS</span>
          </div>

          <div class="pareja-linea">
            ${p.pareja2.jugador1} + ${p.pareja2.jugador2}
          </div>
        </div>
      `;
        });
    }

    if (partidosEnEspera.length > 0) {
        html += `<div class="resultado-seccion-titulo">⏳ Partidos en espera</div>`;

        partidosEnEspera.forEach((p, index) => {
            html += `
        <div class="partido-card espera">
          <div class="partido-header">
            <span class="partido-badge">Espera ${index + 1}</span>
            <span class="partido-tipo">Próximo partido</span>
          </div>

          <div class="pareja-linea">
            ${p.pareja1.jugador1} + ${p.pareja1.jugador2}
          </div>

          <div class="vs-box">
            <span class="vs-texto">VS</span>
          </div>

          <div class="pareja-linea">
            ${p.pareja2.jugador1} + ${p.pareja2.jugador2}
          </div>
        </div>
      `;
        });
    }

    if (espera.length > 0) {
        html += `<div class="resultado-seccion-titulo">🪑 Parejas en espera</div>`;
        html += `<div class="lista-resumen">`;

        espera.forEach((p, index) => {
            html += `
        <div class="item-suplementario resultado-espera">
          <strong>Pareja en espera ${index + 1}</strong><br>
          ${p.jugador1} + ${p.jugador2}
        </div>
      `;
        });

        html += `</div>`;
    }

    if (sobrantes.drives.length > 0 || sobrantes.reveses.length > 0) {
        html += `<div class="resultado-seccion-titulo">⚠️ Jugadores sin pareja</div>`;
        html += `<div class="lista-resumen">`;

        sobrantes.drives.forEach((j) => {
            html += `
        <div class="item-suplementario resultado-sin-pareja">
          ${j.nombre} <span class="subtexto">(Drive)</span>
        </div>
      `;
        });

        sobrantes.reveses.forEach((j) => {
            html += `
        <div class="item-suplementario resultado-sin-pareja">
          ${j.nombre} <span class="subtexto">(Revés)</span>
        </div>
      `;
        });

        html += `</div>`;
    }

    resultado.innerHTML = html;
    guardarUltimoSorteo(html);
    mostrarToast("Sorteo generado con éxito 🎉", "success");


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function generarParejas() {
    const drives = jugadores.filter(j => j.lado === "drive");
    const reveses = jugadores.filter(j => j.lado === "reves");

    const drivesMezclados = mezclarArray(drives);
    const revesesMezclados = mezclarArray(reveses);

    const cantidad = Math.min(drivesMezclados.length, revesesMezclados.length);

    const parejas = [];

    for (let i = 0; i < cantidad; i++) {
        parejas.push({
            jugador1: drivesMezclados[i].nombre,
            jugador2: revesesMezclados[i].nombre
        });
    }

    return {
        parejas,
        sobrantes: {
            drives: drivesMezclados.slice(cantidad),
            reveses: revesesMezclados.slice(cantidad)
        }
    };
}

function generarPartidos(parejas) {
    const mezcladas = mezclarArray(parejas);

    const partidos = [];
    const espera = [];

    for (let i = 0; i < mezcladas.length; i += 2) {
        if (mezcladas[i + 1]) {
            partidos.push({
                pareja1: mezcladas[i],
                pareja2: mezcladas[i + 1]
            });
        } else {
            espera.push(mezcladas[i]);
        }
    }

    return { partidos, espera };
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("./sw.js");
            console.log("Service Worker registrado");
        } catch (error) {
            console.error("Error al registrar el Service Worker:", error);
        }
    });
}

