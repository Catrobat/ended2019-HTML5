/// <reference path="math.js" />
'use strict';

//PocketCode.Physics = PocketCode.Physics || {};


/*
PocketCode.Physics.Shape = (function () {
    function Shape() {
        this.u = new PocketCode.Physics.Mat2();
        this.radius = 0;
    }
    return Shape;
})();

var Shape = (function () {
    function Shape() {
        this.u = new PocketCode.Physics.Mat2();
        this.radius = 0;
    }
    return Shape;
}());
Shape["__class"] = "Shape";
var Shape;
(function (Shape) {
    (function (Type) {
        Type[Type["Circle"] = 0] = "Circle";
        Type[Type["Poly"] = 1] = "Poly";
        Type[Type["Count"] = 2] = "Count";
    })(Shape.Type || (Shape.Type = {}));
    var Type = Shape.Type;
})(Shape || (Shape = {}));
var Circle = (function (_super) {
    __extends(Circle, _super);
    function Circle(r) {
        _super.call(this);
        this.radius = r;
    }
    Circle.prototype.clone = function () {
        return new Circle(this.radius);
    };
    Circle.prototype.initialize = function () {
        this.computeMass(1.0);
    };
    Circle.prototype.computeMass = function (density) {
        this.body.mass = PocketCode.Physics.Math.PI_$LI$() * this.radius * this.radius * density;
        this.body.invMass = (this.body.mass !== 0.0) ? 1.0 / this.body.mass : 0.0;
        this.body.inertia = this.body.mass * this.radius * this.radius;
        this.body.invInertia = (this.body.inertia !== 0.0) ? 1.0 / this.body.inertia : 0.0;
    };
    Circle.prototype.setOrient = function (radians) {
    };
    Circle.prototype.getType = function () {
        return Shape.Type.Circle;
    };
    return Circle;
}(Shape)); */
PocketCode.Physics.Polygon = (function () {
    //Polygon.extends(PocketCode.Physics.Shape);

    function Polygon(hw, hh) {
        this.u = new PocketCode.Physics.Mat2();
        //var _this = this;
        this.vertexCount = 0;
        this.MAX_POLY_VERTEX_COUNT = 64;

        var v2 = PocketCode.Physics.Vec2;
        this.vertices = v2.arrayOf(this.MAX_POLY_VERTEX_COUNT);
        this.normals = v2.arrayOf(this.MAX_POLY_VERTEX_COUNT);

        if (((typeof hw === 'number') || hw === null) && ((typeof hh === 'number') || hh === null)) {
            //var __args = Array.prototype.slice.call(arguments);
            //_super.call(this);
            //this.vertices = m.Vec2.arrayOf(Polygon.MAX_POLY_VERTEX_COUNT);
            //this.normals = m.Vec2.arrayOf(Polygon.MAX_POLY_VERTEX_COUNT);
            //this.vertexCount = 0;
            //(function () {
            //    _this.setBox(hw, hh);
            //})();
            this.setBox(hw, hh);
        }
        else if (((hw != null && hw instanceof Array) || hw === null) && hh === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var verts_1 = __args[0];
            //_super.call(this);
            //this.vertices = m.Vec2.arrayOf(Polygon.MAX_POLY_VERTEX_COUNT);
            //this.normals = m.Vec2.arrayOf(Polygon.MAX_POLY_VERTEX_COUNT);
            //this.vertexCount = 0;
            //(function () {
            //    _this.set.apply(_this, verts_1);
            //})();
            this.set.apply(this, verts_1);
        }
        //else if (hw === undefined && hh === undefined) {
        //    //var __args = Array.prototype.slice.call(arguments);
        //    //_super.call(this);
        //    //this.vertices = m.Vec2.arrayOf(Polygon.MAX_POLY_VERTEX_COUNT);
        //    //this.normals = m.Vec2.arrayOf(Polygon.MAX_POLY_VERTEX_COUNT);
        //    //this.vertexCount = 0;
        //}
        //else
        //    throw new Error('invalid overload');
        else if (hw && !hh || !hw && hh)
            throw new Error('invalid overload');
    }

    //methods
    Polygon.prototype = {
        clone: function () {
            var p = new PocketCode.Physics.Polygon();
            p.u.set(this.u);
            for (var i = 0, l = this.vertexCount; i < l; i++) {
                p.vertices[i].set(this.vertices[i]);
                p.normals[i].set(this.normals[i]);
            }
            p.vertexCount = this.vertexCount;
            return p;
        },
        initialize: function (body) {
            this._body = body;
            this.computeMass(1.0);
        },
        computeMass: function (density) {
            if (!this._body)
                throw new Error('call to uninitialized shape');
            var c = new PocketCode.Physics.Vec2(0.0, 0.0);
            var area = 0.0;
            var I = 0.0;
            var k_inv3 = 1.0 / 3.0;
            for (var i = 0, l = this.vertexCount; i < l; ++i) {
                var p1 = this.vertices[i];
                var p2 = this.vertices[(i + 1) % this.vertexCount];
                var D = Vec2.cross(p1, p2);
                var triangleArea = 0.5 * D;
                area += triangleArea;
                var weight = triangleArea * k_inv3;
                c.addsi(p1, weight);
                c.addsi(p2, weight);
                var intx2 = p1.x * p1.x + p2.x * p1.x + p2.x * p2.x;
                var inty2 = p1.y * p1.y + p2.y * p1.y + p2.y * p2.y;
                I += (0.25 * k_inv3 * D) * (intx2 + inty2);
            }
            c.muli(1.0 / area);
            for (var i = 0, l = this.vertexCount; i < l; ++i) {
                this.vertices[i].subi(c);
            }
            this._body.mass = density * area;
            this._body.invMass = (this._body.mass !== 0.0) ? 1.0 / this._body.mass : 0.0;
            this._body.inertia = I * density;
            this._body.invInertia = (this._body.inertia !== 0.0) ? 1.0 / this._body.inertia : 0.0;
        },
        setOrient: function (radians) {
            this.u.set(radians);
        },
        getType: function () {
            return Shape.Type.Poly;
        },
        setBox: function (hw, hh) {
            this.vertexCount = 4;
            this.vertices[0].set(-hw, -hh);
            this.vertices[1].set(hw, -hh);
            this.vertices[2].set(hw, hh);
            this.vertices[3].set(-hw, hh);
            this.normals[0].set(0.0, -1.0);
            this.normals[1].set(1.0, 0.0);
            this.normals[2].set(0.0, 1.0);
            this.normals[3].set(-1.0, 0.0);
        },
        set: function () {
            var verts = [];
            for (var i = 0, l = arguments.length; i < l; i++) {
                verts[i - 0] = arguments[i];
            }
            var rightMost = 0;
            var highestXCoord = verts[0].x;
            for (var i = 1, l = verts.length; i < l; ++i) {
                var x = verts[i].x;
                if (x > highestXCoord) {
                    highestXCoord = x;
                    rightMost = i;
                }
                else if (x === highestXCoord) {
                    if (verts[i].y < verts[rightMost].y) {
                        rightMost = i;
                    }
                }
            }
            var hull = new Array(Polygon.MAX_POLY_VERTEX_COUNT);
            var outCount = 0;
            var indexHull = rightMost;
            for (; ;) {
                hull[outCount] = indexHull;
                var nextHullIndex = 0;
                for (var i = 1, l = verts.length; i < l; ++i) {
                    if (nextHullIndex === indexHull) {
                        nextHullIndex = i;
                        continue;
                    }
                    var e1 = verts[nextHullIndex].sub(verts[hull[outCount]]);
                    var e2 = verts[i].sub(verts[hull[outCount]]);
                    var c = Vec2.cross(e1, e2);
                    if (c < 0.0) {
                        nextHullIndex = i;
                    }
                    if (c === 0.0 && e2.lengthSq() > e1.lengthSq()) {
                        nextHullIndex = i;
                    }
                }
                ++outCount;
                indexHull = nextHullIndex;
                if (nextHullIndex === rightMost) {
                    this.vertexCount = outCount;
                    break;
                }
            }
            for (var i = 0, l = this.vertexCount; i < l; ++i) {
                this.vertices[i].set(verts[hull[i]]);
            }
            for (var i = 0, l = this.vertexCount; i < l; ++i) {
                var face = this.vertices[(i + 1) % this.vertexCount].sub(this.vertices[i]);
                this.normals[i].set(face.y, -face.x);
                this.normals[i].normalize();
            }
        },
        getSupport: function (dir) {
            var bestProjection = -javaemul.internal.FloatHelper.MAX_VALUE;
            var bestVertex = null;
            for (var i = 0, l = this.vertexCount; i < l; ++i) {
                var v = this.vertices[i];
                var projection = Vec2.dot(v, dir);
                if (projection > bestProjection) {
                    bestVertex = v;
                    bestProjection = projection;
                }
            }
            return bestVertex;
        },
    };

    return Polygon;
})();

