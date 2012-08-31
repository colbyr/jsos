/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) or interpreter for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

define([
  'os/trace',
  'utils/rot13',
  'utils/trim',
  'utils/underscore'
], function (trace, rot13, trim) {

  var _kernel = null;

  function Shell() {
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
  }

  _.extend(Shell.prototype, {

    execute: function (fn, args) {
      // we just got a command, so advance the line... 
      _StdIn.advanceLine();
      // .. call the command function passing in the args...
      fn(args);
      // Check to see if we need to advance the line again
      if (_StdIn.CurrentXPosition > 0) {
        _StdIn.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    },

    handleInput: function (buffer) {
      trace("Shell Command~" + buffer);
      // 
      // Parse the input...
      //
      var userCommand = new _UserCommand();
      userCommand = this.parseInput(buffer);
      // ... and assign the command and args to local variables.
      var cmd = userCommand.command;
      var args = userCommand.args;
      //
      // Determine the command and execute it.
      //
      // Javascript may not support associative arrays (one of the few nice features of PHP, actually)
      // so we have to iterate over the command list in attempt to find a match.  TODO: Is there a better way?
      var index = 0;
      var fn = null;
      while (!fn && index < this.commandList.length) {
        if (this.commandList[index].command === cmd) {
          fn = this.commandList[index].function;
        } else {
          ++index;
        }
      }
      if (fn) {
        this.execute(fn, args);
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0) { // Check for curses.
          this.execute(shellCurse);
        } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apoligies.
          this.execute(_apology);
        } else { // It's just a bad command.
          this.execute(_invalidCommand);
        }
      }
    },

    // TODO: really hate passing in a ref to the kernel like this
    init: function (kernel) {
      var sc = null;
      _kernel = kernel;
      //
      // Load the command list.

      // ver
      sc = new _ShellCommand();
      sc.command = "ver";
      sc.description = "- Displays the current version data."
      sc.function = _ver;
      this.commandList[this.commandList.length] = sc;

      // help
      sc = new _ShellCommand();
      sc.command = "help";
      sc.description = "- This is the help command. Seek help."
      sc.function = _help;
      this.commandList[this.commandList.length] = sc;

      // shutdown
      sc = new _ShellCommand();
      sc.command = "shutdown";
      sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running."
      sc.function = _shutdown;
      this.commandList[this.commandList.length] = sc;

      // cls
      sc = new _ShellCommand();
      sc.command = "cls";
      sc.description = "- Clears the screen and resets the cursosr position."
      sc.function = _cls;
      this.commandList[this.commandList.length] = sc;

      // man <topic>
      sc = new _ShellCommand();
      sc.command = "man";
      sc.description = "<topic> - Displays the MANual page for <topic>.";
      sc.function = _man;
      this.commandList[this.commandList.length] = sc;

      // trace <on | off>
      sc = new _ShellCommand();
      sc.command = "trace";
      sc.description = "<on | off> - Turns the OS trace on or off.";
      sc.function = _trace;
      this.commandList[this.commandList.length] = sc;

      // rot13 <string>
      sc = new _ShellCommand();
      sc.command = "rot13";
      sc.description = "<string> - Does rot13 obfuscation on <string>.";
      sc.function = _rot13;
      this.commandList[this.commandList.length] = sc;

      // prompt <string>
      sc = new _ShellCommand();
      sc.command = "prompt";
      sc.description = "<string> - Sets the prompt.";
      sc.function = _prompt;
      this.commandList[this.commandList.length] = sc;

      // processes - list the running processes and their IDs
      // kill <id> - kills the specified process id.

      //
      // Display the initial prompt.
      this.putPrompt();
    },

    parseInput: function (buffer) {
      var retVal = new _UserCommand();
      //
      // 1. Remove leading and trailing spaces.
      buffer = trim(buffer);
      // 2. Lower-case it.
      buffer = buffer.toLowerCase();
      // 3. Separate on spaces so we can determine the command and command-line args, if any.
      var tempList = buffer.split(" ");
      // 4. Take the first (zeroth) element and use that as the command.
      var cmd = tempList.shift();  // Yes, you can do that to an array in Javascript.  See the Queue class.
      // 4.1 Remove any left-over spaces.
      cmd = trim(cmd);
      // 4.2 Record it in the return value.
      retVal.command = cmd;
      //
      // 5. Now create the args array from what's left.
      for (var i in tempList) {
        var arg = trim(tempList[i]);
        if (arg != "") {
          retVal.args[retVal.args.length] = tempList[i];
        }
      }
      return retVal;
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
  function _UserCommand() {
    // Properties
    this.command = "";
    this.args = [];
  }


  //
  // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
  //
  function _apology() {
    _StdIn.putText("Okay. I forgive you. This time.");
    _SarcasticMode = false;
  }

  function _cls(args) {
    _StdIn.clearScreen();
    _StdIn.resetXY();
  }

  function _curse() {
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
  }

  function _help(args) {
    _StdIn.putText("Commands:");
    for (i in _OsShell.commandList) {
      _StdIn.advanceLine();
      _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
    }
  }

  function _invalidCommand() {
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode) {
      _StdIn.putText("Duh. Go back to your Speak & Spell.");
    } else {
      _StdIn.putText("Type 'help' for, well... help.");
    }
  }

  function _man(args) {
    if (args.length > 0) {
      var topic = args[0];
      switch (topic) {
        case "help": 
          _StdIn.putText("Help displays a list of (hopefully) valid commands.");
          break;
        default:
          _StdIn.putText("No manual entry for " + args[0] + ".");
      }
    } else {
      _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
  }

  function _prompt(args) {
    if (args.length > 0) {
      _OsShell.promptStr = args[0];
    } else {
      _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
  }

  function _rot13(args) {
    if (args.length > 0) {
      _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    } else {
      _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
  }

  function _shutdown(args) {
     _StdIn.putText("Shutting down...");
     // Call Kernal shutdown routine.
    _kernel.shutdown();   
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
  }

  function _trace(args)
  {
    if (args.length > 0) {
      var setting = args[0];
      switch (setting) {
        case "on": 
          if (_Trace && _SarcasticMode) {
            _StdIn.putText("Trace is already on, dumbass.");
          } else {
            _Trace = true;
            _StdIn.putText("Trace ON");
          }
          break;
        case "off": 
          _Trace = false;
          _StdIn.putText("Trace OFF");
          break;
        default:
          _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
      }
    } else {
      _StdIn.putText("Usage: trace <on | off>");
    }
  }

  function _ver(args) {
    _StdIn.putText(APP_NAME + " version " + APP_VERSION);    
  }

  return Shell;
});
