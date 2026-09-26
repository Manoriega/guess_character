const lobbies = {};

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
            pin: pin
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

        lobby.players.push({
            nickname,
            socketId: socket.id
        });

        socket.join(pin);
        

        socket.emit("lobbyJoined", {
            pin
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

            const player = lobby[playerIndex];
            
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

    socket.on("submitNames", ()=>{

    });

    socket.on("guessed", ()=>{

    });

}

module.exports = { registerSocketEvents };