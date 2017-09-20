/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="../model/bricksCore.js" />
/// <reference path="../model/bricksEvent.js" />
/// <reference path="../model/bricksControl.js" />
/// <reference path="../model/bricksSound.js" />
/// <reference path="../model/bricksMotion.js" />
/// <reference path="../model/bricksPen.js" />
/// <reference path="../model/bricksData.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="../component/sprite.js" />
'use strict';

PocketCode.merge({

    SpriteFactory: (function () {
        SpriteFactory.extends(SmartJs.Core.Component);

        function SpriteFactory(device, gameEngine, soundMgr, minLoopCycleTime) {
            this._device = device;
            this._gameEngine = gameEngine;
            this._soundMgr = soundMgr;
            this._minLoopCycleTime = minLoopCycleTime || 20;

            this._unsupportedBricks = [];

            //we use the brickFactory events here
            this._onSpriteLoaded = new SmartJs.Event.Event(this);
            this._onUnsupportedBricksFound = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(SpriteFactory.prototype, {
            onSpriteLoaded: {
                get: function () { return this._onSpriteLoaded; },
            },
            onUnsupportedBricksFound: {
                get: function () { return this._onUnsupportedBricksFound; },
            },
        });

        //methods
        SpriteFactory.prototype.merge({
            create: function (currentScene, broadcastMgr, /*bricksLoaded,*/ jsonSprite, asBackground) {
                if (!(currentScene instanceof PocketCode.Model.Scene))
                    throw new Error('invalid argument: current scene');
                if (!(broadcastMgr instanceof PocketCode.BroadcastManager))
                    throw new Error('invalid argument: broadcast manager');
                if (typeof jsonSprite !== 'object' || jsonSprite instanceof Array)
                    throw new Error('invalid argument: expected type: object');

                //this._bricksLoaded = 0;
                this._unsupportedBricks = [];
                //bricksLoaded = bricksLoaded || 0;
                var brickFactory = new PocketCode.BrickFactory(this._device, this._gameEngine, currentScene, broadcastMgr, this._soundMgr, /*this._bricksTotal, bricksLoaded,*/ this._minLoopCycleTime);
                //brickFactory.onProgressChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onProgressChange.dispatchEvent(e); }, this));
                brickFactory.onUnsupportedBrickFound.addEventListener(new SmartJs.Event.EventListener(function (e) { this._unsupportedBricks.push(e.unsupportedBrick); }, this));

                var sprite = asBackground ?
                    new PocketCode.Model.BackgroundSprite(this._gameEngine, currentScene, jsonSprite) :
                    new PocketCode.Model.Sprite(this._gameEngine, currentScene, jsonSprite);
                var scripts = [];
                for (var i = 0, l = jsonSprite.scripts.length; i < l; i++)
                    scripts.push(brickFactory.create(sprite, jsonSprite.scripts[i]));

                //this._bricksLoaded += brickFactory.bricksParsed;
                sprite.scripts = scripts;

                this._onSpriteLoaded.dispatchEvent({ bricksLoaded: brickFactory.bricksParsed });
                brickFactory.dispose();
                if (this._unsupportedBricks.length > 0)
                    this._onUnsupportedBricksFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });
                return sprite;
            },
            createClone: function (currentScene, broadcastMgr, jsonSprite, definition) {
                if (!(currentScene instanceof PocketCode.Model.Scene))
                    throw new Error('invalid argument: current scene');
                if (!(broadcastMgr instanceof PocketCode.BroadcastManager))
                    throw new Error('invalid argument: broadcast manager');
                if (typeof jsonSprite !== 'object' || jsonSprite instanceof Array)
                    throw new Error('invalid argument: expected type: object');

                var brickFactory = new PocketCode.BrickFactory(this._device, this._gameEngine, currentScene, broadcastMgr, this._soundMgr, /*this._bricksTotal, 0,*/ this._minLoopCycleTime);
                var clone = new PocketCode.Model.SpriteClone(this._gameEngine, currentScene, jsonSprite, definition);
                var scripts = [];
                for (var i = 0, l = jsonSprite.scripts.length; i < l; i++)
                    scripts.push(brickFactory.create(clone, jsonSprite.scripts[i]));

                brickFactory.dispose();
                clone.scripts = scripts;
                return clone;
            },
            dispose: function () {
                this._device = undefined;
                this._gameEngine = undefined;
                this._soundMgr = undefined;
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return SpriteFactory;
    })(),


    BrickFactory: (function () {
        BrickFactory.extends(SmartJs.Core.Component);

        function BrickFactory(device, gameEngine, scene, broadcastMgr, soundMgr, minLoopCycleTime) {
            this._device = device;
            this._gameEngine = gameEngine;
            this._scene = scene;
            this._broadcastMgr = broadcastMgr;
            this._soundMgr = soundMgr;
            this._minLoopCycleTime = minLoopCycleTime;

            //this._total = totalCount;
            this._parsed = 0;//loadedCount;
            //this._updatePercentage = 0.0;
            //this._unsupportedBricks = [];

            //this._onProgressChange = new SmartJs.Event.Event(this);
            this._onUnsupportedBrickFound = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(BrickFactory.prototype, {
            //onProgressChange: {
            //    get: function () { return this._onProgressChange; },
            //    //enumerable: false,
            //    //configurable: true,
            //},
            onUnsupportedBrickFound: {
                get: function () { return this._onUnsupportedBrickFound; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //properties
        Object.defineProperties(BrickFactory.prototype, {
            bricksParsed: {
                get: function () { return this._parsed; },
            },
        });

        //methods
        BrickFactory.prototype.merge({
            create: function (currentSprite, jsonBrick) {
                if (jsonBrick.id && jsonBrick.type !== 'UserScript')
                    this._currentScriptId = jsonBrick.id;
                var type = jsonBrick.type + 'Brick';
                var brick = undefined;

                switch (type) {
                    //not yet planed?:
                    //case 'ResetTimerBrick':
                    //    brick = new PocketCode.Model[type](this._device, currentSprite, this._gameEngine.projectTimer, jsonBrick);
                    //    break;
                    //case 'SetCameraTransparencyBrick':  //add scene to cntr - access background

                    //not part of current Android release:
                    //case 'UserScriptBrick':
                    //case 'CallUserScriptBrick':

                    //in development:
                    case 'SetRotationSpeedBrick': //including CCW 

                    case 'WhenCollisionBrick':
                    case 'SetPhysicsObjectTypeBrick':
                    case 'SetVelocityBrick':
                    case 'SetGravityBrick':
                    case 'SetMassBrick':
                    case 'SetBounceFactorBrick':
                    case 'SetFrictionBrick':

                    case 'SelectCameraBrick':
                    case 'CameraBrick':

                    //bubbles   -> currently not supported
                    case 'SayBrick':
                    case 'SayForBrick':
                    case 'ThinkBrick':
                    case 'ThinkForBrick':

                        brick = new PocketCode.Model.UnsupportedBrick(this._device, currentSprite, jsonBrick);
                        break;
                        //    //^^ in development: delete/comment out bricks for testing purpose (but do not push these changes until you've finished implementation + testing)

                        //active:
                    case 'SetPhysicsObjectTypeBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene.physicsWorld, jsonBrick);
                        break;

                    case 'WhenProgramStartBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onStart);
                        break;

                    case 'WhenActionBrick': //handling several actions: ("video motion", "timer", "loudness",) "spriteTouched", "screenTouched"
                        var actions = {};
                        actions[PocketCode.UserActionType.SPRITE_TOUCHED] = this._scene.onSpriteTappedAction;
                        actions[PocketCode.UserActionType.TOUCH_START] = this._scene.onTouchStartAction;

                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, actions);
                        break;

                    case 'CloneBrick':
                    case 'DeleteCloneBrick':
                    case 'ClearBackgroundBrick':
                    case 'GoToBrick':
                    case 'AskSpeechBrick':
                    case 'AskBrick':
                    case 'AskSpeechBrick':
                        if (type == 'AskSpeechBrick')  //providing a ask dialog instead the typical askSpeech brick
                            type = 'AskBrick';
                        //background
                    case 'SetBackgroundBrick':
                    case 'SetBackgroundByIndexBrick':
                    case 'WhenBackgroundChangesToBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, jsonBrick);
                        break;

                    case 'BroadcastBrick':
                    case 'WhenBroadcastReceiveBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._broadcastMgr, jsonBrick);
                        break;

                    case 'PlaySoundBrick':
                    case 'StopAllSoundsBrick':
                    case 'SpeakBrick':
                        if (jsonBrick.andWait)  //handles (currently) both: playSoundAndWait + SpeakAndWait
                            break;
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene.id, this._soundMgr, jsonBrick);
                        break;

                    case 'SetVolumeBrick':
                    case 'ChangeVolumeBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._soundMgr, jsonBrick);
                        break;

                    case 'MoveNStepsBrick':
                    case 'WaitUntilBrick':
                    case 'ForeverBrick':
                    case 'RepeatBrick':
                    case 'RepeatUntilBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._minLoopCycleTime, jsonBrick);
                        break;

                    case 'WhenConditionMetBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._minLoopCycleTime, jsonBrick, this._scene.onStart);
                        break;
                        
                    case 'StartSceneBrick':
                    case 'SceneTransitionBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._gameEngine, jsonBrick);
                        break;

                    case 'StopBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, this._currentScriptId, jsonBrick);
                        break;

                        //control: WaitBrick, NoteBrick, WhenStartAsCloneBrick, IfThenElse
                        //motion: GoToPositionBrick, SetXBrick, SetYBrick, ChangeXBrick, ChangeYBrick, SetRotionStyleBrick, IfOnEdgeBounce
                        //        TurnLeft, TurnRight, SetDirection, SetDirectionTo, SetRotationStyle, GlideTo, GoBack, ComeToFront, Vibration
                        //motion physics: SetVelocity, RotationSpeedLeft, RotationSpeedRight, SetMass, SetBounceFactor, SetFriction
                        //look: SetLook, SetLookByIndex, NextLook, PreviousLook, SetSize, ChangeSize, Hide, Show, Say, SayFor, Think, ThinkFor, SetTransparency,
                        //      .. all filters, .. ClearGraphicEffect
                        //pen: PenDown, PenUp, SetPenSize, SetPenColor, Stamp
                        //data: SetVariable, ChangeVariable, ShowVariable, HideVariable, AppendToList, DeleteAtList, InsertAtList, ReplaceAtList
                    default:
                        if (PocketCode.Model[type])
                            brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        else
                            brick = new PocketCode.Model.UnsupportedBrick(this._device, currentSprite, jsonBrick);
                }

                if (brick instanceof PocketCode.Model.UnsupportedBrick) {
                    //this._unsupportedBricks.push(brick);
                    this._onUnsupportedBrickFound.dispatchEvent({ unsupportedBrick: brick });
                }
                else {
                    //load sub bricks
                    //if (!(brick instanceof PocketCode.Model.UnsupportedBrick)) {
                    if (jsonBrick.bricks) { //all loops
                        brick._bricks = this._createList(currentSprite, jsonBrick.bricks);
                    }
                    else if (jsonBrick.ifBricks) {  // && jsonBrick.elseBricks) {  //if then else
                        brick._ifBricks = this._createList(currentSprite, jsonBrick.ifBricks);
                        brick._elseBricks = this._createList(currentSprite, jsonBrick.elseBricks);
                    }
                }

                this._parsed++; //this has to be incremented after creating the sub items to avoid the unsupported brick event trigger more than once
                //this._updateProgress();

                //if (this._total === this._parsed && this._unsupportedBricks.length > 0)
                //    this._onUnsupportedBricksFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });

                return brick;
            },
            _createList: function (currentSprite, jsonBricks) {    //returns bricks as a BrickContainer
                var bricks = [];
                for (var i = 0, l = jsonBricks.length; i < l; i++)
                    bricks.push(this.create(currentSprite, jsonBricks[i]));
                return new PocketCode.Model.BrickContainer(bricks);
            },
            //_updateProgress: function () {
            //    var progress = 100.0 / this._total * this._parsed;
            //    //we do not want to trigger several hundred progress updates.. every 5% should be enough
            //    //todo introduce new condition to update
            //    //if (this._total === this._parsed || (progress - this._updatePercentage) >= 5.0) {
            //    this._updatePercentage = progress;
            //    progress = Math.round(progress * 10) / 10;  //show only one decimal place
            //    this._onProgressChange.dispatchEvent({ progress: progress, parsed: this._parsed });
            //    // }

            //},
            dispose: function () {
                this._device = undefined;
                this._gameEngine = undefined;
                this._scene = undefined;
                this._broadcastMgr = undefined;
                this._soundMgr = undefined;
                SmartJs.Core.Component.prototype.dispose.call(this);
            }
        });

        return BrickFactory;
    })(),


    FormulaParser: (function () {
        function FormulaParser() {
            this._isStatic = false;
        }

        FormulaParser.prototype.merge({
            //todo geti18nJson function statt getUiString
            //return: object statt string

            parsei18nJson: function(jsonFormula, variableNames, listNames){
                if (typeof variableNames !== 'object')
                    throw new Error('invalid argument: variableNames (lookup dictionary required)');
                if (typeof listNames !== 'object')
                    throw new Error('invalid argument: listNames (lookup dictionary required)');
                this._variableNames = variableNames;
                this._listNames = listNames;

                return this._parseJsonType(jsonFormula, true);
            },/*
            getUiString: function (jsonFormula, variableNames, listNames) {
                if (typeof variableNames !== 'object')
                    throw new Error('invalid argument: variableNames (lookup dictionary required)');
                if (typeof listNames !== 'object')
                    throw new Error('invalid argument: listNames (lookup dictionary required)');
                this._variableNames = variableNames;
                this._listNames = listNames;

                return this._parseJsonType(jsonFormula, true);
            },*/
            parseJson: function (jsonFormula) {
                this._isStatic = true;
                var formulaString = this._parseJsonType(jsonFormula);
                return {
                    calculate: new Function(
                        'uvh',
                        'uvh || (uvh = this._sprite); ' +
                        'return ' + formulaString + ';'),
                    isStatic: this._isStatic
                };
            },

            _parseJsonType: function (jsonFormula, asUiObject) {
                if (jsonFormula === null){
                    if(asUiObject)
                        return;
                    else
                        return '';
                }


                /* package org.catrobat.catroid.formulaeditor: class FormulaElement: enum ElementType
                *  OPERATOR, FUNCTION, NUMBER, SENSOR, USER_VARIABLE, BRACKET, STRING, COLLISION_FORMULA
                */
                switch (jsonFormula.type) {
                    case 'OPERATOR':
                        return this._parseJsonOperator(jsonFormula, asUiObject);

                    case 'FUNCTION':
                        return this._parseJsonFunction(jsonFormula, asUiObject);

                    case 'NUMBER':
                        if (asUiObject) {
                            jsonFormula.left = jsonFormula.right = undefined;
                            return jsonFormula;
                        }

                        var num = Number(jsonFormula.value);
                        if (isNaN(num))
                            throw new Error('invalid operator/type \'number\': string to number conversion failed');
                        return num;

                    case 'SENSOR':
                        this._isStatic = false;
                        return this._parseJsonSensor(jsonFormula, asUiObject);

                    case 'USER_VARIABLE':
                        if (asUiObject) {
                            var variable;

                            if(this._variableNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] != undefined){
                                variable = this._variableNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value]
                                jsonFormula.objRef = {};
                                jsonFormula.objRef.type = PocketCode.UserVariableScope.PROCEDURE;
                                //jsonFormula.objRef.name = variable.name;
                                jsonFormula.objRef.id = variable._id;
                            }
                            else if(this._variableNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] != undefined){
                                jsonFormula.objRef = {};
                                variable =  this._variableNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value];
                                jsonFormula.objRef.type = PocketCode.UserVariableScope.LOCAL;
                                //jsonFormula.objRef.name = variable.name;
                                jsonFormula.objRef.id = variable._id;
                            }
                            else if(this._variableNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value] != undefined){
                                jsonFormula.objRef = {};
                                variable = this._variableNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                                jsonFormula.objRef.type = PocketCode.UserVariableScope.GLOBAL;
                                //jsonFormula.objRef.name = variable.name;
                                jsonFormula.objRef.id = variable._id;
                            }
                            jsonFormula.left = undefined;
                            jsonFormula.right = undefined;
                            return jsonFormula;
                        }
                        this._isStatic = false;
                        return 'uvh.getVariable("' + jsonFormula.value + '").value';

                    case 'USER_LIST':
                        if (asUiObject) {
                            var list;

                            if(this._listNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] != undefined){
                                list = this._listNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value]
                                jsonFormula.objRef = {};
                                jsonFormula.objRef.type = PocketCode.UserVariableScope.PROCEDURE;
                                //jsonFormula.objRef.name = list.name;
                                jsonFormula.objRef.id = list._id;
                            }
                            else if(this._listNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] != undefined){
                                list =  this._listNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value];
                                jsonFormula.objRef = {};
                                jsonFormula.objRef.type = PocketCode.UserVariableScope.LOCAL;
                                //jsonFormula.objRef.name = list.name;
                                jsonFormula.objRef.id = list._id;
                            }
                            else if(this._listNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value] != undefined){
                                list = this._listNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                                jsonFormula.objRef = {};
                                jsonFormula.objRef.type = PocketCode.UserVariableScope.GLOBAL;
                                //jsonFormula.objRef.name = list.name;
                                jsonFormula.objRef.id = list._id;
                            }
                            jsonFormula.left = undefined;
                            jsonFormula.right = undefined;
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return 'uvh.getList("' + jsonFormula.value + '")';

                    case 'BRACKET':
                        if(asUiObject){
                            jsonFormula.right = this._parseJsonType(jsonFormula.right, asUiObject);
                            return jsonFormula;
                        }
                        return '(' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                    case 'STRING':
                        if (asUiObject){
                            jsonFormula.left = jsonFormula.right = undefined;
                            return jsonFormula;
                        }
                        //return '\'' + jsonFormula.value.replace(/('|\n|\\)/g, '\\\$1') + '\'';
                        return '\'' + jsonFormula.value.replace(/'/g, '\\\'').replace(/\n/g, '\\n') + '\'';

                    case 'COLLISION_FORMULA':
                            if (uiString) {
                                jsonFormula.objRef = {};
                                jsonFormula.objRef.id = jsonFormula.value;
                                return jsonFormula;
                            }

                        this._isStatic = false;
                        //changed backend to deliver ids instead of names
                        return 'this._sprite.collidesWithSprite(\'' + jsonFormula.value + '\')';

                        //var params = jsonFormula.value.split(' touches ');  //either 'sp1 touches sp2' (v0.992= or 'sp1' (v0.993 - ?)
                        //if (params.length == 1) { //v0.993
                        //    if (uiString)
                        //        return 'touches_object(' + jsonFormula.value + ')';

                        //    return 'this._sprite.collidesWithSprite(\'' + params[0] + '\')';
                        //}
                        //else if (params.length == 2) { //v0.992
                        //    if (uiString)
                        //        return '\'' + jsonFormula.value + '\'';

                        //    return 'this._sprite.collidesWithSprite(\'' + params[1] + '\')';
                        //}
                        //else { //not supported
                        //    if (uiString)
                        //        return '\'' + jsonFormula.value + '\'';
                        //    return 'false';
                        //}

                    default:
                        throw new Error('formula parser: unknown type: ' + jsonFormula.type);     //TODO: do we need an onError event? -> new and unsupported operators?
                }
            },

            _concatOperatorFormula: function (jsonFormula, operator) {
                return '(' + this._parseJsonType(jsonFormula.left) + operator + this._parseJsonType(jsonFormula.right) + ')';
            },
            _addKeyRecursive: function (jsonFormula, i18nKey) {
                jsonFormula.i18nKey = i18nKey;
                jsonFormula.left = this._parseJsonType(jsonFormula.left, true);
                jsonFormula.right = this._parseJsonType(jsonFormula.right, true);
            },
            _parseJsonOperator: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Operators */
                switch (jsonFormula.value) {
                    case 'LOGICAL_AND':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_and');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' && ');

                    case 'LOGICAL_OR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_or');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' || ');

                    case 'EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_equal');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' == ');

                    case 'NOT_EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_notequal');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' != ');

                    case 'SMALLER_OR_EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_leserequal');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' <= ');

                    case 'GREATER_OR_EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_greaterequal');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' >= ');

                    case 'SMALLER_THAN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_lesserthan');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' < ', asUiObject);

                    case 'GREATER_THAN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_greaterthan');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' > ', asUiObject);

                    case 'PLUS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_plus');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' + ', asUiObject, true);

                    case 'MINUS':
                        if (asUiObject){
                            //todo: left === null?
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_minus');
                            return jsonFormula;
                        }
                        if (jsonFormula.left === null)    //singed number
                            return this._concatOperatorFormula(jsonFormula, '-', asUiObject);
                        return this._concatOperatorFormula(jsonFormula, ' - ', asUiObject, jsonFormula.left !== null);

                    case 'MULT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_mult');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' * ', asUiObject, true);

                    case 'DIVIDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_divide');
                            return jsonFormula;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' / ', asUiObject, true);

                    case 'LOGICAL_NOT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_not');
                            return jsonFormula;
                        }
                        return '!' + this._parseJsonType(jsonFormula.right);

                    default:
                        throw new Error('formula parser: unknown operator: ' + jsonFormula.value);  //TODO: do we need an onError event? -> new and unsupported operators?
                }
            },
            _parseJsonFunction: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Functions
                *  SIN, COS, TAN, LN, LOG, PI, SQRT, RAND, ABS, ROUND, MOD, ARCSIN, ARCCOS, ARCTAN, EXP, FLOOR, CEIL, MAX, MIN, TRUE, FALSE, LENGTH, LETTER, JOIN;
                */
                switch (jsonFormula.value) {
                    case 'SIN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_sin'); //add brackets in UI
                            return jsonFormula;
                        }
                        return 'Math.sin(this._degree2radian(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'COS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_cos');
                            return jsonFormula;
                        }
                        return 'Math.cos(this._degree2radian(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'TAN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_tan');
                            return jsonFormula;
                        }
                        return 'Math.tan(this._degree2radian(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'LN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_ln');
                            return jsonFormula;
                        }
                        return 'Math.log(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'LOG':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_log');
                            return jsonFormula;
                        }
                        return 'this._log10(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'PI':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_pi');
                            return jsonFormula;
                        }
                        return 'Math.PI';

                    case 'SQRT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_sqrt');
                            return jsonFormula;
                        }
                        return 'Math.sqrt(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'RAND':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_rand');
                            return jsonFormula;
                        }
                        this._isStatic = false;
                        //please notice: this function is quite tricky, as the 2 parametes can be switched (min, max) and we need to calculate this two values
                        //at runtime to determine which one to use
                        //if both partial results are integers, the random number will be a number without decimal places
                        //for calculation we need the scope of the formula itself! To solve this, the whole logic is included in our dynamic function
                        var lString = '(' + this._parseJsonType(jsonFormula.left) + ')';
                        var rString = '(' + this._parseJsonType(jsonFormula.right) + ')';

                        var stmt = '((' + lString + ' <= ' + rString + ') ? ';
                        stmt += '((' + lString + ' % 1 === 0 && ' + rString + ' % 1 === 0) ? (Math.floor(Math.random() * (' + rString + '+ 1 -' + lString + ') + ' + lString + ')) : (Math.random() * (' + rString + '-' + lString + ') + ' + lString + ')) : ';
                        stmt += '((' + lString + ' % 1 === 0 && ' + rString + ' % 1 === 0) ? (Math.floor(Math.random() * (' + lString + '+ 1 -' + rString + ') + ' + rString + ')) : (Math.random() * (' + lString + '-' + rString + ') + ' + rString + ')))';
                        //var test = ((1.0) <= (1.01)) ? (((1.0) % 1 === 0 && (1.01) % 1 === 0) ? (Math.floor(Math.random() * ((1.01) - (1.0)) + (1.0))) : (Math.random() * ((1.01) - (1.0)) + (1.0))) : (((1.0) % 1 === 0 && (1.01) % 1 === 0) ? (Math.floor(Math.random() * ((1.0) - (1.01)) + (1.01))) : (Math.random() * ((1.0) - (1.01)) + (1.01)));

                        return stmt;
                        //var functionBody = 'var left = (' + this.parseJson(this._parseJsonType(jsonFormula.left)) + ').calculate(); ';
                        //functionBody += 'var right = (' + this.parseJson(this._parseJsonType(jsonFormula.right)) + ').calculate(); ';
                        ////functionBody += 'var returnInt = (left % 1 === 1 && right % 1 === 0); ';
                        //functionBody += 'if (left < right) { ';
                        //functionBody += 'var factor = (right - left); var offset = left; } else { ';
                        //functionBody += 'var factor = (left - right); var offset = right; } ';
                        //functionBody += 'if (left % 1 === 0 && right % 1 === 0) ';  //retrun value as integer 
                        //functionBody += '';
                        //functionBody += '';

                        //var left = (this.parseJson(this._parseJsonType(jsonFormula.left))).calculate();
                        //var right = (this.parseJson(this._parseJsonType(jsonFormula.right))).calculate();
                        //if (left < right) //min = left
                        //    return 'Math.random() * ' + (right - left) + ' + ' + left;// + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';
                        //else
                        //    return 'Math.random() * ' + (left - right) + ' + ' + right;// + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';
                        ////return 'Math.floor((Math.random() * ' + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';  //TODO:
                        ////return 'Math.random() * ' + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';  //TODO:

                    case 'ABS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_abs');
                            return jsonFormula;
                        }
                        return 'Math.abs(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'ROUND':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_round');
                            return jsonFormula;
                        }
                        return 'Math.round(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MOD': //http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_mod');
                            return jsonFormula;
                        }
                        return '(((' + this._parseJsonType(jsonFormula.left) + ') % (' + this._parseJsonType(jsonFormula.right) + ')) + (' + this._parseJsonType(jsonFormula.right) + ')) % (' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'ARCSIN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_arcsin');
                            return jsonFormula;
                        }
                        return 'this._radian2degree(Math.asin(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'ARCCOS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_arccos');
                            return jsonFormula;
                        }
                        return 'this._radian2degree(Math.acos(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'ARCTAN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_arctan');
                            return jsonFormula;
                        }
                        return 'this._radian2degree(Math.atan(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'EXP':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_exp');
                            return jsonFormula;
                        }
                        return 'Math.exp(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'POWER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_power');
                            return jsonFormula;
                        }
                        return 'Math.pow(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'FLOOR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_floor');
                            return jsonFormula;
                        }
                        return 'Math.floor(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'CEIL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_ceil');
                            return jsonFormula;
                        }
                        return 'Math.ceil(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MAX':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_max');
                            return jsonFormula;
                        }
                        return 'isNaN(' + this._parseJsonType(jsonFormula.left) + ') ? ' +
                            '(isNaN(' + this._parseJsonType(jsonFormula.right) + ') ? undefined : ' + this._parseJsonType(jsonFormula.right) + ') : ' +
                            '(isNaN(' + this._parseJsonType(jsonFormula.right) + ') ? (' + this._parseJsonType(jsonFormula.left) + ') : ' +
                            'Math.max(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + '))';


                    case 'MIN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_min');
                            return jsonFormula;
                        }
                        return 'isNaN(' + this._parseJsonType(jsonFormula.left) + ') ? ' +
                            '(isNaN(' + this._parseJsonType(jsonFormula.right) + ') ? undefined : ' + this._parseJsonType(jsonFormula.right) + ') : ' +
                            '(isNaN(' + this._parseJsonType(jsonFormula.right) + ') ? (' + this._parseJsonType(jsonFormula.left) + ') : ' +
                            'Math.min(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + '))';

                    case 'TRUE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_true');
                            return jsonFormula;
                        }
                        return 'true';

                    case 'FALSE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_false');
                            return jsonFormula;
                        }
                        return 'false';

                        //string
                    case 'LENGTH':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_length');
                            return jsonFormula;
                        }

                        if (jsonFormula.left)
                            return '(' + this._parseJsonType(jsonFormula.left) + ' + \'\').length';
                        return 0;

                    case 'LETTER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_letter');
                            return jsonFormula;
                        }

                        var idx = Number(this._parseJsonType(jsonFormula.left)) - 1; //given index (1..n)
                        return '((' + this._parseJsonType(jsonFormula.right) + ') + \'\').charAt(' + idx + ')';

                    case 'JOIN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_join');
                            return jsonFormula;
                        }

                        return '((' + this._parseJsonType(jsonFormula.left).toString().replace(/'/g, '\\\'').replace(/\n/g, '\\n')
                            + ') + \'\').concat((' + this._parseJsonType(jsonFormula.right).toString().replace(/'/g, '\\\'').replace(/\n/g, '\\n') + ') + \'\')';

                        //list
                    case 'NUMBER_OF_ITEMS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_number_of_items');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return this._parseJsonType(jsonFormula.left) + '.length';

                    case 'LIST_ITEM':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_list_item');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return this._parseJsonType(jsonFormula.right) + '.valueAt(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'CONTAINS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_contains');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return this._parseJsonType(jsonFormula.left) + '.contains(' + this._parseJsonType(jsonFormula.right) + ')';

                        //touch
                    case 'MULTI_FINGER_X':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_multi_finger_x');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return 'this._device.getTouchX(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MULTI_FINGER_Y':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_multi_finger_y');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return 'this._device.getTouchY(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MULTI_FINGER_TOUCHED':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_is_multi_finger_touching');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return 'this._device.isTouched(' + this._parseJsonType(jsonFormula.left) + ')';

                        //arduino
                    case 'ARDUINOANALOG':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_arduino_read_pin_value_analog');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return 'this._device.getArduinoAnalogPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'ARDUINODIGITAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_arduino_read_pin_value_digital');
                            return jsonFormula;
                        }

                        this._isStatic = false;
                        return 'this._device.getArduinoDigitalPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    default:
                        throw new Error('formula parser: unknown function: ' + jsonFormula.value);    //TODO: do we need an onError event? -> new and unsupported operators?

                }
            },

            _parseJsonSensor: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Sensors
                *  X_ACCELERATION, Y_ACCELERATION, Z_ACCELERATION, COMPASS_DIRECTION, X_INCLINATION, Y_INCLINATION, LOUDNESS, FACE_DETECTED, FACE_SIZE, FACE_X_POSITION, FACE_Y_POSITION, OBJECT_X(true), OBJECT_Y(true), OBJECT_GHOSTEFFECT(true), OBJECT_BRIGHTNESS(true), OBJECT_SIZE(true), OBJECT_ROTATION(true), OBJECT_LAYER(true)
                */
                switch (jsonFormula.value) {
                    //device
                    case 'LOUDNESS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_loudness');
                            return jsonFormula;
                        }

                        return 'this._device.loudness';

                    case 'X_ACCELERATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_x_acceleration');
                            return jsonFormula;
                        }

                        return 'this._device.accelerationX';

                    case 'Y_ACCELERATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_y_acceleration');
                            return jsonFormula;
                        }

                        return 'this._device.accelerationY';

                    case 'Z_ACCELERATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_z_acceleration');
                            return jsonFormula;
                        }

                        return 'this._device.accelerationZ';

                    case 'X_INCLINATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_x_inclination');
                            return jsonFormula;
                        }

                        return 'this._device.inclinationX';

                    case 'Y_INCLINATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_y_inclination');
                            return jsonFormula;
                        }

                        return 'this._device.inclinationY';

                    case 'COMPASS_DIRECTION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_compass_direction');
                            return jsonFormula;
                        }

                        return 'this._device.compassDirection';

                        //geo location
                    case 'LATITUDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_latitude');
                            return jsonFormula;
                        }

                        return 'this._device.geoLatitude';

                    case 'LONGITUDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_longitude');
                            return jsonFormula;
                        }

                        return 'this._device.geoLongitude';

                    case 'ALTITUDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_altitude');
                            return jsonFormula;
                        }

                        return 'this._device.geoAltitude';

                    case 'ACCURACY':
                    case 'LOCATION_ACCURACY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_location_accuracy');
                            return jsonFormula;
                        }

                        return 'this._device.geoAccuracy';

                        //touch
                    case 'FINGER_X':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_finger_x');
                            return jsonFormula;
                        }

                        return 'this._device.getTouchX(this._device.lastTouchIndex)';

                    case 'FINGER_Y':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_finger_y');
                            return jsonFormula;
                        }

                        return 'this._device.getTouchY(this._device.lastTouchIndex)';

                    case 'FINGER_TOUCHED':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_is_finger_touching');
                            return jsonFormula;
                        }

                        return 'this._device.isTouched(this._device.lastTouchIndex)';

                    case 'LAST_FINGER_INDEX':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_index_of_last_finger');
                            return jsonFormula;
                        }

                        return 'this._device.lastTouchIndex';

                    //face detection
                    case 'FACE_DETECTED':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_detected');
                            return jsonFormula;
                        }

                        return 'this._device.faceDetected';

                    case 'FACE_SIZE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_size');
                            return jsonFormula;
                        }

                        return 'this._device.faceSize';

                    case 'FACE_X_POSITION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_x_position');
                            return jsonFormula;
                        }

                        return 'this._device.facePositionX';

                    case 'FACE_Y_POSITION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_y_position');
                            return jsonFormula;
                        }

                        return 'this._device.facePositionY';

                        //date and time
                    case 'CURRENT_YEAR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_date_year');
                            return jsonFormula;
                        }

                        return '(new Date()).getFullYear()';

                    case 'CURRENT_MONTH':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_date_month');
                            return jsonFormula;
                        }

                        return '(new Date()).getMonth()';

                    case 'CURRENT_DATE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_date_day');
                            return jsonFormula;
                        }

                        return '(new Date()).getDate()';

                    case 'CURRENT_DAY_OF_WEEK':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_date_weekday');
                            return jsonFormula;
                        }

                        return '((new Date()).getDay() > 0 ? (new Date()).getDay() : 7)';

                    case 'CURRENT_HOUR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_time_hour');
                            return jsonFormula;
                        }

                        return '(new Date()).getHours()';

                    case 'CURRENT_MINUTE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_time_minute');
                            return jsonFormula;
                        }

                        return '(new Date()).getMinutes()';

                    case 'CURRENT_SECOND':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_time_second');
                            return jsonFormula;
                        }

                        return '(new Date()).getSeconds()';

                        //case 'DAYS_SINCE_2000':
                        //    if (asUiObject)
                        //        return 'days_since_2000';

                        //    return '(new Date() - new Date(2000, 0, 1, 0, 0, 0, 0)) / 86400000';

                        //case 'TIMER':
                        //    if (asUiObject)
                        //        return 'timer';

                        //    return 'this._sprite.projectTimerValue';
                        
                    //sprite
                    case 'OBJECT_BRIGHTNESS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_brightness');
                            return jsonFormula;
                        }

                        return 'this._sprite.brightness';

                    case 'OBJECT_TRANSPARENCY':
                    case 'OBJECT_GHOSTEFFECT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_transparency');
                            return jsonFormula;
                        }

                        return 'this._sprite.transparency';

                    case 'OBJECT_COLOR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_color');
                            return jsonFormula;
                        }

                        return 'this._sprite.colorEffect';

                    case 'OBJECT_BACKGROUND_NUMBER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_background_number');
                            return jsonFormula;
                        }
                    case 'OBJECT_LOOK_NUMBER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_look_number');
                            return jsonFormula;
                        }
                        return 'this._sprite.currentLookNumber';

                    case 'OBJECT_BACKGROUND_NAME':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_background_name');
                            return jsonFormula;
                        }
                    case 'OBJECT_LOOK_NAME':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_look_name');
                            return jsonFormula;
                        }
                        return 'this._sprite.currentLookName';

                    case 'OBJECT_LAYER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_layer');
                            return jsonFormula;
                        }

                        return 'this._sprite.layer';

                    case 'OBJECT_ROTATION': //=direction
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_rotation');
                            return jsonFormula;
                        }

                        return 'this._sprite.direction';

                    case 'OBJECT_SIZE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_size');
                            return jsonFormula;
                        }

                        return 'this._sprite.size';

                    case 'OBJECT_X':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_x');
                            return jsonFormula;
                        }

                        return 'this._sprite.positionX';

                    case 'OBJECT_Y':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_y');
                            return jsonFormula;
                        }

                        return 'this._sprite.positionY';

                    //case 'OBJECT_DISTANCE_TO':    //TODO
                    //    if (uiString)
                    //        return 'position_y';

                    //    return 'this._sprite.positionY';

                    //collision
                    case 'COLLIDES_WITH_EDGE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_collides_with_edge');
                            return jsonFormula;
                        }

                        return 'this._sprite.collidesWithEdge';

                    case 'COLLIDES_WITH_FINGER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_touched');
                            return jsonFormula;
                        }

                        return 'this._sprite.collidesWithPointer';

                    //physics
                    case 'OBJECT_X_VELOCITY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_x_velocity');
                            return jsonFormula;
                        }

                        return 'this._sprite.velocityX';    //TODO: physics

                    case 'OBJECT_Y_VELOCITY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_y_velocity');
                            return jsonFormula;
                        }

                        return 'this._sprite.velocityY';    //TODO: physics

                    case 'OBJECT_ANGULAR_VELOCITY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_angular_velocity');
                            return jsonFormula;
                        }

                        return 'this._sprite.velocityAngular';  //TODO: physics

                    //nxt
                    case 'NXT_SENSOR_1':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_1');
                            return jsonFormula;
                        }

                        return 'this._device.nxt1';

                    case 'NXT_SENSOR_2':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_2');
                            return jsonFormula;
                        }

                        return 'this._device.nxt2';

                    case 'NXT_SENSOR_3':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_3');
                            return jsonFormula;
                        }

                        return 'this._device.nxt3';

                    case 'NXT_SENSOR_4':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_4');
                            return jsonFormula;
                        }

                        return 'this._device.nxt4';

                        //phiro
                    case 'PHIRO_FRONT_LEFT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_front_left');
                            return jsonFormula;
                        }

                        return 'this._device.phiroFrontLeft';

                    case 'PHIRO_FRONT_RIGHT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_front_right');
                            return jsonFormula;
                        }

                        return 'this._device.phiroFrontRight';

                    case 'PHIRO_SIDE_LEFT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_side_left');
                            return jsonFormula;
                        }

                        return 'this._device.phiroSideLeft';

                    case 'PHIRO_SIDE_RIGHT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_side_right');
                            return jsonFormula;
                        }

                        return 'this._device.phiroSideRight';

                    case 'PHIRO_BOTTOM_LEFT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_bottom_left');
                            return jsonFormula;
                        }

                        return 'this._device.phiroBottomLeft';

                    case 'PHIRO_BOTTOM_RIGHT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_bottom_right');
                            return jsonFormula;
                        }

                        return 'this._device.phiroBottomRight';

                    default:
                        throw new Error('formula parser: unknown sensor: ' + jsonFormula.value);      //TODO: do we need an onError event? -> new and unsupported operators? PHIRO?
                }
            },
            /* override */
            dispose: function () {
                //static class: cannot be disposed
            },
        });

        return FormulaParser;
    })(),

});

//static class: constructor override (keeping code coverage enabled)
PocketCode.FormulaParser = new PocketCode.FormulaParser();

