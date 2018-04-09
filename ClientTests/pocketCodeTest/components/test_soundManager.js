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

    //load: general tests- detailed tests in supported/unsupported test classes
    assert.throws(function () { sm1.loadSounds(undefined, []); }, Error, "ERROR: invalid argument: url");
    assert.throws(function () { sm1.loadSounds(undefined, ""); }, Error, "ERROR: invalid argument: array");
    assert.throws(function () { sm1.loadSounds('', [{ id: "", url: "", size: "" }]); }, Error, "ERROR: invalid parameter size != number");

    var onLoadHandler = function () {
        assert.ok(true, "onLoad triggered on empty sound list");
    };
    sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));

    //start tests: empty sound list
    sm1.loadSounds('', []);

});

QUnit.test("SoundManager: supported", function (assert) {

    var sm = new PocketCode.SoundManager();
    if (!sm.supported) {
        assert.ok(false, "WARNING: tests not executed due to missing browser support- please run these tests in another browser");
        return;
    }

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();






    assert.ok(false, "TODO");
    done1();
    done2();
    done3();
});

QUnit.test("SoundManager: unsupported", function (assert) {

    //override to check if an error occurs when not supported (e.g. safari for windows)
    Object.defineProperty(PocketCode.SoundManager.prototype, 'supported', { value: createjs.Sound.initializeDefaultPlugins(), enumerable: false, writable: true });
    var sm = new PocketCode.SoundManager();
    sm.supported = false;   //forced to false to enable testing in all browsers

    assert.equal(sm.muted, true, "muted returns always true if not supported");







    assert.ok(false, "TODO");

    //var sceneId = "s01";

    //var onLoadCount = 0,
    //onErrorCount = 0,
    //onProgressCount = 0;
    //var unsupportedErrorHandler = function (e) {
    //    onErrorCount++;
    //};
    //var unsupportedProgressHandler = function (e) {
    //    onProgressCount++;
    //};
    //var unsupportedLoadHandler = function (e) {
    //    onLoadCount++;
    //};

    //var resourceBaseUrl2 = "_resources/";
    //var sounds2 = JSON.parse('[{"id":"s32","url":"sounds\/a49fd671df65fb1c1b5f93bb56b53c85_record.mp3","size":3712},{"id":"s37","url":"sounds\/e47dbee99c20968043bcf8b5858c33e1_record.mp3","size":16192},{"id":"s114","url":"sounds\/5952a60f91ed000cf2c46f645698c018_record.mp3","size":12544}]');

    ////sm.dispose();
    ////recreate
    ////sm = new PocketCode.SoundManager();

    //sm.onLoadingError.addEventListener(new SmartJs.Event.EventListener(unsupportedErrorHandler, this));
    //sm.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(unsupportedProgressHandler, this));
    //sm.onLoad.addEventListener(new SmartJs.Event.EventListener(unsupportedLoadHandler, this));

    ////check all public interfaces
    ////sm.loadSound("url", "id");
    ////assert.equal(onLoadCount, 1, "unsupported: onLoad dispatched: loadSound()");
    //onLoadCount = 0;
    //sm.loadSounds(resourceBaseUrl2, sounds2);
    //assert.ok(onLoadCount == 1 && onProgressCount == 4 && onErrorCount == 3, "unsupported: loading events check");

    ////synchronous calls
    //try {
    //    sm.pauseSound(sceneId, "s32");
    //    sm.pauseSounds(sceneId);
    //    sm.pauseSounds();
    //    sm.resumeSound(sceneId, "s32");
    //    sm.resumeSounds(sceneId);
    //    sm.resumeSounds();
    //    sm.stopSound(sceneId, "s32");
    //    sm.stopAllSounds(sceneId);
    //    sm.stopAllSounds();
    //    assert.ok(true, "unsupported: pause(), resume(), stop()");
    //}
    //catch (e) {
    //    assert.ok(false, "an error occured calling sound manager pause(), resume(), stop() methods in a browser that does not support sounds");
    //}

    //assert.ok(false, "TODO");
    ////var success = sm.startSound(sceneId, "id");
    ////assert.equal(success, false, "unsupprted: sound not started");
    ////success = sm.startSoundFromUrl(sceneId, "url");
    ////assert.equal(success, false, "unsupprted: start sound from url: not started");
    //////assert.notOk(sm.isPlaying(sceneId), "soundManager not playing");

    //////async
    ////var loaded = 0,
    ////    loadedCallback = function (e) {
    ////        loaded++;
    ////    };
    ////var finished = 0,
    ////    finishedCallback = function (e) {
    ////        finished++;
    ////    };

    ////sm.startSound(sceneId, "s12", loadedCallback, finishedCallback);
    ////assert.ok(finished == 1 && loaded == 0, "startSound: finishedCallback executed if sondMgr.unsupported");
    ////sm.startSoundFromUrl(sceneId, "url", loadedCallback, finishedCallback);
    ////assert.ok(finished == 2 && loaded == 0, "startSoundFromUrl: finishedCallback executed if sondMgr.unsupported");

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

    var sm = new PocketCode.SoundManager(),
        ap = new PocketCode.AudioPlayer(sm.soundCollectionId);

    if (!ap.supported) {
        assert.ok(false, "WARNING: tests not executed due to missing browser support- please run these tests in another browser");
        return;
    }





    assert.ok(false, "TODO");
});

QUnit.test("AudioPlayer: unsupported", function (assert) {

    //override to check if an error occurs when not supported (e.g. safari for windows)
    Object.defineProperty(PocketCode.AudioPlayer.prototype, 'supported', { value: createjs.Sound.initializeDefaultPlugins(), enumerable: false, writable: true });

    var sm = new PocketCode.SoundManager(),
        ap = new PocketCode.AudioPlayer(sm.soundCollectionId);
    ap.supported = false;   //forced to false to enable testing in all browsers





    assert.ok(ap.supported, "TODO");

});
