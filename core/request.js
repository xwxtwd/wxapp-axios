/**
 * Created by J.Son on 2019/1/29
 */
const Request = require('./RequestFactory');
var defaults = require('./defaults');

/**
 * Create an instance of Request
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Request} A new instance of Request
 */
function createInstance (defaultConfig) {
  var context = new Request(defaultConfig);
  var instance = Request.prototype.request.bind(context);
  // Copy request.prototype to instance
  extend(instance, Request.prototype, context);
  // Copy context to instance
  extend(instance, context);

  return instance;
}

const request = createInstance(defaults);

// Factory for creating new instances
request.create = function create (instanceConfig) {
  return createInstance(Object.assign(request.defaults, instanceConfig));
};
request.all = function all (promises) {
  return Promise.all(promises);
};
module.exports = exports = request;
module.exports.default = request;

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend (a, b, thisArg) {
  forEach(b, function assignValue (val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = val.bind(thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach (obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}
