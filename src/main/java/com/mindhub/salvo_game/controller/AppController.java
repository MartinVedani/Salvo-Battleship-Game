package com.mindhub.salvo_game.controller;

import com.mindhub.salvo_game.models.*;
import com.mindhub.salvo_game.repositories.GamePlayerRepository;
import com.mindhub.salvo_game.repositories.GameRepository;
import com.mindhub.salvo_game.repositories.PlayerRepository;
import com.mindhub.salvo_game.repositories.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
public class AppController {

// localhost:8080/rest tendrá TODA la base de datos completa en formatop JSON
// localhost:8080/api tendrá solo la información de los DTOs en formato JSON

    //@Autowire se usa solamente para traer al controller, los repositorios que estoy
    //pidiendo en el mapping (solamente los que necesito utilizar).

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // en Java, Map es una lista (que representa un objeto con toda la información de una instancia de
    // Game en este caso) de elementos con clave (tipo String) y valor (tipo Object en este caso, o lo
    // que sea en otros casos): List<Map<String, Object>>

    // Task 4.3.2, no usamos List<Map.. sino Map<.. porque ya no estamos trayendo una lista de elementos
    // via stream sino que estamos trayendo un elemento  especifico via get().gamePlayerViewDTO().
    // Game::gameDTO es la nomenclatura para llamar a una funcion en Java.
    // "Clase donde esta la funcion (o this)"::"nombre de la funcion"

    // el DTO (data transfer object) es un método de transferir la información de un objeto en la clase
    // player, o de la clase Game, que funciona de filtro. O sea, le envia a Map la información que
    // quiero mostrar y de la forma que la quiero mostrar. Por ejemplo, me permite evitar que se muestren
    // passwords.


    // GET to get the complete list of games
    @GetMapping("/games")
    public Map<String, Object> getGames(Authentication authentication) {
        Map<String, Object> dto = new LinkedHashMap<>();
        if (!this.isGuest(authentication)) {
            dto.put("player", playerRepository.findPlayerByUsername(authentication.getName()).playerDTO());
        } else {
            dto.put("player", "Guest");
        }
        dto.put("games", gameRepository.findAll().stream().map(Game::gameDTO).collect(Collectors.toList()));
        return dto;
    }

    //GET to call game views by specific owner
    @GetMapping("/game_view/{gamePlayerId}")
    public ResponseEntity<Map<String, Object>> getGameView(@PathVariable long gamePlayerId, Authentication authentication) {
        ResponseEntity<Map<String, Object>> response;
        if (isGuest(authentication)) {
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_LOGGED_IN), HttpStatus.FORBIDDEN);
        } else {
            Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
            // "Optional" puede traer al gamePlayer que encuentre por id o no retornar nada y
            // gamePlayer puede no crearse y no existir si es que el gamePlayerId no se ecuentra.
            Player player = playerRepository.findPlayerByUsername(authentication.getName());
            if (!gamePlayer.isPresent()) { //En caso de que gamePlayer NO exista (porque no se encontré antes)
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.GAME_NOT_FOUND), HttpStatus.NOT_FOUND);
            } else if (gamePlayer.get().getPlayer().getId() != player.getId()) {
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_YOUR_GAME), HttpStatus.UNAUTHORIZED);
            } else {
                response = new ResponseEntity<>(gamePlayer.get().gamePlayerViewDTO(), HttpStatus.OK);
            }
        }
        return response;
    }

    // "POST" to create new players
    @PostMapping("/players")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestParam String firstName, @RequestParam String lastName,
            @RequestParam String username, @RequestParam String password) {
        ResponseEntity<Map<String, Object>> response;
        Player player = playerRepository.findPlayerByUsername(username);
        if (firstName.isEmpty() || lastName.isEmpty() || username.isEmpty() || password.isEmpty()) {
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.MISSING_DATA), HttpStatus.BAD_REQUEST);
        } else if (player != null) {
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.USER_EXISTS), HttpStatus.CONFLICT);
        } else {
            Player newPlayer = playerRepository.save(new Player(firstName, lastName, username, passwordEncoder.encode(password)));
            response = new ResponseEntity<>(makeMap("id", newPlayer.getId()), HttpStatus.CREATED);
        }
        return response;
    }

    // "POST" to create new games
    @PostMapping("/games")
    public ResponseEntity<Map<String, Object>> createGame(Authentication authentication){
        ResponseEntity<Map<String, Object>> response;
        if(isGuest(authentication)){
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_LOGGED_IN), HttpStatus.FORBIDDEN);
        } else {
            Player player = playerRepository.findPlayerByUsername(authentication.getName());
            Game newGame = gameRepository.save(new Game(LocalDateTime.now()));
            GamePlayer newGamePlayer = gamePlayerRepository.save(new GamePlayer(newGame,player,newGame.getCreationDate()));

            response = new ResponseEntity<>(makeMap("gpId", newGamePlayer.getId()), HttpStatus.CREATED);
        }
        return response;
    }

    // "POST" to join existing games as opponent (create a new gamePlayer for joining player)
    @PostMapping("/games/{gameId}/players")
    public ResponseEntity<Map<String, Object>> joinGame(Authentication authentication, @PathVariable long gameId) {
        ResponseEntity<Map<String, Object>> response;
        if (isGuest(authentication)) {
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_LOGGED_IN), HttpStatus.UNAUTHORIZED);
        } else {
            Optional<Game> game = gameRepository.findById(gameId);
            if(!game.isPresent()){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.GAME_NOT_FOUND), HttpStatus.NOT_FOUND);
            } else if (game.get().getGamePlayers().size() > 1) {
                // game.get() pulls whatever is inside the "optional" we created in the game variable.
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.GAME_FULL), HttpStatus.FORBIDDEN);
            } else {
                Player player = playerRepository.findPlayerByUsername(authentication.getName());
                if(game.get().getGamePlayers().stream().anyMatch(gp -> gp.getPlayer().getId() == player.getId())){
                    response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_AN_OPPONENT), HttpStatus.FORBIDDEN);
                } else {
                    GamePlayer newGamePlayer = gamePlayerRepository.save(new GamePlayer(game.get(), player, LocalDateTime.now()));
                    response = new ResponseEntity<>(makeMap("gpId", newGamePlayer.getId()), HttpStatus.CREATED);
                }
            }
        }
        return response;
    }

    //POST for gameplayer to add ships to games
    @PostMapping("/games/players/{gamePlayerId}/ships")
    public ResponseEntity<Map<String, Object>> addShips(Authentication authentication,
                                                        @PathVariable long gamePlayerId,
                                                        @RequestBody List<Ship> ships){
        ResponseEntity<Map<String, Object>> response;
        if(isGuest(authentication)) {
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_LOGGED_IN), HttpStatus.UNAUTHORIZED);
        } else {
            Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
            Player player = playerRepository.findPlayerByUsername(authentication.getName());
            if(!gamePlayer.isPresent()){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.GAME_NOT_FOUND), HttpStatus.NOT_FOUND);
            } else if (gamePlayer.get().getPlayer().getId() != player.getId()){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_YOUR_GAME), HttpStatus.UNAUTHORIZED);
            } else if (gamePlayer.get().getShips().size() > 0){
                // getShips() = 1 would be 1 complete array of 5 ships
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.ALL_SHIPS_IN_PLACE), HttpStatus.FORBIDDEN);
            } else if (ships == null || ships.size() != 5){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR,AppMessage.SHIPS_MISSING), HttpStatus.FORBIDDEN);
            } else {
                if(ships.stream().anyMatch(ship -> this.isOutOfRange(ship))){
                    response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR,AppMessage.SHIPS_OUT_OF_RANGE), HttpStatus.FORBIDDEN);
                } else if (ships.stream().anyMatch(ship -> isNotConsecutive(ship))) {
                    response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR,AppMessage.SHIPS_NOT_CONSECUTIVE), HttpStatus.FORBIDDEN);
                } else if (this.areOverlapped(ships)){
                    response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR,AppMessage.SHIPS_OVERLAP), HttpStatus.FORBIDDEN);
                } else {
                    ships.forEach(ship -> gamePlayer.get().addShip(ship));
                    gamePlayerRepository.save(gamePlayer.get());
                    response = new ResponseEntity<>(makeMap(AppMessage.KEY_SUCCESS, AppMessage.SHIPS_ADDED), HttpStatus.CREATED);
                }
            }
        }
        return response;
    }

    //POST for gameplayer to add salvos to games
    @PostMapping("/games/players/{gamePlayerId}/salvos")
    public ResponseEntity<Map<String, Object>> addSalvo(Authentication authentication,
                                                        @PathVariable long gamePlayerId,
                                                        @RequestBody List<String> shots){
        // Using a list<...> of shots and not salvos because the logic per turn will be done in the
        // back end after receiving a "shots" as strings
        ResponseEntity<Map<String, Object>> response;
        if(isGuest(authentication)) {
            response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_LOGGED_IN), HttpStatus.UNAUTHORIZED);
        } else {
            Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
            Player player = playerRepository.findPlayerByUsername(authentication.getName());
            if(!gamePlayer.isPresent()){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.GAME_NOT_FOUND), HttpStatus.NOT_FOUND);
            } else if (gamePlayer.get().getPlayer().getId() != player.getId()){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.NOT_YOUR_GAME), HttpStatus.UNAUTHORIZED);
            } else if (shots.size() != 5){
                response = new ResponseEntity<>(makeMap(AppMessage.KEY_ERROR, AppMessage.WRONG_SHOTS), HttpStatus.FORBIDDEN);
            } else {
                int turn = gamePlayer.get().getSalvos().size() +1;
                //each object with any number of salvos as elements is 1 turn
                Salvo salvo = new Salvo(turn, shots);
                gamePlayer.get().addSalvo(salvo);

                gamePlayerRepository.save(gamePlayer.get());

                response = new ResponseEntity<>(makeMap(AppMessage.KEY_SUCCESS, AppMessage.SHOTS_FIRED), HttpStatus.CREATED);

                // Save score if game is over, we use gamePlayer.get() because gamePlayer is inside "Optional"
                GameState gameState = gamePlayer.get().getGameState();

                if (gameState == GameState.GAME_OVER_WON) {
                    scoreRepository.save(new Score(gamePlayer.get().getGame(),gamePlayer.get().getPlayer(),1.0,LocalDateTime.now()));
                    scoreRepository.save(new Score(gamePlayer.get().getGame(),gamePlayer.get().getOpponent().getPlayer(),0.0,LocalDateTime.now()));
                } else if (gameState == GameState.GAME_OVER_TIE) {
                    scoreRepository.save(new Score(gamePlayer.get().getGame(),gamePlayer.get().getPlayer(),0.5,LocalDateTime.now()));
                    scoreRepository.save(new Score(gamePlayer.get().getGame(),gamePlayer.get().getOpponent().getPlayer(),0.5,LocalDateTime.now()));
                } else if (gameState == GameState.GAME_OVER_LOSS) {
                    scoreRepository.save(new Score(gamePlayer.get().getGame(),gamePlayer.get().getPlayer(),0.0,LocalDateTime.now()));
                    scoreRepository.save(new Score(gamePlayer.get().getGame(),gamePlayer.get().getOpponent().getPlayer(),1.0,LocalDateTime.now()));
                }
            }
        }
        return response;
    }

    //Test Ship coordinates are NOT out of range
    private boolean isOutOfRange(Ship ship){
        for(String cell : ship.getShipLocations()){
            // (for each cell cordinate in shipLocation)
            if(!(cell instanceof String) || cell.length() < 2){
                // if not of type String or less than two digits (i.e. not A1)
                return true;
            }
            char y = cell.substring(0,1).charAt(0); //first digit in the coordinate of "character" type
            Integer x;
            try {
                x = Integer.parseInt(cell.substring(1)); // second digit in the coordinate in "Integer" type
            } catch (NumberFormatException e){
                x = 99; // if second character not integer, set a high number to catch error on next "if"
            };
            if (x < 1 || x > 10 || y < 'A' || y > 'J'){
                return true;
            }
        }
        return false; // all tests passed successfully
    }

    //Test Ship coordinates are consecutive
    private boolean isNotConsecutive(Ship ship){
        List<String> cells = ship.getShipLocations();
        // rows are identified with LETTERS, columns are identified with NUMBER.
        boolean isVertical = cells.get(0).charAt(0) != cells.get(1).charAt(0);
        //compare the letters in first 2 coordinates, if not equal then vertical is TRUE.

        for(int i = 0; i < cells.size(); i++){
            if(i < cells.size() - 1){
                if(isVertical){
                    //compare if LETTERS are consecutive
                    char yChar = cells.get(i).substring(0,1).charAt(0);
                    char compareChar = cells.get(i + 1).substring(0,1).charAt(0);
                    if(compareChar - yChar != 1){
                        return true; //not consecutive (yes, you can substract characters as numbers)
                    }
                } else {
                    //compare if the NUMBERS are consecutive
                    Integer xInt = Integer.parseInt(cells.get(i).substring(1));
                    Integer compareInt = Integer.parseInt(cells.get(i + 1).substring(1));
                    if(compareInt - xInt != 1){
                        return true; //not consecutive
                    }
                }
            }

            for (int j = i + 1; j < cells.size(); j++) {

                if(isVertical){
                    // compare all the NUMBERS are the same
                    if(!cells.get(i).substring(1).equals(cells.get(j).substring(1))){
                        return true;
                    }
                } else {
                    // compare all the LETTERS are the same
                    if(!cells.get(i).substring(0,1).equals(cells.get(j).substring(0,1))){
                        return true;
                    }
                }
            }
        }
        return false; // all tests passed successfully
    }

    //Test Ship coordinates DO NOT overlap (do not repeat)
    private boolean areOverlapped(List<Ship> ships){
        List<String> allCells = new ArrayList<>();

        ships.forEach(ship -> allCells.addAll(ship.getShipLocations()));

        for(int i = 0; i < allCells.size(); i++ ){
            for(int j = i + 1; j < allCells.size(); j++){
                // compare each cell "i" against ALL other cells "j"
                if(allCells.get(i).equals(allCells.get(j))){
                    return true;
                }
            }
        }
        return false; // all tests passed successfully
    }

    // Two private methods we used above for GET and POST responses
    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

    private boolean isGuest(Authentication authentication){
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }
}