const { UserType } = require("./models/userType");

const lobbies = {};

function generatePin() {
    let pin = Math.floor(100000 + Math.random() * 900000).toString();
        
    while (lobbies[pin]) {
        pin = Math.floor(100000 + Math.random() * 900000).toString();
    }

    return pin;
}

function areAllPlayersReady(players, characters) {
    var playerCount = Object.keys(players).length;
    var charactersCount = Object.keys(characters).length;
    return playerCount === charactersCount;
}

function removeDuplicates(characters) {
    let allCharacters = []
    for (key in characters) {
        characters[key].forEach(char => allCharacters.push(char))
    }

    var seen = {};
    return allCharacters.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function assignCharacters(players, characters) {
    let assignment = {}
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const randIndex = Math.floor(0 + Math.random() * characters.length);
        assignment[player.socketId] = {}
        assignment[player.socketId].character = characters[randIndex];
        assignment[player.socketId].nickname = player.nickname;
        characters.splice(randIndex, 1);
    }
    return assignment
}

function registerSocketEvents(io, socket){

    socket.on("createLobby", (data) => {        
        
        const pin = generatePin();

        lobbies[pin] = {
            players: [
                {
                    nickname: data.nickname,
                    socketId: socket.id
                }
            ]
        }

        socket.join(pin);
                
        
        socket.emit("lobbyCreated", {
            pin: pin,
            userType: UserType.HOST,
            nickname: data.nickname
        });

        io.to(pin).emit("playersUpdated", {
            players: lobbies[pin].players
        });
    });

    socket.on("joinLobby", (data) => {
        const {nickname, pin} = data        

        const lobby = lobbies[pin];

        if (!lobby)
        {
            socket.emit("lobbyError", {
                message: "El lobby no existe."
            });
            return;
        }

        const playerIndex = lobby.players.findIndex(
            player => player.nickname === nickname
        );            

        if (playerIndex !== -1)
        {
            socket.emit("lobbyError", {
                message: "Ya hay un jugador con ese nombre."
            })
            return;
        }
            

        lobby.players.push({
            nickname,
            socketId: socket.id
        });

        socket.join(pin);
        

        socket.emit("lobbyJoined", {
            pin,
            userType: UserType.CLIENT,
            nickname
        });

        io.to(pin).emit("playersUpdated", {
            players: lobby.players
        });
    });

    socket.on("disconnect", () => {        

        for (const pin in lobbies) {
            const lobby = lobbies[pin];

            const playerIndex = lobby.players.findIndex(
                player => player.socketId === socket.id
            );            

            if (playerIndex === -1)
                continue;
            
            if (playerIndex === 0){
                io.to(pin).emit("lobbyClosed");
                delete lobbies[pin];
                break;
            }

            lobby.players.splice(playerIndex, 1);
            io.to(pin).emit("playersUpdated", {
                players: lobby.players
            });

            if (lobby.players.length === 0)
            {
                delete lobbies[pin];
                                                
                return;
            }
            break;
        }
    });

    socket.on("gameStart", (data) => {
        const {pin} = data        

        const lobby = lobbies[pin];

        if (!lobby)
        {
            socket.emit("lobbyError", {
                message: "El lobby no existe."
            });
            return;
        }

        io.to(pin).emit("registerCharacters", {
            pin
        })
    })

    socket.on("playerIsReady", (data)=>{        
        const {pin, playerId, ready} = data;
        const lobby = lobbies[pin];

        if (!lobby.characters) {
            lobby.characters = {}
        }        

        if (ready) {            
            const {characters} = data;            
            lobby.characters[playerId] = characters;
        }
        else {            
            delete lobby.characters[playerId];
        }

        if (areAllPlayersReady(lobby.players, lobby.characters)) {
            const cleanCharacters = removeDuplicates(lobby.characters);
            const playerCount = Object.keys(lobby.players).length;
            if (cleanCharacters.length < playerCount) {
                io.to(pin).emit("lobbyError", {
                    message: "Hay demasiados personajes repetidos y no se completa para jugar"
                });
                return;
            }

            io.to(pin).emit("roundStart", {                               
                pin, 
                assignment: assignCharacters(lobby.players, cleanCharacters)
            })
        }
        
    });

    socket.on("leaveGame", ()=>{
        socket.disconnect(true);
    });

}

module.exports = { registerSocketEvents };