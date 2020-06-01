package com.mindhub.salvo_game;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
        private long id;

        private String firstName;
        private String lastName;
        private String username;
        private String password;
        private int xp;

    // relacion many to many con Games a través de la instancia intermedia GamePLayer
    @OneToMany(mappedBy = "player", fetch=FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<GamePlayer> gamePlayer = new HashSet<>();
    //declaro el Set<GamePlayer> para la relación 1:N intermedia

    @OneToMany(mappedBy = "player", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Score> scores = new HashSet<>();

    public Player(){} //Primero que nada Spring necesita una instancia vacía para poder trabajar con la base de datos

    public Player(String firstName, String lastName, String username, String password){
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.xp = 0;
    }

    public Player(String firstName, String lastName, String username, String password, int xp){
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.xp = xp;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public Set<GamePlayer> getGamePlayer() {
        return gamePlayer;
    }

    public void setGamePlayer(Set<GamePlayer> gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public Set<Score> getScores() {
        return scores;
    }

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    public String toString() {
        return firstName + " " + lastName + " " + username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    //DTO (data transfer object) para administrar la info de Player
    public Map<String, Object> playerDTO(){
        Map<String, Object> dto = new LinkedHashMap<>(); //Linked envia a Map de forma ordenada.
        dto.put("id", this.id);
        dto.put("username", this.username);
        return dto;
    }
}