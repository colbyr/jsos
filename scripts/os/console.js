/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

define(['utils/underscore'], function () {

  function Console() {
    this.CurrentFont      = DEFAULT_FONT;
    this.CurrentFontSize  = DEFAULT_FONT_SIZE;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = DEFAULT_FONT_SIZE;
    this.buffer = '';
  }

  _.extend(Console.prototype, {

    backspace: function () {
      if (this.buffer.length > 0) {
        var offset_x = this.CurrentXPosition - DRAWING_CONTEXT.measureText(
          this.CurrentFont,
          this.CurrentFontSize,
          this.buffer.slice(-1)
        );
        // clear the character's canvas realestate
        DRAWING_CONTEXT.clearRect(
          offset_x,
          this.CurrentYPosition - this.CurrentFontSize,
          this.CurrentXPosition,
          this.CurrentYPosition + 1 // +1 for the leftovers on the bottom
        );
        // move the cursor back
        this.CurrentXPosition = offset_x;
        // pop the deleted character off the buffer
        this.buffer = this.buffer.slice(0, -1);
      }
    },

    init: function () {
      this.clearScreen();
      this.resetXY();
    },

    clearScreen: function () {
      DRAWING_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    },

    resetXY: function () {
      this.CurrentXPosition = 0;
      this.CurrentYPosition = this.CurrentFontSize;
    },

    handleInput: function () {
      while (_KernelInputQueue.getSize() > 0) {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
        if (chr === String.fromCharCode(13)) { // Enter key
          // The enter key marks the end of a console command, so ...
          // ... tell the shell ... 
          _OsShell.handleInput(this.buffer);
          // ... and reset our buffer.
          this.buffer = '';
        } else if(chr === String.fromCharCode(8)) {
          this.backspace();
        } else { // TODO: Write a case for Ctrl-C.
          // This is a "normal" character, so ...
          // ... draw it on the screen...
          this.putText(chr);
          // ... and add it to our buffer.
          this.buffer += chr;
        }
      }
    },

    putText: function (txt) {
      // My first inclination here was to write two functions: putChar() and putString().
      // Then I remembered that Javascript is (sadly) untyped and it won't differentiate 
      // between the two.  So rather than be like PHP and write two (or more) functions that
      // do the same thing, thereby encouraging confusion and decreasing readability, I 
      // decided to write one function and use the term "text" to connote string or char.
      if (txt !== "") {
        // Draw the text at the current X and Y coordinates.
        DRAWING_CONTEXT.drawText(
          this.CurrentFont,
          this.CurrentFontSize,
          this.CurrentXPosition,
          this.CurrentYPosition,
          txt
        );
        // Move the current X position.
        var offset = DRAWING_CONTEXT.measureText(
          this.CurrentFont,
          this.CurrentFontSize,
          txt
        );
        this.CurrentXPosition = this.CurrentXPosition + offset;
      }
    },

    advanceLine: function () {
      this.CurrentXPosition = 0;
      this.CurrentYPosition += DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
      // TODO: Handle scrolling.
    }
  });

  return Console;

});
