/* ------------
   Queue.js

   A simple Queue, which is really just a dressed-up Javascript Array.
   See the Javascript Array documentation at http://www.w3schools.com/jsref/jsref_obj_array.asp .
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

define(['utils/underscore'], function () {

  function Queue() {
    this.q = [];
  }

  _.extend(Queue.prototype, {

    getSize: function() {
      return this.q.length;
    },

    isEmpty: function() {
      return (this.q.length == 0);
    },

    enqueue: function(element) {
      this.q.push(element);
    },

    dequeue: function() {
      var retVal = null;
      if (this.q.length > 0)
      {
          retVal = this.q.shift();
      }
      return retVal;
    },

    toString: function() {
      retVal = "";
      for (i in this.q) {
        retVal += "[" + this.q[i] + "] ";
      }
      return retVal;
    }

  });

  return Queue;
});
