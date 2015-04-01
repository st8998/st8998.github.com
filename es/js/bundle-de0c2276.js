(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var d3 = require("d3");
var _ = require("lodash");

var rand = function (upperBound) {
  var lowerBound = arguments[1] === undefined ? 0 : arguments[1];
  return Math.round(Math.random() * (upperBound - lowerBound)) + lowerBound;
};
var toRad = function (angle) {
  return angle * Math.PI / 180;
};

var dims = { height: window.innerHeight - 4, width: window.innerWidth - 4 };
var step = 64;

var center = { y: dims.height / 2, x: dims.width / 2, radius: Math.min(dims.height / 4, dims.width / 4) };

var container = d3.select(".container").append("svg").attr("width", dims.width).attr("height", dims.height).attr("viewBox", "" + step / 2 + " " + step / 2 + " " + (dims.width - step / 2) + " " + (dims.height - step / 2)).attr("transform", "rotate(45, 0, 0)");

var pointAttrs = { cx: function (p) {
    return p.x;
  }, cy: function (p) {
    return p.y;
  }, r: function (p) {
    return p.radius;
  } };

function phase0() {
  return new Promise(function (resolve) {
    container.selectAll("*").remove();
    resolve();
  });
}

function phase1(duration) {
  console.log(duration);
  var scatterFactor = 1 / 4;
  var growFactor = 15;
  var purgeFactor = 3;
  var ease = "sin";
  var angleShift = 30;
  var delay = function (c, i) {
    return rand(1000);
  };

  return new Promise(function (resolve) {
    var points = _.chain(Math.round(dims.height / step)).times(function (row) {
      return _.times(Math.round(dims.width / step), function (col) {
        return { row: row, col: col, radius: 2 };
      });
    }).flatten().map(function (p, i) {
      return _.extend(p, { id: i, x: p.col * step, y: p.row * step, radius: p.radius });
    }).value();

    var circles = container.selectAll("circle").data(points, function (p) {
      return p.id;
    });

    circles.enter().append("circle").attr("fill", d3.rgb(64, 64, 64));
    circles.attr(pointAttrs);

    var gap = center.radius * scatterFactor;
    _.each(points, function (p) {
      var factor = Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2)) / center.radius;
      _.extend(p, {
        x: (p.x - center.x) / factor + center.x + rand(gap, -gap),
        y: (p.y - center.y) / factor + center.y + rand(gap, -gap),
        radius: p.radius = p.id % purgeFactor != 0 ? 0 : p.id * p.id % 53 < 7 ? rand(p.radius * growFactor, p.radius) : p.radius
      });
    });

    _.each(points, function (p) {
      var radius = Math.sqrt(Math.pow(p.y - center.y, 2) + Math.pow(p.x - center.x, 2));
      var angle = Math.atan2(p.y - center.y, p.x - center.x) + toRad(angleShift);
      _.extend(p, { x: Math.cos(angle) * radius + center.x, y: Math.sin(angle) * radius + center.y });
    });

    circles.transition().ease(ease).delay(delay).duration(duration).attr(pointAttrs);

    setTimeout(function () {
      points = _.reject(points, function (p, i) {
        return p.id % purgeFactor != 0;
      });
      circles = container.selectAll("circle").data(points, function (p) {
        return p.id;
      }).exit().remove();

      resolve(points);
    }, duration + 1000);
  });
}

function phase2(points, duration) {
  var ease = "exp-out";
  var delay = function (c, i) {
    return i * 20;
  };

  return new Promise(function (resolve) {
    var connections = _.chain(points).shuffle().groupBy(function (p, i) {
      return Math.floor(i / 2);
    }).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var p1 = _ref2[0];
      var p2 = _ref2[1];
      return { p1: p1, p2: p2 };
    }).value();

    var lines = container.selectAll("line").data(connections);
    lines.enter().insert("line", "circle").attr("stroke-width", 0).attr("stroke", d3.rgb(255, 255, 255)).attr("x1", function (c) {
      return c.p1.x;
    }).attr("y1", function (c) {
      return c.p1.y;
    }).attr("x2", function (c) {
      return c.p1.x;
    }).attr("y2", function (c) {
      return c.p1.y;
    });

    container.selectAll("circle").data(points, function (p) {
      return p.id;
    }).transition().duration(duration).attr(pointAttrs);

    lines.transition().duration(duration).ease(ease).delay(delay).attr("stroke-width", 1).attr("stroke", d3.rgb(228, 228, 228)).attr("x1", function (c) {
      return c.p1.x;
    }).attr("y1", function (c) {
      return c.p1.y;
    }).attr("x2", function (c) {
      return c.p2.x;
    }).attr("y2", function (c) {
      return c.p2.y;
    });

    setTimeout(function () {
      return resolve();
    }, duration + delay(connections[connections.length - 1], connections.length - 1));
  });
}

//phase0()
//  .then(_.partial(phase1, 1000))
//  .then(_.partialRight(phase2, 1000))
//  .then(()=> console.log('FINIOSH'))
//

(function run() {
  phase0().then(_.partial(phase1, 3000)).then(_.partialRight(phase2, 1000)).then(setTimeout(run, 7000));
})();

},{"d3":"d3","lodash":"lodash"}]},{},[1]);
