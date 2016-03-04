'use strict';

PocketCode.ProjectTester = (function () {
  //SoundManager.extends(SmartJs.Core.Component);

  function ProjectTester() {

    this.ProjectCount = 0;
    this.sensorEmulation = false;


  }

  //events
  /*
  Object.defineProperties(ProjectTester.prototype, {
    onSpaceKeyDown: {
      get: function() {
        return this._onSpaceKeyDown;
      },
    },
  });
  //^^ this._onSpaceKeyDown.dispatch();

  //properties
  Object.defineProperties(ProjectTester.prototype, {
    ProjectCount: {
      get: function () {
        return this.ProjectCount;
      },
      set: function (value) {
        //if (typeof value !== 'I')
        //  throw new Error('invalid parameter: expected type \'boolean\'');

        this.ProjectCount = value;

        //TODO: https://developer.mozilla.org/en-US/docs/Web/API/CameraControl/flashMode
      }
    },
  });

  //events

  //methods
  /*
  ProjectTester.merge({
    _getProjectCount: function () {
      return this.ProjectCount;
    },
  });
*/
  return ProjectTester;
})();
