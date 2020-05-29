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
        private String userName;
        private int xp;

    // relacion many to many con Games a través de la instancia intermedia GamePLayer
    @OneToMany(mappedBy = "player", fetch=FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<GamePlayer> gamePlayer = new HashSet<>();
    //declaro el Set<GamePlayer> para la relación 1:N intermedia

    @OneToMany(mappedBy = "player", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Score> scores = new HashSet<>();

    public Player(){} //Primero que nada Spring necesita una instancia vacía para poder trabajar con la base de datos

    public Player(String firstName, String lastName, String userName){
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.xp = 0;
    }

    public Player(String firstName, String lastName, String userName, int xp){
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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
        return firstName + " " + lastName + " " + userName;
    }

    //DTO (data transfer object) para administrar la info de Player
    public Map<String, Object> playerDTO(){
        Map<String, Object> dto = new LinkedHashMap<>(); //Linked envia a Map de forma ordenada.
        dto.put("id", this.id);
        dto.put("userName", this.userName);
        return dto;
    }
}