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
            })
    },

    filters: {
        formatDate: function(date) {
            if (date) {
                return moment(String(date)).format('MM/DD/YYYY hh:mm:ss a')
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

        // handler for when user clicks add person
        addPlayer() {
            var form = document.querySelector('#addPlayer');
            $.post("/api/players", {
                firstName: this.firstName,
                lastName: this.lastName,
                username: this.username,
                password: this.password,
            }).done(function() {
                app.login(app.username, app.password)
            }).fail(function() {
                console.log("error")
            })
        },

        login(username, password) {
            var form = document.querySelector('#login');
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
        }
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