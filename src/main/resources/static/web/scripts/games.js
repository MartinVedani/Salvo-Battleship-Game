var url = "http://localhost:8080/api/games";
//if (document.title.includes("Players")) {
//    url = "http://localhost:8080/api/players";
//}

var app = new Vue({
    el: '#app',
    data: {
        games: [],
    },

    created() {
        fetch(url, {
                method: 'GET' //, // or 'PUT'
                // headers: {
                    // 'X-API-Key': '#####',
                //}
            }).then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(json => {
                this.games = json;
            })
    },

    filters: {
      formatDate: function (date) {
          if (date) {
              return moment(String(date)).format('MM/DD/YYYY hh:mm:ss a')
            }
      }
    },
});

// AJAX Feed for developing

$(function() {

  // display text in the output area
  function showOutput(text) {
    $("#output").text(text);
  }

  // load and display JSON sent by server for /games

  function loadData() {
    $.get("/api/games")
    .done(function(data) {
      showOutput(JSON.stringify(data, null, 2));
    })
    .fail(function( jqXHR, textStatus ) {
      showOutput( "Failed: " + textStatus );
    });
  }

  loadData();

});