$(document).ready(function() {
  var timeoutId = 0;
  var token;

  function prepAuthorize() {
    //Grab the hidden elements containing the values of the id and secret
    var a = $('#a').val();
    var b = $('#b').val();

    //if the elements exist then save their values in local storage
    if (!localStorage.getItem('auth_req_url')) {
      //Use the id and secret to create the base64 string necessary to
      //authenticate
      var requestObject =
        'https://accounts.spotify.com/authorize?' +
        $.param({
          client_id: a,
          response_type: 'code',
          redirect_uri: 'http://localhost:8080',
          scopes: 'user-read-private user-read-email'
        });

      localStorage.setItem('auth_req_url', requestObject);
      localStorage.setItem('auth_creds', btoa(a + ':' + b));
    }

    $('#loginLink').attr('href', localStorage.getItem('auth_req_url'));

    //Remove the elements from the page
    $('#a').remove();
    $('#b').remove();

    getToken();
  }

  function getToken() {
    var params = new URLSearchParams(location.search.slice(1));

    if (params.get('code')) {
      var code = params.get('code');

      localStorage.setItem('s_auth_code', code);

      refreshToken();
    }
  }

  function refreshToken() {
    $.ajax({
      method: 'POST',
      url:
        'https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token',
      data: {
        grant_type: 'authorization_code',
        code: localStorage.getItem('s_auth_code'),
        redirect_uri: 'http://localhost:8080'
      },
      headers: {
        Authorization: 'Basic ' + localStorage.getItem('auth_creds')
      }
    }).then(function(response) {
      //Save the token returned into local storage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    });
  }

  function displayPlaylist(playlist) {
    if (!localStorage.getItem('token')) {
      getToken();
    } else {
      var playlist = $('<iframe>');

      playlist.attr(
        'src',
        'https://open.spotify.com/embed?uri=spotify%3Auser%3Aspotify%3Aplaylist%3A2PXdUld4Ueio2pHcB6sM8j'
      );

      playlist.attr('width', '300');

      playlist.attr('height', '380');

      playlist.attr('frameborder', '0');

      playlist.attr('allowtransparency', 'true');

      $('#playlist-display').append(playlist);
    }
  }

  // $('#playlist').click(function() {
  //   event.preventDefault();
  //   displayPlaylist();
  // });
  // var moods = ['Happy', 'Sad', 'Calm', 'Focus', 'Amp'];

  // var btnContainer = $('.btn-container');

  // for (let i = 0; i < moods.length; i++) {
  //   var mood = moods[i];
  //   var btnWrapper = $("<div class='col-md-2'>");
  //   var moodBtn = $('<button>' + mood + '</button>');

  //   moodBtn.on('click', function(e) {
  //     var moodQuery = $(this).text();
  //     console.log(moodQuery);

  //     var moodPlaylist =
  //       'https://open.spotify.com/embed?uri=spotify%3Auser%3Aspotify%3Aplaylist%3A2PXdUld4Ueio2pHcB6sM8j';

  //     displayPlaylist(moodPlaylist);
  //   });

  //   btnWrapper.append(moodBtn);
  //   btnContainer.append(btnWrapper);
  // }

  //When the page load, execute the authorizeApp function
  prepAuthorize();
});
