package com.mindhub.salvo_game;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

@SpringBootApplication
public class BattleshipApplication {

	public static void main(String[] args) {
		SpringApplication.run(BattleshipApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository, GamePlayerRepository gamePlayerRepository) {
		return (args) -> {
			// save a couple of players
			Player jack = playerRepository.save(new Player("Jack", "Bauer", "j.bauer@ctu.gov"));
			Player chloe = playerRepository.save(new Player("Chloe", "O'Brian","c.obrian@ctu.gov"));
			Player kim = playerRepository.save(new Player("Kim", "Bauer","kim_bauer@gmail.com"));
			Player tony = playerRepository.save(new Player("Tony", "Almeida","t.almeida@ctu.gov"));

			// save a couple of games
			Game game1 = gameRepository.save(new Game(LocalDateTime.now()));
			Game game2 = gameRepository.save(new Game(LocalDateTime.now().plusHours(1)));
			Game game3 = gameRepository.save(new Game(LocalDateTime.now().plusHours(2)));

			// make games
			GamePlayer gp1 = gamePlayerRepository.save(new GamePlayer(game1,jack,LocalDateTime.now()));
			GamePlayer gp2 = gamePlayerRepository.save(new GamePlayer(game1,chloe,LocalDateTime.now()));
			GamePlayer gp3 = gamePlayerRepository.save(new GamePlayer(game2,kim,LocalDateTime.now()));
			GamePlayer gp4 = gamePlayerRepository.save(new GamePlayer(game2,tony,LocalDateTime.now()));
			GamePlayer gp5 = gamePlayerRepository.save(new GamePlayer(game3,jack,LocalDateTime.now()));

		};
	}
}
