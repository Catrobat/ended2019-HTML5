/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="userVariableHost.js" />
/// <reference path="sprite.js" />
/// <reference path="ImageStore.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/soundManager.js" />
'use strict';

PocketCode.GameEngine = (function () {
    GameEngine.extends(PocketCode.UserVariableHost, false);

    function GameEngine() {
        PocketCode.UserVariableHost.call(this, PocketCode.UserVariableScope.GLOBAL);

        this._executionState = PocketCode.ExecutionState.STOPPED;
        this._minLoopCycleTime = 25; //ms        //TODO:
        this._assetsLoaded = false;
        this._spritesLoaded = false;
        this.assetSize = 0;
        this.assetLoadingProgress = 0;
        this.projectReady = false;

        this._id = "";
        this.title = "";
        this.description = "";
        this.author = "";
        this._screenHeight = 0;
        this._screenWidth = 0;

        this._background = undefined;
        this._sprites = [];
        //this._images = [];    //there is a private accessor already

        this.resourceBaseUrl = "";

        this._imageStore = new PocketCode.ImageStore();//Math.min(SmartJs.Ui.Window.height, SmartJs.Ui.Window.width))   -> avaliable onLoad
        //this.__images = {};
        this.__sounds = {};

        this._soundManager = new PocketCode.SoundManager();
        this._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._soundManagerOnLoadingErrorHandler, this));
        this._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._assetProgressChangeHandler, this));
        this._soundManager.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));    //check if project has finished executing

        this._broadcasts = [];
        this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);

        //events
        this._onLoadingProgress = new SmartJs.Event.Event(this);

        this._onBeforeProgramStart = new SmartJs.Event.Event(this);
        this._onProgramStart = new SmartJs.Event.Event(this);
        this._onProgramExecuted = new SmartJs.Event.Event(this);
        this._onSpriteChange = new SmartJs.Event.Event(this);
        this._onTabbedAction = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(GameEngine.prototype, {
        //background: {     //currently not in use- we're keeping them anyway
        //    get: function () {
        //        return this._background;
        //    },
        //},
        //sprites: {
        //    get: function() {
        //        return this._sprites;
        //    },
        //},
        //images: {   //public getter required for rendering //TODO??
        //    get: function () {
        //        return this.__images;
        //    }
        //},
        //_images: {
        //    set: function (images) {
        //        if (!(images instanceof Array))
        //            throw new Error('setter expects type Array');

        //        for (var i = 0, l = images.length; i < l; i++)
        //            this.__images[images[i].id] = images[i];
        //    },
        //    //enumerable: false,
        //    //configurable: true,
        //},
        _sounds: {
            set: function (sounds) {
                if (!(sounds instanceof Array))
                    throw new Error('setter expects type Array');

                for (var i = 0, l = sounds.length; i < l; i++)
                    this.__sounds[sounds[i].id] = sounds[i];

                this._soundManager.init(sounds);
            },
            //enumerable: false,
            //configurable: true,
        },

        broadcasts: {
            set: function (broadcasts) {
                if (!(broadcasts instanceof Array))
                    throw new Error('setter expects type Array');

                //for (i = 0, l = broadcasts.length; i < l; i++)
                //    this._broadcasts[broadcasts[i].id] = broadcasts[i];
                this._broadcasts = broadcasts;
                this._broadcastMgr.init(broadcasts);
            },
            //enumerable: false,
            //configurable: true,
        }
    });

    //events
    Object.defineProperties(GameEngine.prototype, {
        onLoadingProgress: {
            get: function () {
                return this._onLoadingProgress;
            }
            //enumerable: false,
            //configurable: true,
        },
        onBeforeProgramStart: {
            get: function () { return this._onBeforeProgramStart; },
            //enumerable: false,
            //configurable: true,
        },
        onProgramStart: {
            get: function () { return this._onProgramStart; },
            //enumerable: false,
            //configurable: true,
        },
        onProgramExecuted: {
            get: function () { return this._onProgramExecuted; },
            //enumerable: false,
            //configurable: true,
        },
        onSpriteChange: {
            get: function () { return this._onSpriteChange; },
            //enumerable: false,
            //configurable: true,
        },
        onTabbedAction: {
            get: function () { return this._onTabbedAction; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    GameEngine.prototype.merge({

        loadProject: function (jsonProject) {
            if (this._executionState !== PocketCode.ExecutionState.STOPPED)
                this.stopProject();

            this._spritesLoaded = false;
            this._assetsLoaded = false;

            this.projectReady = false;
            this._id = jsonProject.id;
            var header = jsonProject.header;
            this.title = header.title;
            this.description = header.description;
            this.author = header.author;
            this._screenHeight = header.device.screenHeight;
            this._screenWidth = header.device.screenWidth;

            if (this._background)
                this._background.dispose();// = undefined;
            this._sprites.dispose();

            //asset sizes
            var soundSize = 0;
            for (i = 0, l = jsonProject.sounds.length; i < l; i++) {
                soundSize += jsonProject.sounds[i].size;
            }

            //todo handle instead of merely skipping
            if (!this._soundManager.supported) {
                soundSize = 0;
            }

            var imageSize = 0;
            for (i = 0, l = jsonProject.images.length; i < l; i++) {
                imageSize += jsonProject.images[i].size;
            }
            this.assetSize = imageSize + soundSize;
            if (!this.assetSize) {
                this._assetsLoaded = true;
                this.assetLoadingProgress = 100;
            }

            this._sounds = jsonProject.sounds || [];

            this._broadcasts = jsonProject.broadcasts || [];
            this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);

            //make sure vars and lists are defined before creating bricks and sprites
            this._variables = jsonProject.variables || [];
            this._lists = jsonProject.lists || [];

            var device = new PocketCode.Device(this._soundManager);
            var bricksCount = jsonProject.header.bricksCount;
            if (bricksCount <= 0)
                this._spritesLoaded = true;

            this._spriteFactory = new PocketCode.SpriteFactory(device, this, this._broadcastMgr, this._soundManager, bricksCount);
            this._spriteFactory.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnProgressChangeHandler, this));

            this._background = this._spriteFactory.create(jsonProject.background);//new PocketCode.Sprite(this, jsonProject.background);

            var sp = jsonProject.sprites;
            var sprite, i, l;
            for (i = 0, l = sp.length; i < l; i++) {
                sprite = this._spriteFactory.create(sp[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
                this._sprites.push(sprite);
            }

            //image loading using store
            //set initial scaling: default = 1
            //TODO: (commented out due to testing) ): make sure to use the screen params + pixelRatio if needed as the window may not be maximized on desktops
            //this._imageStore.scaling = Math.min(SmartJs.Ui.Window.height / this._screenHeight, SmartJs.Ui.Window.width / this._screenWidth, 1);

            this._imageStore.loadImages(jsonProject.resourceBaseUrl, jsonProject.images, imageSize);

            //var img = jsonProject.images;
            //var images = [];
            //var self = this;

            //for (i = 0, l = img.length; i < l; i++) {
            //    var image = img[i];
            //    image.imageObject = new Image();
            //    image.imageObject.size = image.size;    //TODO: size is not an existing property and may not be supprted
            //    image.imageObject.onload = function (e) {
            //        e.size = e.target.size;
            //        self._assetProgressChangeHandler(e);
            //    };
            //    image.imageObject.onerror = this._imageLoadingErrorHandler;

            //    image.imageObject.src = img[i].url;     //TODO: if you load all images simultaneously the progress will not continously increase
            //    //does this work without adding them to the DOM in all browsers?
            //    images.push(image);
            //}
            //this._images = images;

            //sp = this._sprites;
            //for (i = 0, l = sp.length; i < l; i++) {
            //    sp[i].onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            //}

            //this._projectLoaded = true;
        },
        _imageLoadingErrorHandler: function (e) {
            throw new Error("No image found at " + e.target.src);
        },
        _soundManagerOnLoadingErrorHandler: function (e) {
            throw new Error("Could not load sound" + e.src);
        },

        _spriteFactoryOnProgressChangeHandler: function (e) {
            if (e.progress === 100) {
                this._spritesLoaded = true;
                if (this._assetsLoaded) {
                    this.projectReady = true;
                }
            }
        },
        _assetProgressChangeHandler: function (e) {
            if (!e.size || !this.assetSize) {
                return;
            }

            this.assetLoadingProgress += e.size;
            var percentage = (this.assetLoadingProgress / this.assetSize) * 100;

            //console.log(percentage + "% loaded (+ "+(e.size / this.assetSize) * 100+"%)");

            if (percentage === 100) {
                this._assetsLoaded = true;
            }
            if (this._assetsLoaded && this._spritesLoaded) {
                //if(percentage === 100 && this._spritesLoaded){
                this.projectReady = true;
            }
            this._onLoadingProgress.dispatchEvent({ progress: percentage });

        },
        runProject: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (!this.projectReady) {
                throw new Error('no project loaded');
            }//this._background && this._sprites.length === 0 || !this.projectReady)    -> in theory there do not have to be a sprite or beackground

            this._executionState = PocketCode.ExecutionState.RUNNING;
            this._onBeforeProgramStart.dispatchEvent();  //indicates the project was loaded and rendering objects can be generated
            this.onProgramStart.dispatchEvent();    //notifies the listerners (bricks) to start executing
        },

        restartProject: function (reinitSprites) {
            this.stopProject();
            //if reinit: all sprites properties have to be set to their default values: default true
            if (reinitSprites !== false) {
                this._background.init();

                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++)
                    sprites[i].init();
            }
            this.runProject();
        },

        pauseProject: function () {
            if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                return;

            this._soundManager.pauseSounds();
            if (this._background)
                this._background.pauseScripts();

            for (var i = 0, l = this._sprites.length; i < l; i++) {
                this._sprites[i].pauseScripts();
            }
            this._executionState = PocketCode.ExecutionState.PAUSED;
        },

        resumeProject: function () {
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)
                return;

            this._soundManager.resumeSounds();
            if (this._background)
                this._background.resumeScripts();

            for (var i = 0, l = this._sprites.length; i < l; i++) {
                this._sprites[i].resumeScripts();
            }
            this._executionState = PocketCode.ExecutionState.RUNNING;
        },

        stopProject: function () {
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;
            this._soundManager.stopAllSounds();
            if (this._background)
                this._background.stopScripts();

            for (var i = 0, l = this._sprites.length; i < l; i++) {
                this._sprites[i].stopScripts();
            }
            this._executionState = PocketCode.ExecutionState.STOPPED;
        },

        _spriteOnExecutedHandler: function (e) {
            if (this._soundManager.isPlaying)
                return;

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].scriptsRunning)//status !== PocketCode.ExecutionState.STOPPED)
                    return;
            }

            this._executionState = PocketCode.ExecutionState.STOPPED;
            this._onProgramExecuted.dispatchEvent();
        },

        //Brick-Sprite Interaction
        getSpriteById: function (spriteId) {
            //var sprite = this._sprites.filter(function (sprite) { return sprite.id === spriteId; })[0];   //a loop is faster than a filter (>55% slower) especially when searching for 1 element only
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].id === spriteId)
                    return sprites[i];
            }

            throw new Error('unknown sprite with id: ' + spriteId);
        },
        getSpritesAsPropertyList: function () {
            var props = [this._background.renderingProperties];
            for (var i = 0, l = this._sprites.length; i < l; i++)
                props.push(this._sprites[i].renderingProperties);
            return props;
        },
        getSpriteLayer: function (sprite) { //including background (usind in formulas)
            if (sprite === this._background)
                return 0;
            var idx = this._sprites.indexOf(sprite);
            if (idx < 0)
                throw new Error('sprite not found: getSpriteLayer');
            return idx + 1;
        },

        setSpriteLayerBack: function (sprite, layers) {
            var sprites = this._sprites;
            var idx = sprites.indexOf(sprite);
            if (idx == 0)
                return false;
            var count = sprites.remove(sprite);
            if (count == 0)
                return false;

            idx = Math.max(idx - layers, 0);
            sprites.insert(idx, sprite);

            this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: { layer: idx + 1 } }, sprite);    //TODO: check event arguments
            return true;
        },

        setSpriteLayerToFront: function (sprite) {
            var sprites = this._sprites;
            if (sprites.indexOf(sprite) === sprites.length - 1)
                return false;
            var count = sprites.remove(sprite);
            if (count == 0)
                return false;
            sprites.push(sprite);

            this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: { layer: sprites.length } }, sprite);
            return true;
        },
        //_getSpritesTrimOffsetsFromCache: function (sprite, top, right, bottom, left) {
        //    //TODO:
        //    //direction, size, rotationStyle, currentLook changes -> recalculate using imageHempler, else: return from cache
        //},
        ifSpriteOnEdgeBounce: function (sprite) {    //Id, sprite) {  //TODO: check parameters:sprite.rotationStyle???    call: sprite.bounceTo(angle, posX, posY) new method?

            //return false; //TODO: included to avoid failing tests so i can push!!!!!!!!!!!

            //program viewport
            var spriteSize;
            var sh = this._screenHeight,
                sw = this._screenWidth;
            //if (sprite.currentLook) {   //this may be undefined
            var imageId = sprite.currentLook ? sprite.currentLook.imageId : undefined,
                scaling = sprite.size / 100,
                angle = sprite.rotationStyle === PocketCode.RotationStyle.ALL_AROUND ? sprite.direction - 90 : 0,
                //^^ sprite has a direction but is not rotated
                flipX = sprite.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && sprite.direction < 0 ? true : false;

            if (!imageId)   //no look defined (cannot be changed either: so no need to handle this)
                return false;

            var overflow = this._imageStore.getViewportOverflow(sh, sw, sprite.id, imageId, scaling, angle, flipX, sprite.positionX + sw / 2, sprite.positionY + sh / 2);
            //TODO: make sure this is correct (specification): if there is an overflow on both sides we we ignore it
            //TODO: how to handle overflows that cause another overflow during movement? - ignore it? move to edge & which one?
            if (overflow.top > 0 && overflow.bottom > 0) {
                overflow.bottom = 0;
                overflow.top = 0;
            }
            if (overflow.left > 0 && overflow.right > 0) {
                overflow.left = 0;
                overflow.right = 0;
            }

            //move and rotate
            var dir = sprite.direction,
                newPosX = sprite.positionX,
                newPosY = sprite.positionY;
            if (overflow.top) {
                newPosY += overflow.top;
                if (Math.abs(dir) < 90)
                    dir = dir > 0 ? 180 - dir : -180 - dir; //make sure we do not get an angle > +-180
            }
            if (overflow.right) {
                newPosX -= overflow.right;
                if (dir > 0 && dir < 180)
                    dir = -dir;
            }
            if (overflow.bottom) {
                newPosY -= overflow.bottom;
                if (Math.abs(dir) > 90)
                    dir = dir > 0 ? 180 - dir : -180 - dir;
            }
            if (overflow.left) {
                newPosX += overflow.left;
                if (dir < 0)    //there is no -180
                    dir = -dir;
            }

            //do we have to check again: direction may change -> check on rotation
            var sdir = sprite.direction;
            if (dir != sdirection && sprite.rotationStyle !== PocketCode.RotationStyle.DO_NOT_ROTATE) {
                var flipped = (dir >= 0 && sdir < 0) || (dir < 0 && sdir >= 0);
                //if (sprite.rotationStyle === PocketCode.RotationStyle.ALL_AROUND)
                angle = dir - 90;
                if (sprite.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && flipped) {
                    angle = 0;
                    flipX = !flipX;
                };
                overflow = this._imageStore.getViewportOverflow(this._screenHeight, this._screenWidth, sprite.id, imageId, scaling, angle, flipX, newPosX + sw / 2, newPosY + sh / 2, overflow);    //TODO: param
                if (overflow.top)
                    newPosY += overflow.top;
                if (overflow.right)
                    newPosX -= overflow.right;
                if (overflow.bottom)
                    newPosY -= overflow.bottom;
                if (overflow.left)
                    newPosX += overflow.left;
            }
        

            //set sprite values: avoid triggering multiple onChange events
            var props = {};
            if (sprite.direction !== dir) {
                sprite.setDirection(dir, false);
                props.direction = dir;
            }
            if (sprite.positionX !== newPosX) {
                props.positionX = newPosX;
            }
            if (sprite.positionY !== newPosY) {
                props.positionY = newPosY;
            }
            sprite.setPosition(newPosX, newPosY, false);

            if (props.direction !== undefined || props.positionX !== undefined || props.positionY !== undefined) {
                this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: props }, sprite);
                return true;
            }

            return false;
        },

        /* override */
        dispose: function () {
            this.stopProject();
            //call super
            PocketCode.UserVariableHost.prototype.dispose.call(this);
        },
    });

    return GameEngine;
})();