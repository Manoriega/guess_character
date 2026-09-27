import socket from "/js/clientSocket.js";

export function GameView(nickname) {
    return `
    <div class="container">
        <h1>Adivina el Personaje</h1>

        <h3 id="greetingMessage">Hola ${nickname}. Tu personaje ha sido asignado</h3>
        
        <ul id="gamePlayers"></ul>

    </div>
    `
}

export function bindGameEvents(roundInfo){
    const gamePlayersList = document.getElementById("gamePlayers");
    if (!gamePlayersList) return;
    gamePlayersList.innerHTML = "";

    for (var key in roundInfo) {
        const player = roundInfo[key];
        const li = document.createElement("li");

        li.textContent = `El jugador ${player.nickname} es ${player.character}`;

        gamePlayersList.appendChild(li);
    }

}