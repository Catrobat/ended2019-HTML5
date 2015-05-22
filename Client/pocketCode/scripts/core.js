/// <reference path="../../../smartJs/sj.js" />
'use strict';

/**
 * PocketCode Core Namespace
 * @namespace PocketCode
 */
if (!PocketCode)
    var PocketCode = {};

/**
 * PocketCode User Interface Namespace
 * @namespace PocketCode.Ui
 */
PocketCode.Ui = {};


PocketCode.merge({

    ExecutionState: {   //used for program and bricks (sprites are UI Objects.. they do not have an executing state)
        STOPPED: 0,
        RUNNING: 1,
        PAUSED: 3  //and running
    },

    isPlayerCompatible: function () {
        var _result = true;
        var _full = true;
        var _tests = {
            SmartJs: function () {
                var bc = SmartJs.isBrowserCompatible();
                if (!bc.result) {
                    _result = _full = false;
                    return false;
                }
                return true;
            }(),
            pushState: function () {
                if (!history.pushState) {
                    _result = _full = false;
                    return false;
                }
                return true;
            }(),
            //sound: function () {  //TODO: check sound support
            //    if (!createjs.Sound.initializeDefaultPlugins()) {
            //        _result = true;
            //        _full = false;
            //        return false;
            //    }
            //    return true;
            //}(),
            //OTHER_TEST: function () {  //TODO: add tests im Browser compatibility is unknown
            //
            //}(),

        };

        return { result: _result, full: _full, tests: _tests };
    },
});
