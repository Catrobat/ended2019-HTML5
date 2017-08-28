/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Model.Look = (function () {
    Look.extends(SmartJs.Core.Component);

    function Look(jsonLook) {
        this._id = jsonLook.id;
        this._imageId = jsonLook.resourceId;
        this._name = jsonLook.name;

        if (jsonLook.rotationCenterX)   //required to initialize as undefined (even if the values are "null")
            this._rotationCenterX = jsonLook.rotationCenterX;
        if (jsonLook.rotationCenterY)
            this._rotationCenterY = jsonLook.rotationCenterY;

        //center defined to reduce test efford: testing interfaces without loading explicit images
        this._center = {
            length: 0.0,
            angle: 0.0,
        };
        this._cache = {};
    }

    //properties
    Object.defineProperties(Look.prototype, {
        id: {
            get: function () {
                return this._id;
            },
        },
        imageId: {
            get: function () {
                return this._imageId;
            },
        },
        name: {
            get: function () {
                return this._name;
            },
        },
        canvas: {
            get: function () {
                return this._canvas;
            },
        },
        center: {
            get: function () {
                return this._center;
            },
        },
        tl: {
            get: function () {
                return this._tl;
            },
        },
        tr: {
            get: function () {
                return this._tr;
            },
        },
        bl: {
            get: function () {
                return this._bl;
            },
        },
        br: {
            get: function () {
                return this._br;
            },
        },
    });

    Look.prototype.merge({
        init: function (img) {
            this._canvas = img.canvas;
            var center = img.center;
            this._center = center;
            this._tl = img.tl;
            this._tr = img.tr;
            this._bl = img.bl;
            this._br = img.br;

            if (this._rotationCenterX && this._rotationCenterY) {
                //pointing from the center (original center if clipped) to the upper left corner
                if (typeof this._rotationCenterX !== 'number' || typeof this._rotationCenterY !== 'number')
                    throw new Error('rotationCenterX & rotationCenterY have to be numeric');

                //adjust center vector
                var centerOffsetX = img.originalWidth * 0.5 - this._rotationCenterX,
                    centerOffsetY = -img.originalHeight * 0.5 - this._rotationCenterY;
                centerOffsetX += center.length * Math.cos(center.angle);// - centerOffsetX,
                centerOffsetY += center.length * Math.sin(center.angle);// + centerOffsetY;

                this._center = {
                    length: Math.sqrt(Math.pow(centerOffsetX, 2) + Math.pow(centerOffsetY, 2)),
                    angle: Math.atan2(centerOffsetY, centerOffsetX)
                };

                //adjust corner vectors
                var mx = this._canvas.width * 0.5,    //new rotation center
                    my = this._canvas.height * 0.5,
                    x = centerOffsetX - mx,
                    y = centerOffsetY + my;
                this._tl = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                x = centerOffsetX + mx;
                this._tr = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                y = centerOffsetY - my;
                this._br = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
                x = centerOffsetX - mx;
                this._bl = { length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), angle: Math.atan2(y, x) };
            }
        },
        getBoundary: function (scaling, rotation, flipX, pixelAccuracy) {
            /* returns the looks offsets based on the looks rotation center = image center
            *
            *  sprite is needed for caching index, accuracy (boolean) indicates, if you need pixel-exact proportions (which should not be used for the first check)
            *  the return value looks like: { top: , right: , bottom: , left: , pixelAccuracy: }
            *  offsets: these properties include the distances between the sprite center and the bounding box edges (from center x/y).. these can be negative as well
            *  pixelAccuracy: might be true even if not requested -> if we already have exact values stored in the cache (to increase performance)
            */
            var cache = this._cache;
            pixelAccuracy = pixelAccuracy || false;

            if (cache.scaling !== scaling || cache.rotation !== rotation || (pixelAccuracy && !cache.pixelAccuracy)) {
                this._calcAndCacheBoundary(scaling, rotation, pixelAccuracy);
                cache = this._cache;
            }

            //cache clone to avoid side effects on manipulations
            var retB = {
                top: cache.top,
                right: cache.right,
                bottom: cache.bottom,
                left: cache.left,
                pixelAccuracy: cache.pixelAccuracy,
            };

            if (flipX) {
                var tmp = retB.left
                retB.left = -retB.right;
                retB.right = -tmp;
                return retB;
            }
            return retB;
        },
        _calcAndCacheBoundary: function (scaling, rotation, pixelAccuracy) {
            scaling = scaling || 1.0;
            var rotationRad = rotation ? rotation * Math.PI / 180.0 : 0.0;
            var boundary = this._cache;

            if (boundary.scaling !== scaling || boundary.rotation !== rotation) {
                var calc = {},
                length = this.tl.length * scaling,
                angle = this.tl.angle - rotationRad;    //notice: we have different rotation directions here: polar: counterclockwise, rendering: clockwise
                calc.tl = { x: Math.round(length * Math.cos(angle) * 100.0) / 100.0, y: Math.round(length * Math.sin(angle) * 100.0) / 100.0 };

                length = this.tr.length * scaling;
                angle = this.tr.angle - rotationRad;
                calc.tr = { x: Math.round(length * Math.cos(angle) * 100.0) / 100.0, y: Math.round(length * Math.sin(angle) * 100.0) / 100.0 };

                length = this.bl.length * scaling;
                angle = this.bl.angle - rotationRad;
                calc.bl = { x: Math.round(length * Math.cos(angle) * 100.0) / 100.0, y: Math.round(length * Math.sin(angle) * 100.0) / 100.0 };

                length = this.br.length * scaling;
                angle = this.br.angle - rotationRad;
                calc.br = { x: Math.round(length * Math.cos(angle) * 100.0) / 100.0, y: Math.round(length * Math.sin(angle) * 100.0) / 100.0 };

                //var boundary;
                if (rotationRad != 0.0)
                    boundary = {   //due to rotation every corner can become a max/min value
                        top: Math.ceil(Math.max(calc.tl.y, calc.tr.y, calc.bl.y, calc.br.y)),
                        right: Math.ceil(Math.max(calc.tl.x, calc.tr.x, calc.bl.x, calc.br.x)),
                        bottom: Math.floor(Math.min(calc.tl.y, calc.tr.y, calc.bl.y, calc.br.y)),
                        left: Math.floor(Math.min(calc.tl.x, calc.tr.x, calc.bl.x, calc.br.x)),
                        pixelAccuracy: rotation % 90 == 0 ? true : false,
                    };
                else {
                    boundary = {
                        top: Math.ceil(calc.tr.y),
                        right: Math.ceil(calc.tr.x),
                        bottom: Math.floor(calc.bl.y),
                        left: Math.floor(calc.bl.x),
                        pixelAccuracy: true,
                    };
                }
            }

            if (pixelAccuracy && !boundary.pixelAccuracy) {
                //calc pixel-exact offsets & include them 
                var precision = 2.0 / scaling; //means 2 pixel accuracy used for calculation
                if (SmartJs.Device.isMobile)
                    precision *= 2.0;
                var trimOffsets = PocketCode.ImageHelper.getElementTrimOffsets(this.canvas, rotation, precision);
                boundary.top -= Math.floor(trimOffsets.top * scaling);
                boundary.right -= Math.floor(trimOffsets.right * scaling);
                boundary.bottom += Math.ceil(trimOffsets.bottom * scaling);
                boundary.left += Math.ceil(trimOffsets.left * scaling);
                boundary.pixelAccuracy = true;
            }

            boundary.scaling = scaling;
            boundary.rotation = rotation;
            this._cache = boundary;
            return boundary;
        },

        getPathData: function (_matrix, _precision) {
            var segments = this._segments, length = segments.length, f = new Formatter(_precision), coords = new Array(6), first = true, curX, curY, prevX, prevY, inX, inY, outX, outY, parts = [];

            function addSegment(segment, skipLine) {
                segment._transformCoordinates(_matrix, coords);
                curX = coords[0];
                curY = coords[1];
                if (first) {
                    parts.push('M' + f.pair(curX, curY));
                    first = false;
                } else {
                    inX = coords[2];
                    inY = coords[3];
                    if (inX === curX && inY === curY && outX === prevX && outY === prevY) {
                        if (!skipLine) {
                            var dx = curX - prevX
                              , dy = curY - prevY;
                            parts.push(dx === 0 ? 'v' + f.number(dy) : dy === 0 ? 'h' + f.number(dx) : 'l' + f.pair(dx, dy));
                        }
                    } else {
                        parts.push('c' + f.pair(outX - prevX, outY - prevY) + ' ' + f.pair(inX - prevX, inY - prevY) + ' ' + f.pair(curX - prevX, curY - prevY));
                    }
                }
                prevX = curX;
                prevY = curY;
                outX = coords[4];
                outY = coords[5];
            }

            if (!length)
                return '';

            for (var i = 0; i < length; i++)
                addSegment(segments[i]);
            if (this._closed && length > 0) {
                addSegment(segments[0], true);
                parts.push('z');
            }
            return parts.join('');
        },

        isEmpty: function () {
            return !this._segments.length;
        },

        _transformContent: function (matrix) {
            var segments = this._segments
              , coords = new Array(6);
            for (var i = 0, l = segments.length; i < l; i++)
                segments[i]._transformCoordinates(matrix, coords, true);
            return true;
        },

        _add: function (segs, index) {
            var segments = this._segments
              , curves = this._curves
              , amount = segs.length
              , append = index == null
              , index = append ? segments.length : index;
            for (var i = 0; i < amount; i++) {
                var segment = segs[i];
                if (segment._path)
                    segment = segs[i] = segment.clone();
                segment._path = this;
                segment._index = index + i;
                if (segment._selection)
                    this._updateSelection(segment, 0, segment._selection);
            }
            if (append) {
                segments.push.apply(segments, segs);
            } else {
                segments.splice.apply(segments, [index, 0].concat(segs));
                for (var i = index + amount, l = segments.length; i < l; i++)
                    segments[i]._index = i;
            }
            if (curves) {
                var total = this._countCurves()
                  , start = index > 0 && index + amount - 1 === total ? index - 1 : index
                  , insert = start
                  , end = Math.min(start + amount, total);
                if (segs._curves) {
                    curves.splice.apply(curves, [start, 0].concat(segs._curves));
                    insert += segs._curves.length;
                }
                for (var i = insert; i < end; i++)
                    curves.splice(i, 0, new Curve(this, null, null));
                this._adjustCurves(start, end);
            }
            this._changed(25);
            return segs;
        },

        _adjustCurves: function (start, end) {
            var segments = this._segments, curves = this._curves, curve;
            for (var i = start; i < end; i++) {
                curve = curves[i];
                curve._path = this;
                curve._segment1 = segments[i];
                curve._segment2 = segments[i + 1] || segments[0];
                curve._changed();
            }
            if (curve = curves[this._closed && !start ? segments.length - 1 : start - 1]) {
                curve._segment2 = segments[start] || segments[0];
                curve._changed();
            }
            if (curve = curves[end]) {
                curve._segment1 = segments[end];
                curve._changed();
            }
        },

        _countCurves: function () {
            var length = this._segments.length;
            return !this._closed && length > 0 ? length - 1 : length;
        },

        add: function (segment1) {
            return arguments.length > 1 && typeof segment1 !== 'number' ? this._add(Segment.readList(arguments)) : this._add([Segment.read(arguments)])[0];
        },

        insert: function (index, segment1) {
            return arguments.length > 2 && typeof segment1 !== 'number' ? this._add(Segment.readList(arguments, 1), index) : this._add([Segment.read(arguments, 1)], index)[0];
        },

        addSegment: function () {
            return this._add([Segment.read(arguments)])[0];
        },

        insertSegment: function (index) {
            return this._add([Segment.read(arguments, 1)], index)[0];
        },

        addSegments: function (segments) {
            return this._add(Segment.readList(segments));
        },

        insertSegments: function (index, segments) {
            return this._add(Segment.readList(segments), index);
        },

        removeSegment: function (index) {
            return this.removeSegments(index, index + 1)[0] || null;
        },

        removeSegments: function (start, end, _includeCurves) {
            start = start || 0;
            end = Base.pick(end, this._segments.length);
            var segments = this._segments
              , curves = this._curves
              , count = segments.length
              , removed = segments.splice(start, end - start)
              , amount = removed.length;
            if (!amount)
                return removed;
            for (var i = 0; i < amount; i++) {
                var segment = removed[i];
                if (segment._selection)
                    this._updateSelection(segment, segment._selection, 0);
                segment._index = segment._path = null;
            }
            for (var i = start, l = segments.length; i < l; i++)
                segments[i]._index = i;
            if (curves) {
                var index = start > 0 && end === count + (this._closed ? 1 : 0) ? start - 1 : start
                  , curves = curves.splice(index, amount);
                for (var i = curves.length - 1; i >= 0; i--)
                    curves[i]._path = null;
                if (_includeCurves)
                    removed._curves = curves.slice(1);
                this._adjustCurves(index, index);
            }
            this._changed(25);
            return removed;
        },

        clear: '#removeSegments',

        hasHandles: function () {
            var segments = this._segments;
            for (var i = 0, l = segments.length; i < l; i++) {
                if (segments[i].hasHandles())
                    return true;
            }
            return false;
        },

        clearHandles: function () {
            var segments = this._segments;
            for (var i = 0, l = segments.length; i < l; i++)
                segments[i].clearHandles();
        },

        getLength: function () {
            if (this._length == null) {
                var curves = this.getCurves()
                  , length = 0;
                for (var i = 0, l = curves.length; i < l; i++)
                    length += curves[i].getLength();
                this._length = length;
            }
            return this._length;
        },

        getArea: function () {
            var area = this._area;
            if (area == null) {
                var segments = this._segments
                  , closed = this._closed;
                area = 0;
                for (var i = 0, l = segments.length; i < l; i++) {
                    var last = i + 1 === l;
                    area += Curve.getArea(Curve.getValues(segments[i], segments[last ? 0 : i + 1], null, last && !closed));
                }
                this._area = area;
            }
            return area;
        },

        isFullySelected: function () {
            var length = this._segments.length;
            return this.isSelected() && length > 0 && this._segmentSelection === length * 7;
        },

        setFullySelected: function (selected) {
            if (selected)
                this._selectSegments(true);
            this.setSelected(selected);
        },

        setSelection: function setSelection(selection) {
            if (!(selection & 1))
                this._selectSegments(false);
            setSelection.base.call(this, selection);
        },

        _selectSegments: function (selected) {
            var segments = this._segments
              , length = segments.length
              , selection = selected ? 7 : 0;
            this._segmentSelection = selection * length;
            for (var i = 0; i < length; i++)
                segments[i]._selection = selection;
        },

        _updateSelection: function (segment, oldSelection, newSelection) {
            segment._selection = newSelection;
            var selection = this._segmentSelection += newSelection - oldSelection;
            if (selection > 0)
                this.setSelected(true);
        },

        divideAt: function (location) {
            var loc = this.getLocationAt(location), curve;
            return loc && (curve = loc.getCurve().divideAt(loc.getCurveOffset())) ? curve._segment1 : null;
        },

        splitAt: function (location) {
            var loc = this.getLocationAt(location)
              , index = loc && loc.index
              , time = loc && loc.time
              , tMin = 1e-8
              , tMax = 1 - tMin;
            if (time > tMax) {
                index++;
                time = 0;
            }
            var curves = this.getCurves();
            if (index >= 0 && index < curves.length) {
                if (time >= tMin) {
                    curves[index++].divideAtTime(time);
                }
                var segs = this.removeSegments(index, this._segments.length, true), path;
                if (this._closed) {
                    this.setClosed(false);
                    path = this;
                } else {
                    path = new Path(Item.NO_INSERT);
                    path.insertAbove(this);
                    path.copyAttributes(this);
                }
                path._add(segs, 0);
                this.addSegment(segs[0]);
                return path;
            }
            return null;
        },

        split: function (index, time) {
            var curve, location = time === undefined ? index : (curve = this.getCurves()[index]) && curve.getLocationAtTime(time);
            return location != null ? this.splitAt(location) : null;
        },

        join: function (path, tolerance) {
            var epsilon = tolerance || 0;
            if (path && path !== this) {
                var segments = path._segments
                  , last1 = this.getLastSegment()
                  , last2 = path.getLastSegment();
                if (!last2)
                    return this;
                if (last1 && last1._point.isClose(last2._point, epsilon))
                    path.reverse();
                var first2 = path.getFirstSegment();
                if (last1 && last1._point.isClose(first2._point, epsilon)) {
                    last1.setHandleOut(first2._handleOut);
                    this._add(segments.slice(1));
                } else {
                    var first1 = this.getFirstSegment();
                    if (first1 && first1._point.isClose(first2._point, epsilon))
                        path.reverse();
                    last2 = path.getLastSegment();
                    if (first1 && first1._point.isClose(last2._point, epsilon)) {
                        first1.setHandleIn(last2._handleIn);
                        this._add(segments.slice(0, segments.length - 1), 0);
                    } else {
                        this._add(segments.slice());
                    }
                }
                if (path._closed)
                    this._add([segments[0]]);
                path.remove();
            }
            var first = this.getFirstSegment()
              , last = this.getLastSegment();
            if (first !== last && first._point.isClose(last._point, epsilon)) {
                first.setHandleIn(last._handleIn);
                last.remove();
                this.setClosed(true);
            }
            return this;
        },

        reduce: function (options) {
            var curves = this.getCurves()
              , simplify = options && options.simplify
              , tolerance = simplify ? 1e-7 : 0;
            for (var i = curves.length - 1; i >= 0; i--) {
                var curve = curves[i];
                if (!curve.hasHandles() && (!curve.hasLength(tolerance) || simplify && curve.isCollinear(curve.getNext())))
                    curve.remove();
            }
            return this;
        },

        reverse: function () {
            this._segments.reverse();
            for (var i = 0, l = this._segments.length; i < l; i++) {
                var segment = this._segments[i];
                var handleIn = segment._handleIn;
                segment._handleIn = segment._handleOut;
                segment._handleOut = handleIn;
                segment._index = i;
            }
            this._curves = null;
            this._changed(9);
        },

        flatten: function (flatness) {
            var flattener = new PathFlattener(this, flatness || 0.25, 256, true)
              , parts = flattener.parts
              , length = parts.length
              , segments = [];
            for (var i = 0; i < length; i++) {
                segments.push(new Segment(parts[i].curve.slice(0, 2)));
            }
            if (!this._closed && length > 0) {
                segments.push(new Segment(parts[length - 1].curve.slice(6)));
            }
            this.setSegments(segments);
        },

        simplify: function (tolerance) {
            var segments = new PathFitter(this).fit(tolerance || 2.5);
            if (segments)
                this.setSegments(segments);
            return !!segments;
        },

        smooth: function (options) {
            var that = this
              , opts = options || {}
              , type = opts.type || 'asymmetric'
              , segments = this._segments
              , length = segments.length
              , closed = this._closed;

            function getIndex(value, _default) {
                var index = value && value.index;
                if (index != null) {
                    var path = value.path;
                    if (path && path !== that)
                        throw new Error(value._class + ' ' + index + ' of ' + path + ' is not part of ' + that);
                    if (_default && value instanceof Curve)
                        index++;
                } else {
                    index = typeof value === 'number' ? value : _default;
                }
                return Math.min(index < 0 && closed ? index % length : index < 0 ? index + length : index, length - 1);
            }

            var loop = closed && opts.from === undefined && opts.to === undefined
              , from = getIndex(opts.from, 0)
              , to = getIndex(opts.to, length - 1);

            if (from > to) {
                if (closed) {
                    from -= length;
                } else {
                    var tmp = from;
                    from = to;
                    to = tmp;
                }
            }
            if (/^(?:asymmetric|continuous)$/.test(type)) {
                var asymmetric = type === 'asymmetric'
                  , min = Math.min
                  , amount = to - from + 1
                  , n = amount - 1
                  , padding = loop ? min(amount, 4) : 1
                  , paddingLeft = padding
                  , paddingRight = padding
                  , knots = [];
                if (!closed) {
                    paddingLeft = min(1, from);
                    paddingRight = min(1, length - to - 1);
                }
                n += paddingLeft + paddingRight;
                if (n <= 1)
                    return;
                for (var i = 0, j = from - paddingLeft; i <= n; i++,
                j++) {
                    knots[i] = segments[(j < 0 ? j + length : j) % length]._point;
                }

                var x = knots[0]._x + 2 * knots[1]._x
                  , y = knots[0]._y + 2 * knots[1]._y
                  , f = 2
                  , n_1 = n - 1
                  , rx = [x]
                  , ry = [y]
                  , rf = [f]
                  , px = []
                  , py = [];
                for (var i = 1; i < n; i++) {
                    var internal = i < n_1
                      , a = internal ? 1 : asymmetric ? 1 : 2
                      , b = internal ? 4 : asymmetric ? 2 : 7
                      , u = internal ? 4 : asymmetric ? 3 : 8
                      , v = internal ? 2 : asymmetric ? 0 : 1
                      , m = a / f;
                    f = rf[i] = b - m;
                    x = rx[i] = u * knots[i]._x + v * knots[i + 1]._x - m * x;
                    y = ry[i] = u * knots[i]._y + v * knots[i + 1]._y - m * y;
                }

                px[n_1] = rx[n_1] / rf[n_1];
                py[n_1] = ry[n_1] / rf[n_1];
                for (var i = n - 2; i >= 0; i--) {
                    px[i] = (rx[i] - px[i + 1]) / rf[i];
                    py[i] = (ry[i] - py[i + 1]) / rf[i];
                }
                px[n] = (3 * knots[n]._x - px[n_1]) / 2;
                py[n] = (3 * knots[n]._y - py[n_1]) / 2;

                for (var i = paddingLeft, max = n - paddingRight, j = from; i <= max; i++,
                j++) {
                    var segment = segments[j < 0 ? j + length : j]
                      , pt = segment._point
                      , hx = px[i] - pt._x
                      , hy = py[i] - pt._y;
                    if (loop || i < max)
                        segment.setHandleOut(hx, hy);
                    if (loop || i > paddingLeft)
                        segment.setHandleIn(-hx, -hy);
                }
            } else {
                for (var i = from; i <= to; i++) {
                    segments[i < 0 ? i + length : i].smooth(opts, !loop && i === from, !loop && i === to);
                }
            }
        },

        toShape: function (insert) {
            if (!this._closed)
                return null;

            var segments = this._segments, type, size, radius, topCenter;

            function isCollinear(i, j) {
                var seg1 = segments[i]
                  , seg2 = seg1.getNext()
                  , seg3 = segments[j]
                  , seg4 = seg3.getNext();
                return seg1._handleOut.isZero() && seg2._handleIn.isZero() && seg3._handleOut.isZero() && seg4._handleIn.isZero() && seg2._point.subtract(seg1._point).isCollinear(seg4._point.subtract(seg3._point));
            }

            function isOrthogonal(i) {
                var seg2 = segments[i]
                  , seg1 = seg2.getPrevious()
                  , seg3 = seg2.getNext();
                return seg1._handleOut.isZero() && seg2._handleIn.isZero() && seg2._handleOut.isZero() && seg3._handleIn.isZero() && seg2._point.subtract(seg1._point).isOrthogonal(seg3._point.subtract(seg2._point));
            }

            function isArc(i) {
                var seg1 = segments[i]
                  , seg2 = seg1.getNext()
                  , handle1 = seg1._handleOut
                  , handle2 = seg2._handleIn
                  , kappa = 0.5522847498307936;
                if (handle1.isOrthogonal(handle2)) {
                    var pt1 = seg1._point
                      , pt2 = seg2._point
                      , corner = new Line(pt1, handle1, true).intersect(new Line(pt2, handle2, true), true);
                    return corner && Numerical.isZero(handle1.getLength() / corner.subtract(pt1).getLength() - kappa) && Numerical.isZero(handle2.getLength() / corner.subtract(pt2).getLength() - kappa);
                }
                return false;
            }

            function getDistance(i, j) {
                return segments[i]._point.getDistance(segments[j]._point);
            }

            if (!this.hasHandles() && segments.length === 4 && isCollinear(0, 2) && isCollinear(1, 3) && isOrthogonal(1)) {
                type = Shape.Rectangle;
                size = new Size(getDistance(0, 3), getDistance(0, 1));
                topCenter = segments[1]._point.add(segments[2]._point).divide(2);
            } else if (segments.length === 8 && isArc(0) && isArc(2) && isArc(4) && isArc(6) && isCollinear(1, 5) && isCollinear(3, 7)) {
                type = Shape.Rectangle;
                size = new Size(getDistance(1, 6), getDistance(0, 3));
                radius = size.subtract(new Size(getDistance(0, 7), getDistance(1, 2))).divide(2);
                topCenter = segments[3]._point.add(segments[4]._point).divide(2);
            } else if (segments.length === 4 && isArc(0) && isArc(1) && isArc(2) && isArc(3)) {
                if (Numerical.isZero(getDistance(0, 2) - getDistance(1, 3))) {
                    type = Shape.Circle;
                    radius = getDistance(0, 2) / 2;
                } else {
                    type = Shape.Ellipse;
                    radius = new Size(getDistance(2, 0) / 2, getDistance(3, 1) / 2);
                }
                topCenter = segments[1]._point;
            }

            if (type) {
                var center = this.getPosition(true)
                  , shape = new type({
                      center: center,
                      size: size,
                      radius: radius,
                      insert: false
                  });
                shape.copyAttributes(this, true);
                shape._matrix.prepend(this._matrix);
                shape.rotate(topCenter.subtract(center).getAngle() + 90);
                if (insert === undefined || insert)
                    shape.insertAbove(this);
                return shape;
            }
            return null;
        },

    });

    return Look;
})();

