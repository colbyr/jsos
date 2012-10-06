define([
  'os/MemoryManager',
  'vendor/underscore'
], function (MemoryManager) {

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
    return ++_pids;
  }

  /**
   * Process Control Block
   */
  function PCB(program) {
    // process ID
    this.pid = _getPid();
    // memory manager
    this.memory = MemoryManager.allocateBlock();
    // process status
    this.acc = 0;
    this.pc = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // init
    this.memory.write(0, program);
  }

  _.extend(PCB.prototype, {

    

  });

  return PCB;

});