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
          manager,
          self = this;
      manager = new BlockManager(block, function () {
        var new_block = self.getFreeBlock();
            contents = _Disk.readFile('.swap_' + this.id).trim().split(' ');
        new_block.allocated = true;
        this.updateBlock(new_block);
        this.write(0, contents);
        self.active.unshift(this);
        _Disk.removeFile('.swap_' + this.id);
      });
      block.allocated = true;
      this.active.unshift(manager);
      return manager;
    },

    getManager: function (id) {
      return _.find(this.active, function (manager) {
        return manager.id === id;
      });
    },

    forceAllocate: function () {
      var to_swap = this.active.pop();
      var contents = to_swap.all();
      _Disk.createFile('.swap_' + to_swap.id, contents.join(' '));
      var block = to_swap.deallocate();
      return block;
    },

    getFreeBlock: function () {
      var block = _.find(blocks, function (block) {
        return block.allocated === false;
      }) || this.forceAllocate();
      return block;
    }

  });


  var MANAGER_IDS = 0;

  function BlockManager(block, swap) {
    this.id = ++MANAGER_IDS;
    this.active = false;
    this.begin = null;
    this.block = null;
    this.end = null;
    this.size = null;
    this.updateBlock(block);

    this.deallocate = function () {
      var block = this.block;
      this.active = false;
      this.block = null;
      if (block) block.allocated = false;
      return block;
    };
    this.swap = swap;
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

    getRealLoc: function (loc) {
      return loc + this.begin;
    },

    inRange: function (loc) {
      return loc >= this.begin && loc < this.getRealLoc(this.size);
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