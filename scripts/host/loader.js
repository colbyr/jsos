define([
  'utils/underscore'
], function () {

  /**
   * Matches HEX codes
   * e.g. A9 03 8D 41 00 A9 01
   *
   * @var regex
   */
  var _validator = /^([0-9A-F]{2} +)+[0-9A-F]{2}$/;

  /**
   * Event handler for the cancel button - clears form and hides the dialog
   *
   * @param  Event
   * @return void
   */
  function _cancel(e) {
    e.preventDefault();
    this.close();
  }

  /**
   * Executes submission bindings
   *
   * @param  string  the code submitted
   * @return void
   */
  function _executeBindings(code) {
    if (this.bindings.length > 0) {
      this.bindings.forEach(function (func) {
        func(code);
      });
    }
  }

  /**
   * Event handler for code submission - validates code and executes bindings
   *
   * @param  Event
   * @return void
   */
  function _submit(e) {
    var code = this.getCode();

    e.preventDefault();
    if (this.validate(code)) {
      this.close();
      _executeBindings.bind(this)(this.parse(code));
    } else {
      this.markInvalid();
    }
  }

  /**
   * Controller for the program loader
   *
   * @param  function  a function to bind to a successful load
   * @return void
   */
  function Loader(toBind) {
    // onload bindings
    this.bindings = [];

    // cache the DOM elements
    this.cancel_btn = document.getElementById('cancel_load');
    this.form = document.getElementById('loader');
    this.input = document.getElementById('code');
    this.wrapper = document.getElementById('loader_wrapper');

    // event listeners
    this.cancel_btn.addEventListener('click', _cancel.bind(this));
    this.form.addEventListener('submit', _submit.bind(this));

    // if its there, bind the toBind function
    if (toBind) {
      this.bind(toBind);
    }
  }

  _.extend(Loader.prototype, {

    /**
     * Bind a function to a successful load
     *
     * @param  function
     * @return void
     */
    bind: function (func) {
      if (!func || typeof func !== 'function') {
        throw new Error('Loader.bind expects a function');
      }

      this.bindings.push(func);
    },

    /**
     * Clears the invalid class from the modal
     *
     * @return void
     */
    clearInvalid: function () {
      this.wrapper.className = '';
    },

    /**
     * Close the loading modal
     *
     * @return void
     */
    close: function () {
      this.hide();
      this.clearInvalid();
      this.input.value = '';
    },

    /**
     * Retrieves the code from the form and replaces all blocks of whitespace
     * with a single space ' '
     *
     * @return string
     */
    getCode: function () {
      return this.input.value.replace(/\s+/g, ' ').trim();
    },

    /**
     * Hides the loader form
     *
     * @return void
     */
    hide: function () {
      this.wrapper.style.display = 'none';
    },

    /**
     * Adds .invalid class to the modal
     *
     * @return void
     */
    markInvalid: function () {
      this.wrapper.className = 'invalid';
    },

    /**
     * Parses an array of instructions from a code string
     *
     * @param  string  code in question
     * @return array
     */
    parse: function (code) {
      return code.split(' ');
    },

    /**
     * Displays the loader form
     *
     * @return void
     */
    show: function () {
      this.wrapper.style.display = 'block';
    },

    /**
     * Validates a string according tp the _validator regex
     *
     * @param  string
     * @return bool
     */
    validate: function (code) {
      return _validator.test(code);
    }

  });

  return Loader;

});