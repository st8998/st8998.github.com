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
        this.request = $.get("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fprostopleer.com%2Fsearch%3Fq%3D" + this.currentSearchTerm + "%26page%3D" + this.currentPage + "%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22results%22%5D'",
                $.proxy(function(data) {
                    $(data).find('div.track-wrapper').each(function() {
                        var $in = $(this);
                        pull.push({
                            artist: $in.find('.artist').text(),
                            title: $in.find('.title').text(),
                            time: $in.find('.track-time p').text(),
                            url: 'http://prostopleer.com' + $in.find('div.icon > a').attr('href')
                        });
                    });
                    this.requestInProgress = false;
                    this.currentPage++;
                    if (callback) callback();
                }, this));
    };

}
