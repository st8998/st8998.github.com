function ProstopleerPull() {

    var pull = [];

    this.currentPage = 1;

    this.currentSearchTerm = '';

    this.get = function get(searchTerm, n, callback) {
        if (this.currentSearchTerm != searchTerm) {
            pull = [];
            this.currentPage = 1;
            this.currentSearchTerm = searchTerm;
        }
        if (n > pull.length) {
            this.requestMore(function() {
                callback(pull.splice(0, n));
            });
        } else {
            callback(pull.splice(0, n));
        }
    };

    this.requestMore = function(callback) {
        if (this.requestInProgress) {
            this.request.abort();
        }
        this.requestInProgress = true;
        this.request = $.getJSON("http://gateway.heroku.com/pp/search?callback=?",
                {q: this.currentSearchTerm, page: this.currentPage, ref: getRef()},
                $.proxy(function(tracks) {
                    pull = pull.concat(tracks);
                    this.requestInProgress = false;
                    this.currentPage++;
                    if (callback) callback();
                }, this));
    };

    function getRef() {
        return location.href.split('/', 3).join('/');
    }

}