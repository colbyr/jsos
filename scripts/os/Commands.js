/**
 * Shell Commands
 */

define([
  'host/Sim',
  'os/interrupts/CreateProcessInterrupt',
  'os/interrupts/KillProcessInterrupt',
  'os/interrupts/RunProcessInterrupt',
  'utils/Date',
  'utils/hex',
  'utils/rot13'
], function (Sim, CreateProcessInterrupt, KillProcessInterrupt, RunProcessInterrupt, Date, hex, rot13) {

  return {
    append: {
      description: '<file> <content> - appends content to file',
      func: function (file, content) {
        if (file && content) {
          _Disk.appendFile(file, hex.stringToHexBits(content));
        } else {
          _StdIn.putText('Usage: append <file> <content>');
        }
      }
    },

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

    create: {
      description: '<file> - creates a new file',
      func: function (file) {
        if (file) {
          _Disk.createFile(file, '');
          _StdIn.putText(file + ' created...');
        } else {
          _StdIn.putText('Usage: create <file>');
        }
      }
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

    debug: {
      description: 'on|off - Toggles the CPU cycle rate between debug mode',
      func: function (setting) {
        if (setting) {
          setting = setting.trim().toLowerCase();
          if (setting === 'on') {
            DEBUG_MODE = true;
          } else if (setting === 'off') {
            DEBUG_MODE = false;
          } else {
            _StdIn.putText('"' + setting + '"? ');
          }
        }
        _StdIn.putText('debug mode is ' + (DEBUG_MODE ? 'ON' : 'OFF'));
      }
    },

    delete: {
      description: '<file> - deletes a file',
      func: function (file) {
        if (file) {
          _Disk.removeFile(file);
          _StdIn.putText(file + ' deleted...');
        } else {
          _StdIn.putText('Usage: delete <file>');
        }
      }
    },

    format: {
      description: '- DELETES EVERYTHING ON THE DISK!!! be careful...',
      func: function () {
        _Disk.format();
        _StdIn.putText('IT\'S ALL GONE BRO');
      }
    },

    help: {
      description: '- This is the help command. Seek help.',
      func: function () {
        var command;
        var first = true;
        for (command in this.commands) {
          if (!first) {
            _StdIn.advanceLine();
          } else {
            first = false;
          }
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
          _KernelInterruptQueue.enqueue(
            new KillProcessInterrupt({
              pid: pid
            })
          );
          return false;
        } else if (pid) {
          _StdIn.putText('Process ' + pid + ' does not exist');
        } else {
          _StdIn.putText('Usage: kill <pid>');
        }
      }
    },

    load: {
      description: '[-p <priotity>] - Loads validated 6502a op codes into memory and returns the PID.',
      func: function (arg1) {
        var code, filename, priority = 0;
        switch (arg1) {
          case '-p':
          case '--priority':
            priority = arguments[1];
            filename = arguments[2];
            if (!/^\d+$/.test(priority)) {
              _StdIn.putText('"' + priority + '" is not a valid priority');
              return;
            }
            break;
          default:
            filename = arg1;
        }
        if (filename) {
          code = _Disk.readFile(filename);
          if (code) {
            code = code.trim().split(' ');
          }
        } else {
          code = Sim.loadCode();
        }
        if (code) {
          _KernelInterruptQueue.enqueue(
            new CreateProcessInterrupt({
              execute: false,
              priority: priority,
              program: code
            })
          );
          return false;
        } else {
          _StdIn.putText('FAIL: No valid code found.');
        }
      }
    },

    ls: {
      description: '[-a] - Lists files on the disk (-a shows hidden files)',
      func: function (flag) {
        _.each(_Disk.files().sort(), function (file) {
          if (flag === '-a' || file.charAt(0) !== '.') {
            _StdIn.putText(file);
            _StdIn.advanceLine();
          }
        });
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

    read: {
      description: '<file> - prints the contents of a file to the console',
      func: function (flag, file) {
        var raw = (flag === '-r' || flag === '--raw');
        if (!raw) {
          file = flag;
        }

        if (file) {
          var contents = _Disk.readFile(file);
          if (contents !== null && raw) {
            _StdIn.putText(contents);
            _StdIn.advanceLine();
          } else if (contents !== null) {
            _.each(
              hex.hexBitsToString(contents).split('\n')
            , function (line) {
              _StdIn.putText(line);
              _StdIn.advanceLine();
            });
          } else {
            _StdIn.putText('ERR: No such file "' + file + '"');
          }
        } else {
          _StdIn.putText('Usage: read <file>');
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
      description: '[-a] | -f <filename> | <pid> - runs the process <pid>',
      func: function (arg) {
        switch (arg) {
          case '-a':
          case '--all':
            _KernelInterruptQueue.enqueue(
              new RunProcessInterrupt({
                pids: _.pluck(_Processes.q, 'pid')
              })
            );
            return false;
            break;
          case '-f':
          case '--file':
            var filename = arguments[1],
                code = _Disk.readFile(filename);
            if (code) {
              code = code.trim().split(' ');
            }
            if (code) {
              _KernelInterruptQueue.enqueue(
                new CreateProcessInterrupt({
                  execute: true,
                  program: code
                })
              );
              return false;
            } else {
              _StdIn.putText('FAIL: No valid code found.');
            }
          case undefined:
            _StdIn.putText('Usage: run --all|<pid>[ <pid>]');
            break;
          default:
            var pids = Array.prototype.slice.call(arguments, 0, arguments.length)
              .reduce(function (pids, n) {
                n = n.trim();
                if (/^\d+$/.test(n)) {
                  pids.push(parseInt(n));
                } else {
                  _StdIn.putText('"' + n + '" is not a pid. Maybe try `run -f`?');
                  _StdIn.advanceLine();
                }
                return pids;
              }, []);

            if (pids.length > 0) {
              _KernelInterruptQueue.enqueue(
                new RunProcessInterrupt({
                  pids: pids
                })
              );
              return false;
            }
        }
      },
    },

    scheduling: {
      description: '[<type>] - display/set the scheduling type',
      func: function (type) {
        if (type) {
          if (!_Scheduler.setType(type.toLowerCase())) {
            _StdIn.putText('"' + type + '"? ');
          }
        }
        _StdIn.putText('scheduling mode is ' + _Scheduler.type.toUpperCase());
      }
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
    },

    write: {
      description: '<file> <content>|-l - writes content to file',
      func: function (file, content) {
        if (file && content) {
          if (content === '-l' || content === '--loader') {
            _Disk.writeFile(file, Sim.loadCode().join(' '));
            _StdIn.putText(file + ' written from loader...');
          } else {
            _Disk.writeFile(file, hex.stringToHexBits(content));
            _StdIn.putText(file + ' written...');
          }
        } else {
          _StdIn.putText('Usage: write <file> <content>');
        }
      }
    }

  };

});
