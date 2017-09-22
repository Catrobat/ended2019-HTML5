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
            if (!(model instanceof PocketCode.Model.WhenProgramStartBrick)) {
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

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenProgramStartBrick;
    })(),

    WhenActionBrick: (function () {
        WhenActionBrick.extends(PocketCode.BaseBrick, false);

        function WhenActionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenActionBrick)) {
                throw new Error("Invalid argument Model");
            }
            if(model.action == PocketCode.UserActionType.SPRITE_TOUCHED){
                var content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_when_touched'
                        }
                    ],
                    endContent: [
                        {
                            type: 'text',
                            i18n: ''
                        }
                    ]
                };
            }
            else if(model.action == PocketCode.UserActionType.TOUCH_START) {
                var content = {
                    content: [
                        {
                            type: 'text',
                            i18n: 'brick_when'
                        }
                    ],
                    endContent: [
                        {
                            type: 'text',
                            i18n: ''
                        }
                    ]
                };
            }
            else{
                throw new Error("Unknown UserActionType");
            }

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenActionBrick;
    })(),

    WhenBroadcastReceiveBrick: (function () {
        WhenBroadcastReceiveBrick.extends(PocketCode.BaseBrick, false);

        function WhenBroadcastReceiveBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenBroadcastReceiveBrick)) {
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

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenBroadcastReceiveBrick;
    })(),

    BroadcastBrick: (function () {
        BroadcastBrick.extends(PocketCode.BaseBrick, false);

        function BroadcastBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.BroadcastBrick)) {
                throw new Error("Invalid argument Model");
            }

            if(model._andWait){
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
            }
            else {
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
            }

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return BroadcastBrick;
    })(),

    WhenConditionMetBrick: (function () {
        WhenConditionMetBrick.extends(PocketCode.BaseBrick, false);

        function WhenConditionMetBrick(model, commentedOut, formula) {
            if (!(model instanceof PocketCode.Model.WhenConditionMetBrick)) {
                throw new Error("Invalid argument Model");
            }

            var _formula = formula || "";

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_when_condition_when'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        value: _formula
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

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenConditionMetBrick;
    })(),

    WhenCollisionBrick: (function () {
        WhenCollisionBrick.extends(PocketCode.BaseBrick, false);

        function WhenCollisionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenCollisionBrick)) {
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

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenCollisionBrick;
    })(),

    WhenBackgroundChangesToBrick: (function () {
        WhenBackgroundChangesToBrick.extends(PocketCode.BaseBrick, false);

        function WhenBackgroundChangesToBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenBackgroundChangesToBrick)) {
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

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return WhenBackgroundChangesToBrick;
    })(),

    WhenStartAsCloneBrick: (function () {
        WhenStartAsCloneBrick.extends(PocketCode.BaseBrick, false);

        function WhenStartAsCloneBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WhenStartAsCloneBrick)) {
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

            var view = new PocketCode.View.EventBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WhenStartAsCloneBrick;
    })(),

});
