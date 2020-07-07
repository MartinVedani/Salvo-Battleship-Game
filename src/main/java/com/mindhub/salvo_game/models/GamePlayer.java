package com.mindhub.salvo_game.models;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
public class GamePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private LocalDateTime joinDate;

    // relacion Many to One con Player. Cada fila de GamePlayer tiene un solo Player
    // mientras que un Player puede tener muchas filas en gamePlayers.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id")
    private Player player;

    // relacion Many to One con Game. Cada fila de GamePlayer tiene un solo Game
    // mientras que un Game puede tener muchas filas en gamePlayers.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "game_id")
    private Game game;

    @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Ship> ships = new HashSet<>();

    @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<Salvo> salvos = new HashSet<>();

    public GamePlayer(){}

    public GamePlayer(Game game, Player player, LocalDateTime joinDate) {
        this.joinDate = joinDate;
        this.player = player;
        this.game = game;
    }

    public GamePlayer(Game game, Player player, LocalDateTime joinDate, Set<Ship> ships, Set<Salvo> salvos) {
        this.joinDate = joinDate;
        this.player = player;
        this.game = game;
        this.ships = ships;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    // add ship
    public void addShip(Ship ship) {
        this.ships.add(ship);
        ship.setGamePlayer(this);
    }

    public Set<Ship> getShips() {
        return ships;
    }

    public void setShips(Set<Ship> ships) {
        this.ships = ships;
    }

    // add salvo
    public void addSalvo(Salvo salvo) {
        this.salvos.add(salvo);
        salvo.setGamePlayer(this);
    }

    public Set<Salvo> getSalvos() {
        return salvos;
    }

    public void setSalvos(Set<Salvo> salvos) {
        this.salvos = salvos;
    }

    public Score getGamePlayerScore() {
        return this.getPlayer().getScores().stream().filter(score -> score.getGame().getId() == this.getGame().getId()).findFirst().orElse(null);
    }

    // get opponent for Salvos, Ships and Sunken Ships in Salvo::salvoDTO
    public GamePlayer getOpponent(){
        return this.getGame().getGamePlayers()
                .stream().filter(gp -> gp.getId() != this.getId())
                .findFirst()
                .orElse(null);
    }

    // GET STATE FOR THE GAME
    public GameState getGameState(){

        // iniciar respuesta
        GameState response = null;

        // iniciar jugadores
        Long gpGpId = this.getId();
        GamePlayer opponent = this.getOpponent();
        Long enemyGpId = (opponent == null) ? null : opponent.getId();

        //iniciar naves
        Set<Ship> gpShips = this.getShips();
        Set<Ship> enemyShips = (opponent == null) ? null : opponent.getShips();

        //iniciar turnos
        Integer gpTurn = (this.getSalvos() == null) ? 0 : this.getSalvos().size();
        Integer enemyTurn = (opponent == null) ? 0 : (opponent.getSalvos() == null) ? 0 : opponent.getSalvos().size();

        // iniciar naves hundidas
        Integer gpSunkenShips = (gpTurn == 0) ? 0 : this.getSalvos().stream().filter(salvo -> salvo.getTurn() == gpTurn).findFirst().get().getSunkenShips().size();
        Integer enemySunkenShips = (enemyTurn == 0) ? 0 : opponent.getSalvos().stream().filter(salvo -> salvo.getTurn() == enemyTurn).findFirst().get().getSunkenShips().size();

        // Start by placing ships
        if (gpShips.size() != 5 ){
            response = GameState.WAITING_FOR_YOUR_SHIPS;

        //Wait on opponent
        }  else if (opponent == null) {
            response = GameState.WAITING_FOR_OPPONENT;

        // wait on Enemy ships
        } else if (enemyShips.size() != 5){
            response = GameState.WAITING_FOR_ENEMY_SHIPS;

        //play the game
        } else if (gpTurn < enemyTurn) {
            response = GameState.WAITING_FOR_YOUR_SHOTS;
        } else if (gpTurn > enemyTurn) {
            response = GameState.WAITING_FOR_ENEMY_SHOTS;

        // GAME_OVER_Score
        } else if (gpTurn == enemyTurn && (gpSunkenShips == 5 && enemySunkenShips == 5)){
            response = GameState.GAME_OVER_TIE;
        } else if (gpTurn == enemyTurn && (gpSunkenShips == 5 && enemySunkenShips < 5)){
            response = GameState.GAME_OVER_WON;
        } else if (gpTurn == enemyTurn && (gpSunkenShips < 5 && enemySunkenShips == 5)){
            response = GameState.GAME_OVER_LOSS;
        //Keep playing the game if no one has sunken 5 ships yet
        } else if (gpTurn == enemyTurn && gpGpId < enemyGpId) {
            response = GameState.WAITING_FOR_YOUR_SHOTS;
        } else if (gpTurn == enemyTurn && gpGpId > enemyGpId) {
            response = GameState.WAITING_FOR_ENEMY_SHOTS;
        }
            return response;
        }

    // DTO (data transfer object) para administrar la info de GamePlayer
    public Map<String, Object> gamePlayerDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gpId", this.id);
        dto.put("joinDate", this.joinDate);
        dto.put("player", this.getPlayer().playerDTO());
        Score gamePlayerScore = this.getGamePlayerScore();
        if (gamePlayerScore != null){
            dto.put("gamePlayerScore", gamePlayerScore.getScore());
        } else {
            dto.put("gamePlayerScore", "null");
        }
        return dto;
        // getId() y getJoinDate() fueron creados para ser usados desde otras clases - como si
        // se estuviera "pidiendo permiso".
        // Estando dentro de la misma clase, puedes acceder directamente a this.is y this.joinDate
        // y ahorrar tiempo y recursos en vez de usar getId() y getJoinDate() ya que la clase no necesita
        // pedirse permiso a sí misma para ingresar sus propias propiedades.
    }

    // GameView DTO con hits and sunken para owner y opponent
    public Map<String, Object> gamePlayerViewDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gameId", this.game.getId());
        dto.put("gamePlayers",
                this.game.getGamePlayers().stream().map(GamePlayer::gamePlayerDTO).collect(Collectors.toList()));
        dto.put("ships", this.ships.stream().map(Ship::shipsDTO).collect(Collectors.toList()));
        dto.put("salvos", game.getGamePlayers().stream().flatMap(gamePlayer -> gamePlayer.getSalvos().stream().map(Salvo::salvoDTO)).collect(Collectors.toList()));

        // damage done to the enemy
        dto.put("hits", this.getSalvos().stream().map(Salvo::salvoHitDTO));
        dto.put("sunken", this.getSalvos().stream().map(Salvo::salvoSunkenDTO));

        // damage done by the enemy, to the gamePlayer
        GamePlayer opponent = this.getOpponent();

        if(opponent != null) {
            dto.put("enemyHits", opponent.getSalvos().stream().map(Salvo::salvoHitDTO));
            dto.put("enemySunken", opponent.getSalvos().stream().map(Salvo::salvoSunkenDTO));
        } else {
            // array vacío es mejor para trabajar con forEach en el front end
            // sin necesitar el "if == null"
            dto.put("enemyHits", new ArrayList<>());
            dto.put("enemySunken", new ArrayList<>());
        }

        dto.put("gameState", this.getGameState());

        return dto;
    }
}

