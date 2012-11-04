define([], function () {

  return {

    append: function (node, contents) {
      if (contents instanceof Array) {
        contents.forEach(function (content) {
          node.appendChild(content);
        });
      } else {
        node.appendChild(contents);
      }
      return node;
    },

    clear: function (node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
      return node;
    },

    create: function (tag, attributes, contents) {
      var node = document.createElement(tag);
      if (attributes) this.set(node, attributes);
      if (contents) this.append(node, contents);
      return node;
    },

    prepend: function (node, contents) {
      node.insertBefore(contents, node.firstChild);
      return node;
    },

    replace: function (node, contents) {
      return this.append(this.clear(node), contents);
    },

    set: function (node, attributes) {
      for (var k in attributes) {
        node.setAttribute(k, attributes[k]);
      }
      return node;
    },

    text: function (string) {
      return document.createTextNode(string);
    }

  };

});