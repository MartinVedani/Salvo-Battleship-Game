var url = "/api/games";

var app = new Vue({
    el: '#app',
    data: {
        games: [],
        scoreBoard: [],
        player: "Guest",
        firstName: null,
        lastName: null,
        username: null,
        password: null,
        gameIdOwners: [],
    },

    created() {
        fetch(url, {
                method: 'GET' //, // or 'PUT'
                    // headers: {
                    // 'X-API-Key': '#####',
                    //}
            }).then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(json => {
                this.games = json.games;
                this.player = json.player;

                //build scoreBoard
                app.buildScoreBoard();

                // Identify game creators (owners) and opponents
                app.buildGameIdOwners();
            })
    },

    filters: {
        formatDate: function(date) {
            if (date) {
                return moment(String(date)).format('DD-MMM hh:mm a')
            }
        }
    },

    methods: {

        /* jQuery method with $.post. It is EASIER but OLDER than fetch. 
        Fetch is also native of javascript and does not require us to load jQuery as an additional library.

        addPlayer() {
            // Create a new player and then log in
            // var form = document.querySelector('#addPlayer'); // not needed with Vue
            $.post("/api/players", {
                firstName: this.firstName,
                lastName: this.lastName,
                username: this.username,
                password: this.password,
            }).done(function() {
                console.log("Success, logging In now ... ");
                app.login()
            }).fail(function() {
                console.log("error")
            })
        },
        */

        addPlayer() { //metodo 1 con fetch en vez de jquery $.post
            const searchParams = new URLSearchParams();
            searchParams.set('firstName', this.firstName);
            searchParams.set('lastName', this.lastName);
            searchParams.set('username', this.username);
            searchParams.set('password', this.password);
            fetch('/api/players', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },

                    body: searchParams

                })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return Promise.reject(res.json())
                    }
                })
                .then(json => {
                    console.log(json)
                    app.login()
                })
                .catch(error => error)
                .then(error => console.log(error))
        },

        login() { //metodo 2 con fetch en vez de jquery $.post
            fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },

                    body: 'username=' + this.username + '&password=' + this.password
                        // "&param_name" is required for adding parameters

                })
                .then(function() {
                    console.log("logged In!");
                    location.reload();
                })
                .catch(error => error)
                .then(error => console.log(error))
        },

        logout() {
            $.post("/api/logout").done(function() {
                console.log("logged out!");
                location.reload();
            }).fail(function() {
                console.log("error")
            })
        },

        createGame() {
            // POST to create a new Game and new gamePlayer => "/api/games"
            fetch('/api/games', {
                    method: 'POST'
                })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return Promise.reject(res.json())
                    }
                })
                .then(json => {
                    console.log(json)
                    app.reJoinGame(json.gpId)
                })
                .catch(error => error)
                .then(error => console.log(error))
        },

        joinGame(gameId) {
            // POST to create a new gamePlayer for an existing gameId => "/api/games/{gameId}/players"
            fetch("/api/games/" + gameId + "/players", {
                    method: 'POST'
                })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return Promise.reject(res.json())
                    }
                })
                .then(json => {
                    console.log(json)
                    app.reJoinGame(json.gpId)
                })
                .catch(error => error)
                .then(error => console.log(error))
        },

        reJoinGame(gamePlayerId) {
            //Navigate to game page re-using an existing gamePlayerId => "/web/game_view.html?gp=gamePlayerId"
            location.href = "/web/game_view.html?gp=" + gamePlayerId;
        },

        buildScoreBoard() {
            /* var players_withScore = [];
            this.games.forEach(g => {
                g.gamePlayers.forEach(gp => {
                    players_withScore.push(gp.player.username);
                })
            }) */

            // lo mismo pero más refinado con flatMap y map
            var players_withScore = this.games.flatMap(g => g.gamePlayers.map(gp => gp.player.username));

            // use Sort to get an array of unique usernames for all players with score
            players_withScore = Array.from(new Set(players_withScore));

            for (i = 0; i < players_withScore.length; i++) {
                var player = {
                    username: players_withScore[i],
                    won: 0,
                    lost: 0,
                    tied: 0,
                    total: 0,
                };
                this.games.forEach(g => {
                    g.gamePlayers.forEach(gp => {
                        if (gp.player.username == player.username & gp.gamePlayerScore == 1) {
                            player.won++;
                        } else if (gp.player.username == player.username & gp.gamePlayerScore == 0) {
                            player.lost++;
                        } else if (gp.player.username == player.username & gp.gamePlayerScore == 0.5) {
                            player.tied++;
                        };
                        if (gp.player.username == player.username & gp.gamePlayerScore != "null") {
                            player.total = player.total + gp.gamePlayerScore;
                        };
                    })
                })

                this.scoreBoard.push(player);
            }
            this.scoreBoard.sort();
        },

        buildGameIdOwners() {
            // Identify and organize game creators (owners) and opponents
            for (i = 0; i < this.games.length; i++) {
                var game = {
                    id: this.games[i].id,
                    created: this.games[i].created,
                    owner: null,
                    owner_gpID: null,
                    ownerJoined: null,
                    opponent: null,
                    opponent_gpID: null,
                    opponentJoined: null,
                };

                if (this.games[i].gamePlayers[1] == null) {

                    game.owner = this.games[i].gamePlayers[0].player.username;
                    game.owner_gpID = this.games[i].gamePlayers[0].gpId;
                    game.ownerJoinDate = this.games[i].gamePlayers[0].joinDate;

                } else if (this.games[i].gamePlayers[0].gpId < this.games[i].gamePlayers[1].gpId) {

                    game.owner = this.games[i].gamePlayers[0].player.username;
                    game.owner_gpID = this.games[i].gamePlayers[0].gpId;
                    game.ownerJoinDate = this.games[i].gamePlayers[0].joinDate;

                    game.opponent = this.games[i].gamePlayers[1].player.username;
                    game.opponent_gpID = this.games[i].gamePlayers[1].gpId;
                    game.opponentJoinDate = this.games[i].gamePlayers[1].joinDate;

                } else {

                    game.owner = this.games[i].gamePlayers[1].player.username;
                    game.owner_gpID = this.games[i].gamePlayers[1].gpId;
                    game.ownerJoinDate = this.games[i].gamePlayers[1].joinDate;

                    game.opponent = this.games[i].gamePlayers[0].player.username;
                    game.opponent_gpID = this.games[i].gamePlayers[0].gpId;
                    game.opponentJoinDate = this.games[i].gamePlayers[0].joinDate;
                }

                this.gameIdOwners.push(game)
            }
        },

    }
});

// JSON Feed for help developing

$(function() {

    // display text in the output area
    function showOutput(text) {
        $("#output").text(text);
    }

    // load and display JSON sent by server for /games

    function loadData() {
        $.get(url)
            .done(function(data) {
                showOutput(JSON.stringify(data, null, 2));
            })
            .fail(function(jqXHR, textStatus) {
                showOutput("Failed: " + textStatus);
            });
    }

    loadData();

});