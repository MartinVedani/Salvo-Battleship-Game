package com.mindhub.salvo_game;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

// THIS CLASS IS FOR AUTHORIZATIONS, (DIFFERENT FROM AUTHENTICATION SET UP
// IN THE WebSecurityConfiguration CLASS)

@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/rest/**").hasAuthority("ADMIN")
                // .antMatchers("/rest/**").denyAll() // no one can  see it.
                .antMatchers("/api/game_view/**","/web/game_view.html").hasAnyAuthority("ADMIN", "USER");

        // "/web/games.html", "/api/games" and "/api/players" have public access rights by omission.

        // http.httpBasic(); BASIC authentication,
        http.formLogin() // form-based authentication
                .usernameParameter("username")
                .passwordParameter("password")
                .loginPage("/api/login");

        http.logout().logoutUrl("/api/logout");

        // turn off checking for CSRF tokens
        http.csrf().disable();

        // if user is not authenticated, just send an authentication failure response
        http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if login is successful, just clear the flags asking for authentication
        http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

        // if login fails, just send an authentication failure response
        http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if logout is successful, just send a success response
        http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
        }
    }
}

// The authorizeRequests() section of the example above says that
//to access any URL starting with "/admin" the user must have the ADMIN role
//to access any other URL, you just need to be logged in with a USER role

// .httpBasic(); BASIC authentication, with rules that limit access to anything to
// authenticated users only.
//BASIC authentication can be used for web services, because that approach does not
// redirect the browser to HTML pages. But BASIC authentication has two disadvantages:

//In order to trigger log in, the user has to first try to access a URL for some protected
// page or some page that does an AJAX call to a protected URL.
//The only way to "log out" with BASIC authentication is to exit the browser. This means
// users are likely to leave themselves logged in, which is a security risk.

// Fortunately, it's possible to use form-based login, but configured to avoid sending any
// HTML to the browser. The key settings that need to change are:

    //Only send an HTTP "unauthorized" response when an unauthenticated user tries to access
    // a protected URL.
    //Only send an HTTP "success" response after a successful POST to the login URL.
    //Only send an HTTP "unauthorized" response when login is not successful.
    //Only send an HTTP "success" response  when the user logs out.

// It's also common with web services to turn off the requirement for CSRF tokens. These are
// additional keys that a server tells a browser to send with authenticated users to prevent
// a form of a attack called Cross-Site Forgery Request. CSRF tokens are disabled because
// supporting them requires a bit of work, and this kind of attack is more typical with
// regular web page browsing.
