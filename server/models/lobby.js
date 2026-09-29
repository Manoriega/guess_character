class Player {
    constructor(nickname, socketId) {
        this.nickname = nickname;
        this.socketId = socketId;
    }
}

class RoundInfo {
    constructor(roundNum) {
        this.roundNum = roundNum;
        this.assignment = {}
        this.guesses = {}
    }

    AddPlayerInfo(socketId, character, nickname) {
        this.assignment[socketId] = {character, nickname};
        this.guesses[socketId] = false;
    }

    AreAllPlayersDone() {
        for (var key in this.guesses) {
            if (!this.guesses[key])
                return false;
        }
        
        return true;
    }

    PlayerGuessed(playerId) {
        this.guesses[playerId] = true;
    }
}

class Lobby {    
    constructor(players) {
        this.players = players;
        this.rounds = [];
    }

    AddCharacters(playerId, characters) {
        if (!this.characters)
            this.characters = {};
            
        this.characters[playerId] = characters;
    }

    RemoveCharacters(playerId) {
        delete this.characters[playerId];
    }

    AreAllPlayersReady() {
        var playerCount = Object.keys(this.players).length;
        var charactersCount = Object.keys(this.characters).length;
        return playerCount === charactersCount;
    }

    RemoveDuplicates() {
        let allCharacters = []
        for (var key in this.characters) {
            this.characters[key].forEach(char => allCharacters.push(char))
        }
    
        var seen = {};
        return allCharacters.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }    
    
    GetRoundInfo(roundNumber) {
        if (this.cleanCharacters.length < this.players.length){
            return {
                message: "Ya no hay suficientes personajes para jugar"
            };
        }

        let roundInfo = new RoundInfo(roundNumber);
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const randIndex = Math.floor(0 + Math.random() * this.cleanCharacters.length);
            roundInfo.AddPlayerInfo(player.socketId, this.cleanCharacters[randIndex], player.nickname);            
            this.cleanCharacters.splice(randIndex, 1);
        }
        this.rounds.push(roundInfo);
        return roundInfo
    }

    StartGame() {
        const cleanCharacters = this.RemoveDuplicates();
        const playerCount = Object.keys(this.players).length;
        if (cleanCharacters.length < playerCount) {
            return { message: "Hay demasiados personajes repetidos y no se completa para jugar" };
        }

        this.cleanCharacters = cleanCharacters
        return {done: 1};
    }

}

module.exports = {Lobby, Player}