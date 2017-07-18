/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.merge({
    Carousel: (function () {
        Carousel.extends(SmartJs.Ui.ContainerControl, false);

        //cntr
        function Carousel(args) {
            SmartJs.Ui.ContainerControl.call(this, args);

            this._interval = 1000;
            this._slides = [];

        }

        //events
        Object.defineProperties(Carousel.prototype, {
        });

        //properties
        Object.defineProperties(Carousel.prototype, {
            slideShowInterval: {
                get: function () {
                    return this._interval;
                },
                set: function (value) {
                    this.stopSlideShow();
                    this._interval = value;
                    this.startSlideShow();
                },
            },
        });

        //methods
        Carousel.prototype.merge({
            startSlideShow: function() {

            },
            stopSlideShow: function() {

            },
            /* override */
            appendChild: function (carouselSlide) {
                if (!(carouselSlide instanceof PocketCode.Ui.CarouselSlide))
                    throw new Error('invalid argument: carousel slide');
                return SmartJs.Ui.ContainerControl.prototype.appendChild.call(carouselSlide);
            },
            insertAt: function (idx, carouselSlide) {
                if (!(carouselSlide instanceof PocketCode.Ui.CarouselSlide))
                    throw new Error('invalid argument: carousel slide');
                return SmartJs.Ui.ContainerControl.prototype.insertAt.call(idx, carouselSlide);
            },
            insertBefore: function (newCarouselSlide, existingCarouselSlide) {
                if (!(newCarouselSlide instanceof PocketCode.Ui.CarouselSlide) || !(existingCarouselSlide instanceof PocketCode.Ui.CarouselSlide))
                    throw new Error('invalid argument: carousel slide');
                return SmartJs.Ui.ContainerControl.prototype.insertBefore.call(newCarouselSlide, existingCarouselSlide);
            },
            insertAfter: function (newCarouselSlide, existingCarouselSlide) {
                if (!(newCarouselSlide instanceof PocketCode.Ui.CarouselSlide) || !(existingCarouselSlide instanceof PocketCode.Ui.CarouselSlide))
                    throw new Error('invalid argument: carousel slide');
                return SmartJs.Ui.ContainerControl.prototype.insertAfter.call(newCarouselSlide, existingCarouselSlide);
            },
            replaceChild: function (newCarouselSlide, existingCarouselSlide) {
                if (!(newCarouselSlide instanceof PocketCode.Ui.CarouselSlide) || !(existingCarouselSlide instanceof PocketCode.Ui.CarouselSlide))
                    throw new Error('invalid argument: carousel slide');
                return SmartJs.Ui.ContainerControl.prototype.replaceChild.call(newCarouselSlide, existingCarouselSlide);
            },
            removeChild: function (carouselSlide) {
                if (!(carouselSlide instanceof PocketCode.Ui.CarouselSlide))
                    throw new Error('invalid argument: carousel slide');
                return SmartJs.Ui.ContainerControl.prototype.removeChild.call(carouselSlide);
            },
        });

        return Carousel;
    })(),

    CarouselSlide: (function () {
        CarouselSlide.extends(SmartJs.Ui.Control, false);

        //cntr
        function CarouselSlide(args) {
            SmartJs.Ui.Control.call(this, args);

        }

        //properties
        Object.defineProperties(CarouselSlide.prototype, {
        });

        //methods
        CarouselSlide.prototype.merge({
        });

        return Carousel;
    })(),

});
