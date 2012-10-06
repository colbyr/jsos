/* ------------
   CPU.js

   Requires global.js.

   Routines for the host CPU simulation, NOT for the OS itself.
   In this manner, it's A LITTLE BIT like a hypervisor, in that the Document
   envorinment inside a browser is the "bare metal" (so to speak) for which we
   write code that hosts our client OS. But that analogy only goes so far, and
   the lines are blurred, because we are using JavaScript in both the host and
   client environments.

   This code references page numbers in the text book:
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne
     ISBN 978-0-470-12872-5
   ------------ */

define([
  'os/trace',
  'vendor/underscore'
], function (trace) {

  var OPCODES = {
  };

  function CPU() {
    this.PC    = 0;     // Program Counter
    this.Acc   = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
  }

  _.extend(CPU.prototype, {

    cycle: function () {
      trace('CPU cycle');
      // TODO: Accumulate CPU usage and profiling statistics here.
      // Do real work here. Set this.isExecuting appropriately.
    },

    pulse: function () {
      // TODO: Do we need this?  Probably not.
    },

    reset: function () {
      this.PC    = 0;     // Program Counter
      this.Acc   = 0;     // Accumulator
      this.Xreg  = 0;     // X register
      this.Yreg  = 0;     // Y register
      this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
      this.isExecuting = false;
    }

  });

  return CPU;
});
