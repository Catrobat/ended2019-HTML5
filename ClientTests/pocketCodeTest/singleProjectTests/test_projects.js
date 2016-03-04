/**
 * Created by Michael Pittner on 27.02.2016.
 */



'use strict';

QUnit.module("projectTester.js");


QUnit.test("[missing]", function (assert) {

  // CONFIG
  // if 0, fetch all
  var limit = 20;
  var JsonToGameEngine = true;


  // init
  var i = 0;
  var done = {};
  for (i = 0; i < limit; i++) {
    done[i+1] = assert.async();
  }
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

  assert.ok( true, "Try to test " + limit_txt + " projects" );


  // Fetch a list of Projects and save them to "receivedObject"
  var url = PocketCode.Services.PROJECT_SEARCH;
  var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {limit: limit, mask: "downloads"});


  var onSuccessProjectsHandler = function (e) {
    receivedObject = e.responseJson;
    //var allProjectsCount = receivedObject.items.length;
    var allProjectsCount = receivedObject.totalProjects;

    if( limit == 0 ) {
      // resend request to test all Projects
      limit = allProjectsCount;
      for (i = 0; i < limit; i++) {
        done[i+1] = assert.async();
      }
      console.log( limit );
      srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {limit: limit, mask: "downloads"});
      srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectsHandler, this));
      srAllProjects.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectsHandler, this));
      PocketCode.Proxy.send(srAllProjects);
    } else {
      assert.ok(true, "get List of " + limit + " projects (total Projects: " + allProjectsCount +  " / test " + limit + " projects)");
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


  // GAME ENGINE TESTS
  var gameEngineOnLoad = function (e) {
    console.log("---- G:OK ----");
    assert.ok(true, "Project " + id + " valid");
    done[currentProjectIdx - 1]();

    // Free Memory
    console.log( "start to free" );
    gameEngine.dispose();
    console.log( "finished to free" );
    gameEngine = new PocketCode.GameEngine();

    getSingleTestProject();
  };


  var gameEngineOnLoadError = function (e) {
    //console.log("---- G:ERROR ----");
    receivedResult = e;
    var type = "";
    if ((receivedResult instanceof Object)) {
      type = "catched Error"; // receivedObject.target.keys()[0]; // e.g. ProjectNotFoundException
    } else {
      type = "Unknown target";
    }

    assert.ok(false, "Project ERROR " + id + " (" + type + ")");
    done[currentProjectIdx - 1]();

    // Free Memory
    receivedResult = null;
    e = null;
    gameEngine.dispose();
    gameEngine = new PocketCode.GameEngine();

    getSingleTestProject();
  };

  var gameEngine;
  var gameEngineOnLoadListener = new SmartJs.Event.EventListener(gameEngineOnLoad, this);
  var gameEngineOnLoadErrorListener = new SmartJs.Event.EventListener(gameEngineOnLoadError, this);
  // ---


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

    /*
    if( id == 881 || id == 1811 ) {
      getSingleTestProject();
      return;
    } */
    var sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {id: id});

    var onSuccessProjectHandler = function (e) {

      if (JsonToGameEngine == true) {
        var json = e.responseJson;

        // Test Loading Project Errors
        if (gameEngine) {
          gameEngine.onLoad.removeEventListener(gameEngineOnLoadListener);
          gameEngine.onLoadingError.removeEventListener(gameEngineOnLoadErrorListener);
          gameEngine = undefined;
        }
        gameEngine = new PocketCode.GameEngine();
        // define 2 EventListener
        gameEngine.onLoad.addEventListener(gameEngineOnLoadListener);
        gameEngine.onLoadingError.addEventListener(gameEngineOnLoadErrorListener);


        // load Project with json data
        try {
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
