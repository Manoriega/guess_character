import { updatePlayers } from "/js/views/lobby.js";
import { navigate } from "/js/app.js";
import { RegisterId, GetUserId } from "./cookies.js";

const socket = io();

var MyUser = null;

let playerId = GetUserId()

if (!playerId) {
    playerId = crypto.randomUUID();
    RegisterId(playerId)
}

socket.on("connect", () => {    
    console.log("Conectado al servidor:", socket.id);
    
    socket.emit("resumeSession", {
        playerId
    })
})

socket.on("lobbyCreated", (data) => {
    MyUser = {
        nickname: data.nickname,
        userType: data.userType
    }
    navigate({
        name: "lobby",
        pin: data.pin,
        nickname: data.nickname,
        userType: data.userType
    })
})

socket.on("lobbyJoined", (data) => {
    MyUser = {
        nickname: data.nickname,
        userType: data.userType
    }
    navigate({
        name: "lobby",
        pin: data.pin,
        nickname: data.nickname,
        userType: data.userType
    })
});

socket.on("sessionResumed", (data) => {
    MyUser = {
        nickname: data.nickname,
        userType: data.userType
    };

    console.log("Sesión recuperada:", data);

    navigate({
        name: "lobby",
        pin: data.pin,
        nickname: data.nickname,
        userType: data.userType
    });

    updatePlayers(data.players)
})

socket.on("sessionNotFound", () => {
    console.log("No existe una sesión anterior.");
});

socket.on("lobbyError", (data) => {
    window.alert(data.message);
    var pinInput = document.getElementById("pin");
    if (pinInput)
        document.getElementById("pin").value = "";

    if (data.navigate) {
        navigate({
            name: data.navigate.name,
            pin: data.navigate.pin,
            nickname: MyUser.nickname,
            userType: MyUser.userType
        })
        
        if (data.navigate.name == "lobby"){
            updatePlayers(data.players);

        }
    }
})

socket.on("lobbyClosed", () => {
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
        pin: data.pin,
        playerId: socket.id
    })
})

socket.on("roundStart", (data) => {
    const {pin, roundInfo} = data;
    console.log(roundInfo);
    const assignment = roundInfo.assignment;
    const nickname = assignment[socket.id].nickname;    

    // Remove my character from my list    
    delete assignment[socket.id];    

    navigate({
        name: "game",
        roundNumber: roundInfo.roundNum,
        pin,
        nickname,
        assignment
    });
})

export default socket;