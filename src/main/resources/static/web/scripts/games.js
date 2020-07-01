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
        timerId: setInterval(function () { location.reload(); }, 20000),
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
        formatDate: function (date) {
            if (date) {
                return moment(String(date)).format('DD-MMM hh:mm a')
            }
        }
    },

    methods: {

        collapseAll: function () {
            // Hide HTML object "login form" or "create new user" form
            $('.collapse').collapse('hide');
        },

        addPlayer(event) {
            // Create a new player with methods 1 and 2 using pure javascript and fetch instead of 
            // jquery $.post like in method 3 for login below.

            // Method 1 - using "event" and "formData" is the most efficient, less prone to errors than method 2 
            // for the body of fetch, but it takes more coding in the HTML forms (see and compare addPlayer vs. login forms)
            event.preventDefault();
            let formData = new FormData(event.target);

            fetch('/api/players', {
                method: 'POST',

                // Method 1 - continued
                body: formData,

                /* 
                Method 2, manual construction of the body using Vue data (without "event" and "formData")
                which is more prone to errors than method 1
    
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded'
                },
    
                body: 'firstName=' + this.firstName +'&lastName=' + this.lastName + '&username=' + this.username + '&password=' + this.password
                */
            })
                .then(json => {
                    console.log(json)
                    app.login()
                })
                .catch(error => error)
                .then(error => console.log(error))
        },

        login() {
            // Method 3 - jQuery using Vue data, the easiest to code
            // var form = document.querySelector('#login'); // not needed to get the html login form when using Vue data
            $.post("/api/login", {
                username: this.username,
                password: this.password,
            }).done(function () {
                console.log("Success, logging In now ... ");
                location.reload()
            }).fail(function () {
                console.log("error")
                alert("Something went wrong, try again!")
            })
        },

        logout() {
            // jQuery and fetch combined just for show
            if (this.player.username == "j.bauer@ctu.gov") {

                fetch("/api/logout").then(() => location.reload());

            } else {

                $.post("/api/logout").done(function () {
                    console.log("logged out!");
                    location.reload();
                }).fail(function () {
                    console.log("error")
                    alert("Something went wrong, try again!")
                })
            }
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
                    totalGames: 0,
                };
                this.games.forEach(g => {
                    g.gamePlayers.forEach(gp => {
                        if (gp.player.username == player.username & gp.gamePlayerScore == 1) {
                            player.won++;
                            player.totalGames++;
                        } else if (gp.player.username == player.username & gp.gamePlayerScore == 0) {
                            player.lost++;
                            player.totalGames++;
                        } else if (gp.player.username == player.username & gp.gamePlayerScore == 0.5) {
                            player.tied++;
                            player.totalGames++;
                        };
                        if (gp.player.username == player.username & gp.gamePlayerScore != "null") {
                            player.total = player.total + gp.gamePlayerScore;
                        };
                    })
                })

                this.scoreBoard.push(player);
            }

            function compareScores(a, b) {
                // TOTAL SCORE Descending (from high to low)
                // a BEFORE b
                if (a.total > b.total) {
                    return -1;
                    // a AFTER b
                } else if (a.total < b.total) {
                    return 1;
                    // the same
                } else if (a.total == b.total) {
                    // TOTAL GAMES order ascending (low to high, same points with less games goes higher)
                    if (a.totalGames < b.totalGames) {
                        return -1;
                        // a AFTER b
                    } else if (a.totalGames > b.totalGames) {
                        return 1;
                        // the same
                    } else {
                        return 0;
                    }
                }
            }

            this.scoreBoard = this.scoreBoard.sort(compareScores);

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

$(function () {

    // display text in the output area
    function showOutput(text) {
        $("#output").text(text);
    }

    // load and display JSON sent by server for /games

    function loadData() {
        $.get(url)
            .done(function (data) {
                showOutput(JSON.stringify(data, null, 2));
            })
            .fail(function (jqXHR, textStatus) {
                showOutput("Failed: " + textStatus);
            });
    }

    loadData();

});