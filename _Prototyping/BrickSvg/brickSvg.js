/// <reference path="../../Client/PocketCode/libs/smartJs/sj.custom.min.js" />
'use strict';

var PocketCode = {
    Ui: {},
};

PocketCode.BrickType = {
    DEFAULT: 0,
    EVENT: 1,
    LOOP: 2,
    IF_THEN_ELSE: 3,
};

PocketCode.Ui.BrickSvg = (function () {
    BrickSvg.extends(SmartJs.Ui.Control, false);

    function BrickSvg() {
        SmartJs.Ui.Control.call(this, 'svg', { namespace: 'http://www.w3.org/2000/svg' });
        
        //this._dom.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        //this._dom.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }

    //settings
    Object.defineProperties(BrickSvg.prototype, {
        _borderWidth: {
            value: 4,
        },
        _arm: {
            value: {
                offset: 15,
                innerWidth: 20,
                outherWidth: 14,
                height: 4,
            },
        },
        _indent: {
            value: 8,
        },
    });

    //methods
    BrickSvg.prototype.merge({
        _setViewBoxSize:function(width, height){
            this._dom.setAttribute('viewBox', '0,0,' + width + ',' + height);
        },
        _updatePaths: function(paths) {
            if (this._group)
                this._group.dispose();
            this._group = new SmartJs.Ui.HtmlTag('g', { namespace: 'http://www.w3.org/2000/svg' });
            var path;
            for (var i = 0, l = paths.length; i < l; i++) {
                path = new SmartJs.Ui.HtmlTag('path', { namespace: 'http://www.w3.org/2000/svg' });
                path.setDomAttribute('d', paths[i]);
                this._group.appendChild(path);
            }
            this._appendChild(this._group);
        },
        draw: function (type, width, height, scaling, showIndents, isEndBrick) {
            var totalHeight = 0;
            if (height instanceof Array)
                for (var i = 0, l = height.length; i < l; i++)
                    totalHeight += height[i];
            else
                totalHeight = height;
            if(!isEndBrick)
                totalHeight += this._arm.height;

            this.width = width;
            this.height = totalHeight;
            this._setViewBoxSize(width, totalHeight);

            var paths = [];
            switch (type) {
                case PocketCode.BrickType.DEFAULT:
                    //d += 'M' + (width - this._borderWidth) + ',' + this._borderWidth;   //start position
                    paths = this._drawDefaultBrick(0, width, height, scaling, isEndBrick);

                    //TODO: set d as new path
                    break;

                case PocketCode.BrickType.EVENT:
                    //TODO
                    break;
                case PocketCode.BrickType.LOOP:
                    if (!height instanceof Array)
                        throw new Error('width argument has to be of type array to calculate all y offsets');
                    if (!showIndents) {
                        paths = this._drawDefaultBrick(0, width, height[0], scaling, isEndBrick);
                        paths = paths.concat(this._drawDefaultBrick(height[0] + height[1], width, height[2], scaling, isEndBrick));
                    }
                    else {
                        //TODO
                    }
                    break;
                case PocketCode.BrickType.IF_THEN_ELSE:
                    if (!height instanceof Array)
                        throw new Error('width argument has to be of type array to calculate all y offsets');
                    if (!showIndents) {
                        paths = this._drawDefaultBrick(0, width, height[0], scaling, isEndBrick);
                        paths = paths.concat(this._drawDefaultBrick(height[0] + height[1], width, height[2], scaling, isEndBrick));
                        paths = paths.concat(this._drawDefaultBrick(height[0] + height[1] + height[2] + height[3], width, height[4], scaling, isEndBrick));
                    }
                    else {
                        //TODO
                    }
                    break;
            }
            this._updatePaths(paths);
        },
        //helpers
        _drawDefaultBrick: function (offsetY, width, height, scaling, isEndBrick) {
            offsetY = offsetY || 0;
            var paths = [],
                d = 'M' + (width - this._borderWidth * 0.5) + ',' + (offsetY + this._borderWidth * 0.5);   //start position
            
            //var h = height - this._borderWidth;
            //if (isEndBrick)
            //    h -= this._arm.height;
            d += 'v' + (height - this._borderWidth);
            d += this._drawBottomLineRtl(width - this._borderWidth, isEndBrick);
            paths.push(d);

            d = 'M' + this._borderWidth * 0.5 + ',' + (height - this._borderWidth * 0.5);
            d += 'V' + (offsetY + this._borderWidth * 0.5);
            d += this._drawTopLineLtr(width - this._borderWidth);
            paths.push(d);
            return paths;
        },
        _drawTopLineLtr: function (width) {
            var arm = this._arm,
                ax = (arm.innerWidth - arm.outherWidth) * 0.5;
            var d = 'h' + (arm.offset - this._borderWidth * 0.5);
            d += 'l' + ax + ',' + arm.height;
            d += 'h' + (arm.outherWidth + this._borderWidth);
            d += 'l' + ax + ',-' + arm.height;
            d += 'h' + (width - (arm.offset + arm.innerWidth));// + this._borderWidth * 0.5));
            return d;
        },
        _drawEventTopLineLtr: function(width) {
            //TODO:
            var d = 'h' + width
            return d;
        },
        _drawBottomLineRtl: function (width, isEndBrick) {
            if (isEndBrick) {
                return 'h-' + width;
            }
            else {
                var arm = this._arm,
                    ax = (arm.innerWidth - arm.outherWidth) * 0.5;
                var d = 'h-' + (width - arm.innerWidth - arm.offset + this._borderWidth * 0.5);
                d += 'l-' + ax + ',' + arm.height;
                d += 'h-' + (arm.innerWidth - this._borderWidth);
                d += 'l-' + ax + ',-' + arm.height;
                d += 'h-' + arm.offset;
                return d;
            }

        }
    })

    return BrickSvg;
})();
