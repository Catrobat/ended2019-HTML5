/// <reference path="sj.js" />
'use strict';


SmartJs.Error = {
    Exception: (function () {
        Exception.extends(Error);

        function Exception(args) {
            if (typeof args === 'string')
                this.message = args;
            else if (typeof args === 'object') 
                this.merge(args);
            else
                throw new Error('invalid argument: expected "args" of type string or object');
            this.stack = this.stack || '';
        }

        return Exception;
    })(),
};

SmartJs.Error.NotImplementedException = (function () {
    NotImplementedException.extends(SmartJs.Error.Exception, false);

    function NotImplementedException() {
        SmartJs.Error.Exception.call(this, 'Not implemented');
    }

    return NotImplementedException;
})();

SmartJs.Error.InvalidArgumentException = (function () {
    InvalidArgumentException.extends(SmartJs.Error.Exception, false);

    function InvalidArgumentException(argument, expected) {
        SmartJs.Error.Exception.call(this, { msg: 'Invalid argument: "' + argument.toString() + '", expected: ' + expected.toString(), argument: argument.toString(), expected: expected.toString() });
    }

    return InvalidArgumentException;
})();

