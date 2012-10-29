define([
  'os/process/PCB',
  'vendor/underscore'
], function (PCB) {

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

  function Process(program) {
    this.memory = _MemoryManager.allocateBlock();
    this.partition = program.length;
    this.pcb = new PCB();
    this.pid = _getPid();
    this.valid = false;

    // init
    if (this.memory) {
      this.memory.write(0, program);
      this.valid = true;
    }
  }

  _.extend(Process.prototype, {

    offset: function (loc) {
      return loc + this.partition;
    },

    read: function (loc) {
      return this.memory.access(loc);
    },

    write: function (loc, data) {
      this.memory.write(loc, data);
    }

  });

  return Process;

});
