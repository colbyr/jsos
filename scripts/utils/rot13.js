/**
 * rot13
 */

define([], function () {

  // An easy-to understand implementation of the famous and common Rot13 obfuscator.
  // You can do this in three lines with a complex regular experssion, but I'd have
  // trouble explaining it in the future.  There's a lot to be said for obvious code.
  return function (str) {
    var i = 0;
    var ch;
    var code = 0;
    var retVal = '';
    for (i; i < str.length; i += 1) {
      ch = str[i];
      code = 0;
      if ('abcedfghijklmABCDEFGHIJKLM'.indexOf(ch) >= 0) {
        code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
        retVal = retVal + String.fromCharCode(code);
      } else if ('nopqrstuvwxyzNOPQRSTUVWXYZ'.indexOf(ch) >= 0) {
        code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
        retVal = retVal + String.fromCharCode(code);
      } else {
        retVal = retVal + ch;
      }
    }
    return retVal;
  };

});