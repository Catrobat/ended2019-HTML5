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

    ExecutingState: {   //used for program, sprites and bricks
        STOPPED: 0,
        RUNNING: 1,
        PAUSED: 3  //and running
    },

    isBrowserCompatible: function () {
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
            //OTHER_TEST: function () {  //TODO: add tests im Browser compatibility is unknown
            //
            //}(),

        };

        return { result: _result, tests: _tests };
    },
});
