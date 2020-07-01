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
        timerIdStatus: null,
        timerIdTakeAction: null,

        // for gameState
        gameState: '',
        gameStateBanner: '',

        // for history table
        round: 0,
        history: [],

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
                this.round = this.games.hits.length;
                this.gameState = this.games.gameState;

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

                // sort history
                app.sortHistory();

                // show game state
                app.showGameState();

            })
    },

    updated() {
        //print ALL salvos once all fetch items are mounted (created)
        this.printSalvos();
    },

    methods: {

        startCheckingGameStatus() {
            this.timerIdStatus = setInterval(function () { location.reload(); }, 20000);
        },

        // stopCheckingGameStatus() {
        //     clearInterval(timerIdStatus);
        // },

        startReminder() {
            timerIdTakeAction = setTimeout(function () { alert("Are you still there? It's your turn!!"); }, 45000);
        },

        // stopReminder() {
        //     clearTimeout(timerIdTakeAction);
        // },

        showGameState() {
            switch (this.gameState) {
                case 'WAITING_FOR_OPPONENT':
                    this.gameStateBanner = 'Waiting for an Opponent to Join the Game';
                    document.getElementById('gameStateBanner').classList.add('btn-warning');

                    // start timer for page reload
                    app.startCheckingGameStatus();

                    break;

                case 'WAITING_FOR_YOUR_SHIPS':
                    this.gameStateBanner = 'Place your Ships';
                    document.getElementById('gameStateBanner').classList.add('btn-outline-success');

                    // start timer for reminder to take action
                    app.startReminder();

                    break;

                case 'WAITING_FOR_ENEMY_SHIPS':
                    this.gameStateBanner = 'Waiting for your Opponent to deploy ships';
                    document.getElementById('gameStateBanner').classList.add('btn-warning');

                    // start timer for page reload
                    app.startCheckingGameStatus();

                    break;

                case 'WAITING_FOR_YOUR_SHOTS':
                    this.gameStateBanner = 'Take your shots';
                    document.getElementById('gameStateBanner').classList.add('btn-outline-success');

                    // start timer for reminder to take action
                    app.startReminder();

                    break;

                case 'WAITING_FOR_ENEMY_SHOTS':
                    this.gameStateBanner = 'Your opponent is taking shots';
                    document.getElementById('gameStateBanner').classList.add('btn-warning');

                    // start timer for page reload
                    app.startCheckingGameStatus();

                    break;

                case 'GAME_OVER_WON':
                    this.gameStateBanner = 'Congratulations, you WON';
                    document.getElementById('gameStateBanner').classList.add('btn-outline-success');
                    break;

                case 'GAME_OVER_TIE':
                    this.gameStateBanner = 'Mutual destruction, it' + "'" + 's a TIE';
                    document.getElementById('gameStateBanner').classList.add('btn-warning');
                    break;

                case 'GAME_OVER_LOSS':
                    this.gameStateBanner = 'Ups, you have no ships left, better luck next time'
                    document.getElementById('gameStateBanner').classList.add('btn-outline-danger');
                    break;

            }
        },

        sortHistory() {

            // Ordenar creciente por TURNOS
            function compareTurn(a, b) {
                // a BEFORE b
                if (a.turn < b.turn) {
                    return -1;
                    // a AFTER b
                } else if (a.turn > b.turn) {
                    return 1;
                    // the same
                } else {
                    return 0;
                }
            };

            this.history = {
                hits: this.games.hits.sort(compareTurn),
                sunken: this.games.sunken.sort(compareTurn),
                sunkenTypes: '',
                enemyHits: this.games.enemyHits.sort(compareTurn),
                enemySunken: this.games.enemySunken.sort(compareTurn),
                enemySunkenTypes: '',
                salvosFired: '',
            };

            // x = app.history.sunken[app.history.sunken.length - 1].sunken[0].type = "patrol"
            if (this.games.sunken.length != 0) {
                this.history.sunken[this.history.sunken.length - 1].sunken.forEach(sunk => {
                    this.history.sunkenTypes = this.history.sunkenTypes + sunk.type + " ";
                })
            };

            if (this.games.enemySunken.length != 0) {
                this.history.enemySunken[this.history.enemySunken.length - 1].sunken.forEach(sunk => {
                    this.history.enemySunkenTypes = this.history.enemySunkenTypes + sunk.type + " ";
                })
            };

            if (this.games.salvos.length != 0) {
                this.games.salvos.forEach(salvo => {
                    if (salvo.username == this.owner) {
                        this.history.salvosFired += salvo.salvoLocation + ",";
                    }
                })
            };
        },

        getPlayersInfo() {
            this.games.gamePlayers.forEach(gp => {
                if (gp.gpId == gpUrl) {
                    this.owner = gp.player.username
                } else {
                    this.opponent = gp.player.username
                }
            })
        },

        printSalvos() {
            //build placedShips
            this.games.ships.forEach(ship => {
                ship.shipLocation.forEach(shipLoc => {
                    this.placedShips.push(shipLoc);
                })
            })

            this.games.salvos.forEach(salvo => {
                salvo.salvoLocation.forEach(loc => {
                    if (salvo.username == this.owner) {

                        //Owner SHOTS -> salvoLoc = loc + '.salvo';
                        document.getElementById(loc + '.salvo').classList.add('td_salvo_shot');
                        document.getElementById(loc + '.salvo').innerText = salvo.turn;

                        // Owner HITS
                        this.games.hits.forEach(hit => {
                            if (hit.hits.includes(loc)) {
                                document.getElementById(loc + '.salvo').classList.add('td_salvo_shot_hit');
                            }
                        });

                        // Owner SUNK
                        this.games.sunken.forEach(sunk => {
                            sunk.sunken.forEach(sunkenShip => {
                                if (sunkenShip.shipLocation.includes(loc)) {
                                    document.getElementById(loc + '.salvo').classList.add('td_salvo_shot_sunk');
                                }
                            })

                        });

                    } else {

                        //OWNER SHIPS GRID 
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

        /* Listen for events is a method in Vue already, implemented with:
 
         <td> v-on:click="listenForShotsWithVue()" </td>
 
        listenForShots_WITHOUT_VUE() {
            document.getElementById("salvos_grid").addEventListener('click', function(event) {
 
                // Don't follow the link
                event.preventDefault();
 
                //remove .salvo from id until the TEST_GRID is no longe needed
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
        }, */

        listenForShotsWithVue() {

            if (this.gameState != 'WAITING_FOR_YOUR_SHOTS') return;

            var x = event.target['id'];

            //remove .salvo from id
            x = x.substring(0, x.indexOf('.'));

            // Ignore cells already fired on
            if (this.history.salvosFired.includes(x)) return;

            // Log the clicked element in the console
            if (app.shots.includes(x)) {

                console.log('Remove' + x);
                app.shots = app.shots.filter(function (ele) { return ele != x; });
                document.getElementById(x + '.salvo').classList.remove('td_salvo');

            } else {

                console.log('Planning shot:' + x);
                app.shots.push(x);
                document.getElementById(x + '.salvo').classList.add('td_salvo');
            }

            if (app.shots.length > 5) {
                console.log('Too many shots, removing:' + x);
                alert("Maximum number of shots allowed exceded, removing that last one, time to FIRE AWAY (or take back planned shot) !!!");
                app.shots = app.shots.filter(function (ele) { return ele != x; });
                document.getElementById(x + '.salvo').classList.remove('td_salvo');
            }
        },

        shootSalvos(shots) {
            if (shots.length < 5) {
                alert('You are missing shots, you can take up to 5 on this turn');
                return;
            }

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
                    case 'PATROL':
                        //PATROL: 2x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = `<div><div id="patrol" class="grid-stack-item-content ${varY == ship.shipLocation[1][0] ? 'patrolHorizontal' : 'patrolVertical'} "></div><div/>`;
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

                    case 'SUBMARINE':
                        //SUBMARINE: 3x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = `<div><div id="submarine" class="grid-stack-item-content ${varY == ship.shipLocation[1][0] ? 'submarineHorizontal' : 'submarineVertical'} "></div><div/>`;
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

                    case 'DESTROYER':
                        //destroyer: 3x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = `<div><div id="destroyer" class="grid-stack-item-content ${varY == ship.shipLocation[1][0] ? 'destroyerHorizontal' : 'destroyerVertical'} "></div><div/>`;
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

                    case 'CARRIER':
                        //carrier: 4x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = `<div><div id="carrier" class="grid-stack-item-content ${varY == ship.shipLocation[1][0] ? 'carrierHorizontal' : 'carrierVertical'} "></div><div/>`;
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

                    case 'BATTLESHIP':
                        //battleship: 5x1
                        var varX = ship.shipLocation[0].slice(1);
                        var varY = ship.shipLocation[0][0];
                        var content = `<div><div id="battleship" class="grid-stack-item-content ${varY == ship.shipLocation[1][0] ? 'battleshipHorizontal' : 'battleshipVertical'} "></div><div/>`;
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
                    { "type": "PATROL", "shipLocations": this.patrol },
                    { "type": "SUBMARINE", "shipLocations": this.submarine },
                    { "type": "DESTROYER", "shipLocations": this.destroyer },
                    { "type": "CARRIER", "shipLocations": this.carrier },
                    { "type": "BATTLESHIP", "shipLocations": this.battleship },
                ]),
                dataType: "text",
                contentType: "application/json"
            }).done(function () {
                console.log("Success, commencing battle!!! ... ");
                location.reload();
            }).fail(function () {
                console.log("error")
                alert("Something went wrong, try again!")
            })

        },

        createGridStack() {
            const options = {
                //grilla de 10 x 10
                column: 10,
                row: 10,
                //separación entre elementos (les llaman widgets)
                verticalMargin: 0,
                //altura de las celdas
                disableOneColumnMode: true,
                //altura de las filas/celdas
                cellHeight: 40,
                //necesario
                float: true,
                //deshabilitando el resize de los widgets
                disableResize: true,
                //false permite mover los widgets, true impide
                staticGrid: this.staticGrid
            }

            //iniciando la grilla en modo libre staticGrid = False
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

                //rotación de las naves
                //obteniendo los ships agregados en la grilla
                const ships = document.querySelectorAll("#submarine,#carrier,#patrol,#destroyer,#battleship");
                ships.forEach(ship => {
                    //asignando el evento de click a cada nave
                    ship.parentElement.onclick = function (event) {
                        //obteniendo el ship (widget) al que se le hace click
                        let itemContent = event.target;
                        //obteniendo valores del widget
                        let itemX = parseInt(itemContent.parentElement.dataset.gsX);
                        let itemY = parseInt(itemContent.parentElement.dataset.gsY);
                        let itemWidth = parseInt(itemContent.parentElement.dataset.gsWidth);
                        let itemHeight = parseInt(itemContent.parentElement.dataset.gsHeight);

                        //si esta horizontal se rota a vertical sino a horizontal
                        if (itemContent.classList.contains(itemContent.id + 'Horizontal')) {
                            //verificando que existe espacio disponible para la rotación
                            if (grid.isAreaEmpty(itemX, itemY + 1, itemHeight, itemWidth - 1) && (itemY + (itemWidth - 1) <= 9)) {
                                //la rotación del widget es simplemente intercambiar el alto y ancho del widget, ademas se cambia la clase
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
            $.post("/api/logout").done(function () {
                console.log("logged out!");
                location.href = "/web/games.html";
            }).fail(function () {
                console.log("error")
            })
        },
    },
});

// AJAX Feed for help with developing

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