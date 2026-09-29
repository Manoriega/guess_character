import { navigate } from "/js/app.js";
import socket from "/js/clientSocket.js";

export function GameView(nickname, roundNumber) {
    return `
    <div class="container">
        <h1>Adivina el Personaje</h1>
        <h2>Ronda ${roundNumber}</h2>

        <h3 id="greetingMessage">Hola ${nickname}. Tu personaje ha sido asignado</h3>
        
        <ul id="gamePlayers"></ul>


        <button id="guessButton" type="button" class="btn btn-success">Adiviné</button>
        <button id="exitButton" type="button" class="btn btn-danger">Salir</button>

    </div>
    `
}


export function bindGameEvents(roundInfo, nickname, pin){
    const gamePlayersList = document.getElementById("gamePlayers");
    if (!gamePlayersList) return;
    gamePlayersList.innerHTML = "";

    document.getElementById("exitButton").addEventListener("click", () => {
        if (window.confirm("Estás seguro de querer salir?")) {
            socket.emit("leaveGame");
            navigate({
                name: "home",
                pin: roundInfo.pin,
                nickname
            })
        }
    })

    document.getElementById("guessButton").addEventListener("click", () => {
        if (window.confirm("¿Seguro que adivinaste tu personaje?")) {
            socket.emit("guess", {
                socketId: socket.id,
                pin
            });

            document.getElementById("guessButton").disabled = true;
        }
    })

    for (var key in roundInfo) {
        const player = roundInfo[key];
        const li = document.createElement("li");

        li.textContent = `El jugador ${player.nickname} es ${player.character}`;

        gamePlayersList.appendChild(li);
    }

}