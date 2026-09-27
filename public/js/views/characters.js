import socket from "/js/clientSocket.js";

export function CharactersView() {
    return `
        <div class="container">
            <h2>Registra tus personajes</h2>
            <button id="addCharacter" type="button" class="btn btn-primary">Agregar Otro Personaje</button>

            <ul id="charactersList"></ul>
            <div class="d-flex justify-content-end">
                <button id="readyButton" type="button" class="btn btn-success">Listo</button>
                <button id="notReadyButton" type="button" class="btn btn-danger">No estoy listo</button>
            </div>
        </div>
    `
}

export function bindCharactersEvents(pin, playerId) {
    const charList = document.getElementById("charactersList");
    if (!charList) return;

    charList.innerHTML = "";
    
    for (let i = 0; i < 2; i++) {        
        
        const button = `<div class="form-group"><label for="character${i}">Personaje ${i + 1}</label><input type="text" class="form-control" name="character${i}" id="character${i}" placeholder="NombrePersonaje"/></div>`;
        const newElement = document.createElement("li");
        newElement.innerHTML = button;
        
        charList.appendChild(newElement);
    }
    
    const addCharacterButton = document.getElementById("addCharacter");

    addCharacterButton.addEventListener("click", () => {
        let charsCount = charList.getElementsByTagName("li").length
        const button = `<div class="form-group"><label for="character${charsCount}">Personaje ${charsCount + 1}</label><input type="text" class="form-control" name="character${charsCount}" id="character${charsCount}" placeholder="NombrePersonaje"/></div>`;
        const newElement = document.createElement("li");
        newElement.innerHTML = button
        
        charList.appendChild(newElement);
    })

    const readyButton = document.getElementById("readyButton");
    const notReadyButton = document.getElementById("notReadyButton");
    notReadyButton.style.visibility = "hidden";

    readyButton.addEventListener("click", () => {
        let charactersInputs = charList.getElementsByTagName("input");
        console.log(charactersInputs);

        for (let i = 0; i < charactersInputs.length; i++) {
            const character = charactersInputs[i];
            if (character.value == null || character.value == ""){
                window.alert("Falta escribir algún nombre de personaje");
                return;
            }            
        }
        
        let characterNames = []
        for (let i = 0; i < charactersInputs.length; i++) {
            const character = charactersInputs[i];            
            character.disabled = true;
            characterNames.push(character.value);
        }                        

        readyButton.style.visibility = "hidden";
        notReadyButton.style.visibility = "visible";
        addCharacterButton.disabled = true;

        socket.emit("playerIsReady", {
            playerId,
            ready: true,
            pin,
            characters: characterNames
        });
    })
    
    notReadyButton.addEventListener("click", () => {
        let charactersInputs = charList.getElementsByTagName("input");

        for (let i = 0; i < charactersInputs.length; i++) {
            const character = charactersInputs[i];            
            character.disabled = false;
        }                

        addCharacterButton.disabled = false;
        notReadyButton.style.visibility = "hidden";
        readyButton.style.visibility = "visible";

        socket.emit("playerIsReady", {
            playerId,
            ready: false,
            pin,
        });
    })
}
