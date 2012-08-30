/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation.)

   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
define([], function () {
  //
  // Global Constants
  //
  var Globals = {
    APP_NAME: "ColbOS",  // 'cause I was at a loss for a better name.
    APP_VERSION: "0.1",

    CPU_CLOCK_INTERVAL: 100,   // in ms, or milliseconds, so 1000: 1 second.

    TIMER_IRQ   : 0,  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority). 
                         // NOTE: The timer is different from hardware clock pulses. Don't confuse these.
    KEYBOARD_IRQ: 1,


    //
    // Global Variables
    //
    _CPU: null,

    _OSclock: 0,       // Page 23.

    _Mode: 0,   // 0: Kernel Mode, 1: User Mode.  See page 21.

    // TODO: Fix the naming convention for these next five global vars.
    CANVAS: null,              // Initialized in hostInit().
    DRAWING_CONTEXT: null,     // Initialized in hostInit().
    DEFAULT_FONT: "sans",      // Ignored, just a place-holder in this version.
    DEFAULT_FONT_SIZE: 13,     
    FONT_HEIGHT_MARGIN: 4,     // Additional space added to font size when advancing a line.

    // Default the OS trace to be on.
    _Trace: true,

    // OS queues
    _KernelInterruptQueue: null,
    _KernelBuffers: null,
    _KernelInputQueue: null,

    // Standard input and output
    _StdIn : null,
    _StdOut: null,

    // UI
    _Console: null,
    _OsShell: null,

    // At least this OS is not trying to kill you. (Yet.)
    _SarcasticMode: false,

    //
    // Global Device Driver Objects - page 12
    //
    krnKeyboardDriver: null
  };

  return Globals;
});
