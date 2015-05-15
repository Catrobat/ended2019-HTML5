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


PocketCode.ExecutingState = {   //used for program, sprites and bricks
    STOPPED: 0,
    RUNNING: 1,
    PAUSED: 2  //and running
};

