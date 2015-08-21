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
            var initialScaling = 1;
            //TODO: (commented out due to testing) ): make sure to use the screen params + pixelRatio if needed as the window may not be maximized on desktops
            //this._imageStore.scaling = Math.min(SmartJs.Ui.Window.height / this._screenHeight, SmartJs.Ui.Window.width / this._screenWidth, 1);   -> this is private now

            this._imageStore.loadImages(jsonProject.resourceBaseUrl, jsonProject.images, initialScaling);//, imageSize); -> size can be calculated inside

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
        ifSpriteOnEdgeBounce: function (sprite, pendingChanges) {

            if (!sprite.currentLook)   //no look defined (cannot be changed either): no need to handle this
                return false;

            var sh = this._screenHeight,
                sw = this._screenWidth,
                dir = sprite.direction,
                x = sprite.positionX + sw / 2,  //move the coord systems 0/0 to top/left
                y = sprite.positionY + sh / 2;

            if (pendingChanges) {
                if (pendingChanges.direction != undefined)  //be careful when comparing as the positions can become =0
                    dir = pendingChanges.direction;
                if (pendingChanges.positionX != undefined)
                    x = pendingChanges.positionX + sw / 2;
                if (pendingChanges.positionY != undefined)
                    y = pendingChanges.positionY + sh / 2;
            }

            var lookId = sprite.currentLook.imageId,    //TODO: this may change to lookId (next version)
                scaling = sprite.size / 100,
                angle = sprite.rotationStyle === PocketCode.RotationStyle.ALL_AROUND ? dir - 90 : 0,
                //^^ sprite has a direction but is not rotated
                flipX = sprite.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && dir < 0 ? true : false;


            var imgStore = this._imageStore;
            /* interface to use: imgStore.getLookBoundary(spriteId, lookId, scalingFactor, rotationAngle, flipX, pixelAccuracy)
            *  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            *  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            *  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            *  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to inclrease performance)
            */

            var innerOffsets = imgStore.getLookBoundary(sprite.id, lookId, scaling, angle, flipX, false);
            //{top, right, bottom, left, pixelAccuracy} from look center to bounding area borders (may be negative as well, e.g. if the center is outside of visisble pixels)

            if (!innerOffsets.pixelAccuracy) {  //quick check
                if (y - innerOffsets.top < 0 ||
                    x + innerOffsets.right > sw ||
                    y + innerOffsets.bottom > sh ||
                    x - innerOffsets.left < 0) {

                    innerOffsets = imgStore.getLookBoundary(sprite.id, lookId, scaling, angle, flipX, true);    //update to exact values at collision
                }
                else
                    return false;   //no collision
            }

            //make sure this is correct (specification): if there is an overflow on both sides we ignore it
            //how to handle overflows that causes another overflow during movement? - ignore it? move to edge & which one?
            if (innerOffsets.top + innerOffsets.bottom > sh || innerOffsets.left + innerOffsets.right > sw)
                return false;   //this meanse: the visible area has a bigger hight or width than the screen
            //let's handle that as easy as possible: no conflicting states are handled: if we start to rotate in this cases we get lost

            //retesting with exact bounding (pixelAccuracy = true)
            var overflow = {    //defining how many pixels the visual area is outside the viewport: if no overflow the values are 0 or negative
                top: innerOffsets.top - y,
                right: x + innerOffsets.right - sw,
                bottom: y + innerOffsets.bottom - sh,
                left: innerOffsets.left - x,
            };
            var center = {  //store the center position of the current area
                x: (innerOffsets.right - innerOffsets.left) / 2,
                y: (innerOffsets.top - innerOffsets.bottom) / 2,
            };

            //calc new positions and direction
            var newDir = dir,//sprite.direction,
                newX = x,//sprite.positionX,
                newY = y,//sprite.positionY,
                bounceTop, bounceRight, bounceBottom, bounceLeft;    //to store the current operation: we only bounce once at a time and recall this method

            if (overflow.top > 0) {
                newY += overflow.top;       //we move them back on the edge because we do not know if we have to rotate right now
                center.y += overflow.top;   //with the sprite x/y-movement, the areas center moves as well
                if (Math.abs(newDir) < 90)
                    newDir = newDir > 0 ? 180 - newDir : -180 - newDir; //make sure we do not get an angle > +-180
                bounceTop = true;
            }
            else if (overflow.right > 0) {
                newX -= overflow.right;
                center.x -= overflow.right;
                if (newDir > 0 && newDir < 180)
                    newDir = -newDir;
                bounceRight = true;
            }
            else if (overflow.bottom > 0) {
                newY -= overflow.bottom;
                center.y -= overflow.bottom;
                if (Math.abs(newDir) > 90)
                    newDir = newDir > 0 ? 180 - newDir : -180 - newDir;
                bounceBottom = true;
            }
            else if (overflow.left > 0) {
                newX += overflow.left;
                center.x += overflow.left;
                if (newDir < 0)    //there is no -180
                    newDir = -newDir;
                bounceLeft = true;
            }

            //do we have to check again?: direction change -> check on rotation + reposition
            //var sdir = sprite.direction;
            if (newDir != dir && sprite.rotationStyle !== PocketCode.RotationStyle.DO_NOT_ROTATE) {
                var flipped = (newDir >= 0 && dir < 0) || (newDir < 0 && dir >= 0);
                //if (sprite.rotationStyle === PocketCode.RotationStyle.ALL_AROUND)
                angle = newDir - 90;
                if (sprite.rotationStyle === PocketCode.RotationStyle.LEFT_TO_RIGHT && flipped) {
                    angle = 0;
                    flipX = !flipX;
                };

                //detect object state after rotation
                innerOffsets = imgStore.getLookBoundary(sprite.id, lookId, scaling, angle, flipX, true);
                if (innerOffsets.top + innerOffsets.bottom > sh || innerOffsets.left + innerOffsets.right > sw)
                    return false;   //ignore bouncing if area becomes bigger than screen height/width (during rotation)

                //if (angle == 0) {
                //we flipped or rotated the image, which means we have to adjust the x-coordinate: move the visual areas center to the same position
                newX += center.x - (innerOffsets.right - innerOffsets.left) / 2;        //TODO: IMPORTANT: THIS IS ONLY CORRECT IF THERE IS NO OTHER PENDING OP
                                                                                        //ELSE: WE HAVE TO ALIGN THE AREA TO ITS PENDING OP OVERFLOW: KEEPING PENDING OPS "ALIVE"
                //}
                if (angle !== 0) {   //else {
                    //on rotate we meight have also changed the y position of our area
                    newY += center.y - (innerOffsets.right - innerOffsets.left) / 2;    //TODO: IMPORTANT: THIS IS ONLY CORRECT IF THERE IS NO OTHER PENDING OP

                    //we did rotate which means the visible area can be outside the screen now (size of the area changed)
                    var oar = {    //overflow after rotate
                        top: innerOffsets.top - newY,
                        right: newX + innerOffsets.right - sw,
                        bottom: newY + innerOffsets.bottom - sh,
                        left: innerOffsets.left - newX,
                    };
                    //detect edges we've handled already and move the sprite according to this: only one of them is currently handled
                    if (bounceTop) {
                        newY += oar.top;
                        oar.top = 0;    //for each side that was handled already
                    }
                    else if (bounceRight) {
                        newY -= oar.right;
                        oar.right = 0;
                    }
                    else if (bounceBottom) {
                        newY -= oar.bottom;
                        oar.bottom = 0;
                    }
                    else if (bounceLeft) {
                        newY += oar.left;
                        oar.left = 0;
                    }

                    //now, the rotated image is aligned on the position, but is the visible area inside the screen?
                    //we already set handled properties = 0 to avoid a conflict
                    if (oar.top > 0 || oar.right > 0 || oar.bottom > 0 || oar.left > 0) {
                        //bounce again:
                        //sprite.setDirection(newDir, false);    //we apply all changes
                        //sprite.setPosition(newX - sw / 2, newY - sh / 2, false);    //move coords back to system coord: center/center = 0/0
                        return this.ifSpriteOnEdgeBounce(sprite, { direction: newDir, positionX: newX - sw / 2, positionY: newY - sh / 2 });//true);
                        //^^ as we do not rotate if the direction is parallel to the bouncing enge, this cannot trigger infinite recursions (should be one (two?) at most)
                    }
                }
            }
            else {  //sprite was not rotated or flipped, but we do not know if we handled all overflows already
                if (overflow.top > 0 && !bounceTop ||
                    overflow.right > 0 && !bounceRight ||
                    overflow.bottom > 0 && !bounceBottom ||
                    overflow.left > 0 && !bounceLeft) {

                    //recall method if there are unhandled offsets
                    sprite.setPosition(newX - sw / 2, newY - sh / 2, false);    //move coords back to system coord: center/center = 0/0
                    return this.ifSpriteOnEdgeBounce(sprite, { positionX: newX - sw / 2, positionY: newY - sh / 2 });//true);
                }
            }

            //move coords back to system coord: center/center = 0/0
            newX -= sw / 2;
            newY -= sh / 2;
            //set sprite values: avoid triggering multiple onChange events
            var props = {};
            if (sprite.direction !== newDir) {// || recursiveCall) {
                sprite.setDirection(newDir, false);
                props.direction = newDir;
            }
            if (sprite.positionX !== newX) {// || recursiveCall) {
                props.positionX = newX;
            }
            if (sprite.positionY !== newY) {// || recursiveCall) {
                props.positionY = newY;
            }
            sprite.setPosition(newX, newY, false);

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