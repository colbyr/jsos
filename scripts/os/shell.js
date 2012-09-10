/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) or interpreter for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

define([
  'host/log',
  'os/Commands',
  'os/trace',
  'utils/rot13',
  'utils/trim',
  'utils/underscore'
], function (log, Commands, trace, rot13, trim) {

  function Shell(kernel) {
    this.apologies = "[sorry]";
    this.commands = Commands;
    this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.kernel = kernel;
    this.promptStr = "~> ";
    this.putPrompt();
  }

  _.extend(Shell.prototype, {

    advanceLine: function () {
      // Check to see if we need to advance the line again
      if (_StdIn.CurrentXPosition > 0) {
        _StdIn.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    },

    execute: function (func, args) {
      // we just got a command, so advance the line... 
      _StdIn.advanceLine();
      // .. call the command function passing in the args...
      if (func.apply(this, args) !== false) {
        this.advanceLine();
      }
    },

    handleInput: function (buffer) {
      trace("Shell Command~" + buffer);
      if (buffer === '') { // advance the line and return
        this.advanceLine();
        return;
      }

      // Parse the input...
      var cmd = new _UserCommand(buffer);
      if (this.commands[cmd.command]) {
        this.execute(this.commands[cmd.command].func, cmd.args);
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd.toString()) + "]") >= 0) { // Check for curses.
          this.execute(_curse);
        } else if (this.apologies.indexOf("[" + cmd.command + "]") >= 0) { // Check for apoligies.
          this.execute(_apology);
        } else { // It's just a bad command.
          this.execute(_invalidCommand, [cmd.command]);
        }
      }
    },

    putPrompt: function () {
      _StdIn.putText(this.promptStr);
    }

  });

  //
  // The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
  // as they are not denoted in the constructor.  The idea is that you cannot execute them from
  // elsewhere as shell.xxx .  In a better world, and a more perfect Javascript, we'd be 
  // able to make then private.  (Actually, we can. Someone look at Crockford's stuff and give me the details, please.)
  //

  //
  // Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
  //
  function _UserCommand(buffer) {
    this.args = this.parseInput(buffer);
    this.command = this.args.shift();
  }

  function _cleanArg(string) {
    return string.trim().replace(/"/g, '');
  }

  _.extend(_UserCommand.prototype, {

    parseInput: function (string) {
      return string.match(/("[^"]+"|[^"\s]+)([^\s]|$)/g).map(_cleanArg);
    },

    toString: function () {
      return this.command;
    }

  });


  //
  // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
  //
  function _apology() {
    _StdIn.putText("Okay. I forgive you. This time.");
    _SarcasticMode = false;
  }


  function _curse() {
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
  }

  function _invalidCommand(command) {
    _StdIn.putText("Invalid Command. ");
    log('warning', 'OS', 'Invalid command - "' + command + '"');
    if (_SarcasticMode) {
      _StdIn.putText("Duh. Go back to your Speak & Spell.");
    } else {
      _StdIn.putText("Type 'help' for, well... help.");
    }
  }

  return Shell;
});
