export function LobbyView(pin) {
    return `
        <div>
            <h2>Lobby</h2>

            <h3>PIN ${pin}</h3>

            <ul id="players"></ul>
        </div>
    `;
}

export function updatePlayers(players) {
    const playersList = document.getElementById("players");

    if (!playersList) return;

    playersList.innerHTML = "";

    players.forEach(player => {
        const li = document.createElement("li");

        li.textContent = player.nickname;

        playersList.appendChild(li);
    })
}