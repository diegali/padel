const jugadores = [];

const nombreInput = document.getElementById("nombre");
const ladoSelect = document.getElementById("lado");
const btnAgregar = document.getElementById("btnAgregar");
const listaJugadores = document.getElementById("listaJugadores");
const btnSortear = document.getElementById("btnSortear");
const resultado = document.getElementById("resultado");
const btnLimpiar = document.getElementById("btnLimpiar");
const cantidadCanchasSelect = document.getElementById("cantidadCanchas");

btnAgregar.addEventListener("click", agregarJugador);
btnSortear.addEventListener("click", generarSorteo);
btnLimpiar.addEventListener("click", limpiarJugadores);

cargarJugadores();

function agregarJugador() {
    const nombre = nombreInput.value.trim();
    const lado = ladoSelect.value;

    if (!nombre) {
        alert("Escribí un nombre");
        return;
    }

    jugadores.push({ nombre, lado });
    nombreInput.value = "";
    guardarJugadores();
    renderJugadores();
}

function renderJugadores() {
    listaJugadores.innerHTML = "";

    if (jugadores.length === 0) {
        listaJugadores.innerHTML = "<li>No hay jugadores cargados</li>";
        return;
    }

    jugadores.forEach((jugador, index) => {
        const li = document.createElement("li");

        const claseTag = jugador.lado === "drive" ? "tag-drive" : "tag-reves";
        const textoLado = jugador.lado === "drive" ? "Drive" : "Revés";

        li.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <div>
          <strong>${jugador.nombre}</strong>
          <span class="tag ${claseTag}">${textoLado}</span>
        </div>
        <button onclick="eliminarJugador(${index})" class="btn-eliminar">X</button>
      </div>
    `;

        listaJugadores.appendChild(li);
    });
}

function limpiarJugadores() {
    const confirmar = confirm("¿Querés borrar todos los jugadores?");

    if (!confirmar) return;

    jugadores.length = 0;
    guardarJugadores();
    renderJugadores();
    resultado.innerHTML = "";
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
    renderJugadores();
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
        alert("Se necesitan al menos 2 parejas para generar partidos");
        return;
    }

    const cantidadCanchas = Number(cantidadCanchasSelect.value);
    const { partidos, espera } = generarPartidos(parejas);

    const partidosEnCanchas = partidos.slice(0, cantidadCanchas);
    const partidosEnEspera = partidos.slice(cantidadCanchas);

    let html = "<h3>Partidos asignados</h3>";

    partidosEnCanchas.forEach((p, index) => {
        html += `
      <div class="resultado-bloque">
        <strong>Cancha ${index + 1}</strong><br>
        ${p.pareja1.jugador1} + ${p.pareja1.jugador2}
        <br>vs<br>
        ${p.pareja2.jugador1} + ${p.pareja2.jugador2}
      </div>
    `;
    });

    if (partidosEnEspera.length > 0) {
        html += "<h4>Partidos en espera</h4>";

        partidosEnEspera.forEach((p, index) => {
            html += `
        <div class="resultado-bloque">
          <strong>Espera ${index + 1}</strong><br>
          ${p.pareja1.jugador1} + ${p.pareja1.jugador2}
          <br>vs<br>
          ${p.pareja2.jugador1} + ${p.pareja2.jugador2}
        </div>
      `;
        });
    }

    if (espera.length > 0) {
        html += "<h4>Parejas en espera</h4>";
        espera.forEach(p => {
            html += `<div class="resultado-bloque">${p.jugador1} + ${p.jugador2}</div>`;
        });
    }

    if (sobrantes.drives.length > 0 || sobrantes.reveses.length > 0) {
        html += "<h4>Jugadores sin pareja</h4>";

        sobrantes.drives.forEach(j => {
            html += `<div class="resultado-bloque">${j.nombre} (Drive)</div>`;
        });

        sobrantes.reveses.forEach(j => {
            html += `<div class="resultado-bloque">${j.nombre} (Revés)</div>`;
        });
    }

    resultado.innerHTML = html;
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