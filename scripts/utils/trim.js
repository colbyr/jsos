/**
 * trim function
 */

define([], function () {

  return function (str) {
    return str.replace(/^\s+ | \s+$/g, "");
  };

});
