(function ($) {

    var PPSliderClass = function (el, opts) {
        var element = $(el);
        var options = opts;
        var isMouseDown = false;
        var currentVal = 0;

        element.wrap('<div/>')
        var container = $(el).parent();

        container.addClass('pc-slider');
        container.addClass('clearfix');

        container.append('<div class="pc-slider-min">-</div><div class="pc-slider-scale"><div class="pc-slider-button"><div class="pc-slider-divies"></div></div><div class="pc-slider-tooltip"></div></div><div class="pc-slider-max">+</div>');

        if (typeof (options) != 'undefined' && typeof (options.hideTooltip) != 'undefined' && options.hideTooltip == true) {
            container.find('.pc-slider-tooltip').hide();
        }

        if (typeof (options.width) != 'undefined') {
            container.css('width', (options.width + 'px'));
        }
        container.find('.pc-slider-scale').css('width', (container.width() - 30) + 'px');

        var startSlide = function (e) {

            isMouseDown = true;
            var pos = getMousePosition(e);
            startMouseX = pos.x;

            lastElemLeft = ($(this).offset().left - $(this).parent().offset().left);
            updatePosition(getMousePosition(e));//e);

            return false;
        };

        var getMousePosition = function (e) {
            //container.animate({ scrollTop: rowHeight }, options.scrollSpeed, 'linear', ScrollComplete());
            var posx = 0;
            var posy = 0;

            if (!e) var e = window.event;

            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return { x: posx, y: posy };
        };

        var updatePosition = function (pos){//e) {
            //var pos = getMousePosition(e);

            var spanX = (pos.x - startMouseX);

            var newPos = (lastElemLeft + spanX)
            var upperBound = (container.find('.pc-slider-scale').width() - container.find('.pc-slider-button').width());
            newPos = Math.max(0, newPos);
            newPos = Math.min(newPos, upperBound);
            currentVal = Math.round((newPos / upperBound) * 100, 0);

            container.find('.pc-slider-button').css("left", newPos);
            container.find('.pc-slider-tooltip').html(currentVal + '%');
            container.find('.pc-slider-tooltip').css('left', newPos - 6);
        };

        var moving = function (e) {
            if (isMouseDown) {
                updatePosition(getMousePosition(e));//e);
                return false;
            }
        };

        var dropCallback = function (e) {
            isMouseDown = false;
            element.val(currentVal);
            if (typeof element.options != 'undefined' && typeof element.options.onChanged == 'function') {
                element.options.onChanged.call(this, null);
            }

        };

        container.find('.pc-slider-button').bind('mousedown', startSlide);

        $(document).mousemove(function (e) { moving(e); });
        $(document).mouseup(function (e) { dropCallback(e); });

    };

    /*******************************************************************************************************/

    $.fn.PPSlider = function (options) {
        var opts = $.extend({}, $.fn.PPSlider.defaults, options);

        return this.each(function () {
            new PPSliderClass($(this), opts);
        });
    }

    $.fn.PPSlider.defaults = {
        width: 150
    };


})(jQuery);

window.onload = function () {
    $("#slider1").PPSlider({ width: 300 });
};