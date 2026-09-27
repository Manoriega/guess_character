import { bindCharactersEvents, CharactersView } from "./views/characters.js";
import {
    HomeView,
    bindHomeEvents
}
from "./views/home.js";

import { LobbyView, bindLobbyEvents } from "./views/lobby.js";

const app = document.getElementById("app");

export function navigate(view){
    console.log(view);
    
    switch(view.name) {
        case "home":
            app.innerHTML = HomeView();

            bindHomeEvents();
            break;
        
        case "lobby":
            app.innerHTML = LobbyView(view.pin, view.nickname);

            bindLobbyEvents(view.userType, view.pin);
            break;
        
        case "characters":
            app.innerHTML = CharactersView();
            bindCharactersEvents(view.players, view.pin, view.playerId);
            break;
    }
}

navigate({
    name: "home"
})