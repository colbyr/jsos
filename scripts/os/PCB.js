define([
  'vendor/underscore'
], function () {

  /**
   * Process ID counter
   *
   * @var int
   */
  var _pids = 0;

  /**
   * Returns a unique Process ID
   *
   * @return int
   */
  function _getPid() {
    _pids += 1;
    return _pids;
  }

  /**
   * Process Control Block
   */
  function PCB(program) {
    // process ID
    this.pid = _getPid();
    // memory manager
    this.memory = _MemoryManager.allocateBlock();
    // process status
    this.registers = {
      acc: 0,
      pc: 0,
      x: 0,
      y: 0,
      z: 0
    };

    // init
    this.memory.write(0, program);
  }

  _.extend(PCB.prototype, {

    get: function (index) {
      return this.memory.access(index);
    }

  });

  return PCB;

});