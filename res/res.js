'use strict';

exports.ok = function(values,status, res) {
  var data = {
      'status': status,
      'values': values
  };
  res.json(data);
  res.end();
};