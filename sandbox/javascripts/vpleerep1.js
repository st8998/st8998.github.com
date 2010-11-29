$(function() {
    var $searchForm = $('form');
    var $workZone = $('#work-zone');

    VK.init({
        apiId: 2023842
    });
    VK.UI.button('login_button');
    VK.Auth.getLoginStatus(function(response) {
        window.userID = response.session.mid;
        console.log('Logged in vkontakte with user id: ' + response.session.mid);
        $searchForm.before('<p>Successfully logged in vkontakte with user id: ' + response.session.mid + '</p>')
        VK.Api.call('audio.get', {}, function(r) {            
            renderTracks(r, $('<h2>Vkontakte saved playlist</h2>').appendTo($workZone));
        });
    });

    function renderTracks(r, $anchor) {
        var tracks = _(r.response).chain().first(20).map(function(track) {
            return '<li><strong>' + track.artist + '</strong> - ' + track.title + '</li>';
        }).value();
        $anchor.after('<ul>' + tracks.join('') + '</ul><div class="more"><button>MORE</button></div>');

    }

    $searchForm.submit(function() {
        var searchTerm = $(this).find('input').val();
        VK.Api.call('audio.search', {q: searchTerm, count: 10}, function(r) {            
            renderTracks(r, $('<h2>Search results for: ' + searchTerm + '</h2>').prependTo($workZone));
        });
        return false;
    });

    $('h2').live('click', function() {
        $(this).next().toggle();
    });

});