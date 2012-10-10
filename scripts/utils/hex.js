define([], function () {

  function _fill(hex, len) {
    len = len || 2;
    while (hex.length < len) {
      hex = '0' + hex;
    }
    return hex;
  }

  return {

    add: function (h1, h2, len) {
      var sum = this.dec(h1) + this.dec(h2);
      return this.hex(sum, len);
    },

    dec: function (hex) {
      return parseInt(hex, 16);
    },

    hex: function (num, len) {
      return _fill(num.toString(), len).toUpperCase();
    },

    inc: function (hex, len) {
      return this.add(hex, '1', len);
    }

  };

});