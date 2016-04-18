/// <reference path="../components/sprite.js" />

PocketCode.RenderingText = (function () {

    function RenderingText(propObject) {    //{ id: v, text: vars[v].toString(), x: 0, y: 0, visible: false }
        
        if (typeof propObject !== 'object')
            throw new Error('The rendering text has to be initialized using a variable or text parameter object');

        this._fabricText = new fabric.Text(propObject.text, {
            id: propObject.id,
            selectable: false,
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            originX: "left",
            originY: "top",
            positionX: propObject.x,
            positionY: propObject.y,
            fontFamily: 'Arial',
            fontSize: 50,
            fontWeight: 'bold',
            //fill: 'rgb(b,b,b)',
            visible: propObject.visible,
        });

    }

    //properties
    Object.defineProperties(RenderingText.prototype, {
        id: {
            //set: function (value) {   //cannot be changed
            //    this._id = value;
            //},
            get: function () {
                return this._fabricText.id;
            },
        },
        x: {
            set: function (value) {
                this._x = value;
                this._fabricText.left = value;
            },
        },
        y: {
            set: function (value) {
                this._y = value;
                this._fabricText.top = value;
            },
        },
        text: {
            set: function (value) {
                this._fabricText.setText(value.toString());
            },
        },
        visible: {
            set: function (value) {
                this._fabricText.visible = value;
            },
        },
    });

    //methods
    RenderingText.prototype.merge({
        draw: function (context) {
            this._fabricText.render(context);
        },
    });

    return RenderingText;
})();