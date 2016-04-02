/**
 * Created by Michael Pittner on 27.02.2016.
 */



'use strict';

QUnit.module("projectTester.js");


QUnit.test("*", function (assert) {

    /* ************************************************************************* */
    /* ******************************* CONFIG ********************************** */
    /* ************************************************************************* */

    /*                          1. Limit of tests                                */
    /* if 0, fetch all */
    var limit = 0,
        offset = 0; //TODO: retest this
    //

    /*              2. just test JSON or also test uf object works               */
    /* if true, gameEngine will test project */
    var JsonToGameEngine = true;//false;   //
    //

    /*          3. timeout when project will be canceled in game Engine          */
    // timeout in ms to cancel current projecttest
    var timeout_time = 20000;
    //

    /* 4. Only test listed programs in server_known_errors or client_known_errors (and don't skip them) */
    /* Works only, if JsonToGameEngine = false! */
    var test_only_listed_programs = "client";   //"server", "client", false;
    //

    /*                          known server errors                              */
    /* will be skipped if test_only_listed_programs = false */
    var server_known_errors = {
        2779: "image file is null",
        972: "retest required",
        1500: "retest required",
        793: "retest required",
        976: "retest required",
        4054: "retest required",
        2948: "retest required",
        864: "retest required",
        2212: "retest required",
        1608: "retest required",
        1877: "retest required",
        5763: "retest required",
        3165: "retest required",
        874: "retest required",
        3181: "retest required",
        4053: "retest required",
        903: "retest required",
        875: "retest required",
        2078: "retest required",
        3611: "retest required",
        6356: "retest required",
        2083: "retest required",
        5618: "retest required",
        4064: "retest required",
        //916: "retest required",
        1892: "retest required",
        782: "retest required",
        826: "retest required",
        2974: "retest required",
        5787: "retest required",
        3859: "retest required",
        3681: "retest required",
        5554: "retest required",
        5426: "retest required",
        1609: "retest required",
        3303: "retest required",
        3734: "retest required",
        5128: "retest required",
        3729: "retest required",
        3523: "retest required",
        1733: "not valid (InvalidProjectFileException): image file '' does not exist",
        6167: "not valid (InvalidProjectFileException): sound file '32f1747af98f7135f1628940cdbf1014_Dikke_bmw-notification_sound-1841419.mp3' does not exist",
        5992: "not valid (InvalidProjectFileException): image file 'ea276d81cbf7229736a75208a900bc7d_look.jpg' does not exist",
        3388: "not valid (InvalidProjectFileException): image file '' does not exist",
        6007: "not valid (InvalidProjectFileException): image file 'ea276d81cbf7229736a75208a900bc7d_look.jpg' does not exist",
        5551: "not valid (InvalidProjectFileException): sound file '4913ada15cb716c6c5d6d0325a4ccc09_laser.wav' does not exist",
        2364: "not valid (InvalidProjectFileException): image file '/var/www/html5/projects/v0.1/2364/images/f8ee46fff7de5cdad4a9ba4a7ab033d1_foxy_142000538285.jpg.png' does not exist",
        //                                                          ^^ this is not correct- the path should only include the file name (security issues?)
        5563: "not valid (InvalidProjectFileException): image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
        3402: "not valid (InvalidProjectFileException): sound file '47d46612ebf6507b6290492e6f73a50d_Tweet1.m4a' does not exist",
        5425: "not valid (InvalidProjectFileException): image file '037aa096f985236928a9e260bd676c09_1-Start.png' does not exist",
        5550: "not valid (InvalidProjectFileException): sound file 'fa664ec193607f56f9faf82ea347b917_FlameScore.wav' does not exist",
        4544: "not valid (InvalidProjectFileException): image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
        6155: "not valid (InvalidProjectFileException): sound file '3183cafa6d1edb49ff62334b3865f092_record.m4a' does not exist",
        1813: "not valid (InvalidProjectFileException): image file '725a4efa635206d270a9780ba9f2b371_Background.png' does not exist",
        3450: "not valid (InvalidProjectFileException): image file 'fc20476acb62ef6a1bc6560935887e3c_Moving Mole.png' does not exist",
        3636: "not valid (InvalidProjectFileException): image file '' does not exist",
        1750: "not valid (InvalidProjectFileException): image file '2a3120dd06aa3932bdfad7202713ad0f_automatic_screenshot.png' does not exist",
        3552: "not valid (InvalidProjectFileException): image file 'c6a11be685bbcd4161a76319c18382b0_live-wallpaper-radar-366779-l-280x280.png' does not exist",
        4904: "not valid (InvalidProjectFileException): image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
        1657: "not valid (InvalidProjectFileException): image file '' does not exist",
        946: "not valid (InvalidProjectFileException): image file '' does not exist",
        4385: "not valid (InvalidProjectFileException): image file '/var/www/html5/projects/v0.1/4385/images/856824522e8bddce48f79ac05818e9ae_Run__000.png' does not exist",
        3133: "",   //the errrors below where logged after my chrome crashed (from console 500 errors)
        1987: "",
        3546: "",
        5988: "",
        7038: "",
        3298: "",
        4969: "",
        4516: "",
        5965: "",
        2389: "",
        2569: "",
        2334: "",
        6472: "",
        5216: "",
        5568: "",
        5860: "",
        3329: "",
        3163: "",
    };

    server_known_errors = { //empty: do not skip any tests
    //  // pointToBricks
    //  1987: "pointTo error",
    //  2633: "pointTo error",
    //  6168: "pointTo error",
    //  7063: "pointTo error",
    //  5098: "pointTo error"
    };
    //

    /*                          known client errors                              */
    /* will be skipped if test_only_listed_programs = false */
    var client_known_errors = {
        821: "sound issue",
        881: "sound issue: chrome, valid in firefox",
        3926: "timeout 120s: 67 mb project, may also have missing bricks",
        1811: "timeout 120s",
        2732: "(uncatched Error) ILLEGAL TOKEN within parser problem in the speak brick, possibly because of a spanish text",
        6038: "timeout 120s",
        3406: "timeout 120s",
        2578: "timeout 120s",
        873: "sound issue",
        957: "?",
        3284: "sound issue",
        2733: "timeout 120s",
        1868: "timeout 120s",
        3469: "timeout 120s",
        3738: "timeout 120s",
        1799: "timeout 120s",
        1808: "timeout 120s",
        3249: "sound issue",
        1792: "timeout 120s",
        5286: "timeout 120s",
        3270: "timeout 120s",
        3923: "timeout 120s",
        2376: "timeout 120s",
        1801: "timeout 120s",
        3853: "timeout 120s",
        2689: "timeout 120s",
        3240: "sound issue",
        //6067: "(uncatched Error) Problem parsing the value '05.0' in a set volume brick: Uncaught SyntaxError: Unexpected number",    //LOADING FIXED BUT NOT RUNNING YET
        4049: "timeout 120s",
        3381: "timeout 120s",
        1823: "timeout 120s",
        2673: "sound issue? FF: encoding issue in formula/parser",
        5237: "timeout 120s",
        3230: "timeout 120s",
        1793: "timeout 120s",
        2226: "timeout 120s",
        4028: "timeout 120s",
        1958: "timeout 120s",
        1791: "timeout 120s",
        1445: "sound issue: chrome, valid in firefox",
        2196: "sound issue: chrome, valid in firefox",
        980: "sound issue: chrome, valid in firefox",
        965: "sound issuee: chrome, valid in firefox",
        3147: "sound issue: chrome, valid in firefox",
        1578: "sound issue: chrome, valid in firefox",
        4142: "timeout 120s: loading stopped",
    };
    //

    /* ************************************************************************* */
    /* ************************************************************************* */
    /* ************************************************************************* */

    if (test_only_listed_programs !== false) {
        if (test_only_listed_programs == "server")
            limit = Object.keys(server_known_errors).length;
        else if (test_only_listed_programs == "client")
            limit = Object.keys(client_known_errors).length;
    }

    // init
    var i = 0;
    var done = {};
    // define number of projects, which will be tested in Listener
    for (i = 0; i < limit; i++) {
        done[i + 1] = assert.async();
    }
    // add "last" test, to see if its finished and
    // to prevent early finishing on testing all projects
    done[0] = assert.async();
    var receivedObject;
    var currentProjectIdx = 1;
    var id = 0;
    var limit_txt;
    var receivedResult;
    if (limit != 0)
        limit_txt = limit;
    else
        limit_txt = "all";
    var timeout_timer;

    assert.ok(true, "Try to test " + limit_txt + " projects");


    if (test_only_listed_programs == false) {
        // Fetch a list of Projects and save them to "receivedObject"
        var url = PocketCode.Services.PROJECT_SEARCH;
        var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
            limit: limit,
            mask: "downloads"
        });


        var onSuccessProjectsHandler = function (e) {
            receivedObject = e.responseJson;
            //var allProjectsCount = receivedObject.items.length;
            var allProjectsCount = receivedObject.totalProjects;

            if (limit == 0) {
                // resend request to test all Projects
                limit = allProjectsCount;
                for (i = 0; i < limit; i++) {
                    done[i + 1] = assert.async();
                }
                console.log(limit);
                srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
                    limit: limit,
                    offset: offset,
                    mask: "downloads" //downloads/views/recent/random
                });
                srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectsHandler, this));
                srAllProjects.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectsHandler, this));
                PocketCode.Proxy.send(srAllProjects);
            } else {
                assert.ok(true, "get List of " + limit + " projects (total Projects: " + allProjectsCount + " / test " + limit + " projects)");
                getSingleTestProject();
            }
        };

        var onErrorProjectsHandler = function (e) {
            console.log("---- ERROR ----");
            console.log(e);
            assert.ok(true, "Fetch of all projects failed");
        };

        srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectsHandler, this));
        srAllProjects.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectsHandler, this));
        PocketCode.Proxy.send(srAllProjects);
        // ---
    }
    else {
        //receivedObject = {"items":[
        var item_arr = [];
        var errors = {};
        if (test_only_listed_programs == "server")
            errors = server_known_errors;
        else if (test_only_listed_programs == "client")
            errors = client_known_errors;


        for (var key in errors) {
            // skip loop if the property is from prototype
            if (!errors.hasOwnProperty(key)) continue;

            var el = {};
            el.id = key;
            item_arr.push(el);
        }
        receivedObject = {};
        receivedObject.items = item_arr;

        console.log(receivedObject);

        assert.ok(true, "only test " + limit + " projects from list.");
        getSingleTestProject();
    }


    // GAME ENGINE TESTS
    var gameEngineOnLoad = function (e) {
        stopTimeOut();
        assert.ok(true, "Project " + id + " valid");
        done[currentProjectIdx - 1]();

        // Free Memory
        gameEngine.dispose();
        gameEngine = new PocketCode.GameEngine();

        getSingleTestProject();
    };


    var gameEngine;
    var gameEngineOnLoadListener = new SmartJs.Event.EventListener(gameEngineOnLoad, this);
    // ---

    function startTimeOut() {
        timeout_timer = setTimeout(function () { startNextTest() }, timeout_time);
    }

    function stopTimeOut() {
        clearTimeout(timeout_timer);
    }

    function startNextTest() {
        assert.ok(false, "Project " + id + " timeout");
        done[currentProjectIdx - 1]();

        // Free Memory
        gameEngine.dispose();
        gameEngine = new PocketCode.GameEngine();

        getSingleTestProject();
    }

    // Test function
    function getSingleTestProject() {

        // termination condition
        if (receivedObject.items.length + 1 == currentProjectIdx) {
            // Last assert (to prevent early finish)
            assert.ok(true, "finished all");
            done[0]();
            return;
        }

        var url = PocketCode.Services.PROJECT;
        id = receivedObject.items[currentProjectIdx - 1].id;

        console.log("start to test " + id + " (Nr." + currentProjectIdx + ")");
        currentProjectIdx++;

        if (test_only_listed_programs == false) {
            if (id in server_known_errors) {
                assert.ok(true, "Project " + id + " skipped (" + server_known_errors[id] + ")");
                done[currentProjectIdx - 1]();
                getSingleTestProject();
                return;
            }
        }

        var sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, { id: id });
        var onSuccessProjectHandler = function (e) {

            if (JsonToGameEngine == true) {

                if (id in client_known_errors && test_only_listed_programs !== "client") {
                    assert.ok(true, "Project " + id + " skipped (" + client_known_errors[id] + ")");
                    done[currentProjectIdx - 1]();
                    getSingleTestProject();
                    return;
                }

                var json = e.responseJson;

                // Test Loading Project Errors
                if (gameEngine) {
                    gameEngine.onLoad.removeEventListener(gameEngineOnLoadListener);
                    gameEngine = undefined;
                }
                gameEngine = new PocketCode.GameEngine();
                // define 2 EventListener
                gameEngine.onLoad.addEventListener(gameEngineOnLoadListener);

                // load Project with json data
                try {
                    startTimeOut();
                    gameEngine.loadProject(json);
                } catch (error) {

                    var receivedObject = error;
                    var type = "";
                    if ((receivedObject instanceof Object)) {
                        type = "uncatched Error"; // receivedObject.target.keys()[0]; // e.g. ProjectNotFoundException
                    } else {
                        type = "Unknown target";
                    }

                    assert.ok(false, "Project ERROR " + id + " (" + type + ")");
                    done[currentProjectIdx - 1]();

                    // Free Memory
                    receivedObject = null;
                    e = null;
                    //gameEngine.dispose();
                    getSingleTestProject();
                }
            } else {
                assert.ok(true, "Project " + id + " valid");
                done[currentProjectIdx - 1]();
                getSingleTestProject();
            }
        };

        var onErrorProjectHandler = function (e) {
            var receivedObject = e.responseJson;
            var type = "", msg = "";
            if ((receivedObject instanceof Object)) {
                type = receivedObject.type; // e.g. ProjectNotFoundException
                msg = receivedObject.message;
            } else {
                type = "Unknown Error (no Json Exception)";
            }
            assert.ok(false, "Project " + id + " not valid (" + type + "): " + msg);
            done[currentProjectIdx - 1]();

            getSingleTestProject();

        };
        sr.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectHandler, this));
        sr.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectHandler, this));
        PocketCode.Proxy.send(sr);
    }
    // ---


});
