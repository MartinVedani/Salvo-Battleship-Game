package com.mindhub.salvo_game.models;

public final class AppMessage {

    public static final String KEY_ERROR = "error";

    public static final String KEY_SUCCESS = "success";

    public static final String MISSING_DATA = "All fields are mandatory";

    public static final String USER_EXISTS = "Username already exists";

    public static final String GAME_FULL = "Unable to join, the game is full";

    public static final String NOT_AN_OPPONENT = "Unable to join, you cannot play against yourself!";

    public static final String GAME_NOT_FOUND = "Game does not exist";

    public static final String NOT_YOUR_GAME = "This is not your game, it belongs to a different player";

    public static final String NOT_LOGGED_IN = "You are not logged in, please log in to continue.";

    public static final String ALL_SHIPS_IN_PLACE = "All your ships have been placed";

    public static final String SHIPS_MISSING = "Some ships are missing, you must add 5 ships";

    public static final String SHIPS_OUT_OF_RANGE = "Not all your ships fit inside the grid, you have ships out of range";

    public static final String SHIPS_NOT_CONSECUTIVE = "Some of the locations specified for a single ship are not not consecutive";

    public static final String SHIPS_OVERLAP = "Some of the locations specified for your ships are the same, ships cannot overlapped";

    public static final String SHIPS_ADDED = "Ships added successfully!";

    public static final String WRONG_SHOTS = "Wrong number of shots, you can take up to 5";

    public static final String SHOTS_FIRED = "Shots fired successfully!";
}
