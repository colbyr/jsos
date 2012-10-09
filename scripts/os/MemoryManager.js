define([
  'host/Memory',
  'vendor/underscore'
], function (CoreMemory) {

  var BLOCK_SIZE = 256;

  var ERROR_PREFIX = 'MEMORY: ';
  function _error(msg) {
    throw new Error(ERROR_PREFIX + msg);
  }

  var blocks = [];

  for (var i = 0; i < CoreMemory.size(); i += BLOCK_SIZE) {
    blocks.push({
      allocated: false,
      begin: i,
      end: i + BLOCK_SIZE - 1
    });
  }

  function MemoryManager() {
    this.managers = [];
  }

  _.extend(MemoryManager.prototype, {

    allocateBlock: function () {
      var block = this.getFreeBlock();
      var manager;
      if (block) {
        manager = new BlockManager(block);
        block.allocated = true;
        this.managers.push(manager);
      } else {
        manager = null;
      }
      return manager;
    },

    deallocateBlock: function (pid) {
      this.managers['pid_' + pid].deallocate();
      delete this.managers['pid_' + pid];
    },

    getFreeBlock: function () {
      return _.find(blocks, function (block) {
        return block.allocated === false;
      });
    }

  });

  function BlockManager(block) {
    this.begin = block.begin;
    this.end = block.end;
    this.size = this.end - this.begin + 1;

    this.deallocate = function () {
      block.allocated = false;
      return this.wipe();
    };
  }

  _.extend(BlockManager.prototype, {

    access: function (a, b) {
      a = this.getRealLoc(a);
      b = this.getRealLoc(b);
      return b ?
        CoreMemory.accessBlock(a, b) :
        CoreMemory.access(a);
    },

    getRealLoc: function (loc) {
      return loc + this.begin;
    },

    inRange: function (loc) {
      return loc >= this.begin && loc < this.getRealLoc(this.size);
    },

    write: function (loc, data) {
      loc = this.getRealLoc(loc);
      if (!this.inRange(loc) || !this.inRange(loc + data.length - 1)) {
        _error('Invalid memory access');
      }

      if (data instanceof Array) {
        CoreMemory.writeBlock(loc, data);
      } else {
        CoreMemory.write(loc, data);
      }
    },

    wipe: function () {
      var contents = this.access(this.begin, this.end);
      CoreMemory.clearBlock(this.begin, this.end);
      return contents;
    }

  });

  return MemoryManager;

});