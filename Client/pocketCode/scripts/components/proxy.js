﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode._serviceEndPoint = '';    //TODO:
PocketCode.Services = {
    PROJETCS: 'projects/',
    I18N: 'i18n',
    TTS: 'tts',
    //TODO:
};

PocketCode.Proxy = new ((function () {
    function Proxy(totalCount) {
        this._total = totalCount;
        this._parsed = 0;

        this._updatePercentage = 0;
        this._onProgressChange = new SmartJs.Event.Event(this);

    }

    //events
    Object.defineProperties(Proxy.prototype, {
        onProgressChange: {
            get: function () { return this._onProgressChange; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    Proxy.prototype.merge({
        getServiceEndpoint: function (service) {
            if (!service)
                return PocketCode._serviceEndPoint;
            else
                return PocketCode._serviceEndPoint + service;
        },
        create: function (jsonBrick) {
            var type = jsonBrick.type;
            var brick = new PocketCode.Bricks[type + 'Brick'](jsonBrick);   //TODO: BrickFactory???

            //trigger event
            this._parsed++;
            this._updateProgress();
            if (jsonBrick.bricks)   //all loops
                brick.bricks = this._createList(jsonBrick.bricks);
            else if (brick.ifBricks && brick.elseBricks) {  //if then else
                brick.ifBricks = this._createList(jsonBrick.ifBricks);
                brick.elseBricks = this._createList(jsonBrick.elseBricks);
            }

            return brick;
        },
    });

    return Proxy;
})());