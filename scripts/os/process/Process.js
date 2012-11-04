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
    this.cycles = 0;
    this.memory = _MemoryManager.allocateBlock();
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

    exit: function () {
      this.memory.deallocate();
    },

    offset: function (loc) {
      return loc + this.partition;
    },

    read: function (loc) {
      return this.memory.access(loc);
    },

    toString: function () {
      var pcb = this.pcb.registers;
      return this.pid +
        ' [' + pcb.pc +
         ' ' + pcb.acc +
         ' ' + pcb.xr +
         ' ' + pcb.yr +
         ' ' + pcb.zf + ']';
    },

    write: function (loc, data) {
      this.memory.write(loc, data);
    }

  });

  return Process;

});
