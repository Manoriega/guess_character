const { UserType } = require("./models/userType");
const { Lobby, Player } = require("./models/lobby");

const lobbies = {};
var CurrentRound = {};

function generatePin() {
    let pin = Math.floor(100000 + Math.random() * 900000).toString();
        
    while (lobbies[pin]) {
        pin = Math.floor(100000 + Math.random() * 900000).toString();
    }

    return pin;
}

function registerSocketEvents(io, socket){

    socket.on("createLobby", (data) => {        
        
        const pin = generatePin();

        const player = new Player(data.nickname, socket.id);

        player.playerId = data.playerId;
        player.connected = true;

        console.log(player)

        lobbies[pin] = new Lobby([player]);

        socket.join(pin);
                
        
        socket.emit("lobbyCreated", {
            pin: pin,
            playerId: data.playerId,
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

        const player = new Player(nickname, socket.id);

        player.playerId = data.playerId;
        player.connected = true;
            

        lobby.players.push(player);

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

            const player = lobby.players.find(
                p => p.socketId === socket.id
            );

            if (!player) {
                continue;
            }

            player.connected = false;
            player.socketId = null;

            console.log(
                `${player.nickname} perdió la conexión en ${pin}`
            );

            io.to(pin).emit("playersUpdated", {
                players: lobby.players
            });

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
            lobby.AddCharacters(playerId, characters);
        }
        else {            
            lobby.RemoveCharacters(playerId);
        }

        if (lobby.AreAllPlayersReady()) {

            var result = lobby.StartGame();

            if (result.message) {
                io.to(pin).emit("lobbyError", {
                    message: result.message,
                    players: lobby.players,
                    navigate: {
                        name: "lobby",
                        pin                        
                    }
                });
                return;
            }

            const round = lobby.GetRoundInfo(1);
            if (round.message) {
                io.to(pin).emit("lobbyError", {
                    message: round.message,
                    players: lobby.players,
                    navigate: {
                        name: "lobby",
                        pin                        
                    }
                });
                return;
            }
            CurrentRound = round

            io.to(pin).emit("roundStart", {                               
                pin, 
                roundInfo: round
            })
        }
        
    });    

    socket.on("guess", (data) => {
        const { pin, socketId } = data;
        CurrentRound.PlayerGuessed(socketId);

        if (CurrentRound.AreAllPlayersDone()) {
            const lobby = lobbies[pin];
            console.log("All players finished guessing. Let's go to next round");
            const round = lobby.GetRoundInfo(lobby.rounds.length + 1);
            if (round.message) {
                io.to(pin).emit("lobbyError", {
                    message: round.message,
                    players: lobby.players,
                    navigate: {
                        name: "lobby",
                        pin
                    }
                });
                return;
            }
            CurrentRound = round

            io.to(pin).emit("roundStart", {                               
                pin, 
                roundInfo: round
            })
        }
    })

    socket.on("leaveGame", ()=>{
        socket.disconnect(true);
    });

    socket.on("resumeSession", (data) => {
        const { playerId } = data;

        for (const pin in lobbies) {

            const lobby = lobbies[pin];

            const player = lobby.players.find(
                p => p.playerId === playerId
            );

            if (!player) {
                continue;
            }

            // Actualizar la conexión del jugador
            player.socketId = socket.id;
            player.connected = true;

            // Volver a unirlo a su room
            socket.join(pin);

            console.log(
                `${player.nickname} recuperó su sesión en ${pin}`
            );

            socket.emit("sessionResumed", {
                pin,
                nickname: player.nickname,
                playerId,
                userType: player.userType,
                players: lobby.players
            });

            io.to(pin).emit("playersUpdated", {
                players: lobby.players
            });

            return;
        }

        // No encontramos una sesión anterior
        socket.emit("sessionNotFound");
    });

}

module.exports = { registerSocketEvents };