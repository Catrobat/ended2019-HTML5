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
/// <reference path="../model/sprite.js" />
'use strict';

PocketCode.merge({

    SpriteFactory: (function () {
        SpriteFactory.extends(SmartJs.Core.Component);

        function SpriteFactory(device, gameEngine, minLoopCycleTime) {
            this._device = device;
            this._gameEngine = gameEngine;
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
            create: function (currentScene, broadcastMgr, jsonSprite, asBackground) {
                if (!(currentScene instanceof PocketCode.Model.Scene))
                    throw new Error('invalid argument: current scene');
                if (!(broadcastMgr instanceof PocketCode.BroadcastManager))
                    throw new Error('invalid argument: broadcast manager');
                if (typeof jsonSprite !== 'object' || jsonSprite instanceof Array)
                    throw new Error('invalid argument: expected type: object');

                this._unsupportedBricks = [];
                var brickFactory = new PocketCode.BrickFactory(this._device, currentScene, broadcastMgr, this._minLoopCycleTime);
                brickFactory.onUnsupportedBrickFound.addEventListener(new SmartJs.Event.EventListener(function (e) { this._unsupportedBricks.push(e.unsupportedBrick); }, this));

                var sprite = asBackground ?
                    new PocketCode.Model.BackgroundSprite(this._gameEngine, currentScene, jsonSprite) :
                    new PocketCode.Model.Sprite(this._gameEngine, currentScene, jsonSprite);
                var scripts = [];
                for (var i = 0, l = jsonSprite.scripts.length; i < l; i++)
                    scripts.push(brickFactory.create(sprite, jsonSprite.scripts[i]));
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

                var brickFactory = new PocketCode.BrickFactory(this._device, currentScene, broadcastMgr, this._minLoopCycleTime);
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
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return SpriteFactory;
    })(),

    BrickFactory: (function () {
        BrickFactory.extends(SmartJs.Core.Component);

        function BrickFactory(device, scene, broadcastMgr, minLoopCycleTime) {
            this._device = device;
            this._scene = scene;
            this._broadcastMgr = broadcastMgr;
            this._minLoopCycleTime = minLoopCycleTime;

            this._parsed = 0;//loadedCount;

            this._onUnsupportedBrickFound = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(BrickFactory.prototype, {
            onUnsupportedBrickFound: {
                get: function () {
                    return this._onUnsupportedBrickFound;
                },
            },
        });

        //properties
        Object.defineProperties(BrickFactory.prototype, {
            bricksParsed: {
                get: function () {
                    return this._parsed;
                },
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
                    case 'UserScriptBrick':
                    case 'CallUserScriptBrick':

                    //in development:
                    case 'WhenCollisionBrick':

                    //case 'SetRotationSpeedBrick':
                    //case 'RotationSpeedLeftBrick':  //is removed
                    //case 'RotationSpeedRightBrick': //is removed
                    case 'SetVelocityBrick':
                    case 'SetGravityBrick':
                    case 'SetMassBrick':
                    case 'SetBounceFactorBrick':
                    case 'SetFrictionBrick':

                    //case 'SelectCameraBrick':
                    case 'CameraBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._gameEngine, jsonBrick);
                        break;

                    //bubbles
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
                    case 'WhenConditionMetBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onStart);
                        break;

                    case 'WhenActionBrick': //handling several actions: ("video motion", "timer", "loudness",) "spriteTouched", "screenTouched"
                        var actions = {};
                        actions[PocketCode.UserActionType.SPRITE_TOUCHED] = this._scene.onSpriteTappedAction;
                        actions[PocketCode.UserActionType.TOUCH_START] = this._scene.onTouchStartAction;

                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, actions);
                        break;

                    // sounds
                    case 'StopAllSoundsBrick':
                        jsonBrick.stopType = PocketCode.StopType.ALL_SOUNDS;
                        type = "StopBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'SetVolumeBrick':
                        jsonBrick.opType = PocketCode.OpType.SET;
                        type = "VolumeBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'ChangeVolumeBrick':
                        jsonBrick.opType = PocketCode.OpType.CHANGE;
                        type = "VolumeBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;

                    case 'AskSpeechBrick':
                    case 'AskBrick':
                        if (type == 'AskSpeechBrick')  //providing a ask dialog instead the typical askSpeech brick
                            type = 'AskBrick';
                    case 'CloneBrick':
                    case 'GoToBrick':

                    //background
                    case 'SetBackgroundBrick':
                    case 'SetBackgroundAndWaitBrick':
                    case 'SetBackgroundByIndexBrick':
                    case 'ClearBackgroundBrick':
                    case 'WhenBackgroundChangesToBrick':
                    case 'StartSceneBrick':
                    case 'SceneTransitionBrick':
                        if(type === "SetBackgroundAndWaitBrick") {
                            jsonBrick.andWait = true;
                            type = 'SetBackgroundBrick';
                        }
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, jsonBrick);
                        break;

                    case 'BroadcastBrick':
                    case 'BroadcastAndWaitBrick':
                    case 'WhenBroadcastReceiveBrick':
                        if(type === "BroadcastAndWaitBrick") {
                            jsonBrick.andWait = true;
                            type = 'BroadcastBrick';
                        }
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._broadcastMgr, jsonBrick);
                        break;

                    case 'MoveNStepsBrick':
                    case 'ForeverBrick':
                    case 'RepeatBrick':
                    case 'RepeatUntilBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._minLoopCycleTime, jsonBrick);
                        break;

                    case 'StopBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, this._currentScriptId, jsonBrick);
                        break;

                    // graphic effects
                    case 'ChangeTransparency':
                    case 'ChangeBrightness':
                    case 'ChangeColorEffect':
                    case 'ChangeGraphicEffectBrick':
                        jsonBrick.change = true;
                    case 'SetGraphicEffectBrick':
                    case 'SetTransparency':
                    case 'SetBrightness':
                    case 'SetColorEffect':
                    case 'GraphicEffectBrick':
                        type = "GraphicEffectBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;

                    // motion
                    case 'TurnLeftBrick':
                        jsonBrick.ccw = true;
                        type = "RotateBlock";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'TurnRightBrick':
                        jsonBrick.ccw = false;
                        type = "RotateBlock";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'SetXBrick':
                        jsonBrick.opType = PocketCode.OpType.SET;
                        type = "XBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'ChangeXBrick':
                        jsonBrick.opType = PocketCode.OpType.CHANGE;
                        type = "XBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'SetYBrick':
                        jsonBrick.opType = PocketCode.OpType.SET;
                        type = "YBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'ChangeYBrick':
                        jsonBrick.opType = PocketCode.OpType.CHANGE;
                        type = "YBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;

                    // look
                    case 'SetSizeBrick':
                        jsonBrick.opType = PocketCode.OpType.SET;
                        jsonBrick.value = jsonBrick.percentage || jsonBrick.value;
                        type = "SizeBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'ChangeSizeBrick':
                        jsonBrick.opType = PocketCode.OpType.CHANGE;
                        type = "SizeBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;

                    // data
                    case 'SetVariableBrick':
                        jsonBrick.opType = PocketCode.OpType.SET;
                        type = "VariableBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;
                    case 'ChangeVariableBrick':
                        jsonBrick.opType = PocketCode.OpType.CHANGE;
                        type = "VariableBrick";
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        break;


                    default:
                        //control: WaitBrick, NoteBrick, WhenStartAsCloneBrick, IfThenElse, DeleteCloneBrick
                        //event: WaitUntilBrick
                        //motion: GoToPositionBrick, SetXBrick, SetYBrick, ChangeXBrick, ChangeYBrick, SetRotationStyleBrick, IfOnEdgeBounce
                        //        TurnLeft, TurnRight, SetDirection, SetDirectionTo, SetRotationStyle, GlideTo, GoBack, ComeToFront, Vibration
                        //motion physics: SetVelocity, RotationSpeedLeft, RotationSpeedRight, SetMass, SetBounceFactor, SetFriction
                        //look: SetLook, SetLookByIndex, NextLook, PreviousLook, SetSize, ChangeSize, Hide, Show, Say, SayFor, Think, ThinkFor, SetTransparency, 
                        //      .. all filters, .. ClearGraphicEffect
                        //sound
                        //case 'PlaySoundBrick':
                        //case 'PlaySoundAndWaitBrick':   //disabled
                        //case 'SpeakBrick':
                        //case 'SpeakAndWaitBrick':   //disabled
                        if (type == 'PlaySoundAndWaitBrick') {
                            jsonBrick.wait = true;  //currently as a workaround to implement ..AndWaitBricks for sounds like in v0.4
                            type = 'PlaySoundBrick';
                        }
                        else if (type == 'SpeakAndWaitBrick') {
                            jsonBrick.wait = true;  //currently as a workaround to implement ..AndWaitBricks for sounds like in v0.4
                            type = 'SpeakBrick';
                        }

                        //case 'SetVolumeBrick':
                        //case 'ChangeVolumeBrick':
                        //    brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        //    break;

                        //pen: PenDown, PenUp, SetPenSize, SetPenColor, Stamp
                        //data: SetVariable, ChangeVariable, ShowVariable, HideVariable, AppendToList, DeleteAtList, InsertAtList, ReplaceAtList
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
                return brick;
            },
            _createList: function (currentSprite, jsonBricks) {    //returns bricks as a BrickContainer
                var bricks = [];
                for (var i = 0, l = jsonBricks.length; i < l; i++)
                    bricks.push(this.create(currentSprite, jsonBricks[i]));
                return new PocketCode.Model.BrickContainer(bricks);
            },
            dispose: function () {
                this._device = undefined;
                this._scene = undefined;
                this._broadcastMgr = undefined;
                SmartJs.Core.Component.prototype.dispose.call(this);
            }
        });

        return BrickFactory;
    })(),

    _FormulaParser: (function () {
        function FormulaParser() {
            this._isStatic = false;

            this._variableNames = {};
            this._listNames = {};
        }

        FormulaParser.prototype.merge({
            parsei18nJson: function (jsonFormula, variableNames, listNames) {
                if (typeof variableNames !== 'object')
                    throw new Error('invalid argument: variableNames (lookup dictionary required)');
                if (typeof listNames !== 'object')
                    throw new Error('invalid argument: listNames (lookup dictionary required)');
                this._variableNames = variableNames;
                this._listNames = listNames;

                return this._parseJsonType(jsonFormula, true);
            },
            parseJson: function (jsonFormula) {
                this._isStatic = true;
                var parsedFormula = this._parseJsonType(jsonFormula);
                return {
                    calculate: new Function(
                        'uvh',
                        'uvh || (uvh = this._sprite); ' +
                        'var cast = PocketCode.Math.Cast; ' +
                        'return cast.toValue(' + parsedFormula + ');'),
                    isStatic: this._isStatic,
                };
            },

            _parseJsonType: function (jsonFormula, asUiObject, type) {
                var parsedFormula = undefined;  //default if null

                if (jsonFormula !== null) {
                    /* package org.catrobat.catroid.formulaeditor: class FormulaElement: enum ElementType
                    *  OPERATOR, FUNCTION, NUMBER, SENSOR, USER_VARIABLE, BRACKET, STRING, COLLISION_FORMULA
                    */
                    switch (jsonFormula.type) {
                        case 'OPERATOR':
                            parsedFormula = this._parseJsonOperator(jsonFormula, asUiObject);
                            break;

                        case 'FUNCTION':
                            parsedFormula = this._parseJsonFunction(jsonFormula, asUiObject);
                            break;

                        case 'NUMBER':
                            //make sure it's a number: replace JSON property to make sure there will not be errors in our UI (code view)
                            if (typeof jsonFormula.value != 'number')
                                jsonFormula.value = PocketCode.Math.Cast.toNumber(jsonFormula.value);
                            parsedFormula = jsonFormula.value;
                            if (asUiObject)
                                parsedFormula = { type: jsonFormula.type, value: jsonFormula.value };
                            break;

                        case 'SENSOR':
                            this._isStatic = false;
                            parsedFormula = this._parseJsonSensor(jsonFormula, asUiObject);
                            break;

                        case 'USER_VARIABLE':
                            if (asUiObject) {
                                var variable = this._variableNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] ||
                                    this._variableNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] ||
                                    this._variableNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                                if (!variable)
                                    throw new Error('parser: variable not found');
                                parsedFormula = { type: jsonFormula.type, id: jsonFormula.value, name: variable.name };
                            }
                            else {
                                this._isStatic = false;
                                parsedFormula = 'uvh.getVariable("' + jsonFormula.value + '")';
                            }
                            break;

                        case 'USER_LIST':
                            if (asUiObject) {
                                var list = this._listNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] ||
                                    this._listNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] ||
                                    this._listNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                                if (!list)
                                    throw new Error('parser: list not found');
                                parsedFormula = { type: jsonFormula.type, id: jsonFormula.value, name: list.name };
                            }
                            else {
                                this._isStatic = false;
                                parsedFormula = 'uvh.getList("' + jsonFormula.value + '")';
                            }
                            break;

                        case 'BRACKET':
                            if (asUiObject)
                                parsedFormula = { type: jsonFormula.type, right: this._parseJsonType(jsonFormula.right, true) };
                            else
                                parsedFormula = '(' + this._parseJsonType(jsonFormula.right) + ')';
                            break;

                        case 'STRING':
                            var string = jsonFormula.value.replace(/(')/g, '\\$1').replace(/(\n)/g, '\\n');
                            if (asUiObject)
                                parsedFormula = { type: jsonFormula.type, value: string };
                            else
                                parsedFormula = '\'' + string + '\'';
                            break;

                        case 'COLLISION_FORMULA':
                            if (asUiObject)
                                parsedFormula = { type: jsonFormula.type, id: jsonFormula.value };
                            else {
                                this._isStatic = false;
                                //changed backend to deliver ids instead of names
                                parsedFormula = 'this._sprite.collidesWithSprite(\'' + jsonFormula.value + '\')';
                            }
                            break;

                        default:
                            throw new Error('formula parser: unknown type: ' + jsonFormula.type);     //TODO: do we need an onError event? -> new and unsupported operators?
                    }
                }
                //add casts: var cast = PocketCode.Math.Cast; injected in each formula   
                //null should not be called: but if the formula contains missing entries we add them here by casting null to the expected type
                if (!type)
                    return parsedFormula;
                if (type == 'value')
                    return 'cast.toValue(' + parsedFormula + ')';
                if (type == 'string')
                    return 'cast.toString(' + parsedFormula + ')';
                if (type == 'boolean')
                    return 'cast.toBoolean(' + parsedFormula + ')';
                if (type == 'number')
                    return 'cast.toNumber(' + parsedFormula + ')';
            },

            _concatOperatorFormula: function (jsonFormula, operator, type) {
                type = type || 'value';
                return '(' + this._parseJsonType(jsonFormula.left, false, type) + operator + this._parseJsonType(jsonFormula.right, false, type) + ')';
            },
            _concatUiObject: function (jsonFormula, i18nKey) {
                var json = {
                    type: jsonFormula.type,
                    i18nKey: i18nKey,
                };
                if (jsonFormula.left !== null)
                    json.left = this._parseJsonType(jsonFormula.left, true);
                if (jsonFormula.right !== null)
                    json.right = this._parseJsonType(jsonFormula.right, true);
                return json;
            },
            _parseJsonOperator: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Operators */
                switch (jsonFormula.value) {
                    case 'LOGICAL_AND':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_and');
                        return this._concatOperatorFormula(jsonFormula, ' && ', 'boolean');

                    case 'LOGICAL_OR':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_or');
                        return this._concatOperatorFormula(jsonFormula, ' || ', 'boolean');

                    case 'EQUAL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_equal');
                        return 'PocketCode.Math.isEqual(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'NOT_EQUAL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_notequal');
                        return '(!PocketCode.Math.isEqual(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + '))';

                    case 'SMALLER_OR_EQUAL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_leserequal');
                        return this._concatOperatorFormula(jsonFormula, ' <= ', 'number');

                    case 'GREATER_OR_EQUAL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_greaterequal');
                        return this._concatOperatorFormula(jsonFormula, ' >= ', 'number');

                    case 'SMALLER_THAN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_lesserthan');
                        return this._concatOperatorFormula(jsonFormula, ' < ', 'number');

                    case 'GREATER_THAN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_greaterthan');
                        return this._concatOperatorFormula(jsonFormula, ' > ', 'number');

                    case 'PLUS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_operator_plus');
                        return this._concatOperatorFormula(jsonFormula, ' + ', 'number');

                    case 'MINUS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_operator_minus');

                        if (jsonFormula.left === null)    //singed number
                            return this._concatOperatorFormula(jsonFormula, '-', 'number');
                        return this._concatOperatorFormula(jsonFormula, ' - ', 'number');

                    case 'MULT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_operator_mult');
                        return this._concatOperatorFormula(jsonFormula, ' * ', 'number');

                    case 'DIVIDE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_operator_divide');
                        return this._concatOperatorFormula(jsonFormula, ' / ', 'number');

                    case 'LOGICAL_NOT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_logic_not');
                        return '(!' + this._parseJsonType(jsonFormula.right, false, 'boolean') + ')';

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
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_sin');
                        return 'Math.sin(this._degree2radian(' + this._parseJsonType(jsonFormula.left, false, 'number') + '))';

                    case 'COS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_cos');
                        return 'Math.cos(this._degree2radian(' + this._parseJsonType(jsonFormula.left, false, 'number') + '))';

                    case 'TAN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_tan');
                        return 'Math.tan(this._degree2radian(' + this._parseJsonType(jsonFormula.left, false, 'number') + '))';

                    case 'LN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_ln');
                        return 'Math.log(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'LOG':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_log');
                        return 'this._log10(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'PI':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_pi');
                        return 'Math.PI';

                    case 'SQRT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_sqrt');
                        return 'Math.sqrt(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'RAND':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_rand');

                        this._isStatic = false;
                        //please notice: this function is quite tricky, as the 2 parametes can be switched (min, max) and we need to calculate this two values
                        //at runtime to determine which one to use
                        //if both partial results are integers, the random number will be a number without decimal places
                        //for calculation we need the scope of the formula itself! To solve this, the whole logic is included in our dynamic function
                        var lString = '(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';
                        var rString = '(' + this._parseJsonType(jsonFormula.right, false, 'number') + ')';

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
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_abs');
                        return 'Math.abs(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'ROUND':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_round');
                        return 'Math.round(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'MOD': //http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_mod');
                        return '(((' + this._parseJsonType(jsonFormula.left, false, 'number') + ') % (' + this._parseJsonType(jsonFormula.right, false, 'number') + ')) + (' + this._parseJsonType(jsonFormula.right, false, 'number') + ')) % (' + this._parseJsonType(jsonFormula.right, false, 'number') + ')';

                    case 'ARCSIN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_arcsin');
                        return 'this._radian2degree(Math.asin(' + this._parseJsonType(jsonFormula.left, false, 'number') + '))';

                    case 'ARCCOS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_arccos');
                        return 'this._radian2degree(Math.acos(' + this._parseJsonType(jsonFormula.left, false, 'number') + '))';

                    case 'ARCTAN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_arctan');
                        return 'this._radian2degree(Math.atan(' + this._parseJsonType(jsonFormula.left, false, 'number') + '))';

                    case 'EXP':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_exp');
                        return 'Math.exp(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'POWER':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_power');
                        return 'Math.pow(' + this._parseJsonType(jsonFormula.left, false, 'number') + ', ' + this._parseJsonType(jsonFormula.right, false, 'number') + ')';

                    case 'FLOOR':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_floor');
                        return 'Math.floor(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'CEIL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_ceil');
                        return 'Math.ceil(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'MAX':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_max');

                        return 'isNaN(' + this._parseJsonType(jsonFormula.left, false, 'value') + ') ? ' +
                                '(isNaN(' + this._parseJsonType(jsonFormula.right, false, 'value') + ') ? undefined : ' + this._parseJsonType(jsonFormula.right, false, 'number') + ') : ' +
                               '(isNaN(' + this._parseJsonType(jsonFormula.right, false, 'value') + ') ? (' + this._parseJsonType(jsonFormula.left, false, 'number') + ') : ' +
                               'Math.max(' + this._parseJsonType(jsonFormula.left, false, 'number') + ', ' + this._parseJsonType(jsonFormula.right, false, 'number') + '))';

                    case 'MIN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_min');

                        return 'isNaN(' + this._parseJsonType(jsonFormula.left, false, 'value') + ') ? ' +
                                '(isNaN(' + this._parseJsonType(jsonFormula.right, false, 'value') + ') ? undefined : ' + this._parseJsonType(jsonFormula.right, false, 'number') + ') : ' +
                               '(isNaN(' + this._parseJsonType(jsonFormula.right, false, 'value') + ') ? (' + this._parseJsonType(jsonFormula.left, false, 'number') + ') : ' +
                               'Math.min(' + this._parseJsonType(jsonFormula.left, false, 'number') + ', ' + this._parseJsonType(jsonFormula.right, false, 'number') + '))';

                    case 'TRUE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_true');
                        return 'true';

                    case 'FALSE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_false');
                        return 'false';

                        //string
                    case 'LENGTH':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_length');
                        return this._parseJsonType(jsonFormula.left, false, 'string') + '.length';

                    case 'LETTER':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_letter');
                        return this._parseJsonType(jsonFormula.right, false, 'string') + '.charAt(' + this._parseJsonType(jsonFormula.left, false, 'number') + ' - 1 )';

                    case 'JOIN':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_join');
                        return this._parseJsonType(jsonFormula.left, false, 'string') + '.concat(' + this._parseJsonType(jsonFormula.right, false, 'string') + ')';

                        //list
                    case 'NUMBER_OF_ITEMS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_number_of_items');
                        return this._parseJsonType(jsonFormula.left) + '.length';

                    case 'LIST_ITEM':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_list_item');
                        return this._parseJsonType(jsonFormula.right) + '.valueAt(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'CONTAINS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_contains');
                        return this._parseJsonType(jsonFormula.left) + '.contains(' + this._parseJsonType(jsonFormula.right, false, 'value') + ')';

                        //touch
                    case 'MULTI_FINGER_X':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_multi_finger_x');

                        this._isStatic = false;
                        return 'this._device.getTouchX(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'MULTI_FINGER_Y':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_multi_finger_y');

                        this._isStatic = false;
                        return 'this._device.getTouchY(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                    case 'MULTI_FINGER_TOUCHED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_is_multi_finger_touching');

                        this._isStatic = false;
                        return 'this._device.isTouched(' + this._parseJsonType(jsonFormula.left, false, 'number') + ')';

                        //arduino
                    case 'ARDUINOANALOG':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_arduino_read_pin_value_analog');

                        this._isStatic = false;
                        return 'this._device.getArduinoAnalogPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'ARDUINODIGITAL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_arduino_read_pin_value_digital');

                        this._isStatic = false;
                        return 'this._device.getArduinoDigitalPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    // raspberry pi
                    case 'RASPIDIGITAL':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_raspi_read_pin_value_digital');

                        this._isStatic = false;
                        return 'this._device.getRaspberryPiDigitalPin(' + this._parseJsonType(jsonFormula.left) + ')';

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
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_loudness');
                        return 'this._sprite.volume';

                    case 'X_ACCELERATION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_x_acceleration');
                        return 'this._device.accelerationX';

                    case 'Y_ACCELERATION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_y_acceleration');
                        return 'this._device.accelerationY';

                    case 'Z_ACCELERATION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_z_acceleration');
                        return 'this._device.accelerationZ';

                    case 'X_INCLINATION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_x_inclination');
                        return 'this._device.inclinationX';

                    case 'Y_INCLINATION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_y_inclination');
                        return 'this._device.inclinationY';

                    case 'COMPASS_DIRECTION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_compass_direction');
                        return 'this._device.compassDirection';

                        //geo location
                    case 'LATITUDE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_latitude');
                        return 'this._device.geoLatitude';

                    case 'LONGITUDE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_longitude');
                        return 'this._device.geoLongitude';

                    case 'ALTITUDE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_altitude');
                        return 'this._device.geoAltitude';

                    case 'ACCURACY':
                    case 'LOCATION_ACCURACY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_location_accuracy');
                        return 'this._device.geoAccuracy';

                        //touch
                    case 'FINGER_X':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_finger_x');
                        return 'this._device.getTouchX(this._device.lastTouchIndex)';

                    case 'FINGER_Y':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_finger_y');
                        return 'this._device.getTouchY(this._device.lastTouchIndex)';

                    case 'FINGER_TOUCHED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_is_finger_touching');
                        return 'this._device.isTouched(this._device.lastTouchIndex)';

                    case 'LAST_FINGER_INDEX':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_index_of_last_finger');
                        return 'this._device.lastTouchIndex';

                        //face detection
                    case 'FACE_DETECTED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_face_detected');
                        return 'this._device.faceDetected';

                    case 'FACE_SIZE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_face_size');
                        return 'this._device.faceSize';

                    case 'FACE_X_POSITION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_face_x_position');
                        return 'this._device.facePositionX';

                    case 'FACE_Y_POSITION':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_face_y_position');
                        return 'this._device.facePositionY';

                        //date and time
                    case 'CURRENT_YEAR':
                    case 'DATE_YEAR':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_date_year');
                        return '(new Date()).getFullYear()';

                    case 'CURRENT_MONTH':
                    case 'DATE_MONTH':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_date_month');
                        return '(new Date()).getMonth()';

                    case 'CURRENT_DATE':
                    case 'DATE_DAY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_date_day');
                        return '(new Date()).getDate()';

                    case 'CURRENT_DAY_OF_WEEK':
                    case 'DATE_WEEKDAY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_date_weekday');
                        return '((new Date()).getDay() > 0 ? (new Date()).getDay() : 7)';

                    case 'CURRENT_HOUR':
                    case 'TIME_HOUR':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_time_hour');
                        return '(new Date()).getHours()';

                    case 'CURRENT_MINUTE':
                    case 'TIME_MINUTE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_time_minute');
                        return '(new Date()).getMinutes()';

                    case 'CURRENT_SECOND':
                    case 'TIME_SECOND':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_time_second');
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
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_brightness');
                        return 'this._sprite.brightness';

                    case 'OBJECT_TRANSPARENCY':
                    case 'OBJECT_GHOSTEFFECT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_transparency');
                        return 'this._sprite.transparency';

                    case 'OBJECT_COLOR':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_color');
                        return 'this._sprite.colorEffect';

                    case 'OBJECT_BACKGROUND_NUMBER':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_background_number');
                        return 'this._sprite.sceneBackgroundNumber';    //scene not accessible directly in formula

                    case 'OBJECT_BACKGROUND_NAME':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_background_name');
                        return 'this._sprite.sceneBackgroundName';    //scene not accessible directly in formula

                    case 'OBJECT_LOOK_NUMBER':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_look_number');
                        return 'this._sprite.currentLookNumber';

                    case 'OBJECT_LOOK_NAME':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_look_name');
                        return 'this._sprite.currentLookName';

                    case 'OBJECT_LAYER':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_layer');
                        return 'this._sprite.layer';

                    case 'OBJECT_ROTATION': //=direction
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_rotation');
                        return 'this._sprite.direction';

                    case 'OBJECT_SIZE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_size');
                        return 'this._sprite.size';

                    case 'OBJECT_X':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_x');
                        return 'this._sprite.positionX';

                    case 'OBJECT_Y':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_y');
                        return 'this._sprite.positionY';

                        //case 'OBJECT_DISTANCE_TO':    //TODO
                        //    if (asUiObject)
                        //        return 'position_y';

                        //    return 'this._sprite.positionY';

                        //collision
                    case 'COLLIDES_WITH_EDGE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_collides_with_edge');
                        return 'this._sprite.collidesWithEdge';

                    case 'COLLIDES_WITH_FINGER':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_function_touched');
                        return 'this._sprite.collidesWithPointer';

                        //physics
                    case 'OBJECT_X_VELOCITY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_x_velocity');
                        return 'this._sprite.velocityX';    //TODO: physics

                    case 'OBJECT_Y_VELOCITY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_y_velocity');
                        return 'this._sprite.velocityY';    //TODO: physics

                    case 'OBJECT_ANGULAR_VELOCITY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_object_angular_velocity');
                        return 'this._sprite.velocityAngular';  //TODO: physics

                        //nxt
                    case 'NXT_SENSOR_1':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_nxt_1');
                        return 'this._device.nxt1';

                    case 'NXT_SENSOR_2':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_nxt_2');
                        return 'this._device.nxt2';

                    case 'NXT_SENSOR_3':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_nxt_3');
                        return 'this._device.nxt3';

                    case 'NXT_SENSOR_4':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_nxt_4');
                        return 'this._device.nxt4';

                        //phiro
                    case 'PHIRO_FRONT_LEFT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_phiro_sensor_front_left');
                        return 'this._device.phiroFrontLeft';

                    case 'PHIRO_FRONT_RIGHT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_phiro_sensor_front_right');
                        return 'this._device.phiroFrontRight';

                    case 'PHIRO_SIDE_LEFT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_phiro_sensor_side_left');
                        return 'this._device.phiroSideLeft';

                    case 'PHIRO_SIDE_RIGHT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_phiro_sensor_side_right');
                        return 'this._device.phiroSideRight';

                    case 'PHIRO_BOTTOM_LEFT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_phiro_sensor_bottom_left');
                        return 'this._device.phiroBottomLeft';

                    case 'PHIRO_BOTTOM_RIGHT':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_phiro_sensor_bottom_right');
                        return 'this._device.phiroBottomRight';

                        // drone
                    case 'DRONE_BATTERY_STATUS':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_battery_status');
                        return 'this._device.droneBatteryStatus';

                    case 'DRONE_EMERGENCY_STATE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_emergency_state');
                        return 'this._device.droneEmergencyState';

                    case 'DRONE_FLYING':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_flying');
                        return 'this._device.droneFlying';

                    case 'DRONE_INITIALIZED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_initialized');
                        return 'this._device.droneInitialized';

                    case 'DRONE_USB_ACTIVE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_usb_active');
                        return 'this._device.droneUsbActive';

                    case 'DRONE_USB_REMAINING_TIME':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_usb_remaining_time');
                        return 'this._device.droneUsbRemainingTime';

                    case 'DRONE_CAMERA_READY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_camera_ready');
                        return 'this._device.droneCameraReady';

                    case 'DRONE_RECORD_READY':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_record_ready');
                        return 'this._device.droneRecordReady';

                    case 'DRONE_RECORDING':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_recording');
                        return 'this._device.droneRecording';

                    case 'DRONE_NUM_FRAMES':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_drone_num_frames');
                        return 'this._device.droneNumFrames';

                        // nfc
                    case 'NFC_TAG_ID':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_nfc_tag_id');
                        return 'this._device.nfcTagId';

                    case 'NFC_TAG_MESSAGE':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_nfc_tag_message');
                        return 'this._device.nfcTagMessage';

                        // gamepad
                    case 'GAMEPAD_A_PRESSED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_gamepad_a_pressed');
                        return 'this._device.gamepadAPressed';

                    case 'GAMEPAD_B_PRESSED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_gamepad_b_pressed');
                        return 'this._device.gamepadBPressed';

                    case 'GAMEPAD_UP_PRESSED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_gamepad_up_pressed');
                        return 'this._device.gamepadUpPressed';

                    case 'GAMEPAD_DOWN_PRESSED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_gamepad_down_pressed');
                        return 'this._device.gamepadDownPressed';

                    case 'GAMEPAD_LEFT_PRESSED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_gamepad_left_pressed');
                        return 'this._device.gamepadLeftPressed';

                    case 'GAMEPAD_RIGHT_PRESSED':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_gamepad_right_pressed');
                        return 'this._device.gamepadRightPressed';

                        // ev3
                    case 'EV3_SENSOR_1':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_ev3_1');
                        return 'this._device.ev3Sensor1';

                    case 'EV3_SENSOR_2':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_ev3_2');
                        return 'this._device.ev3Sensor2';

                    case 'EV3_SENSOR_3':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_ev3_3');
                        return 'this._device.ev3Sensor3';

                    case 'EV3_SENSOR_4':
                        if (asUiObject)
                            return this._concatUiObject(jsonFormula, 'formula_editor_sensor_lego_ev3_4');
                        return 'this._device.ev3Sensor4';

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
PocketCode.FormulaParser = new PocketCode._FormulaParser();

