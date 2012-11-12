define([
  'host/Memory',
  'vendor/underscore'
], function (CoreMemory) {

  var BLOCK_SIZE = 256;

  var ERROR_PREFIX = 'MEMORY: ';
  function _error(msg) {
    throw new Error(ERROR_PREFIX + msg);
  }

  blocks = [];

  for (var i = 0; i < CoreMemory.size(); i += BLOCK_SIZE) {
    blocks.push({
      allocated: false,
      begin: i,
      end: i + BLOCK_SIZE - 1
    });
  }

  function MemoryManager() {
    this.active = [];
    _.each(_Disk.files(), function (fname) {
      if (fname.indexOf('.swap_') > -1) {
        _Disk.removeFile(fname);
      }
    });
  }

  _.extend(MemoryManager.prototype, {

    allocateBlock: function () {
      var block = this.getFreeBlock(),
          manager = new BlockManager(block, this),
          self = this;
      block.allocated = true;
      this.active.unshift(manager);
      return manager;
    },

    deallocate: function (id) {
      this.active.splice(this.getManagerIndex(id), 1);
    },

    getManagerIndex: function (id) {
      var index = -1;
      _.each(this.active, function (manager, index) {
        if (manager.id === id) {
          index = index;
        }
      });
      return index;
    },

    forceAllocate: function () {
      var to_swap = this.active.pop();
      _Disk.createFile('.swap_' + to_swap.id, to_swap.all().join(' '));
      return to_swap.deallocate();
    },

    getFreeBlock: function () {
      var block = _.find(blocks, function (block) {
        return block.allocated === false;
      }) || this.forceAllocate();
      return block;
    }

  });


  var MANAGER_IDS = 0;

  function BlockManager(block, manager) {
    this.id = ++MANAGER_IDS;
    this.active = false;
    this.begin = null;
    this.block = null;
    this.end = null;
    this.manager = manager;
    this.size = null;
    this.updateBlock(block);
  }

  _.extend(BlockManager.prototype, {

    access: function (a, b) {
      if (!this.active) {
        this.swap();
      }

      a = this.getRealLoc(a);
      b = this.getRealLoc(b) - 1;
      return b ?
        CoreMemory.accessBlock(a, b) :
        CoreMemory.access(a);
    },

    all: function () {
      return this.access(0, this.size);
    },

    deallocate: function () {
      var block = this.block;
      this.active = false;
      this.block = null;
      if (block) {
        block.allocated = false;
      }
      return block;
    },

    getRealLoc: function (loc) {
      return loc + this.begin;
    },

    inRange: function (loc) {
      return loc >= this.begin && loc < this.getRealLoc(this.size);
    },

    release: function () {
      this.deallocate();
      this.manager.deallocate(this.id);
    },

    swap: function () {
      var new_block = this.manager.getFreeBlock();
          contents = _Disk.readFile('.swap_' + this.id).trim().split(' ');
      new_block.allocated = true;
      this.updateBlock(new_block);
      this.write(0, contents);
      this.manager.active.unshift(this);
      _Disk.removeFile('.swap_' + this.id);
    },

    updateBlock: function (block) {
      this.begin = block.begin;
      this.block = block;
      this.end = block.end;
      this.size = this.end - this.begin + 1;
      this.active = true;
    },

    write: function (loc, data) {
      if (!this.active) {
        this.swap();
      }

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
      if (!this.active) {
        this.swap();
      }

      var contents = this.access(this.begin, this.end);
      CoreMemory.clearBlock(this.begin, this.end);
      return contents;
    }

  });

  return MemoryManager;

});