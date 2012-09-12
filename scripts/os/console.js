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
    this.lines = 0;
    this.max_lines = Math.floor(CANVAS.height / this.lineheight());

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
      if (this.lines < this.max_lines) {
        this.lines += 1;
        this.CurrentXPosition = 0;
        this.CurrentYPosition += this.lineheight();
      } else {
        DRAWING_CONTEXT.putImageData(this.getScreen(0, this.lineheight()), 0, 0);
        this.CurrentXPosition = 0;
      }
    },

    /**
     * Slices the last character off the buffer and removes it from the canvas
     *
     * @return void
     */
    backspace: function () {
      if (this.buffer.length > 0) {
        // get the character's left side x-coordinate
        this.clearLine(this.measure(this.buffer.slice(-1)));
        // slice the deleted character off the buffer
        this.buffer = this.buffer.slice(0, -1);
      }
    },

    /**
     * BSOD for kernel errors and the like
     *
     * @return void
     */
    blueScreen: function () {
      DRAWING_CONTEXT.fillStyle = 'blue';
      DRAWING_CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);
      DRAWING_CONTEXT.drawTextCenter(
        this.CurrentFont,
        this.CurrentFontSize,
        CANVAS.width / 2,
        CANVAS.height / 2,
        'you messed up bad',
        'white'
      );
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
        this.CurrentYPosition + 5 // +1 for the leftovers on the bottom
      );
      // reset the X cursor
      this.CurrentXPosition = offset_x;
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
     * Get image of the current canvas
     *
     * @param  number
     * @param  number
     * @param  number
     * @param  number
     * @return object  ImageData
     */
    getScreen: function (x1, y1, x2, y2) {
      x1 = x1 || 0;
      y1 = y1 || 0;
      x2 = x2 || CANVAS.width;
      y2 = y2 || CANVAS.height;
      return DRAWING_CONTEXT.getImageData(x1, y1, x2, y2);
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
          // ... and reset our buffer
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
     * Returns the lineheight (i.e. fontsize + margin)
     *
     * @return double
     */
    lineheight: function () {
      return this.CurrentFontSize + FONT_HEIGHT_MARGIN;
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

    /**
     * Draws some text at the current cursor position
     *
     * @param  string  text to be drawn
     * @return void
     */
    putText: function (txt) {
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
      this.lines = 1;
      this.CurrentXPosition = 0;
      this.CurrentYPosition = this.CurrentFontSize;
    }

  });

  return Console;

});
