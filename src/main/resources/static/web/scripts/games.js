var url = "/api/games";

var app = new Vue({
    el: '#app',
    data: {
        games: [],
        scoreBoard: [],
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
                this.games = json;

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
                    players_withScore.push(gp.player.userName);
                })
            }) */

            // lo mismo pero más refinado con flatMap y map
            var players_withScore = this.games.flatMap(g => g.gamePlayers.map(gp => gp.player.userName));

            // use Srt to get an array of unique userNames for all players with score
            players_withScore = Array.from(new Set(players_withScore));

            for (i = 0; i < players_withScore.length; i++) {
                var player = {
                    userName: players_withScore[i],
                    won: 0,
                    lost: 0,
                    tied: 0,
                    total: 0,
                };
                this.games.forEach(g => {
                    g.gamePlayers.forEach(gp => {
                        if (gp.player.userName == player.userName & gp.gamePlayerScore == 1) {
                            player.won++;
                        } else if (gp.player.userName == player.userName & gp.gamePlayerScore == 0) {
                            player.lost++;
                        } else if (gp.player.userName == player.userName & gp.gamePlayerScore == 0.5) {
                            player.tied++;
                        };
                        if (gp.player.userName == player.userName & gp.gamePlayerScore != "null") {
                            player.total = player.total + gp.gamePlayerScore;
                        };
                    })
                })

                this.scoreBoard.push(player);
            }
            this.scoreBoard.sort();
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