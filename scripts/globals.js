/*jshint unused: false */

/* ------------
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation.)

   This code references page numbers in the text book:
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.
     ISBN 978-0-470-12872-5
   ------------ */

//
// Global Constants
//

// 'cause I was at a loss for a better name.
var APP_NAME = 'JSOS';
var APP_VERSION = '0.0.1';

// in ms, or milliseconds, so 1000 = 1 second.
var CPU_CLOCK_INTERVAL = 1;
var CPU_DEBUG_INTERVAL = 100;

var IDLE_THROTTLE = 10;

var DEBUG_MODE = false;

var RR_QUANTUM = 6;
var PRIORITY_SCHEDULING = false;

// Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var CREATE_PROCESS_IRQ = 2;
var RUN_PROCESS_IRQ = 3;
var EXIT_PROCESS_IRQ = 4;
var PRINT_IRQ = 5;
var CONTEXT_SWITCH_IRQ = 6;
var SHELL_RETURN_IRQ = 7;
var KILL_PROCESS_IRQ = 8;


//
// Global Variables
//

var _CPU = null;

// Page 23.
var _OSclock = 0;

// 0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Mode = 0;

// TODO: Fix the naming convention for these next five global vars.
// Initialized in hostInit()
var CANVAS = null;
// Initialized in hostInit()
var DRAWING_CONTEXT = null;
// Ignored, just a place-holder in this version.
var DEFAULT_FONT = 'sans';
var DEFAULT_FONT_SIZE = 13;
// Additional space added to font size when advancing a line.
var FONT_HEIGHT_MARGIN = 4;

// Default the OS trace to be on.

var _MemoryManager = null;

var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _Processes = null;
var _ReadyQueue = null;
var _Scheduler = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console = null;
var _OsShell = null;
var _Status = null;

// Kernel Interface
var _KernelInterface = null;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

/**
 * Global Device Driver Objects - page 12
 */
var krnKeyboardDriver = null;
