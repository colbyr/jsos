/**
 * Shell Commands
 */

define([
  'utils/rot13',
], function (rot13) {

  return {
    cls: {
      description: '- Clears the screen and resets the cursor position.',
      func: function () {
        _StdIn.clearScreen();
        _StdIn.resetXY();
      }
    },

    help: {
      description: '- This is the help command. Seek help.',
      func: function () {
        _StdIn.putText("Commands:");
        for (var command in this) {
          _StdIn.advanceLine();
          _StdIn.putText(
            "  " + command +
            " " + this[command].description
          );
        }
      }
    },

    man: {
      description: '<topic> - Displays the MANual page for <topic>',
      func: function (topic) {
        if (topic) {
          switch (topic) {
            case "help": 
              _StdIn.putText(
                "Help displays a list of (hopefully) valid commands."
              );
              break;
            default:
              _StdIn.putText("No manual entry for " + topic + ".");
          }
        } else {
          _StdIn.putText("Usage: man <topic>  Please supply a topic.");
        }
      }
    },

    prompt: {
      description: '<string> - Sets the prompt.',
      func: function (string) {
        if (string) {
          _OsShell.promptStr = string;
        } else {
          _StdIn.putText("Usage: prompt <string>  Please supply a string.");
        }
      }
    },

    rot13: {
      description: '<string> - Does rot13 obfuscation on <string>',
      func: function (string) {
        if (string) {
          // Requires utils/rot13 for rot13() function
          _StdIn.putText(string + " = '" + rot13(string) +"'");
        } else {
          _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
        }
      }
    },

    shutdown: {
      description: '- Shuts down the virtual OS but leaves the underlying hardware simulation running',
      func: function () {
         _StdIn.putText("Shutting down...");
         // Call Kernal shutdown routine.
        _kernel.shutdown();
        // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
      }
    },

    trace: {
      description: '<on | off> - Turns the OS trace on or off.',
      func: function (toggle) {
        if (toggle) {
          switch (toggle) {
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
    },

    ver: {
      description: '- Displays the current version data.',
      func: function () {
        _StdIn.putText(APP_NAME + ' v' + APP_VERSION);
      }
    }

    // processes - list the running processes and their IDs
    // kill <id> - kills the specified process id.
  };

});
