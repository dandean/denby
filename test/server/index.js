// This file will get compiled by Modulr and served as /tubbs.js
var assert = require('assert');
var Denby = require('../../index');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var DOM = require('element-pants');
var Mustache = require('mustache');

// Export the require function for easy console debugger.
window.__require = require;

describe('Denby', function() {

  before(function() {
  });

  it('should create an instance', function() {
    var view = new Denby();
    assert.ok(view instanceof Denby);
    assert.ok(view instanceof EventEmitter2);
  });

  it('should have a basic html element', function() {
    var view = new Denby();
    var element = view.element;
    assert.equal('DIV', element.tagName);
    assert.ok(element.hasAttribute('id'))
    assert.ok(element.id.match(/view-\d+/));
  });

  it('should be able to create a custom html element', function() {
    var view = new Denby({
      tag: 'section',
      id: 'rad',
      className: 'cool',
      attributes: { 'data-stuff': 'stuff' }
    });
    var element = view.element;
    assert.equal('SECTION', element.tagName);
    assert.ok(element.hasAttribute('id'))
    assert.equal('rad', element.id);
    assert.equal('cool', element.className);
    assert.ok(element.hasAttribute('data-stuff'));
    assert.ok('stuff', element.getAttribute('data-stuff'));
  });

  it('should merge class names when given an element with a class name', function() {
    var element = document.createElement('div');
    element.className = 'rad';
    var view = new Denby({ element: element, className: 'cool' });
    var element = view.element;

    assert.ok(DOM.hasClass(element, 'rad'));
    assert.ok(DOM.hasClass(element, 'cool'));
  });

  it('should emit a "render" event when rendered', function(done) {
    var view = new Denby();
    view.on('render', done);
    view.render();
  });

  describe('Custom view definitions', function() {
    it('should create an instance', function() {

      function View() {
        Denby.apply(this, arguments);
      }
      View.prototype = Object.create(Denby.prototype);

      var view = new View();
      assert.ok(view instanceof View);
      assert.ok(view instanceof Denby);
      assert.ok(view instanceof EventEmitter2);
    });

    it('should have a basic html element', function() {
      function View() {
        Denby.apply(this, arguments);
      }
      View.prototype = Object.create(Denby.prototype);

      var view = new View();
      var element = view.element;
      assert.equal('DIV', element.tagName);
      assert.ok(element.hasAttribute('id'))
      assert.ok(element.id.match(/view-\d+/));
    });

    it('should create a custom default html element', function() {
      function View() {
        Denby.apply(this, arguments);
      }
      View.prototype = Object.create(Denby.prototype, {
        options: {
          value: {
            tag: 'section',
            id: 'rad',
            className: 'cool',
            attributes: { 'data-stuff': 'stuff' }
          },
          configurable: true, writable: true
        }
      });

      var view = new View();
      var element = view.element;
      assert.equal('SECTION', element.tagName);
      assert.ok(element.hasAttribute('id'))
      assert.equal('rad', element.id);
      assert.equal('cool', element.className);
      assert.ok(element.hasAttribute('data-stuff'));
      assert.ok('stuff', element.getAttribute('data-stuff'));
    });

    it('should allow override of defaults', function() {
      function View() {
        Denby.apply(this, arguments);
      }
      View.prototype = Object.create(Denby.prototype, {
        options: {
          value: {
            tag: 'section',
            id: 'rad',
            className: 'cool',
            attributes: { 'data-stuff': 'stuff' }
          },
          configurable: true, writable: true
        }
      });

      // Override defaults on the instance:
      var view = new View({
        tag: 'div',
        id: 'RAD',
        className: 'COOL',
        attributes: {
          'data-stuff': 'stuff',
          'data-other-stuff': 'OTHER STUFF'
        }
      });

      var element = view.element;
      assert.equal('DIV', element.tagName);
      assert.equal('RAD', element.id);
      assert.equal('COOL', element.className);
      assert.ok(element.hasAttribute('data-stuff'));
      assert.ok(element.hasAttribute('data-other-stuff'));
      assert.ok('OTHER STUFF', element.getAttribute('data-other-stuff'));
    });

    it('should be extendable', function(done) {
      // 
      // DenbyMustache
      // 

      function DenbyMustache(options) {
        Denby.apply(this, arguments);
        this.template = this.options.template;
        this.partials = this.options.partials;

        if (this.options.hasOwnProperty('template'))
          delete this.options.template;

        if (this.options.hasOwnProperty('partials'))
          delete this.options.partials;
      }

      DenbyMustache.prototype = Object.create(Denby.prototype, {
        options: {
          value: {
            template: '',
            partials: {}
          },
          configurable: true, writable: true
        },
        render: {
          value: function(model) {
            // Find the model and convert it to JSON before possible:
            model = model || this.model;
            if (model.toJSON) model = model.toJSON();

            // Render the template with model data:
            this.element.innerHTML =
              Mustache.render(this.template, model || this.model, this.partials);

            // Call the parent render method:
            Denby.prototype.render.call(this, model);
          },
          configurable: true, writable: true
        }
      });

      // 
      // Widget
      // 

      function Widget(options) {
        DenbyMustache.apply(this, arguments);
      }

      Widget.prototype = Object.create(DenbyMustache.prototype, {
        options: {
          value: {
            template: '{{ title }}{{#items}}{{>item}}{{/items}}',
            partials: { item: '{{content}}' }
          },
          configurable: true, writable: true
        }
      });

      // 
      // Widget instance

      var widget = new Widget({
        model: {
          title: 'title',
          items: [{ content: "content1" }, { content: "content2" }]
        }
      });

      // Test that it still fires the render event:
      widget.on('render', function() {
        assert.equal('titlecontent1content2', widget.element.innerHTML)
        done();
      });

      widget.render();
    });
  });

  describe('DOM event handling', function() {
    it('should handle events declared on view defaults', function(done) {

      function View() {
        Denby.apply(this, arguments);
      }

      View.prototype = Object.create(Denby.prototype, {
        options: {
          value: {
            on: {
              'click': function() {
                done();
              }
            }
          },
          configurable: true, writable: true
        }
      });

      var view = new View();
      view.element.click();
    });

    it('should accept handlers which are functions', function(done) {
      var view = new Denby({
        on: {
          'click': function(e) {
            assert.ok(e instanceof MouseEvent);
            assert.equal(this, view);
            done();
          }
        }
      });
      view.element.click();
    });

    it('should accept handlers declared as a string', function(done) {
      function View() {
        Denby.apply(this, arguments);
      }
      View.prototype = Object.create(Denby.prototype, {
        options: {
          value: {},
          configurable: true, writable: true
        }
      });

      var view;

      View.prototype.awesome = function(e) {
        assert.ok(e instanceof MouseEvent);
        assert.equal(this, view);
        done();
      };

      view = new View({
        on: { 'click': 'awesome' }
      });

      view.element.click();
    });

    it('should work with event delegation', function(done) {
      var view = new Denby({
        on: {
          'click a': function(e) {
            e.stopPropagation();
            e.preventDefault();
            assert.ok(e instanceof MouseEvent);
            assert.equal(this, view);
            done();
            view.element.parentNode.removeChild(view.element);
          }
        }
      });

      document.body.appendChild(view.element);

      var link = DOM.create('a', { 'href': 'javascript:void(0)' });
      view.element.appendChild(link);
      link.click();
    });
  });
});
