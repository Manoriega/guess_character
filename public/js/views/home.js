import socket from "/js/clientSocket.js";

export function HomeView(nickname) {
    return `
    <div class="home">
        <h1>Adivina el Personaje</h1>

        <div class="form-group">
            <label for="nickname">Nickname</label>
            <input type="text"
                class="form-control" name="nickname" id="nickname" aria-describedby="helpNickname" placeholder="Nickname" value="${nickname || ""}" />
            <small id="helpNickname" class="form-text text-muted">Escribe tu nickname</small>
        </div>

        <button type="button" id="createLobby" class="btn btn-primary">Crear Lobby</button>
        
        <hr>
        
        <div class="form-group">
            <label for="pin">Lobby</label>
            <input type="text"
                class="form-control" name="pin" id="pin" aria-describedby="helpPIN" placeholder="PIN"/>
            <small id="helpPIN" class="form-text text-muted">Escribe el PIN</small>
        </div>

        <button type="button" id="joinLobby" class="btn btn-primary">Unirse</button>

    </div>
    `
}

export function bindHomeEvents(){

    document
        .getElementById("createLobby")
        .addEventListener("click", ()=>{

            const nickname =
                document.getElementById("nickname").value;

            if (nickname == "" || nickname == null){
                window.alert("Falta escribir tu nickname");
                return;
            }

            socket.emit("createLobby", {
                nickname
            });
        });

    document
        .getElementById("joinLobby")
        .addEventListener("click", () => {
            const nickname = document.getElementById("nickname").value;

            if (nickname == "" || nickname == null) {
                window.alert("Falta escribir tu nickname");
                return
            }

            const pin = document.getElementById("pin").value;

            if (pin == "" || pin == null) {
                window.alert("Falta escribir un PIN");
                return
            }

            socket.emit("joinLobby", {
                nickname,
                pin
            })
        })

}