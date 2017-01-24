﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="userVariableHost.js" />
/// <reference path="imageStore.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="../model/scene.js" />
/// <reference path="broadcastManager.js" />
/// <reference path="collisionManager.js" />
/// <reference path="soundManager.js" />
/// <reference path="stopwatch.js" />
'use strict';

PocketCode.GameEngine = (function () {
    GameEngine.extends(PocketCode.UserVariableHost, false);

    function GameEngine(minLoopCycleTime) {
        PocketCode.UserVariableHost.call(this, PocketCode.UserVariableScope.GLOBAL);

        this._executionState = PocketCode.ExecutionState.INITIALIZED;
        this._minLoopCycleTime = minLoopCycleTime || 20; //ms
        this._resourceTotalSize = 0;
        this._resourceLoadedSize = 0;
        this._resourcesLoaded = false;
        this._bricksCount = 0;
        this._bricksLoaded = 0;
        this._scenesLoaded = false;

        this._id = '';
        this.title = '';
        this.description = '';
        this.author = '';
        this._originalScreenHeight = undefined;
        this._originalScreenWidth = undefined;
        this.resourceBaseUrl = '';

        this._imageStore = new PocketCode.ImageStore();
        this._imageStore.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
        this._imageStore.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
        this._imageStore.onLoad.addEventListener(new SmartJs.Event.EventListener(this._imageStoreLoadHandler, this));
        this.__sounds = {};

        this._soundManager = new PocketCode.SoundManager();
        this._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
        this._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
        this._soundManager.onLoad.addEventListener(new SmartJs.Event.EventListener(this._soundManagerLoadHandler, this));
        this._soundManager.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(this._soundManagerFinishedPlayingHandler, this));    //check if project has finished executing
        this._loadingAlerts = {
            invalidSoundFiles: [],
            unsupportedBricks: [],
            deviceUnsupportedFeatures: [],
            deviceEmulation: false,
            deviceLockRequired: false,
        };

        this._collisionManager = undefined;//new PocketCode.CollisionManager();

        this._scenes = {};
        this.__currentScene = undefined;
        this._startScene = undefined;

        //events
        this._onLoadingProgress = new SmartJs.Event.Event(this);
        //this._onScenesInitialized = new SmartJs.Event.Event(this);
        this._onSceneChanged = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);

        this._onBeforeProgramStart = new SmartJs.Event.Event(this);
        //this._onProgramStart = new SmartJs.Event.Event(this);
        this._onProgramExecuted = new SmartJs.Event.Event(this);
        this._onSpriteUiChange = new SmartJs.Event.Event(this); //TODO
        this._onVariableUiChange = new SmartJs.Event.Event(this);
        this._onCameraUsageChange = new SmartJs.Event.Event(this);
        //map the base class (global variable host) to our public event
        this._onVariableChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onVariableUiChange.dispatchEvent({ id: e.id, properties: e.properties }, e.target); }, this));
    }

    //events
    Object.defineProperties(GameEngine.prototype, {
        onLoadingProgress: {
            get: function () { return this._onLoadingProgress; },
        },
        //onScenesInitialized: {
        //    get: function () { return this._onScenesInitialized; },
        //},
        onSceneChanged: {
            get: function () { return this._onSceneChanged; },
        },
        onLoad: {
            get: function () { return this._onLoad; },
        },
        onLoadingError: {
            get: function () { return this._onLoadingError; },
        },
        onBeforeProgramStart: {
            get: function () { return this._onBeforeProgramStart; },
        },
        //onProgramStart: {
        //    get: function () { return this._currentScene.onProgramStart; }, //todo
        //},
        onProgramExecuted: {
            get: function () { return this._onProgramExecuted; },
        },
        onSpriteUiChange: {
            get: function () { return this._onSpriteUiChange; },    //TODO
        },
        onVariableUiChange: {
            get: function () { return this._onVariableUiChange; },
        },
        //onSpriteTappedAction: {
        //    get: function () { return this._currentScene.onSpriteTappedAction; },
        //},
        onTouchStartAction: {
            get: function () { return this._onTouchStartAction; },
        },
        onCameraUsageChange: {
            get: function () {
                return this._onCameraUsageChange;  //TODO: in use?
            }
        },
    });

    //properties
    Object.defineProperties(GameEngine.prototype, {
        _currentScene: {
            get: function () {
                return this.__currentScene;
            },
            set: function (scene) {
                if (!(scene instanceof PocketCode.Model.Scene))
                    throw new Error('invalid argument: scene');
                if (this.__currentScene === scene)
                    return;

                this.__currentScene = scene;
                this._onSceneChanged.dispatchEvent({
                    id: scene.id,
                    renderingSprites: scene.renderingSprites,
                    renderingTexts: this.renderingVariables.concat(scene.renderingVariables),
                    screenSize: scene.screenSize,
                });
            },
        },
        //project execution
        executionState: {
            get: function () {
                if (this._currentScene)
                    return this._currentScene._executionState;
                //else undefined
            },
        },
        projectLoaded: {
            get: function () {
                return this._resourcesLoaded && this._scenesLoaded;
            },
        },
        //projectScreenSize: {
        //    get: function () {
        //        return { width: this._originalScreenWidth, height: this._originalScreenHeight };
        //    },
        //},
        muted: {
            set: function (value) {
                if (typeof value !== 'boolean')
                    throw new Error('invalid parameter: muted');
                this._soundManager.muted = value;
            },
        },
        _sounds: {
            set: function (sounds) {
                if (!(sounds instanceof Array))
                    throw new Error('setter expects type Array');

                for (var i = 0, l = sounds.length; i < l; i++)
                    this.__sounds[sounds[i].id] = sounds[i];

                this._soundManager.loadSounds(this._resourceBaseUrl, sounds);
            },
        },
        collisionManager: { //TODO: public?
            get: function () {
                if (!this._currentScene)
                    return undefined;

                return this._currentScene.collisionManager;
            },
        },
    });

    //methods
    GameEngine.prototype.merge({
        //reloadProject: function () {
        //    if (!this._jsonProject)
        //        throw new Error('no project loaded');

        //    this.loadProject(this._jsonProject);
        //},
        loadProject: function (jsonProject) {
            if (this._disposing || this._disposed)
                return;
            if (this._executionState == PocketCode.ExecutionState.PAUSED || this._executionState == PocketCode.ExecutionState.RUNNING)
                this.stopProject();

            if (typeof jsonProject != 'object')
                throw new Error('invalid argument: json project');
            else
                this._jsonProject = jsonProject;

            this._scenesLoaded = false;
            this._resourcesLoaded = false;
            this._loadingAlerts = {
                invalidSoundFiles: [],
                unsupportedBricks: [],
                deviceUnsupportedFeatures: [],
                deviceEmulation: false,
                deviceLockRequired: false,
            };

            this._id = jsonProject.id;
            var header = jsonProject.header;
            this.title = header.title;
            this.description = header.description;
            this.author = header.author;
            this._originalScreenHeight = header.device.screenHeight;
            this._originalScreenWidth = header.device.screenWidth;

            //resource sizes
            this._resourceTotalSize = 0;
            this._resourceLoadedSize = 0;
            var i, l;
            for (i = 0, l = jsonProject.images.length; i < l; i++) {
                this._resourceTotalSize += jsonProject.images[i].size;
            }
            for (i = 0, l = jsonProject.sounds.length; i < l; i++) {
                this._resourceTotalSize += jsonProject.sounds[i].size;
            }

            this._onLoadingProgress.dispatchEvent({ progress: 0 });
            if (this._resourceTotalSize === 0)
                this._resourcesLoaded = true;
            else {
                this._resourceBaseUrl = jsonProject.resourceBaseUrl;
                this._imageStore.loadImages(this._resourceBaseUrl, jsonProject.images);
                //sounds are loaded after images using the image stores onLoad event
            }

            //make sure vars and lists are defined before creating bricks and sprites
            this._variables = jsonProject.variables || [];
            this._lists = jsonProject.lists || [];

            if (this._device)
                this._device.dispose();
            this._device = SmartJs.Device.isMobile ? new PocketCode.MediaDevice(this._soundManager) : new PocketCode.DeviceEmulator(this._soundManager);
            //console.log("STARTING GAME ENGINE");
            this._device.onSpaceKeyDown.addEventListener(new SmartJs.Event.EventListener(this._deviceOnSpaceKeyDownHandler, this));
            this._device.onCameraChange.addEventListener(new SmartJs.Event.EventListener(this._deviceOnCameraChangeHandler, this));

            //console.log("_onCameraUsageChange:", this._onCameraUsageChange);

            this.__currentScene = undefined;
            for (var id in this._scenes) {
                this._scenes[id].dispose();
                delete this._scenes[id];
            }


            this._spritesLoadingProgress = 0;
            this._bricksCount = jsonProject.header.bricksCount;

            if (!jsonProject.scenes || jsonProject.scenes.length < 1)
                throw new Error('No scene found in project');

            var broadcasts = jsonProject.broadcasts || [];
            var jsonScenes = jsonProject.scenes,
                scene;

            for (var i = 0, l = jsonScenes.length; i < l; i++) {
                scene = new PocketCode.Model.Scene(this, this._device, this._soundManager, broadcasts, this._minLoopCycleTime);
                //this._sceneIds.push(scene.id);
                scene.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._sceneOnProgressChangeHandler, this));
                scene.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(this._sceneUnsupportedBricksHandler, this));
                this._scenes[scene.id] = scene;

                //TODO: bind to scene.onExecuted.. check for this._soundManager.isPlaying to check
                scene.load(jsonScenes[i]);

                if (i == 0)
                    this._startScene = scene;
            }

            this._scenesLoaded = true;
            this._sceneOnProgressChangeHandler({ bricksLoaded: 0 });

        },
        //loading handler
        _sceneOnProgressChangeHandler: function (e) {

            //this._bricksCount = 0;
            this._bricksLoaded += e.bricksLoaded;
            //var progress = this._bricksCount > 0 ? Math.round(this._bricksLoaded / this._bricksCount * 1000) / 10 : 100;

            if (/*progress == 100 &&*/ this._scenesLoaded) {

                //this._scenesProgressList[e.target._id] = e.progress;
                //this._fullProgress = 0;

                //for (var i = 0, l = this._sceneIds.length; i < l; i++) {
                //    var id = this._sceneIds[i];
                //    this._fullProgress += this._scenesProgressList[id];
                //}

                //if (this._fullProgress === 100) {
                //this._scenesLoaded = true;
                //for (var i = 0, l = this._sceneIds.length; i < l; i++) {
                //    var id = this._sceneIds[i];
                //    this._scenes[id].removeSpriteFactoryEventListeners();
                //}
                if (this._resourcesLoaded) {
                    //window.setTimeout(function () { this._onLoad.dispatchEvent(); }.bind(this), 100);    //update UI before
                    //this._initSceneSprites();
                    this._handleLoadingComplete();
                }
            }
            else {
                this._dispatchLoadingProgress();
                //this._spritesLoadingProgress = this._fullProgress;
                //var resourceProgress = Math.round(this._resourceLoadedSize / this._resourceTotalSize * 1000) / 10;
                //this._onLoadingProgress.dispatchEvent({ progress: Math.min(resourceProgress, progress) });
            }
        },
        _sceneUnsupportedBricksHandler: function (e) {
            this._loadingAlerts.unsupportedBricks.concat(e.unsupportedBricks);
            //this._onLoadingAlert.dispatchEvent({ bricks: e.unsupportedBricks });
        },
        //todo this initsialises all spritest from all scenes -> might be too much
        //_initSceneSprites: function () {
        //    for (var id in this._scenes)
        //        this._scenes[id].initializeSprites();

        //    //for (var i = 0, l = this._sceneIds.length; i < l; i++) {
        //    //    var id = this._sceneIds[i];
        //    //    this._scenes[id].initializeSprites();
        //    //}
        //},
        _resourceProgressChangeHandler: function (e) {
            if (!e.file || !e.file.size)
                return;

            var size = e.file.size;
            this._resourceLoadedSize += size;
            this._dispatchLoadingProgress();
            //var resourceProgress = Math.round(this._resourceLoadedSize / this._resourceTotalSize * 1000) / 10;
            //this._onLoadingProgress.dispatchEvent({ progress: Math.min(resourceProgress, this._spritesLoadingProgress) });
        },
        _dispatchLoadingProgress: function () {
            var sceneProgress = this._bricksCount > 0 ? Math.round(this._bricksLoaded / this._bricksCount * 1000) / 10 : 100;
            var resourceProgress = Math.round(this._resourceLoadedSize / this._resourceTotalSize * 1000) / 10;
            this._onLoadingProgress.dispatchEvent({ progress: Math.min(resourceProgress, sceneProgress) });
        },
        _imageStoreLoadHandler: function (e) {
            //init loading sound files (as soon images are loaded)
            this._sounds = this._jsonProject.sounds || [];
        },
        _soundManagerLoadHandler: function (e) {
            if (this._resourceLoadedSize !== this._resourceTotalSize)
                return; //load may trigger during loading single (cached) dynamic sound files (e.g. tts)
            this._resourcesLoaded = true;
            if (this._scenesLoaded) {
                //window.setTimeout(function () { this._onLoad.dispatchEvent(); }.bind(this), 100);    //update UI before
                //this._initSceneSprites();
                this._handleLoadingComplete();
            }
        },
        _handleLoadingComplete: function () {
            //this._currentScene = this._sceneIds.length > 0 ? this._scenes[this._sceneIds[0]] : undefined;   //first

            //init scene sprites
            for (var id in this._scenes)
                this._scenes[id].initializeSprites();

            var loadingAlerts = this._loadingAlerts;
            var device = this._device;

            loadingAlerts.deviceUnsupportedFeatures = device.unsupportedFeatures;
            loadingAlerts.deviceEmulation = device.emulationInUse;
            loadingAlerts.deviceLockRequired = device.mobileLockRequired;

            if (loadingAlerts.deviceEmulation || loadingAlerts.deviceLockRequired || loadingAlerts.invalidSoundFiles.length != 0 ||
                loadingAlerts.unsupportedBricks.length != 0 || loadingAlerts.deviceUnsupportedFeatures.length != 0) {
                this._onLoadingProgress.dispatchEvent({ progress: 100 });       //update ui progress
                this._onLoad.dispatchEvent({ loadingAlerts: loadingAlerts });   //dispatch warnings
            }
            else {
                this._currentScene = this._startScene;
                this._onLoad.dispatchEvent();
                //for (var c in this._scenes) {
                //  this._currentScene = this._scenes[c];
                //  break;
                //}
            }
        },
        _resourceLoadingErrorHandler: function (e) {
            if (e.target === this._soundManager)
                this._loadingAlerts.invalidSoundFiles.push(e.file);
            else
                this._onLoadingError.dispatchEvent({ files: [e.file] });
        },
        _deviceOnCameraChangeHandler: function (e) {
            //console.log("CAMERA CHANGED HANDLER");
            this._onCameraUsageChange.dispatchEvent(e);
        },
        _deviceOnSpaceKeyDownHandler: function (e) {
            var cs = this._currentScene;
            if (cs.executionState === PocketCode.ExecutionState.RUNNING)
                cs.onSpriteTappedAction.dispatchEvent({ sprite: cs.background });
        },
        //project interaction
        runProject: function (reinitSprites) {
            var currentScene = this._currentScene;
            if (!currentScene || currentScene.executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (!this.projectLoaded)
                throw new Error('no project loaded');

            if (currentScene.executionState === PocketCode.ExecutionState.PAUSED)
                return this.resumeProject();

            if (this._device)   //not defined if project lot loaded
                this._device.reset();
            //if (reinitSprites !== false)
            //    reinitSprites = true;
            //if reinit: all sprites properties have to be set to their default values: default true
            currentScene = this._currentScene = this._startScene;
            if (reinitSprites != false && currentScene.executionState !== PocketCode.ExecutionState.INITIALIZED) {
                this._resetVariables();  //global
                this._onBeforeProgramStart.dispatchEvent({ reinit: true });
            }
            else
                this._onBeforeProgramStart.dispatchEvent();  //indicates the project was loaded and rendering objects can be generated

            //console.log("scene start: " );
            currentScene.start();
        },
        restartProject: function (reinitSprites) {
            this.stopProject();
            //this.projectTimer.stop();
            window.setTimeout(this.runProject.bind(this, reinitSprites), 200);   //some time needed to update callstack (running methods), as this method is called on a system (=click) event
        },
        pauseProject: function () {
            if(this._device)
            this._device.pause();
            if (this._currentScene)
                return this._currentScene.pause();
            return false;
        },
        resumeProject: function () {
            //console.log("current scene :", this._currentScene);
            if(this._device)
            this._device.resume();
            if (this._currentScene)
                return this._currentScene.resume();
            return false;
        },
        stopProject: function () {
            this._soundManager.stopAllSounds();
            //TODO? this._device.stop();
            for (var id in this._scenes)
                this._scenes[id].stop();
            //if (this._currentScene)
            //    return this._currentScene.stop();
            return false;
        },
        _soundManagerFinishedPlayingHandler: function () {
            //TODO: moved to scene: make sure to write another handler for sound checking if currentScene is stopped
        },
        getLookImage: function (id) {
            //used by the sprite to access an image during look init
            return this._imageStore.getImage(id);
        },
        handleUserAction: function (e) {
            if (this._currentScene)
                this._currentScene.handleUserAction(e);
        },
        getSceneById: function (id) {   //TODO public required?
            if (!this._scenes[id])
                throw new Error('no Scene with id ' + id + ' found');
            return this._scenes[id];
        },
        //changeScene: function (sceneId) {
        //    if (sceneId === this._currentScene.id)
        //        return;
        //    var sceneToStart = this.getSceneById(sceneId);
        //    if (!sceneToStart)
        //        throw new Error("changeScene: scene could not be found");
        //    this._currentScene.pause();
        //    this._currentScene = sceneToStart;
        //    //todo inform rendering

        //    this._currentScene.start();
        //},
        startScene: function (sceneId) {
            var scene = this.getSceneById(sceneId);
            if (!scene)
                return false;
            var cs = this._currentScene;
            if (cs && cs !== scene)
                cs.pause();

            this._currentScene = scene;
            scene.start();
            return true;
            //else
            //if (!scene || !cs)
            //    return false;
            //if (cs.id == sceneId && cs.executionState == PocketCode.ExecutionState.RUNNING)
            //    return false;

            //TODO: set to current scene + start
        },
        resumeOrStartScene: function (sceneId) {
            var scene = this.getSceneById(sceneId);
            var cs = this._currentScene;
            if (cs && cs !== scene)
                cs.pause();

            this._currentScene = scene;
            if (scene.executionState == PocketCode.ExecutionState.PAUSED)
                scene.resume();
            else if (scene.executionState !== PocketCode.ExecutionState.RUNNING)
                scene.start();
            else
                return false;

            return true;

            //if (scene.executionState == PocketCode.ExecutionState.PAUSED)
            //    scene.resume;


            //    if (!this._currentScene || this._currentScene.id == sceneId)
            //    return false;

            //TODO:  set to current scene + start or resume depending on its execution state
        },

        /* override */
        dispose: function () {
            if (this._disposed)
                return; //may occur when dispose on error

            this.stopProject();

            if (this._device) {
                this._device.onSpaceKeyDown.removeEventListener(new SmartJs.Event.EventListener(this._deviceOnSpaceKeyDownHandler, this));
                this._device.onCameraChange.removeEventListener(new SmartJs.Event.EventListener(this._deviceOnCameraChangeHandler, this));
            }
            this._imageStore.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
            this._imageStore.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
            this._imageStore.abortLoading();
            //this._imageStore.dispose();

            this._soundManager.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
            this._soundManager.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
            this._soundManager.onFinishedPlaying.removeEventListener(new SmartJs.Event.EventListener(this._soundManagerFinishedPlayingHandler, this));
            //this._soundManager.stopAllSounds();   //already stopped in stopProject()
            //this._soundManager.dispose();


            //TODO: remove code below and make sure scenes are disposed
            // if (this._background)
            //     this._background.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            //
            // delete this._originalSpriteOrder;
            // var scenes = this._scenes;
            // for (var j = 0, lengthScenes = scenes.length; j < lengthScenes; j++) {
            //     var sprites = scenes[j].sprites;
            //     for (var i = 0, l = sprites.length; i < l; i++) {
            //         sprites[i].onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            //     }
            // }

            //call super
            PocketCode.UserVariableHost.prototype.dispose.call(this);
        },
    });

    return GameEngine;
})();