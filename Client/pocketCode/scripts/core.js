/// <reference path="../../../smartJs/sj.js" />
'use strict';

/**
 * PocketCode Core Namespace
 * @namespace PocketCode
 */
if (!PocketCode)
    var PocketCode = {};

/**
 * @namespace Model
 * @type {{}|*}
 */
PocketCode.Model = {};  //PocketCode.Model || {};


PocketCode.merge({

    ExecutionState: {   //used for program and bricks (sprites are UI Objects.. they do not have an executing state)
        STOPPED: 0,
        RUNNING: 1,
        PAUSED: 3,  //and running
        ERROR: 4,
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
            json: function () {
                if (JSON && typeof JSON.parse === 'function')
                    return true;

                _result = _full = false;
                return false;
            }(),
            direction: function () {
                var tbl = document.createElement('div');
                tbl.style.merge({ display: 'table' });
                var left = document.createElement('div');
                left.style.merge({ height: '10px', width: '10px', display: 'table-cell' });
                var right = document.createElement('div');
                right.style.merge({ height: '10px', width: '10px', display: 'table-cell' });
                tbl.appendChild(left);
                tbl.appendChild(right);
                document.body.appendChild(tbl);
                var xl = left.getBoundingClientRect().left;
                var xr = right.getBoundingClientRect().left;
                tbl.style.direction = 'RTL';
                var xl_ = left.getBoundingClientRect().left;
                var xr_ = right.getBoundingClientRect().left;
                document.body.removeChild(tbl);

                if (xr === xl_ && xl === xr_)
                    return true;

                _result = _full = false;
                return false;
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
