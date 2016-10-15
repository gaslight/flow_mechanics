angular.module('flowApp', [])
  .controller('FlowController', function($scope, $interval) {
    var flow = this;

    flow.columns = [
        {name: 'Backlog', id: 1, start: true, end: false, idle: true, wipLimit: 99},
        {name: 'Up Next', id: 2, start: false, end: false, idle: false, wipLimit: 4},
        {name: 'RF Desgn', id: 3, start: false, end: false, idle: true, wipLimit: 4},
        {name: 'Design', id: 4, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF Dev', id: 5, start: false, end: false, idle: true, wipLimit: 4},
        {name: 'Dev', id: 6, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF UI', id: 7, start: false, end: false, idle: true, wipLimit: 4},
        {name: 'UI', id: 8, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF QA', id: 9, start: false, end: false, idle: true, wipLimit: 4},
        {name: 'QA', id: 10, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'Done', id: 11, start: false, end: true, idle: true, wipLimit: 99}
    ];

    flow.historicals = [];
    flow.done = false;
    flow.running = false;

    flow.workSizes = [1, 2, 3, 5, 8, 13];

    flow.items = [
      {name: "Widget a", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget b", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget c", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget o", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget p", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget h", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget i", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget q", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget z", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget f", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget l", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget k", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget t", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
      {name: "Widget d", columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: _.sample(flow.workSizes)},
    ];

    flow.resetBoard = function() {
      if (flow.running) { return; };
      if (flow.done) {
        flow.historicals.push([flow.totalActiveTime(), flow.totalIdleTime(), flow.totalTime(), flow.totalIdleTimePercentage()]);
      }
      else {
        $interval.cancel(flow.timer);
      }
      _.each(flow.items, flow.resetItem);
      flow.done = false;
      flow.running = false;
    };

    flow.resetItem = function(item) {
      item.columnId = 1;
      item.timestamp = 0;
      item.times = {active: 0, idle: 0};
      item.workRemaining = _.sample(flow.workSizes);
    };

    flow.itemsInColumn = function(column) {
      let items =  _.filter(flow.items, function(itm) {
        return itm.columnId == column.id;
      });
      return items;
    };

    flow.columnById = function(col_id) {
      return _.find(flow.columns, function(col) {
        return col.id == col_id;
      });
    };

    flow.timer = undefined;

    flow.play = function() {
      flow.running = true;
      flow.timer = $interval(flow.tickBoard, 300);
    };

    flow.tickBoard = function() {
      if (flow.itemsInColumn(flow.columnById('11')).length == flow.items.length) {
        $interval.cancel(flow.timer);
        flow.done = true;
        flow.running = false;
        console.log("Done!");
      }
      else {
        flow.tickWorkers();
      }
    };

    flow.tickWorkers = function() {
      let walkTheBoard = _.sortBy(flow.workColumns(), 'id').reverse();
      _.each(walkTheBoard, function(workColumn) {
        console.log("ticking column " + workColumn.name);
        _.each(flow.itemsInColumn(workColumn), function(item) {
          console.log("working...");
          flow.doWork(item);
          if (item.workRemaining == 0) {
            console.log("...done!");
            flow.moveItem(item);
          }
          else {
            console.log("...not done!");
          }
        });
        if (workColumn.id > 1) {
          while (flow.columnUnderWipLimit(workColumn)) {
            let pullColumn = flow.columnById(workColumn.id - 1);
            let itemToPull = _.first(flow.itemsInColumn(pullColumn));
            if (itemToPull) {
              console.log(workColumn.name + " trying to pull " + itemToPull.name + " from " + pullColumn.name + "...");
              flow.moveItem(itemToPull);
            }
            else {
              break;
            }
          }
        }
      });
    };

    flow.doWork = function(item) {
      let productivity = _.sample([0, 1, 2]);
      console.log(item.workRemaining + " work remaining on " + item.name + ", productivity of " + productivity);
      let delta = item.workRemaining - productivity;
      if (delta < 0) {
        item.workRemaining = 0;
      }
      else {
        item.workRemaining = delta;
      }
    };

    flow.columnUnderWipLimit = function(column) {
      return (flow.itemsInColumn(column)).length < column.wipLimit;
    };

    flow.workColumns = function() {
      return _.filter(flow.columns, function(col) {
        return !col.idle;
      });
    };

    flow.moveItem = function(item) {
      let newTimestamp = new Date();
      let fromColumn = flow.columnById(item.columnId);
      if (fromColumn.end) { return; }

      let toColumn = flow.columnById(item.columnId + 1);
      console.log("trying to move " + item.name + " from " + fromColumn.name + " to " + toColumn.name + "...");
      if (!flow.columnUnderWipLimit(toColumn)) {
        console.log("...but " + toColumn.name + " is over WIP")
        return;
      }

      if (!fromColumn.start) {
        if (fromColumn.idle) {
          item.times['idle'] = item.times['idle'] + (newTimestamp - item.timestamp);
        }
        else {
          item.times['active'] = item.times['active'] + (newTimestamp - item.timestamp);
        }
      }
      item.timestamp = newTimestamp;
      item.columnId = fromColumn.id + 1;
      item.workRemaining = _.sample(flow.workSizes);
      console.log("...success!");
    };

    flow.activeItems = function() {
      return _.filter(flow.items, function(item) {
        let column = flow.columnById(item.columnId);
        return !column.idle;
      });
    };

    flow.idleTimePercentage = function(item) {
        let idleTime = item.times['idle'];
        let totalTime = item.times['active'] + idleTime;
        if (totalTime == 0) {
          return "";
        }
        else {
          return (Math.round((idleTime / totalTime) * 100)) + "%";
        }
    };

    flow.totalActiveTime = function() {
      return _.reduce(flow.items, function(memo, itm) { return memo + itm.times['active']; }, 0);
    };

    flow.totalIdleTime = function() {
      return _.reduce(flow.items, function(memo, itm) { return memo + itm.times['idle']; }, 0);
    };

    flow.totalTime = function() {
      return flow.totalActiveTime() + flow.totalIdleTime();
    };

    flow.totalIdleTimePercentage = function() {
        if (flow.totalTime() == 0) {
          return "";
        }
        else {
          return (Math.round((flow.totalIdleTime() / flow.totalTime()) * 100)) + "%";
        }
    };

  });
