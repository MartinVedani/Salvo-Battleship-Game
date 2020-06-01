package com.mindhub.salvo_game;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

// THIS CLASS IS FOR AUTHENTICATION, (DIFFERENT FROM AUTHORIZATION SET UP
// IN THE WebSecurityConfig CLASS)

// @Configuration tells Spring to create an instance of this class automatically. It can
// then be found and used by the security framework.
@Configuration
public class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

    @Autowired
    PlayerRepository playerRepository;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    //@Autowired
    //PasswordEncoder passwordEncoder;
    // not needed becasue we have @Bean. @Autowired (without @Bean) is used in
    // all other clases that need to encrypt a password. One @Bean in the whole app.
    // @Bean and @Autowired do not mis in the same class.

    @Override
    public void init(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(inputName-> {
            Player player = playerRepository.findPlayerByUsername(inputName);
            if (player != null) {

                if (player.getUsername().equals("j.bauer@ctu.gov")) {
                    return new User(player.getUsername(), player.getPassword(),
                            AuthorityUtils.createAuthorityList("ADMIN"));
                } else {
                    return new User(player.getUsername(), player.getPassword(),
                            AuthorityUtils.createAuthorityList("USER"));
                }

            } else {
                    throw new UsernameNotFoundException("Unknown user: " + inputName);
                }
        });
    }
}