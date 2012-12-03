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
     * Returns the next process in the queue, removing it from the queue
     *
     * @return Process
     */
    next: function () {
      if (PRIORITY_SCHEDULING) {
        return this.nextByPriority();
      } else {
        return this.isEmpty() ? null : this.q.shift();
      }
    },

    /**
     * Returns the next process in the queue with the highest priority
     *
     * @return Process
     */
    nextByPriority: function () {
      var highest,
          res = null;
      if (!this.isEmpty()) {
        for (var i = 1, len = this.q.length; i < len; i++) {
          if (this.q[i].priority > this.q[highest].priority) {
            highest = i;
          }
        }
        res = this.q.splice(highest, 1);
      }
      return res;
    },

    /**
     * Returns the next process in the queue
     *
     * @param  int
     * @return Process
     */
    peek: function (pid) {
      return pid ? this.q[this.indexOf(pid)] : this.q[this.q.length - 1];
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
