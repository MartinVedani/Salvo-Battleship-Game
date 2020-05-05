package com.mindhub.salvoGame;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BattleshipApplication {

	public static void main(String[] args) {
		SpringApplication.run(BattleshipApplication.class);
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository repository) {
		return (args) -> {
			// save a couple of customers
			repository.save(new Player("Jack", "Bauer", "jack@fakePlayer.com"));
			repository.save(new Player("Chloe", "O'Brian","chloe@fakePlayer.com"));
			repository.save(new Player("Kim", "Bauer","kim@fakePlayer.com"));
			repository.save(new Player("David", "Palmer","david@fakePlayer.com"));
			repository.save(new Player("Michelle", "Dessler", "michelle@fakePlayer.com"));
		};
	}
}
