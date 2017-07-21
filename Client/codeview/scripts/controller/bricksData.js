/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.merge({

    SetVariableBrick: (function () {
        SetVariableBrick.extends(PocketCode.BaseBrick, false);

        function SetVariableBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SetVariableBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_set_variable'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from scene??
                        //name: 'SetVariableBrick'+ PocketCode.SetVariableBrick.content[2].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'to_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'SetVariableBrick'+ PocketCode.SetVariableBrick.content[5].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return SetVariableBrick;
    })(),

    ChangeVariableBrick: (function () {
        ChangeVariableBrick.extends(PocketCode.BaseBrick, false);

        function ChangeVariableBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ChangeVariableBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_change_variable'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from var??
                        //name: 'ChangeVariableBrick'+ PocketCode.ChangeVariableBrick.content[2].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'by_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ChangeVariableBrick'+ PocketCode.ChangeVariableBrick.content[5].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return ChangeVariableBrick;
    })(),

    ShowVariableBrick: (function () {
        ShowVariableBrick.extends(PocketCode.BaseBrick, false);

        function ShowVariableBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ShowVariableBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_show_variable'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from var??
                        //name: 'ShowVariableBrick'+ PocketCode.ShowVariableBrick.content[2].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'brick_show_variable_position'
                    },
                    {
                        type: 'text',
                        i18n: 'x_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ShowVariableBrick'+ PocketCode.ShowVariableBrick.content[5].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'y_label'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ShowVariableBrick'+ PocketCode.ShowVariableBrick.content[7].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return ShowVariableBrick;
    })(),

    HideVariableBrick: (function () {
        HideVariableBrick.extends(PocketCode.BaseBrick, false);

        function HideVariableBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.HideVariableBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_hide_variable'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from var??
                        //name: 'HideVariableBrick'+ PocketCode.HideVariableBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return HideVariableBrick;
    })(),

    AppendToListBrick: (function () {
        AppendToListBrick.extends(PocketCode.BaseBrick, false);

        function AppendToListBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.AppendToListBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_add_item_to_userlist_add'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'AppendToListBrick'+ PocketCode.AppendToListBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_add_item_to_userlist'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from list??
                        //name: 'AppendToListBrick'+ PocketCode.AppendToListBrick.content[4].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return AppendToListBrick;
    })(),

    DeleteAtListBrick: (function () {
        DeleteAtListBrick.extends(PocketCode.BaseBrick, false);

        function DeleteAtListBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.DeleteAtListBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_delete_item_from_userlist_delete'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from list?
                        //name: 'DeleteAtListBrick'+ PocketCode.DeleteAtListBrick.content[2].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'brick_delete_item_from_userlist'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'DeleteAtListBrick'+ PocketCode.DeleteAtListBrick.content[5].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return DeleteAtListBrick;
    })(),

    InsertAtListBrick: (function () {
        InsertAtListBrick.extends(PocketCode.BaseBrick, false);

        function InsertAtListBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.InsertAtListBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_insert_item_into_userlist_insert_into'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'InsertAtListBrick'+ PocketCode.InsertAtListBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_insert_item_into_userlist_into_list'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from list?
                        //name: 'InsertAtListBrick'+ PocketCode.InsertAtListBrick.content[4].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'brick_insert_item_into_userlist_at_position'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'InsertAtListBrick'+ PocketCode.InsertAtListBrick.content[7].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return InsertAtListBrick;
    })(),

    ReplaceAtListBrick: (function () {
        ReplaceAtListBrick.extends(PocketCode.BaseBrick, false);

        function ReplaceAtListBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ReplaceAtListBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_replace_item_in_userlist_replace_in_list'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from list?
                        //name: 'ReplaceAtListBrick'+ PocketCode.ReplaceAtListBrick.content[2].id,
                        value: ''
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'text',
                        i18n: 'brick_replace_item_in_userlist_item_at_index'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ReplaceAtListBrick'+ PocketCode.ReplaceAtListBrick.content[5].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_replace_item_in_userlist_with_value'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'ReplaceAtListBrick'+ PocketCode.ReplaceAtListBrick.content[7].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.DATA, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return ReplaceAtListBrick;
    })(),

});

//e.g. var brick = new PocketCode.Model.SetVariableBrick({ value: "asd", id: 123 });
