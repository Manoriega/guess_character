import {
    HomeView,
    bindHomeEvents
}
from "./views/home.js";

import { LobbyView } from "./views/lobby.js";

import socket from "./clientSocket.js";

const app = document.getElementById("app");

export function navigate(view){
    console.log(view);
    
    switch(view.name) {
        case "home":
            app.innerHTML = HomeView();

            bindHomeEvents();
            break;
        
        case "lobby":
            app.innerHTML = LobbyView(view.pin);
            break;
    }
}

navigate({
    name: "home"
})