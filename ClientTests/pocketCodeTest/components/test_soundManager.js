/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/soundManager.js" />
"use strict";

QUnit.module("components/soundManager.js");


QUnit.test("SoundManager", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    var sm1 = new PocketCode.SoundManager();
    var sm2 = new PocketCode.SoundManager();

    assert.ok(sm1 instanceof PocketCode.SoundManager, "instance check");
    assert.ok(sm1.onLoadingProgress instanceof SmartJs.Event.Event && sm1.onLoad instanceof SmartJs.Event.Event &&
        sm1.onFinishedPlaying instanceof SmartJs.Event.Event && sm1.onLoadingError instanceof SmartJs.Event.Event, "events: accessors");

    //initial
    assert.equal(sm1.isPlaying, false, "not playing on initialized");
    assert.equal(sm1.muted, false, "not muted on initialized");
    assert.throws(function () { sm1.muted = "failed" }, Error, "ERROR: muted setter with invalid parameter");
    sm1.muted = false;  //code coverage only
    sm1.muted = true;
    assert.equal(sm1.muted, true, "muted getter/setter");

    sm1.volume = -2;
    assert.equal(Math.round(sm1.volume * 100) / 100, 0, "volume getter/setter check: range min");
    sm1.volume = 200;
    assert.equal(Math.round(sm1.volume * 100) / 100, 100, "volume getter/setter check: range max");
    sm1.volume = 92;
    assert.equal(Math.round(sm1.volume * 100) / 100, 92, "volume getter/setter check: initialized");
    assert.throws(function () { sm1.volume = "failed" }, Error, "ERROR: volume setter with invalid parameter");
    sm1.volume = 92;    //code coverage check only

    assert.throws(function () { sm1.loadSounds('', [{ id: "", url: "", size: "" }]); }, Error, "ERROR: invalid parameter size != number");

    var onLoadHandler = function () {
        assert.ok(true, "onLoad triggered on empty sound list");
        if (sm1.supported)
            runLoadingTests();
        else
            runLoadingTestsUnsupported();
    };
    sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(onLoadHandler, this));
    //sm1.loadSounds('', []);   //moved to EOF

    //NOT SUPPORTED
    var onLoadCount = 0,
        onErrorCount = 0,
        onProgressCount = 0;

    var unsupportedErrorHandler = function (e) {
        onErrorCount++;
    };
    var unsupportedProgressHandler = function (e) {
        onProgressCount++;
    };
    var unsupportedLoadHandler = function (e) {
        onLoadCount++;
    };

    function runLoadingTestsUnsupported() {
        var resourceBaseUrl2 = "_resources/";
        var sounds2 = JSON.parse('[{"id":"s32","url":"sounds\/a49fd671df65fb1c1b5f93bb56b53c85_record.mp3","size":3712},{"id":"s37","url":"sounds\/e47dbee99c20968043bcf8b5858c33e1_record.mp3","size":16192},{"id":"s114","url":"sounds\/5952a60f91ed000cf2c46f645698c018_record.mp3","size":12544}]');

        sm1.dispose();
        sm1 = new PocketCode.SoundManager();
        sm1.onLoadingError.addEventListener(new SmartJs.Event.EventListener(unsupportedErrorHandler, this));
        sm1.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(unsupportedProgressHandler, this));
        sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(unsupportedLoadHandler, this));

        //check all public interfaces
        sm1.loadSound("url", "id");
        assert.equal(onLoadCount, 1, "unsupported: onLoad dispatched: loadSound()");
        onLoadCount = 0;
        sm1.loadSounds(resourceBaseUrl2, sounds2);
        assert.ok(onLoadCount == 1 && onProgressCount == 4 && onErrorCount == 3, "unsupported: loading events check");

        try {
            sm1.pauseSounds();
            sm1.resumeSounds();
            sm1.stopAllSounds();
            assert.ok(true, "unsupported: pause(), resume(), stop()");
        }
        catch (e) {
            assert.ok(false, "an error occured calling sound manager pause(), resume(), stop() methods in a browser that does not support sounds");
        }

        var success = sm1.startSound("id");
        assert.equal(success, false, "unsupprted: sound not started");
        success = sm1.startSoundFromUrl("url");
        assert.equal(success, false, "unsupprted: start sound from url: not started");

        assert.ok(false, "WARNING: not all tests (alternative tests) were executed due to missing browser support");
        done1();
        done2();
        done3();
    }

    //SUPPORTED
    function runLoadingTests() {
        sm1.dispose();
        sm1 = new PocketCode.SoundManager();

        //loading: start asap
        var sm1InstanceStartedHandler = function (e) {
            sm1.pauseSounds();
            assert.equal(sm1.isPlaying, true, "isPlaying on paused sound");
            var si = e.instance;
            assert.equal(Math.round(si.volume * 100) / 100, 0.92, "volume on paused sound");
            sm1.volume = 80;
            assert.equal(Math.round(si.volume * 100) / 100, 0.8, "volume changed: on active sound");

            assert.equal(si.muted, true, "muted: on active/paused sound");
            sm1.muted = false;
            assert.equal(si.muted, false, "muted changed: on active sound");
            sm1.resumeSounds();
        };
        var sm1FinishedPlayingHandler = function (e) {
            assert.equal(sm1.isPlaying, false, "isPlaying = false when all finished");

            assert.throws(function () { sm1.loadSound(); }, Error, "ERROR: load sound missing args: url");
            assert.throws(function () { sm1.loadSound("url"); }, Error, "ERROR: load sound missing args: id");
            done1();
            runLoadingTests2();
        };
        sm1._onStartPlayingInstance.addEventListener(new SmartJs.Event.EventListener(sm1InstanceStartedHandler, this));
        sm1._onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(sm1FinishedPlayingHandler, this));
        //reset properties unset during reinit
        sm1.volume = 92;
        sm1.muted = true;
        sm1.startSoundFromUrl("_resources/sounds/ba454104796ff54154552e6501870d10_a.mp3");
    };

    //loading unsupported file formats
    function runLoadingTests2() {
        var resourceBaseUrl2 = "_resources/";
        var sounds2 = JSON.parse('[{"id":"s32","url":"sounds\/a49fd671df65fb1c1b5f93bb56b53c85_record.mp3","size":3712},{"id":"s37","url":"sounds\/e47dbee99c20968043bcf8b5858c33e1_record.mp3","size":16192},{"id":"s114","url":"sounds\/5952a60f91ed000cf2c46f645698c018_record.mp3","size":12544}]');

        //load: sm2
        var sm2Progress = [],
            sm2Load,
            sm2Error = 0,
            sm2Finished;
        var sm2ProgressHandler = function (e) {
            sm2Progress.push(e);
            //console.log('progress2: ' + e.progress);
        };
        var sm2LoadHandler = function (e) {
            sm2Load = e;
            //console.log('load2');
            //sm2.startSoundFromUrl('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=sound has successfully finished: two');//, 'newId', 'mp3');
            assert.equal(sm2Progress.length, 4, "count progress");
            assert.equal(sm2Progress[sm2Progress.length - 1].progress, 100, "last progress = 100%");
            assert.equal(sm2Error, 3, "all files failed loading due to unsupprted mp3 format");

            var success = sm2.startSound("s32");
            assert.equal(success, false, "start sound return false on invalid sound");
            done2();
            runSuccessfulLoadingTests();
        };
        var sm2ErrorHandler = function (e) {
            sm2Error++;// = e;
            //console.log('error2');
        };
        //var sm2FinishedPlayingHandler = function (e) {
        //    sm2Finished = e;
        //    console.log('finished playing2');
        //};

        sm2.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm2ProgressHandler, this));
        sm2.onLoad.addEventListener(new SmartJs.Event.EventListener(sm2LoadHandler, this));
        sm2.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm2ErrorHandler, this));
        sm2.loadSounds(resourceBaseUrl2, sounds2);  //2 errors thrown: firefox: 
        sm2.abortLoading();
        sm2.dispose();

        var sm2Progress = [],
            sm2Load = undefined,
            sm2Error = 0,
            sm2Finished = undefined;
        sm2 = new PocketCode.SoundManager();
        sm2.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm2ProgressHandler, this));
        sm2.onLoad.addEventListener(new SmartJs.Event.EventListener(sm2LoadHandler, this));
        sm2.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm2ErrorHandler, this));
        sm2.loadSounds(resourceBaseUrl2, sounds2);
    };

    //loading success
    var resourceBaseUrl1 = "_resources/";
    var sounds1 = JSON.parse('[{"id":"s16","url":"sounds\/3ec79f9addcf5055e069ec794db954e8_c.mp3","size":11140},{"id":"s17","url":"sounds\/778fc114464dcf4b368c7d2841863beb_d.mp3","size":11140},{"id":"s18","url":"sounds\/152badadc1a428c7a89b46cf6d82a43b_e.mp3","size":11140},{"id":"s19","url":"sounds\/dbdd35220c46b04c7ace3f04af185702_f.mp3","size":11140},{"id":"s20","url":"sounds\/e2b1d3b4f3d65de8f6468539ad695e94_g.mp3","size":11140}]');//,{"id":"s21","url":"sounds\/ba454104796ff54154552e6501870d10_a.mp3","size":11140},{"id":"s22","url":"sounds\/9cfb811c257d934d69671369ac15e88e_H.mp3","size":139142},{"id":"s25","url":"sounds\/8586959b14c74023b91e2c17da40cab4_c#.mp3","size":141755},{"id":"s26","url":"sounds\/3bdf92aad67a35e1d67f8b9c304cc732_d#.mp3","size":94734},{"id":"s27","url":"sounds\/7511b8919dadb9d098d77ab228d41ca5_e#.mp3","size":159518},{"id":"s28","url":"sounds\/459ab4eb37f698e3cee4a7f773870a79_f#.mp3","size":23159},{"id":"s29","url":"sounds\/590e4930d1a4d647da8b5d43919fd2ab_g#.mp3","size":56595}]');

    function runSuccessfulLoadingTests() {
        sm1 = new PocketCode.SoundManager();
        var sm1Progress = [],
            sm1Load,
            sm1Error,
            sm1Finished;
        var sm1ProgressHandler = function (e) {
            sm1Progress.push(e);
            //console.log('progress: ' + e.progress);
        };
        var sm1LoadHandler = function (e) {
            sm1Load = e;
            //console.log('load');
            //sm1.loadSound("_resources/sounds/459ab4eb37f698e3cee4a7f773870a79_f#.mp3", "H");
            //done3();
            runStopTests();
        };
        var sm1ErrorHandler = function (e) {
            sm1Error = e;
            //console.log('error');
        };
        var sm1FinishedPlayingHandler = function (e) {
            sm1Finished = e;
            //console.log('finished playing');
        };

        sm1.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm1ProgressHandler, this));
        sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(sm1LoadHandler, this));
        sm1.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm1ErrorHandler, this));
        sm1.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(sm1FinishedPlayingHandler, this));

        assert.throws(function () { sm1.loadSounds(resourceBaseUrl1, "sounds1"); }, Error, "ERROR: no array");
        sm1.loadSounds(resourceBaseUrl1, sounds1);
        assert.throws(function () { sm1.loadSounds(resourceBaseUrl1, sounds1); }, Error, "ERROR: loading in progress");

        //done3();
    };

    function runStopTests() {

        var instanceCount = 0;
        var sm1StartPlayingHandler = function () {
            instanceCount++;
            if (instanceCount > 3) {
                sm1.stopAllSounds();
                assert.equal(sm1.isPlaying, false, "isPlaying = false after stopAllSounds()");
                done3();
            }
        };
        sm1._onStartPlayingInstance.addEventListener(new SmartJs.Event.EventListener(sm1StartPlayingHandler, this));
        for (var i = 0, l = sm1._registeredFiles.length; i < l; i++) {
            if (instanceCount > 3)
                break;  //make sure no file is loaded after done3() is called
            var id = sm1._registeredFiles[i].id;
            id = id.replace(sm1._id, "");   //internal IDs != sound IDs
            sm1.startSound(id);
        }
    };


    //start tests
    sm1.loadSounds('', []);

});