define([], function () {

  return {

    /**
     * Removes all values in LS
     *
     * @return object
     */
    clear: function () {
      window.localStorage.clear();
      return this;
    },

    /**
     * Returns true if key is set
     *
     * @param  string
     * @return bool
     */
    contains: function (key) {
      return window.localStorage.hasOwnProperty(key);
    },

    /**
     * Returns a key's value
     *
     * @param  string
     * @return string
     */
    get: function (key) {
      return window.localStorage.getItem(key);
    },

    /**
     * Returns the key of a value in LS
     *
     * @param  string
     * @return string
     */
    getKey: function (value) {
      return window.localStorage.key(value);
    },

    /**
     * Returns true if the browser supports LS
     *
     * @return bool
     */
    isSupported: function () {
      return !!window.localStorage;
    },

    /**
     * Returns an array of all keys in LS
     *
     * @return array
     */
    keys: function () {
      var keys = [];
      for (var k in window.localStorage) {
        keys.push(k);
      }
      return keys;
    },

    /**
     * Remove a key-value pair from LS
     *
     * @param  string
     * @return object
     */
    remove: function (key) {
      window.localStorage.removeItem(key);
      return this;
    },

    /**
     * Set a key-value pair
     *
     * @param  string
     * @param  string
     * @return object
     */
    set: function (key, value) {
      window.localStorage.setItem(key, value);
      return this;
    },

    /**
     * Returns an array of all values in LS
     *
     * @return array
     */
    values: function () {
      var values = [];
      for (var k in window.localStorage) {
        values.push(localStorage[k]);
      }
      return values;
    }

  };

});