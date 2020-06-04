package com.mindhub.salvo_game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
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

    // Two private methods we will use for GET and POST
    private boolean isGuest(Authentication authentication){
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

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
            response = new ResponseEntity<>(makeMap("error", "You must be logged in first"), HttpStatus.FORBIDDEN);
        } else {
            Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
            // "Optional" puede traer al gamePlayer que encuentre por id o no retornar nada y
            // gamePlayer puede no crearse y no existir si es que el gamePlayerId no se ecuentra.
            Player player = playerRepository.findPlayerByUsername(authentication.getName());
            if (!gamePlayer.isPresent()) { //En caso de que gamePlayer NO exista (porque no se encontré antes)
                response = new ResponseEntity<>(makeMap("error", "Game does not exist"), HttpStatus.NOT_FOUND);
            } else if (gamePlayer.get().getPlayer().getId() != player.getId()) {
                response = new ResponseEntity<>(makeMap("error", "This is not your game"), HttpStatus.UNAUTHORIZED);
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
            response = new ResponseEntity<>(makeMap("error", "Missing data"), HttpStatus.BAD_REQUEST);
        } else if (player != null) {
            response = new ResponseEntity<>(makeMap("error", "Username already exists"), HttpStatus.CONFLICT);
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
            response = new ResponseEntity<>(makeMap("error", "You must be logged in first"), HttpStatus.FORBIDDEN);
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
            response = new ResponseEntity<>(makeMap("error", "You must be logged in first"), HttpStatus.UNAUTHORIZED);
        } else {
            Optional<Game> game = gameRepository.findById(gameId);
            if(!game.isPresent()){
                response = new ResponseEntity<>(makeMap("error", "No such game"), HttpStatus.NOT_FOUND);
            } else if (game.get().getGamePlayers().size() > 1) {
                // game.get() pulls whatever is inside the "optional" we created in the game variable.
                response = new ResponseEntity<>(makeMap("error", "Game is full"), HttpStatus.FORBIDDEN);
            } else {
                Player player = playerRepository.findPlayerByUsername(authentication.getName());
                if(game.get().getGamePlayers().stream().anyMatch(gp -> gp.getPlayer().getId() == player.getId())){
                    response = new ResponseEntity<>(makeMap("error", "You cannot play against yourself!"), HttpStatus.FORBIDDEN);
                } else {
                    GamePlayer newGamePlayer = gamePlayerRepository.save(new GamePlayer(game.get(), player, LocalDateTime.now()));
                    response = new ResponseEntity<>(makeMap("gpId", newGamePlayer.getId()), HttpStatus.CREATED);
                }
            }
        }
        return response;
    }
}