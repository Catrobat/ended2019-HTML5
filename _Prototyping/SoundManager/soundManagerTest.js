/// <reference path="../../Client/smartJs/sj.js" />
/// <reference path="../../Client/smartJs/sj-core.js" />
/// <reference path="../../Client/smartJs/sj-event.js" />

/// <reference path="../../Client/pocketCode/libs/soundjs/soundjs-0.6.1.custom.js" />
/// <reference path="../../Client/pocketCode/scripts/components/soundManager.js" />
'use strict';

window.onload = function () {

    //var obj = {};
    //var href = "https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=hellooooo";
    //obj[href] = "ok";
    //var ok = obj[href];


    var sm1 = new PocketCode.SoundManager();
    var sm2 = new PocketCode.SoundManager();
    sm1.dispose();
    sm2.dispose();

    sm1 = new PocketCode.SoundManager();
    sm2 = new PocketCode.SoundManager();

    var resourceBaseUrl = 'https://web-test.catrob.at/html5/projects/v0.1/719/';
    var sounds = JSON.parse('[{"id":"s15","url":"sounds\/34631984F52E51EDD974F0130D6F46A2_8-Bit Betty - Spooky Loop_cut.mp3","size":1865649},{"id":"s22","url":"sounds\/B5C52D60568A416924CC601731F7EA74_zap.mp3","size":3760},{"id":"s34","url":"sounds\/E13E0F5F2E34969E8514F121BC45D645_explode4.mp3","size":29738}]');

    var resourceBaseUrl2 = 'https://web-test.catrob.at/html5/projects/v0.1/965/';
    var sounds2 = JSON.parse('[{"id":"s32","url":"sounds\/a49fd671df65fb1c1b5f93bb56b53c85_record.mp3","size":3712},{"id":"s37","url":"sounds\/e47dbee99c20968043bcf8b5858c33e1_record.mp3","size":16192},{"id":"s114","url":"sounds\/5952a60f91ed000cf2c46f645698c018_record.mp3","size":12544}]');

    var resourceBaseUrl3 = 'https://web-test.catrob.at/html5/projects/v0.1/968/';
    var sounds3 = JSON.parse('[{"id":"s16","url":"sounds\/3ec79f9addcf5055e069ec794db954e8_c.mp3","size":11140},{"id":"s17","url":"sounds\/778fc114464dcf4b368c7d2841863beb_d.mp3","size":11140},{"id":"s18","url":"sounds\/152badadc1a428c7a89b46cf6d82a43b_e.mp3","size":11140},{"id":"s19","url":"sounds\/dbdd35220c46b04c7ace3f04af185702_f.mp3","size":11140},{"id":"s20","url":"sounds\/e2b1d3b4f3d65de8f6468539ad695e94_g.mp3","size":11140},{"id":"s21","url":"sounds\/ba454104796ff54154552e6501870d10_a.mp3","size":11140},{"id":"s22","url":"sounds\/9cfb811c257d934d69671369ac15e88e_H.mp3","size":139142},{"id":"s25","url":"sounds\/8586959b14c74023b91e2c17da40cab4_c#.mp3","size":141755},{"id":"s26","url":"sounds\/3bdf92aad67a35e1d67f8b9c304cc732_d#.mp3","size":94734},{"id":"s27","url":"sounds\/7511b8919dadb9d098d77ab228d41ca5_e#.mp3","size":159518},{"id":"s28","url":"sounds\/459ab4eb37f698e3cee4a7f773870a79_f#.mp3","size":23159},{"id":"s29","url":"sounds\/590e4930d1a4d647da8b5d43919fd2ab_g#.mp3","size":56595}]');

    //load: sm1
    var sm1Progress = [],
        sm1Load,
        sm1Error,
        sm1Finished;
    var sm1ProgressHandler = function (e) {
        sm1Progress.push(e);
        console.log('progress: ' + e.progress);
    };
    var sm1LoadHandler = function (e) {
        sm1Load = e;
        console.log('load');
    };
    var sm1ErrorHandler = function (e) {
        sm1Error = e;
        console.log('error');
    };
    var sm1FinishedPlayingHandler = function (e) {
        sm1Finished = e;
        console.log('finished playing');
    };

    sm1.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm1ProgressHandler, this));
    sm1.onLoad.addEventListener(new SmartJs.Event.EventListener(sm1LoadHandler, this));
    sm1.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm1ErrorHandler, this));
    sm1.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(sm1FinishedPlayingHandler, this));
    //sm1.loadSounds(resourceBaseUrl, sounds);

    //load: sm2
    var sm2Progress = [],
        sm2Load,
        sm2Error,
        sm2Finished;
    var sm2ProgressHandler = function (e) {
        sm2Progress.push(e);
        console.log('progress2: ' + e.progress);
    };
    var sm2LoadHandler = function (e) {
        sm2Load = e;
        console.log('load2');
        sm2.startSoundFromUrl('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=sound has successfully finished: two');//, 'newId', 'mp3');
    };
    var sm2ErrorHandler = function (e) {
        sm2Error = e;
        console.log('error2');
    };
    var sm2FinishedPlayingHandler = function (e) {
        sm2Finished = e;
        console.log('finished playing2');
    };

    sm2.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm2ProgressHandler, this));
    sm2.onLoad.addEventListener(new SmartJs.Event.EventListener(sm2LoadHandler, this));
    sm2.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm2ErrorHandler, this));
    sm2.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(sm2FinishedPlayingHandler, this));
    sm2.loadSounds(resourceBaseUrl2, sounds2);  //2 errors thrown: firefox: 


    //load: sm3
    var sm3 = new PocketCode.SoundManager();
    var sm3Progress = [],
        sm3Load,
        sm3Error,
        sm3Finished;
    var sm3ProgressHandler = function (e) {
        sm3Progress.push(e);
        console.log('progress3: ' + e.progress);
    };
    var sm3LoadHandler = function (e) {
        sm3Load = e;
        console.log('load3');
        sm3.muted = true;
        sm3.volume = 60;
        sm1.dispose();
        //sm2.dispose();
        sm3.startSound("s25");
    };
    var sm3ErrorHandler = function (e) {
        sm3Error = e;
        console.log('error3');
    };
    var sm3FinishedPlayingHandler = function (e) {
        sm3Finished = e;
        console.log('finished playing3');
        sm3.startSoundFromUrl('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=sound has successfully finished');
    };

    sm3.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm3ProgressHandler, this));
    sm3.onLoad.addEventListener(new SmartJs.Event.EventListener(sm3LoadHandler, this));
    sm3.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm3ErrorHandler, this));
    sm3.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(sm3FinishedPlayingHandler, this));
    sm3.loadSounds(resourceBaseUrl3, sounds3);


    //load: sm4
    var sm4 = new PocketCode.SoundManager();
    var sm4Progress = [],
        sm4Load,
        sm4Error,
        sm4Finished;
    var sm4ProgressHandler = function (e) {
        sm4Progress.push(e);
        console.log('progress4: ' + e.progress);
    };
    var sm4LoadHandler = function (e) {
        sm4Load = e;
        console.log('load4');
        //sm4.muted = true;
        //sm4.volume = 60;
        sm4.startSound("newId");
    };
    var sm4ErrorHandler = function (e) {
        sm4Error = e;
        console.log('error4');
    };
    var sm4FinishedPlayingHandler = function (e) {
        sm4Finished = e;
        console.log('finished playing4');
        sm4.startSoundFromUrl('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=sound has successfully finished');
    };

    sm4.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(sm4ProgressHandler, this));
    sm4.onLoad.addEventListener(new SmartJs.Event.EventListener(sm4LoadHandler, this));
    sm4.onLoadingError.addEventListener(new SmartJs.Event.EventListener(sm4ErrorHandler, this));
    sm4.onFinishedPlaying.addEventListener(new SmartJs.Event.EventListener(sm4FinishedPlayingHandler, this));
    sm4.loadSounds(resourceBaseUrl3, sounds3);
    sm4.loadSound('https://web-test.catrob.at/html5/projects/v0.1/968/sounds/590e4930d1a4d647da8b5d43919fd2ab_g#.mp3', 'newId', 'mp3');//, undefined);
    //sm4.loadSound('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=sound has successfully finished', 'newId', 'mp3');//, undefined);

    //window.setTimeout(sm4.startSound('newId'), 2000);
    sm4.startSoundFromUrl('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=this is a sound not cached and started directly using our text-to-speech service');
    sm4.startSoundFromUrl('https://web-test.catrob.at/html5/rest/v0.1/file/tts?text=simultanous tts output');
    var breakpoint = true;

};

