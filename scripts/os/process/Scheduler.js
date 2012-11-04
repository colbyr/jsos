define([
  'os/interrupts/ContextSwitchInterrupt',
  'os/interrupts/ShellReturnInterrupt'
], function (ContextSwitchInterrupt, ShellReturnInterrupt) {

  var DEFAULT_QUANTUM = 7;

  function Scheduler(cpu, ready, interrupt_queue, quantum) {
    this.cpu = cpu;
    this.iq = interrupt_queue;
    this.quantum = quantum || DEFAULT_QUANTUM;
    this.ready = ready;
    this.is_running = false;
    this.running = null;
    this.running_for = 0;
  }

  _.extend(Scheduler.prototype, {

    atLimit: function () {
      return this.running_for >= this.quantum;
    },

    check: function () {
      if (this.shouldSwitch()) {
        this.send(this.ready.peek().pid);
        this.reset();
      } else if (this.is_running && this.ready.isEmpty()) {
        this.finish();
      }
    },

    finish: function () {
      this.is_running = false;
      console.log('finish');
      this.iq.enqueue(
        new ShellReturnInterrupt()
      );
    },

    inc: function () {
      this.running_for += 1;
    },

    reset: function () {
      this.running_for = 0;
    },

    send: function (pid) {
      this.iq.enqueue(
        new ContextSwitchInterrupt({
          pid: pid
        })
      );
    },

    setQuantum: function (quantum) {
      this.quantum = quantum;
    },

    shouldSwitch: function () {
      return (this.atLimit() || !this.cpu.isExecuting) && !this.ready.isEmpty();
    },

    start: function () {
      this.is_running = true;
      this.send(this.ready.peek().pid);
    }

  });

  return Scheduler;

});