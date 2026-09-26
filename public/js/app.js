import {
    HomeView,
    bindHomeEvents
}
from "./views/home.js";

import { LobbyView, setPlayerType } from "./views/lobby.js";

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

            setPlayerType(view.userType);
            break;
    }
}

navigate({
    name: "home"
})