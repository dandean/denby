var DOM = require('element-pants');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

/**
 * id() -> String
 *
 * Generates a unique view ID for use on an HTML Element.
**/
var id = (function() {
  var x = 0;
  return function() { return 'view-' + ++x; };
})();

/**
 * createError(name, message) -> Error
 *
 * Creates a named Error.
**/
function createError(name, message) {
  var error = new Error(message);
  error.name = name;
  return error;
}

/**
 * combine(object, object, ...) -> Object
 *
 * Copies every key/value pair from every object passed in as an argument.
 * Arguments to the right take the highest precedence.
**/
function combine() {
  var result = {};
  for (var i=0; i < arguments.length; i++) {
    var o = arguments[i];
    if (o) for (var key in o) result[key] = o[key];
  }
  return result;
}

function Denby(options) {
  EventEmitter2.call(this);

  options                      = options || {};

  // If provided, remove the model from the options object after setting it
  // on the view itself. Just keeps shit tidy and avoids duplicate refs.
  if (options.model) {
    this.model = options.model;
    delete options.model;
  }

  // Configure protos for nested options before options object itself in order
  // to keep from creating a recursive loop.
  options.on                   = options.on || {};
  options.on.__proto__         = this.options.on || {};

  options.attributes           = options.attributes || {};
  options.attributes.__proto__ = this.options.attributes || {};

  options.__proto__            = this.options;

  // Store options on the instance for later:
  Object.defineProperty(this, 'options', {
    value: options,
    enumerable: false, configurable: true, writable: true
  });

  var element = options.element || DOM.create(options.tag || 'div');           
  var t = this;

  var attributes = options.attributes;
  if (!element.id) attributes.id = options.id || id();
  if (options.className) attributes['class'] = options.className;

  for (var name in attributes) {
    element.setAttribute(name, attributes[name]);
  }

  Object.keys(options.on).forEach(function(event) {
    var fn = options.on[event];
    if (fn instanceof Function === false) fn = t[fn];
    if (!fn)
      throw createError('ConfigurationError', fn + ' is not a function');

    event = event.split(' ');
    var type = event[0];
    var selector = event.slice(1).join(' ').trim();
    DOM.on(element, type, selector || undefined, fn.bind(t));
  });

  Object.defineProperty(this, 'element', {
    get: function() { return element; },
    enumerable: true, configurable: false
  });
}

// Denby is an EventEmitter:
Denby.prototype = Object.create(EventEmitter2.prototype);

// Add a defaults options object to the prototype (which is EventEmitter2)
Object.defineProperty(Denby.prototype, 'options', {
  value: {},
  enumerable: false, configurable: true, writable: true
});

Object.defineProperty(Denby.prototype, 'render', {
  value: function() {
    this.emit('render');
  },
  enumerable: false, configurable: true
});

module.exports = Denby;
