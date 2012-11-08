define([
  'utils/hex',
  'utils/ls'
], function (hex, ls) {

  var NULL_FILE = (function () {
    var file = '00 -1 -1 -1';
    for (var i = 0; i < 60; i += 1) {
      file += ' 00';
    }
    return file;
  }());

  // FAT:   0-0-0 => 0-7-7
  // Files: 1-0-0 => 7-7-7
  // 00 -1 -1 -1 00 00 00 00 00 00 00 ... 00 (64bits)

  return {

    dump: function (type) {
      this['each' + (type || '')](function (t, s, b) {
        var key = this.key(t, s, b);
        console.log(key + ' | ' + ls.get(key));
      }, this);
    },

    each: function (action, context) {
      var res;
      if (context) {
        action = _.bind(action, context);
      }
      for (var t = 0; t < 8; t += 1) {
        for (var s = 0; s < 8; s += 1) {
          for (var b = 0; b < 8; b += 1) {
            res = action(t, s, b);
            if (res) {
              return res;
            }
          }
        }
      }
    },

    eachFat: function (action, context) {
      var res;
      if (context) {
        action = _.bind(action, context);
      }
      for (var s = 0; s < 8; s += 1) {
        for (var b = 0; b < 8; b += 1) {
          res = action(0, s, b);
          if (res) {
            return res;
          }
        }
      }
    },

    eachFile: function (action, context) {
      var res;
      if (context) {
        action = _.bind(action, context);
      }
      for (var t = 1; t < 8; t += 1) {
        for (var s = 0; s < 8; s += 1) {
          for (var b = 0; b < 8; b += 1) {
            res = action(t, s, b);
            if (res) {
              return res;
            }
          }
        }
      }
    },

    file: function () {
      this.eachFile(function (t, s, b) {
        var key = key(t, s, b);
        if (!this.isOpen(key)) {
          console.log(this.contents(key));
        }
      }, this);
    },

    findFree: function () {
      return this.eachFile(function (t, s, b) {
        var key = this.key(t, s, b);
        if (this.isOpen(key)) {
          return key;
        }
      }, this);
    },

    findFreeFat: function () {
      return this.eachFat(function (t, s, b) {
        var key = this.key(t, s, b);
        if (this.isOpen(key)) {
          return key;
        }
      }, this);
    },

    format: function () {
      this.each(function (t, s, b) {
        ls.set(this.key(t, s, b), NULL_FILE);
      }, this);
    },

    isOpen: function (key) {
      return ls.get(key).slice(0, 2) === '00';
    },

    key: function (t, s, b) {
      return '' + t + s + b;
    },

    read: function (key) {
      var i = 0,
          next = this.next(key),
          raw = ls.get(key).split(' ').slice(4),
          string = '';
      if (!this.isOpen(key)) {
        while (raw[i] !== '00' && i < raw.length) {
          string += (i === 0 ? '' : ' ') + raw[i];
          i += 1;
        }
        if (next) {
          string += this.read(next);
        }
      }
      return string;
    },

    next: function (key) {
      var file = ls.get(key);
      var next = null;
      if (file.slice(2, 11)) {
        next = file.charAt(4) +
          file.charAt(7) +
          file.charAt(10);
      }
      return next;
    },

    createFile: function (filename, contents) {
      var fat = this.findFreeFat(),
          file = this.findFree();
      this.write(fat, hex.stringToHexBits(filename));
      this.link(fat, file);
      this.write(file, hex.stringToHexBits(contents));
    },

    readFile: function (filename, contents) {
      var fat = ls.getKey(hex.stringToHexBits(filename, 60));
      return hex.hexBitsToString(this.read(this.next(fat)));
    },

    writeFile: function (filename, contents) {
      var fat = ls.getKey(hex.stringToHexBits(filename, 60));
      this.write(this.next(fat), contents);
    },

    write: function (file, contents) {
      contents = contents.split(' ');
      if (contents[contents.length - 1] !== '00') {
        contents.push('00');
      }
      this.setStatus(file, true);
      var current = ls.get(file).split(' ').slice(4);
      if (contents.length < 60) {
        for (var i = 0; i < contents.length; i += 1) {
          current[i] = contents[i];
        }
        ls.set(file, ls.get(file).slice(0, 12) + current.join(' '));
      } else {
        for (var i = 0; i < 60; i += 1) {
          current[i] = contents[i];
        }
        var next = this.findFree();
        this.link(file, next);
        ls.set(file, ls.get(file).slice(0, 12) + current.join(' '));
        this.write(next, contents.slice(60));
      }
      return file;
    },

    link: function (from, to) {
      this.setStatus(to, true);
      ls.set(
        from,
        '01 0' + to.split('').join(' 0') + ls.get(from).slice(11)
      );
    },

    setStatus: function (key, st) {
      ls.set(key, '0' + (+st).toString() + ' ' + ls.get(key).slice(3));
    },

  };

});
