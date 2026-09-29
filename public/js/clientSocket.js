import { updatePlayers } from "/js/views/lobby.js";
import { navigate } from "/js/app.js";

const socket = io();

var MyUser = null;

socket.on("connect", () => {
    console.log("Conectado al servidor:", socket.id);
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