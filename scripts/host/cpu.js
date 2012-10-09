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
    'A9': { // LDA - load acc with constant
      args: 1,
      func: function () {}
    },
    'AD': { // LDA - load acc from memory
      args: 2,
      func: function () {}
    },
    '8D': { // STA - store acc in memory
      args: 2,
      func: function () {}
    },
    '6D': { // ADC - add contents of the acc to a memory location
      args: 2,
      func: function () {}
    },
    'A2': { // LDX - load the x register with a constant
      args: 1,
      func: function () {}
    },
    'AE': { // LDX - load the x register from memory
      args: 2,
      func: function () {}
    },
    'A0': { // LDY - load the y register with a constant
      args: 1,
      func: function () {}
    },
    'AC': { // LDY - load the y register from memory
      args: 2,
      func: function () {}
    },
    'EA': { // NOP - no operation
      args: 0,
      func: function () {}
    },
    '00': { // BRK - Break (really a system call)
      args: 0,
      func: function () {}
    },
    'EC': { // CPX - compare byte in mem to the XR (set Z flagto zero if equal)
      args: 2,
      func: function () {}
    },
    'D0': { // BNE - branch X bytes if Z-flag = 0
      args: 1,
      func: function () {}
    },
    'EE': { // INC - incrememt the value of a byte
      args: 2,
      func: function () {}
    },
    'FF': { // SYS - system call loaded from X-reg
      args: 0,
      func: function () {}
    }
  };

  function _exec(inst) {
      _StdIn.putText(inst);
      _StdIn.advanceLine();
  }

  function CPU() {
    this.isExecuting = false;
    this.process = null;
    this.registers = {
      pc:  0, // Program Counter
      acc: 0, // Accumulator
      xr:  0, // X register
      yr:  0, // Y register
      zf:  0  // Z-ero flag (Think of it as "isZero".)
    };
  }

  _.extend(CPU.prototype, {

    cycle: function () {
      trace('CPU cycle');
      // TODO: Accumulate CPU usage and profiling statistics here.
      // Do real work here. Set this.isExecuting appropriately.
      var inst = this.process.inst(this.registers.pc);
      if (inst) {
        // TODO: make an output interrupt
        this.registers.pc += 1;
      } else {
        this.exitProcess();
      }
    },

    execute: function (process) {
      this.resetRegisters();
      this.process = process;
      this.isExecuting = true;
    },

    exitProcess: function () {
      this.isExecuting = false;
      this.process = null;
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
