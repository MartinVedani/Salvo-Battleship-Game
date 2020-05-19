package com.mindhub.salvo_game;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.Arrays;

@SpringBootApplication
public class BattleshipApplication {

	public static void main(String[] args) {
		SpringApplication.run(BattleshipApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository,
									  GamePlayerRepository gamePlayerRepository,
									  ShipRepository shipRepository) {
		return (args) -> {
			// make TEST players
			Player jack = playerRepository.save(new Player("Jack", "Bauer", "j.bauer@ctu.gov"));
			Player chloe = playerRepository.save(new Player("Chloe", "O'Brian","c.obrian@ctu.gov"));
			Player kim = playerRepository.save(new Player("Kim", "Bauer","kim_bauer@gmail.com"));
			Player tony = playerRepository.save(new Player("Tony", "Almeida","t.almeida@ctu.gov"));

			// make TEST games
			Game game1 = gameRepository.save(new Game(LocalDateTime.now()));
			Game game2 = gameRepository.save(new Game(LocalDateTime.now().plusHours(1)));
			Game game3 = gameRepository.save(new Game(LocalDateTime.now().plusHours(2)));
			Game game4 = gameRepository.save(new Game(LocalDateTime.now().plusHours(3)));
			Game game5 = gameRepository.save(new Game(LocalDateTime.now().plusHours(4)));
			Game game6 = gameRepository.save(new Game(LocalDateTime.now().plusHours(5)));
			Game game7 = gameRepository.save(new Game(LocalDateTime.now().plusHours(6)));
			Game game8 = gameRepository.save(new Game(LocalDateTime.now().plusHours(7)));

			// make TEST games
			GamePlayer gp1 = gamePlayerRepository.save(new GamePlayer(game1,jack,LocalDateTime.now()));
			GamePlayer gp2 = gamePlayerRepository.save(new GamePlayer(game1,chloe,LocalDateTime.now()));
			GamePlayer gp3 = gamePlayerRepository.save(new GamePlayer(game2,jack,LocalDateTime.now().plusHours(1)));
			GamePlayer gp4 = gamePlayerRepository.save(new GamePlayer(game2,chloe,LocalDateTime.now().plusHours(1)));
			GamePlayer gp5 = gamePlayerRepository.save(new GamePlayer(game3,chloe,LocalDateTime.now().plusHours(2)));
			GamePlayer gp6 = gamePlayerRepository.save(new GamePlayer(game3,tony,LocalDateTime.now().plusHours(2)));
			GamePlayer gp7 = gamePlayerRepository.save(new GamePlayer(game4,chloe,LocalDateTime.now().plusHours(3)));
			GamePlayer gp8 = gamePlayerRepository.save(new GamePlayer(game4,jack,LocalDateTime.now().plusHours(3)));
			GamePlayer gp9 = gamePlayerRepository.save(new GamePlayer(game5,tony,LocalDateTime.now().plusHours(4)));
			GamePlayer gp10 = gamePlayerRepository.save(new GamePlayer(game5,jack,LocalDateTime.now().plusHours(4)));
			GamePlayer gp11 = gamePlayerRepository.save(new GamePlayer(game6,kim,LocalDateTime.now().plusHours(5)));
			GamePlayer gp12 = gamePlayerRepository.save(new GamePlayer(game7,tony,LocalDateTime.now().plusHours(6)));
			GamePlayer gp13 = gamePlayerRepository.save(new GamePlayer(game8,kim,LocalDateTime.now().plusHours(7)));
			GamePlayer gp14 = gamePlayerRepository.save(new GamePlayer(game8,tony,LocalDateTime.now().plusHours(7)));

			// make TEST ships
			Ship ship1 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("H2", "H3", "H4"),gp1));
			Ship ship2 = shipRepository.save(new Ship (Type.Submarine, Arrays.asList("E1","F1","G1"),gp1));
			Ship ship3 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("B4","B5"),gp1));
			Ship ship4 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp2));
			Ship ship5 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("F1","F2"),gp2));
			Ship ship6 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp3));
			Ship ship7 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("C6","C7"),gp3));
			Ship ship8 = shipRepository.save(new Ship (Type.Submarine, Arrays.asList("A2","A3","A4"),gp4));
			Ship ship9 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("G6","H6"),gp4));
			Ship ship10 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp5));
			Ship ship11 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("C6","C7"),gp5));
			Ship ship12 = shipRepository.save(new Ship (Type.Submarine, Arrays.asList("A2","A3","A4"),gp6));
			Ship ship13 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("G6","H6"),gp6));
			Ship ship14 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp7));
			Ship ship15 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("C6","C7"),gp7));
			Ship ship16 = shipRepository.save(new Ship (Type.Submarine, Arrays.asList("A2","A3","A4"),gp8));
			Ship ship17 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("G6","H6"),gp8));
			Ship ship18 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp9));
			Ship ship19 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("C6","C7"),gp9));
			Ship ship20 = shipRepository.save(new Ship (Type.Submarine, Arrays.asList("A2","A3","A4"),gp10));
			Ship ship21 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("G6","H6"),gp10));
			Ship ship22 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp11));
			Ship ship23 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("C6","C7"),gp11));
			Ship ship24 = shipRepository.save(new Ship (Type.Destroyer, Arrays.asList("B5","C5","D5"),gp13));
			Ship ship25 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("C6","C7"),gp13));
			Ship ship26 = shipRepository.save(new Ship (Type.Submarine, Arrays.asList("A2","A3","A4"),gp14));
			Ship ship27 = shipRepository.save(new Ship (Type.Patrol, Arrays.asList("G6","H6"),gp14));
		};
	}
}
