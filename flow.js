angular.module('flowApp', [])
  .controller('FlowController', function($scope, $interval) {
    var flow = this;

    flow.columns = [
        {name: 'Backlog', id: 1, start: true, end: false, idle: true, wipLimit: 99},
        {name: 'Rqmts', id: 2, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF Desgn', id: 3, start: false, end: false, idle: true, wipLimit: 6},
        {name: 'Design', id: 4, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF Dev', id: 5, start: false, end: false, idle: true, wipLimit: 6},
        {name: 'Dev', id: 6, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF QA', id: 7, start: false, end: false, idle: true, wipLimit: 6},
        {name: 'QA', id: 8, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'RF Ops', id: 9, start: false, end: false, idle: true, wipLimit: 6},
        {name: 'Ops', id: 10, start: false, end: false, idle: false, wipLimit: 1},
        {name: 'Done', id: 11, start: false, end: true, idle: true, wipLimit: 99}
    ];

    flow.historicalTimes = [];
    flow.historicalQueues = [];
    flow.done = false;
    flow.running = false;
    flow.maxItemProgress = 1;
    flow.minItemProgress = 1;
    flow.warnLevel = 2;
    flow.alertLevel = 3;

    flow.warnLevels = {"WIP 1": 1, "WIP 2": 2, "WIP 3": 3, "WIP 4": 4, "WIP 5": 5, "WIP 6": 6};
    flow.alertLevels = {"WIP 1": 1, "WIP 2": 2, "WIP 3": 3, "WIP 4": 4, "WIP 5": 5, "WIP 6": 6};

    flow.workSizes = [1, 2, 3, 4, 5, 8, 13];
    flow.queueSizes = {3: [], 5: [], 7: [], 9: []};

    flow.items = [
      {name: "Widget 1101", id: 1, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1102", id: 2, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1103", id: 3, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1104", id: 4, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1105", id: 5, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1106", id: 6, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1107", id: 7, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1108", id: 8, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1109", id: 9, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1110", id: 10, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1111", id: 11, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1112", id: 12, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1113", id: 13, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1114", id: 14, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1115", id: 15, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1116", id: 16, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1117", id: 17, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1118", id: 18, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1119", id: 19, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
      {name: "Widget 1120", id: 20, columnId: 1, timestamp: 0, times: {active: 0, idle: 0}, workRemaining: 0},
    ];

    flow.resetBoard = function() {
      if (flow.running) { return; };
      if (flow.done) {
        flow.historicalTimes.push([
          flow.totalActiveTime(),
          flow.totalIdleTime(),
          flow.totalTime(),
          flow.totalIdleTimePercentage()]);
        flow.historicalQueues.push([
          flow.averageQueueSize(flow.columnById(3)),
          flow.averageQueueSize(flow.columnById(5)),
          flow.averageQueueSize(flow.columnById(7)),
          flow.averageQueueSize(flow.columnById(9))]);
      }
      else {
        $interval.cancel(flow.timer);
      }
      _.each(flow.items, flow.resetItem);
      flow.queueSizes = {3: [], 5: [], 7: [], 9: []};
      flow.maxItemProgress = 1;
      flow.minItemProgress = 1;
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
        flow.recordQueueSizes();
        flow.tickWorkers();
      }
    };

    flow.tickWorkers = function() {
      let walkTheBoard = _.sortBy(flow.workColumns(), 'id').reverse();
      _.each(walkTheBoard, function(workColumn) {
        console.log("ticking column " + workColumn.name);
        let workItem = _.first(_.sortBy(flow.itemsInColumn(workColumn), 'id'));
        if (workItem) {
          console.log("working...");
          flow.doWork(workItem);
          if (workItem.workRemaining == 0) {
            console.log("...done!");
            flow.moveItem(workItem);
          }
          else {
            console.log("...not done!");
          }
        }
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
      let productivity = _.sample([0, 0, 1, 2]);
      console.log(item.workRemaining + " work remaining on " + item.name + ", productivity of " + productivity);
      let delta = item.workRemaining - productivity;
      if (delta < 0) {
        item.workRemaining = 0;
      }
      else {
        item.workRemaining = delta;
      }
    };

    flow.recordQueueSizes = function() {
      _.each(flow.queueColumns(), function(col) {
        // don't record queues outside of the items in progress
        if (col.id >= flow.minItemProgress && col.id <= flow.maxItemProgress) {
          let size = flow.itemsInColumn(col).length;
          flow.queueSizes[col.id].push(size);
        }
      });
    };

    flow.queueColumns = function() {
      let qs = _.filter(flow.columns, function(col) {
        return col.idle && !col.start && !col.end;
      });
      return qs;
    };

    flow.idleColumns = function() {
      return _.filter(flow.columns, function(col) {
        return col.idle;
      });
    };

    flow.columnState = function(col) {
      if (!col.idle || col.start || col.end) {
        return "block";
      }
      else if (flow.itemsInColumn(col).length >= flow.alertLevel) {
        return "block-alert";
      }
      else if (flow.itemsInColumn(col).length >= flow.warnLevel) {
        return "block-warn";
      }
      else {
        return "block";
      }
    }

    flow.itemsRemainingForColumn = function(column) {
      let columns = _.filter(flow.columns, function(col) {
        return col.id <= column.id;
      });
      let items = _.reduce(columns, function(memo, col) { return memo + flow.itemsInColumn(col); }, []);
      return items;
    }

    flow.averageQueueSize = function(column) {
      let samples = flow.queueSizes[column.id];
      let total = _.reduce(samples, function(memo, itm) { return memo + itm; }, 0);
      if (samples.length == 0) { return; }
      return (total / samples.length).toFixed(2);
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
      item.columnId = toColumn.id;
      item.workRemaining = _.sample(flow.workSizes);
      flow.maxItemProgress = _.max([flow.maxItemProgress, toColumn.id]);
      if (flow.itemsRemainingForColumn(fromColumn).length == 0) {
        flow.minItemProgress = toColumn.id;
      }
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
