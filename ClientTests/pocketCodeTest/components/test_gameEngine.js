/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
'use strict';

QUnit.module("gameEngine.js");


QUnit.test("GameEngine", function (assert) {

	//dispose: testing dispose first should notify us on errors caused by disposing some core (prototype) properties or events
	var gameEngine = new PocketCode.GameEngine();
	gameEngine._executionState = PocketCode.ExecutionState.RUNNING; //should be stopped
	gameEngine.dispose();
	assert.equal(gameEngine.executionState, undefined, "gameEngine stopped during dispose- property deleted");
	assert.equal(gameEngine._disposed, true, "disposed completely");

	//dispose test: on finished
	var testDispose = function () {
		gameEngine.dispose();
		assert.ok(gameEngine._disposed, "disposed correctly");
		assert.ok(gameEngine.__images == undefined && gameEngine.__sounds == undefined && gameEngine.__variablesSimple == undefined && gameEngine.__variablesList == undefined && gameEngine._sprites == undefined, "dispose: resources disposed");
		disposedHandled();
	};

	gameEngine = new PocketCode.GameEngine();
	assert.ok(gameEngine instanceof PocketCode.GameEngine && gameEngine instanceof PocketCode.UserVariableHost && gameEngine instanceof SmartJs.Core.Component, "instance check");

	//assert.throws(function () { gameEngine._images = "invalid argument" }, Error, "ERROR: passed invalid arguments to images");
	assert.throws(function () { gameEngine._sounds = "invalid argument" }, Error, "ERROR: passed invalid arguments to sounds");
	assert.throws(function () { gameEngine._variables = "invalid argument" }, Error, "ERROR: passed invalid arguments to variables");
	assert.throws(function () { gameEngine.broadcasts = "invalid argument" }, Error, "ERROR: passed invalid arguments to broadcasts");
	assert.equal(gameEngine.setSpriteLayerBack("invalidId", 5), false, "ERROR: passed invalid object to setSpriteLayerBack");
	assert.equal(gameEngine.setSpriteLayerToFront("invalidId"), false, "ERROR: passed invalid object to setSpriteLayerToFront");
	assert.throws(function () { gameEngine.getSpriteById("invalidId") }, Error, "ERROR: passed invalid id to getSprite");
	assert.throws(function () { gameEngine.getSpriteLayer("invalidId") }, Error, "ERROR: passed invalid object to getSpriteLayer");

	//TODO: retest images using new imageStore
	//var images = [{ id: "1" }, { id: "2" }, { id: "3" }];
	//gameEngine._images = images;
	//assert.ok(gameEngine.__images["1"] === images[0] && gameEngine.__images["2"] === images[1] && gameEngine.__images["3"] === images[2], "images set correctly");

	gameEngine._soundManager.init = function () {
		this.soundManagerInitCalled = true;
	};

	var sounds = [{ id: "id1", url: "src" }, { id: "id2", url: "src" }, { id: "id3", url: "src" }];
	gameEngine._sounds = sounds;
	assert.ok(gameEngine.__sounds["id1"] === sounds[0] && gameEngine.__sounds["id2"] === sounds[1] && gameEngine.__sounds["id3"] === sounds[2], "sounds set correctly");
	assert.ok(gameEngine._soundManager.soundManagerInitCalled, "Called SoundManagers init Function");

	//var variables = [{ id: "1", name: "name1" }, { id: "2", name: "name2" }, { name: "name3", id: "3" }];
	//gameEngine._variables = variables;
	//assert.ok(gameEngine.__variablesSimple._variables["1"]._id === variables[0]._id && gameEngine.__variablesSimple._variables["2"]._id === variables[1]._id && gameEngine.__variablesSimple._variables["3"]._id === variables[2]._id, "variables set correctly");
	//TODO: ^^ this tests should be moved to base class: UserVariableHost including tests for lists (we shouldn't use private vars for assets - that much - either)

	//var names = gameEngine.getAllVariables();
	//names = names.global;
	//assert.ok(names["1"].name === "name1" && names["2"].name === "name2" && names["3"].name === "name3", "varableNames set correctly");

	//assert.ok(gameEngine.getVariable("1").name === "name1", "Calling getNewVariable returned correct variable");
	//assert.deepEqual(gameEngine.getAllVariables(), gameEngine._variableNames, "getGlobalVariableNames returns gameEngine._variableNames");
	//assert.throws(function () { gameEngine.getGlobalVariable("invalid") }, Error, "ERROR: invalid argument used for getGlobalVariable");

	var broadcasts = [{ id: "1" }, { id: "2" }, { id: "3" }];
	assert.ok(typeof gameEngine._broadcastMgr.init == "function", "broadcast mgr interface check");
	gameEngine._broadcastMgr.init = function () {   //override to test: mock
		this.initCalled = true;
	};
	gameEngine.broadcasts = broadcasts;
	assert.ok(gameEngine._broadcastMgr.initCalled, "Called BroadcastManagers init function");
	assert.equal(gameEngine._broadcasts, broadcasts, "broadcasts set correctly");

	assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Created gameEngine not started");
	gameEngine.projectReady = false;
	assert.throws(function () { gameEngine.runProject() }, Error, "ERROR: Program not ready");
	gameEngine.projectReady = true;

	//Mock: first we test if our Mocked interface still exist- change to sprite otherwise will not affect our tests
	var spriteInterface = new PocketCode.Sprite(gameEngine, { id: "id", name: "name" });
	assert.ok(typeof spriteInterface.pauseScripts == "function" && typeof spriteInterface.resumeScripts == "function" && typeof spriteInterface.stopScripts == "function", "mock: valid sprite interface");

	//Mock GameEngine and SoundManagers start, pause, stop methods
	var TestSprite = (function () {
		TestSprite.extends(PocketCode.Sprite, false);

		function TestSprite(program, args) {
			PocketCode.Sprite.call(this, program, args);
			this.status = PocketCode.ExecutionState.STOPPED;
			//this.MOCK = true;   //flag makes debugging much easier
			this.timesStopped = 0;
			this.timesStarted = 0;
		}

		TestSprite.prototype.merge({
			//execute: function () {
			//    this.status = PocketCode.ExecutionState.RUNNING;
			//    this.timesStarted++;
			//},
			pauseScripts: function () {
				this.status = PocketCode.ExecutionState.PAUSED;
			},
			resumeScripts: function () {
				this.status = PocketCode.ExecutionState.RUNNING;
			},
			stopScripts: function () {
				this.status = PocketCode.ExecutionState.STOPPED;
				this.timesStopped++;
			},
		});

		return TestSprite;
	})();


	gameEngine._soundManager.pauseSounds = function () {
		this.status = PocketCode.ExecutionState.PAUSED;
	};

	gameEngine._soundManager.resumeSounds = function () {
		this.status = PocketCode.ExecutionState.RUNNING;
	};

	gameEngine._soundManager.timesStopped = 0;
	gameEngine._soundManager.stopAllSounds = function () {
		this.status = PocketCode.ExecutionState.STOPPED;
		this.timesStopped++;
	};

	gameEngine._background = new TestSprite(gameEngine, {id: "mockId1", name: "spriteName1"});
	gameEngine._sprites.push(new TestSprite(gameEngine, { id: "mockId2", name: "spriteName2" }));
	gameEngine._sprites.push(new TestSprite(gameEngine, { id: "mockId3", name: "spriteName3" }));
	gameEngine._sprites.push(new TestSprite(gameEngine, { id: "mockId4", name: "spriteName4" }));

	//onExecutedEvent
	assert.ok(gameEngine.onProgramExecuted instanceof SmartJs.Event.Event, "onExecuted accessor check");
	var onExecutedCalled = 0;
	var onExecutedHandler = function () {
		onExecutedCalled++;
	};
	var onExecListener = new SmartJs.Event.EventListener(onExecutedHandler, this);
	gameEngine.onProgramExecuted.addEventListener(onExecListener);
	//simulate onExecuted dispatch
	gameEngine._spriteOnExecutedHandler();
	assert.equal(onExecutedCalled, 1, "onExecuted dispatched once");
	gameEngine.onProgramExecuted.removeEventListener(onExecListener);

	//layers
	var layers = [gameEngine._background].concat(gameEngine._sprites);//layerObjectList;
	assert.equal(layers[0], gameEngine._background, "Background in correct position in layer list");
	var spriteOrderCorrect = true;
	for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
		if (gameEngine._sprites[i] !== layers[i + 1]) {
			spriteOrderCorrect = false;
		}
	}
	assert.ok(spriteOrderCorrect, "Sprites in correct position in layer list");

	var programStartEvent = 0;
	gameEngine.onProgramStart.addEventListener(new SmartJs.Event.EventListener(function () {
		programStartEvent++;
	}));

	gameEngine.projectReady = true;  //simulate project loaded for tests
	gameEngine.runProject();
	assert.equal(programStartEvent, 1, "Called onProgramStart");

	//var allSpritesStarted = true;
	//for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
	//    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.RUNNING) {
	//        allSpritesStarted = false;
	//    }
	//}
	//assert.ok(allSpritesStarted, "All sprites start methods called");
	//assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.RUNNING, "Called backgrounds start method");
	assert.equal(gameEngine._executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on start");

	gameEngine.runProject();
	assert.equal(programStartEvent, 1, "Did not attempt to start running gameEngine");

	gameEngine.pauseProject();
	var allSpritesPaused = true;
	for (var i = 0; i < gameEngine._sprites.length; i++) {
		if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.PAUSED) {
			allSpritesPaused = false;
		}
	}
	assert.ok(allSpritesPaused, "All sprites pause methods called");
	//assert.equal(gameEngine._background.status, PocketCode.ExecutionState.PAUSED, "Called backgrounds pause method");
	assert.equal(gameEngine._executionState, PocketCode.ExecutionState.PAUSED, "Set programs execution state to PAUSED on calling pause");
	assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.PAUSED, "Called soundManagers pauseSounds function");

	gameEngine.resumeProject();
	//allSpritesStarted = true;
	//for (var i = 0; i < gameEngine._sprites.length; i++) {
	//    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.RUNNING) {
	//        allSpritesStarted = false;
	//    }
	//}
	//assert.ok(allSpritesStarted, "All sprites running after resume");
	//assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.RUNNING, "Called backgrounds resume method");
	assert.deepEqual(gameEngine._executionState, PocketCode.ExecutionState.RUNNING, "Set programs execution state to RUNNING on calling resume");
	assert.deepEqual(gameEngine._soundManager.status, PocketCode.ExecutionState.RUNNING, "Called soundManagers resumeSounds function");

	gameEngine.stopProject();
	//var allSpritesStopped = true;
	//for (var i = 0; i < gameEngine._sprites.length; i++) {
	//    if (gameEngine._sprites[i].status !== PocketCode.ExecutionState.STOPPED) {
	//        allSpritesStopped = false;
	//    }
	//}
	//assert.ok(allSpritesStarted, "All sprites stopped");
	//assert.deepEqual(gameEngine._background.status, PocketCode.ExecutionState.STOPPED, "Called backgrounds stop method");
	assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Set programs execution state to STOP on calling stop");
	assert.equal(gameEngine._soundManager.status, PocketCode.ExecutionState.STOPPED, "Called soundManagers stop function");

	gameEngine.resumeProject();
	assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Did not resume stopped gameEngine");

	gameEngine.pauseProject();
	assert.equal(gameEngine._executionState, PocketCode.ExecutionState.STOPPED, "Did not attempt to pause stopped gameEngine");

	var spritesStarted = gameEngine._sprites[0].timesStarted;
	var spritesStopped = gameEngine._sprites[0].timesStopped;
	var bgStarted = gameEngine._background.timesStarted;
	var bgStopped = gameEngine._background.timesStopped;

	gameEngine.restartProject();
	assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped && gameEngine._background.timesStopped === bgStopped, "do not call stop on already stopped: all sprites when restarting");
	gameEngine.runProject();
	gameEngine.restartProject();
	assert.ok(gameEngine._sprites[0].timesStopped === spritesStopped + 1 && gameEngine._background.timesStopped === bgStopped + 1, "Stopped all sprites when restarting");
	//assert.ok(gameEngine._sprites[0].timesStarted === spritesStarted + 1 && gameEngine._background.timesStarted === bgStarted + 1, "Started all sprites when restarting");
	assert.ok(gameEngine._soundManager.status === PocketCode.ExecutionState.STOPPED, "Called SoundManagers stopAllSounds when restarting gameEngine");

	var sprite1 = new PocketCode.Sprite(gameEngine, { id: "newId", name: "myName" });
	sprite1._id = "spriteId1";
	//sprite1.name = "spriteName1";
	gameEngine._sprites.push(sprite1);
	assert.equal(gameEngine.getSpriteById("spriteId1"), sprite1, "Correct sprite returned by getSprite");

	var spriteChanges = 0;
	gameEngine._onSpriteChange.addEventListener(new SmartJs.Event.EventListener(function () {
		spriteChanges++;
		//TODO tests for event
	}));

	//var numberOfSprites = gameEngine._sprites.length;
	//var currentSpriteLayer = gameEngine.getSpriteLayer("spriteId1");    //avoid testing a method by using it -> this may cause wrong positive results
	var currentSpriteLayer = gameEngine._sprites.indexOf(sprite1) + 1;
	assert.deepEqual(gameEngine.getSpriteLayer(sprite1), currentSpriteLayer, "Correct Sprite Layer returned by getSpriteLayer");
	gameEngine.setSpriteLayerBack(sprite1, 2);
	assert.deepEqual(gameEngine.getSpriteLayer(sprite1), currentSpriteLayer - 2, "Set sprite layer two Layers back with setSpriteLayerBack");

	assert.ok(gameEngine.setSpriteLayerBack(sprite1, 1), "Setting Sprite layer back returns true");
	assert.deepEqual(spriteChanges, 2, "Sprite Change Event triggered every time layer got set back");
	assert.ok(!gameEngine.setSpriteLayerBack(sprite1, 1), "Setting Sprite layer back returns false if Sprite is already on the bottom layer");
	assert.deepEqual(spriteChanges, 2, "Sprite Change Event did not trigger when attempting to set sprite a layer back that was already in last position");

	spriteChanges = 0;

	assert.equal(gameEngine.setSpriteLayerToFront({ sprite: "invalidSprite object" }), false, "layer: return fals if sprite not found");
	assert.ok(gameEngine.setSpriteLayerToFront(sprite1), "Bringing Layer to front returns true if layers are changed");
	assert.ok(!gameEngine.setSpriteLayerToFront(sprite1), "Bringing Layer to front returns false if no layers are changed");
	assert.deepEqual(spriteChanges, 1, "Sprite Change Event triggered once");
	assert.deepEqual(gameEngine.getSpriteLayer(sprite1), gameEngine._sprites.length, "Brought Layer to front");

	var spriteBeforeLast = gameEngine._sprites[1];
	//spriteBeforeLast.id = "uniqueId";
	gameEngine.setSpriteLayerBack(spriteBeforeLast, 2);
	assert.equal(gameEngine.getSpriteLayer(spriteBeforeLast), 1, "Sprite positioned at first layer if when trying to set back more layers than currently available");


	//var testProject = strProject11; //has no sounds
	//var testProject = strProject719;

	//add resource path to url
	var testProject = JSON.parse(JSON.stringify( strProject719));
	for(i = 0, l = testProject.sounds.length; i< l; i++){
		testProject.sounds[i].url = "_resources/"+testProject.sounds[i].url;
	}

	for(i = 0, l = testProject.images.length; i< l; i++){
		testProject.images[i].url = "_resources/"+testProject.images[i].url;
	}



	//TODO: not called due to changes on image loading:     var loadingHandled = assert.async();
	//                                                      var disposedHandled = assert.async();

	//make sure sounds not already loaded
	gameEngine._soundManager = new PocketCode.SoundManager();
	//internal bindings have to be reattached to guarantee loading flags are set
	gameEngine._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(gameEngine._soundManagerOnLoadingErrorHandler, gameEngine));
	gameEngine._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(gameEngine._assetProgressChangeHandler, gameEngine));
	gameEngine._soundManager.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(gameEngine._spriteOnExecutedHandler, gameEngine));
	//check if project has finished executing

	// todo finsish on loading error and/or timeout
	var calledNotReadyTestOnce = false;
	gameEngine.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(function (e) {
		if (e.progress !== 100) {
			if(!calledNotReadyTestOnce){
				assert.ok(!gameEngine.projectReady, "Program not ready if loading not done");
				calledNotReadyTestOnce = true;
			}
			return;
		}
	   // assert.ok(gameEngine._soundsLoaded, "Set soundsLoaded to true when loading sounds is done");
		assert.ok(gameEngine.projectReady, "Program ready set to true after loading is done");
		loadingHandled();
		testDispose();

		//var gameEngine2 = new PocketCode.GameEngine();
		//gameEngine2.loadProject(strProject14);
	}));


	//make sure the testProject contains loadable sounds
	gameEngine.loadProject(testProject);

	assert.equal(gameEngine._background._id, testProject.background.id, "Correct Background set");
	assert.equal(gameEngine._sprites.length, testProject.sprites.length, "No excess sprites left");

	var spritesMatch = true;
	for (var i = 0, l = gameEngine._sprites.length; i < l; i++) {
		if (gameEngine._sprites[i]._id !== testProject.sprites[i].id)
			spritesMatch = false;
	}
	assert.ok(spritesMatch, "Sprites created correctly");

	//var varsMatch = true;
	//for (var i = 0, l = testProject.variables.length; i < l; i++) {
	//    if (gameEngine.__variablesSimple._variables[testProject.variables[i]._id] !== testProject.variables[i]) {
	//        varsMatch = false;
	//    }
	//}
	//assert.ok(varsMatch, "Variables set correctly");

	var soundsMatch = true;
	for (var i = 0, l = testProject.sounds.length; i < l; i++) {
		if (gameEngine.__sounds[testProject.sounds[i].id] !== testProject.sounds[i]) {
			soundsMatch = false;
		}
	}
	assert.ok(soundsMatch, "Sounds set correctly");

	//TODO: test loading using new imageStore
	//var imagesMatch = true;
	//var imageObjectsCreatedCorrectly = true;
	//for (var i = 0, l = testProject.images.length; i < l; i++) {
	//    if (gameEngine.__images[testProject.images[i].id] !== testProject.images[i]) {
	//        imagesMatch = false;
	//    }
	//    //console.log();    -> there shouldn't be a log when pushed
	//    if(gameEngine.__images[testProject.images[i].id].size !== testProject.images[i].size || testProject.images[i].imageObject.getAttribute("src") !== gameEngine.__images[testProject.images[i].id].url){
	//        imageObjectsCreatedCorrectly = false;
	//    }
	//}
	//assert.ok(imagesMatch, "Images set correctly");
	//assert.ok(imageObjectsCreatedCorrectly === true, "All images have an imageObject with matching criteria");

	//finish async tests if browser does not support sounds
	if (!gameEngine._soundManager.supported) {
		loadingHandled();
		//window.setTimeout(function () { testDispose(); }, 20);  //make sure the test gameEngine doesn't get sidposed before all tests were finished
		testDispose();
	}

});

QUnit.test("GameEngine: ifOnEdgeBounce", function (assert) {

	var done1 = assert.async();
	
	var /*newSpritePositionX, newSpritePositionY, newSpriteDirection,*/ newSpritePositionTriggerUpdate;
	var fakeSprite = {
		id: "spriteId_test",
		direction: 90,
		rotationStyle: PocketCode.RotationStyle.DO_NOT_ROTATE, /*.ALL_AROUND,*/
		positionX: -10,
		positionY: -10,
		size: 100,
		setPosition: function (x, y, triggerUpdate) {
			fakeSprite.positionX = x;
			fakeSprite.positionY = y;
			newSpritePositionTriggerUpdate = triggerUpdate;
		},
		setDirection: function(dir) {
			fakeSprite.direction = dir;
		},
		currentLook: {
			imageId: "i1",
		},
	};
	var ga = new PocketCode.GameEngine();
	ga._screenHeight = 100;
	ga._screenWidth = 50;
	var sh2 = ga._screenHeight / 2,
		sw2 = ga._screenWidth / 2;
	var is = new PocketCode.ImageStore();
	//inject image store to load test images directly
	ga._imageStore = is;

	//init tests
	var baseUrl = "_resources/images/",
	images = [
		{ id: "i1", url: "imgHelper1.png", size: 1 },
		{ id: "i2", url: "imgHelper2.png", size: 1 },
		{ id: "i3", url: "imgHelper3.png", size: 1 },
		{ id: "i4", url: "imgHelper4.png", size: 1 },
		{ id: "i5", url: "imgHelper5.png", size: 1 },
		{ id: "i6", url: "imgHelper6.png", size: 1 },
		{ id: "i7", url: "imgHelper7.png", size: 1 },
		{ id: "i8", url: "imgHelper8.png", size: 1 },
		{ id: "i9", url: "imgHelper9.png", size: 1 },
	];


	var onLoadCount = 0;
	var onLoadHandler = function (e) {
		onLoadCount++;

		startTest();
	};
	is.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler));
	is.loadImages(baseUrl, images, 0.5);

	var lastUpdateEventArgs;
	var onSpriteUpdate = function (e) {
		lastUpdateEventArgs = e;
	};
	ga.onSpriteChange.addEventListener(new SmartJs.Event.EventListener(onSpriteUpdate));


	var startTest = function () {

	    var opReturn, boundary;//, overflow;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.ok(opReturn == false && lastUpdateEventArgs == undefined, "simple: no change");
		assert.equal(ga.ifSpriteOnEdgeBounce(), false, "no change if no sprite is passed to method");

		//simple movements in one direction
		//left
		fakeSprite.positionX = -40;
		fakeSprite.positionY = 0;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: left overflow");
		assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY === undefined && lastUpdateEventArgs.id == "spriteId_test", "left overflow: event argument check");
		boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
		var overflowLeft = -fakeSprite.positionX - boundary.left - sw2;
		assert.equal(overflowLeft, 0, "simple: left overflow: aligned after bounce");
		assert.equal(fakeSprite.direction, 90, "left: direction not changed");
	    //directions
		fakeSprite.positionX = -40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = -170;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 170, "left: direction changed (-170 -> 170)");

		fakeSprite.positionX = -40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = -90;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 90, "left: direction changed (180 turn around)");

		fakeSprite.positionX = -40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = -40;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 40, "left: direction changed (-40 -> 40)");

		fakeSprite.positionX = -40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 0;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 0, "left: direction not changed (0 = sprite direction parallel to handled edge)");

		fakeSprite.positionX = -40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 180;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 180, "left: direction not changed (180 = sprite direction parallel to handled edge)");


	    //right
		fakeSprite.positionX = 40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 90;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: right overflow");
		assert.ok(lastUpdateEventArgs.properties.positionX !== undefined && lastUpdateEventArgs.properties.positionY === undefined && lastUpdateEventArgs.id == "spriteId_test", "right overflow: event argument check");
		boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
		var overflowRight = fakeSprite.positionX + boundary.right - sw2;
		assert.equal(overflowRight, 0, "simple: right overflow: aligned after bounce");
		assert.equal(fakeSprite.direction, -90, "left: direction changed");
	    //directions
		fakeSprite.positionX = 40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 10;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, -10, "left: direction changed (10 -> -10)");

		fakeSprite.positionX = 40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 150;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, -150, "left: direction changed (150 -> -150)");

		fakeSprite.positionX = 40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 0;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 0, "left: direction not changed (0)");

		fakeSprite.positionX = 40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 180;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 180, "left: direction not changed (180)");


		//top
		fakeSprite.positionX = 0;
		fakeSprite.positionY = 70;
		fakeSprite.direction = 0;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: top overflow");
		assert.ok(lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.positionX === undefined && lastUpdateEventArgs.id == "spriteId_test", "top overflow: event argument check");
		boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
		var overflowTop = fakeSprite.positionY + boundary.top - sh2;
		assert.equal(overflowTop, 0, "simple: top overflow: aligned after bounce");
		assert.equal(fakeSprite.direction, 180, "top: direction changed");
	    //directions
		fakeSprite.positionX = 0;
		fakeSprite.positionY = 70;
		fakeSprite.direction = -90;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, -90, "top: direction not changed (-90 = sprite direction parallel to handled edge)");

		fakeSprite.positionX = 0;
		fakeSprite.positionY = 70;
		fakeSprite.direction = 90;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 90, "top: direction not changed (90 = sprite direction parallel to handled edge)");

		fakeSprite.positionX = 0;
		fakeSprite.positionY = 70;
		fakeSprite.direction = -20;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, -160, "top: direction changed (-20 -> -160)");

		fakeSprite.positionX = 0;
		fakeSprite.positionY = 70;
		fakeSprite.direction = 40;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 140, "top: direction changed (40 -> 140)");

	    //bottom
		fakeSprite.positionX = 0;
		fakeSprite.positionY = -70;
		fakeSprite.direction = 180;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.ok(opReturn == true && lastUpdateEventArgs !== undefined, "simple: bottom overflow");
		assert.ok(lastUpdateEventArgs.properties.positionY !== undefined && lastUpdateEventArgs.properties.positionX === undefined && lastUpdateEventArgs.id == "spriteId_test", "bottom overflow: event argument check");
		boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
		var overflowBottom = -fakeSprite.positionY - boundary.bottom - sh2;
		assert.equal(overflowBottom, 0, "simple: bottom overflow: aligned after bounce");
		assert.equal(fakeSprite.direction, 0, "bottom: direction changed");
	    //directions
		fakeSprite.positionX = 0;
		fakeSprite.positionY = -70;
		fakeSprite.direction = 90;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 90, "bottom: direction not changed (90 = sprite direction parallel to handled edge)");

		fakeSprite.positionX = 0;
		fakeSprite.positionY = -70;
		fakeSprite.direction = -90;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, -90, "bottom: direction not changed (-90 = sprite direction parallel to handled edge)");

		fakeSprite.positionX = 0;
		fakeSprite.positionY = -70;
		fakeSprite.direction = 100;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, 80, "bottom: direction not changed (100 -> 80)");

		fakeSprite.positionX = 0;
		fakeSprite.positionY = -70;
		fakeSprite.direction = -170;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		assert.equal(fakeSprite.direction, -10, "bottom: direction not changed (-170 -> -10)");

	    //including rotation
		fakeSprite.rotationStyle = PocketCode.RotationStyle.ALL_AROUND;
		lastUpdateEventArgs = undefined;

		fakeSprite.positionX = 0;   //no bounce
		fakeSprite.positionY = 0;
		fakeSprite.direction = 45;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
		overflowRight = fakeSprite.positionX + boundary.right - sw2;
		assert.equal(lastUpdateEventArgs, undefined, "rotation: right but without overflow: no event triggered");

		fakeSprite.positionX = 40;
		fakeSprite.positionY = 0;
		fakeSprite.direction = 45;
		opReturn = ga.ifSpriteOnEdgeBounce(fakeSprite);
		boundary = is.getLookBoundary("spriteId_test", "i1", 1, 0, false, true);
		overflowRight = fakeSprite.positionX + boundary.right - sw2;
		assert.equal(overflowRight, 0, "rotation: right overflow: aligned after bounce");


		done1();
	};

});
