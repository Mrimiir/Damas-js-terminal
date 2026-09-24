/*
Producto final: Juego De Damas Para Terminal
con Node.js
@Autor: Mrimiir
*/

//-----Librerias necesarias para leer la decicion del usuario
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });     //todo esto para poder recibir un dato del usuario ( para leer )

import { emitKeypressEvents } from 'node:readline'; // para leer la entrada de teclas como las flechas
emitKeypressEvents(input);

//-----Declaracion de constantes
const vacio = 0;
const ficha1 = 1;
const ficha2 = 2;
const reina1 = 3;
const reina2 = 4;
const fila = 9;
const columna = 9;
const abc = ["x","A","B","C","D","E","F","G","H"];
const dic = {A : 1, B:2, C:3,D:4,E:5,F:6,G:7,H:8};  //diccionario de letras a numeros
const MIN = 1;      // Primera casilla jugable
const MAX = 8;      // ultima casilla jugable
const Coronado_1 = MIN;     // ficha 1 corona llegando a la fila A
const Coronado_2 = MAX;     // ficha 2 corona llegando a la fila H
const obligar_captur = true;



//------Funcion de tablero puro----
function crear_tablero(){       //crea un tablero numerico para tener un entendimiento de las fichas y los espacios sin fichas
    const tablero = Array.from({ length: fila }, () => new Array(columna).fill(vacio));
    for (let i = 0; i < tablero.length; i++){
        for (let j = 0; j < tablero[i].length; j++){
            const limite = i > 0 && j > 0;
            tablero[i][j] = i === 0 || j === 0 ? i+j : vacio; // es la forma simplificada de un if= condicion ? opcion 1 : opcion 2      // === ó !== son estrictos a comparacion de == ó !=     //imprime las orillas del tablero para distinguir coordenadas
            const casilla_jugable = (i + j) % 2 !== 0;
            if(limite && casilla_jugable && i < 4){
                tablero[i][j] = ficha2;
            } 
            else if (limite && casilla_jugable && i > 5){
                tablero[i][j] = ficha1;
            }
        }
    }
    return tablero;
}


let tablero = crear_tablero();
let turno = ficha1;             //el turno inicia con las fichas blancas osea las ficha1
//imprimir_tablero(tablero);

//----- Funcion de limites del tablero
function dentro(f, c){      //es una funcion que coloca limites para que las fichas no salgan
    return f >= MIN && f <= MAX && c >= MIN && c <= MAX;      //f = filas y c = columnas
}

//----- Funcion de fichas del equipo
function es_de_equipo(valor, equipo) {        //fichas a utilizar dependiendo del equipo 
    return equipo === ficha1 ? (valor === ficha1 || valor === reina1) : (valor === ficha2 || valor === reina2);
}

//----- Funcion para saber si el movimiento es valido o no
function movimiento_valido(fila, colum){
    const ficha = tablero[fila][colum];
    if (ficha === vacio){
        return [];
    }

    const reina = ficha === reina1 || ficha === reina2;

    const direcciones =
    ficha === ficha1 ? [[-1, -1], [-1, 1]] :    // direcciones para ficha1 arriba,izquierda [-1,-1] / arriba,derecha [-1,1]
    ficha === ficha2 ? [[1, -1], [1, 1]] :      // direcciones para ficha2 abajo,izquierda [1,-1] / abajo,derecha [1,1]
    [[-1, -1], [-1, 1], [1, -1], [1, 1]];       // direcciones de las reinas pueden moverse de arriva a abajo

    const equipo_propio = (ficha === ficha1 || ficha === reina1) ? ficha1 : ficha2;
    const equipo_rival = equipo_propio === ficha1 ? ficha2 : ficha1;
    const movimientos = [];

     if (!reina){      // fichas normales: un paso, o captura saltando una casilla
        for (const [df, dc] of direcciones){        //df = direccion fila, dc = direccion columna
            const nf = fila + df;
            const nc = colum + dc;
            if (dentro(nf,nc) && tablero[nf][nc] === vacio){                //nf = fila nula, nc = columna nula / nula = vacia
                movimientos.push({fila: nf, colum: nc, captura: null });
            }
            if (dentro(nf,nc) && es_de_equipo(tablero[nf][nc], equipo_rival)){
                const sf = fila + df * 2, sc = colum + dc * 2;                      // sf = salto de fila, sc = salto de columna
                if (dentro(sf, sc) && tablero[sf][sc] === vacio) {
                    movimientos.push({ fila: sf, colum: sc, captura: { fila: nf, colum: nc } });
                }
            }
        }
    }
    else{      // reina: se desplaza toda la diagonal, no casilla por casilla
        for (const [df, dc] of direcciones){
            let nf = fila + df;
            let nc = colum + dc;

            while (dentro(nf, nc) && tablero[nf][nc] === vacio){      // avanza mientras encuentre casillas vacias
                movimientos.push({ fila: nf, colum: nc, captura: null });
                nf += df;
                nc += dc;
            }

            if (dentro(nf, nc) && es_de_equipo(tablero[nf][nc], equipo_rival)){      // se topo con una ficha rival
                const capturada = { fila: nf, colum: nc };
                let lf = nf + df;      // lf/lc = casillas de aterrizaje despues de la captura
                let lc = nc + dc;
                while (dentro(lf, lc) && tablero[lf][lc] === vacio){
                    movimientos.push({ fila: lf, colum: lc, captura: capturada });
                    lf += df;
                    lc += dc;
                }
            }
        }
    }
    return movimientos;
}

//----- Funcion de movimiento que comen
function capturas_disponibles(f, c){
    return movimiento_valido(f, c).filter(m => m.captura !== null);     // retorna los movimientos que den una captura
}

//----- Funcion fichas del equipo que pueden comer
function fichas_pueden_comer(equipo){
    const lista = [];
    for (let i = MIN; i <= MAX; i++){
        for (let j = MIN; j <= MAX; j++){
            if (es_de_equipo(tablero[i][j], equipo) && capturas_disponibles(i, j).length > 0){
                lista.push({fila: i, colum: j});
            }
        }
    }
    return lista;       //retorna la lista de fichas que pueden comer
}


//----- Funcion que permitira el movimiento de las fichas
function mover_fichas(origen, destino){
    const jugada = movimiento_valido(origen.fila, origen.colum).find(m => m.fila === destino.fila && m.colum === destino.colum);        //movimiento valido en tal posicion y verifica si las posiciones de destino son iguales 

    if (!jugada){
        return {ok:false, capturo: false, corono: false};
    }

    tablero[destino.fila][destino.colum] = tablero[origen.fila][origen.colum];      // intercambia posiciones
    tablero[origen.fila][origen.colum] = vacio;       //vacia la posicion original

    if (jugada.captura){
        tablero[jugada.captura.fila][jugada.captura.colum] = vacio;       //si la jugada es de captura la casilla capturada queda vacia
    }
    let corono = false;
    if (destino.fila === Coronado_1 && tablero[destino.fila][destino.colum] === ficha1) {    //si llega al final del tablero su ficha se convierte en reina de referencia de abajo hasta arriba
        tablero[destino.fila][destino.colum] = reina1; 
        corono = true;             
    }
    if (destino.fila === Coronado_2 && tablero[destino.fila][destino.colum] === ficha2) {    //si llega al inicio del tablero su ficha se convierte en reina de referencia de abajo hasta arriba
        tablero[destino.fila][destino.colum] = reina2;
        corono = true;
    }
    return {ok: true, capturo: jugada.captura !== null, corono };
}

//----- Funcion que determinara la cantidad de fichas del equipo
function hay_fichas(equipo){        //verifica si hay fichas del equipo
    for(let i = MIN; i <= MAX; i++){
        for (let j = MIN; j <= MAX; j++){
            if(es_de_equipo(tablero[i][j], equipo)){    //si las hay retorna verdadero
                return true;
            }
        }
    }
    return false;       // si no hay retorna falso
}

//----- Funcion de imprimir tablero
function imprimir_tablero(resaltar = null) {        //resaltar = {fila, colum} de la casilla que se quiere marcar (osea el destino seleccionado)
    const iconos = { 0: "·", 1: "●", 2: "\x1b[31m○", 3: "♛", 4: "\x1b[31m♕" };
    for (let i = 0; i < tablero.length; i++) {
        let fila = " ";
        for (let j = 0; j < tablero[i].length; j++) {
            if (i === 0  || j === 0){
                if(i !== 0 && j === 0){
                    fila += `${abc[i]} \x1b[0m`;
                }
                else{
                    fila += ` ${tablero[i][j]} \x1b[0m`;
                }
                
            }
            else{
                const _es_resultado =  resaltar && resaltar.fila === i && resaltar.colum === j;     // elemento de fila y columna a resaltar
                const bg = _es_resultado ? "\x1b[43m" : ((i + j) % 2 === 0 ? '\x1b[46m' : '\x1b[40m'); //bg = backgroud    \x1b = Esc  46m = cian  40m = negro  43m = amarillo (seleccionado)
                fila += `${bg} ${iconos[tablero[i][j]]} \x1b[0m`;
            }
        }
        console.log(fila);
    }
    console.log("");
}

//----- Funcion de conversion de coordenadas a texto ej. "C5"
function texto_coordenada(f, c){
    return `${abc[f]}${c}`;     // retorn el valor de la letra en el diccionario y la columna que ya es un numero
}

//----- Funcion que convierte el texto en coordendas
function pasear_coordenada(texto){
    // formato aceptado: "C5", "c5", "C,5" e incluso el 3,5 pero es mejor el de letra y numero mas semejante a un tablero normal
    if (!texto){
        return null;
    }
    const limpio = texto.trim().toUpperCase().replace(/[\s,;.-]/g, ""); //elimina acentos, comas y separadores, y pasa el texto a mayusculas / trim()elimina espacios en blanco y caracteres de terminacion de linea
    let f = null;
    let c = null;

    const letra_numero = limpio.match(/^([A-H])([1-8])$/);      //ej. C5, devuelve su coincidencia

    if (letra_numero){
        f = dic[letra_numero[1]];
        c = Number(letra_numero[2]);
    }
    else {
        const partes = texto.split(",").map(n => Number(n.trim())); //divide la cadena utilizando ","como eje

        if (partes.length !== 2 || partes.some(Number.isNaN)){      // si el tamaño de partes es diferente de 2 elementos devuelve null
            return null;
        }
        [f, c] = partes;    //partes se vuelve una coordenada
    }

    if (!dentro(f, c)){     // si la coordenada no existe dentro del tablero se retorna null
        return null;
    }
    return {fila: f, colum: c};
}

//----- Funcion para determinar el movimiento de la ficha (izquierda o derecha)
function elegir_mov(movimientos, titulo){        //titulo es el mensaje de contexto de la accion
    return new Promise((resolve) => {
        let indice = 0;

        function dibujar(){
            console.clear();
            imprimir_tablero(movimientos[indice]);       //resalta en el tablero la casillas seleccionada
            console.log(titulo);
            const es_captura = movimientos[indice].captura ? " (captura)" : "";
            console.log(`Opción ${indice + 1} de ${movimientos.length}${es_captura}`);
            console.log("(← izquierda . → derecha . Enter confirmar . Esc cancelar)\n");     //las flechas son las direcciones de movimiento enter confirma el movimiento y esc cancela la ficha elegida para elegir otra ficha
        }

        function limpiar(){     //borra las llamadas de entrada de teclas, para que no se acumulen 
            input.removeListener('Keypress', al_presionar);
            if (input.isTTY){
                input.setRawMode(false);
            }
        }

        function al_presionar(str, key){        //dependiendo de la tecla presionada realiza tal accion mover la direccion de la ficha, cancelar eleccion de ficha, confirmar direccion y cerrar el juego
            if (!key){
                return;
            }

            if (key.name === 'left'){
                indice = (indice - 1  + movimientos.length) % movimientos.length;
                dibujar();
            }
            else if (key.name === 'right'){
                indice = (indice + 1) % movimientos.length;
                dibujar();
            }
            else if (key.name === 'return'){
                limpiar();
                resolve(movimientos[indice]);
            }
            else if (key.name === 'escape'){
                limpiar();
                resolve(null);      // null = el jugador cancelo la seleccion de ficha
            }
            else if (key.ctrl && key.name === 'c'){     // Ctrl+c para salir del juego
                limpiar();
                rl.close();
                process.exit();
            }
        }

        if (input.isTTY){
            input.setRawMode(true);     //hace que cada tecla llege a terminal sin esperar enter y ni hacer eco
        }
        input.on('keypress', al_presionar);     // retorna la referencia del input osea la entrada de las teclas si presione Esc hace lo de al_presionar con esa key
        dibujar();
    })
}

//----- Funcion asincrona que obliga a seguir comiendo mientras la misma ficha tenga captura
async function cadena_captura(posicion, corono){
    let actual = posicion;

    while(!corono && capturas_disponibles(actual.fila, actual.colum).length > 0){
        const siguientes = capturas_disponibles(actual.fila, actual.colum);
        imprimir_tablero();
        const destino = await elegir_mov(siguientes, `¡Captura multiple! Estas obligado a seguir comiendo con la ficha en ${texto_coordenada(actual.fila, actual.colum)}`);     

        if (!destino){      //si el jugador cancela el movimiento de esa ficha, pero la captura es obligatoria, vuelve a preguntar las direcciones
            console.log("La captura es obligatoria, no pude ser cancelada.\n");
            continue;   // salta el resto y repite el ciclo
        }

        const resultado = mover_fichas(actual, destino);
        actual = destino;
        corono = resultado.corono;
    }
    console.clear();
    return actual;
}

//---- Funcion asincronada que determina el turno del jugador
async function turno_jugador(){     //funcion asincronada = async function
    console.log(`Turno: ${turno === ficha1 ? "Blancas (●)" : "Rojas (o)"}`);

    const obligadas = obligar_captur ? fichas_pueden_comer(turno) : [];

    if (obligadas.length > 0){
        console.log("Captura obligatoria. Fichas que pueden comer: ", obligadas.map(p => texto_coordenada(p.fila, p.colum)).join(" "));
    }

    const origen_texto = await rl.question("Elige tu ficha (Ej. C5): ");     //await espera que rl.question sea respondida
    const origen = pasear_coordenada(origen_texto);     //la respuesta se convierte en coordenadas
    if (!origen || !es_de_equipo(tablero[origen.fila][origen.colum], turno)){       //si todo da falso manda el siguiente mensaje a consola
        console.log("Casilla invalida o no es tu ficha. Intenta de nuevo.\n");
        return;
    }

    if (obligadas.length > 0 && capturas_disponibles(origen.fila, origen.colum).length === 0){
        console.log("Hay una captura disponible: debes mover una ficha que pueda comer.\n");
        return;
    }

    const movimientos = obligadas.length > 0 ? capturas_disponibles(origen.fila, origen.colum) : movimiento_valido(origen.fila, origen.colum);       //si hay captura obligatoria solo ofrece capturas
    if (movimientos.length === 0){
        console.log("Esa ficha no tiene movimientos disponibles.\n");
        return;
    }

    const destino = await elegir_mov(movimientos, `Ficha en ${texto_coordenada(origen.fila, origen.colum)}: elija su movimiento`);

    if (!destino){      // el jugador presiono Esc, se candela el turno sin mover nada
        console.log("Selección cancelada.\n");
        return;
    }

    const resultado = mover_fichas(origen, destino);
    if (!resultado.ok){
        console.log("Movimiento invalido. Intenta de nuevo.\n");
        return;
    }

    if (resultado.capturo){
        await cadena_captura(destino, resultado.corono);        // aqui se obliga a seguir comiendo
    }

    turno = turno === ficha1 ? ficha2 : ficha1;     //cambia de turno al finalizar el turno de las fichas blancas
    console.clear();
}

//----- Funcion que presenta ya la jugabilidad
async function jugar(){     //funcion que ya muestra las funcionalidades y deja jugar
    console.log("\n============ JUEGO DE DAMAS ============\n");
    console.log('Escribe las coordenadas como "fila,columna"\npor ejemplo: C5 (fila C, columna 5)\n');
    console.log("Elige con las flechas del teclado y confirma con Enter.\n");

    imprimir_tablero();

    while (hay_fichas(ficha1) && hay_fichas(ficha2)){
        await turno_jugador();
        imprimir_tablero();
    }

    console.log(hay_fichas(ficha1) ? "¡¡Ganaron las Blancas!!" : "¡¡Ganaron las Rojas!!");
    rl.close();
}


//funcion principal
async function main(){
    do{
        console.log("====== Menu de juego =====");
        console.log("[1]. Iniciar juego.");
        console.log("[2]. Salir.");

        const opc = await rl.question("Ingrese una opcion: ");
        switch(opc){
            case "1": 
                    console.clear();
                    jugar();
            break;
            case "2": console.log("Saliendo del juego...");
                        process.exit();
            break;
            default : console.log("opcion invalida.");
            break;
        }
    }while(true);
}
if (import.meta.main){
    main();
}

