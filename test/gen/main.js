(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (className) {
    className = className || "spin-kit";
    var output = '<div class="' + className + '">';
    output += '<div class="sk-circle1 sk-child"></div>';
    output += '<div class="sk-circle2 sk-child"></div>';
    output += '<div class="sk-circle3 sk-child"></div>';
    output += '<div class="sk-circle4 sk-child"></div>';
    output += '<div class="sk-circle5 sk-child"></div>';
    output += '<div class="sk-circle6 sk-child"></div>';
    output += '<div class="sk-circle7 sk-child"></div>';
    output += '<div class="sk-circle8 sk-child"></div>';
    output += '<div class="sk-circle9 sk-child"></div>';
    output += '<div class="sk-circle10 sk-child"></div>';
    output += '<div class="sk-circle11 sk-child"></div>';
    output += '<div class="sk-circle12 sk-child"></div>';
    output += '</div>';
    return output;
};

},{}],2:[function(require,module,exports){
var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

},{"../../modules/spin-kit/templates/sk-circle.js":1}]},{},[2]);
