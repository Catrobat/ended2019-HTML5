'use strict';

//PocketCode.Physics = PocketCode.Physics || {};


PocketCode.Physics.merge({

    ContactManifold: (function () {
        function ContactManifold(a, b) {
            var Vec2 = PocketCode.Physics.Vec2;  //shortcuts
            this._cs = PocketCode.Physics.CollisionSolver;   //static ref

            this.normal = new Vec2();
            this.contacts = [new Vec2(), new Vec2()];
            this.penetration = 0;
            this.contactCount = 0;
            this.e = 0;
            this.df = 0;
            this.sf = 0;
            this.A = a;
            this.B = b;
        }

        //properties
        //Object.defineProperties(ContactManifold.prototype, {
        //    count: {
        //        get: function () {
        //            return this._contactCount;
        //        },
        //    },
        //});

        //methods
        ContactManifold.prototype = {
            solve: function () {
                var ia = Shape.Type[Shape.Type[this.A.shape.getType()]];
                var ib = Shape.Type[Shape.Type[this.B.shape.getType()]];
                //Collisions.dispatch_$LI$()[ia][ib].handleCollision(this, this.A, this.B);
                this._cs.handleCollision(this, this.A, this.B);
            },
            initialize: function () {
                var Vec2 = PocketCode.Physics.Vec2;  //shortcut
                this.e = Math.min(this.A.restitution, this.B.restitution);
                this.sf = Math.sqrt(this.A.staticFriction * this.A.staticFriction + this.B.staticFriction * this.B.staticFriction);
                this.df = Math.sqrt(this.A.dynamicFriction * this.A.dynamicFriction + this.B.dynamicFriction * this.B.dynamicFriction);
                for (var i = 0, l = this.contactCount; i < l ; ++i) {
                    var ra = this.contacts[i].sub(this.A.position);
                    var rb = this.contacts[i].sub(this.B.position);
                    var rv = this.B.velocity.add(Vec2.cross(this.B.angularVelocity, rb, new Vec2())).subi(this.A.velocity).subi(Vec2.cross(this.A.angularVelocity, ra, new Vec2()));
                    if (rv.lengthSq() < PocketCode.Physics.Math.RESTING_$LI$()) {
                        this.e = 0.0;
                    }
                }
            },
            applyImpulse: function () {
                var Vec2 = PocketCode.Physics.Vec2;  //shortcut
                if (PocketCode.Physics.Math.equal(this.A.invMass + this.B.invMass, 0)) {
                    //this._infiniteMassCorrection();
                    this.A.velocity.set(0, 0);
                    this.B.velocity.set(0, 0);
                    return;
                }
                for (var i = 0, l = this.contactCount; i < l; ++i) {
                    var ra = this.contacts[i].sub(this.A.position);
                    var rb = this.contacts[i].sub(this.B.position);
                    var rv = this.B.velocity.add(Vec2.cross(this.B.angularVelocity, rb, new Vec2())).subi(this.A.velocity).subi(Vec2.cross(this.A.angularVelocity, ra, new Vec2()));
                    var contactVel = Vec2.dot(rv, this.normal);
                    if (contactVel > 0) {
                        return;
                    }
                    var raCrossN = Vec2.cross(ra, this.normal);
                    var rbCrossN = Vec2.cross(rb, this.normal);
                    var invMassSum = this.A.invMass + this.B.invMass + (raCrossN * raCrossN) * this.A.invInertia + (rbCrossN * rbCrossN) * this.B.invInertia;
                    var j = -(1.0 + this.e) * contactVel;
                    j /= invMassSum;
                    j /= this.contactCount;
                    var impulse = this.normal.mul(j);
                    this.A.applyImpulse(impulse.neg(), ra);
                    this.B.applyImpulse(impulse, rb);
                    rv = this.B.velocity.add(Vec2.cross(this.B.angularVelocity, rb, new Vec2())).subi(this.A.velocity).subi(Vec2.cross(this.A.angularVelocity, ra, new Vec2()));
                    var t = new Vec2(rv);
                    t.addsi(this.normal, -Vec2.dot(rv, this.normal));
                    t.normalize();
                    var jt = -Vec2.dot(rv, t);
                    jt /= invMassSum;
                    jt /= this.contactCount;
                    if (PocketCode.Physics.Math.equal(jt, 0.0)) {
                        return;
                    }
                    var tangentImpulse = void 0;
                    if (Math.abs(jt) < j * this.sf) {
                        tangentImpulse = t.mul(jt);
                    }
                    else {
                        tangentImpulse = t.mul(j).muli(-this.df);
                    }
                    this.A.applyImpulse(tangentImpulse.neg(), ra);
                    this.B.applyImpulse(tangentImpulse, rb);
                }
            },
            positionalCorrection: function () {
                var correction = Math.max(this.penetration - PocketCode.Physics.Math.PENETRATION_ALLOWANCE, 0.0) / (this.A.invMass + this.B.invMass) * PocketCode.Physics.Math.PENETRATION_CORRETION;
                this.A.position.addsi(this.normal, -this.A.invMass * correction);
                this.B.position.addsi(this.normal, this.B.invMass * correction);
            },
            //_infiniteMassCorrection: function () {
            //    this.A.velocity.set(0, 0);
            //    this.B.velocity.set(0, 0);
            //},
        };

        return ContactManifold;
    })(),

    CollisionSolver: (function () {
        function CollisionSolver() {
        }

        CollisionSolver.instance_$LI$ = function () {
            if (CollisionSolver.instance == null)
                CollisionSolver.instance = new CollisionSolver();
            return CollisionSolver.instance;
        };

        //methods
        CollisionSolver.prototype = {
            handleCollision: function (m, a, b) {
                var Vec2 = PocketCode.Physics.Vec2;  //shortcut

                var A = a.shape;
                var B = b.shape;
                m.contactCount = 0;
                var faceA = [0];
                var penetrationA = this.findAxisLeastPenetration(faceA, A, B);
                if (penetrationA >= 0.0)
                    return;

                var faceB = [0];
                var penetrationB = this.findAxisLeastPenetration(faceB, B, A);
                if (penetrationB >= 0.0)
                    return;

                var referenceIndex;
                var flip;   //always point from a to b
                var RefPoly;    //reference
                var IncPoly;    //incident

                //determine which shape contains reference face
                if (PocketCode.Physics.Math.gt(penetrationA, penetrationB)) {
                    RefPoly = A;
                    IncPoly = B;
                    referenceIndex = faceA[0];
                    flip = false;
                }
                else {
                    RefPoly = B;
                    IncPoly = A;
                    referenceIndex = faceB[0];
                    flip = true;
                }

                //world space incident face
                var incidentFace = Vec2.arrayOf(2);
                this.findIncidentFace(incidentFace, RefPoly, IncPoly, referenceIndex);
                //        y
                //        ^  ->n       ^
                //      +---c ------posPlane--
                //  x < | i |\
                //      +---+ c-----negPlane--
                //             \       v
                //              r
                //
                //  r : reference face
                //  i : incident poly
                //  c : clipped point
                //  n : incident normal

                //setup reference face vertices
                var v1 = RefPoly.vertices[referenceIndex];
                referenceIndex = referenceIndex + 1 === RefPoly.vertexCount ? 0 : referenceIndex + 1;

                var v2 = RefPoly.vertices[referenceIndex];
                v1 = RefPoly.u.mul(v1).addi(RefPoly.body.position);
                v2 = RefPoly.u.mul(v2).addi(RefPoly.body.position);

                var sidePlaneNormal = v2.sub(v1);
                sidePlaneNormal.normalize();
                var refFaceNormal = new Vec2(sidePlaneNormal.y, -sidePlaneNormal.x);
                var refC = Vec2.dot(refFaceNormal, v1);
                var negSide = -Vec2.dot(sidePlaneNormal, v1);
                var posSide = Vec2.dot(sidePlaneNormal, v2);
                if (this.clip(sidePlaneNormal.neg(), negSide, incidentFace) < 2)
                    return;

                if (this.clip(sidePlaneNormal, posSide, incidentFace) < 2)
                    return;

                m.normal.set(refFaceNormal);
                if (flip) {
                    m.normal.negi();
                }
                var cp = 0;
                var separation = Vec2.dot(refFaceNormal, incidentFace[0]) - refC;
                if (separation <= 0.0) {
                    m.contacts[cp].set(incidentFace[0]);
                    m.penetration = -separation;
                    ++cp;
                }
                else {
                    m.penetration = 0;
                }
                separation = Vec2.dot(refFaceNormal, incidentFace[1]) - refC;
                if (separation <= 0.0) {
                    m.contacts[cp].set(incidentFace[1]);
                    m.penetration += -separation;
                    ++cp;
                    m.penetration /= cp;
                }
                m.contactCount = cp;
            },
            findAxisLeastPenetration: function (faceIndex, A, B) {
                var bestDistance = -javaemul.internal.FloatHelper.MAX_VALUE;
                var bestIndex = 0;
                for (var i = 0, l = A.vertexCount; i < l; ++i) {
                    var nw = A.u.mul(A.normals[i]);
                    var buT = B.u.transpose();
                    var n = buT.mul(nw);
                    var s = B.getSupport(n.neg());
                    var v = buT.muli(A.u.mul(A.vertices[i]).addi(A.body.position).subi(B.body.position));
                    var d = Vec2.dot(n, s.sub(v));
                    if (d > bestDistance) {
                        bestDistance = d;
                        bestIndex = i;
                    }
                }
                faceIndex[0] = bestIndex;
                return bestDistance;
            },
            findIncidentFace: function (v, RefPoly, IncPoly, referenceIndex) {
                var referenceNormal = RefPoly.normals[referenceIndex];
                referenceNormal = RefPoly.u.mul(referenceNormal);
                referenceNormal = IncPoly.u.transpose().mul(referenceNormal);
                var incidentFace = 0;
                var minDot = javaemul.internal.FloatHelper.MAX_VALUE;
                for (var i = 0, l = IncPoly.vertexCount; i < l; ++i) {
                    var dot = Vec2.dot(referenceNormal, IncPoly.normals[i]);
                    if (dot < minDot) {
                        minDot = dot;
                        incidentFace = i;
                    }
                }
                v[0] = IncPoly.u.mul(IncPoly.vertices[incidentFace]).addi(IncPoly.body.position);
                incidentFace = incidentFace + 1 >= (IncPoly.vertexCount | 0) ? 0 : incidentFace + 1;
                v[1] = IncPoly.u.mul(IncPoly.vertices[incidentFace]).addi(IncPoly.body.position);
            },
            clip: function (n, c, face) {
                var Vec2 = PocketCode.Physics.Vec2;  //shortcut

                var sp = 0;
                var out = [new Vec2(face[0]), new Vec2(face[1])];
                var d1 = Vec2.dot(n, face[0]) - c;
                var d2 = Vec2.dot(n, face[1]) - c;
                if (d1 <= 0.0)
                    out[sp++].set(face[0]);
                if (d2 <= 0.0)
                    out[sp++].set(face[1]);
                if (d1 * d2 < 0.0) {
                    var alpha = d1 / (d1 - d2);
                    out[sp++].set(face[1]).subi(face[0]).muli(alpha).addi(face[0]);
                }
                face[0] = out[0];
                face[1] = out[1];
                return sp;
            },
            dispose: function () {
                //static class: cannot be disposed
            },
        };

        return CollisionSolver;
    })(),

    //Collisions: (function () {
    //    function Collisions() {
    //    }

    //    Collisions.dispatch_$LI$ = function () {
    //        if (Collisions.dispatch == null)
    //            Collisions.dispatch = [[CollisionCircleCircle.instance_$LI$(), CollisionCirclePolygon.instance_$LI$()], [CollisionPolygonCircle.instance_$LI$(), CollisionSolver.instance_$LI$()]];
    //        return Collisions.dispatch;
    //    };

    //    return Collisions;
    //})(),
});

//static class: constructor override (keeping code coverage enabled)
PocketCode.Physics.CollisionSolver = new PocketCode.Physics.CollisionSolver();


/*
var CollisionCircleCircle = (function () {
    function CollisionCircleCircle() {
    }
    CollisionCircleCircle.instance_$LI$: function () { if (CollisionCircleCircle.instance == null)
        CollisionCircleCircle.instance = new CollisionCircleCircle(); return CollisionCircleCircle.instance; },
    ;
    CollisionCircleCircle.prototype.handleCollision: function (m, a, b) {
        var A = a.shape;
        var B = b.shape;
        var normal = b.position.sub(a.position);
        var dist_sqr = normal.lengthSq();
        var radius = A.radius + B.radius;
        if (dist_sqr >= radius * radius) {
            m.contactCount = 0;
            return;
        }
        var distance = Math.sqrt(dist_sqr);
        m.contactCount = 1;
        if (distance === 0.0) {
            m.penetration = A.radius;
            m.normal.set(1.0, 0.0);
            m.contacts[0].set(a.position);
        }
        else {
            m.penetration = radius - distance;
            m.normal.set(normal).divi(distance);
            m.contacts[0].set(m.normal).muli(A.radius).addi(a.position);
        }
    },
    return CollisionCircleCircle;
}());
CollisionCircleCircle["__class"] = "CollisionCircleCircle";
CollisionCircleCircle["__interfaces"] = ["CollisionCallback"];
var CollisionCirclePolygon = (function () {
    function CollisionCirclePolygon() {
    }
    CollisionCirclePolygon.instance_$LI$: function () { if (CollisionCirclePolygon.instance == null)
        CollisionCirclePolygon.instance = new CollisionCirclePolygon(); return CollisionCirclePolygon.instance; },
    ;
    CollisionCirclePolygon.prototype.handleCollision: function (m, a, b) {
        var A = a.shape;
        var B = b.shape;
        m.contactCount = 0;
        var center = B.u.transpose().muli(a.position.sub(b.position));
        var separation = -javaemul.internal.FloatHelper.MAX_VALUE;
        var faceNormal = 0;
        for (var i = 0, l = B.vertexCount; i < l; ++i) {
            var s = Vec2.dot(B.normals[i], center.sub(B.vertices[i]));
            if (s > A.radius) {
                return;
            }
            if (s > separation) {
                separation = s;
                faceNormal = i;
            }
        }
        var v1 = B.vertices[faceNormal];
        var i2 = faceNormal + 1 < B.vertexCount ? faceNormal + 1 : 0;
        var v2 = B.vertices[i2];
        if (separation < PocketCode.Physics.Math.EPSILON) {
            m.contactCount = 1;
            B.u.mul(B.normals[faceNormal], m.normal).negi();
            m.contacts[0].set(m.normal).muli(A.radius).addi(a.position);
            m.penetration = A.radius;
            return;
        }
        var dot1 = Vec2.dot(center.sub(v1), v2.sub(v1));
        var dot2 = Vec2.dot(center.sub(v2), v1.sub(v2));
        m.penetration = A.radius - separation;
        if (dot1 <= 0.0) {
            if (Vec2.distanceSq(center, v1) > A.radius * A.radius) {
                return;
            }
            m.contactCount = 1;
            B.u.muli(m.normal.set(v1).subi(center)).normalize();
            B.u.mul(v1, m.contacts[0]).addi(b.position);
        }
        else if (dot2 <= 0.0) {
            if (Vec2.distanceSq(center, v2) > A.radius * A.radius) {
                return;
            }
            m.contactCount = 1;
            B.u.muli(m.normal.set(v2).subi(center)).normalize();
            B.u.mul(v2, m.contacts[0]).addi(b.position);
        }
        else {
            var n = B.normals[faceNormal];
            if (Vec2.dot(center.sub(v1), n) > A.radius) {
                return;
            }
            m.contactCount = 1;
            B.u.mul(n, m.normal).negi();
            m.contacts[0].set(a.position).addsi(m.normal, A.radius);
        }
    },
    return CollisionCirclePolygon;
}());
CollisionCirclePolygon["__class"] = "CollisionCirclePolygon";
CollisionCirclePolygon["__interfaces"] = ["CollisionCallback"];
var CollisionPolygonCircle = (function () {
    function CollisionPolygonCircle() {
    }
    CollisionPolygonCircle.instance_$LI$: function () { if (CollisionPolygonCircle.instance == null)
        CollisionPolygonCircle.instance = new CollisionPolygonCircle(); return CollisionPolygonCircle.instance; },
    ;
    CollisionPolygonCircle.prototype.handleCollision: function (m, a, b) {
        CollisionCirclePolygon.instance_$LI$().handleCollision(m, b, a);
        if (m.contactCount > 0) {
            m.normal.negi();
        }
    },
    return CollisionPolygonCircle;
}());
CollisionPolygonCircle["__class"] = "CollisionPolygonCircle";
CollisionPolygonCircle["__interfaces"] = ["CollisionCallback"]; */