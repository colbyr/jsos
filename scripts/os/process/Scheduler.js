define([
  'os/interrupts/ContextSwitchInterrupt',
  'os/interrupts/ShellReturnInterrupt',
  'os/trace'
], function (ContextSwitchInterrupt, ShellReturnInterrupt, trace) {

  /**
   * Time Quantum in Clock Ticks
   *
   * @var  int
   */
  var DEFAULT_QUANTUM = 7;

  var TYPES = {
    rr: {
      check: function () {
        return (this.atLimit() || !this.cpu.isExecuting) && !this.ready.isEmpty();
      },
      set: function () {
        PRIORITY_SCHEDULING = false;
      }
    },

    fcfs: {
      check: function () {
        return !this.cpu.isExecuting && !this.ready.isEmpty();
      },
      set: function () {
        PRIORITY_SCHEDULING = false;
      }
    },

    priority: {
      check: function () {
        return !this.cpu.isExecuting && !this.ready.isEmpty();
      },
      set: function () {
        PRIORITY_SCHEDULING = true;
      }
    }
  };

  /**
   * Round Robin CPU Scheduler
   *
   * @param  object  CPU
   * @param  object  Ready Queue
   * @param  object  Interrupt Queue
   * @param  int     Quantum
   */
  function Scheduler(cpu, ready, interrupt_queue, quantum) {
    this.cpu = cpu;
    this.first = false;
    this.iq = interrupt_queue;
    this.is_running = false;
    this.quantum = quantum || DEFAULT_QUANTUM;
    this.ready = ready;
    this.running = null;
    this.running_for = 0;
    this.type = 'rr';
  }

  _.extend(Scheduler.prototype, {

    /**
     * Returns true if current process has exceeded the execution quantum
     *
     * @return bool
     */
    atLimit: function () {
      return this.running_for >= this.quantum;
    },

    /**
     * Initiates a context switch if necessary
     */
    check: function () {
      if (this.shouldSwitch()) {
        this.send(this.ready.peek().pid);
        this.reset();
      }
    },

    /**
     * Returns control to the shell
     */
    finish: function () {
      this.is_running = false;
      trace('Scheduler: All processes complete');
      this.iq.enqueue(
        new ShellReturnInterrupt()
      );
    },

    /**
     * Incrememnt the running time
     */
    inc: function () {
      this.running_for += 1;
    },

    /**
     * Reset the running time
     */
    reset: function () {
      this.running_for = 0;
    },

    /**
     * send a context switch interrupt
     */
    send: function (pid) {
      trace('Scheduler: initiated context switch to process ' + pid);
      this.iq.enqueue(
        new ContextSwitchInterrupt({
          pid: pid
        })
      );
    },

    /**
     * Set the clock tick quantum
     */
    setQuantum: function (quantum) {
      trace(
        'Scheduler: quantum changed from ' + this.quantum + ' to ' + quantum
      );
      this.quantum = quantum;
    },

    /**
     * Set the scheduling method
     *
     * @param  string  type
     * @return bool    true if type exists
     */
    setType: function (type) {
      var typeExists = TYPES.hasOwnProperty(type);
      if (typeExists) {
        this.type = type;
        TYPES[type].set.call(this);
      }
      return typeExists;
    },

    /**
     * Returns true a context switch is necessary
     *
     * @return bool
     */
    shouldSwitch: function () {
      var should = TYPES[this.type].check.call(this) && !this.first;
      if (this.first) {
        this.first = false;
      }
      return should;
    },

    /**
     * Kicks off a scheduling session
     */
    start: function () {
      trace('Scheduler: start executing ready queue');
      this.first = true;
      this.is_running = true;
      this.send(this.ready.peek().pid);
    }

  });

  return Scheduler;

});