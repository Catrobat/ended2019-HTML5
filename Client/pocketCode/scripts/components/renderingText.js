PocketCode.RenderingText = (function () {

    function RenderingText(propObject) {    //{ id: v, text: vars[v].toString(), x: 0, y: 0, visible: false }
        
        if (typeof propObject !== 'object')
            throw new Error('The rendering text has to be initialized using a variable or text parameter object');

        this._id = propObject.id;
        this.x = propObject.x;
        this.y = propObject.y;
        this._fontFamily = 'Arial';
        this._fontSize = 50;
        this._fontWeight = 'bold';
        this._fontStyle = '';
        this.visible = propObject.visible;
        this._lineHeight = 1.31;
    }

    //properties
    Object.defineProperties(RenderingText.prototype, {
        id: {
            get: function () {
                return this._id;
            },
        },
        x: {
            value: 0.0,
            writable: true,
        },
        y: {
            value: 0.0,
            writable: true,
        },
        text: {
            set: function (value) {
                this._text = value.toString();
            },
        },
        visible: {
            value: true,
            writable: true,
        },
    });

    //methods
    RenderingText.prototype.merge({
        draw: function (context) {

            if (!this.visible || !this._text) {
                return;
            }

            context.textBaseline = 'top';
            context.font = this._fontStyle + ' ' + this._fontWeight + ' ' + this._fontSize + 'px' + ' '+ this._fontFamily;

            // wrap lines
            var newline = /\r?\n/;
            var textLines = this._text.split(newline);

            for (var i = 0, len = textLines.length; i < len; i++) {
                var heightOfLine = this._fontSize * this._lineHeight * i;
                context.fillText(textLines[i], this.x, this.y + heightOfLine);
            }
        },
    });

    return RenderingText;
})();