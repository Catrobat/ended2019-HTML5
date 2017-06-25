/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View = PocketCode.View || {};

PocketCode.View.BrickType = {
    EVENT: 0,
    CONTROL: 1,
    MOTION: 2,
    SOUND: 3,
    LOOK: 4,
    PEN: 5,
    DATA: 6,
    USER: 7,
}

PocketCode.View.BaseBrick = (function(){
    BaseBrick.extends(SmartJs.Ui.Control, false);

function BaseBrick(type, commentedOut) {
    SmartJs.Ui.Control.call(this, 'li', {className: 'pc-brick pc-brickType' + type})

    this._brickType = type;
    this._commentedOut = commentedOut;
    this._background = new SmartJs.Ui.ContainerControl({className : 'pc-brickBgContainer'});    //position: absolute
    this._drawBackground();
}

//properties
Object.defineProperties(BaseBrick.prototype, {
    commentedOut: {
        get: function() {
            return this._commentedOut;
        },
        set: function(value) {
            this._commentedOut = value;
        },
    },
});

//methods
BaseBrick.prototype.merge({
    showIndents: function(bool) {

    },
    //to override in derived classes
    _drawBackground: function() {
        //use: brickTpe, commentedOut, ...
    },
});

    return BaseBrick;
});