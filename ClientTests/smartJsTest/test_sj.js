/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sj.js");

QUnit.test("Object.prototype.merge", function (assert) {

	var x = [1, 2];
	var y = [3, 4];
	assert.throws(function () { x.merge(y); },
		function (err) { return err.message === "Object.merge not valid on simple data types and arrays"; },
		"ERROR merging arrays");

	x = { a: 1, b: 2 };
	y = 5;
	assert.deepEqual(x, { a: 1, b: 2 }, "merging simple type into object");

	x = { a: 1 };
	y = { b: 2 };
	x.merge(y);
	assert.deepEqual(x, { a: 1, b: 2 }, "merging objects without recursion");

	x = { a: 1 };
	y = { b: 2 };
	x.merge(y);
	var z = x;
	x = { a: 1 };
	y.merge(x);
	assert.deepEqual(z, y, "merging objects without conflicts (override)");

	x = { a: 2 };
	y = { b: 2 };
	x.merge(y);
	z = x;
	x = { a: 1 };
	y.merge(x);
	assert.notDeepEqual(z, y, "merging objects with conflicts (override)");

	x = { a: 1, b: { a: 2, b: { a: 3, b: 4 } } };
	y = { b: { b: { b: 5 } } };
	x.merge(y);
	assert.deepEqual(x, { a: 1, b: { a: 2, b: { a: 3, b: 5 } } }, "merging objects with recursion");

	x = { a: 1, b: { a: 2, b: { a: 3, b: 4 } } };
	y.merge(x);
	assert.deepEqual(y, { a: 1, b: { a: 2, b: { a: 3, b: 4 } } }, "merging objects with recursion (override)");

	y = { a: { a: { a: 5 } } };
	x.merge(y);
	assert.deepEqual(x, { a: { a: { a: 5 } }, b: { a: 2, b: { a: 3, b: 4 } } }, "merging objects with recursion (override structural)");

	x = { a: { b: 7 }, b: { a: 2, b: { a: 3, b: 4 } } };
	x.merge(y);
	assert.deepEqual(x, { a: { a: { a: 5 }, b: 7 }, b: { a: 2, b: { a: 3, b: 4 } } }, "merging objects with recursion (override structural object)");

	x = { a: { b: 7 }, b: { a: 2, b: { a: 3, b: 4 } } };
	y = { a: { a: { a: 5 }, b: {b: 5} } };
	x.merge(y);
	assert.deepEqual(x, { a: { a: { a: 5 }, b: {b: 5} }, b: { a: 2, b: { a: 3, b: 4 } } }, "merging objects with recursion (deep merge)");

});


QUnit.test("Function.prototype.extends", function (assert) {
	var A = (function () {
		function A() {
			this.x = 1;
			this.y = 2;
			this.z = { a: 1, b: 2 };
		};
		A.prototype.fn1 = function () { return this.x; };
		A.prototype.merge({
			fn2: function (prop1) { return prop1; },
			fn3: function () { return this.y; },
		});
		return A;
	})();

	var B = (function () {
		B.extends(A);
		function B(x) { //with constructor parameter
			this.x = x;
			this.y = 2;
			this.z = { a: 1, b: 2 };
		};
		B.prototype.merge({
			fn1: function () { return this.y; },    //method override
			fn1Base: function () { return A.prototype.fn1.call(this); },
		});
		return B;
	})();

	var BX = (function () { //without overrride to compare inherinace (deep merge)
		BX.extends(A);
		function BX(x) { //with constructor parameter
			this.x2 = x;
			//this.y = 2;
			//this.z = { a: 1, b: 2 };
		};
		BX.prototype.merge({
			fn4: function () { return this.y; },    //method override
		});
		return BX;
	})();

	var C = (function () {
		C.extends(BX);
		function C(x, y) {
			BX.call(this, x);   //super constructor call 
			this.y = y;
			this.z = { a: 1, b: 2 };
		};
		return C;
	})();

	var a = new A();
	var b = new A();
	assert.notEqual(a, b, "instances not equal (same objects)");
	assert.deepEqual(a, b, "instances of same object type");

	assert.deepEqual(a.y, 2, "property assigned in constructor");
	assert.deepEqual(b.fn1(), 1, "method defined");
	assert.deepEqual(b.fn2(4), 4, "method definition merged");

	b = new B();
	assert.equal(typeof b.x, "undefined", "constructor without parameter");
	b = new B("param");
	assert.equal(b.x, "param", "constructor with parameter");

	assert.deepEqual(b.fn1(), 2, "method override");
	assert.equal(b.fn1Base(), "param", "base method call");
	
	b = new BX(32);
	var b2 = new BX(32);
	b2.merge(a);
	assert.deepEqual(b, b2, "inheritance");

	var c = new C("asd");
	assert.equal(c.x2, "asd", "super constructor call within constructor");

	b2 = new BX("asd");
	c.merge(b2);
	assert.deepEqual(c, new C("asd"), "multiple inheritance");

	assert.ok(a instanceof A, "instanceof: simple");

	assert.ok(c instanceof A && c instanceof BX && c instanceof C, "instanceof (inheritance): komplex");

	//inheritance without constructor call
	C = (function () {
		C.extends(BX, false);
		function C(x, y) {
			BX.call(this, x);   //super constructor call 
			this.y = y;
			this.z = { a: 1, b: 2 };
		};
		return C;
	})();
	c = new C();
	assert.ok(c instanceof A && c instanceof BX && c instanceof C, "instanceof (inheritance): without base constructor call in Object.extends()");
	assert.deepEqual(c.z, { a: 1, b: 2 }, "inheritance without base constructor call in Object.extends()")
});


QUnit.test("Function.prototype.extends (including namespaces)", function (assert) {
	//var ns = {};  //no matter if classes are defined as property or in the namespace directly
	//please notice when using class A extend(B): cannot be defined in the same statement due to dependencies
	var ns = {
		A: (function () {
			function A() {
				this.x = 1;
				this.y = 2;
				this.z = { a: 1, b: 2 };
			};
			A.prototype.fn1 = function () { return this.x; };
			A.prototype.merge({
				fn2: function (prop1) { return prop1; },
				fn3: function () { return this.y; },
			});
			return A;
		})(),
	};

	ns.B = (function () {
		B.extends(ns.A);
		function B(x) { //with constructor parameter
			this.x = x;
			this.y = 2;
			this.z = { a: 1, b: 2 };
		};
		B.prototype.merge({
			fn1: function () { return this.y; },    //method override
			fn1Base: function () { return ns.A.prototype.fn1.call(this); },
		});
		return B;
	})();

	ns.BX = (function () { //without overrride to compare inherinace (deep merge)
		BX.extends(ns.A);
		function BX(x) { //with constructor parameter
			this.x2 = x;
			//this.y = 2;
			//this.z = { a: 1, b: 2 };
		};
		BX.prototype.merge({
			fn4: function () { return this.y; },    //method override
		});
		return BX;
	})();

	ns.C = (function () {
		C.extends(ns.BX);
		function C(x, y) {
			ns.BX.call(this, x);   //super constructor call 
			this.y = y;
			this.z = { a: 1, b: 2 };
		};
		return C;
	})();

	var a = new ns.A();
	var b = new ns.BX(32);
	var b2 = new ns.BX(32);
	b2.merge(a);
	assert.deepEqual(b, b2, "inheritance");

	var c = new ns.C("asd");
	assert.equal(c.x2, "asd", "super constructor call within constructor");

	b2 = new ns.BX("asd");
	c.merge(b2);
	assert.deepEqual(c, new ns.C("asd"), "multiple inheritance");

	assert.ok(a instanceof ns.A, "instanceof: simple");

	assert.ok(c instanceof ns.A, "instanceof (inheritance): 1st");
	assert.ok(c instanceof ns.BX, "instanceof (inheritance): 2nd");
	assert.ok(c instanceof ns.C, "instanceof (inheritance): 3rd");

	var nsChange = ns.C;
	c = new nsChange(1, 2);
	assert.ok(c instanceof ns.C, "instanceof (call reference for new changed)");

	//test including properties
	ns.C = (function () {
		C.extends(ns.BX);
		function C(x, y) {
			ns.BX.call(this, x);   //super constructor call 
			this.y = y;
			this.z = { a: 1, b: 2 };
		};

		Object.defineProperties(C.prototype, {
			propA: {
				get: function () { return "propA_GET"; },
				//enumerable: false,
				//configurable: true,
			},
			propB: {
				get: function () { return 123; },
				//enumerable: false,
				//configurable: true,
				set: function (value) {
				    var temp = value;
				    return false;
				},
			},
		});

		//method: fn4 (returns 2)
		return C;
	})();

	ns.D = (function () {
		D.extends(ns.C, false);
		function D(x, y) {
			ns.C.call(this, x, y);   //super constructor call 
			//this.y = y;
			//this.z = { a: 1, b: 2 };
		};
		return D;
	})();

	var combined = new ns.D("sj123", "sj124");
	assert.equal(combined.fn4(), "sj124", "advanced: inherited method call");
	assert.equal(combined.x2, "sj123", "advanced: base constructor call on several base classes");
	assert.equal(combined.propA, "propA_GET", "advanced: property check on inherited classes: using Object.defineProperties");

	//var returnValueOnSetter = (combined.propB = "test");
	//assert.equal(returnValueOnSetter, false, "check out if there is a support for return values on setters");
});


QUnit.test("Array.prototype.insert", function (assert) {
	
	var a = [];
	a.insert({a:"asd"}, 2);
	assert.deepEqual(a[a.length-1], { a: "asd" }, "insert on index > length = last entry");

	a.insert({ a: "asd" }, 2);
	a.insert({ a: "asd" }, 2);
	a.insert({ a: "jkl" }, 2);
	assert.deepEqual(a[2], { a: "jkl" }, "insert on index == length: last entry moved");
	assert.deepEqual(a[a.length - 1], { a: "asd" }, "3rd moved to 4th entry");

	a.insert(23, 0);
	assert.deepEqual(a[0], 23, "mixed type (int) on first entry");
	assert.ok(a.length == 5, "array resized during insert");
	assert.deepEqual(a[3], { a: "jkl" }, "entries moved during insert");
	assert.deepEqual(a[a.length - 1], { a: "asd" }, "entries moved during insert (last)");
});


QUnit.test("Array.prototype.remove", function (assert) {

	var a = [0, 1, "asd", "jkl", [1], { a: 23, b: 32 }];
	a.remove(1);
	assert.ok(a.length == 5, "array length decreased after remove (int)");
	assert.equal(a[1], "asd", "3rd becomes 2nd after removing 2nd");

	var X = (function () {
		function X() {
			this.x = 1;
			this.y = 2;
			this.z = { a: 1, b: 2 };
		};
		X.prototype.fn1 = function () { return this.x; };
		X.prototype.merge({
			fn2: function (prop1) { return prop1; },
			fn3: function () { return this.y; },
		});
		return X;
	})();

	var x = new X();
	var x2 = new X();
	a.insert(x, 0);
	assert.deepEqual(a[0], new X(), "object inserted correctly");
	var count = a.remove(x2);
	assert.equal(count, 0, "return value (count of removed items) if not removed");
	assert.ok(a.length == 6, "inserting and removing same instances but not objects");

	count = a.remove(x);
	assert.equal(count, 1, "return value (count of removed items) if 1 removed");
	assert.equal(a[0], 0, "object removed, index changed");
	assert.ok(a.length == 5, "length changed after remove");

	a[a.length] = x2;
	a[a.length] = x2;
	count = a.remove(x2);
	assert.equal(count, 2, "return value (count of removed items) if 2 removed");
	assert.ok(a.length == 5, "length changed after several items remove");

});


QUnit.test("Array.prototype.dispose", function (assert) {

	var a = [{ a: "asd", dispose: 23 }, "jkl"];
	assert.equal(a.dispose(), undefined, "dispose of simple array");
	assert.equal(a.length, 0, "length of dispose array = 0");

	a = [undefined, undefined];
	assert.equal(a.dispose(), undefined, "dispose array including undefined types");
	assert.equal(a.length, 0, "length of dispose array = 0");

	var called = 0;
	var o = { a: 1, b: "x", dispose: function () { called += 1; } };
	a = [o, { a: "asd", dispose: 23 }, "jkl", o];
	assert.equal(a.dispose(), undefined, "dispose array calling dispose() on entry");
	assert.equal(a.length, 0, "length of dispose array = 0");
	assert.equal(called, 2, "calls on list items executed");

});


