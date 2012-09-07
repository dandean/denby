Denby
=====

**Denby is a super-small standalone View Controller implementation.**

Denby makes heavy use of ES5 API's like `Object.defineProperty` and `Object.create`, so if you're going to use it in older browsers you will need to grab a copy of the [ES5 Shim](https://github.com/kriskowal/es5-shim).


Inspiration
-----------

All other View Controllers I've seen (and Backbone/Spine in particular) are tied to larger sytems and infrastructures, and require the use of libraries such as jQuery, Underscore, etc. The current state of JavaScript, alongside newer DOM API's like querySelector, obviates the need for these dependencies and allows us to create solutions with fewer abstractions, and feel much more like regular old JavaScript.
