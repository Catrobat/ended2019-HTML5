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
                    case 'SetPhysicsObjectTypeBrick':
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

                    case 'StopAllSoundsBrick':
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
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, jsonBrick);
                        break;

                    case 'BroadcastBrick':
                        //type = 'BroadcastAndWaitBrick'; //fix to make sure we are catroid compatible?
                    case 'BroadcastAndWaitBrick':
                    case 'WhenBroadcastReceiveBrick':
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
        }

        FormulaParser.prototype.merge({
            getUiString: function (jsonFormula, variableNames, listNames) {
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
                var formulaString = this._parseJsonType(jsonFormula);
                return {
                    calculate: new Function(
                        'uvh',
                        'uvh || (uvh = this._sprite); ' +
                        'var cast = PocketCode.Math.Cast; ' +
                        'return cast.toValue(' + formulaString + ');'),
                    isStatic: this._isStatic,
                };
            },

            _parseJsonType: function (jsonFormula, uiString, type) {
                var formulaString = uiString ? '' : undefined; //default if null

                if (jsonFormula !== null) {
                    /* package org.catrobat.catroid.formulaeditor: class FormulaElement: enum ElementType
                    *  OPERATOR, FUNCTION, NUMBER, SENSOR, USER_VARIABLE, BRACKET, STRING, COLLISION_FORMULA
                    */
                    switch (jsonFormula.type) {
                        case 'OPERATOR':
                            formulaString = this._parseJsonOperator(jsonFormula, uiString);
                            break;

                        case 'FUNCTION':
                            formulaString = this._parseJsonFunction(jsonFormula, uiString);
                            break;

                        case 'NUMBER':
                            //make sure it's a number: replace JSON property to make sure there will not be errors in our UI (code view)
                            if (typeof jsonFormula.value != 'number')
                                jsonFormula.value = PocketCode.Math.Cast.toNumber(jsonFormula.value);
                            formulaString = jsonFormula.value;
                            if (uiString)
                                formulaString = PocketCode.Math.Cast.toString(formulaString);
                            break;

                        case 'SENSOR':
                            this._isStatic = false;
                            formulaString = this._parseJsonSensor(jsonFormula, uiString);
                            break;

                        case 'USER_VARIABLE':
                            if (uiString) {
                                var variable = this._variableNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] ||
                                    this._variableNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] ||
                                    this._variableNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                                formulaString = '"' + variable.name + '"';
                            }
                            else {
                                this._isStatic = false;
                                formulaString = 'uvh.getVariable("' + jsonFormula.value + '")';
                            }
                            break;

                        case 'USER_LIST':
                            if (uiString) {
                                var list = this._listNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] ||
                                    this._listNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] ||
                                    this._listNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                                formulaString = '*' + list.name + '*';
                            }
                            else {
                                this._isStatic = false;
                                formulaString = 'uvh.getList("' + jsonFormula.value + '")';
                            }
                            break;

                        case 'BRACKET':
                            formulaString = '(' + this._parseJsonType(jsonFormula.right, uiString) + ')';
                            break;

                        case 'STRING':
                            formulaString = '\'' + jsonFormula.value.replace(/(')/g, '\\$1').replace(/(\n)/g, '\\n') + '\'';
                            break;

                        case 'COLLISION_FORMULA':
                            //    if (uiString) //TODO
                            //        formulaString = 'touches_object(' + jsonFormula.value + ')';

                            this._isStatic = false;
                            //changed backend to deliver ids instead of names
                            formulaString = 'this._sprite.collidesWithSprite(\'' + jsonFormula.value + '\')';

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
                            break;

                        default:
                            throw new Error('formula parser: unknown type: ' + jsonFormula.type);     //TODO: do we need an onError event? -> new and unsupported operators?
                    }
                }
                //add casts: var cast = PocketCode.Math.Cast; injected in each formula   
                //null should not be called: but if the formula contains missing entries we add them here by casting null to the expected type
                if (!type)
                    return formulaString;
                if (type == 'value')
                    return 'cast.toValue(' + formulaString + ')';
                if (type == 'string')
                    return 'cast.toString(' + formulaString + ')';
                if (type == 'boolean')
                    return 'cast.toBoolean(' + formulaString + ')';
                if (type == 'number')
                    return 'cast.toNumber(' + formulaString + ')';
            },

            _concatOperatorFormula: function (jsonFormula, operator, uiString, type) {
                if (uiString)
                    return this._parseJsonType(jsonFormula.left, uiString) + operator + this._parseJsonType(jsonFormula.right, uiString);

                type = type || 'value';
                return '(' + this._parseJsonType(jsonFormula.left, uiString, type) + operator + this._parseJsonType(jsonFormula.right, uiString, type) + ')';
            },
            _parseJsonOperator: function (jsonFormula, uiString) {
                /* package org.catrobat.catroid.formulaeditor: enum Operators */
                switch (jsonFormula.value) {
                    case 'LOGICAL_AND':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' AND ', uiString);
                        return this._concatOperatorFormula(jsonFormula, ' && ', uiString, 'boolean');

                    case 'LOGICAL_OR':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' OR ', uiString);
                        return this._concatOperatorFormula(jsonFormula, ' || ', uiString, 'boolean');

                    case 'EQUAL':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' = ', uiString);
                        return 'PocketCode.Math.isEqual(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'NOT_EQUAL':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' ≠ ', uiString);
                        return '(!PocketCode.Math.isEqual(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + '))';

                    case 'SMALLER_OR_EQUAL':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' ≤ ', uiString);
                        return this._concatOperatorFormula(jsonFormula, ' <= ', uiString, 'number');

                    case 'GREATER_OR_EQUAL':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' ≥ ', uiString);
                        return this._concatOperatorFormula(jsonFormula, ' >= ', uiString, 'number');

                    case 'SMALLER_THAN':
                        return this._concatOperatorFormula(jsonFormula, ' < ', uiString, 'number');

                    case 'GREATER_THAN':
                        return this._concatOperatorFormula(jsonFormula, ' > ', uiString, 'number');

                    case 'PLUS':
                        return this._concatOperatorFormula(jsonFormula, ' + ', uiString, 'number');

                    case 'MINUS':
                        if (jsonFormula.left === null)    //singed number
                            return this._concatOperatorFormula(jsonFormula, '-', uiString, 'number');
                        return this._concatOperatorFormula(jsonFormula, ' - ', uiString, 'number');

                    case 'MULT':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' x ', uiString);
                        return this._concatOperatorFormula(jsonFormula, ' * ', uiString, 'number');

                    case 'DIVIDE':
                        if (uiString)
                            return this._concatOperatorFormula(jsonFormula, ' ÷ ', uiString);
                        return this._concatOperatorFormula(jsonFormula, ' / ', uiString, 'number');

                    case 'LOGICAL_NOT':
                        if (uiString)
                            return ' NOT ' + this._parseJsonType(jsonFormula.right, uiString);
                        return '(!' + this._parseJsonType(jsonFormula.right, uiString, 'boolean') + ')';

                    default:
                        throw new Error('formula parser: unknown operator: ' + jsonFormula.value);  //TODO: do we need an onError event? -> new and unsupported operators?
                }
            },

            _parseJsonFunction: function (jsonFormula, uiString) {
                /* package org.catrobat.catroid.formulaeditor: enum Functions
                *  SIN, COS, TAN, LN, LOG, PI, SQRT, RAND, ABS, ROUND, MOD, ARCSIN, ARCCOS, ARCTAN, EXP, FLOOR, CEIL, MAX, MIN, TRUE, FALSE, LENGTH, LETTER, JOIN;
                */
                switch (jsonFormula.value) {
                    case 'SIN':
                        if (uiString)
                            return 'sin(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.sin(this._degree2radian(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + '))';

                    case 'COS':
                        if (uiString)
                            return 'cos(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.cos(this._degree2radian(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + '))';

                    case 'TAN':
                        if (uiString)
                            return 'tan(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.tan(this._degree2radian(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + '))';

                    case 'LN':
                        if (uiString)
                            return 'ln(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.log(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'LOG':
                        if (uiString)
                            return 'log(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'this._log10(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'PI':
                        if (uiString)
                            return 'pi';
                        return 'Math.PI';

                    case 'SQRT':
                        if (uiString)
                            return 'sqrt(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.sqrt(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'RAND':
                        if (uiString)
                            return 'random(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';

                        this._isStatic = false;
                        //please notice: this function is quite tricky, as the 2 parametes can be switched (min, max) and we need to calculate this two values
                        //at runtime to determine which one to use
                        //if both partial results are integers, the random number will be a number without decimal places
                        //for calculation we need the scope of the formula itself! To solve this, the whole logic is included in our dynamic function
                        var lString = '(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';
                        var rString = '(' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ')';

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
                        if (uiString)
                            return 'abs(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.abs(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'ROUND':
                        if (uiString)
                            return 'round(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.round(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'MOD': //http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
                        if (uiString)
                            return 'mod(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';
                        return '(((' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ') % (' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ')) + (' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ')) % (' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ')';

                    case 'ARCSIN':
                        if (uiString)
                            return 'arcsin(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'this._radian2degree(Math.asin(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + '))';

                    case 'ARCCOS':
                        if (uiString)
                            return 'arccos(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'this._radian2degree(Math.acos(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + '))';

                    case 'ARCTAN':
                        if (uiString)
                            return 'arctan(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'this._radian2degree(Math.atan(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + '))';

                    case 'EXP':
                        if (uiString)
                            return 'exp(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.exp(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'POWER':
                        if (uiString)
                            return 'power(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';
                        return 'Math.pow(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ', ' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ')';

                    case 'FLOOR':
                        if (uiString)
                            return 'floor(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.floor(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'CEIL':
                        if (uiString)
                            return 'ceil(' + this._parseJsonType(jsonFormula.left, uiString) + ')';
                        return 'Math.ceil(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'MAX':
                        if (uiString)
                            return 'max(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';
                        return 'isNaN(' + this._parseJsonType(jsonFormula.left, uiString, 'value') + ') ? ' +
                                '(isNaN(' + this._parseJsonType(jsonFormula.right, uiString, 'value') + ') ? undefined : ' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ') : ' +
                               '(isNaN(' + this._parseJsonType(jsonFormula.right, uiString, 'value') + ') ? (' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ') : ' +
                               'Math.max(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ', ' + this._parseJsonType(jsonFormula.right, uiString, 'number') + '))';

                    case 'MIN':
                        if (uiString)
                            return 'min(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';
                        return 'isNaN(' + this._parseJsonType(jsonFormula.left, uiString, 'value') + ') ? ' +
                                '(isNaN(' + this._parseJsonType(jsonFormula.right, uiString, 'value') + ') ? undefined : ' + this._parseJsonType(jsonFormula.right, uiString, 'number') + ') : ' +
                               '(isNaN(' + this._parseJsonType(jsonFormula.right, uiString, 'value') + ') ? (' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ') : ' +
                               'Math.min(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ', ' + this._parseJsonType(jsonFormula.right, uiString, 'number') + '))';

                    case 'TRUE':
                        if (uiString)
                            return 'TRUE';
                        return 'true';

                    case 'FALSE':
                        if (uiString)
                            return 'FALSE';
                        return 'false';

                        //string
                    case 'LENGTH':
                        if (uiString)
                            return 'length(' + this._parseJsonType(jsonFormula.left, uiString) + ')';

                        return this._parseJsonType(jsonFormula.left, uiString, 'string') + '.length';

                    case 'LETTER':
                        if (uiString)
                            return 'letter(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';

                        //var idx = Number(this._parseJsonType(jsonFormula.left)) - 1; //given index (1..n)
                        // changed: index can also be a variable
                        return this._parseJsonType(jsonFormula.right, uiString, 'string') + '.charAt(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ' - 1 )';

                    case 'JOIN':
                        if (uiString)
                            return 'join(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';

                        return this._parseJsonType(jsonFormula.left, uiString, 'string') + '.concat(' + this._parseJsonType(jsonFormula.right, uiString, 'string') + ')';

                        //list
                    case 'NUMBER_OF_ITEMS':
                        if (uiString)
                            return 'number_of_items(' + this._parseJsonType(jsonFormula.left, uiString) + ')';

                        //this._isStatic = false;
                        return this._parseJsonType(jsonFormula.left) + '.length';

                    case 'LIST_ITEM':
                        if (uiString)
                            return 'element(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';

                        //this._isStatic = false;
                        return this._parseJsonType(jsonFormula.right) + '.valueAt(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'CONTAINS':
                        if (uiString)
                            return 'contains(' + this._parseJsonType(jsonFormula.left, uiString) + ', ' + this._parseJsonType(jsonFormula.right, uiString) + ')';

                        //this._isStatic = false;
                        return this._parseJsonType(jsonFormula.left) + '.contains(' + this._parseJsonType(jsonFormula.right, uiString, 'value') + ')';

                        //touch
                    case 'MULTI_FINGER_X':
                        if (uiString)
                            return 'screen_touch_x( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';

                        this._isStatic = false;
                        return 'this._device.getTouchX(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'MULTI_FINGER_Y':
                        if (uiString)
                            return 'screen_touch_y( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';

                        this._isStatic = false;
                        return 'this._device.getTouchY(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                    case 'MULTI_FINGER_TOUCHED':
                        if (uiString)
                            return 'screen_is_touched( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';

                        this._isStatic = false;
                        return 'this._device.isTouched(' + this._parseJsonType(jsonFormula.left, uiString, 'number') + ')';

                        //arduino
                    case 'ARDUINOANALOG':
                        if (uiString)
                            return 'arduino_analog_pin( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';

                        this._isStatic = false;
                        return 'this._device.getArduinoAnalogPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'ARDUINODIGITAL':
                        if (uiString)
                            return 'arduino_digital_pin( ' + this._parseJsonType(jsonFormula.left, uiString) + ' )';

                        this._isStatic = false;
                        return 'this._device.getArduinoDigitalPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    default:
                        throw new Error('formula parser: unknown function: ' + jsonFormula.value);    //TODO: do we need an onError event? -> new and unsupported operators?

                }
            },

            _parseJsonSensor: function (jsonFormula, uiString) {
                /* package org.catrobat.catroid.formulaeditor: enum Sensors
                *  X_ACCELERATION, Y_ACCELERATION, Z_ACCELERATION, COMPASS_DIRECTION, X_INCLINATION, Y_INCLINATION, LOUDNESS, FACE_DETECTED, FACE_SIZE, FACE_X_POSITION, FACE_Y_POSITION, OBJECT_X(true), OBJECT_Y(true), OBJECT_GHOSTEFFECT(true), OBJECT_BRIGHTNESS(true), OBJECT_SIZE(true), OBJECT_ROTATION(true), OBJECT_LAYER(true)
                */
                switch (jsonFormula.value) {
                    //device
                    case 'LOUDNESS':
                        if (uiString)
                            return 'loudness';

                        return 'this._sprite.volume';

                    case 'X_ACCELERATION':
                        if (uiString)
                            return 'acceleration_x';

                        return 'this._device.accelerationX';

                    case 'Y_ACCELERATION':
                        if (uiString)
                            return 'acceleration_y';

                        return 'this._device.accelerationY';

                    case 'Z_ACCELERATION':
                        if (uiString)
                            return 'acceleration_z';

                        return 'this._device.accelerationZ';

                    case 'X_INCLINATION':
                        if (uiString)
                            return 'inclination_x';

                        return 'this._device.inclinationX';

                    case 'Y_INCLINATION':
                        if (uiString)
                            return 'inclination_y';

                        return 'this._device.inclinationY';

                    case 'COMPASS_DIRECTION':
                        if (uiString)
                            return 'compass_direction';

                        return 'this._device.compassDirection';

                        //geo location
                    case 'LATITUDE':
                        if (uiString)
                            return 'latitude';

                        return 'this._device.geoLatitude';

                    case 'LONGITUDE':
                        if (uiString)
                            return 'longitude';

                        return 'this._device.geoLongitude';

                    case 'ALTITUDE':
                        if (uiString)
                            return 'altitude';

                        return 'this._device.geoAltitude';

                    case 'ACCURACY':
                    case 'LOCATION_ACCURACY':
                        if (uiString)
                            return 'location_accuracy';

                        return 'this._device.geoAccuracy';

                        //touch
                    case 'FINGER_X':
                        if (uiString)
                            return 'screen_touch_x';

                        return 'this._device.getTouchX(this._device.lastTouchIndex)';

                    case 'FINGER_Y':
                        if (uiString)
                            return 'screen_touch_y';

                        return 'this._device.getTouchY(this._device.lastTouchIndex)';

                    case 'FINGER_TOUCHED':
                        if (uiString)
                            return 'screen_is_touched';

                        return 'this._device.isTouched(this._device.lastTouchIndex)';

                    case 'LAST_FINGER_INDEX':
                        if (uiString)
                            return 'last_screen_touch_index';

                        return 'this._device.lastTouchIndex';

                        //face detection
                    case 'FACE_DETECTED':
                        if (uiString)
                            return 'is_face_detected';

                        return 'this._device.faceDetected';

                    case 'FACE_SIZE':
                        if (uiString)
                            return 'face_size';

                        return 'this._device.faceSize';

                    case 'FACE_X_POSITION':
                        if (uiString)
                            return 'face_x_position';

                        return 'this._device.facePositionX';

                    case 'FACE_Y_POSITION':
                        if (uiString)
                            return 'face_y_position';

                        return 'this._device.facePositionY';

                        //date and time
                    case 'CURRENT_YEAR':
                    case 'DATE_YEAR':
                        if (uiString)
                            return 'year';

                        return '(new Date()).getFullYear()';

                    case 'CURRENT_MONTH':
                    case 'DATE_MONTH':
                        if (uiString)
                            return 'month';

                        return '(new Date()).getMonth()';

                    case 'CURRENT_DATE':
                    case 'DATE_DAY':
                        if (uiString)
                            return 'day';

                        return '(new Date()).getDate()';

                    case 'CURRENT_DAY_OF_WEEK':
                    case 'DATE_WEEKDAY':
                        if (uiString)
                            return 'weekday';

                        return '((new Date()).getDay() > 0 ? (new Date()).getDay() : 7)';

                    case 'CURRENT_HOUR':
                    case 'TIME_HOUR':
                        if (uiString)
                            return 'hour';

                        return '(new Date()).getHours()';

                    case 'CURRENT_MINUTE':
                    case 'TIME_MINUTE':
                        if (uiString)
                            return 'minute';

                        return '(new Date()).getMinutes()';

                    case 'CURRENT_SECOND':
                    case 'TIME_SECOND':
                        if (uiString)
                            return 'second';

                        return '(new Date()).getSeconds()';

                        //case 'DAYS_SINCE_2000':
                        //    if (uiString)
                        //        return 'days_since_2000';

                        //    return '(new Date() - new Date(2000, 0, 1, 0, 0, 0, 0)) / 86400000';

                        //case 'TIMER':
                        //    if (uiString)
                        //        return 'timer';

                        //    return 'this._sprite.projectTimerValue';

                        //sprite
                    case 'OBJECT_BRIGHTNESS':
                        if (uiString)
                            return 'brightness';

                        return 'this._sprite.brightness';

                    case 'OBJECT_TRANSPARENCY':
                    case 'OBJECT_GHOSTEFFECT':
                        if (uiString)
                            return 'transparency';

                        return 'this._sprite.transparency';

                    case 'OBJECT_COLOR':
                        if (uiString)
                            return 'color';

                        return 'this._sprite.colorEffect';

                    case 'OBJECT_BACKGROUND_NUMBER':
                        if (uiString)
                            return 'background_number';
                        return 'this._sprite.sceneBackgroundNumber';    //scene not accessible directly in formula

                    case 'OBJECT_BACKGROUND_NAME':
                        if (uiString)
                            return 'background_name';
                        return 'this._sprite.sceneBackgroundName';    //scene not accessible directly in formula

                    case 'OBJECT_LOOK_NUMBER':
                        if (uiString)
                            return 'look_number';
                        return 'this._sprite.currentLookNumber';

                    case 'OBJECT_LOOK_NAME':
                        if (uiString)
                            return 'look_name';
                        return 'this._sprite.currentLookName';

                    case 'OBJECT_LAYER':
                        if (uiString)
                            return 'layer';

                        return 'this._sprite.layer';

                    case 'OBJECT_ROTATION': //=direction
                        if (uiString)
                            return 'direction';

                        return 'this._sprite.direction';

                    case 'OBJECT_SIZE':
                        if (uiString)
                            return 'size';

                        return 'this._sprite.size';

                    case 'OBJECT_X':
                        if (uiString)
                            return 'position_x';

                        return 'this._sprite.positionX';

                    case 'OBJECT_Y':
                        if (uiString)
                            return 'position_y';

                        return 'this._sprite.positionY';

                        //case 'OBJECT_DISTANCE_TO':    //TODO
                        //    if (uiString)
                        //        return 'position_y';

                        //    return 'this._sprite.positionY';

                        //collision
                    case 'COLLIDES_WITH_EDGE':
                        if (uiString)
                            return 'touches_edge';

                        return 'this._sprite.collidesWithEdge';

                    case 'COLLIDES_WITH_FINGER':
                        if (uiString)
                            return 'touches_finger';

                        return 'this._sprite.collidesWithPointer';

                        //physics
                    case 'OBJECT_X_VELOCITY':
                        if (uiString)
                            return 'x_velocity';

                        return 'this._sprite.velocityX';    //TODO: physics

                    case 'OBJECT_Y_VELOCITY':
                        if (uiString)
                            return 'y_velocity';

                        return 'this._sprite.velocityY';    //TODO: physics

                    case 'OBJECT_ANGULAR_VELOCITY':
                        if (uiString)
                            return 'angular_velocity';

                        return 'this._sprite.velocityAngular';  //TODO: physics

                        //nxt
                    case 'NXT_SENSOR_1':
                        if (uiString)
                            return 'NXT_sensor_1';

                        return 'this._device.nxt1';

                    case 'NXT_SENSOR_2':
                        if (uiString)
                            return 'NXT_sensor_2';

                        return 'this._device.nxt2';

                    case 'NXT_SENSOR_3':
                        if (uiString)
                            return 'NXT_sensor_3';

                        return 'this._device.nxt3';

                    case 'NXT_SENSOR_4':
                        if (uiString)
                            return 'NXT_sensor_4';

                        return 'this._device.nxt4';

                        //phiro
                    case 'PHIRO_FRONT_LEFT':
                        if (uiString)
                            return 'phiro_front_left_sensor';

                        return 'this._device.phiroFrontLeft';

                    case 'PHIRO_FRONT_RIGHT':
                        if (uiString)
                            return 'phiro_front_right_sensor';

                        return 'this._device.phiroFrontRight';

                    case 'PHIRO_SIDE_LEFT':
                        if (uiString)
                            return 'phiro_side_left_sensor';

                        return 'this._device.phiroSideLeft';

                    case 'PHIRO_SIDE_RIGHT':
                        if (uiString)
                            return 'phiro_side_right_sensor';

                        return 'this._device.phiroSideRight';

                    case 'PHIRO_BOTTOM_LEFT':
                        if (uiString)
                            return 'phiro_bottom_left_sensor';

                        return 'this._device.phiroBottomLeft';

                    case 'PHIRO_BOTTOM_RIGHT':
                        if (uiString)
                            return 'phiro_bottom_right_sensor';

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
PocketCode.FormulaParser = new PocketCode._FormulaParser();

