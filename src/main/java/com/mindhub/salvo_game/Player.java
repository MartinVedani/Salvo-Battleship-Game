package com.mindhub.salvo_game;

// Los nombre de los paquetes se estila dejarlo en minúscula así no se confunden
// entre los objetos, lo único que tiene que estaren mayúscula en java son las clases.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity // Tells Spring to create a table named Player in the database
public class Player {
//la clase de tipo publica es accesible globalmente. Podría ser "abstracta" si queremos definir los mismos
// atributos y comportamientos que van a ser heredados por varias otras clases hijas reales a ser creadas, por
// ejemplo playersFutbol y playersJockey.

    @Id //Tells Spring to create an Id for each instance (row) in the table con @Gen... parameters
        @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
        @GenericGenerator(name = "native", strategy = "native")
        //Siguen los atributos o propiedades de los objetos pertenecientes a la clase Player
        private long id;
        private String firstName;
        private String lastName;
        private String userName;

    //A continuacion viene el/los Constructor(es): indica con qué propiedades se debe instanciar (inicializar) un
    // objeto perteneciente a esta clase.
    // Puedo tener varios constructores que den flexibliidad en la cantidad y tipo de iniciacion.

    public Player(){} //Primero que nada Spring necesita una instancia vacía para poder trabajar con la base de datos

    public Player(String firstName, String lastName, String userName){
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
    }

    //Es buena práctica que los parametros se llamen igual que las propiedades.
    //Se diferencian porque podemos usar la palabra clave this para hacer refecencia a la clase donde nos encontremos.
    //Mientras que this.firstName hace referencia al atributo (variable) firstName de la clase, firstName hace
    // referencia al parámetro.

    //Se sigue con los Getter & Setter: son métodos que permiten obtener un atributo del objeto (getter) o
    // modificarlo (setter)

    //En Java siempre hay que especificar qué se retorna. get retorna un dato String en este caso.
    public String getFirstName() {
        return firstName;
    }

    //"set" ejecuta un cambio pero no retorna nada por lo que se debe especificar "void".
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    //Otros métodos o comporamientos de los objetos pertenecientes a la clase Player (adoptables por clases hijas).
    // En el siguiente caso el metodos toString() retorna un string con nombe completo y user name:
    public String toString() {
        return firstName + " " + lastName + " " + userName;
    }

    // También puede haber métodos "abstractos" son obligatorios para las clases hijas PERO permiten que una
    // clase hija pueda modificarlos.

}