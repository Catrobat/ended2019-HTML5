/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
/// <reference path="../components/publishSubscribe.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.merge({

    WhenProgramStartBrick: (function () {
        WhenProgramStartBrick.extends(PocketCode.BaseBrick, false);

        function WhenProgramStartBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenProgramStartBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_when_started'
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenProgramStartBrick;
    })(),

    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.BaseBrick, false);

        function WhenActionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenActionBrick)){
                throw new Error("Invalid argument Model");
            }

            //todo: 2 different bricks: wenn angetippt, wenn der bildschirm berührt wird
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_when' //todo brick_when_touched
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenActionBrick;
    })(),

    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.BaseBrick, false);

        function WhenBroadcastReceiveBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenBroadcastReceiveBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_broadcast_receive'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from message??
                        //name: 'WhenBroadcastReceiveBrick'+ PocketCode.WhenBroadcastReceiveBrick.content[2].id,
                        value: ''
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenBroadcastReceiveBrick;
    })(),

    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.BaseBrick, false);

        function BroadcastBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.BroadcastBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_broadcast'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from message??
                        //name: 'BroadcastBrick'+ PocketCode.BroadcastBrick.content[2].id,
                        value: ''
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return BroadcastBrick;
    })(),

    BroadcastAndWaitBrick: (function () {
        BroadcastAndWaitBrick.extends(PocketCode.BaseBrick, false);

        function BroadcastAndWaitBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.BroadcastAndWaitBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_broadcast_wait'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from message??
                        //name: 'BroadcastAndWaitBrick'+ PocketCode.BroadcastAndWaitBrick.content[2].id,
                        value: ''
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return BroadcastAndWaitBrick;
    })(),

    WhenConditionMetBrick: (function () {
        WhenConditionMetBrick.extends(PocketCode.BaseBrick, false);

        function WhenConditionMetBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenConditionMetBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_when_condition_when'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'WhenConditionMetBrick'+ PocketCode.WhenConditionMetBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_when_becomes_true'
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenConditionMetBrick;
    })(),

    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.BaseBrick, false);

        function WhenCollisionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenCollisionBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_collision_receive'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(),
                        //name: 'WhenCollisionBrick'+ PocketCode.WhenCollisionBrick.content[2].id,
                        value: ''
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenCollisionBrick;
    })(),

    WhenBackgroundChangesToBrick: (function () {
        WhenBackgroundChangesToBrick.extends(PocketCode.BaseBrick, false);

        function WhenBackgroundChangesToBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenBackgroundChangesToBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_when_background'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from background
                        //name: 'WhenBackgroundChangesToBrick'+ PocketCode.WhenBackgroundChangesToBrick.content[2].id,
                        value: ''
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return WhenBackgroundChangesToBrick;
    })(),
});

PocketCode.Model.merge({

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.BaseBrick, false);

        function WhenStartAsCloneBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenStartAsCloneBrick)){
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_when_cloned'
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: ''
                    }
                ]
            };

            var view = new PocketCode.View.EventBrickView(commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenStartAsCloneBrick;
    })(),
});
