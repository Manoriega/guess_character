import socket from "/js/clientSocket.js";

const UserType = {
    HOST: 1,
    CLIENT: 2
}

export function LobbyView(pin, nickname) {
    return `
        <div>
            <h2>Lobby</h2>

            <h3 id="greetingMessage">Hola ${nickname}</h3>
            <h4 id="pinMessage">PIN ${pin}</h4>

            <label>Jugadores</label>
            <ul id="players"></ul>

            <button id="startGame" type="button" class="btn btn-primary">Iniciar juego</button>

            <div id="clientMessage" class="container">
                <b>Esperando Host para iniciar el juego</b>
            </div>

        </div>
    `;
}

export function bindLobbyEvents(userType, pin) {
    const startBtn = document.getElementById("startGame");
    const clientMessage = document.getElementById("clientMessage");
    const playersList = document.getElementById("players");
    startBtn.style.visibility = "hidden";
    clientMessage.style.visibility = "hidden";
    if (userType === UserType.HOST) {
        console.log("Player is the host");
        startBtn.style.visibility = "visible";

        
        startBtn.addEventListener("click", () => {
            console.log("Player wants to start game")
            let playersCount = playersList.getElementsByTagName("li").length
            if (playersCount < 2){
                window.alert("Necesitas más jugadores para empezar.");
                return;
            }                
            
            socket.emit("gameStart", {
                pin
            });
        })
    }
    else {
        console.log("Player is client");
        clientMessage.style.visibility = "visible";
    }
}

export function updatePlayers(players) {
    const playersList = document.getElementById("players");

    if (!playersList) return;

    playersList.innerHTML = "";

    players.forEach(player => {
        const li = document.createElement("li");

        li.textContent = player.nickname;

        playersList.appendChild(li);
    })
}