/**
 * Created by Michael Pittner on 27.02.2016.
 */



'use strict';

QUnit.module("projectTester.js");


QUnit.test("[missing]", function (assert) {

  /* ************************************************************************* */
  /* ******************************* CONFIG ********************************** */
  /* ************************************************************************* */

  /*                          1. Limit of tests                                */
  /* if 0, fetch all */
  var limit = 15;
  //

  /*              2. just test JSON or also test uf object works               */
  /* if true, gameEngine will test project */
  var JsonToGameEngine = true;
  //

  /*          3. timeout when project will be canceled in game Engine          */
  // timeout in ms to cancel current projecttest
  var timeout_time = 40000;
  //

  /* 4. Only test listed porgrams in server_known_errors (and don't skip them) */
  /* Works only, if JsonToGameEngine = false! */
  var test_only_listed_programs = false;
  //

  /*                          known server errors                              */
  /* will be skipped if test_only_listed_programs = false */
  var server_known_errors = {
    2779:"image file is null"
  };
  //

  /*                          known client errors                              */
  /* will be skipped if test_only_listed_programs = false */
  var client_known_errors = {
    821:"bleibt hängen, bitte testen"
  };
  //

  /* ************************************************************************* */
  /* ************************************************************************* */
  /* ************************************************************************* */

  if( test_only_listed_programs == true ) {
    limit = Object.keys(server_known_errors).length;
  }

  // init
  var i = 0;
  var done = {};
  // define number of projects, which will be tested in Listener
  for (i = 0; i < limit; i++) {
    done[i+1] = assert.async();
  }
  // add "last" test, to see if its finished and
  // to prevent early finishing on testing all projects
  done[0] = assert.async();
  var receivedObject;
  var currentProjectIdx = 1;
  var id = 0;
  var limit_txt;
  var receivedResult;
  if( limit != 0 )
    limit_txt = limit;
  else
    limit_txt = "all";
  var timeout_timer;

  assert.ok( true, "Try to test " + limit_txt + " projects" );


  if( test_only_listed_programs == false ) {
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
          mask: "downloads"
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
  } else {
    //receivedObject = {"items":[
    var item_arr = [];
    for ( var key in server_known_errors)
    {
      // skip loop if the property is from prototype
      if (!server_known_errors.hasOwnProperty(key)) continue;

      var el = {};
      el.id = key;
      item_arr.push( el );
    }
    receivedObject = {};
    receivedObject.items = item_arr;

    console.log( receivedObject );

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
    timeout_timer = setTimeout(function(){ startNextTest() }, timeout_time);
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
    if (receivedObject.items.length+1 == currentProjectIdx) {
      // Last assert (to prevent early finish)
      assert.ok(true, "finished all");
      done[0]();
      return;
    }

    var url = PocketCode.Services.PROJECT;
    id = receivedObject.items[currentProjectIdx-1].id;

    console.log( "start to test " + id + " (Nr." + currentProjectIdx + ")" );
    currentProjectIdx++;

    if( test_only_listed_programs == false ) {
      if (id in server_known_errors) {
        assert.ok(true, "Project " + id + " skipped (" + server_known_errors[id] + ")");
        done[currentProjectIdx - 1]();
        getSingleTestProject();
        return;
      }
    }

    var sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {id: id});
    var onSuccessProjectHandler = function (e) {

      if (JsonToGameEngine == true) {

        if (id in client_known_errors) {
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
      var type = "";
      if ((receivedObject instanceof Object)) {
        type = receivedObject.type; // e.g. ProjectNotFoundException
      } else {
        type = "Unknown Error (no Json Exception)";
      }
      assert.ok(false, "Project " + id + " not valid (" + type + ")");
      done[currentProjectIdx - 1]();

      getSingleTestProject();

    };
    sr.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectHandler, this));
    sr.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectHandler, this));
    PocketCode.Proxy.send(sr);
  }
  // ---


});
