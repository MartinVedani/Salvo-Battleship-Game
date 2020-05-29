package com.mindhub.salvo_game;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
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

    public Set<Ship> getShips() {
        return ships;
    }

    public void setShips(Set<Ship> ships) {
        this.ships = ships;
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

    // DTO (data transfer object) para administrar la info de GamePlayer
    public Map<String, Object> gamePlayerDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.id);
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

    public Map<String, Object> gamePlayerViewDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gameId", this.game.getId());
        dto.put("gamePlayers",
                this.game.getGamePlayers().stream().map(GamePlayer::gamePlayerDTO).collect(Collectors.toList()));
        dto.put("ships", this.ships.stream().map(Ship::shipsDTO).collect(Collectors.toList()));
        dto.put("salvos", game.getGamePlayers().stream().flatMap(gamePlayer -> gamePlayer.getSalvos().stream().map(Salvo::salvoDTO)).collect(Collectors.toList()));
        return dto;
    }
}

