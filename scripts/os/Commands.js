/**
 * Shell Commands
 */

define([
  'utils/rot13',
], function (rot13) {

  return {
    bluescreen: {
      description: '- Triggers a Blue Screen of Death',
      func: function () {
        _KernelInterface.trapError('User initiated bluescreen.');
        return false;
      }
    },

    clear: {
      description: '- Clears the screen and resets the cursor position.',
      func: function () {
        _StdIn.clearScreen();
        _StdIn.resetXY();
      },
      man: 'Clear: Clears the screen and resets the cursor position.'
    },

    date: {
      description: '[-d][-f][-t][-u][-v] - Displays the current date and time.',
      func: function (flag) {
        var now = new Date();
        var string;

        // parse the command line flags
        switch (flag) {
        // yyyy-mm-dd
        case '-d':
        case '--date':
          string = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
          break;
        // yyyy-mm-dd hh:mm:ss
        case undefined:
        case '-f':
        case '--full':
          string =
            now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() +' ' +
            now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
          break;
        // hh:mm:ss
        case '-t':
        case '--time':
          string = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
          break;
        case '-u':
        case '--utc':
          string = now.toUTCString();
          break;
        case '-v':
        case '--verbose':
          string = now.toLocaleString();
          break;
        default:
          string = 'Invalid options. See `man date`.';
        }

        _StdIn.putText(string);
      }
    },

    help: {
      description: '- This is the help command. Seek help.',
      func: function () {
        var command;
        _StdIn.putText("Commands:");
        for (command in this.commands) {
          _StdIn.advanceLine();
          _StdIn.putText('  ' + command + ' ' + this.commands[command].description);
        }
      },
      man: 'Help displays a list of (hopefully) valid commands.'
    },

    man: {
      description: '<topic> - Displays the MANual page for <topic>',
      func: function (topic) {
        if (topic) {
          if (this.commands.hasOwnProperty(topic) &&
              this.commands[topic].hasOwnProperty('man')) {
            this.commands[topic].man.split('\n').forEach(function (line) {
              _StdIn.advanceLine();
              _StdIn.putText(line);
            });
          } else {
            _StdIn.putText('No manual entry for ' + topic + '.');
          }
        } else {
          _StdIn.putText('Usage: man <topic>  Please supply a topic.');
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
          _StdIn.putText(string + " = '" + rot13(string) + "'");
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
        this.kernel.shutdown();
        // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
      }
    },

    status: {
      description: '[-r] | <status> - Set the OS status message',
      func: function (message) {
        switch (message) {
        case '-r':
        case '--reset':
          _Status.resetStatus();
          _StdIn.putText('OS status reset to default.');
          break;
        case undefined:
          _StdIn.putText('Usage: status <message>');
          break;
        default:
          _Status.setStatus(message);
          _StdIn.putText('OS status updated to "' + message + '".');
        }
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
        _StdIn.putText(APP_NAME + ': version ' + APP_VERSION);
      }
    },

    whereami: {
      description: '- Returns the location of the user',
      func: function () {
        if (navigator.geolocation) {
          _StdIn.putText('creeping... ');
          navigator.geolocation.getCurrentPosition(
            // success
            function (position) {
              _StdIn.putText('found you: ' + position.coords.latitude + ', ' + position.coords.longitude);
              this.advanceLine();
            }.bind(this),
            // error
            function (error) {
              _StdIn.putText('FAILWHALE');
              this.advanceLine();
            }.bind(this)
          );
        } else {
          _StdIn.putText('Home is where the heart is, so your real home\'s in your chest.');
        }
        return false;
      }
    }

    // processes - list the running processes and their IDs
    // kill <id> - kills the specified process id.
  };

});
