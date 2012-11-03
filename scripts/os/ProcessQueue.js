define([
  'os/process/Process'
], function (Process) {

  function _isPid(pid) {
    return typeof pid === 'number' && pid > 0;
  }

  /**
   * An FIFO queue of processes for CPU scheduler
   */
  function ProcessQueue() {
    this.q = [];
  }

  _.extend(ProcessQueue.prototype, {

    /**
     * Add a process to the queue
     *
     * @param Process
     */
    add: function (process) {
      if (!(process instanceof Process)) {
        throw new Error('ProcessQueue.add expects a Process');
      }

      this.q.push(process);
    },

    /**
     * Returns true if the process is in the queue
     *
     * @param  int
     * @return bool
     */
    contains: function (pid) {
      if (!_isPid(pid)) {
        throw new Error(
          'ProcessQueue.contains: "' + pid + '" is not a valid PID'
        );
      }

      return this.indexOf(pid) >= 0;
    },

    /**
     * Returns the index of process pid
     *
     * @param  int
     * @return int
     */
    indexOf: function (pid) {
      if (!_isPid(pid)) {
        throw new Error(
          'ProcessQueue.indexOf: "' + pid + '" is not a valid PID'
        );
      }

      for (var i = 0; i < this.q.length; i += 1) {
        if (this.q[i].pid === pid) {
          return i;
        }
      }
      return -1;
    },

    /**
     * Returns true if the queue is empty
     *
     * @return bool
     */
    isEmpty: function () {
      return this.q.length === 0;
    },

    /**
     * Returns the next process in the queue
     *
     * @return Process
     */
    next: function () {
      return this.isEmpty() ? null : this.q.pop();
    },

    /**
     * Removes a process from the queue
     *
     * @param  int
     * @return Process
     */
    remove: function (pid) {
      if (!_isPid(pid)) {
        throw new Error(
          'ProcessQueue.remove: "' + pid + '" is not a valid PID'
        );
      }

      var index = this.indexOf(pid);
      return index >= 0 ? this.q.splice(index, 1).pop() : null;
    },

    /**
     * Returns the length of the queue
     *
     * @return int
     */
    size: function () {
      return this.q.length;
    }

  });

  return ProcessQueue;

});