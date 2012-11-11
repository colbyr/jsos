define([], function () {

  /**
   * Default length for format
   */
  var DEFAULT_LENGTH = 2;

  /**
   * REGEX for valid hex
   */
  var TESTER = /^-?[0-9a-fA-F]+(\.[0-9a-fA-F]+)?$/;

  return {

    /**
     * Add two hex strings
     *
     * @param  string
     * @param  string
     * @param  int     length
     * @return string  sum in hex
     */
    add: function (hex1, hex2, length) {
      if (!this.isHex(hex1)) {
        throw new Error(
          'Hex.add: ' + hex1.toString() + ' (hex1) is not a hex string'
        );
      } else if (!this.isHex(hex2)) {
        throw new Error(
          'Hex.add: ' + hex2.toString() + ' (hex2) is not a hex string'
        );
      }

      return this.toHex(
        this.toDec(hex1) + this.toDec(hex2),
        length
      );
    },

    /**
     * Divide two hex strings
     *
     * @param  string
     * @param  string
     * @param  int     length
     * @return string  result in hex
     */
    div: function (hex1, hex2, length) {
      if (!this.isHex(hex1)) {
        throw new Error(
          'Hex.div: ' + hex1.toString() + ' (hex1) is not a hex string'
        );
      } else if (!this.isHex(hex2)) {
        throw new Error(
          'Hex.div: ' + hex2.toString() + ' (hex2) is not a hex string'
        );
      }

      return this.toHex(
        this.toDec(hex1) / this.toDec(hex2),
        length
      );
    },

    /**
     * Lengthen a hex string to length
     *
     * @param  string   hex string
     * @param  int      goal length
     * @return string
     */
    format: function (hex, length) {
      if (!this.isHex(hex)) {
        throw new Error(
          'Hex.format: "' + hex.toString() + '" is not a hex string'
        );
      }

      var negative = hex.charAt(0) === '-';
      length = length || DEFAULT_LENGTH;
      if (negative) {
        hex = hex.slice(1);
      }

      if (hex.length < length) {
        while (hex.length < length) {
          hex = '0' + hex;
        }
      } else if (hex.length > length) {
        while (hex.length > length && hex.charAt(0) === '0') {
          hex = hex.slice(1);
        }
      }

      return (negative ? '-' + hex : hex).toUpperCase();
    },

    /**
     * Returns true if hex is valid hex
     * eg: FF || D7.1 || -1c.E
     *
     * @param  string
     * @return bool
     */
    isHex: function (hex) {
      return typeof hex === 'string' && TESTER.test(hex);
    },

    /**
     * Increment a hex string
     *
     * @param  string
     * @param  length  return string length
     * @return string
     */
    inc: function (hex, length) {
      if (!this.isHex(hex)) {
        throw new Error('Hex.inc: ' + hex.toString() + ' is not a hex string');
      }

      return this.add(hex, '01');
    },

    /**
     * Mod (%) two hex strings
     *
     * @param  string
     * @param  string
     * @param  int     length
     * @return string  result in hex
     */
    mod: function (operand, mod, length) {
      if (!this.isHex(operand)) {
        throw new Error(
          'Hex.mod: ' + operand.toString() + ' (operand) is not a hex string'
        );
      } else if (!this.isHex(mod)) {
        throw new Error(
          'Hex.mod: ' + mod.toString() + ' (mod) is not a hex string'
        );
      }

      return this.toHex(
        this.toDec(operand) % this.toDec(mod),
        length
      );
    },

    /**
     * Multiply two hex strings
     *
     * @param  string
     * @param  string
     * @param  int     length
     * @return string  result in hex
     */
    mul: function (hex1, hex2, length) {
      if (!this.isHex(hex1)) {
        throw new Error(
          'Hex.mul: ' + hex1.toString() + ' (hex1) is not a hex string'
        );
      } else if (!this.isHex(hex2)) {
        throw new Error(
          'Hex.mul: ' + hex2.toString() + ' (hex2) is not a hex string'
        );
      }

      return this.toHex(
        this.toDec(hex1) * this.toDec(hex2),
        length
      );
    },

    /**
     * Subtract two hex strings
     *
     * @param  string
     * @param  string
     * @param  length  return string length
     * @return string
     */
    sub: function (hex1, hex2, length) {
      if (!this.isHex(hex1)) {
        throw new Error(
          'Hex.sub: ' + hex1.toString() + ' (hex1) is not a hex string'
        );
      } else if (!this.isHex(hex2)) {
        throw new Error(
          'Hex.sub: ' + hex2.toString() + ' (hex2) is not a hex string'
        );
      }

      return this.toHex(
        this.toDec(hex1) - this.toDec(hex2),
        length
      );
    },

    /**
     * Convert a hex string to decimal
     *
     * @param  string
     * @return number
     */
    toDec: function (hex) {
      if (!this.isHex(hex)) {
        throw new Error('Hex.toDec: ' + hex.toString() + ' is not a hex string');
      }

      return parseInt(hex, 16);
    },

    /**
     * Convert decimal number to hex string
     *
     * @param  number
     * @param  int     length
     * @return string
     */
    toHex: function (dec, length) {
      if (typeof dec !== 'number') {
        throw new Error('Hex.toHex: expects a number, ' + typeof dec + ' given');
      }

      return this.format(
        dec.toString(16),
        length
      );
    },

    stringToHexBits: function (string, length) {
      var res = '';
      for (var i = 0; i < string.length; i += 1) {
        res += this.toHex(string.charCodeAt(i)) + ' ';
      }
      if (length) {
        while (res.length < (length * 3)) {
          res += '00 ';
        }
      }
      return res.trim();
    },

    hexBitsToString: function (bits) {
      var res = '';
      if (bits !== '') {
        bits = bits.trim().split(' ');
        for (var i = 0; i < bits.length; i += 1) {
          res += String.fromCharCode(this.toDec(bits[i]));
        }
      }
      return res.trim();
    }

  };

});
