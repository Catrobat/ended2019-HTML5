'use strict';

PocketCode.Physics = PocketCode.Physics || {};


PocketCode.Physics.Math = (function () {
    function PhysicsMath() {
        this.EPSILON = 1.0E-4;
        this.BIAS_RELATIVE = 0.95;
        this.BIAS_ABSOLUTE = 0.01;
        this.PENETRATION_ALLOWANCE = 0.05;
        this.PENETRATION_CORRETION = 0.4;
    }

    //methods
    PhysicsMath.prototype = {
        //PI_$LI$: function () {
        //    if (this.PI == null)
        //        this.PI = Math.PI;
        //    return this.PI;
        //},
        EPSILON_SQ_$LI$: function () {
            if (this.EPSILON_SQ == null)
                this.EPSILON_SQ = this.EPSILON * this.EPSILON;
            return this.EPSILON_SQ;
        },
        DT_$LI$: function () {
            if (this.DT == null)
                this.DT = 1.0 / 60.0;
            return this.DT;
        },
        GRAVITY_$LI$: function () {
            if (this.GRAVITY == null)
                this.GRAVITY = new PocketCode.Physics.Vec2(0.0, 50.0);
            return this.GRAVITY;
        },
        RESTING_$LI$: function () {
            if (this.RESTING == null)
                this.RESTING = this.GRAVITY_$LI$().mul(this.DT_$LI$()).lengthSq() + this.EPSILON;
            return this.RESTING;
        },
        equal: function (a, b) {
            return Math.abs(a - b) <= this.EPSILON;
        },
        clamp: function (min, max, a) {
            return (a < min ? min : (a > max ? max : a));
        },
        round: function (a) {
            return ((a + 0.5) | 0);
        },
        _random$float$float: function (min, max) {
            return ((max - min) * Math.random() + min);
        },
        random: function (min, max) {
            if (((typeof min === 'number') || min === null) && ((typeof max === 'number') || max === null)) {
                //var __args = Array.prototype.slice.call(arguments);
                //return (function () {
                    return (((max - min + 1) * Math.random() + min) | 0);
                //})();
            }
            else if (((typeof min === 'number') || min === null) && ((typeof max === 'number') || max === null)) {
                return this._random$float$float(min, max);
            }
            else
                throw new Error('invalid overload');
        },
        gt: function (a, b) {
            return a >= b * this.BIAS_RELATIVE + a * this.BIAS_ABSOLUTE;
        },
        dispose: function () {
            //static class: cannot be disposed
        },
    };

    return PhysicsMath;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.Physics.Math = new PocketCode.Physics.Math();


PocketCode.Physics.merge({

    Vec2: (function () {
        function Vec2(x, y) {
            this.x = 0;
            this.y = 0;

            //var _this = this;
            if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null)) {
                //var __args = Array.prototype.slice.call(arguments);
                //this.x = 0;
                //this.y = 0;
                //(function () {
                //    _this.set(x, y);
                //})();
                this.set(x, y);
            }
            else if (((x != null && x instanceof Vec2) || x === null) && y === undefined) {
                var __args = Array.prototype.slice.call(arguments);
                var v_1 = __args[0];
                //this.x = 0;
                //this.y = 0;
                //(function () {
                //    _this.set(v_1);
                //})();
                this.set(v_1);
            }
            //else if (x === undefined && y === undefined) {
            //    //var __args = Array.prototype.slice.call(arguments);
            //    this.x = 0;
            //    this.y = 0;
            //}
            //else
            //    throw new Error('invalid overload');
            else if (x && !y || !x && y)
                throw new Error('invalid overload');
        }

        //methods
        Vec2.prototype = {
            set: function (x, y) {
                //var _this = this;
                if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    _this.x = x;
                    //    _this.y = y;
                    //})();
                    this.x = x;
                    this.y = y;
                    //?return;
                }
                else if (((x != null && x instanceof Vec2) || x === null) && y === undefined) {
                    return this.set$Vec2(x);
                }
                else
                    throw new Error('invalid overload');
            },
            set$Vec2: function (v) {
                this.x = v.x;
                this.y = v.y;
                return this;
            },
            /**
             * Negates this vector and returns this.
             */
            negi: function () {
                return this.neg(this);
            },
            /**
             * Sets out to the negation of this vector and returns out.
             */
            neg: function (out) {
                //var _this = this;
                if (((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = -_this.x;
                    //    out.y = -_this.y;
                    //    return out;
                    //})();
                    out.x = -this.x;
                    out.y = -this.y;
                    return out;
                }
                else if (out === undefined) {
                    return this.neg$();
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the negation to this vector.
             */
            neg$: function () {
                return this.neg(new PocketCode.Physics.Vec2());
            },
            /**
             * Multiplies this vector by s and returns this.
             */
            muli$float: function (s) {
                return this.mul(s, this);
            },
            /**
             * Sets out to this vector multiplied by s and returns out.
             */
            mul$float$Vec2: function (s, out) {
                out.x = s * this.x;
                out.y = s * this.y;
                return out;
            },
            /**
             * Returns a new vector that is a multiplication of this vector and s.
             */
            mul$float: function (s) {
                return this.mul(s, new PocketCode.Physics.Vec2());
            },
            /**
             * Divides this vector by s and returns this.
             */
            divi$float: function (s) {
                return this.div(s, this);
            },
            /**
             * Sets out to the division of this vector and s and returns out.
             */
            div$float$Vec2: function (s, out) {
                out.x = this.x / s;
                out.y = this.y / s;
                return out;
            },
            /**
             * Returns a new vector that is a division between this vector and s.
             */
            div$float: function (s) {
                return this.div(s, new PocketCode.Physics.Vec2());
            },
            /**
             * Adds s to this vector and returns this.
             */
            addi$float: function (s) {
                return this.add(s, this);
            },
            /**
             * Sets out to the sum of this vector and s and returns out.
             */
            add$float$Vec2: function (s, out) {
                out.x = this.x + s;
                out.y = this.y + s;
                return out;
            },
            /**
             * Returns a new vector that is the sum between this vector and s.
             */
            add$float: function (s) {
                return this.add(s, new PocketCode.Physics.Vec2());
            },
            /**
             * Multiplies this vector by v and returns this.
             */
            muli: function (v) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    return _this.mul(v, _this);
                    //})();
                    return this.mul(v, this);
                }
                else if (((typeof v === 'number') || v === null)) {
                    return this.muli$float(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets out to the product of this vector and v and returns out.
             */
            mul: function (v, out) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.x * v.x;
                    //    out.y = _this.y * v.y;
                    //    return out;
                    //})();
                    out.x = _this.x * v.x;
                    out.y = _this.y * v.y;
                    return out;
                }
                else if (((typeof v === 'number') || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    return this.mul$float$Vec2(v, out);
                }
                else if (((v != null && v instanceof Vec2) || v === null) && out === undefined) {
                    return this.mul$Vec2(v);
                }
                else if (((typeof v === 'number') || v === null) && out === undefined) {
                    return this.mul$float(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the product of this vector and v.
             */
            mul$Vec2: function (v) {
                return this.mul(v, new PocketCode.Physics.Vec2());
            },
            /**
             * Divides this vector by v and returns this.
             */
            divi: function (v) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    return _this.div(v, _this);
                    //})();
                    return this.div(v, this);
                }
                else if (((typeof v === 'number') || v === null)) {
                    return this.divi$float(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets out to the division of this vector and v and returns out.
             */
            div: function (v, out) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.x / v.x;
                    //    out.y = _this.y / v.y;
                    //    return out;
                    //})();
                    out.x = this.x / v.x;
                    out.y = this.y / v.y;
                    return out;
                }
                else if (((typeof v === 'number') || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    return this.div$float$Vec2(v, out);
                }
                else if (((v != null && v instanceof Vec2) || v === null) && out === undefined) {
                    return this.div$Vec2(v);
                }
                else if (((typeof v === 'number') || v === null) && out === undefined) {
                    return this.div$float(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the division of this vector by v.
             */
            div$Vec2: function (v) {
                return this.div(v, new PocketCode.Physics.Vec2());
            },
            /**
             * Adds v to this vector and returns this.
             */
            addi: function (v) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    return _this.add(v, _this);
                    //})();
                    return this.add(v, this);
                }
                else if (((typeof v === 'number') || v === null)) {
                    return this.addi$float(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets out to the addition of this vector and v and returns out.
             */
            add: function (v, out) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.x + v.x;
                    //    out.y = _this.y + v.y;
                    //    return out;
                    //})();
                    out.x = this.x + v.x;
                    out.y = this.y + v.y;
                    return out;
                }
                else if (((typeof v === 'number') || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    return this.add$float$Vec2(v, out);
                }
                else if (((v != null && v instanceof Vec2) || v === null) && out === undefined) {
                    return this.add$Vec2(v);
                }
                else if (((typeof v === 'number') || v === null) && out === undefined) {
                    return this.add$float(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the addition of this vector and v.
             */
            add$Vec2: function (v) {
                return this.add(v, new PocketCode.Physics.Vec2());
            },
            /**
             * Adds v * s to this vector and returns this.
             */
            addsi: function (v, s) {
                return this.adds(v, s, this);
            },
            /**
             * Sets out to the addition of this vector and v * s and returns out.
             */
            adds: function (v, s, out) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null) && ((typeof s === 'number') || s === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.x + v.x * s;
                    //    out.y = _this.y + v.y * s;
                    //    return out;
                    //})();
                    out.x = this.x + v.x * s;
                    out.y = this.y + v.y * s;
                    return out;
                }
                else if (((v != null && v instanceof Vec2) || v === null) && ((typeof s === 'number') || s === null) && out === undefined) {
                    return this.adds$Vec2$float(v, s);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the addition of this vector and v * s.
             */
            adds$Vec2$float: function (v, s) {
                return this.adds(v, s, new PocketCode.Physics.Vec2());
            },
            /**
             * Subtracts v from this vector and returns this.
             */
            subi: function (v) {
                return this.sub(v, this);
            },
            /**
             * Sets out to the subtraction of v from this vector and returns out.
             */
            sub: function (v, out) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.x - v.x;
                    //    out.y = _this.y - v.y;
                    //    return out;
                    //})();
                    out.x = this.x - v.x;
                    out.y = this.y - v.y;
                    return out;
                }
                else if (((v != null && v instanceof Vec2) || v === null) && out === undefined) {
                    return this.sub$Vec2(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the subtraction of v from this vector.
             */
            sub$Vec2: function (v) {
                return this.sub(v, new PocketCode.Physics.Vec2());
            },
            /**
             * Returns the squared length of this vector.
             */
            lengthSq: function () {
                return this.x * this.x + this.y * this.y;
            },
            /**
             * Returns the length of this vector.
             */
            length: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },
            /**
             * Rotates this vector by the given radians.
             */
            rotate: function (radians) {
                var c = Math.cos(radians);
                var s = Math.sin(radians);
                var xp = this.x * c - this.y * s;
                var yp = this.x * s + this.y * c;
                this.x = xp;
                this.y = yp;
            },
            /**
             * Normalizes this vector, making it a unit vector. A unit vector has a length of 1.0.
             */
            normalize: function () {
                var lenSq = this.lengthSq();
                if (lenSq > PocketCode.Physics.Math.EPSILON_SQ_$LI$()) {
                    var invLen = 1.0 / Math.sqrt(lenSq);
                    this.x *= invLen;
                    this.y *= invLen;
                }
            },
            /**
             * Sets this vector to the minimum between a and b.
             */
            mini: function (a, b) {
                return Vec2.min(a, b, this);
            },
            /**
             * Sets this vector to the maximum between a and b.
             */
            maxi: function (a, b) {
                return Vec2.max(a, b, this);
            },
            /**
             * Returns the dot product between this vector and v.
             */
            dot: function (v) {
                return Vec2.dot(this, v);
            },
            /**
             * Returns the squared distance between this vector and v.
             */
            distanceSq: function (v) {
                return Vec2.distanceSq(this, v);
            },
            /**
             * Returns the distance between this vector and v.
             */
            distance: function (v) {
                return Vec2.distance(this, v);
            },
            /**
             * Sets this vector to the cross between v and a and returns this.
             */
            cross: function (v, a) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null) && ((typeof a === 'number') || a === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    return Vec2.cross(v, a, _this);
                    //})();
                    return Vec2.cross(v, a, this);
                }
                else if (((typeof v === 'number') || v === null) && ((a != null && a instanceof Vec2) || a === null)) {
                    return this.cross$float$Vec2(v, a);
                }
                else if (((v != null && v instanceof Vec2) || v === null) && a === undefined) {
                    return this.cross$Vec2(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets this vector to the cross between a and v and returns this.
             */
            cross$float$Vec2: function (a, v) {
                return Vec2.cross(a, v, this);
            },
            /**
             * Returns the scalar cross between this vector and v. This is essentially
             * the length of the cross product if this vector were 3d. This can also
             * indicate which way v is facing relative to this vector.
             */
            cross$Vec2: function (v) {
                return Vec2.cross(this, v);
            },
        };

        //static methods
        Vec2.min = function (a, b, out) {
            out.x = Math.min(a.x, b.x);
            out.y = Math.min(a.y, b.y);
            return out;
        };
        Vec2.max = function (a, b, out) {
            out.x = Math.max(a.x, b.x);
            out.y = Math.max(a.y, b.y);
            return out;
        };
        Vec2.dot = function (a, b) {
            return a.x * b.x + a.y * b.y;
        };
        Vec2.distanceSq = function (a, b) {
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            return dx * dx + dy * dy;
        };
        Vec2.distance = function (a, b) {
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        Vec2.cross = function (v, a, out) {
            if (((v != null && v instanceof Vec2) || v === null) && ((typeof a === 'number') || a === null) && ((out != null && out instanceof Vec2) || out === null)) {
                //var __args = Array.prototype.slice.call(arguments);
                //return (function () {
                //    out.x = v.y * a;
                //    out.y = v.x * -a;
                //    return out;
                //})();
                out.x = v.y * a;
                out.y = v.x * -a;
                return out;
            }
            else if (((typeof v === 'number') || v === null) && ((a != null && a instanceof Vec2) || a === null) && ((out != null && out instanceof Vec2) || out === null)) {
                return Vec2.cross$float$Vec2$Vec2(v, a, out);
            }
            else if (((v != null && v instanceof Vec2) || v === null) && ((a != null && a instanceof Vec2) || a === null) && out === undefined) {
                return Vec2.cross$Vec2$Vec2(v, a);
            }
            else
                throw new Error('invalid overload');
        };
        Vec2.cross$float$Vec2$Vec2 = function (a, v, out) {
            out.x = v.y * -a;
            out.y = v.x * a;
            return out;
        };
        Vec2.cross$Vec2$Vec2 = function (a, b) {
            return a.x * b.y - a.y * b.x;
        };
        /**
         * Returns an array of allocated Vec2 of the requested length.
         */
        Vec2.arrayOf = function (length) {
            var array = new Array(length);
            while ((--length >= 0)) {
                array[length] = new PocketCode.Physics.Vec2();
            }
            return array;
        };

        return Vec2;
    })(),

    Mat2: (function () {
        function Mat2(a, b, c, d) {
            //var _this = this;
            if (((typeof a === 'number') || a === null) && ((typeof b === 'number') || b === null) && ((typeof c === 'number') || c === null) && ((typeof d === 'number') || d === null)) {
                //var __args = Array.prototype.slice.call(arguments);
                this.m00 = 0;
                this.m01 = 0;
                this.m10 = 0;
                this.m11 = 0;
                //(function () {
                //    _this.set(a, b, c, d);
                //})();
                this.set(a, b, c, d);
            }
            else if (((typeof a === 'number') || a === null) && b === undefined && c === undefined && d === undefined) {
                //var __args = Array.prototype.slice.call(arguments);
                var radians_1 = __args[0];
                this.m00 = 0;
                this.m01 = 0;
                this.m10 = 0;
                this.m11 = 0;
                //(function () {
                //    _this.set(radians_1);
                //})();
                this.set(radians_1);
            }
            else if (a === undefined && b === undefined && c === undefined && d === undefined) {
                //var __args = Array.prototype.slice.call(arguments);
                this.m00 = 0;
                this.m01 = 0;
                this.m10 = 0;
                this.m11 = 0;
            }
            else
                throw new Error('invalid overload');
        }

        //methods
        Mat2.prototype = {
            /**
             * Sets this matrix to a rotation matrix with the given radians.
             */
            set$float: function (radians) {
                var c = Math.cos(radians);
                var s = Math.sin(radians);
                this.m00 = c;
                this.m01 = -s;
                this.m10 = s;
                this.m11 = c;
            },
            /**
             * Sets the values of this matrix.
             */
            set: function (a, b, c, d) {
                //var _this = this;
                if (((typeof a === 'number') || a === null) && ((typeof b === 'number') || b === null) && ((typeof c === 'number') || c === null) && ((typeof d === 'number') || d === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    _this.m00 = a;
                    //    _this.m01 = b;
                    //    _this.m10 = c;
                    //    _this.m11 = d;
                    //})();
                    this.m00 = a;
                    this.m01 = b;
                    this.m10 = c;
                    this.m11 = d;
                    //return?
                }
                else if (((a != null && a instanceof Mat2) || a === null) && b === undefined && c === undefined && d === undefined) {
                    return this.set$Mat2(a);
                }
                else if (((typeof a === 'number') || a === null) && b === undefined && c === undefined && d === undefined) {
                    return this.set$float(a);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets this matrix to have the same values as the given matrix.
             */
            set$Mat2: function (m) {
                this.m00 = m.m00;
                this.m01 = m.m01;
                this.m10 = m.m10;
                this.m11 = m.m11;
            },
            /**
             * Sets the values of this matrix to their absolute value.
             */
            absi: function () {
                this.abs(this);
            },
            /**
             * Returns a new matrix that is the absolute value of this matrix.
             */
            abs$: function () {
                return this.abs(new PocketCode.Physics.Mat2());
            },
            /**
             * Sets out to the absolute value of this matrix.
             */
            abs: function (out) {
                //var _this = this;
                if (((out != null && out instanceof Mat2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.m00 = Math.abs(_this.m00);
                    //    out.m01 = Math.abs(_this.m01);
                    //    out.m10 = Math.abs(_this.m10);
                    //    out.m11 = Math.abs(_this.m11);
                    //    return out;
                    //})();
                    out.m00 = Math.abs(this.m00);
                    out.m01 = Math.abs(this.m01);
                    out.m10 = Math.abs(this.m10);
                    out.m11 = Math.abs(this.m11);
                    return out;
                }
                else if (out === undefined) {
                    return this.abs$();
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets out to the x-axis (1st column) of this matrix.
             */
            getAxisX: function (out) {
                //var _this = this;
                if (((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.m00;
                    //    out.y = _this.m10;
                    //    return out;
                    //})();
                    out.x = this.m00;
                    out.y = this.m10;
                    return out;
                }
                else if (out === undefined) {
                    return this.getAxisX$();
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the x-axis (1st column) of this matrix.
             */
            getAxisX$: function () {
                return this.getAxisX(new PocketCode.Physics.Vec2());
            },
            /**
             * Sets out to the y-axis (2nd column) of this matrix.
             */
            getAxisY: function (out) {
                //var _this = this;
                if (((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.m01;
                    //    out.y = _this.m11;
                    //    return out;
                    //})();
                    out.x = this.m01;
                    out.y = this.m11;
                    return out;
                }
                else if (out === undefined) {
                    return this.getAxisY$();
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new vector that is the y-axis (2nd column) of this matrix.
             */
            getAxisY$: function () {
                return this.getAxisY(new PocketCode.Physics.Vec2());
            },
            /**
             * Sets the matrix to it's transpose.
             */
            transposei: function () {
                var t = this.m01;
                this.m01 = this.m10;
                this.m10 = t;
            },
            /**
             * Sets out to the transpose of this matrix.
             */
            transpose: function (out) {
                //var _this = this;
                if (((out != null && out instanceof Mat2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.m00 = _this.m00;
                    //    out.m01 = _this.m10;
                    //    out.m10 = _this.m01;
                    //    out.m11 = _this.m11;
                    //    return out;
                    //})();
                    out.m00 = this.m00;
                    out.m01 = this.m10;
                    out.m10 = this.m01;
                    out.m11 = this.m11;
                    return out;
                }
                else if (out === undefined) {
                    return this.transpose$();
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Returns a new matrix that is the transpose of this matrix.
             */
            transpose$: function () {
                return this.transpose(new PocketCode.Physics.Mat2());
            },
            /**
             * Transforms v by this matrix.
             */
            muli: function (v) {
                //var _this = this;
                if (((v != null && v instanceof Vec2) || v === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    return _this.mul(v.x, v.y, v);
                    //})();
                    return this.mul(v.x, v.y, v);
                }
                else if (((v != null && v instanceof Mat2) || v === null)) {
                    return this.muli$Mat2(v);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Sets out to the transformation of v by this matrix.
             */
            mul$Vec2$Vec2: function (v, out) {
                return this.mul(v.x, v.y, out);
            },
            /**
             * Returns a new vector that is the transformation of v by this matrix.
             */
            mul$Vec2: function (v) {
                return this.mul(v.x, v.y, new PocketCode.Physics.Vec2());
            },
            /**
             * Sets out the to transformation of {x,y} by this matrix.
             */
            mul: function (x, y, out) {
                //var _this = this;
                if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((out != null && out instanceof Vec2) || out === null)) {
                    //var __args = Array.prototype.slice.call(arguments);
                    //return (function () {
                    //    out.x = _this.m00 * x + _this.m01 * y;
                    //    out.y = _this.m10 * x + _this.m11 * y;
                    //    return out;
                    //})();
                    out.x = this.m00 * x + this.m01 * y;
                    out.y = this.m10 * x + this.m11 * y;
                    return out;
                }
                else if (((x != null && x instanceof Vec2) || x === null) && ((y != null && y instanceof Vec2) || y === null) && out === undefined) {
                    return this.mul$Vec2$Vec2(x, y);
                }
                else if (((x != null && x instanceof Mat2) || x === null) && ((y != null && y instanceof Mat2) || y === null) && out === undefined) {
                    return this.mul$Mat2$Mat2(x, y);
                }
                else if (((x != null && x instanceof Vec2) || x === null) && y === undefined && out === undefined) {
                    return this.mul$Vec2(x);
                }
                else if (((x != null && x instanceof Mat2) || x === null) && y === undefined && out === undefined) {
                    return this.mul$Mat2(x);
                }
                else
                    throw new Error('invalid overload');
            },
            /**
             * Multiplies this matrix by x.
             */
            muli$Mat2: function (x) {
                this.set(this.m00 * x.m00 + this.m01 * x.m10, this.m00 * x.m01 + this.m01 * x.m11, this.m10 * x.m00 + this.m11 * x.m10, this.m10 * x.m01 + this.m11 * x.m11);
            },
            /**
             * Sets out to the multiplication of this matrix and x.
             */
            mul$Mat2$Mat2: function (x, out) {
                out.m00 = this.m00 * x.m00 + this.m01 * x.m10;
                out.m01 = this.m00 * x.m01 + this.m01 * x.m11;
                out.m10 = this.m10 * x.m00 + this.m11 * x.m10;
                out.m11 = this.m10 * x.m01 + this.m11 * x.m11;
                return out;
            },
            /**
             * Returns a new matrix that is the multiplication of this and x.
             */
            mul$Mat2: function (x) {
                return this.mul(x, new PocketCode.Physics.Mat2());
            },
        };

        return Mat2;
    })(),

});

//PocketCode.Physics.ImpulseMath = (function () {
//    function ImpulseMath() {
//    }

//    ImpulseMath.PI_$LI$ = function () {
//        if (ImpulseMath.PI == null)
//            ImpulseMath.PI = Math.PI; 
//        return ImpulseMath.PI;
//    };
//    ImpulseMath.EPSILON_SQ_$LI$ = function () {
//        if (ImpulseMath.EPSILON_SQ == null)
//            ImpulseMath.EPSILON_SQ = ImpulseMath.EPSILON * ImpulseMath.EPSILON; 
//        return ImpulseMath.EPSILON_SQ;
//    };
//    ImpulseMath.DT_$LI$ = function () {
//        if (ImpulseMath.DT == null)
//            ImpulseMath.DT = 1.0 / 60.0;
//        return ImpulseMath.DT;
//    };
//    ImpulseMath.GRAVITY_$LI$ = function () {
//        if (ImpulseMath.GRAVITY == null)
//            ImpulseMath.GRAVITY = new PocketCode.Physics.Vec2(0.0, 50.0); 
//        return ImpulseMath.GRAVITY;
//    };
//    ImpulseMath.RESTING_$LI$ = function () {
//        if (ImpulseMath.RESTING == null)
//            ImpulseMath.RESTING = ImpulseMath.GRAVITY_$LI$().mul(ImpulseMath.DT_$LI$()).lengthSq() + ImpulseMath.EPSILON; 
//        return ImpulseMath.RESTING;
//    };
//    ImpulseMath.equal = function (a, b) {
//        return Math.abs(a - b) <= ImpulseMath.EPSILON;
//    };
//    ImpulseMath.clamp = function (min, max, a) {
//        return (a < min ? min : (a > max ? max : a));
//    };
//    ImpulseMath.round = function (a) {
//        return ((a + 0.5) | 0);
//    };
//    ImpulseMath.random$float$float = function (min, max) {
//        return ((max - min) * Math.random() + min);
//    };
//    ImpulseMath.random = function (min, max) {
//        if (((typeof min === 'number') || min === null) && ((typeof max === 'number') || max === null)) {
//            //var __args = Array.prototype.slice.call(arguments);
//            //return (function () {
//            //    return (((max - min + 1) * Math.random() + min) | 0);
//            //})();
//            return (((max - min + 1) * Math.random() + min) | 0);
//        }
//        else if (((typeof min === 'number') || min === null) && ((typeof max === 'number') || max === null)) {
//            return ImpulseMath.random$float$float(min, max);
//        }
//        else
//            throw new Error('invalid overload');
//    };
//    ImpulseMath.gt = function (a, b) {
//        return a >= b * ImpulseMath.BIAS_RELATIVE + a * ImpulseMath.BIAS_ABSOLUTE;
//    };
//    ImpulseMath.EPSILON = 1.0E-4;
//    ImpulseMath.BIAS_RELATIVE = 0.95;
//    ImpulseMath.BIAS_ABSOLUTE = 0.01;
//    ImpulseMath.PENETRATION_ALLOWANCE = 0.05;
//    ImpulseMath.PENETRATION_CORRETION = 0.4;

//    return ImpulseMath;
//})();//,

//};


