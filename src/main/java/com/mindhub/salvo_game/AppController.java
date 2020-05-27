package com.mindhub.salvo_game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AppController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    // @Autowired
    // private PlayerRepository playerRepository;

    // You do not need to @Autowire a PlayerRepository or GamePlayer repository into your controller
    // for task 4.2.6. When you load a Game, Spring code automatically loads whatever a game contains,
    // including its collection of game players.

    @Autowired
    private ShipRepository shipRepository;

    @Autowired
    private SalvoRepository salvoRepository;

    // Task 4.2.6
    @RequestMapping("/games")
    // en Java, Map es una lista (que representa un objeto con toda la información de una instancia de Game
    // en este caso) de elementos con clave (tipo String) y valor (tipo Object en este caso, o lo que sea
    // en otros casos): List<Map<String, Object>>
    private List<Map<String, Object>> getGame(){
        return gameRepository.findAll().stream().map(Game::gameDTO).collect(Collectors.toList());
    }

    // Task 4.3.2, no usamos List<Map.. sino Map<.. porque ya no estamos trayendo una lista de elementos
    // via stream sino que estamos trayendo un elemento  especifico via get().gamePlayerViewDTO().
    @RequestMapping("/game_view/{gamePlayerId}")
    public Map<String, Object> getGame(@PathVariable long gamePlayerId) {
        return gamePlayerRepository.findById(gamePlayerId).get().gamePlayerViewDTO();
    }

}
// Game::gameDTO es la nomenclatura para llamar a una funcion en Java.
// "Clase donde esta la funcion (o this)"::"nombre de la funcion"

// el DTO (data transfer object) es un método de transferir la información de un objeto en la clase player,
// o de la clase Game, que funciona de filtro. O sea, le envia a Map la información que quiero mostrar y
// de la forma que la quiero mostrar. Por ejemplo, me permite evitar que se muestren passwords.

// localhost:8080/rest tendrá TODA la base de datos completa en formatop JSON
//localhost:8080/api tendrá solo la información de los DTOs en formato JSON