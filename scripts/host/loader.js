define([
  'vendor/underscore'
], function () {

  /**
   * Matches HEX codes
   * e.g. A9 03 8D 41 00 A9 01
   *
   * @var regex
   */
  var _validator = /^([0-9A-F]{2} +)*[0-9A-F]{2}$/;

  /**
   * Controller for the program loader
   *
   * @param  function  a function to bind to a successful load
   * @return void
   */
  function Loader() {
    // onload bindings
    this.bindings = [];
    this.code = '';
    this.input = document.getElementById('code');
    this.wrapper = document.getElementById('loader');
    this.valid = true;

    // event listeners
    this.input.addEventListener('keyup', this.validate.bind(this));
  }

  _.extend(Loader.prototype, {

    clear: function () {
      this.input.value = '';
      this.code = '';
    },

    /**
     * Clears the invalid class from the modal
     *
     * @return void
     */
    clearInvalid: function () {
      this.wrapper.classList.remove('invalid');
    },

    /**
     * Retrieves the code from the form and replaces all blocks of whitespace
     * with a single space ' '
     *
     * @return strinj
     */
    getCode: function () {
      var result;
      if (this.valid && this.code !== '') {
        result = this.parse(this.code);
        this.clear();
      } else {
        result = null;
      }
      return result;
    },

    /**
     * Adds .invalid class to the modal
     *
     * @return void
     */
    markInvalid: function () {
      this.wrapper.classList.add('invalid');
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
     * Validates a string according tp the _validator regex
     *
     * @param  string
     * @return bool
     */
    validate: function () {
      this.code = this.input.value.replace(/\s+/g, ' ').trim();
      this.valid = _validator.test(this.code);
      if (this.valid) {
        this.clearInvalid();
      } else {
        this.markInvalid();
      }
    }

  });

  return Loader;

});