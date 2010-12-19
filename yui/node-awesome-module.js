YUI.add('node-awesome', function(Y) {

    function awesome() {
        return this.addClass('driller').addClass('centered');
    }

    Y.Node.addMethod('awesome', awesome);
    Y.NodeList.addMethod('awesome', awesome);

}, '0.0.1', {requires: ['node']});