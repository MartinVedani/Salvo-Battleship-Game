package com.mindhub.salvo_game.repositories;

import com.mindhub.salvo_game.models.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Player findPlayerByUsername(String username);
}
