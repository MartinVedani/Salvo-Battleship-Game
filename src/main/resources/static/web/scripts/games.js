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

        // handler for when user clicks add new player
        addPlayer() {
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

        login() {
            // var form = document.querySelector('#login'); // not needed with Vue
            $.post("/api/login", {
                username: this.username,
                password: this.password,
            }).done(function() {
                console.log("logged In!");
                location.reload();
            }).fail(function() {
                console.log("error")
            })
        },

        logout() {
            $.post("/api/logout").done(function() {
                console.log("logged out!");
                location.reload();
            }).fail(function() {
                console.log("error")
            })
        },

        // Identify game creators (owners) and opponents
        buildGameIdOwners() {

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
                    game.owner_gpID = this.games[i].gamePlayers[0].id;
                    game.ownerJoinDate = this.games[i].gamePlayers[0].joinDate;

                } else if (this.games[i].gamePlayers[0].id < this.games[i].gamePlayers[1].id) {

                    game.owner = this.games[i].gamePlayers[0].player.username;
                    game.owner_gpID = this.games[i].gamePlayers[0].id;
                    game.ownerJoinDate = this.games[i].gamePlayers[0].joinDate;

                    game.opponent = this.games[i].gamePlayers[1].player.username;
                    game.opponent_gpID = this.games[i].gamePlayers[1].id;
                    game.opponentJoinDate = this.games[i].gamePlayers[1].joinDate;

                } else {

                    game.owner = this.games[i].gamePlayers[1].player.username;
                    game.owner_gpID = this.games[i].gamePlayers[1].id;
                    game.ownerJoinDate = this.games[i].gamePlayers[1].joinDate;

                    game.opponent = this.games[i].gamePlayers[0].player.username;
                    game.opponent_gpID = this.games[i].gamePlayers[0].id;
                    game.opponentJoinDate = this.games[i].gamePlayers[0].joinDate;
                }

                this.gameIdOwners.push(game)
            }
        },


        joinGame(gameId) {
            var urlGpId;
            app.games.forEach(g => {
                g.gamePlayers.forEach(gp => {
                    if (g.id == gameId && gp.player.username == this.player) {
                        gp.id == urlGpId;
                    }
                })
            })
            location.href = "/web/game_view.html?gp=" + urlGpId;
        },

        newGame() {
            // ...
            location.href = "/web/game_view.html?gp=" + gamePlayerId;
        },

        reJoinGame(gamePlayerId) {
            //....
            location.href = "/web/game_view.html?gp=" + gamePlayerId;
        },

    }
});

// AJAX Feed for developing

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