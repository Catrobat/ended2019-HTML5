'use strict';

PocketCode.Physics = PocketCode.Physics || {};


PocketCode.Physics.merge({

    debugModeEnabled: true && PocketCode.Physics.Ui,

    Body: (function () {    //PHYSICS LOOK
        function Body(shape, x, y) {
            if (!shape || x == undefined || y == undefined)
                throw new Error('invalid cntr arguments');

            var Vec2 = PocketCode.Physics.Vec2;  //shortcut
            this.position = new Vec2();
            this.position.set(x, y);
            this.velocity = new Vec2();
            this.force = new Vec2();
            this.force.set(0, 0);

            this.angularVelocity = 0;
            this.torque = 0;
            this.orient = PocketCode.Physics.Math.random(-Math.PI, Math.PI);    //TODO
            this.mass = 0;
            this.invMass = 0;
            this.inertia = 0;
            this.invInertia = 0;
            this.staticFriction = 0.5;  //TODO: setter getter
            this.dynamicFriction = 0.3;
            this.restitution = 0.2;

            shape.initialize(this);
            this.shape = shape;

            //this.position.set(x, y);
            //this.velocity.set(0, 0);
            //this.angularVelocity = 0;
            //this.torque = 0;
            //this.orient = PocketCode.Physics.Math.random(-Math.PI, Math.PI);    //TODO
            //this.force.set(0, 0);
            //this.staticFriction = 0.5;  //TODO: setter getter
            //this.dynamicFriction = 0.3;
            //this.restitution = 0.2;
            //shape.body = this;
            //shape.initialize(this);
        }

        Body.prototype = {
            applyForce: function (f) {
                this.force.addi(f);
            },
            applyImpulse: function (impulse, contactVector) {
                this.velocity.addsi(impulse, this.invMass);
                this.angularVelocity += this.invInertia * Vec2.cross(contactVector, impulse);
            },
            setStatic: function () {
                this.inertia = 0.0;
                this.invInertia = 0.0;
                this.mass = 0.0;
                this.invMass = 0.0;
            },
            setOrient: function (radians) {
                this.orient = radians;
                this.shape.setOrient(radians);
            },
        };

        return Body;
    })(),

    ImpulseScene: (function () {    //WORLD
        function ImpulseScene(dt, iterations) {
            this.bodies = [];   //(new ArrayList());
            this.contacts = []; //(new ArrayList());
            this.dt = 0;
            this.iterations = 0;
            this.dt = dt;
            this.iterations = iterations;
        }

        ImpulseScene.prototype = {
            step: function () {
                this.contacts.dispose();
                this.contacts = []  //.clear();
                var cm = PocketCode.Physics.ContactManifold;
                for (var i = 0, l = this.bodies.length ; i < l; ++i) {
                    var A = this.bodies[i];
                    for (var j = i + 1, l = this.bodies.length ; j < l; ++j) {
                        var B = this.bodies[j];
                        if (A.invMass === 0 && B.invMass === 0) {
                            continue;
                        }
                        var m = new cm(A, B);
                        m.solve();
                        if (m.contactCount > 0) {
                            this.contacts.add(m);
                        }
                    }
                }
                for (var i = 0, l = this.bodies.length ; i < l; ++i)
                    this.integrateForces(this.bodies[i], this.dt);
                
                for (var i = 0, l = this.contacts.length ; i < l; ++i)
                    this.contacts[i].initialize();
                
                for (var j = 0, l = this.iterations; j < l; ++j) {
                    for (var i = 0, l = this.contacts.length ; i < l; ++i)
                        this.contacts[i].applyImpulse();
                }
                for (var i = 0, l = this.bodies.length ; i < l; ++i)
                    this.integrateVelocity(this.bodies[i], this.dt);

                for (var i = 0, l = this.contacts.length ; i < l; ++i)
                    this.contacts[i].positionalCorrection();

                for (var i = 0, l = this.bodies.length ; i < l; ++i) {
                    var b = this.bodies[i];
                    b.force.set(0, 0);
                    b.torque = 0;
                }
            },
            add: function (shape, x, y) {
                var b = new PocketCode.Physics.Body(shape, x, y);   //TODO: add body (physics look) instead of creating one
                this.bodies.add(b);
                return b;
            },
            clear: function () {
                this.contacts.dispose();
                this.contacts = [];//.clear();
                this.bodies.dispose();
                this.bodies = [];//.clear();
            },
            integrateForces: function (b, dt) {
                if (b.invMass === 0.0) {
                    return;
                }
                var dts = dt * 0.5;
                b.velocity.addsi(b.force, b.invMass * dts);
                b.velocity.addsi(PocketCode.Physics.Math.GRAVITY_$LI$(), dts);
                b.angularVelocity += b.torque * b.invInertia * dts;
            },
            integrateVelocity: function (b, dt) {
                if (b.invMass === 0.0) {
                    return;
                }
                b.position.addsi(b.velocity, dt);
                b.orient += b.angularVelocity * dt;
                b.setOrient(b.orient);
                this.integrateForces(b, dt);
            },
        };

        return ImpulseScene;
    })(),
});
