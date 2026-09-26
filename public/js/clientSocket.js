import { updatePlayers } from "/js/views/lobby.js";
import { navigate } from "/js/app.js";

const socket = io();

socket.on("connect", () => {
    console.log("Conectado al servidor:", socket.id);
})

socket.on("lobbyCreated", (data) => {
    navigate({
        name: "lobby",
        pin: data.pin
    })
})

socket.on("lobbyJoined", (data) => {
    navigate({
        name: "lobby",
        pin: data.pin
    })
});

socket.on("lobbyError", (data) => {
    window.alert(data.message);
    document.getElementById("pin").value = "";
})

socket.on("lobbyClosed", (data) => {
    window.alert("El host se desconectó");
    navigate({
        name: "home"        
    })
})

socket.on("playersUpdated", (data) => {
    console.log("Jugadores actualizados:", data.players);

    updatePlayers(data.players);
})

export default socket;