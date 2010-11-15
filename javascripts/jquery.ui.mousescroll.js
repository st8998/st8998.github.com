(function($) {

    $.widget('ui.mouseScroll', {

        options: {
            scrollRange: null,
            bounceSize: 200.0,
            returnToBaseConst: 1.5,
            decelerationConst: 150.0,
            bounceDecelerationConst: 1500.0,
            animationStep: 10,
            orientation: 'X'
        },

        magic: 1 / 10.0,
        velocity: 0,
        position: 0,
        animationTimer: null,
        currentMousePoint: null,
        mouseDownPoint: null,
        mouseDownPointP: null,
        translatedMouseDownPoint: null,
        moved: false,

        _create: function() {
            if (this.options.orientation == 'X') {
                this.position = this.element.position().left;
                this.element.css('left', 0);
                this._updateView(true);

                if (!this.options.scrollRange) {
                    this.options.scrollRange = this.element.width() - this.element.parent().width();
                }
            } else {
                this.position = this.element.position().top;
                this.element.css('top', 0);
                this._updateView(true);

                if (!this.options.scrollRange) {
                    this.options.scrollRange = this.element.height() - this.element.parent().height();
                }
            }

            this.element.bind('mousedown', function(e) {
                $(this).trigger('mymousedown', [e]);
                return false;
            });

            this.element.bind({
                'mymousedown.pixelwall': $.proxy(this._dragStartListener, this),
                'mouseup.pixelwall': $.proxy(this._dragStopListener, this),
                'mouseleave.pixelwall': $.proxy(this._dragStopListener, this),
                'mousemove.pixelwall': $.proxy(this._dragListener, this)
            });

            this.element.bind('click', $.proxy(function(event) {
                if (this.moved) {
                    return false;
                }
            }, this));
        },

        _dragStartListener: function(stub, event) {
            if (this.animationTimer) this._stopAnimation();
            this.mouseDownPoint = this.options.orientation == 'X' ? event.pageX : event.pageY;
            this.mouseDownPointP = this.options.orientation == 'X' ? event.pageY : event.pageX;
            this.translatedMouseDownPoint = this.mouseDownPoint;
            this.currentMousePoint = this.mouseDownPoint;
            this.velocity = 0;
        },

        _dragStopListener: function(event) {
            if (!this.mouseDownPoint) return;
            this.moved = this.mouseDownPoint != this.currentMousePoint; 
            this.mouseDownPoint = null;
            this.currentMousePoint = null;
            this.translatedMouseDownPoint = null;
            if (this.animationTimer) this._stopAnimation();
            this.animationTimer = setInterval($.proxy(this._updateView, this), this.options.animationStep);
        },

        _dragListener: function(event) {
            if (!this.mouseDownPoint) return;
            var currentMousePoint = this.options.orientation == 'X' ? event.pageX : event.pageY;
            var currentMousePointP = this.options.orientation == 'X' ? event.pageY : event.pageX;
            if (!this.mouseDownPointP || (Math.abs(this.mouseDownPoint - currentMousePoint) - Math.abs(this.mouseDownPointP - currentMousePointP) > 20)) {
                this.mouseDownPointP = null;
                this.element.parent().trigger('mouseleave.pixelwall');
                event.stopPropagation();
                this.currentMousePoint = currentMousePoint;
                this._updateView(true);
            }
        },

        _updateView: function(manualMove) {
            with (this) {
                if (manualMove === true) {
                    // If mouse is still down, just scroll to point
                    velocity = (currentMousePoint - translatedMouseDownPoint) / magic;
                    translatedMouseDownPoint = currentMousePoint;
                } else {
                    if (position > 0) {
                        // Left bound reached
                        if (velocity <= 0) {
                            velocity = -1 * options.returnToBaseConst * Math.abs(position);
                        } else {
                            velocity -= (options.bounceDecelerationConst * magic);
                        }
                    } else if (position < -1 * options.scrollRange) {
                        // Right bound reached
                        if (velocity >= 0) {
                            velocity = options.returnToBaseConst * Math.abs(position + options.scrollRange);
                        } else {
                            velocity += (options.bounceDecelerationConst * magic);
                        }
                    } else {
                        // Free moving. Decelerate gradually
                        var velocityChange = options.decelerationConst * magic;
                        if (velocityChange > Math.abs(velocity)) {
                            velocity = 0;
                            _stopAnimation();
                        } else {
                            velocity -= ((velocity > 0 ? 1 : -1) * velocityChange);
                        }
                    }
                }

                // If scrolled beyond limits, dampen velocity to prevent going beyond bounce limits
                if ((position > 0 && velocity > 0) || (position < -1 * options.scrollRange && velocity < 0)) {
                    velocity *= (1.0 - Math.abs(position > 0 ? position : position + options.scrollRange) / options.bounceSize)
                }

                if (velocity != 0 || manualMove) {
                    // Update position
                    position += Math.round(velocity > 0 ? +1 : -1) * Math.max(Math.abs(velocity * magic), 1);

                    element.trigger('mousescroll', [position,  velocity, options.orientation]);

                    // Update View
                    if (options.orientation == 'X') {
                        element.css('-webkit-transform', 'translate(' + position + 'px, 0)');
                        element.css('-moz-transform', 'translate(' + position + 'px, 0)');
                    } else {
                        element.css('-webkit-transform', 'translate(0,' + position + 'px)');
                        element.css('-moz-transform', 'translate(0,' + position + 'px)');
                    }
                }
            }
        },

        _stopAnimation: function() {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
        },

        scrollTo: function(position) {
            this.position = position;
            this._updateView(true);
        },

        pull: function(velocity) {
            this.velocity = velocity;
            if (this.animationTimer) this._stopAnimation();
            this.animationTimer = setInterval($.proxy(this._updateView, this), this.options.animationStep);
        },

        currentPosition: function() {
            return this.position;
        },

        destroy: function() {
            $.Widget.prototype.destroy.apply(this, arguments);
            this.element.css('-webkit-transform', 'translate(0,0)');
            this.element.css('-moz-transform', 'translate(0,0)');
            this.element.css('left', this.position);
            this.element.unbind('.pixelwall');
        }

    });

})(jQuery);