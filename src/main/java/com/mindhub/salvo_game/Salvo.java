package com.mindhub.salvo_game;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private int turn;

    @ElementCollection
    @Column(name="salvoLocations")
    private List<String> salvoLocations = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gamePlayer_id")
    private GamePlayer gamePlayer;

    public Salvo(){}

    public Salvo(int turn, List<String> salvoLocations, GamePlayer gamePlayer) {
        this.turn = turn;
        this.salvoLocations = salvoLocations;
        this.gamePlayer = gamePlayer;
    }

    public Salvo(int turn, List<String> salvoLocations) {
        this.turn = turn;
        this.salvoLocations = salvoLocations;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public int getTurn() {
        return turn;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public List<String> getSalvoLocations() {
        return salvoLocations;
    }

    public void setSalvoLocations(List<String> salvoLocations) {
        this.salvoLocations = salvoLocations;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    //getHits for myShots
    private List<String> getHits(){

        List<String> myShots = this.getSalvoLocations();

        List<String> allEnemyLocs = new ArrayList<>();

        Set<Ship> opponentShips = this.getGamePlayer().getOpponent().getShips();

        opponentShips.forEach(ship -> allEnemyLocs.addAll(ship.getShipLocations()));

        return myShots
                .stream()
                    .filter(shot -> allEnemyLocs
                        .stream()
                            .anyMatch(loc -> loc.equals(shot)))
                                .collect(Collectors.toList());
    }

    //getSunkenShips from opponentShips
    private List<Ship> getSunkenShips(){

        List<String> allShots = new ArrayList<>();

        Set<Salvo> mySalvos = this.getGamePlayer()
                .getSalvos()
                    .stream()
                    .filter(salvo -> salvo.getTurn() <= this.getTurn())
                    .collect(Collectors.toSet());

        Set<Ship> opponentShips = this.getGamePlayer().getOpponent().getShips();

        mySalvos.forEach(salvo -> allShots.addAll(salvo.getSalvoLocations()));

        return opponentShips
                .stream()
                    .filter(ship -> allShots.containsAll(ship.getShipLocations()))
                        .collect(Collectors.toList());
    }

    // DTO para Salvos en General
    public Map<String, Object> salvoDTO(){
        Map<String, Object> dto = new LinkedHashMap<>(); //Linked envia a Map de forma ordenada.
        dto.put("turn", this.turn);
        dto.put("username", this.gamePlayer.getPlayer().getUsername());
        dto.put("salvoLocation", this.salvoLocations);

        return dto;
    }

    // DTO para Salvo HITS
    public Map<String, Object> salvoHitDTO(){
        Map<String, Object> dto = new LinkedHashMap<>(); //Linked envia a Map de forma ordenada.
        dto.put("turn", this.turn);

        GamePlayer opponent = this.getGamePlayer().getOpponent();

        if(opponent != null){

            dto.put("hits", this.getHits());

        } else {

            dto.put("hits", new ArrayList<>());
            // array vacío es mejor para trabajar con forEach en el front end
            // sin necesitar el "if == null"

        }

        return dto;
    }

    // DTO para Salvos SUNKEN
    public Map<String, Object> salvoSunkenDTO(){
        Map<String, Object> dto = new LinkedHashMap<>(); //Linked envia a Map de forma ordenada.
        dto.put("turn", this.turn);

        GamePlayer opponent = this.getGamePlayer().getOpponent();

        if(opponent != null){

            dto.put("sunken", this.getSunkenShips().stream().map(Ship::shipsDTO));


        } else {

            // array vacío es mejor para trabajar con forEach en el front end
            // sin necesitar el "if == null"

            dto.put("sunken", new ArrayList<>());
        }

        return dto;
    }
}
