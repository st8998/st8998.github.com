function ShotsPull() {

    var shots = [];

    this.currentPage = 1;
    this.requestAmount = 30;

    this.get = function(n, callback) {
        if (shots.length - n < this.requestAmount * 2) {
            this.requestMore(function(shots) {
                callback(shots.splice(0, n));
            });
        } else {
            callback(shots.splice(0, n));
        }
    };

    this.requestMore = function(callback) {
        if (!this.requestInProgress) {
            this.requestInProgress = true;
            $.getJSON('http://api.dribbble.com/shots/popular?callback=?', {per_page: this.requestAmount, page: this.currentPage}, $.proxy(function(data) {
                shots = shots.concat(data.shots);
                this.requestInProgress = false;
                this.currentPage++;
                if (callback) callback(shots);
                if (shots.length < this.requestAmount * 2) {
                    this.requestMore();
                }
            }, this));
        }
    };

}
