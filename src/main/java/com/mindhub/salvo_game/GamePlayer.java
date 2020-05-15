package com.mindhub.salvo_game;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
public class GamePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;
    private LocalDateTime joinDate;

    // relacion Many to One con Player. Un GamePlayer tiene un solo Player
    // mientras que un Player puede tener muchos gamePlayers.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id")
    private Player player;

    // relacion Many to One con Game. Un GamePlayer tiene un solo Game
    // mientras que un Game puede tener muchos gamePlayers.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "game_id")
    private Game game;

    public GamePlayer(){}

    public GamePlayer(Game game, Player player, LocalDateTime joinDate) {
        this.joinDate = joinDate;
        this.player = player;
        this.game = game;
    }

    public long getId() {
        return id;
    }

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    // no setter para joinDate por que se especifica solo no hay que modificarlo.

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

    // DTO (data transfer object) para administrar la info de GamePlayer
    public Map<String, Object> gamePlayerDTO(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", this.getId());
        dto.put("joinDate", this.getJoinDate());
        dto.put("player", this.getPlayer().playerDTO());
        return dto;
        // getJoinDate() y getPlayer() fueron creado para ser prolijos, usalos en vez de ir directo a
        // las variables
    }
}

