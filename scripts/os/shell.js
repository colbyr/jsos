/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) or interpreter for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

define([
  'os/Commands',
  'os/trace',
  'utils/rot13',
  'utils/trim',
  'utils/underscore'
], function (Commands, trace, rot13, trim) {

  var _kernel = null;

  function Shell() {
    this.promptStr = ">";
    this.commandList = [];
    this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies = "[sorry]";
  }

  _.extend(Shell.prototype, {

    execute: function (func, args) {
      // we just got a command, so advance the line... 
      _StdIn.advanceLine();
      // .. call the command function passing in the args...
      func.apply(Commands, args);
      // Check to see if we need to advance the line again
      if (_StdIn.CurrentXPosition > 0) {
        _StdIn.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    },

    handleInput: function (buffer) {
      trace("Shell Command~" + buffer);
      // Parse the input...
      var cmd = new _UserCommand(buffer);
      if (Commands[cmd.command]) {
        this.execute(Commands[cmd.command].func, cmd.args);
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd.toString()) + "]") >= 0) { // Check for curses.
          this.execute(_curse);
        } else if (this.apologies.indexOf("[" + cmd.command + "]") >= 0) { // Check for apoligies.
          this.execute(_apology);
        } else { // It's just a bad command.
          this.execute(_invalidCommand);
        }
      }
    },

    // TODO: really hate passing in a ref to the kernel like this
    init: function (kernel) {
      _kernel = kernel;
      // Display the initial prompt.
      this.putPrompt();
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
  // An "interior" or "private" class (prototype) used only inside Shell() (we hope).
  //
  function _ShellCommand() {
    // Properties
    this.command = "";
    this.description = "";
    this.function = "";
  }

  //
  // Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
  //
  function _UserCommand(buffer) {
    this.args = this.parseInput(buffer);
    this.command = this.args.shift();
  }

  _.extend(_UserCommand.prototype, {

    parseInput: function (string) {
      return _.reduce(
        trim(string).toLowerCase().split(" "),
        function (res, val) {
          if (val !== '') {
            res.push(val);
          }
          return res;
        },
        []
      );
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

  function _invalidCommand() {
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode) {
      _StdIn.putText("Duh. Go back to your Speak & Spell.");
    } else {
      _StdIn.putText("Type 'help' for, well... help.");
    }
  }

  return Shell;
});
