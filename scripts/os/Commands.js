/**
 * Shell Commands
 */

define([
  'host/Sim',
  'os/interrupts/CreateProcessInterrupt',
  'os/interrupts/RunProcessInterrupt',
  'utils/Date',
  'utils/rot13'
], function (Sim, CreateProcessInterrupt, RunProcessInterrupt, Date, rot13) {

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
        var date;

        // parse the command line flags
        switch (flag) {
          // yyyy-mm-dd
          case '-d':
          case '--date':
            date = now.date();
            break;
          // yyyy-mm-dd hh:mm:ss
          case undefined:
          case '-f':
          case '--full':
            date = now.full();
            break;
          // hh:mm:ss
          case '-t':
          case '--time':
            date = now.time();
            break;
          case '-u':
          case '--utc':
            date = now.utc();
            break;
          case '-v':
          case '--verbose':
            date = now.local();
            break;
          default:
            date = 'Invalid options. See `man date`.';
        }

        _StdIn.putText(date);
      }
    },

    help: {
      description: '- This is the help command. Seek help.',
      func: function () {
        var command;
        _StdIn.putText('Commands:');
        for (command in this.commands) {
          _StdIn.advanceLine();
          _StdIn.putText('  ' + command + ' ' + this.commands[command].description);
        }
      },
      man: 'Help displays a list of (hopefully) valid commands.'
    },

    jobs: {
      description: '- Diplays all processes',
      func: function () {
        _.each(_Processes.q, function (process) {
          _StdIn.putText(
            process.pid + ' - CPU cycles: ' + process.cycles
          );
          _StdIn.advanceLine();
        });
      }
    },

    kill: {
      description: '<pid> - Terminate a process',
      func: function (pid) {
        pid = parseInt(pid);
        if (pid && _Processes.contains(pid)) {
          _Processes.remove(pid).exit();
          _ReadyQueue.remove(pid);
          _StdIn.putText('Process ' + pid + ' terminated');
        } else if (pid) {
          _StdIn.putText('Process ' + pid + ' does not exist');
        } else {
          _StdIn.putText('Usage: kill <pid>');
        }
      }
    },

    load: {
      description: '- Loads validated 6502a op codes from the loader into memory and returns the PID.',
      func: function () {
        var code = Sim.loadCode();
        if (code) {
          _KernelInterruptQueue.enqueue(new CreateProcessInterrupt({
            program: code
          }));
          return false;
        } else {
          _StdIn.putText('FAIL: No valid code found.');
        }
      }
    },

    man: {
      description: '<topic> - Displays the MANual page for <topic>',
      func: function (topic) {
        if (topic) {
          if (this.commands.hasOwnProperty(topic) &&
              this.commands[topic].hasOwnProperty('man')) {
            this.commands[topic].man.split('\n').forEach(function (line) {
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
          _StdIn.putText('Usage: prompt <string> Please supply a string.');
        }
      }
    },

    rot13: {
      description: '<string> - Does rot13 obfuscation on <string>',
      func: function (string) {
        if (string) {
          // Requires utils/rot13 for rot13() function
          _StdIn.putText(string + ' = "' + rot13(string) + '"');
        } else {
          _StdIn.putText('Usage: rot13 <string>  Please supply a string.');
        }
      }
    },

    rrq: {
      description: '<quantum> - sets the Round Robin Quantum (in clock ticks)',
      func: function (quantum) {
        if (quantum && /[0-9]+/.test(quantum)) {
          _Scheduler.setQuantum(quantum);
          _StdIn.putText('Scheduler Quantum set to ' + quantum);
        } else {
          _StdIn.putText('Quantum: ' + _Scheduler.quantum + ' - Usage: rrq <quantum>');
        }
      }
    },

    run: {
      description: '[-a] | <pid> - runs the process <pid>',
      func: function (/*args*/) {
        if (arguments[0] === '-a' || arguments[0] === '--all') {
          _KernelInterruptQueue.enqueue(
            new RunProcessInterrupt({
              pids: _.pluck(_Processes.q, 'pid')
            })
          );
          return false;
        } else if (arguments.length > 0) {
          _KernelInterruptQueue.enqueue(
            new RunProcessInterrupt({
              pids: Array.prototype.slice.call(arguments, 0, arguments.length).map(function (n) { return parseInt(n); })
            })
          );
          return false;
        } else {
          _StdIn.putText('Usage: run --all|<pid>[ <pid>]');
        }
      },
    },

    shutdown: {
      description: '- Shuts down the virtual OS but leaves the underlying hardware simulation running',
      func: function () {
        _StdIn.putText('Shutting down...');
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
            case 'on':
              if (_Trace && _SarcasticMode) {
                _StdIn.putText('Trace is already on, dumbass.');
              } else {
                _Trace = true;
                _StdIn.putText('Trace ON');
              }
              break;
            case 'off':
              _Trace = false;
              _StdIn.putText('Trace OFF');
              break;
            default:
              _StdIn.putText('Invalid arguement. Usage: trace <on | off>.');
          }
        } else {
          _StdIn.putText('Usage: trace <on | off>');
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
            function () {
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
