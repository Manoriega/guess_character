import { updatePlayers } from "/js/views/lobby.js";
import { navigate } from "/js/app.js";

const socket = io();

socket.on("connect", () => {
    console.log("Conectado al servidor:", socket.id);
})

socket.on("lobbyCreated", (data) => {
    navigate({
        name: "lobby",
        pin: data.pin,
        nickname: data.nickname,
        userType: data.userType
    })
})

socket.on("lobbyJoined", (data) => {
    navigate({
        name: "lobby",
        pin: data.pin,
        nickname: data.nickname,
        userType: data.userType
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

socket.on("registerCharacters", (data) => {
    console.log("Navigate to register characters", data.players);
    navigate({
        name: "characters",
        players: data.players,
        pin: data.pin,
        playerId: socket.id
    })
})

socket.on("roundStart", (data) => {
    const {assignment} = data;
    console.log("Navigate to round game");

    // Remove character from my list
    console.log(assignment);
    delete assignment[socket.id];
    console.log(assignment);
})

export default socket;