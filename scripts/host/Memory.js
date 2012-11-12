/**
 * Core Memory Module
 *
 * Virtualization of the Host OS's memory
 */
define([
  'vendor/underscore'
], function () {

  /**
   * @private
   *
   * Prefix for all Core Memory errors
   *
   * @var string
   */
  var ERROR_PREFIX = 'CORE_MEMORY.';

  /**
   * @private
   *
   * # of bytes available
   *
   * @var int
   */
  var MEMORY_SIZE = 768;

  /**
   * @private
   *
   * The representation of memory
   *
   * @var array
   */
  var _memory = [];

  // initialize the memory block
  for (var i = 0; i < MEMORY_SIZE; i += 1) {
    _memory.push('00');
  }

  /**
   * @private
   *
   * Checks if a given location is in bounds
   *
   * @param  int  location in question
   * @return bool
   */
  function _inbounds(loc) {
    return loc >= 0 && loc < MEMORY_SIZE;
  }

  /**
   * @private
   *
   * Trigger a kernel error
   *
   * @param  string  error message
   * @return void
   */
  function _error(method, msg) {
    throw new Error(
      ERROR_PREFIX + method + ': ' + msg + ' ' + '[' +
      Array.prototype.slice.call(arguments, 2).toString() + ']'
    );
  }

  return {

    /**
     * Access a single memory location
     *
     * @param  int  memory location
     * @return void
     */
    access: function (loc) {
      if (!_inbounds(loc)) {
        _error('access', 'invalid memory access', loc);
      }

      return _memory[loc];
    },

    /**
     * Access a block of memory from locA up to and including locA
     *
     * @param  int  starting location
     * @param  int  ending location
     * @return void
     */
    accessBlock: function (locA, locB) {
      if (locA >= locB || !_inbounds(locA) || !_inbounds(locB)) {
        _error('accessBlock', 'invalid memory access', locA, locB);
      }

      return _memory.slice(locA, locB + 1);
    },

    dump: function () {
      return this.accessBlock(0, MEMORY_SIZE - 1);
    },

    /**
     * Clears a single memory location
     *
     * @param  int  location to clear
     * @return void
     */
    clear: function (loc) {
      if (!_inbounds(loc)) {
        _error('clear', 'invalid memory access', loc);
      }

      _memory[loc] = '00';
    },

    /**
     * Clears block of memory from locA up to and including locB
     *
     * @param  int  starting memory location
     * @param  int  ending memory location
     * @return void
     */
    clearBlock: function (locA, locB) {
      if (locA >= locB || !_inbounds(locA) || !_inbounds(locB)) {
        _error('clearBlock', 'invalid memory access', locA, locB);
      }

      for (var i = locA; i <= locB; i += 1) {
        _memory[i] = '00';
      }
    },

    /**
     * Returns size of main memory
     *
     * @return int
     */
    size: function () {
      return MEMORY_SIZE;
    },

    /**
     * Writes some data to a memory location
     *
     * @param  int    memory location
     * @param  mixed  value
     */
    write: function (loc, value) {
      if (!_inbounds(loc)) {
        _error('write', 'invalid memory access', loc, value);
      }

      _memory[loc] = value;
    },

    /**
     * Writes a block of data to memory starting a loc
     *
     * @param  int    begining memory location
     * @param  array  the data to be written
     */
    writeBlock: function (locA, block) {
      var locB = locA + block.length - 1;
      if (locA >= locB || !_inbounds(locA) || !_inbounds(locB)) {
        _error('writeBlock', 'invalid memory access', loc);
      }

      for (var i = locA; i <= locB; i += 1) {
        _memory[i] = block[i - locA];
      }
    }

  };

});