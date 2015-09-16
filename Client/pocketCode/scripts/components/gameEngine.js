/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="userVariableHost.js" />
/// <reference path="sprite.js" />
/// <reference path="imageStore.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="../components/broadcastManager.js" />
/// <reference path="../components/soundManager.js" />
'use strict';

PocketCode.GameEngine = (function () {
    GameEngine.extends(PocketCode.UserVariableHost, false);

    function GameEngine(minLoopCycleTime) {
        PocketCode.UserVariableHost.call(this, PocketCode.UserVariableScope.GLOBAL);

        this._executionState = PocketCode.ExecutionState.STOPPED;
        this._minLoopCycleTime = minLoopCycleTime || 20; //ms
        this._resourcesLoaded = false;
        this._spritesLoaded = false;

        this._id = "";
        this.title = "";
        this.description = "";
        this.author = "";
        this._originalScreenHeight = 0;
        this._originalScreenWidth = 0;

        this._background = undefined;
        this._sprites = [];

        this.resourceBaseUrl = "";

        this._imageStore = new PocketCode.ImageStore();
        this._imageStore.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
        this._imageStore.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
        this._imageStore.onLoad.addEventListener(new SmartJs.Event.EventListener(this._imageStoreLoadHandler, this));
        this.__sounds = {};

        this._soundManager = new PocketCode.SoundManager();
        this._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
        this._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
        this._soundManager.onLoad.addEventListener(new SmartJs.Event.EventListener(this._soundManagerLoadHandler, this));
        this._soundManager.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));    //check if project has finished executing
        this._invalidSoundFiles = [];

        this._broadcasts = [];
        this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);

        //events
        this._onLoadingProgress = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);

        this._onBeforeProgramStart = new SmartJs.Event.Event(this);
        this._onProgramStart = new SmartJs.Event.Event(this);
        this._onProgramExecuted = new SmartJs.Event.Event(this);
        this._onSpriteChange = new SmartJs.Event.Event(this);
        this._onTabbedAction = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(GameEngine.prototype, {
        projectLoaded: {
            get: function () {
                return this._resourcesLoaded && this._spritesLoaded;
            },
        },
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
        //images: {   //public getter required for rendering //TODO: change this to looks/costumes
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

                this._soundManager.loadSounds(this._resourceBaseUrl, sounds);
            },
        },
        broadcasts: {
            set: function (broadcasts) {
                if (!(broadcasts instanceof Array))
                    throw new Error('setter expects type Array');

                this._broadcasts = broadcasts;
                this._broadcastMgr.init(broadcasts);
            },
        }
    });

    //events
    Object.defineProperties(GameEngine.prototype, {
        onLoadingProgress: {
            get: function () { return this._onLoadingProgress; },
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
        onProgramStart: {
            get: function () { return this._onProgramStart; },
        },
        onProgramExecuted: {
            get: function () { return this._onProgramExecuted; },
        },
        onSpriteChange: {
            get: function () { return this._onSpriteChange; },
        },
        onTabbedAction: {
            get: function () { return this._onTabbedAction; },
        },
    });

    //methods
    GameEngine.prototype.merge({

        loadProject: function (jsonProject) {
            if (this._disposing || this._disposed)
                return;
            if (this._executionState !== PocketCode.ExecutionState.STOPPED)
                this.stopProject();
            if (!jsonProject)
                throw new Error('invalid argument: json project');
            else
                this._jsonProject = jsonProject;

            this._spritesLoaded = false;
            this._resourcesLoaded = false;

            this._id = jsonProject.id;
            var header = jsonProject.header;
            this.title = header.title;
            this.description = header.description;
            this.author = header.author;
            this._originalScreenHeight = header.device.screenHeight;
            this._originalScreenWidth = header.device.screenWidth;

            if (this._background)
                this._background.dispose();// = undefined;
            this._sprites.dispose();

            //resource sizes
            this._resourceTotalSize = 0;
            this._resourceLoadedSize = 0;
            for (i = 0, l = jsonProject.images.length; i < l; i++) {
                this._resourceTotalSize += jsonProject.images[i].size;
            }
            for (i = 0, l = jsonProject.sounds.length; i < l; i++) {
                this._resourceTotalSize += jsonProject.sounds[i].size;
            }

            if (this._resourceTotalSize === 0)
                this._resourcesLoaded = true;
            else {
                this._onLoadingProgress.dispatchEvent({ progress: 0 });
                var initialScaling = 1;     //set initial scaling: default = 1
                if (SmartJs.Device.isMobile) {  //calculate a max scaling for mobile devices to scale images during download
                    var min = Math.min(window.innerWidth, window.innerHeight),
                        max = Math.max(window.innerWidth, window.innerHeight),
                        smin = Math.min(this._originalScreenWidth, this._originalScreenHeight),
                        smax = Math.max(this._originalScreenWidth, this._originalScreenHeight);
                    var scaling = Math.max(min / smin, max / smax);
                    if (scaling < 1)
                        initialScaling = scaling;
                }
                this._resourceBaseUrl = jsonProject.resourceBaseUrl;
                this._imageStore.loadImages(this._resourceBaseUrl, jsonProject.images, initialScaling);
                //sounds are loaded after images using the image stores onLoad event
            }

            this._broadcasts = jsonProject.broadcasts || [];
            this._broadcastMgr = new PocketCode.BroadcastManager(this._broadcasts);

            //make sure vars and lists are defined before creating bricks and sprites
            this._variables = jsonProject.variables || [];
            this._lists = jsonProject.lists || [];

            var device = new PocketCode.Device(this._soundManager);
            var bricksCount = jsonProject.header.bricksCount;
            if (bricksCount <= 0)
                this._spritesLoaded = true;

            this._spriteFactory = new PocketCode.SpriteFactory(device, this, this._broadcastMgr, this._soundManager, bricksCount, this._minLoopCycleTime);
            this._spriteFactory.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnProgressChangeHandler, this));
            this._spriteFactory.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(this._spriteFactoryUnsupportedBricksHandler, this));

            if (jsonProject.background) {
                this._background = this._spriteFactory.create(jsonProject.background);
                this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            }
            var sp = jsonProject.sprites;
            var sprite, i, l;
            for (i = 0, l = sp.length; i < l; i++) {
                sprite = this._spriteFactory.create(sp[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
                this._sprites.push(sprite);
            }
        },
        //loading handler
        _spriteFactoryOnProgressChangeHandler: function (e) {
            if (e.progress === 100) {
                this._spritesLoaded = true;
                this._spriteFactory.onProgressChange.removeEventListener(new SmartJs.Event.EventListener(this._spriteFactoryOnProgressChangeHandler, this));
                if (this._resourcesLoaded) {
                    this._onLoad.dispatchEvent();
                }
            }
        },
        _spriteFactoryUnsupportedBricksHandler: function (e) {
            var bricks = e.unsupportedBricks;
            //TODO:
        },
        _resourceProgressChangeHandler: function (e) {
            if (e.progress === 0)
                return;

            var size = e.file.size;
            this._resourceLoadedSize += size;
            this._onLoadingProgress.dispatchEvent({ progress: Math.round(this._resourceLoadedSize / this._resourceTotalSize * 1000) / 10 });
        },
        _imageStoreLoadHandler: function (e) {
            this._sounds = this._jsonProject.sounds || [];
        },
        _soundManagerLoadHandler: function (e) {
            if (this._invalidSoundFiles.length > 0)
                this._onLoadingError.dispatchEvent({ files: this._invalidSoundFiles });
            this._resourcesLoaded = true;
            if (this._spritesLoaded) {
                this._onLoad.dispatchEvent();
            }
        },
        _resourceLoadingErrorHandler: function (e) {
            if (e.target === this._soundManager)
                this._invalidSoundFiles.push(e.file);
            else
                this._onLoadingError.dispatchEvent({ files: [e.file] });
        },
        //project interaction
        runProject: function (reinitSprites) {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (!this.projectLoaded) {
                throw new Error('no project loaded');
            }

            //if reinit: all sprites properties have to be set to their default values: default true
            if (reinitSprites !== false) {
                if (this._background)
                    this._background.init();
                var sprites = this._sprites;
                for (var i = 0, l = sprites.length; i < l; i++)
                    sprites[i].init();
            }
            this._executionState = PocketCode.ExecutionState.RUNNING;
            this._onBeforeProgramStart.dispatchEvent();  //indicates the project was loaded and rendering objects can be generated
            this.onProgramStart.dispatchEvent();    //notifies the listerners (script bricks) to start executing
        },
        restartProject: function (reinitSprites) {
            this.stopProject();
            this.runProject(reinitSprites);
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
            if (this._background && this._background.scriptsRunning)
                return;
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].scriptsRunning)
                    return;
            }

            this._executionState = PocketCode.ExecutionState.STOPPED;
            this._onProgramExecuted.dispatchEvent();    //check if project has been executed successfully: this will never happen if there is an endless loop brick
        },

        //brick-sprite interaction
        getSpriteById: function (spriteId) {
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
        getSpriteLayer: function (sprite) { //including background (used in formulas)
            if (sprite === this._background)
                return 0;
            var idx = this._sprites.indexOf(sprite);
            if (idx < 0)
                throw new Error('sprite not found: getSpriteLayer');
            return idx + 1;
        },
        getLookImage: function (id) {
            //used by the sprite to access a look object when firing onSpriteChange (setLook, nextLook bricks)
            return this._imageStore.getLook(id);    //TODO: the gameEngine Object has much too much public methods and properties (even events like onStart) that are used by sprites and bricks only: IMPORTANT
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

            this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: { layer: idx + 1 } }, sprite);
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
        ifSpriteOnEdgeBounce: function (sprite) {

            if (!sprite || !sprite.currentLook)   //no look defined (cannot be changed either): no need to handle this
                return false;

            var sh2 = this._originalScreenHeight / 2,
                sw2 = this._originalScreenWidth / 2,
                dir = sprite.direction,
                x = sprite.positionX,
                y = sprite.positionY;

            var lookId = sprite.currentLook.imageId,    //TODO: this may change to lookId (next version)
                scaling = sprite.size / 100,
                rotation = sprite.rotationStyle === PocketCode.RotationStyle.ALL_AROUND ? dir - 90 : 0,
                //^^ sprite has a direction but is not rotated
                flipX = sprite.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && dir < 0 ? true : false;


            var imgStore = this._imageStore;
            /* interface to use: imgStore.getLookBoundary(spriteId, lookId, scalingFactor, rotationAngle, flipX, pixelAccuracy)
            *  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            *  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            *  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            *  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to increase performance)
            */

            var boundary = imgStore.getLookBoundary(sprite.id, lookId, scaling, rotation, flipX, false);
            //{top, right, bottom, left, pixelAccuracy} from look center to bounding area borders (may be negative as well, e.g. if the center is outside of visisble pixels)

            if (!boundary.pixelAccuracy) {  //quick check
                if (y + boundary.top > sh2 ||
                    x + boundary.right > sw2 ||
                    y - boundary.bottom < -sh2 ||
                    x - boundary.left < -sw2) {

                    boundary = imgStore.getLookBoundary(sprite.id, lookId, scaling, rotation, flipX, true);    //update to exact values at collision
                }
                else
                    return false;   //no collision: calculated boundary
            }

            //retesting with exact bounding (pixelAccuracy = true)
            var center = {  //store the center position of the current area
                x: x + (boundary.right + boundary.left) / 2,
                y: y + (boundary.top + boundary.bottom) / 2,
            };

            var vpEdges = { //viewport edges
                top: {
                    overflow: y + boundary.top - sh2,
                    ignore: false,
                    inDirection: Math.abs(dir) <= 90,
                    calcDirection: function (dir) { return dir >= 0 ? 180 - dir : -180 - dir; },    // //make sure we do not get an angle within +-180
                },
                right: {
                    overflow: x + boundary.right - sw2,
                    ignore: false,
                    inDirection: dir >= 0,
                    calcDirection: function (dir) { return dir == 180 ? dir : -dir; },
                },
                bottom: {
                    overflow: -y - boundary.bottom - sh2,
                    ignore: false,
                    inDirection: Math.abs(dir) > 90,
                    calcDirection: function (dir) { return dir > 0 ? 180 - dir : -180 - dir; },
                },
                left: {
                    overflow: -x - boundary.left - sw2,
                    ignore: false,
                    inDirection: dir < 0,
                    calcDirection: function (dir) { return -dir; },
                },
                getXCorrection: function () {
                    var c,
                        l = vpEdges.left,
                        r = vpEdges.right;

                    if (l.ignore || r.ignore) {
                        return l.ignore ? -r.overflow : l.overflow; //overflows can be negativ as well (after rotation)- we also have to take care of this 
                    }
                    //after rotation there can be a an overflow that didn't exist before
                    if (l.overflow > 0 && r.overflow > 0 || l.overflow + r.overflow > 0) {  //check as well, if the rotated area still fits in the viewport
                        //move from original direction
                        if (dir >= 0)
                            return -r.overflow;
                        else
                            return l.overflow;
                    }
                    else if (l.overflow > 0)
                        return l.overflow;  //check if lo+ro < 0 -> else: include direction
                    else if (r.overflow > 0)
                        return -r.overflow;
                    return 0;   //move to center already applied
                },
                getYCorrection: function () {       //TODO: abhängig von dir  (nicht newDir)- falls beide nicht ignored
                    var c,
                        t = vpEdges.top,
                        b = vpEdges.bottom;
                    if (t.ignore || b.ignore) {
                        return t.ignore ? b.overflow : -t.overflow;
                    }
                    //after rotation
                    if (t.overflow > 0 && b.overflow > 0) {
                        //move from original direction
                        if (Math.abs(dir) <= 90)
                            return -t.overflow;
                        else
                            return b.overflow;
                    }
                    else if (t.overflow > 0)
                        return -t.overflow;
                    else if (b.overflow > 0)
                        return b.overflow;
                    return 0;   //move to center already applied
                },
            };

            //check if overflow
            if (vpEdges.top.overflow <= 0 &&
                vpEdges.right.overflow <= 0 &&
                vpEdges.bottom.overflow <= 0 &&
                vpEdges.left.overflow <= 0)
                return false;   //no collision: pixel exact calculation

            //handle conflics: if there is an overflow on both sides we always bounce from the side the sprites points to
            if (vpEdges.top.overflow > 0 && vpEdges.bottom.overflow > 0) {
                if (Math.abs(dir) <= 90)
                    vpEdges.bottom.ignore = true;
                else
                    vpEdges.top.ignore = true;
            }
            if (vpEdges.left.overflow > 0 && vpEdges.right.overflow > 0) {
                if (dir < 0)
                    vpEdges.right.ignore = true;
                else
                    vpEdges.left.ignore = true;
            }

            //calc new positions and direction: we need this to compare new with existing properties to trigger the update event correctly
            var newDir = dir,
                newX = x,
                newY = y,
                bounce = { top: undefined, right: undefined, bottom: undefined, left: undefined };    //to store the current operation: we only bounce once at a time and recall this method
            var edgesToHandle;

            //up to now, there are only 2 neigboured edges left at max (not ignored): let's call them p(rimus) and s(ecundus), where p (at least) is always inDirection (if one of them is)
            var p, s;
            if (vpEdges.top.overflow > 0 && !vpEdges.top.ignore) {
                p = vpEdges.top;
            }
            if (vpEdges.right.overflow > 0 && !vpEdges.right.ignore) {
                if (!p)
                    p = vpEdges.right;
                else if (p && vpEdges.right.inDirection) {
                    s = p;
                    p = vpEdges.right;
                }
                else
                    s = vpEdges.right;
            }
            if (vpEdges.bottom.overflow > 0 && !vpEdges.bottom.ignore) {
                if (!p)
                    p = vpEdges.bottom;
                else if (p && vpEdges.bottom.inDirection) {
                    s = p;
                    p = vpEdges.bottom;
                }
                else
                    s = vpEdges.bottom;
            }
            if (vpEdges.left.overflow > 0 && !vpEdges.left.ignore) {
                if (!p)
                    p = vpEdges.left;
                else if (p && vpEdges.left.inDirection) {
                    s = p;
                    p = vpEdges.left;
                }
                else
                    s = vpEdges.left;
            }

            //calc positions and rotations
            if (p && p.inDirection)
                newDir = p.calcDirection(newDir);
            if (s && s.inDirection)
                newDir = s.calcDirection(newDir);

            var updateBoundary = false;
            if (newDir != dir && sprite.rotationStyle == PocketCode.RotationStyle.ALL_AROUND) {
                rotation = newDir - 90;
                updateBoundary = true;
            }
            else if (newDir != dir && sprite.rotationStyle == PocketCode.RotationStyle.LEFT_TO_RIGHT) {
                rotation = 0;
                if ((newDir >= 0 && dir < 0) || (newDir < 0 && dir >= 0)) { //flipX changed
                    flipX = !flipX;
                    updateBoundary = true;
                }
            }

            if (updateBoundary) {
                boundary = imgStore.getLookBoundary(sprite.id, lookId, scaling, rotation, flipX, true);    //recalculate
                //adjust/keep the area center during rotate
                newX += center.x - (boundary.right + boundary.left) / 2;
                newY += center.y - (boundary.top + boundary.bottom) / 2;
                //update overflows
                vpEdges.top.overflow = newY + boundary.top - sh2;
                vpEdges.right.overflow = newX + boundary.right - sw2;
                vpEdges.bottom.overflow = -newY - boundary.bottom - sh2;
                vpEdges.left.overflow = -newX - boundary.left - sw2;
            }
            //set position
            newX += vpEdges.getXCorrection();
            newY += vpEdges.getYCorrection();

            //set sprite values: avoid triggering multiple onChange events
            var props = {};
            if (sprite.direction !== newDir) {
                sprite.setDirection(newDir, false);
                props.direction = newDir;
            }
            if (sprite.positionX !== newX) {
                props.positionX = newX;
            }
            if (sprite.positionY !== newY) {
                props.positionY = newY;
            }
            sprite.setPosition(newX, newY, false);

            this._onSpriteChange.dispatchEvent({ id: sprite.id, properties: props }, sprite);
            return true;
        },

        /* override */
        dispose: function () {
            this.stopProject();

            this._imageStore.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
            this._imageStore.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
            this._imageStore.abortLoading();
            //this._imageStore.dispose();

            this._soundManager.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
            this._soundManager.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
            this._soundManager.onFinishedPlaying.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            //this._soundManager.stopAllSounds();   //already stopped in stopProject()
            //this._soundManager.dispose();

            if (this._background)
                this._background.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this));
            }
            //call super
            PocketCode.UserVariableHost.prototype.dispose.call(this);
        },
    });

    return GameEngine;
})();