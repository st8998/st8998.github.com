(function($) {

    $.widget('ui.mouseScroll', {

        options: {
            scrollRange: null,
            bounceSize: 200.0,
            returnToBaseConst: 1.5,
            decelerationConst: 150.0,
            bounceDecelerationConst: 1500.0,
            animationStep: 10
        },

        magic: 1/10.0,
        velocity: 0,
        position: 0,
        animationTimer: null,
        currentMousePoint: null,
        mouseDownPoint: null,
        translatedMouseDownPoint: null,

        _create: function() {
            this.position = this.element.position().top;
            this.element.css('top', 0);
            this._updateView(true);

            if (!this.options.scrollRange) {
                this.options.scrollRange = this.element.width() - this.element.parent().width();
            }

            this.element.bind({
                'mousedown.pixelwall': $.proxy(this._dragStartListener, this),
                'mouseup.pixelwall': $.proxy(this._dragStopListener, this),
                'mouseleave.pixelwall': $.proxy(this._dragStopListener, this),
                'mousemove.pixelwall': $.proxy(this._dragListener, this)
            });
        },

        _dragStartListener: function(event) {
            if (this.animationTimer) this._stopAnimation();
            this.mouseDownPoint = event.pageY;
            this.translatedMouseDownPoint = this.mouseDownPoint;
            this.currentMousePoint = this.mouseDownPoint;
            this.velocity = 0;
            return false;
        },

        _dragStopListener: function() {
            if (!this.mouseDownPoint) return;
            this.mouseDownPoint = null;
            this.currentMousePoint = null;
            this.translatedMouseDownPoint = null;
            if (this.animationTimer) this._stopAnimation();
            this.animationTimer = setInterval($.proxy(this._updateView, this), this.options.animationStep);
        },

        _dragListener: function(event) {
            if (!this.mouseDownPoint) return;
            this.currentMousePoint = event.pageY;
            this._updateView(true);
        },

        _updateView: function(manualMove) {
            with (this) {
                if (manualMove && mouseDownPoint) {
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

                // Update position
                position += Math.round(velocity > 0 ? +1 : -1) * Math.max(Math.abs(velocity * magic), 1);

                // Update View
                element.css('-webkit-transform', 'translate(0,' + position + 'px)');
                element.css('-moz-transform', 'translate(0,' + position + 'px)');
            }
        },

        _stopAnimation: function() {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
        },

        scroll: function(shift) {
            this.position += shift;
            this._updateView(true);
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