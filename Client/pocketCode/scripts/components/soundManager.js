/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="https://code.createjs.com/createjs-2014.12.12.combined.js" />
'use strict';

PocketCode.SoundManager = (function () {

    //ctr: sounds = [{id: "s12", name:"asd", url:""}, {...}]
    function SoundManager(sounds) {	
		this.init(sounds);
    }

    //methods
    SoundManager.prototype.merge({
        init: function(sounds) {
			this.createjs
        },

        startSound: function (id) {
        },

        pauseSounds: function () {
        },

        resumeSounds: function () {
        },

        stopAllSounds: function () {
        },

        setVolume: function () {
        },
		
        getVolume: function () {
        },
    });

    return SoundManager;
})();

var s = new PocketCode.SoundManager([]);
//x.int