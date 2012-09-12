/* ------------
   Shell.js

   The OS Shell - The 'command line interface" (CLI) or interpreter for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

define([
  'host/log',
  'os/Commands',
  'os/trace',
  'utils/rot13',
  'vendor/underscore'
], function (log, Commands, trace, rot13) {

  /**
   * Saying sorry...
   *
   * @return void
   */
  function _apology() {
    _StdIn.putText('Okay. I forgive you. This time.');
    _SarcasticMode = false;
  }

  /**
   * When you're in the mood for some punishent
   *
   * @return void
   */
  function _curse() {
    _StdIn.putText('Oh, so that\'s how it\'s going to be, eh? Fine.');
    _StdIn.advanceLine();
    _StdIn.putText('Bitch.');
    _SarcasticMode = true;
  }

  /**
   * Handles invalid commands
   *
   * @param  string
   */
  function _invalidCommand(command) {
    _StdIn.putText('Invalid Command. ');
    log('warning', 'OS', 'Invalid command - "' + command + '"');
    if (_SarcasticMode) {
      _StdIn.putText('Duh. Go back to your Speak & Spell.');
    } else {
      _StdIn.putText('Type "help" for, well... help.');
    }
  }

  /**
   * Handles user input and command execution
   *
   * @param  kernel
   */
  function Shell(kernel) {
    this.apologies = '[sorry]';
    this.commands = Commands;
    this.curses = '[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]';
    this.kernel = kernel;
    this.promptStr = '~> ';
    this.putPrompt();
  }

  _.extend(Shell.prototype, {

    /**
     * Advances the cursor to a new line
     *
     * @return void
     */
    advanceLine: function () {
      // Check to see if we need to advance the line again
      if (_StdIn.CurrentXPosition > 0) {
        _StdIn.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    },

    /**
     * Executes a Shell command
     *
     * @param  string  command name
     * @param  array   arguments to be passed
     * @return void
     */
    execute: function (func, args) {
      // we just got a command, so advance the line
      _StdIn.advanceLine();
      // .. call the command function passing in the args...
      if (func.apply(this, args) !== false) {
        this.advanceLine();
      }
    },

    /**
     * Handles user input on return
     *
     * @param  string
     * @return void
     */
    handleInput: function (buffer) {
      trace('Shell Command~' + buffer);
      if (buffer === '') { // advance the line and return
        this.advanceLine();
        return;
      }

      // Parse the input...
      var cmd = new UserCommand(buffer);
      if (this.commands[cmd.command]) {
        this.execute(this.commands[cmd.command].func, cmd.args);
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf('[' + rot13(cmd.toString()) + ']') >= 0) { // Check for curses.
          this.execute(_curse);
        } else if (this.apologies.indexOf('[' + cmd.command + ']') >= 0) { // Check for apoligies.
          this.execute(_apology);
        } else { // It's just a bad command.
          this.execute(_invalidCommand, [cmd.command]);
        }
      }
    },

    /**
     * Prints the prompt to the console
     *
     * @return void
     */
    putPrompt: function () {
      _StdIn.putText(this.promptStr);
    }

  });

  /**
   * User Command [private]
   * parses shell commands and arguments
   *
   * @param  string
   */
  function UserCommand(buffer) {
    this.args = this.parseInput(buffer);
    this.command = this.args.shift();
  }

  /**
   * Strips uneeded characters from parsed arguments
   *
   * @param  string
   * @return string
   */
  function _cleanArg(string) {
    return string.trim().replace(/"/g, '');
  }

  _.extend(UserCommand.prototype, {

    /**
     * Parses and cleans arguments into a fancy new array
     *
     * @param  string
     * @return array
     */
    parseInput: function (string) {
      return string.match(/("[^"]+"|[^"\s]+)([^\s]|$)/g).map(_cleanArg);
    },

    /**
     * Returns a string representation of the command
     *
     * @return string
     */
    toString: function () {
      return this.command;
    }

  });

  return Shell;
});
