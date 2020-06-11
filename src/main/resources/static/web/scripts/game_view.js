// encodeURIComponent(string) returns a copy of the string with any special characters replaced by the required codes
// decodeURIComponent(string) returns a copy of the string with any encodings replaced by the special characters they encoded

var url = "/api/game_view/";
const urlParams = new URLSearchParams(window.location.search);
const gpUrl = urlParams.get('gp');
url = url + gpUrl;

var app = new Vue({
    el: '#app',
    data: {
        games: null,
        owner: "",
        opponent: "",
        shots: [],

        // for widgetDETAIL()
        widgetInGrid: [],
        staticGrid: false,

        // for printSalvos()
        placedShips: [],

        //for placeShips()
        submarine: null,
        carrier: null,
        patrol: null,
        destroyer: null,
        battleship: null,

        numbers: ["", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],

        xDictionary: { 0: '1', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7', 7: '8', 8: '9', 9: '10' },
        yDictionary: { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J' },

        dictionaryGSX: { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9 },
        dictionaryGSY: { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9 },

        xDicSalvos: { 1: '0px', 2: '40px', 3: '80px', 4: '120px', 5: '160px', 6: '200px', 7: '240px', 8: '280px', 9: '320px', 10: '360px' },
        yDicSalvos: { 'A': '0px', 'B': '40px', 'C': '80px', 'D': '120px', 'E': '160px', 'F': '200px', 'G': '240px', 'H': '280px', 'I': '320px', 'J': '360px' },

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

                // if ship placed, get widget details from JSON for building the grid
                if (this.games.ships != 0) {
                    //app.printSalvos();
                    app.widgetsDETAILS();
                } else {
                    // create Grid Stack
                    app.createGridStack();
                }

                //print ALL salvos
                app.printSalvos();

                //Listen for shots
                app.listenForShots();

                //print shots on TEST GRID
                app.printSalvos_TEST_GRID();
            })
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

        printSalvos_TEST_GRID() {
            //build placedShips
            this.games.ships.forEach(ship => {
                ship.shipLocation.forEach(shipLoc => {
                    this.placedShips.push(shipLoc);
                    document.getElementById(shipLoc).classList.add('td_ship');
                })
            })

            this.games.salvos.forEach(salvo => {
                salvo.salvoLocation.forEach(loc => {
                    if (salvo.username != this.owner) {
                        if (this.placedShips.includes(loc)) {
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

        printSalvos() {
            //build placedShips
            this.games.ships.forEach(ship => {
                ship.shipLocation.forEach(shipLoc => {
                    this.placedShips.push(shipLoc);
                    document.getElementById(shipLoc).classList.add('td_ship');
                })
            })

            this.games.salvos.forEach(salvo => {
                salvo.salvoLocation.forEach(loc => {
                    if (salvo.username == this.owner) {

                        //YOUR SHOTS TABLE -> salvoLoc = loc + '.salvo';
                        document.getElementById(loc + '.salvo').classList.add('td_salvo_shot');
                        document.getElementById(loc + '.salvo').innerText = salvo.turn;

                    } else {

                        //YOUR SHIPS GRID 
                        if (this.placedShips.includes(loc)) {

                            // case salvo HIT

                            var varX = loc.slice(1);
                            var varY = loc[0];

                            var varXX = this.xDicSalvos[varX];
                            var varYY = this.yDicSalvos[varY];

                            //add div with "+="", do not override everything with just "=".
                            var content = '<div class="salvo_hit" style="top:' + varYY + '; left:' + varXX + '"><div/>';

                            document.getElementById("grid").innerHTML += content;


                        } else {
                            // case salvo MISS

                            var varX = loc.slice(1);
                            var varY = loc[0];

                            var varXX = this.xDicSalvos[varX];
                            var varYY = this.yDicSalvos[varY];

                            //add div with "+="", do not override everything with just "=".
                            var content = '<div class="salvo_miss" style="top:' + varYY + '; left:' + varXX + '"><div/>';

                            document.getElementById("grid").innerHTML += content;

                        }
                    }
                })
            })
        },

        listenForShots() {

            document.getElementById("salvos_grid").addEventListener('click', function(event) {

                // Don't follow the link
                event.preventDefault();

                var x = event.target['id'];
                x = x.substring(0, x.indexOf('.'));

                // Log the clicked element in the console
                if (app.shots.includes(x)) {

                    console.log('Remove' + x);
                    app.shots = app.shots.filter(function(ele) { return ele != x; });
                    document.getElementById(x + '.salvo').classList.remove('td_salvo');

                } else {

                    console.log('Planning shot:' + x);
                    app.shots.push(x);
                    document.getElementById(x + '.salvo').classList.add('td_salvo');
                }

                if (app.shots.length == 5) {
                    alert("Maximum number of shots taken, it time to FIRE AWAY (or take back planned shot) !!!");
                }

            });
        },

        shootSalvos(shots) {

            let url = "/api/games/players/" + gpUrl + "/salvos";
            let init = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(shots),
            };
            fetch(url, init)
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return Promise.reject(res.json())
                    }
                })
                .then(json => {
                    location.reload()
                })
                .catch(error => error)
                .then(error => console.log(error))
        },

        widgetsDETAILS() {
            //lock grid if 5 ships have been placed
            if (this.games.ships.length > 0) {
                this.staticGrid = true;
            }
            // patrol, submarine, destroyer, carrier, battleship    
            this.games.ships.forEach(ship => {
                switch (ship.type) {
                    case 'patrol':
                        //PATROL: 2x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = '<div><div id="patrol" class="grid-stack-item-content patrol' + (varY == ship.shipLocation[1][0] ? 'Horizontal' : 'Vertical') + '"></div><div/>';
                        var W = varY == ship.shipLocation[1][0] ? 2 : 1;
                        var H = varY == ship.shipLocation[1][0] ? 1 : 2;

                        var widget = {
                            gsX: this.dictionaryGSX[varX],
                            gsY: this.dictionaryGSY[varY],
                            div: content,
                            width: W,
                            height: H,
                        }

                        this.widgetInGrid.push(widget);
                        break;

                    case 'submarine':
                        //SUBMARINE: 3x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = '<div><div id="submarine" class="grid-stack-item-content submarine' + (varY == ship.shipLocation[1][0] ? 'Horizontal' : 'Vertical') + '"></div><div/>';
                        var W = varY == ship.shipLocation[1][0] ? 3 : 1;
                        var H = varY == ship.shipLocation[1][0] ? 1 : 3;

                        var widget = {
                            gsX: this.dictionaryGSX[varX],
                            gsY: this.dictionaryGSY[varY],
                            div: content,
                            width: W,
                            height: H,
                        }

                        this.widgetInGrid.push(widget);
                        break;

                    case 'destroyer':
                        //destroyer: 3x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = '<div><div id="destroyer" class="grid-stack-item-content destroyer' + (varY == ship.shipLocation[1][0] ? 'Horizontal' : 'Vertical') + '"></div><div/>';
                        var W = varY == ship.shipLocation[1][0] ? 3 : 1;
                        var H = varY == ship.shipLocation[1][0] ? 1 : 3;

                        var widget = {
                            gsX: this.dictionaryGSX[varX],
                            gsY: this.dictionaryGSY[varY],
                            div: content,
                            width: W,
                            height: H,
                        }

                        this.widgetInGrid.push(widget);
                        break;

                    case 'carrier':
                        //carrier: 4x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = '<div><div id="carrier" class="grid-stack-item-content carrier' + (varY == ship.shipLocation[1][0] ? 'Horizontal' : 'Vertical') + '"></div><div/>';
                        var W = varY == ship.shipLocation[1][0] ? 4 : 1;
                        var H = varY == ship.shipLocation[1][0] ? 1 : 4;

                        var widget = {
                            gsX: this.dictionaryGSX[varX],
                            gsY: this.dictionaryGSY[varY],
                            div: content,
                            width: W,
                            height: H,
                        }

                        this.widgetInGrid.push(widget);
                        break;

                    case 'battleship':
                        //battleship: 5x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = '<div><div id="battleship" class="grid-stack-item-content battleship' + (varY == ship.shipLocation[1][0] ? 'Horizontal' : 'Vertical') + '"></div><div/>';
                        var W = varY == ship.shipLocation[1][0] ? 5 : 1;
                        var H = varY == ship.shipLocation[1][0] ? 1 : 5;

                        var widget = {
                            gsX: this.dictionaryGSX[varX],
                            gsY: this.dictionaryGSY[varY],
                            div: content,
                            width: W,
                            height: H,
                        }

                        this.widgetInGrid.push(widget);
                        break;
                }
            })
            app.createGridStack();
        },


        placeShips() {
            // patrol, submarine, destroyer, carrier, battleship
            this.patrol = [];
            this.submarine = [];
            this.destroyer = [];
            this.carrier = [];
            this.battleship = [];

            // PATROL [2 cells]
            const patrol = document.querySelector("#patrol");
            const patrolX = parseInt(patrol.parentElement.dataset.gsX);
            const patrolY = parseInt(patrol.parentElement.dataset.gsY);

            if (patrol.classList.contains('patrolHorizontal')) {
                const patrolXX1 = this.yDictionary[patrolY] + this.xDictionary[patrolX];
                const patrolXX2 = this.yDictionary[patrolY] + this.xDictionary[patrolX + 1];

                this.patrol.push(patrolXX1, patrolXX2);

            } else {

                const patrolYY1 = this.yDictionary[patrolY] + this.xDictionary[patrolX];
                const patrolYY2 = this.yDictionary[patrolY + 1] + this.xDictionary[patrolX];

                this.patrol.push(patrolYY1, patrolYY2);
            }

            // SUBMARINE [3 cells]
            const submarine = document.querySelector("#submarine");
            const submarineX = parseInt(submarine.parentElement.dataset.gsX);
            const submarineY = parseInt(submarine.parentElement.dataset.gsY);

            if (submarine.classList.contains('submarineHorizontal')) {
                const submarineXX1 = this.yDictionary[submarineY] + this.xDictionary[submarineX];
                const submarineXX2 = this.yDictionary[submarineY] + this.xDictionary[submarineX + 1];
                const submarineXX3 = this.yDictionary[submarineY] + this.xDictionary[submarineX + 2];

                this.submarine.push(submarineXX1, submarineXX2, submarineXX3);

            } else {
                const submarineYY1 = this.yDictionary[submarineY] + this.xDictionary[submarineX];
                const submarineYY2 = this.yDictionary[submarineY + 1] + this.xDictionary[submarineX];
                const submarineYY3 = this.yDictionary[submarineY + 2] + this.xDictionary[submarineX];

                this.submarine.push(submarineYY1, submarineYY2, submarineYY3);
            }

            // DESTROYER [3 cells]
            const destroyer = document.querySelector("#destroyer");
            const destroyerX = parseInt(destroyer.parentElement.dataset.gsX);
            const destroyerY = parseInt(destroyer.parentElement.dataset.gsY);

            if (destroyer.classList.contains('destroyerHorizontal')) {
                const destroyerXX1 = this.yDictionary[destroyerY] + this.xDictionary[destroyerX];
                const destroyerXX2 = this.yDictionary[destroyerY] + this.xDictionary[destroyerX + 1];
                const destroyerXX3 = this.yDictionary[destroyerY] + this.xDictionary[destroyerX + 2];

                this.destroyer.push(destroyerXX1, destroyerXX2, destroyerXX3);

            } else {
                const destroyerYY1 = this.yDictionary[destroyerY] + this.xDictionary[destroyerX];
                const destroyerYY2 = this.yDictionary[destroyerY + 1] + this.xDictionary[destroyerX];
                const destroyerYY3 = this.yDictionary[destroyerY + 2] + this.xDictionary[destroyerX];

                this.destroyer.push(destroyerYY1, destroyerYY2, destroyerYY3);
            }

            // CARRIER [4 cells]
            const carrier = document.querySelector("#carrier");
            const carrierX = parseInt(carrier.parentElement.dataset.gsX);
            const carrierY = parseInt(carrier.parentElement.dataset.gsY);

            if (carrier.classList.contains('carrierHorizontal')) {
                const carrierXX1 = this.yDictionary[carrierY] + this.xDictionary[carrierX];
                const carrierXX2 = this.yDictionary[carrierY] + this.xDictionary[carrierX + 1];
                const carrierXX3 = this.yDictionary[carrierY] + this.xDictionary[carrierX + 2];
                const carrierXX4 = this.yDictionary[carrierY] + this.xDictionary[carrierX + 3];

                this.carrier.push(carrierXX1, carrierXX2, carrierXX3, carrierXX4);

            } else {
                const carrierYY1 = this.yDictionary[carrierY] + this.xDictionary[carrierX];
                const carrierYY2 = this.yDictionary[carrierY + 1] + this.xDictionary[carrierX];
                const carrierYY3 = this.yDictionary[carrierY + 2] + this.xDictionary[carrierX];
                const carrierYY4 = this.yDictionary[carrierY + 3] + this.xDictionary[carrierX];

                this.carrier.push(carrierYY1, carrierYY2, carrierYY3, carrierYY4);
            }

            // BATTLESHIP [5 cells]
            const battleship = document.querySelector("#battleship");
            const battleshipX = parseInt(battleship.parentElement.dataset.gsX);
            const battleshipY = parseInt(battleship.parentElement.dataset.gsY);

            if (battleship.classList.contains('battleshipHorizontal')) {
                const battleshipXX1 = this.yDictionary[battleshipY] + this.xDictionary[battleshipX];
                const battleshipXX2 = this.yDictionary[battleshipY] + this.xDictionary[battleshipX + 1];
                const battleshipXX3 = this.yDictionary[battleshipY] + this.xDictionary[battleshipX + 2];
                const battleshipXX4 = this.yDictionary[battleshipY] + this.xDictionary[battleshipX + 3];
                const battleshipXX5 = this.yDictionary[battleshipY] + this.xDictionary[battleshipX + 4];

                this.battleship.push(battleshipXX1, battleshipXX2, battleshipXX3, battleshipXX4, battleshipXX5);

            } else {
                const battleshipYY1 = this.yDictionary[battleshipY] + this.xDictionary[battleshipX];
                const battleshipYY2 = this.yDictionary[battleshipY + 1] + this.xDictionary[battleshipX];
                const battleshipYY3 = this.yDictionary[battleshipY + 2] + this.xDictionary[battleshipX];
                const battleshipYY4 = this.yDictionary[battleshipY + 3] + this.xDictionary[battleshipX];
                const battleshipYY5 = this.yDictionary[battleshipY + 4] + this.xDictionary[battleshipX];

                this.battleship.push(battleshipYY1, battleshipYY2, battleshipYY3, battleshipYY4, battleshipYY5);

            }


            // submit ships: patrol, submarine, destroyer, carrier, battleship
            // method 1 with jquery, see shootSalvos() for method 2 with fetch
            $.post({
                url: "/api/games/players/" + gpUrl + "/ships",
                data: JSON.stringify([
                    { "type": "patrol", "shipLocations": this.patrol },
                    { "type": "submarine", "shipLocations": this.submarine },
                    { "type": "destroyer", "shipLocations": this.destroyer },
                    { "type": "carrier", "shipLocations": this.carrier },
                    { "type": "battleship", "shipLocations": this.battleship },
                ]),
                dataType: "text",
                contentType: "application/json"
            }).done(function() {
                console.log("Success, commencing battle!!! ... ");
                location.reload();
            }).fail(function() {
                console.log("error")
                alert("Something went wrong, try again!")
            })

        },

        createGridStack() {
            const options = {
                //grilla de 10 x 10
                column: 10,
                row: 10,
                //separacion entre elementos (les llaman widgets)
                verticalMargin: 0,
                //altura de las celdas
                disableOneColumnMode: true,
                //altura de las filas/celdas
                cellHeight: 40,
                //necesario
                float: true,
                //desabilitando el resize de los widgets
                disableResize: true,
                //false permite mover los widgets, true impide
                staticGrid: this.staticGrid
            }

            //iniciando la grilla en modo libre statidGridFalse
            const grid = GridStack.init(options, '#grid');

            //todas las funciones se encuentran en la documentación
            //https://github.com/gridstack/gridstack.js/tree/develop/doc

            // if ship widgets are not locked in place
            if (this.staticGrid == false) {

                //agregando elementos (widget) desde el javascript
                //elemento, x, y, width, height
                // autoPosition - tells to ignore x and y attributes and to place element to the first available position. Having
                // either one missing will also do that.
                grid.addWidget('<div><div id="submarine" class="grid-stack-item-content submarineHorizontal"></div><div/>',
                    1, 1, 3, 1);

                grid.addWidget('<div><div id="carrier" class="grid-stack-item-content carrierVertical"></div><div/>',
                    9, 1, 1, 4);

                grid.addWidget('<div><div id="patrol" class="grid-stack-item-content patrolHorizontal"></div><div/>',
                    2, 4, 2, 1);

                grid.addWidget('<div><div id="destroyer" class="grid-stack-item-content destroyerVertical"></div><div/>',
                    6, 4, 1, 3);

                grid.addWidget('<div><div id="battleship" class="grid-stack-item-content battleshipHorizontal"></div><div/>',
                    2, 8, 5, 1);

                //rotacion de las naves
                //obteniendo los ships agregados en la grilla
                const ships = document.querySelectorAll("#submarine,#carrier,#patrol,#destroyer,#battleship");
                ships.forEach(ship => {
                    //asignando el evento de click a cada nave
                    ship.parentElement.onclick = function(event) {
                        //obteniendo el ship (widget) al que se le hace click
                        let itemContent = event.target;
                        //obteniendo valores del widget
                        let itemX = parseInt(itemContent.parentElement.dataset.gsX);
                        let itemY = parseInt(itemContent.parentElement.dataset.gsY);
                        let itemWidth = parseInt(itemContent.parentElement.dataset.gsWidth);
                        let itemHeight = parseInt(itemContent.parentElement.dataset.gsHeight);

                        //si esta horizontal se rota a vertical sino a horizontal
                        if (itemContent.classList.contains(itemContent.id + 'Horizontal')) {
                            //veiricando que existe espacio disponible para la rotacion
                            if (grid.isAreaEmpty(itemX, itemY + 1, itemHeight, itemWidth - 1) && (itemY + (itemWidth - 1) <= 9)) {
                                //la rotacion del widget es simplemente intercambiar el alto y ancho del widget, ademas se cambia la clase
                                grid.resize(itemContent.parentElement, itemHeight, itemWidth);
                                itemContent.classList.remove(itemContent.id + 'Horizontal');
                                itemContent.classList.add(itemContent.id + 'Vertical');
                            } else {
                                alert("Espacio no disponible");
                            }
                        } else {
                            if (grid.isAreaEmpty(itemX + 1, itemY, itemHeight - 1, itemWidth) && (itemX + (itemHeight - 1) <= 9)) {
                                grid.resize(itemContent.parentElement, itemHeight, itemWidth);
                                itemContent.classList.remove(itemContent.id + 'Vertical');
                                itemContent.classList.add(itemContent.id + 'Horizontal');
                            } else {
                                alert("Espacio no disponible");
                            }
                        }
                    }
                })
            } else {
                //agregando elementos (widget) desde JSON "after" placeShips() execution.
                //div, x, y, width, height
                app.widgetInGrid.forEach(widget => {
                    grid.addWidget(widget.div, widget.gsX, widget.gsY, widget.width, widget.height)
                });
            }
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