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
        _cornerOffset: {
            value: 6,
        },
        _arm: {
            value: {
                offset: 14,
                innerWidth: 20,
                outherWidth: 14,
                height: 4,
            },
        },
        _indent: {
            value: 12,
        },
    });

    //methods
    BrickSvg.prototype.merge({
        _setViewBoxSize: function (width, height) {
            this._dom.setAttribute('viewBox', '0,0,{0},{1}'.format(width, height));
        },
        _updatePaths: function (paths, shadows) {
            for (var i = this._childs.length - 1; i >= 0 ; i--)
                this._childs[i].dispose();

            var path;
            for (var i = 0, l = paths.length; i < l; i++) {
                path = new SmartJs.Ui.HtmlTag('path', { namespace: 'http://www.w3.org/2000/svg' });
                path.style.strokeWidth = this._borderWidth + 'px';
                path.setDomAttribute('d', paths[i]);
                this._appendChild(path);
            }
            for (var i = 0, l = shadows.length; i < l; i++) {
                path = new SmartJs.Ui.HtmlTag('path', { namespace: 'http://www.w3.org/2000/svg' });
                path.style.strokeWidth = this._borderWidth + 'px';
                path.setDomAttribute('class', 'shadowBorder');
                path.setDomAttribute('d', shadows[i]);
                this._appendChild(path);
            }
        },
        draw: function (type, width, height, scaling, showIndents, isEndBrick) {
            var totalHeight = 0;
            if (height instanceof Array)
                for (var i = 0, l = height.length; i < l; i++)
                    totalHeight += height[i];
            else
                totalHeight = height;
            if (!isEndBrick)
                totalHeight += this._arm.height;

            this.width = width;
            this.height = totalHeight;
            this._setViewBoxSize(width, totalHeight);

            var paths = [],
                shadows = [];
            switch (type) {
                case PocketCode.BrickType.DEFAULT:
                    paths = this._drawDefaultBrick(0, width, height, scaling, isEndBrick);
                    shadows.push(paths.pop());
                    break;

                case PocketCode.BrickType.EVENT:
                    paths = this._drawEventBrick(width, height, scaling, showIndents);
                    for (i = paths.length; i > 1; i--)
                        shadows.push(paths.pop());
                    break;
                case PocketCode.BrickType.LOOP:
                    if (!height instanceof Array || height.length != 3)
                        throw new Error('width argument has to be of type array to calculate all y offsets');
                    if (showIndents) {
                        paths = this._drawLoopBrick(width, height, scaling, showIndents, isEndBrick);
                        for (i = paths.length; i > 1; i--)
                            shadows.push(paths.pop());
                        break;
                    }
                    else {
                        paths = this._drawDefaultBrick(0, width, height[0], scaling);
                        shadows.push(paths.pop());
                        paths = paths.concat(this._drawDefaultBrick(height[0] + height[1], width, height[2], scaling, isEndBrick));
                        shadows.push(paths.pop());
                    }
                    break;
                case PocketCode.BrickType.IF_THEN_ELSE:
                    if (!height instanceof Array || height.length != 5)
                        throw new Error('width argument has to be of type array to calculate all y offsets');
                    if (showIndents) {
                        paths = this._drawIfThenElseBrick(width, height, scaling, showIndents);
                        for (i = paths.length; i > 1; i--)
                            shadows.push(paths.pop());
                        break;
                    }
                    else {
                        paths = this._drawDefaultBrick(0, width, height[0], scaling);
                        shadows.push(paths.pop());
                        paths = paths.concat(this._drawDefaultBrick(height[0] + height[1], width, height[2], scaling));
                        shadows.push(paths.pop());
                        paths = paths.concat(this._drawDefaultBrick(height[0] + height[1] + height[2] + height[3], width, height[4], scaling));
                        shadows.push(paths.pop());
                    }
                    break;
            }
            this._updatePaths(paths, shadows);
        },
        //helpers
        _drawDefaultBrick: function (offsetY, width, height, scaling, isEndBrick) {
            offsetY = offsetY || 0;
            var paths = [],
                d = 'M{0},{1}'.format(width - this._borderWidth * .5, offsetY + this._cornerOffset + this._borderWidth * .5);   //start position

            d += 'v{0}'.format(height - this._cornerOffset * 2 - this._borderWidth);
            d += 'l{0},{1}'.format(-this._cornerOffset, this._cornerOffset);
            d += this._drawBottomLineRtl(width - this._cornerOffset * 2 - this._borderWidth, isEndBrick);
            paths.push(d);

            d = 'l{0},{1}'.format(-this._cornerOffset, -this._cornerOffset);
            d += 'V{0}'.format(offsetY + this._cornerOffset + this._borderWidth * .5);
            d += 'l{0},{1}'.format(this._cornerOffset, -this._cornerOffset);
            d += this._drawTopLineLtr(width - this._cornerOffset * 2 - this._borderWidth);
            d += 'l{0},{1}'.format(this._cornerOffset, this._cornerOffset);

            paths[1] = paths[0];
            paths[0] += d;
            return paths;
        },
        _drawEventBrick: function (width, height, scaling, showIndents) {
            var curveHeight = 25,   //TODO: you will have to replace this with the actual height
                paths = [],
                d = 'M{0},{1}'.format(width - this._borderWidth * .5, curveHeight + this._cornerOffset + this._borderWidth * .5);   //start position;
            if (showIndents) {
                //TODO
            }
            else {
                d += 'v{0}'.format(height - curveHeight - this._cornerOffset * 2 - this._borderWidth);
                d += 'l{0},{1}'.format(-this._cornerOffset, this._cornerOffset);
                d += this._drawBottomLineRtl(width - this._cornerOffset * 2 - this._borderWidth);
                paths.push(d);

                d = 'l{0},{1}'.format(-this._cornerOffset, -this._cornerOffset);
                d += 'V{0}'.format(curveHeight + this._cornerOffset + this._borderWidth * .5);
                d += 'l{0},{1}'.format(this._cornerOffset, -this._cornerOffset);
                d += this._drawEventTopLineLtr(width - this._cornerOffset * 2 - this._borderWidth, curveHeight);
                d += 'l{0},{1}'.format(this._cornerOffset, this._cornerOffset);

                paths[1] = paths[0];
                paths[0] += d;
                return paths;
            }

            return paths;
        },
        _drawLoopBrick: function (width, height, scaling, showIndents, isEndBrick) {
            //TODO: draw brick including intents
            var paths = [],
                d = 'M{0},{1}'.format(width - this._borderWidth * .5, this._cornerOffset + this._borderWidth * .5);   //start position

            d += 'v{0}'.format(height[0] - this._cornerOffset * 2 - this._borderWidth);
            d += 'l{0},{1}'.format(-this._cornerOffset, this._cornerOffset);
            d += this._drawBottomLineRtl(width - this._indent - this._cornerOffset * 2 - this._borderWidth);
            d += 'h{0}'.format(-this._borderWidth + .5);
            d += 'l{0},{1}'.format(-(this._cornerOffset + this._borderWidth * .5), this._cornerOffset + this._borderWidth * .5);
            d += 'v{0}'.format(height[1] - this._cornerOffset * 2);// + this._borderWidth);
            d += 'l{0},{1}'.format(this._cornerOffset + this._borderWidth * .5, this._cornerOffset + this._borderWidth * .5);
            paths.push(d);  //1st = all around
            paths.push(d);  //2nd to n-th: shadows

            d = 'h{0}'.format(this._borderWidth * .5);      //TODO: corners are not calculated correctly: make sure the convex corners fit into the concave perfectly by choosing the right offsets during drawing
            d += this._drawTopLineLtr(width - this._indent - this._cornerOffset * 2 - this._borderWidth * .5);
            d += 'l{0},{1}'.format(this._cornerOffset, this._cornerOffset);
            paths[0] += d;

            var m2 = 'M{0},{1}'.format(width - this._borderWidth * .5, height[0] + height[1] + this._cornerOffset + this._borderWidth * .5);
            d = 'V{0}'.format(height[0] + height[1] + height[2] - this._cornerOffset - this._borderWidth * .5);
            d += 'l{0},{1}'.format(-this._cornerOffset, this._cornerOffset);
            d += this._drawBottomLineRtl(width - this._cornerOffset * 2 - this._borderWidth, isEndBrick);
            paths.push(m2 + d); //2nd shadow
            paths[0] += d;

            d = 'l{0},{1}'.format(-this._cornerOffset, -this._cornerOffset);
            d += 'V{0}'.format(this._cornerOffset + this._borderWidth * .5);
            d += 'l{0},{1}'.format(this._cornerOffset, -this._cornerOffset);
            d += this._drawTopLineLtr(width - this._cornerOffset * 2 - this._borderWidth);
            d += 'l{0},{1}'.format(this._cornerOffset, this._cornerOffset);
            paths[0] += d;

            return paths;
        },
        _drawIfThenElseBrick: function (width, height, scaling, showIndents) {
            //TODO: draw brick including intents

        },
        _drawTopLineLtr: function (width) {
            var arm = this._arm,
                ax = (arm.innerWidth - arm.outherWidth) * .5;
            var d = 'h{0}'.format(arm.offset - this._borderWidth * .5);
            d += 'l{0},{1}'.format(ax, arm.height);
            d += 'h{0}'.format(arm.outherWidth + this._borderWidth * 1.5);
            d += 'l{0},{1}'.format(ax, -arm.height);
            d += 'h{0}'.format(width - (arm.offset + arm.innerWidth + this._borderWidth));
            return d;
        },
        _drawEventTopLineLtr: function (width) {
            //TODO:
            var d = 'h{0}'.format(width);
            return d;
        },
        _drawBottomLineRtl: function (width, isEndBrick) {
            if (isEndBrick) {
                return 'h{0}'.format(-width);
            }
            else {
                var arm = this._arm,
                    ax = (arm.innerWidth - arm.outherWidth) * .5;
                var d = 'h{0}'.format(-(width - arm.offset - arm.innerWidth - this._borderWidth * .5));
                d += 'l{0},{1}'.format(-ax, arm.height);
                d += 'h{0}'.format(-(arm.outherWidth + this._borderWidth * .5));
                d += 'l{0},{1}'.format(-ax, -arm.height);
                d += 'h{0}'.format(-arm.offset);
                return d;
            }
        },
    })

    return BrickSvg;
})();
