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
  'os/interrupts/ExitProcessInterrupt',
  'os/trace',
  'vendor/underscore'
], function (ExitProcessInterrupt, trace) {

  var OPCODES = {
  };

  function CPU() {
    this.isExecuting = false;
    this.process = null;
    this.registers = {
      pc:    0, // Program Counter
      acc:   0, // Accumulator
      xreg:  0, // X register
      yreg:  0, // Y register
      zflag: 0  // Z-ero flag (Think of it as "isZero".)
    };
  }

  _.extend(CPU.prototype, {

    cycle: function () {
      trace('CPU cycle');
      // TODO: Accumulate CPU usage and profiling statistics here.
      // Do real work here. Set this.isExecuting appropriately.
      var inst = this.process.get(this.registers.pc);
      _StdIn.putText(inst);
      _StdIn.advanceLine();
      this.registers.pc += 1;
      if (inst === 'FF') {
        this.exitProcess();
      }
    },

    execute: function (process) {
      this.process = process;
      this.isExecuting = true;
    },

    exitProcess: function () {
      this.resetRegisters();
      this.isExecuting = false;
      _KernelInterruptQueue.enqueue(new ExitProcessInterrupt());
    },

    resetRegisters: function () {
      for (var k in this.registers) {
        this.registers[k] = 0;
      }
    }

  });

  return CPU;
});
