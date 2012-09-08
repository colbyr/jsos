/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

define(['utils/underscore'], function () {

  function Console() {
    this.buffer = '';
    this.CurrentFont = DEFAULT_FONT;
    this.CurrentFontSize = DEFAULT_FONT_SIZE;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = DEFAULT_FONT_SIZE;
    this.history = [];
    this.history_index = -1;

    // init
    this.clearScreen();
    this.resetXY();
  }

  _.extend(Console.prototype, {

    /**
     * Complete the current line and move the cursor to a new one
     *
     * @return void
     */
    advanceLine: function () {
      this.CurrentXPosition = 0;
      this.CurrentYPosition += DEFAULT_FONT_SIZE + FONT_HEIGHT_MARGIN;
      // TODO: Handle scrolling.
    },

    /**
     * Slices the last character off the buffer and removes it from the canvas
     *
     * @return void
     */
    backspace: function () {
      if (this.buffer.length > 0) {
        // get the character's left side x-coordinate
        this.clearLine(
          this.measure(this.buffer.slice(-1))
        );
        this.buffer = this.buffer.slice(0, -1);
      }
    },

    /**
     * clears a rectabgle of width x CurrentFontSize behide the cursor
     *
     * @param  double  width
     * @return void
     */
    clearLine: function (width) {
      var offset_x = this.CurrentXPosition - width;
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
    },

    /**
     * Clears the entire console
     *
     * @return void
     */
    clearScreen: function () {
      DRAWING_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
    },

    /**
     * Handles input in the _KernelInputQueue
     *
     * @return void
     */
    handleInput: function () {
      while (_KernelInputQueue.getSize() > 0) {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal"
        // (anything else that the keyboard device driver gave us).
        switch (chr) {
        case 8: // Backspace
          this.backspace();
          this.resetHistoryIndex();
          break;
        case 13: // Enter
          // The enter key marks the end of a console command, so ...
          // ... tell the shell ... 
          _OsShell.handleInput(this.buffer);
          // ... and reset our buffer.
          if (this.buffer !== this.history[0]) {
            this.history.unshift(this.buffer);
          }
          this.resetHistoryIndex();
          this.buffer = '';
          break;
        case 38: // Up
          this.previousCommand();
          break;
        case 40: // Down
          this.nextCommand();
          break;
        default:
          // This is a "normal" character, so ...
          // ... draw it on the screen...
          this.putText(chr);
          // ... and add it to our buffer.
          this.buffer += chr;
          this.resetHistoryIndex();
        }
      }
    },

    /**
     * Calculates the width of the given string in the canvas
     *
     * @param  string  the text in question
     * @return double
     */
    measure: function (text) {
      return DRAWING_CONTEXT.measureText(
        this.CurrentFont,
        this.CurrentFontSize,
        text
      );
    },

    /**
     * Replace the buffer with a more recent command in the history
     *
     * @return void
     */
    nextCommand: function () {
      if (this.history_index > -1) {
        this.history_index -= 1;
        this.clearLine(this.measure(this.buffer));
        this.buffer = this.history_index !== -1 ?
          this.history[this.history_index] :
          '';
        this.putText(this.buffer);
      }
    },

    /**
     * Replace the buffer with the previous command in the history
     *
     * @return void
     */
    previousCommand: function () {
      if (this.history.length > 0 &&
          this.history_index <= (this.history.length - 2)) {
        this.history_index += 1;
        this.clearLine(this.measure(this.buffer));
        this.buffer = this.history[this.history_index];
        this.putText(this.buffer);
      }
    },

    putText: function (txt) {
      // My first inclination here was to write two functions: putChar() and
      // putString(). Then I remembered that Javascript is (sadly) untyped and
      // it won't differentiate between the two. So rather than be like PHP and
      // write two (or more) functions that do the same thing, thereby
      // encouraging confusion and decreasing readability, I decided to write
      // one function and use the term "text" to connote string or char.
      if (txt !== '') {
        // Draw the text at the current X and Y coordinates.
        DRAWING_CONTEXT.drawText(
          this.CurrentFont,
          this.CurrentFontSize,
          this.CurrentXPosition,
          this.CurrentYPosition,
          txt
        );
        this.CurrentXPosition = this.CurrentXPosition + this.measure(txt);
      }
    },

    /**
     * Resets the history index to -1
     *
     * @return void
     */
    resetHistoryIndex: function () {
      this.history_index = -1;
    },

    /**
     * Resets the cursor
     *
     * @return void
     */
    resetXY: function () {
      this.CurrentXPosition = 0;
      this.CurrentYPosition = this.CurrentFontSize;
    }

  });

  return Console;

});
