// encodeURIComponent(string) returns a copy of the string with any special characters replaced by the required codes
// decodeURIComponent(string) returns a copy of the string with any encodings replaced by the special characters they encoded



var url = "/api/game_view/";
const urlParams = new URLSearchParams(window.location.search);
const gpUrl = urlParams.get('gp');
url = url + gpUrl;


//var gpId = paramObj(location.search);

var app = new Vue({
    el: '#app',
    data: {
        games: null,
        owner: "",
        opponent: "",
        ownerShips: [],
        numbers: ["", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
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

                // set player vs opponent info
                app.getPlayersInfo();

                //print owner's ships
                app.printShips();

                //print shots
                app.printSalvos();
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
        getPlayersInfo() {
            this.games.gamePlayers.forEach(gp => {
                if (gp.gpId == gpUrl) {
                    this.owner = gp.player.username
                } else {
                    this.opponent = gp.player.username
                }
            })
        },

        printShips() {
            this.games.ships.forEach(ship => {
                ship.shipLocation.forEach(shipLoc => {
                    this.ownerShips.push(shipLoc);
                    document.getElementById(shipLoc).classList.add('td_ship');
                })
            })
        },

        printSalvos() {
            //var salvoLoc;
            this.games.salvos.forEach(salvo => {
                salvo.salvoLocation.forEach(loc => {
                    if (salvo.username == this.owner) {
                        //salvoLoc = loc + '.salvo';
                        document.getElementById(loc + '.salvo').classList.add('td_salvo_shot');
                        document.getElementById(loc + '.salvo').innerText = salvo.turn;
                    } else {
                        if (this.ownerShips.includes(loc)) {
                            document.getElementById(loc).classList.add('td_ship_hit');
                            document.getElementById(loc).innerText = 'H'; //Hit
                        } else {
                            document.getElementById(loc).classList.add('td_ship_miss');
                            document.getElementById(loc).innerText = 'M'; //Miss
                        }
                    }
                })
            })
        },

        gamesHome() {
            location.href = "/web/games.html";
        },

        logout() {
            $.post("/api/logout").done(function() {
                console.log("logged out!");
                location.href = "/web/games.html";
            }).fail(function() {
                console.log("error")
            })
        },
    },

});

// AJAX Feed for help with developing

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