package com.mindhub.salvo_game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @RequestMapping("/games")
    public Map<String, Object> getGames(Authentication authentication){
        Map<String, Object> dto = new LinkedHashMap<>();
        if(!this.isGuest(authentication)) {
            dto.put("player", playerRepository.findPlayerByUsername(authentication.getName()).playerDTO());
        } else{
            dto.put("player", "Guest");
        }
        dto.put("games", gameRepository.findAll().stream().map(Game::gameDTO).collect(Collectors.toList()));
        return dto;
    }

// en Java, Map es una lista (que representa un objeto con toda la información de una instancia de
// Game en este caso) de elementos con clave (tipo String) y valor (tipo Object en este caso, o lo
// que sea en otros casos): List<Map<String, Object>>


    @RequestMapping("/game_view/{gamePlayerId}")
    public Map<String, Object> getGameView(@PathVariable long gamePlayerId, Authentication authenticate) {
        Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gamePlayerId);
        if(gamePlayer.isPresent()){
            return gamePlayer.get().gamePlayerViewDTO();
        } else {
            return null;
        }
    }

// Task 4.3.2, no usamos List<Map.. sino Map<.. porque ya no estamos trayendo una lista de elementos
// via stream sino que estamos trayendo un elemento  especifico via get().gamePlayerViewDTO().
// Game::gameDTO es la nomenclatura para llamar a una funcion en Java.
// "Clase donde esta la funcion (o this)"::"nombre de la funcion"

// el DTO (data transfer object) es un método de transferir la información de un objeto en la clase
// player, o de la clase Game, que funciona de filtro. O sea, le envia a Map la información que
// quiero mostrar y de la forma que la quiero mostrar. Por ejemplo, me permite evitar que se muestren
// passwords.

    @RequestMapping(path = "/players", method = RequestMethod.POST)
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

    private boolean isGuest(Authentication authentication){
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    private Map<String, Object> makeMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

}