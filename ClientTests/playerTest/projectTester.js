'use strict';

PocketCode.ProjectTesterClass = (function ( ) {

  /**
   * Project Test Class
   * @constructor
   */
  function ProjectTesterClass( server_known_errors, client_known_errors, known_invalid_projects ) {
    /* ************************************************************************* */
    /* ******************************* CONFIG ********************************** */
    /* ************************************************************************* */

    this._mask = {
      DOWNLOADS: 'downloads',
      RECENT: 'recent',
      VIEWS: 'views',
      RANDOM: 'random'
    };

    this._limits = {
      ALL: 'ALL',
      DEFAULT: '10',
      NONE: '0'
    };

    this._methods = {
      FULL: '1',
      JSON: '2'
    };

    this._settings = {
      "limit": 10,
      "offset": 0,
      "timeout": 30000,                       // timeout when project will be canceled in game Engine
      "mask": this._mask.RECENT,
      "method": this._methods.FULL
    };

    this._gameEngine = null;
    this._timeout_timer = null;
    this._projectList = {};
    this._projectList.items = [];
    this._currentID = 0;

    this._projectCount = 0;
    this._currentProjectCounter = 0;

    this._onGetProjectListEvent = new SmartJs.Event.Event(this);
    this._onGetProjectEvent = new SmartJs.Event.Event(this);
    this._onErrorEvent = new SmartJs.Event.Event(this);


    this._server_known_errors = {};                               // Server Errors known by us
    this._client_known_errors = {};                               // Client Errors known by us
    this._known_invalid_projects = {};                            // Invalid Projects
    this._server_known_errors.merge( server_known_errors );
    this._client_known_errors.merge( client_known_errors );
    this._known_invalid_projects.merge( known_invalid_projects );


    /* ************************************************************************* */
    /* ************************************************************************* */
    /* ************************************************************************* */
  }

  //properties
  Object.defineProperties(ProjectTesterClass.prototype, {
    limit: {
      get: function () {
        return this._settings.limit;
      },
      set: function (value) {
        this._settings.limit = value;
      }
    },
    offset: {
      get: function () {
        return this._settings.offset;
      },
      set: function (value) {
        if (typeof value !== 'number' || value % 1 != 0)
          throw new Error('invalid parameter: expected type \'number\'');
        this._settings.offset = value;
      }
    },
    timeout: {
      get: function () {
        return this._settings.timeout_time;
      },
      set: function (value) {
        if (typeof value !== 'number' || value % 1 != 0)
          throw new Error('invalid parameter: expected type \'number\'');
        this._settings.timeout_time = value;
      }
    },
    sortedByDownloads: {
      set: function () {
        this._settings.mask = "downloads";
      }
    },
    sortedByRecent: {
      set: function () {
        this._settings.mask = "recent";
      }
    },
    sortedByViews: {
      set: function () {
        this._settings.mask = "views";
      }
    },
    sortedByRandom: {
      set: function () {
        this._settings.mask = "random";
      }
    }
  });

  //events
  Object.defineProperties(ProjectTesterClass.prototype, {
    onGetProjectList: {
      get: function () {
        return this._onGetProjectListEvent;
      }
    },
    onGetProject: {
      get: function () {
        return this._onGetProjectEvent;
      }
    },
    onGetError: {
      get: function () {
        return this._onErrorEvent;
      }
    },
    onGetGameEngineEvent: {
      get: function () {
        return this._gameEngineOnLoadEvent;
      }
    }
  });

  //methods
  ProjectTesterClass.prototype.merge({

    // Handler

    // Error - EventListener
    _loadErrorHandler: function (e) {
      this._errorMsg = e.target._responseJson.type + " - " + e.target._responseJson.message;
      e.print = "project " + this._currentID + " failed (" + this._errorMsg + ")";
      e.result = e.target._responseJson;
      this.onGetError.dispatchEvent(e);
    },
    // EventListener Called to get Number of all Projects
    _onLoadProjectCountRequest: function (e) {
      this._projectCount = e.responseJson.totalProjects;
      this._settings.limit = this._projectCount;

      var url = PocketCode.Services.PROJECT_SEARCH;
      var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
        limit: this._settings.limit,
        offset: this._settings.offset,
        mask: this._settings.mask
      });


      srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(this._onSuccessAllProjectsHandler, this));
      srAllProjects.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));

      PocketCode.Proxy.send(srAllProjects);
    },
    // EventListener to get All projects
    _onSuccessAllProjectsHandler: function (e) {
      this._projectList = e.responseJson;
      this._projectCount = this._projectList.items.length;
      this.onGetProjectList.dispatchEvent();
    },
    // EventListener to get GameEngine Result
    _gameEngineOnLoad: function (e) {

      this._stopTimeOut();

      // Free Memory
      this._gameEngine.dispose();
      this._gameEngine = new PocketCode.GameEngine();

      e.print = "project " + this._currentID + " success";
      this.onGetProject.dispatchEvent( e );
    },
    // EventListener to get JSON - Result of Program
    _onSuccessProjectHandler : function(e) {

      if( this._settings.method == this._methods.JSON ) {
        e.print = "project " + this._currentID + " success. (just JSON)";
        this.onGetProject.dispatchEvent(e);
      } else {

        if( this._currentID in this._client_known_errors )
        {
          e.print = "[KNOWN ERROR] project " + this._currentID + " skipped. (" + this._client_known_errors[id] + ")";
          this.onGetProject.dispatchEvent(e);
          return;
        }

        this._testGameEngine( e.responseJson );
      }
    },


    // Test

    // Fetch Programs and add them to _projectList
    _fetchAllProjects : function() {

      // Fetch a list of Projects and save them to "receivedObject"
      var url = PocketCode.Services.PROJECT_SEARCH;
      var srProjectsCount = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
        limit: 0
      });


      srProjectsCount.onLoad.addEventListener(new SmartJs.Event.EventListener(this._onLoadProjectCountRequest, this));
      srProjectsCount.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));

      PocketCode.Proxy.send(srProjectsCount);
      // ---

    },

    // fetch projects with specified settings
    _fetchProjects : function() {

      // Fetch a list of Projects and save them to "receivedObject"
      var url = PocketCode.Services.PROJECT_SEARCH;
      var srProjectList = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
        limit: this._settings.limit,
        offset: this._settings.offset,
        mask: this._settings.mask
      });


      srProjectList.onLoad.addEventListener(new SmartJs.Event.EventListener(this._onLoadProjectCountRequest, this));
      srProjectList.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));

      PocketCode.Proxy.send(srProjectList);
      // ---

    },

    // start Tests
    _startTests : function( projectIds, settings ) {
      this._settings.merge( settings );

      if( this._settings.limit == this._limits.ALL )
        this._fetchAllProjects();
      else if ( this._settings.limit != this._limits.NONE )
        this._fetchProjects();

      this._addToList( projectIds );

      this._nextTest();
    },
    // Next Test
    _nextTest : function() {

      // termination condition
      if( this._projectList.items.length == this._currentProjectCounter )
        return "last_call";

      // set Url
      var url = PocketCode.Services.PROJECT;

      // set Current ProjectID to see in result
      this._currentID = this._projectList.items[ this._currentProjectCounter ].id;

      // project-counter
      this._currentProjectCounter++;

      if( this._currentID in this._server_known_errors && id in this._known_invalid_projects )
      {
        e.print = "[KNOWN ERROR] project " + this._currentID + " passed, error in project. (" + this._known_invalid_projects[id] + ")";
        this.onGetProject.dispatchEvent(e);
        return;
      }

      if( this._currentID in server_known_errors)
      {
        e.print = "[KNOWN ERROR] project " + this._currentID + " passed. (" + this._server_known_errors[id] + ")";
        this.onGetProject.dispatchEvent(e);
        return;
      }

      // init request and Listener
      var sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {id: this._currentID});
      sr.onLoad.addEventListener(new SmartJs.Event.EventListener(this._onSuccessProjectHandler, this));
      sr.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));

      // send request
      PocketCode.Proxy.send(sr);
    },
    _testGameEngine : function( json )
    {
      // Test Loading Project Errors
      if(this._gameEngine)
      {
        this._gameEngine.onLoad.removeEventListener( new SmartJs.Event.EventListener( this._gameEngineOnLoad, this ) );
        this._gameEngine = undefined;
      }
      this._gameEngine = new PocketCode.GameEngine();
      // define 2 EventListener
      this._gameEngine.onLoad.addEventListener( new SmartJs.Event.EventListener( this._gameEngineOnLoad, this ) );

      // load Project with json data
      try
      {
        this._startTimeOut();
        this._gameEngine.loadProject( json );
      }
      catch(error)
      {
        var receivedObject = error;
        var type = "";
        if((receivedObject instanceof Object))
        {
          type = "uncatched Error"; // receivedObject.target.keys()[0]; // e.g. ProjectNotFoundException
        }
        else
        {
          type = "Unknown target";
        }
        this._errorMsg = type;
        e.print = "project " + this._currentID + " failed (" + this._errorMsg + ")";
        this.onGetError.dispatchEvent(e);
      }
    },

    // TIMER functions
    _callTimeout : function()
    {
      var e = {};
      e.target._responseJson.type = "Timeout";
      e.target._responseJson.message = "";
      this._loadErrorHandler( e );
    },
    _startTimeOut : function()
    {
      this._timeout_timer = setTimeout(
        this._callTimeout
      , this._settings.timeout);
    },
    _stopTimeOut : function()
    {
      clearTimeout(this._timeout_timer);
    },


    // Helping functions
    _addToList : function( list ) {
      var i = 0;
      while( i < list.length ) {
        var obj = {};
        obj.id = list[ i ];
        this._projectList.items.push( obj );
        i++;
      }
      this._projectCount = this._projectList.totalProjects;
    }
  });

  return ProjectTesterClass;
})();
