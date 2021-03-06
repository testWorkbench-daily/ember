import { classify, dasherize } from '@ember/string';
import { A as emberA, typeOf, Namespace, Object as EmberObject } from '@ember/-internals/runtime';
import { getOwner } from '@ember/-internals/owner';

/**
@module @ember/debug
*/

/**
  The `ContainerDebugAdapter` helps the container and resolver interface
  with tools that debug Ember such as the
  [Ember Inspector](https://github.com/emberjs/ember-inspector)
  for Chrome and Firefox.

  This class can be extended by a custom resolver implementer
  to override some of the methods with library-specific code.

  The methods likely to be overridden are:

  * `canCatalogEntriesByType`
  * `catalogEntriesByType`

  The adapter will need to be registered
  in the application's container as `container-debug-adapter:main`.

  Example:

  ```javascript
  Application.initializer({
    name: "containerDebugAdapter",

    initialize(application) {
      application.register('container-debug-adapter:main', require('app/container-debug-adapter'));
    }
  });
  ```

  @class ContainerDebugAdapter
  @extends EmberObject
  @since 1.5.0
  @public
*/
export default EmberObject.extend({
  init() {
    this._super(...arguments);

    this.resolver = getOwner(this).lookup('resolver-for-debugging:main');
  },

  /**
    The resolver instance of the application
    being debugged. This property will be injected
    on creation.

    @property resolver
    @default null
    @public
  */
  resolver: null,

  /**
    Returns true if it is possible to catalog a list of available
    classes in the resolver for a given type.

    @method canCatalogEntriesByType
    @param {String} type The type. e.g. "model", "controller", "route".
    @return {boolean} whether a list is available for this type.
    @public
  */
  canCatalogEntriesByType(type) {
    if (type === 'model' || type === 'template') {
      return false;
    }

    return true;
  },

  /**
    Returns the available classes a given type.

    @method catalogEntriesByType
    @param {String} type The type. e.g. "model", "controller", "route".
    @return {Array} An array of strings.
    @public
  */
  catalogEntriesByType(type) {
    let namespaces = emberA(Namespace.NAMESPACES);
    let types = emberA();
    let typeSuffixRegex = new RegExp(`${classify(type)}$`);

    namespaces.forEach((namespace) => {
      for (let key in namespace) {
        if (!Object.prototype.hasOwnProperty.call(namespace, key)) {
          continue;
        }
        if (typeSuffixRegex.test(key)) {
          let klass = namespace[key];
          if (typeOf(klass) === 'class') {
            types.push(dasherize(key.replace(typeSuffixRegex, '')));
          }
        }
      }
    });
    return types;
  },
});
