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
  var ERROR_PREFIX = 'CORE MEMORY: ';

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
    _memory.push(null);
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
    return loc > 0 && loc < MEMORY_SIZE;
  }

  /**
   * @private
   *
   * Trigger a kernel error
   *
   * @param  string  error message
   * @return void
   */
  function _error(msg) {
    throw new Error(CORE_MEMORY + msg);
  }

  /**
   * Public functions
   */
  return {

    /**
     * Access a single memory location
     *
     * @param  int  memory location
     * @return void
     */
    access: function (loc) {
      if (!_inbounds(loc)) {
        _error('invalid memory access');
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
      if (!_inbounds(loc)) {
        _error('invalid memory access');
      }

      return _memory.slice(locA, locB);
    },

    /**
     * Clears a single memory location
     *
     * @param  int  location to clear
     * @return void
     */
    clear: function (loc) {
      if (!_inbounds(loc)) {
        _error('invalid memory access');
      }

      _memory[loc] = null;
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
        _error('invalid memory access');
      }

      for (var i = locA; i <= locB; i += 1) {
        _memory[i] = null;
      }
    }

  };

});