define([
  'utils/hex',
  'utils/ls'
], function (hex, ls) {

  var NULL_FILE = (function () {
    var file = '00 -1 -1 -1';
    for (var i = 0; i < 60; i += 1) {
      file += ' -1';
    }
    return file;
  }());

  file_index = {};

  // FAT:   0-0-0 => 0-7-7
  // Files: 1-0-0 => 7-7-7
  // 00 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 ... -1 (64bits)

  return {

    appendFile: function (filename, contents) {
      if (file_index.hasOwnProperty(filename)) {
        contents = this.readFile(filename) + ' ' + contents;
        this.removeFile(filename);
      }
      this.createFile(filename, contents);
    },

    createFile: function (filename, contents) {
      var fat = this.findFreeFat(),
          file = this.findFree();
      file_index[filename] = fat;
      this.write(fat, hex.stringToHexBits(filename));
      this.link(fat, file);
      this.write(file, contents);
    },

    dump: function (type) {
      this['each' + (type || '')](function (key) {
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
            res = action(this.key(t, s, b), t, s, b);
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
          res = action(this.key(0, s, b), 0, s, b);
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
            res = action(this.key(t, s, b), t, s, b);
            if (res) {
              return res;
            }
          }
        }
      }
    },

    files: function () {
      return _.keys(file_index);
    },

    findFree: function () {
      return this.eachFile(function (key) {
        if (this.isOpen(key)) {
          return key;
        }
      }, this);
    },

    findFreeFat: function () {
      return this.eachFat(function (key) {
        if (this.isOpen(key)) {
          return key;
        }
      }, this);
    },

    format: function () {
      this.each(function (key) {
        ls.set(key, NULL_FILE);
      }, this);
    },

    hasLink: function (contents) {
      return contents.slice(3, 11) !== '-1 -1 -1';
    },

    indexFiles: function () {
      this.eachFat(function (key) {
        if (!this.isOpen(key)) {
          file_index[hex.hexBitsToString(this.read(key, true))] = key;
        }
      }, this);
    },

    init: function () {
      if (ls.length === 0) {
        this.format();
      } else {
        this.indexFiles();
      }
    },

    isOpen: function (key) {
      return ls.get(key).slice(0, 2) === '00';
    },

    key: function (t, s, b) {
      return '' + t + s + b;
    },

    link: function (from, to) {
      this.setStatus(to, true);
      ls.set(
        from,
        '01 0' + to.split('').join(' 0') + ls.get(from).slice(11)
      );
    },

    next: function (key) {
      var file = ls.get(key);
      var next = null;
      if (this.hasLink(file)) {
        next = file.charAt(4) +
          file.charAt(7) +
          file.charAt(10);
      }
      if (next === key) {
        throw new Error('FUCK THIS SHIT MAN ' + key + ', ' + next);
      }
      return next;
    },

    read: function (key, stop) {
      var i = 0,
          next = this.next(key),
          raw = ls.get(key).split(' ').slice(4),
          string = '';
      if (!this.isOpen(key)) {
        while (raw[i] !== '-1' && i < raw.length) {
          string += (i === 0 ? '' : ' ') + raw[i];
          i += 1;
        }
        if (next && !stop) {
          string += this.read(next);
        }
      }
      return string;
    },

    readFile: function (filename, contents) {
      var result = null;
      if (file_index.hasOwnProperty(filename)) {
        result = this.read(
          this.next(
            file_index[filename]
          )
        );
      }
      return result
    },

    remove: function (key) {
      var next = this.next(key);
      if (next) {
        this.remove(next);
      }
      ls.set(key, '00 -1 -1 -1' + ls.get(key).slice(11));
    },

    removeFile: function (filename) {
      if (file_index[filename]) {
        this.remove(file_index[filename]);
        delete file_index[filename];
      }
    },

    setStatus: function (key, st) {
      ls.set(key, '0' + (+st).toString() + ' ' + ls.get(key).slice(3));
    },

    unlink: function (from) {
      this.setStatus(to, true);
      ls.set(
        from,
        '01 -1 -1 -1' + ls.get(from).slice(11)
      );
    },

    write: function (file, contents) {
      contents = contents.split(' ');
      if (contents[contents.length - 1] !== '-1') {
        contents.push('-1');
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
        this.write(next, contents.slice(60).join(' '));
      }
      return file;
    },

    writeFile: function (filename, contents) {
      if (file_index.hasOwnProperty(filename)) {
        this.removeFile(filename);
      }
      this.createFile(filename, contents);
    }

  };

});
