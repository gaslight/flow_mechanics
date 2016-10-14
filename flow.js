angular.module('flowApp', [])
  .controller('FlowController', function() {
    var flow = this;

    flow.columns = [
        {name: 'Backlog', id: 1, start: true, end: false, idle: false, wip_limit: 99},
        {name: 'Up Next', id: 2, start: false, end: false, idle: false, wip_limit: 4},
        {name: 'RF Desgn', id: 3, start: false, end: false, idle: true, wip_limit: 2},
        {name: 'Design', id: 4, start: false, end: false, idle: false, wip_limit: 2},
        {name: 'RF Dev', id: 5, start: false, end: false, idle: true, wip_limit: 2},
        {name: 'Dev', id: 6, start: false, end: false, idle: false, wip_limit: 2},
        {name: 'RF UI', id: 7, start: false, end: false, idle: true, wip_limit: 2},
        {name: 'UI', id: 8, start: false, end: false, idle: false, wip_limit: 2},
        {name: 'RF QA', id: 9, start: false, end: false, idle: true, wip_limit: 2},
        {name: 'QA', id: 10, start: false, end: false, idle: false, wip_limit: 1},
        {name: 'Done', id: 11, start: false, end: true, idle: false, wip_limit: 99}
    ];

    flow.items = [
      {name: "Widget a", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget b", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget c", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget o", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget p", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget h", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget i", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget q", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
      {name: "Widget z", column_id: 1, timestamp: 0, times: {active: 0, idle: 0}},
    ];

    flow.itemsInColumn = function(col) {
      let items =  _.filter(flow.items, function(itm) {
        return itm.column_id == col;
      });
      return items;
    };

    flow.columnById = function(col_id) {
      return _.find(flow.columns, function(col) {
        return col.id == col_id;
      });
    };

    flow.moveItem = function() {
      let newTimestamp = new Date();
      let item = _.sample(flow.items);
      let old_column = flow.columnById(item.column_id);
      if (old_column.end) { return; }

      if (!old_column.start) {
        if (old_column.idle) {
          item.times['idle'] = item.times['idle'] + (newTimestamp - item.timestamp);
        }
        else {
          item.times['active'] = item.times['active'] + (newTimestamp - item.timestamp);
        }
      }
      item.timestamp = newTimestamp;
      item.column_id = old_column.id + 1;
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

  });
