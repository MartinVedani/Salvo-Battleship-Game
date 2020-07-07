package com.mindhub.salvo_game.models;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private LocalDateTime creationDate; //propieda de la clase Game

    //relación many to many con Player a través de la instancia intermedia GamePlayer
    @OneToMany(mappedBy = "game", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<GamePlayer> gamePlayers = new HashSet<>();
    //declaro el Set<GamePlayer> para la relación 1:N intermedia

    @OneToMany(mappedBy = "game", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Score> scores = new HashSet<>();

    //constructor vacío para inicializar la base de datos
    public Game(){}

    public Game(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    // getters & setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setGamePlayers(Set<GamePlayer> gamePlayers) {
        this.gamePlayers = gamePlayers;
    }

    public Set<Score> getScores() {
        return scores;
    }

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    //DTO (data transfer object) para administrar la info de Game
    public Map<String, Object> gameDTO(){
        Map<String, Object> dto = new LinkedHashMap<>(); //Linked envia a Map de forma ordenada.
        dto.put("id", this.id);
        dto.put("created", this.creationDate);
        dto.put("gamePlayers",
                this.gamePlayers.stream().map(GamePlayer::gamePlayerDTO).collect(Collectors.toList()));
        return dto;
    }
}

// GamePlayer::gamePlayerDTO es la nomenclatura para llamar a una funcion en Java.
// "Clase donde esta la funcion (o this)"::"nombre de la funcion"
