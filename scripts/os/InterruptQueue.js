define([
  'os/Queue',
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

      this.q.push(interrupt);
      this.prioritize();
    },

    prioritize: function () {
      this.q.sort(function (a, b) {
        return a.priority() - b.priority();
      });
    }

  });

  return InterruptQueue;

});