/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
"use strict";

QUnit.module("components/soundManager.js");


QUnit.test("SoundManager", function (assert) {

    var sm1 = new PocketCode.SoundManager();
    var sm2 = new PocketCode.SoundManager();

    assert.ok(sm1 instanceof PocketCode.SoundManager, "instance check");
    assert.ok(sm1.onLoadingProgress instanceof SmartJs.Event.Event && sm1.onLoad instanceof SmartJs.Event.Event &&
        sm1.onLoadingError instanceof SmartJs.Event.Event, "events: accessors");

    assert.ok(typeof sm1.supported == "boolean", "getter: supported");
    assert.ok(sm1.soundCollectionId != undefined, "soundCollectionId generated");

    //mute
    assert.ok(sm1.muted == sm1.supported ? false : true, "not muted on initialize (except: not supported)");
    assert.throws(function () { sm1.muted = "failed" }, Error, "ERROR: muted setter with invalid parameter");
    sm1.muted = false;  //code coverage only
    assert.equal(sm1.muted, false, "muted getter/setter");
    sm1.muted = true;
    assert.equal(sm1.muted, sm2.muted, "muted getter/setter: mute() dependency on all soundManager instances");
    sm1.muted = false;  //set to false gain to hear sounds in other tests

    //load: general tests- detailed tests in supported/unsupported test classes
    assert.throws(function () { sm1.loadSounds(undefined, []); }, Error, "ERROR: invalid argument: url");
    assert.throws(function () { sm1.loadSounds(undefined, ""); }, Error, "ERROR: invalid argument: array");
    assert.throws(function () { sm1.loadSounds('', [{ id: "", url: "", size: "" }]); }, Error, "ERROR: invalid parameter size != number");

    var onLoadCounter = 0,
        onLoadHandler = function () {
            onLoadCounter++;
        };
    sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));

    //start tests: empty sound list
    sm1.loadSounds('', []);
    assert.equal(onLoadCounter, 1, "onLoad triggered on empty sound list");

});

QUnit.test("SoundManager: supported", function (assert) {

    var sm1 = new PocketCode.SoundManager();
    var sm2 = new PocketCode.SoundManager();
    if (!sm1.supported) {
        assert.ok(false, "WARNING: tests not executed due to missing browser support- please run these tests in another browser");
        return;
    }

    var done1 = assert.async();
    var done2 = assert.async();

    //create test infrastructure
    var resourceBaseUrl1 = "_resources/";
    var sounds1 = [
        { id: "s16", url: "sounds/3ec79f9addcf5055e069ec794db954e8_c.mp3", size: 11140 },
        { id: "s17", url: "sounds/778fc114464dcf4b368c7d2841863beb_d.mp3", size: 11140 },
        { id: "s18", url: "sounds/152badadc1a428c7a89b46cf6d82a43b_e.mp3", size: 11140 },
        { id: "s19", url: "sounds/dbdd35220c46b04c7ace3f04af185702_f.mp3", size: 11140 },
        { id: "s20", url: "sounds/e2b1d3b4f3d65de8f6468539ad695e94_g.mp3", size: 11140 }
    ];
    var sounds2 = [
        { id: "s32", url: "sounds/a49fd671df65fb1c1b5f93bb56b53c85_record.mp3", size: 3712 },
        { id: "s37", url: "sounds/e47dbee99c20968043bcf8b5858c33e1_record.mp3", size: 16192 },
        { id: "s114", url: "sounds/5952a60f91ed000cf2c46f645698c018_record2", size: 12544 }    //including invalid file
    ];

    //sound manager 1 tests
    var sm1Progress = [],
        sm1ProgressHandler = function (e) {
            sm1Progress.push(e);
        };
    var sm1Load,
        sm1LoadHandler = function (e) {
            sm1Load = e;

            test_validateOnLoadSm1();
        };
    var sm1Error,
        sm1ErrorHandler = function (e) {
            sm1Error = e;
            //console.log('error');
        };

    sm1.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm1ProgressHandler, this));
    sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(sm1LoadHandler, this));
    sm1.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm1ErrorHandler, this));

    sm1.loadSounds(resourceBaseUrl1, sounds1);
    assert.throws(function () { sm1.loadSounds(resourceBaseUrl1, sounds1); }, Error, "ERROR: loading in progress");

    function test_validateOnLoadSm1() {   //called onLoad
        assert.equal(sm1Progress.length, 5 + 1, "progress event dispatched after loading each file (including progress = 0 when started)");

        //dispose during loading
        sm1.loadSounds(resourceBaseUrl1, sounds1);
        sm1.dispose();

        done1();
    }

    //sound manager 2 tests: is loading at the same time
    var sm2Progress = [],
        sm2ProgressHandler = function (e) {
            sm2Progress.push(e);
        };
    var sm2Load,
        sm2LoadHandler = function (e) {
            sm2Load = e;

            test_validateOnLoadsm2();
        };
    var sm2Error,
        sm2ErrorHandler = function (e) {
            sm2Error = e;
        };

    sm2.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm2ProgressHandler, this));
    sm2.onLoad.addEventListener(new SmartJs.Event.EventListener(sm2LoadHandler, this));
    sm2.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm2ErrorHandler, this));

    sm2.loadSounds(resourceBaseUrl1, sounds2);

    function test_validateOnLoadsm2() {   //called onLoad
        assert.equal(sm2Progress.length, 3 + 1, "progress event dispatched even if loading error occures (including progress = 0 when started)");
        assert.ok(sm2Error != undefined, "error event dispatched on loading error");
        assert.ok(sm2Error.file != undefined && sm2Error.file.id == "s114" && sm2Error.file.size == 12544 && sm2Error.file.src == "_resources/sounds/5952a60f91ed000cf2c46f645698c018_record2", "detailed file error event on loading error");

        done2();
    }

});

QUnit.test("SoundManager: unsupported", function (assert) {

    //override to check if an error occurs when not supported (e.g. safari for windows)
    Object.defineProperty(PocketCode.SoundManager.prototype, 'supported', { value: createjs.Sound.initializeDefaultPlugins(), enumerable: false, writable: true });
    var sm1 = new PocketCode.SoundManager();
    var sm2 = new PocketCode.SoundManager();
    sm1.supported = false;   //forced to false to enable testing in all browsers
    sm2.supported = false;

    assert.equal(sm1.muted, true, "muted returns always true if not supported");

    var done1 = assert.async();
    var done2 = assert.async();

    //create test infrastructure
    var resourceBaseUrl1 = "_resources/";
    var sounds1 = [
        { id: "s16", url: "sounds/3ec79f9addcf5055e069ec794db954e8_c.mp3", size: 11140 },
        { id: "s17", url: "sounds/778fc114464dcf4b368c7d2841863beb_d.mp3", size: 11140 },
        { id: "s18", url: "sounds/152badadc1a428c7a89b46cf6d82a43b_e.mp3", size: 11140 },
        { id: "s19", url: "sounds/dbdd35220c46b04c7ace3f04af185702_f.mp3", size: 11140 },
        { id: "s20", url: "sounds/e2b1d3b4f3d65de8f6468539ad695e94_g.mp3", size: 11140 }
    ];
    var sounds2 = [
        { id: "s32", url: "sounds/a49fd671df65fb1c1b5f93bb56b53c85_record.mp3", size: 3712 },
        { id: "s37", url: "sounds/e47dbee99c20968043bcf8b5858c33e1_record.mp3", size: 16192 },
        { id: "s114", url: "sounds/5952a60f91ed000cf2c46f645698c018_record2", size: 12544 }    //including invalid file
    ];

    //sound manager 1 tests
    var sm1Progress = [],
        sm1ProgressHandler = function (e) {
            sm1Progress.push(e);
        };
    var sm1Load,
        sm1LoadHandler = function (e) {
            sm1Load = e;

            test_validateOnLoadSm1();
        };
    var sm1Error,
        sm1ErrorHandler = function (e) {
            sm1Error = e;
            //console.log('error');
        };

    sm1.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm1ProgressHandler, this));
    sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(sm1LoadHandler, this));
    sm1.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm1ErrorHandler, this));

    sm1.loadSounds(resourceBaseUrl1, sounds1);

    function test_validateOnLoadSm1() {   //called onLoad
        assert.equal(sm1Progress.length, 5 + 1, "progress event dispatched after loading each file (including progress = 0 when started)");
        done1();
    }

    //sound manager 2 tests: is loading at the same time
    var sm2Progress = [],
        sm2ProgressHandler = function (e) {
            sm2Progress.push(e);
        };
    var sm2Load,
        sm2LoadHandler = function (e) {
            sm2Load = e;

            test_validateOnLoadsm2();
        };
    var sm2Error,
        sm2ErrorHandler = function (e) {
            sm2Error = e;
        };

    sm2.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm2ProgressHandler, this));
    sm2.onLoad.addEventListener(new SmartJs.Event.EventListener(sm2LoadHandler, this));
    sm2.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm2ErrorHandler, this));

    sm2.loadSounds(resourceBaseUrl1, sounds2);

    function test_validateOnLoadsm2() {   //called onLoad
        assert.equal(sm2Progress.length, 3 + 1, "progress event dispatched even if loading error occures (including progress = 0 when started)");
        assert.ok(sm2Error != undefined, "error event dispatched on loading error");
        assert.ok(sm2Error.file != undefined && sm2Error.file.id == "s114" && sm2Error.file.size == 12544 && sm2Error.file.src == "_resources/sounds/5952a60f91ed000cf2c46f645698c018_record2", "detailed file error event on loading error");

        done2();
    }

});


QUnit.test("AudioPlayer", function (assert) {

    var sm = new PocketCode.SoundManager(),
        ap = new PocketCode.AudioPlayer(sm.soundCollectionId);

    assert.ok(ap instanceof PocketCode.AudioPlayer && ap instanceof PocketCode.SoundManager, "instance check");
    assert.ok(ap.onFinishedPlaying instanceof SmartJs.Event.Event, "event initialized");

    assert.throws(function () { ap = new PocketCode.AudioPlayer(); }, Error, "ERROR: missing cntr argument");
    assert.equal(ap.soundCollectionId, sm.soundCollectionId, "soundCollectionId stored (mapping to loaded sounds)");

    //initial
    assert.equal(ap.volume, 100, "volume is set to 100 (initial)");
    ap.volume = -2;
    assert.equal(Math.round(ap.volume * 100) / 100, 0, "volume getter/setter check: range min");
    ap.volume = 200;
    assert.equal(Math.round(ap.volume * 100) / 100, 100, "volume getter/setter check: range max");
    ap.volume = 92;
    assert.equal(Math.round(ap.volume * 100) / 100, 92, "volume getter/setter check: initialized");
    assert.throws(function () { ap.volume = "failed" }, Error, "ERROR: volume setter with invalid parameter");
    ap.volume = 92; //only called to complete code coverage (no active sounds affected)

    assert.equal(ap.isPlaying, false, "not playing: initial");
});

QUnit.test("AudioPlayer:supported", function (assert) {

    var done1 = assert.async();
    //var done2 = assert.async();

    var sm = new PocketCode.SoundManager();
    sm._scId = "ap_test_";  //set sound collection for tests: to avoid side-effects with other tests
    var ap = new PocketCode.AudioPlayer(sm.soundCollectionId);

    if (!ap.supported) {
        assert.ok(false, "WARNING: tests not executed due to missing browser support- please run these tests in another browser");
        return;
    }

    //playing unknown sound
    var success = ap.startSound("ap1");
    assert.notOk(success, "play returns false if sound is not started");

    assert.throws(function () { ap.loadSoundFile(); }, Error, "ERROR: invlid load parameter");
    success = ap.loadSoundFile("sId1", "_resources/");
    assert.notOk(success, "loadSoundFile() returns false if not successfull");
    success = ap.loadSoundFile("sId2", "_resources/sounds/3ec79f9addcf5055e069ec794db954e8_c.mp3");
    assert.ok(success, "loadSoundFile() returns true if successfull");

    var started = false,
        onStartCallback = function () {
            started = true;
        },
        finished = false,
        onFinishCallback = function () {
            finished = true;
            assert.ok(started, "sound started onLoad");
            assert.ok(finished, "sound finished playing (onLoad)");

            runStartSoundTests();
        };
    success = ap.loadSoundFile("sId3", "_resources/sounds/3ec79f9addcf5055e069ec794db954e8_c.mp3", undefined, true, onStartCallback, onFinishCallback);
    //success = ap.loadSoundFile("sId4", "_resources/sounds/778fc114464dcf4b368c7d2841863beb_d.mp3", undefined, true, onStartCallback, onFinishCallback);

    function runStartSoundTests() {
        success = ap.startSound("sId2");
        assert.ok(success, "startSound() successfull");

        done1();
    }

});

QUnit.test("AudioPlayer: unsupported", function (assert) {

    //override to check if an error occurs when not supported (e.g. safari for windows)
    Object.defineProperty(PocketCode.AudioPlayer.prototype, 'supported', { value: createjs.Sound.initializeDefaultPlugins(), enumerable: false, writable: true });

    var sm = new PocketCode.SoundManager(),
        ap = new PocketCode.AudioPlayer(sm.soundCollectionId);
    ap.supported = false;   //forced to false to enable testing in all browsers





    assert.ok(ap.supported, "TODO");

});
