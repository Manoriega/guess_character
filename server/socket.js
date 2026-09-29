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

        lobbies[pin] = new Lobby([new Player(data.nickname, socket.id)])        

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

}

module.exports = { registerSocketEvents };