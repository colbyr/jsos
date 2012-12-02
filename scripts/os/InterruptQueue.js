define([
  'os/queue',
  'os/interrupts/Interrupt'
], function (Queue, Interrupt) {

  function InterruptQueue() {
    this.q = [];
  }

  _.extend(InterruptQueue.prototype, Queue.prototype, {

    enqueue: function (interrupt) {
      if (typeof interrupt.priority !== 'function') {
        throw new Error('InterruptQueue.enqueue expects an Interrupt');
      }

      // timestamp our interrupts to deal with inconsistent seach implementations
      interrupt.t = Date.now();

      this.q.unshift(interrupt);
      this.q.sort(function (a, b) {
        var i = a.priority() - b.priority();
        if (i === 0) {
          i = a.t - b.t;
        }
        return i;
      });
    }

  });

  return InterruptQueue;

});