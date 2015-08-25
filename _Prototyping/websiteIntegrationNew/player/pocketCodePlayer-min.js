
if (!PocketCode)
    var PocketCode = {};

PocketCode.Web = {};

PocketCode.Web.PlayerInterface = {

    launchProject: function (projectId, rfc3066) {
        alert('HTML5 player coming soon: \nproject id: ' + projectId + '\nlanguage: ' + rfc3066);
    },

};

if (!launchProject) {
    var launchProject = function (projectId, rfc3066) {

        PocketCode.Web.PlayerInterface.launchProject(projectId, rfc3066);
    }
}