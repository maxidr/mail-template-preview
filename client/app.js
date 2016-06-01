(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var velocity = require('velocityjs');
var parseProperties = require('properties-parser').parse;

//$messages.getMessage('main.message', null, $locale)

function prop(initialValue){
  var prop = initialValue;
  var persistenceKey;

  function persist(value){
    localStorage.setItem(persistenceKey, value);
    prop = value;
  }

  var api = function(){
    return arguments.length === 0 ? prop : persist(arguments[0]);
  };

  api.persistOn = function(key){
    persistenceKey = key;
    prop = localStorage.getItem(persistenceKey);
    return api;
  };

  return api;
}

/*
var properties = prop().persistOn('properties');
var context = prop().persistOn('context');
var content = prop().persistOn('content');
*/

var properties = {};
var context;
var content;

var messages = {
  getMessage: function(key, _, locale) {
    return properties[key];
  }
};

//console.log(velocity.render("string of $name velocity -> $messages.getMessage('test.x', null, 'x')", { name: 'John', messages: messages }));

var codeInput = document.getElementById('codeInput');
var iframe = document.getElementById('output');
var contextEl = document.getElementById('context');
var propertiesEl = document.getElementById('properties');

codeInput.onkeyup = refresh;
codeInput.onchange = refresh;

contextEl.onchange = loadContext;
contextEl.onkeyup = loadContext;

propertiesEl.onchange = loadProperties;
propertiesEl.onkeyup = loadProperties;

function refresh(e){
  catchTab(e);
  content = codeInput.value;
  render();
}

function render(){
  if( !content ) return;
  var templateContext = context || {};
  templateContext.messages = messages;
  iframe.contentDocument.open();
  iframe.contentDocument.write(velocity.render(content, templateContext));
  iframe.contentDocument.close();
  console.log('render');
}

function loadProperties(e){
  properties = parseProperties(propertiesEl.value);
  render();
}

function loadContext(e){
  context = JSON.parse(contextEl.value);
  //context = parseProperties(contextEl.value);
  render();
}

/*
JSON.parse(document.getElementById('context').value)
Object {document: "test"}
*/

function catchTab(e){
  if( !e ) return true;
  if (e.keyCode === 9) {
    // get caret position/selection
    var val = e.target.value;
    var start = e.target.selectionStart;
    var end = e.target.selectionEnd;
    e.target.value = val.substring(0, start) + '\t' + val.substring(end);
    e.target.selectionStart = e.target.selectionEnd = start + 1;
    e.preventDefault();
    return false;
  }
}



// <html><body><h1>test</h1></body></html>

},{"properties-parser":5,"velocityjs":19}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
require("string.prototype.codepointat");
var fs = require("fs");

function Iterator(text) {
	var pos = 0, length = text.length;

	this.peek = function(num) {
		num = num || 0;
		if(pos + num >= length) { return null; }

		return text.charAt(pos + num);
	};
	this.next = function(inc) {
		inc = inc || 1;

		if(pos >= length) { return null; }

		return text.charAt((pos += inc) - inc);
	};
	this.pos = function() {
		return pos;
	};
}

var rWhitespace = /\s/;
function isWhitespace(chr) {
	return rWhitespace.test(chr);
}
function consumeWhiteSpace(iter) {
	var start = iter.pos();

	while(isWhitespace(iter.peek())) { iter.next(); }

	return { type: "whitespace", start: start, end: iter.pos() };
}

function startsComment(chr) {
	return chr === "!" || chr === "#";
}
function isEOL(chr) {
	return chr == null || chr === "\n" || chr === "\r";
}
function consumeComment(iter) {
	var start = iter.pos();

	while(!isEOL(iter.peek())) { iter.next(); }

	return { type: "comment", start: start, end: iter.pos() };
}

function startsKeyVal(chr) {
	return !isWhitespace(chr) && !startsComment(chr);
}
function startsSeparator(chr) {
	return chr === "=" || chr === ":" || isWhitespace(chr);
}
function startsEscapedVal(chr) {
	return chr === "\\";
}
function consumeEscapedVal(iter) {
	var start = iter.pos();

	iter.next(); // move past "\"
	var curChar = iter.next();
	if(curChar === "u") { // encoded unicode char
		iter.next(4); // Read in the 4 hex values
	}

	return { type: "escaped-value", start: start, end: iter.pos() };
}
function consumeKey(iter) {
	var start = iter.pos(), children = [];

	var curChar;
	while((curChar = iter.peek()) !== null) {
		if(startsSeparator(curChar)) { break; }
		if(startsEscapedVal(curChar)) { children.push(consumeEscapedVal(iter)); continue; }

		iter.next();
	}

	return { type: "key", start: start, end: iter.pos(), children: children };
}
function consumeKeyValSeparator(iter) {
	var start = iter.pos();

	var seenHardSep = false, curChar;
	while((curChar = iter.peek()) !== null) {
		if(isEOL(curChar)) { break; }

		if(isWhitespace(curChar)) { iter.next(); continue; }

		if(seenHardSep) { break; }

		seenHardSep = (curChar === ":" || curChar === "=");
		if(seenHardSep) { iter.next(); continue; }

		break; // curChar is a non-separtor char
	}

	return { type: "key-value-separator", start: start, end: iter.pos() };
}
function startsLineBreak(iter) {
	return iter.peek() === "\\" && isEOL(iter.peek(1));
}
function consumeLineBreak(iter) {
	var start = iter.pos();

	iter.next(); // consume \
	if(iter.peek() === "\r") { iter.next(); }
	iter.next(); // consume \n

	var curChar;
	while((curChar = iter.peek()) !== null) {
		if(isEOL(curChar)) { break; }
		if(!isWhitespace(curChar)) { break; }

		iter.next();
	}

	return { type: "line-break", start: start, end: iter.pos() };
}
function consumeVal(iter) {
	var start = iter.pos(), children = [];

	var curChar;
	while((curChar = iter.peek()) !== null) {
		if(startsLineBreak(iter)) { children.push(consumeLineBreak(iter)); continue; }
		if(startsEscapedVal(curChar)) { children.push(consumeEscapedVal(iter)); continue; }
		if(isEOL(curChar)) { break; }

		iter.next();
	}

	return { type: "value", start: start, end: iter.pos(), children: children };
}
function consumeKeyVal(iter) {
	return {
		type: "key-value",
		start: iter.pos(),
		children: [
			consumeKey(iter),
			consumeKeyValSeparator(iter),
			consumeVal(iter)
		],
		end: iter.pos()
	};
}

var renderChild = {
	"escaped-value": function(child, text) {
		var type = text.charAt(child.start + 1);

		if(type === "t") { return "\t"; }
		if(type === "r") { return "\r"; }
		if(type === "n") { return "\n"; }
		if(type === "f") { return "\f"; }
		if(type !== "u") { return type; }

		return String.fromCharCode(parseInt(text.substr(child.start + 2, 4), 16));
	},
	"line-break": function (child, text) {
		return "";
	}
};
function rangeToBuffer(range, text) {
	var start = range.start, buffer = [];

	for(var i = 0; i < range.children.length; i++) {
		var child = range.children[i];

		buffer.push(text.substring(start, child.start));
		buffer.push(renderChild[child.type](child, text));
		start = child.end;
	}
	buffer.push(text.substring(start, range.end));

	return buffer;
}
function rangesToObject(ranges, text) {
	var obj = Object.create(null); // Creates to a true hash map

	for(var i = 0; i < ranges.length; i++) {
		var range = ranges[i];

		if(range.type !== "key-value") { continue; }

		var key = rangeToBuffer(range.children[0], text).join("");
		var val = rangeToBuffer(range.children[2], text).join("");
		obj[key] = val;
	}

	return obj;
}

function stringToRanges(text) {
	var iter = new Iterator(text), ranges = [];

	var curChar;
	while((curChar = iter.peek()) !== null) {
		if(isWhitespace(curChar)) { ranges.push(consumeWhiteSpace(iter)); continue; }
		if(startsComment(curChar)) { ranges.push(consumeComment(iter)); continue; }
		if(startsKeyVal(curChar)) { ranges.push(consumeKeyVal(iter)); continue; }

		throw Error("Something crazy happened. text: '" + text + "'; curChar: '" + curChar + "'");
	}

	return ranges;
}

function isNewLineRange(range) {
	if(!range) { return false; }

	if(range.type === "whitespace") { return true; }

	if(range.type === "literal") {
		return isWhitespace(range.text) && range.text.indexOf("\n") > -1;
	}

	return false;
}

function escapeMaker(escapes) {
	return function escapeKey(key) {
		var zeros = [ "", "0", "00", "000" ];
		var buf = [];

		for(var i = 0; i < key.length; i++) {
			var chr = key.charAt(i);

			if(escapes[chr]) { buf.push(escapes[chr]); continue; }

			var code = chr.codePointAt(0);

			if(code <= 0x7F) { buf.push(chr); continue; }

			var hex = code.toString(16);

			buf.push("\\u");
			buf.push(zeros[4 - hex.length]);
			buf.push(hex);
		}

		return buf.join("");
	};
}

var escapeKey = escapeMaker({ " ": "\\ ", "\n": "\\n", ":": "\\:", "=": "\\=" });
var escapeVal = escapeMaker({ "\n": "\\n" });

function Editor(text, options) {
    if (typeof text === 'object') {
        options = text;
        text = null;
    }
	text = text || "";
    var path = options.path;
    var separator = options.separator || '=';

	var ranges = stringToRanges(text);
	var obj = rangesToObject(ranges, text);
	var keyRange = Object.create(null); // Creates to a true hash map

	for(var i = 0; i < ranges.length; i++) {
		var range = ranges[i];

		if(range.type !== "key-value") { continue; }

		var key = rangeToBuffer(range.children[0], text).join("");
		keyRange[key] = range;
	}

	this.addHeadComment = function(comment) {
		if(comment == null) { return; }

		ranges.unshift({ type: "literal", text: "# " + comment.replace(/\n/g, "\n# ") + "\n" });
	};

	this.get = function(key) { return obj[key]; };
	this.set = function(key, val, comment) {
		if(val == null) { this.unset(key); return; }

		obj[key] = val;
		var escapedKey = escapeKey(key);
		var escapedVal = escapeVal(val);

		var range = keyRange[key];
		if(!range) {
			keyRange[key] = range = {
				type: "literal",
				text: escapedKey + separator + escapedVal
			};

			var prevRange = ranges[ranges.length - 1];
			if(prevRange != null && !isNewLineRange(prevRange)) {
				ranges.push({ type: "literal", text: "\n" });
			}
			ranges.push(range);
		}

		// comment === null deletes comment. if comment === undefined, it's left alone
		if(comment !== undefined) {
			range.comment = comment && "# " + comment.replace(/\n/g, "\n# ") + "\n";
		}

		if(range.type === "literal") {
			range.text = escapedKey + separator + escapedVal;
			if(range.comment != null) { range.text = range.comment + range.text; }
		} else if(range.type === "key-value") {
			range.children[2] = { type: "literal", text: escapedVal };
		} else {
			throw "Unknown node type: " + range.type;
		}
	};
	this.unset = function(key) {
		if(!(key in obj)) { return; }

		var range = keyRange[key];
		var idx = ranges.indexOf(range);

		ranges.splice(idx, (isNewLineRange(ranges[idx + 1]) ? 2 : 1));

		delete keyRange[key];
		delete obj[key];
	};
	this.valueOf = this.toString = function() {
		var buffer = [], stack = [].concat(ranges);

		var node;
		while((node = stack.shift()) != null) {
			switch(node.type) {
				case "literal":
					buffer.push(node.text);
					break;
				case "key":
				case "value":
				case "comment":
				case "whitespace":
				case "key-value-separator":
				case "escaped-value":
				case "line-break":
					buffer.push(text.substring(node.start, node.end));
					break;
				case "key-value":
					Array.prototype.unshift.apply(stack, node.children);
					if(node.comment) { stack.unshift({ type: "literal", text: node.comment }); }
					break;
			}
		}

		return buffer.join("");
	};
	this.save = function(newPath, callback) {
		if(typeof newPath === 'function') {
			callback = newPath;
			newPath = path;
		}
		newPath = newPath || path;

		if(!newPath) {
            if (callback) {
                return callback("Unknown path");
            }
            throw new Error("Unknown path");
        }

        if (callback) {
            fs.writeFile(newPath, this.toString(), callback);
        } else {
            fs.writeFileSync(newPath, this.toString());
        }

	};
}
function createEditor(/*path, options, callback*/) {
    var path, options, callback;
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < args.length; i ++) {
        var arg = args[i];
        if (!path && typeof arg === 'string') {
            path = arg;
        } else if (!options && typeof arg === 'object') {
            options = arg;
        } else if (!callback && typeof arg === 'function') {
            callback = arg;
        }
    }
    options = options || {};
    path = path || options.path;
    callback = callback || options.callback;
    options.path = path;

	if(!path) { return new Editor(options); }

	if(!callback) { return new Editor(fs.readFileSync(path).toString(), options); }

	return fs.readFile(path, function(err, text) {
		if(err) { return callback(err, null); }

		text = text.toString();
		return callback(null, new Editor(text, options));
	});
}

function parse(text) {
	text = text.toString();
	var ranges = stringToRanges(text);
	return rangesToObject(ranges, text);
}

function read(path, callback) {
	if(!callback) { return parse(fs.readFileSync(path)); }

	return fs.readFile(path, function(err, data) {
		if(err) { return callback(err, null); }

		return callback(null, parse(data));
	});
}

module.exports = { parse: parse, read: read, createEditor: createEditor };

},{"fs":2,"string.prototype.codepointat":6}],6:[function(require,module,exports){
/*! http://mths.be/codepointat v0.2.0 by @mathias */
if (!String.prototype.codePointAt) {
	(function() {
		'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var codePointAt = function(position) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			var size = string.length;
			// `ToInteger`
			var index = position ? Number(position) : 0;
			if (index != index) { // better `isNaN`
				index = 0;
			}
			// Account for out-of-bounds indices:
			if (index < 0 || index >= size) {
				return undefined;
			}
			// Get the first code unit
			var first = string.charCodeAt(index);
			var second;
			if ( // check if it’s the start of a surrogate pair
				first >= 0xD800 && first <= 0xDBFF && // high surrogate
				size > index + 1 // there is a next code unit
			) {
				second = string.charCodeAt(index + 1);
				if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
					// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
					return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
				}
			}
			return first;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'codePointAt', {
				'value': codePointAt,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.codePointAt = codePointAt;
		}
	}());
}

},{}],7:[function(require,module,exports){
'use strict';
module.exports = function(Velocity, utils) {

  /**
   * blocks语法处理
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 处理代码库: if foreach macro
     */
    getBlock: function(block) {

      var ast = block[0];
      var ret = '';

      switch (ast.type) {
        case 'if':
          ret = this.getBlockIf(block);
          break;
        case 'foreach':
          ret = this.getBlockEach(block);
          break;
        case 'macro':
          this.setBlockMacro(block);
          break;
        case 'noescape':
          ret = this._render(block.slice(1));
          break;
        case 'define':
          this.setBlockDefine(block);
          break;
        default:
          ret = this._render(block);
      }

      return ret || '';
    },

    /**
     * define
     */
    setBlockDefine: function(block) {
      var ast = block[0];
      var _block = block.slice(1);
      var defines = this.defines;

      defines[ast.id] = _block;
    },

    /**
     * define macro
     */
    setBlockMacro: function(block) {
      var ast = block[0];
      var _block = block.slice(1);
      var macros = this.macros;

      macros[ast.id] = {
        asts: _block,
        args: ast.args
      };
    },

    /**
     * parse macro call
     */
    getMacro: function(ast) {
      var macro = this.macros[ast.id];
      var ret = '';

      if (!macro) {

        var jsmacros = this.jsmacros;
        macro = jsmacros[ast.id];
        var jsArgs = [];

        if (macro && macro.apply) {

          utils.forEach(ast.args, function(a) {
            jsArgs.push(this.getLiteral(a));
          }, this);

          var self = this;

          // bug修复：此处由于闭包特性，导致eval函数执行时的this对象是上一次函数执行时的this对象，渲染时上下文发生错误。
          jsmacros.eval = function() {
            return self.eval.apply(self, arguments);
          };


          try {
            ret = macro.apply(jsmacros, jsArgs);
          } catch (e) {
            var pos = ast.pos;
            var text = Velocity.Helper.getRefText(ast);
            // throws error tree
            var err = '\n      at ' + text + ' L/N ' + pos.first_line + ':' + pos.first_column;
            e.name = '';
            e.message += err;
            throw new Error(e);
          }

        }

      } else {
        var asts = macro.asts;
        var args = macro.args;
        var callArgs = ast.args;
        var local = {};
        var guid = utils.guid();
        var contextId = 'macro:' + ast.id + ':' + guid;

        utils.forEach(args, function(ref, i) {
          if (callArgs[i]) {
            local[ref.id] = this.getLiteral(callArgs[i]);
          } else {
            local[ref.id] = undefined;
          }
        }, this);

        ret = this.eval(asts, local, contextId);
      }

      return ret;
    },

    /**
     * eval
     * @param str {array|string} 需要解析的字符串
     * @param local {object} 局部变量
     * @param contextId {string}
     * @return {string}
     */
    eval: function(str, local, contextId) {

      if (!local) {

        if (utils.isArray(str)) {
          return this._render(str);
        } else {
          return this.evalStr(str);
        }

      } else {

        var asts = [];
        var parse = Velocity.parse;
        contextId = contextId || ('eval:' + utils.guid());

        if (utils.isArray(str)) {

          asts = str;

        } else if (parse) {

          asts = parse(str);

        }

        if (asts.length) {

          this.local[contextId] = local;
          var ret = this._render(asts, contextId);
          this.local[contextId] = {};
          this.conditions.shift();
          this.condition = this.conditions[0] || '';

          return ret;
        }

      }

    },

    /**
     * parse #foreach
     */
    getBlockEach: function(block) {

      var ast = block[0];
      var _from = this.getLiteral(ast.from);
      var _block = block.slice(1);
      var _to = ast.to;
      var local = {
        foreach: {
          count: 0
        }
      };
      var ret = '';
      var guid = utils.guid();
      var contextId = 'foreach:' + guid;

      var type = ({}).toString.call(_from);
      if (!_from || (type !== '[object Array]' && type !== '[object Object]')) {
        return '';
      }

      var len = utils.isArray(_from) ? _from.length : utils.keys(_from).length;

      utils.forEach(_from, function(val, i) {

        if (this._state.break) {
          return;
        }
        // 构造临时变量
        local[_to] = val;
        // TODO: here, the foreach variable give to local, when _from is not an
        // array, count and hasNext would be undefined, also i is not the
        // index.
        local.foreach = {
          count: i + 1,
          index: i,
          hasNext: i + 1 < len
        };
        local.velocityCount = i + 1;

        this.local[contextId] = local;
        ret += this._render(_block, contextId);

      }, this);

      this._state.break = false;
      // 删除临时变量
      this.local[contextId] = {};
      this.conditions.shift();
      this.condition = this.conditions[0] || '';

      return ret;

    },

    /**
     * parse #if
     */
    getBlockIf: function(block) {

      var received = false;
      var asts = [];

      utils.some(block, function(ast) {

        if (ast.condition) {

          if (received) {
            return true;
          }
          received = this.getExpression(ast.condition);

        } else if (ast.type === 'else') {
          if (received) {
            return true;
          }
          received = true;
        } else if (received) {
          asts.push(ast);
        }

        return false;

      }, this);

      return this._render(asts);
    }
  });
};

},{}],8:[function(require,module,exports){
module.exports = function(Velocity, utils) {

  /**
   * compile
   */
  utils.mixin(Velocity.prototype, {
    init: function() {
      this.context = {};
      this.macros = {};
      this.defines = {};
      this.conditions = [];
      this.local = {};
      this.silence = false;
      this.unescape = {};

      var self = this;
      this.directive = {
        stop: function() {
          self._state.stop = true;
          return '';
        }
      };
    },

    /**
     * @param context {object} 上下文环境，数据对象
     * @param macro   {object} self defined #macro
     * @param silent {bool} 如果是true，$foo变量将原样输出
     * @return str
     */
    render: function(context, macros, silence) {

      this.silence = !!silence;
      this.context = context || {};
      this.jsmacros = utils.mixin(macros || {}, this.directive);
      var t1 = utils.now();
      var str = this._render();
      var t2 = utils.now();
      var cost = t2 - t1;

      this.cost = cost;

      return str;
    },

    /**
     * 解析入口函数
     * @param ast {array} 模板结构数组
     * @param contextId {number} 执行环境id，对于macro有局部作用域，变量的设置和
     * 取值，都放在一个this.local下，通过contextId查找
     * @return {string}解析后的字符串
     */
    _render: function(asts, contextId) {

      var str = '';
      asts = asts || this.asts;

      if (contextId) {

        if (contextId !== this.condition &&
            utils.indexOf(contextId, this.conditions) === -1) {
          this.conditions.unshift(contextId);
        }

        this.condition = contextId;

      } else {
        this.condition = null;
      }

      utils.forEach(asts, function(ast) {

        // 进入stop，直接退出
        if (this._state.stop === true) {
          return false;
        }

        switch (ast.type) {
          case 'references':
            str += this.format(this.getReferences(ast, true));
          break;

          case 'set':
            this.setValue(ast);
          break;

          case 'break':
            this._state.break = true;
          break;

          case 'macro_call':
            str += this.getMacro(ast);
          break;

          case 'comment':
          break;

          case 'raw':
            str += ast.value;
          break;

          default:
            str += typeof ast === 'string' ? ast : this.getBlock(ast);
          break;
        }
      }, this);

      return str;
    },
    format: function(value) {
      if (utils.isArray(value)) {
        return "[" + value.map(this.format.bind(this)).join(", ") + "]";
      }

      if (utils.isObject(value)) {
        if (value.toString.toString().indexOf('[native code]') === -1) {
          return value;
        }

        var kvJoin = function(k) { return k + "=" + this.format(value[k]); }.bind(this);
        return "{" + Object.keys(value).map(kvJoin).join(", ") + "}";
      }

      return value;
    }
  });
};

},{}],9:[function(require,module,exports){
module.exports = function(Velocity, utils){
  /**
   * expression运算
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 表达式求值，表达式主要是数学表达式，逻辑运算和比较运算，到最底层数据结构，
     * 基本数据类型，使用 getLiteral求值，getLiteral遇到是引用的时候，使用
     * getReferences求值
     */
    getExpression: function(ast){

      var exp = ast.expression;
      var ret;
      if (ast.type === 'math') {

        switch(ast.operator) {
          case '+':
          ret = this.getExpression(exp[0]) + this.getExpression(exp[1]);
          break;

          case '-':
          ret = this.getExpression(exp[0]) - this.getExpression(exp[1]);
          break;

          case '/':
          ret = this.getExpression(exp[0]) / this.getExpression(exp[1]);
          break;

          case '%':
          ret = this.getExpression(exp[0]) % this.getExpression(exp[1]);
          break;

          case '*':
          ret = this.getExpression(exp[0]) * this.getExpression(exp[1]);
          break;

          case '||':
          ret = this.getExpression(exp[0]) || this.getExpression(exp[1]);
          break;

          case '&&':
          ret = this.getExpression(exp[0]) && this.getExpression(exp[1]);
          break;

          case '>':
          ret = this.getExpression(exp[0]) > this.getExpression(exp[1]);
          break;

          case '<':
          ret = this.getExpression(exp[0]) < this.getExpression(exp[1]);
          break;

          case '==':
          ret = this.getExpression(exp[0]) == this.getExpression(exp[1]);
          break;

          case '>=':
          ret = this.getExpression(exp[0]) >= this.getExpression(exp[1]);
          break;

          case '<=':
          ret = this.getExpression(exp[0]) <= this.getExpression(exp[1]);
          break;

          case '!=':
          ret = this.getExpression(exp[0]) != this.getExpression(exp[1]);
          break;

          case 'minus':
          ret = - this.getExpression(exp[0]);
          break;

          case 'not':
          ret = !this.getExpression(exp[0]);
          break;

          case 'parenthesis':
          ret = this.getExpression(exp[0]);
          break;

          default:
          return;
          // code
        }

        return ret;
      } else {
        return this.getLiteral(ast);
      }
    }
  });
};

},{}],10:[function(require,module,exports){
var utils = require('../utils');
var Helper = require('../helper/index');
function Velocity(asts, config) {
  this.asts = asts;
  this.config = {
    // 自动输出为经过html encode输出
    escape: true,
    // 不需要转义的白名单
    unescape: {}
  };
  utils.mixin(this.config, config);
  this._state = { stop: false, break: false };
  this.init();
}

Velocity.Helper = Helper;
Velocity.prototype = {
  constructor: Velocity
};

require('./blocks')(Velocity, utils);
require('./literal')(Velocity, utils);
require('./references')(Velocity, utils);
require('./set')(Velocity, utils);
require('./expression')(Velocity, utils);
require('./compile')(Velocity, utils);
module.exports = Velocity;

},{"../helper/index":14,"../utils":18,"./blocks":7,"./compile":8,"./expression":9,"./literal":11,"./references":12,"./set":13}],11:[function(require,module,exports){
'use strict';
module.exports = function(Velocity, utils) {
  /**
   * literal解释模块
   * @require {method} getReferences
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 字面量求值，主要包括string, integer, array, map四种数据结构
     * @param literal {object} 定义于velocity.yy文件，type描述数据类型，value属性
     * 是literal值描述
     * @return {object|string|number|array}返回对应的js变量
     */
    getLiteral: function(literal) {

      var type = literal.type;
      var ret = '';

      if (type === 'string') {

        ret = this.getString(literal);

      } else if (type === 'integer') {

        ret = parseInt(literal.value, 10);

      } else if (type === 'decimal') {

        ret = parseFloat(literal.value, 10);

      } else if (type === 'array') {

        ret = this.getArray(literal);

      } else if (type === 'map') {

        ret = {};
        var map = literal.value;

        utils.forEach(map, function(exp, key) {
          ret[key] = this.getLiteral(exp);
        }, this);
      } else if (type === 'bool') {

        if (literal.value === "null") {
          ret = null;
        } else if (literal.value === 'false') {
          ret = false;
        } else if (literal.value === 'true') {
          ret = true;
        }

      } else {

        return this.getReferences(literal);

      }

      return ret;
    },

    /**
     * 对字符串求值，对已双引号字符串，需要做变量替换
     */
    getString: function(literal) {
      var val = literal.value;
      var ret = val;

      if (literal.isEval && (val.indexOf('#') !== -1 ||
            val.indexOf("$") !== -1)) {
        ret = this.evalStr(val);
      }

      return ret;
    },

    /**
     * 对array字面量求值，比如[1, 2]=> [1,2]，[1..5] => [1,2,3,4,5]
     * @param literal {object} array字面量的描述对象，分为普通数组和range数组两种
     * ，和js基本一致
     * @return {array} 求值得到的数组
     */
    getArray: function(literal) {

      var ret = [];

      if (literal.isRange) {

        var begin = literal.value[0];
        if (begin.type === 'references') {
          begin = this.getReferences(begin);
        }

        var end = literal.value[1];
        if (end.type === 'references') {
          end = this.getReferences(end);
        }

        end   = parseInt(end, 10);
        begin = parseInt(begin, 10);

        var i;

        if (!isNaN(begin) && !isNaN(end)) {

          if (begin < end) {
            for (i = begin; i <= end; i++) ret.push(i);
          } else {
            for (i = begin; i >= end; i--) ret.push(i);
          }
        }

      } else {
        utils.forEach(literal.value, function(exp) {
          ret.push(this.getLiteral(exp));
        }, this);
      }

      return ret;
    },

    /**
     * 对双引号字符串进行eval求值，替换其中的变量，只支持最基本的变量类型替换
     */
    evalStr: function(str) {
      var asts = Velocity.parse(str);
      return this._render(asts);
    }
  });
};

},{}],12:[function(require,module,exports){
module.exports = function(Velocity, utils) {

  'use strict';

  function getSize(obj) {

    if (utils.isArray(obj)) {
      return obj.length;
    } else if (utils.isObject(obj)) {
      return utils.keys(obj).length;
    }

    return undefined;
  }

  /**
   * unicode转码
   */
  function convert(str) {

    if (typeof str !== 'string') return str;

    var result = ""
    var escape = false
    var i, c, cstr;

    for (i = 0 ; i < str.length ; i++) {
      c = str.charAt(i);
      if ((' ' <= c && c <= '~') || (c === '\r') || (c === '\n')) {
        if (c === '&') {
          cstr = "&amp;"
          escape = true
        } else if (c === '<') {
          cstr = "&lt;"
          escape = true
        } else if (c === '>') {
          cstr = "&gt;"
          escape = true
        } else {
          cstr = c.toString()
        }
      } else {
        cstr = "&#" + c.charCodeAt().toString() + ";"
      }

      result = result + cstr
    }

    return escape ? result : str
  }

  function getter(base, property) {
    // get(1)
    if (typeof property === 'number') {
      return base[property];
    }

    var letter = property.charCodeAt(0);
    var isUpper = letter < 91;
    var ret = base[property];

    if (ret !== undefined) {
      return ret;
    }

    if (isUpper) {
      // Address => address
      property = String.fromCharCode(letter).toLowerCase() + property.slice(1);
    }

    if (!isUpper) {
      // address => Address
      property = String.fromCharCode(letter).toUpperCase() + property.slice(1);
    }

    return base[property];
  }

  utils.mixin(Velocity.prototype, {
    // 增加某些函数，不需要执行html转义
    addIgnoreEscpape: function(key) {

      if (!utils.isArray(key)) key = [key]

      utils.forEach(key, function(key) {
        this.config.unescape[key] = true
      }, this)

    },

    /**
     * 引用求值
     * @param {object} ast 结构来自velocity.yy
     * @param {bool} isVal 取值还是获取字符串，两者的区别在于，求值返回结果，求
     * 字符串，如果没有返回变量自身，比如$foo
     */
    getReferences: function(ast, isVal) {

      if (ast.prue) {
        var define = this.defines[ast.id];
        if (utils.isArray(define)) {
          return this._render(define);
        }
        if (ast.id in this.config.unescape) ast.prue = false;
      }
      var escape = this.config.escape;

      var isSilent = this.silence || ast.leader === "$!";
      var isfn     = ast.args !== undefined;
      var context  = this.context;
      var ret      = context[ast.id];
      var local    = this.getLocal(ast);

      var text = Velocity.Helper.getRefText(ast);

      if (text in context) {
        return (ast.prue && escape) ? convert(context[text]) : context[text];
      }


      if (ret !== undefined && isfn) {
        ret = this.getPropMethod(ast, context, ast);
      }

      if (local.isLocaled) ret = local['value'];

      if (ast.path && ret !== undefined) {

        utils.some(ast.path, function(property) {

          // 第三个参数，返回后面的参数ast
          ret = this.getAttributes(property, ret, ast);

        }, this);
      }

      if (isVal && ret === undefined) {
        ret = isSilent ? '' : Velocity.Helper.getRefText(ast);
      }

      ret = (ast.prue && escape) ? convert(ret) : ret;

      return ret;
    },

    /**
     * 获取局部变量，在macro和foreach循环中使用
     */
    getLocal: function(ast) {

      var id = ast.id;
      var local = this.local;
      var ret = false;

      var isLocaled = utils.some(this.conditions, function(contextId) {
        var _local = local[contextId];
        if (id in _local) {
          ret = _local[id];
          return true;
        }

        return false;
      }, this);

      return {
        value: ret,
        isLocaled: isLocaled
      };
    },
    /**
     * $foo.bar 属性求值，最后面两个参数在用户传递的函数中用到
     * @param {object} property 属性描述，一个对象，主要包括id，type等定义
     * @param {object} baseRef 当前执行链结果，比如$a.b.c，第一次baseRef是$a,
     * 第二次是$a.b返回值
     * @private
     */
    getAttributes: function(property, baseRef, ast) {
      // fix #54
      if (baseRef === null || baseRef === undefined) {
        return undefined;
      }

      /**
       * type对应着velocity.yy中的attribute，三种类型: method, index, property
       */
      var type = property.type;
      var ret;
      var id = property.id;
      if (type === 'method') {
        ret = this.getPropMethod(property, baseRef, ast);
      } else if (type === 'property') {
        ret = baseRef[id];
      } else {
        ret = this.getPropIndex(property, baseRef);
      }
      return ret;
    },

    /**
     * $foo.bar[1] index求值
     * @private
     */
    getPropIndex: function(property, baseRef) {
      var ast = property.id;
      var key;
      if (ast.type === 'references') {
        key = this.getReferences(ast);
      } else if (ast.type === 'integer') {
        key = ast.value;
      } else {
        key = ast.value;
      }

      return baseRef[key];
    },

    /**
     * $foo.bar()求值
     */
    getPropMethod: function(property, baseRef, ast) {

      var id = property.id;
      var ret = '';

      // getter 处理
      if (id.indexOf('get') === 0 && !(id in baseRef)) {
        if (id.length === 3) {
          // get('address')
          ret = getter(baseRef, this.getLiteral(property.args[0]));
        } else {
          // getAddress()
          ret = getter(baseRef, id.slice(3));
        }

        return ret;

      // setter 处理
      } else if (id.indexOf('set') === 0 && !baseRef[id]) {

        baseRef[id.slice(3)] = this.getLiteral(property.args[0]);
        // $page.setName(123)
        baseRef.toString = function() { return ''; };
        return baseRef;

      } else if (id.indexOf('is') === 0 && !(id in baseRef)) {

        return getter(baseRef, id.slice(2));
      } else if (id === 'keySet') {

        return utils.keys(baseRef);

      } else if (id === 'entrySet') {

        ret = [];
        utils.forEach(baseRef, function(value, key) {
          ret.push({key: key, value: value});
        });

        return ret;

      } else if (id === 'size') {

        return getSize(baseRef);

      } else {

        ret = baseRef[id];
        var args = [];

        utils.forEach(property.args, function(exp) {
          args.push(this.getLiteral(exp));
        }, this);

        if (ret && ret.call) {

          var that = this;

          if(typeof baseRef === 'object' && baseRef){
            baseRef.eval = function() {
              return that.eval.apply(that, arguments);
            };
          }

          try {
            ret = ret.apply(baseRef, args);
          } catch (e) {
            var pos = ast.pos;
            var text = Velocity.Helper.getRefText(ast);
            var err = ' on ' + text + ' at L/N ' +
              pos.first_line + ':' + pos.first_column;
            e.name = '';
            e.message += err;
            throw new Error(e);
          }

        } else {
          ret = undefined;
        }
      }

      return ret;
    }
  })

}

},{}],13:[function(require,module,exports){
module.exports = function(Velocity, utils){
  /**
   * 变量设置
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 获取执行环境，对于macro中定义的变量，为局部变量，不贮存在全局中，执行后销毁
     */
    getContext: function(){
      var condition = this.condition;
      var local = this.local;
      if (condition) {
        return local[condition];
      } else {
        return this.context;
      }
    },
    /**
     * parse #set
     */
    setValue: function(ast){
      var ref = ast.equal[0];
      var context  = this.getContext();

      //see https://github.com/shepherdwind/velocity.js/issues/25
      if (this.condition && this.condition.indexOf('macro:') === 0) {
        context = this.context;
      } else if (this.context[ref.id] != null) {
        context = this.context;
      }

      var valAst = ast.equal[1];
      var val;

      if (valAst.type === 'math') {
        val = this.getExpression(valAst);
      } else {
        val = this.getLiteral(ast.equal[1]);
      }

      if (!ref.path) {

        context[ref.id] = val;

      } else {

        var baseRef = context[ref.id];
        if (typeof baseRef != 'object') {
          baseRef = {};
        }

        context[ref.id] = baseRef;
        var len = ref.path ? ref.path.length: 0;

        //console.log(val);
        utils.some(ref.path, function(exp, i){

          var isEnd = len === i + 1;
          var key = exp.id;
          if (exp.type === 'index')  key = key.value;

          if (isEnd) {
            return baseRef[key] = val;
          }

          baseRef = baseRef[key];

          // such as
          // #set($a.d.c2 = 2)
          // but $a.d is undefined , value set fail
          if (baseRef === undefined) {
            return true;
          }
        });

      }
    }
  });
};

},{}],14:[function(require,module,exports){
var Helper = {};
var utils = require('../utils');
require('./text')(Helper, utils);
module.exports = Helper;

},{"../utils":18,"./text":15}],15:[function(require,module,exports){
module.exports = function(Helper, utils){
  /**
   * 获取引用文本，当引用自身不存在的情况下，需要返回原来的模板字符串
   */
  function getRefText(ast){

    var ret = ast.leader;
    var isFn = ast.args !== undefined;

    if (ast.type === 'macro_call') {
      ret = '#';
    }

    if (ast.isWraped) ret += '{';

    if (isFn) {
      ret += getMethodText(ast);
    } else {
      ret += ast.id;
    }

    utils.forEach(ast.path, function(ref){
      //不支持method并且传递参数
      if (ref.type == 'method') {
        ret += '.' + getMethodText(ref);
      } else if (ref.type == 'index') {

        var text = '';
        var id = ref.id;

        if (id.type === 'integer') {

          text = id.value;

        } else if (id.type === 'string') {

          var sign = id.isEval? '"': "'";
          text = sign + id.value + sign;

        } else {

          text = getRefText(id);

        }

        ret += '[' + text + ']';

      } else if (ref.type == 'property') {

        ret += '.' + ref.id;

      }

    }, this);

    if (ast.isWraped) ret += '}';

    return ret;
  }

  function getMethodText(ref) {

    var args = [];
    var ret = '';

    utils.forEach(ref.args, function(arg){
      args.push(getLiteral(arg));
    });

    ret += ref.id + '(' + args.join(',') + ')';

    return ret;

  }

  function getLiteral(ast){

    var ret = '';

    switch(ast.type) {

      case 'string': {
        var sign = ast.isEval? '"': "'";
        ret = sign + ast.value + sign;
        break;
      }

      case 'integer':
      case 'runt':
      case 'bool'   : {
        ret = ast.value;
        break;
      }

      case 'array': {
        ret = '[';
        var len = ast.value.length - 1;
        utils.forEach(ast.value, function(arg, i){
          ret += getLiteral(arg);
          if (i !== len) ret += ', ';
        });
        ret += ']';
        break;
      }

      default:
        ret = getRefText(ast)
    }

    return ret;
  }

  Helper.getRefText = getRefText;
};

},{}],16:[function(require,module,exports){
'use strict';
var Parser  = require('./parse/index');
var _parse = Parser.parse;
var utils = require('./utils');

var blockTypes = {
  if: true,
  foreach: true,
  macro: true,
  noescape: true,
  define: true
};

var customBlocks = [];

/**
 * @param {string} str string to parse
 * @param {object} blocks self define blocks, such as `#cms(1) hello #end`
 * @param {boolean} ignoreSpace if set true, then ignore the newline trim.
 * @return {array} ast array
 */
var parse = function(str, blocks, ignoreSpace) {
  var asts = _parse(str);
  customBlocks = blocks || {};

  /**
   * remove all newline after all direction such as `#set, #each`
   */
  ignoreSpace || utils.forEach(asts, function trim(ast, i) {
    var TRIM_REG = /^[ \t]*\n/;
    if (ast.type && ast.type !== 'references') {
      var _ast = asts[i + 1];
      if (typeof _ast === 'string' && TRIM_REG.test(_ast)) {
        asts[i + 1] = _ast.replace(TRIM_REG, '');
      }
    }
  });

  var ret = makeLevel(asts);

  return utils.isArray(ret) ? ret : ret.arr;
};

function makeLevel(block, index) {

  var len = block.length;
  index = index || 0;
  var ret = [];
  var ignore = index - 1;

  for (var i = index; i < len; i++) {

    if (i <= ignore) continue;

    var ast = block[i];
    var type = ast.type;

    var isBlockType = blockTypes[type];

    // 自定义类型支持
    if (!isBlockType && ast.type === 'macro_call' && customBlocks[ast.id]) {
      isBlockType = true;
      ast.type = ast.id;
      delete ast.id;
    }

    if (!isBlockType && type !== 'end') {

      ret.push(ast);

    } else if (type === 'end') {

      return {arr: ret, step: i};

    } else {

      var _ret = makeLevel(block, i + 1);
      ignore = _ret.step;
      _ret.arr.unshift(block[i]);
      ret.push(_ret.arr);

    }

  }

  return ret;
}

module.exports = parse;

},{"./parse/index":17,"./utils":18}],17:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,9],$V2=[1,19],$V3=[1,10],$V4=[1,23],$V5=[1,22],$V6=[4,10,11,20,34,35,80],$V7=[1,27],$V8=[1,30],$V9=[1,31],$Va=[4,10,11,20,23,34,35,45,46,47,50,51,52,53,54,55,56,57,58,59,60,61,62,73,80,82,92],$Vb=[1,47],$Vc=[1,52],$Vd=[1,53],$Ve=[1,67],$Vf=[1,68],$Vg=[1,80],$Vh=[1,75],$Vi=[1,91],$Vj=[1,83],$Vk=[1,81],$Vl=[1,86],$Vm=[1,90],$Vn=[1,87],$Vo=[1,88],$Vp=[4,10,11,20,23,34,35,45,46,47,50,51,52,53,54,55,56,57,58,59,60,61,62,72,73,78,80,81,82,92],$Vq=[1,117],$Vr=[1,113],$Vs=[1,114],$Vt=[1,125],$Vu=[23,46,82],$Vv=[2,91],$Vw=[23,45,46,73,82],$Vx=[23,45,46,50,51,52,53,54,55,56,57,58,59,60,61,62,73,80,82],$Vy=[23,45,46,50,51,52,53,54,55,56,57,58,59,60,61,62,73,80,82,94],$Vz=[2,104],$VA=[23,45,46,50,51,52,53,54,55,56,57,58,59,60,61,62,73,80,82,92],$VB=[2,107],$VC=[1,134],$VD=[1,140],$VE=[23,45,46],$VF=[1,145],$VG=[1,146],$VH=[1,147],$VI=[1,148],$VJ=[1,149],$VK=[1,150],$VL=[1,151],$VM=[1,152],$VN=[1,153],$VO=[1,154],$VP=[1,155],$VQ=[1,156],$VR=[1,157],$VS=[23,50,51,52,53,54,55,56,57,58,59,60,61,62],$VT=[46,82],$VU=[2,108],$VV=[23,34],$VW=[1,204],$VX=[1,203],$VY=[46,73],$VZ=[23,50,51],$V_=[23,50,51,52,53,57,58,59,60,61,62],$V$=[23,50,51,57,58,59,60,61,62];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"EOF":4,"statements":5,"statement":6,"references":7,"directives":8,"content":9,"RAW":10,"COMMENT":11,"set":12,"if":13,"elseif":14,"else":15,"end":16,"foreach":17,"break":18,"define":19,"HASH":20,"NOESCAPE":21,"PARENTHESIS":22,"CLOSE_PARENTHESIS":23,"macro":24,"macro_call":25,"SET":26,"equal":27,"IF":28,"expression":29,"ELSEIF":30,"ELSE":31,"END":32,"FOREACH":33,"DOLLAR":34,"ID":35,"IN":36,"array":37,"BREAK":38,"DEFINE":39,"MACRO":40,"macro_args":41,"macro_call_args_all":42,"macro_call_args":43,"literals":44,"SPACE":45,"COMMA":46,"EQUAL":47,"map":48,"math":49,"||":50,"&&":51,"+":52,"-":53,"*":54,"/":55,"%":56,">":57,"<":58,"==":59,">=":60,"<=":61,"!=":62,"parenthesis":63,"!":64,"literal":65,"brace_begin":66,"attributes":67,"brace_end":68,"methodbd":69,"VAR_BEGIN":70,"MAP_BEGIN":71,"VAR_END":72,"MAP_END":73,"attribute":74,"method":75,"index":76,"property":77,"DOT":78,"params":79,"CONTENT":80,"BRACKET":81,"CLOSE_BRACKET":82,"string":83,"number":84,"BOOL":85,"integer":86,"INTEGER":87,"DECIMAL_POINT":88,"STRING":89,"EVAL_STRING":90,"range":91,"RANGE":92,"map_item":93,"MAP_SPLIT":94,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",10:"RAW",11:"COMMENT",20:"HASH",21:"NOESCAPE",22:"PARENTHESIS",23:"CLOSE_PARENTHESIS",26:"SET",28:"IF",30:"ELSEIF",31:"ELSE",32:"END",33:"FOREACH",34:"DOLLAR",35:"ID",36:"IN",38:"BREAK",39:"DEFINE",40:"MACRO",45:"SPACE",46:"COMMA",47:"EQUAL",50:"||",51:"&&",52:"+",53:"-",54:"*",55:"/",56:"%",57:">",58:"<",59:"==",60:">=",61:"<=",62:"!=",64:"!",70:"VAR_BEGIN",71:"MAP_BEGIN",72:"VAR_END",73:"MAP_END",78:"DOT",80:"CONTENT",81:"BRACKET",82:"CLOSE_BRACKET",85:"BOOL",87:"INTEGER",88:"DECIMAL_POINT",89:"STRING",90:"EVAL_STRING",92:"RANGE",94:"MAP_SPLIT"},
productions_: [0,[3,1],[3,2],[5,1],[5,2],[6,1],[6,1],[6,1],[6,1],[6,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,4],[8,1],[8,1],[12,5],[13,5],[14,5],[15,2],[16,2],[17,8],[17,8],[18,2],[19,6],[24,6],[24,5],[41,1],[41,2],[25,5],[25,4],[43,1],[43,1],[43,3],[43,3],[43,3],[43,3],[42,1],[42,2],[42,3],[42,2],[27,3],[29,1],[29,1],[29,1],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,3],[49,1],[49,2],[49,2],[49,1],[49,1],[63,3],[7,5],[7,3],[7,5],[7,3],[7,2],[7,4],[7,2],[7,4],[66,1],[66,1],[68,1],[68,1],[67,1],[67,2],[74,1],[74,1],[74,1],[75,2],[69,4],[69,3],[79,1],[79,1],[79,1],[79,3],[79,3],[77,2],[77,2],[76,3],[76,3],[76,3],[76,2],[76,2],[65,1],[65,1],[65,1],[84,1],[84,3],[84,4],[86,1],[86,2],[83,1],[83,1],[44,1],[44,1],[44,1],[37,3],[37,1],[37,2],[91,5],[91,5],[91,5],[91,5],[48,3],[48,2],[93,3],[93,3],[93,2],[93,5],[93,5],[9,1],[9,1],[9,2],[9,3],[9,3],[9,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return []; 
break;
case 2:
 return $$[$0-1]; 
break;
case 3: case 32: case 36: case 37: case 81: case 89: case 91:
 this.$ = [$$[$0]]; 
break;
case 4: case 33: case 82:
 this.$ = [].concat($$[$0-1], $$[$0]); 
break;
case 5:
 $$[$0]['prue'] = true;  $$[$0].pos = this._$; this.$ = $$[$0]; 
break;
case 6:
 $$[$0].pos = this._$; this.$ = $$[$0]; 
break;
case 7: case 10: case 11: case 12: case 13: case 14: case 15: case 16: case 17: case 19: case 20: case 42: case 43: case 47: case 48: case 49: case 63: case 66: case 67: case 77: case 78: case 79: case 80: case 86: case 94: case 101: case 102: case 107: case 113: case 115: case 128: case 129:
 this.$ = $$[$0]; 
break;
case 8:
 this.$ = {type: 'raw', value: $$[$0] }; 
break;
case 9:
 this.$ = {type: 'comment', value: $$[$0] }; 
break;
case 18:
 this.$ = { type: 'noescape' }; 
break;
case 21:
 this.$ = {type: 'set', equal: $$[$0-1] }; 
break;
case 22:
 this.$ = {type: 'if', condition: $$[$0-1] }; 
break;
case 23:
 this.$ = {type: 'elseif', condition: $$[$0-1] }; 
break;
case 24:
 this.$ = {type: 'else' }; 
break;
case 25:
 this.$ = {type: 'end' }; 
break;
case 26: case 27:
 this.$ = {type: 'foreach', to: $$[$0-3], from: $$[$0-1] }; 
break;
case 28:
 this.$ = {type: $$[$0] }; 
break;
case 29:
 this.$ = {type: 'define', id: $$[$0-1] }; 
break;
case 30:
 this.$ = {type: 'macro', id: $$[$0-2], args: $$[$0-1] }; 
break;
case 31:
 this.$ = {type: 'macro', id: $$[$0-1] }; 
break;
case 34:
 this.$ = { type:"macro_call", id: $$[$0-3].replace(/^\s+|\s+$/g, ''), args: $$[$0-1] }; 
break;
case 35:
 this.$ = { type:"macro_call", id: $$[$0-2].replace(/^\s+|\s+$/g, '') }; 
break;
case 38: case 39: case 40: case 41: case 92: case 93:
 this.$ = [].concat($$[$0-2], $$[$0]); 
break;
case 44: case 45: case 96: case 97:
 this.$ = $$[$0-1]; 
break;
case 46:
 this.$ = [$$[$0-2], $$[$0]]; 
break;
case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: case 58: case 59: case 60: case 61: case 62:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: $$[$0-1] }; 
break;
case 64:
 this.$ = {type: 'math', expression: [$$[$0]], operator: 'minus' }; 
break;
case 65:
 this.$ = {type: 'math', expression: [$$[$0]], operator: 'not' }; 
break;
case 68:
 this.$ = {type: 'math', expression: [$$[$0-1]], operator: 'parenthesis' }; 
break;
case 69:
 this.$ = {type: "references", id: $$[$0-2], path: $$[$0-1], isWraped: true, leader: $$[$0-4] }; 
break;
case 70:
 this.$ = {type: "references", id: $$[$0-1], path: $$[$0], leader: $$[$0-2] }; 
break;
case 71:
 this.$ = {type: "references", id: $$[$0-2].id, path: $$[$0-1], isWraped: true, leader: $$[$0-4], args: $$[$0-2].args }; 
break;
case 72:
 this.$ = {type: "references", id: $$[$0-1].id, path: $$[$0], leader: $$[$0-2], args: $$[$0-1].args }; 
break;
case 73:
 this.$ = {type: "references", id: $$[$0], leader: $$[$0-1] }; 
break;
case 74:
 this.$ = {type: "references", id: $$[$0-1], isWraped: true, leader: $$[$0-3] }; 
break;
case 75:
 this.$ = {type: "references", id: $$[$0].id, leader: $$[$0-1], args: $$[$0].args }; 
break;
case 76:
 this.$ = {type: "references", id: $$[$0-1].id, isWraped: true, args: $$[$0-1].args, leader: $$[$0-3] }; 
break;
case 83:
 this.$ = {type:"method", id: $$[$0].id, args: $$[$0].args }; 
break;
case 84:
 this.$ = {type: "index", id: $$[$0] }; 
break;
case 85:
 this.$ = {type: "property", id: $$[$0] }; if ($$[$0].type === 'content') this.$ = $$[$0]; 
break;
case 87:
 this.$ = {id: $$[$0-3], args: $$[$0-1] }; 
break;
case 88:
 this.$ = {id: $$[$0-2], args: false }; 
break;
case 90:
 this.$ = [ { type: 'runt', value: $$[$0] } ]; 
break;
case 95:
 this.$ = {type: 'content', value: $$[$0-1] + $$[$0] }; 
break;
case 98:
 this.$ = {type: "content", value: $$[$0-2] + $$[$0-1].value + $$[$0] }; 
break;
case 99: case 100:
 this.$ = {type: "content", value: $$[$0-1] + $$[$0] }; 
break;
case 103:
 this.$ = {type: 'bool', value: $$[$0] }; 
break;
case 104:
 this.$ = {type: "integer", value: $$[$0]}; 
break;
case 105:
 this.$ = {type: "decimal", value: + ($$[$0-2] + '.' + $$[$0]) }; 
break;
case 106:
 this.$ = {type: "decimal", value: - ($$[$0-2] + '.' + $$[$0]) }; 
break;
case 108:
 this.$ = - parseInt($$[$0], 10); 
break;
case 109:
 this.$ = {type: 'string', value: $$[$0] }; 
break;
case 110:
 this.$ = {type: 'string', value: $$[$0], isEval: true }; 
break;
case 111: case 112:
 this.$ = $$[$0];
break;
case 114:
 this.$ = {type: 'array', value: $$[$0-1] }; 
break;
case 116:
 this.$ = {type: 'array', value: [] }; 
break;
case 117: case 118: case 119: case 120:
 this.$ = {type: 'array', isRange: true, value: [$$[$0-3], $$[$0-1]]}; 
break;
case 121:
 this.$ = {type: 'map', value: $$[$0-1] }; 
break;
case 122:
 this.$ = {type: 'map'}; 
break;
case 123: case 124:
 this.$ = {}; this.$[$$[$0-2].value] = $$[$0]; 
break;
case 125:
 this.$ = {}; this.$[$$[$0-1].value] = $$[$01]; 
break;
case 126: case 127:
 this.$ = $$[$0-4]; this.$[$$[$0-2].value] = $$[$0]; 
break;
case 130: case 133:
 this.$ = $$[$0-1] + $$[$0]; 
break;
case 131:
 this.$ = $$[$0-2] + $$[$0-1] + $$[$0]; 
break;
case 132:
 this.$ = $$[$0-2] + $$[$0-1]; 
break;
}
},
table: [{3:1,4:[1,2],5:3,6:4,7:5,8:6,9:7,10:$V0,11:$V1,12:11,13:12,14:13,15:14,16:15,17:16,18:17,19:18,20:$V2,24:20,25:21,34:$V3,35:$V4,80:$V5},{1:[3]},{1:[2,1]},{4:[1,24],6:25,7:5,8:6,9:7,10:$V0,11:$V1,12:11,13:12,14:13,15:14,16:15,17:16,18:17,19:18,20:$V2,24:20,25:21,34:$V3,35:$V4,80:$V5},o($V6,[2,3]),o($V6,[2,5]),o($V6,[2,6]),o($V6,[2,7]),o($V6,[2,8]),o($V6,[2,9]),{35:$V7,66:26,69:28,70:$V8,71:$V9,80:[1,29]},o($V6,[2,10]),o($V6,[2,11]),o($V6,[2,12]),o($V6,[2,13]),o($V6,[2,14]),o($V6,[2,15]),o($V6,[2,16]),o($V6,[2,17]),{21:[1,32],26:[1,35],28:[1,36],30:[1,37],31:[1,38],32:[1,39],33:[1,40],35:[1,34],38:[1,41],39:[1,42],40:[1,43],80:[1,33]},o($V6,[2,19]),o($V6,[2,20]),o($V6,[2,128]),o($V6,[2,129]),{1:[2,2]},o($V6,[2,4]),{35:[1,44],69:45},o($Va,[2,73],{67:46,74:48,75:49,76:50,77:51,22:$Vb,78:$Vc,81:$Vd}),o($Va,[2,75],{74:48,75:49,76:50,77:51,67:54,78:$Vc,81:$Vd}),o($V6,[2,133]),{35:[2,77]},{35:[2,78]},{22:[1,55]},o($V6,[2,130]),{4:[1,57],22:[1,58],80:[1,56]},{22:[1,59]},{22:[1,60]},{22:[1,61]},o($V6,[2,24]),o($V6,[2,25]),{22:[1,62]},o($V6,[2,28]),{22:[1,63]},{22:[1,64]},{22:$Vb,67:65,68:66,72:$Ve,73:$Vf,74:48,75:49,76:50,77:51,78:$Vc,81:$Vd},{67:69,68:70,72:$Ve,73:$Vf,74:48,75:49,76:50,77:51,78:$Vc,81:$Vd},o($Va,[2,70],{75:49,76:50,77:51,74:71,78:$Vc,81:$Vd}),{7:76,23:[1,73],34:$Vg,35:$Vh,37:77,44:74,48:78,53:$Vi,65:79,71:$Vj,79:72,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},o($Vp,[2,81]),o($Vp,[2,83]),o($Vp,[2,84]),o($Vp,[2,85]),{35:[1,93],69:92,80:[1,94]},{7:96,34:$Vg,53:$Vi,65:95,80:[1,97],82:[1,98],83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},o($Va,[2,72],{75:49,76:50,77:51,74:71,78:$Vc,81:$Vd}),{23:[1,99]},o($V6,[2,131]),o($V6,[2,132]),{7:105,23:[1,101],34:$Vg,37:77,42:100,43:102,44:104,45:[1,103],48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{7:107,27:106,34:$Vg},{7:115,22:$Vq,29:108,34:$Vg,37:109,48:110,49:111,53:$Vr,63:112,64:$Vs,65:116,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{7:115,22:$Vq,29:118,34:$Vg,37:109,48:110,49:111,53:$Vr,63:112,64:$Vs,65:116,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{34:[1,119]},{34:[1,120]},{35:[1,121]},{68:122,72:$Ve,73:$Vf,74:71,75:49,76:50,77:51,78:$Vc,81:$Vd},o($Va,[2,74]),o($Va,[2,79]),o($Va,[2,80]),{68:123,72:$Ve,73:$Vf,74:71,75:49,76:50,77:51,78:$Vc,81:$Vd},o($Va,[2,76]),o($Vp,[2,82]),{23:[1,124],46:$Vt},o($Vp,[2,88]),o($Vu,[2,89]),o($Vu,[2,90]),o([23,46],$Vv),o($Vw,[2,111]),o($Vw,[2,112]),o($Vw,[2,113]),{35:$V7,66:26,69:28,70:$V8,71:$V9},{7:129,34:$Vg,35:$Vh,37:77,44:74,48:78,53:$Vi,65:79,71:$Vj,79:126,81:$Vk,82:[1,127],83:84,84:85,85:$Vl,86:128,87:$Vm,89:$Vn,90:$Vo,91:82},o($Vw,[2,115]),{73:[1,131],83:132,89:$Vn,90:$Vo,93:130},o($Vx,[2,101]),o($Vx,[2,102]),o($Vx,[2,103]),o($Vy,[2,109]),o($Vy,[2,110]),o($Vx,$Vz),o($VA,$VB,{88:[1,133]}),{87:$VC},o($Vp,[2,86]),o($Vp,[2,94],{22:$Vb}),o($Vp,[2,95]),{80:[1,136],82:[1,135]},{82:[1,137]},o($Vp,[2,99]),o($Vp,[2,100]),o($V6,[2,18]),{23:[1,138]},o($V6,[2,35]),{23:[2,42],45:[1,139],46:$VD},{7:105,34:$Vg,37:77,43:141,44:104,48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},o($VE,[2,36]),o($VE,[2,37]),{23:[1,142]},{47:[1,143]},{23:[1,144]},{23:[2,47]},{23:[2,48]},{23:[2,49],50:$VF,51:$VG,52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL,57:$VM,58:$VN,59:$VO,60:$VP,61:$VQ,62:$VR},o($VS,[2,63]),{22:$Vq,63:158,87:$VC},{7:115,22:$Vq,34:$Vg,49:159,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},o($VS,[2,66]),o($VS,[2,67]),{7:115,22:$Vq,34:$Vg,49:160,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{23:[1,161]},{35:[1,162]},{35:[1,163]},{7:166,23:[1,165],34:$Vg,41:164},o($Va,[2,69]),o($Va,[2,71]),o($Vp,[2,87]),{7:168,34:$Vg,37:77,44:167,48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{46:$Vt,82:[1,169]},o($Vw,[2,116]),o($VT,$Vz,{92:[1,170]}),o($VT,$Vv,{92:[1,171]}),{46:[1,173],73:[1,172]},o($Vw,[2,122]),{94:[1,174]},{87:[1,175]},o($VA,$VU,{88:[1,176]}),o($Vp,[2,96]),o($Vp,[2,98]),o($Vp,[2,97]),o($V6,[2,34]),{7:178,23:[2,45],34:$Vg,37:77,44:177,48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{7:180,34:$Vg,37:77,44:179,48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{23:[2,43],45:[1,181],46:$VD},o($V6,[2,21]),{7:115,22:$Vq,29:182,34:$Vg,37:109,48:110,49:111,53:$Vr,63:112,64:$Vs,65:116,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},o($V6,[2,22]),{7:115,22:$Vq,34:$Vg,49:183,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:184,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:185,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:186,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:187,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:188,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:189,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:190,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:191,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:192,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:193,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:194,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},{7:115,22:$Vq,34:$Vg,49:195,53:$Vr,63:112,64:$Vs,65:116,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo},o($VS,[2,64]),o($VS,[2,65]),{23:[1,196],50:$VF,51:$VG,52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL,57:$VM,58:$VN,59:$VO,60:$VP,61:$VQ,62:$VR},o($V6,[2,23]),{36:[1,197]},{23:[1,198]},{7:200,23:[1,199],34:$Vg},o($V6,[2,31]),o($VV,[2,32]),o($Vu,[2,92]),o($Vu,[2,93]),o($Vw,[2,114]),{7:202,34:$Vg,53:$VW,86:201,87:$VX},{7:206,34:$Vg,53:$VW,86:205,87:$VX},o($Vw,[2,121]),{83:207,89:$Vn,90:$Vo},o($VY,[2,125],{37:77,48:78,65:79,91:82,83:84,84:85,86:89,44:208,7:209,34:$Vg,53:$Vi,71:$Vj,81:$Vk,85:$Vl,87:$Vm,89:$Vn,90:$Vo}),o($Vx,[2,105]),{87:[1,210]},o($VE,[2,38]),o($VE,[2,41]),o($VE,[2,39]),o($VE,[2,40]),{7:178,23:[2,44],34:$Vg,37:77,44:177,48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},{23:[2,46]},o($VZ,[2,50],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL,57:$VM,58:$VN,59:$VO,60:$VP,61:$VQ,62:$VR}),o($VZ,[2,51],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL,57:$VM,58:$VN,59:$VO,60:$VP,61:$VQ,62:$VR}),o($V_,[2,52],{54:$VJ,55:$VK,56:$VL}),o($V_,[2,53],{54:$VJ,55:$VK,56:$VL}),o($VS,[2,54]),o($VS,[2,55]),o($VS,[2,56]),o($V$,[2,57],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL}),o($V$,[2,58],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL}),o($V$,[2,59],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL}),o($V$,[2,60],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL}),o($V$,[2,61],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL}),o($V$,[2,62],{52:$VH,53:$VI,54:$VJ,55:$VK,56:$VL}),o($VS,[2,68]),{7:211,34:$Vg,37:212,81:$Vk,91:82},o($V6,[2,29]),o($V6,[2,30]),o($VV,[2,33]),{82:[1,213]},{82:[1,214]},{82:$VB},{87:[1,215]},{82:[1,216]},{82:[1,217]},{94:[1,218]},o($VY,[2,123]),o($VY,[2,124]),o($Vx,[2,106]),{23:[1,219]},{23:[1,220]},o($Vw,[2,117]),o($Vw,[2,119]),{82:$VU},o($Vw,[2,118]),o($Vw,[2,120]),{7:221,34:$Vg,37:77,44:222,48:78,53:$Vi,65:79,71:$Vj,81:$Vk,83:84,84:85,85:$Vl,86:89,87:$Vm,89:$Vn,90:$Vo,91:82},o($V6,[2,26]),o($V6,[2,27]),o($VY,[2,126]),o($VY,[2,127])],
defaultActions: {2:[2,1],24:[2,2],30:[2,77],31:[2,78],109:[2,47],110:[2,48],182:[2,46],203:[2,107],215:[2,108]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:
                                    var _reg = /\\+$/;
                                    var _esc = yy_.yytext.match(_reg);
                                    var _num = _esc ? _esc[0].length: null;
                                    /*转义实现，非常恶心，暂时没有好的解决方案*/
                                    if (!_num || !(_num % 2)) {
                                      this.begin("mu");
                                    } else {
                                      yy_.yytext = yy_.yytext.replace(/\\$/, '');
                                      this.begin('esc');
                                    }
                                    if (_num > 1) yy_.yytext = yy_.yytext.replace(/(\\\\)+$/, '\\');
                                    if(yy_.yytext) return 80; 
                                  
break;
case 1: 
                                    var _reg = /\\+$/;
                                    var _esc = yy_.yytext.match(_reg);
                                    var _num = _esc ? _esc[0].length: null;
                                    if (!_num || !(_num % 2)) {
                                      this.begin("h");
                                    } else {
                                      yy_.yytext = yy_.yytext.replace(/\\$/, '');
                                      this.begin('esc');
                                    }
                                    if (_num > 1) yy_.yytext = yy_.yytext.replace(/(\\\\)+$/, '\\');
                                    if(yy_.yytext) return 80; 
                                  
break;
case 2: return 80; 
break;
case 3: this.popState(); return 11; 
break;
case 4: this.popState(); yy_.yytext = yy_.yytext.replace(/^#\[\[|\]\]#$/g, ''); return 10
break;
case 5: this.popState(); return 11; 
break;
case 6: return 20; 
break;
case 7: return 26; 
break;
case 8: return 28; 
break;
case 9: return 30; 
break;
case 10: this.popState(); return 31; 
break;
case 11: this.popState(); return 31; 
break;
case 12: this.popState(); return 32; 
break;
case 13: this.popState(); return 38; 
break;
case 14: return 33; 
break;
case 15: return 21; 
break;
case 16: return 39; 
break;
case 17: return 40; 
break;
case 18: return 36; 
break;
case 19: return yy_.yytext; 
break;
case 20: return yy_.yytext; 
break;
case 21: return yy_.yytext; 
break;
case 22: return yy_.yytext; 
break;
case 23: return yy_.yytext; 
break;
case 24: return yy_.yytext; 
break;
case 25: return yy_.yytext; 
break;
case 26: return yy_.yytext; 
break;
case 27: return 34; 
break;
case 28: return 34; 
break;
case 29: return yy_.yytext; 
break;
case 30: return 47; 
break;
case 31:
                                    var len = this.stateStackSize();
                                    if (len >= 2 && this.topState() === 'c' && this.topState(1) === 'run') {
                                      return 45;
                                    }
                                  
break;
case 32: /*ignore whitespace*/ 
break;
case 33: return 71; 
break;
case 34: return 73; 
break;
case 35: return 94; 
break;
case 36: yy.begin = true; return 70; 
break;
case 37: this.popState(); if (yy.begin === true) { yy.begin = false; return 72;} else { return 80; } 
break;
case 38: this.begin("c"); return 22; 
break;
case 39:
                                    if (this.popState() === "c") {
                                      var len = this.stateStackSize();

                                      if (this.topState() === 'run') {
                                        this.popState();
                                        len = len - 1;
                                      }

                                      var tailStack = this.topState(len - 2);
                                      /** 遇到#set(a = b)括号结束后结束状态h*/
                                      if (len === 2 && tailStack === "h"){
                                        this.popState();
                                      } else if (len === 3 && tailStack === "mu" &&  this.topState(len - 3) === "h") {
                                        // issue#7 $foo#if($a)...#end
                                        this.popState();
                                        this.popState();
                                      }

                                      return 23; 
                                    } else {
                                      return 80; 
                                    }
                                  
break;
case 40: this.begin("i"); return 81; 
break;
case 41: 
                                    if (this.popState() === "i") {
                                      return 82; 
                                    } else {
                                      return 80;
                                    }
                                  
break;
case 42: return 92; 
break;
case 43: return 78; 
break;
case 44: return 88; 
break;
case 45: return 46; 
break;
case 46: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2).replace(/\\"/g,'"'); return 90; 
break;
case 47: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2).replace(/\\'/g,"'"); return 89; 
break;
case 48: return 85; 
break;
case 49: return 85; 
break;
case 50: return 85; 
break;
case 51: return 87; 
break;
case 52: return 35; 
break;
case 53: this.begin("run"); return 35; 
break;
case 54: this.begin('h'); return 20; 
break;
case 55: this.popState(); return 80; 
break;
case 56: this.popState(); return 80; 
break;
case 57: this.popState(); return 80; 
break;
case 58: this.popState(); return 4; 
break;
case 59: return 4; 
break;
}
},
rules: [/^(?:[^#]*?(?=\$))/,/^(?:[^\$]*?(?=#))/,/^(?:[^\x00]+)/,/^(?:#\*[\s\S]+?\*#)/,/^(?:#\[\[[\s\S]+?\]\]#)/,/^(?:##[^\n]+)/,/^(?:#(?=[a-zA-Z{]))/,/^(?:set[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:if[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:elseif[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:else\b)/,/^(?:\{else\})/,/^(?:end\b)/,/^(?:break\b)/,/^(?:foreach[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:noescape(?=[^a-zA-Z0-9_]+))/,/^(?:define[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:macro[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:in\b)/,/^(?:[%\+\-\*\/])/,/^(?:<=)/,/^(?:>=)/,/^(?:[><])/,/^(?:==)/,/^(?:\|\|)/,/^(?:&&)/,/^(?:!=)/,/^(?:\$!(?=[{a-zA-Z_]))/,/^(?:\$(?=[{a-zA-Z_]))/,/^(?:!)/,/^(?:=)/,/^(?:[ ]+(?=[^,]))/,/^(?:\s+)/,/^(?:\{)/,/^(?:\})/,/^(?::[\s]*)/,/^(?:\{)/,/^(?:\})/,/^(?:\([\s]*(?=[$'"\[\{\-0-9\w()!]))/,/^(?:\))/,/^(?:\[[\s]*(?=[\-$"'0-9{\[\]]+))/,/^(?:\])/,/^(?:\.\.)/,/^(?:\.(?=[a-zA-Z_]))/,/^(?:\.(?=[\d]))/,/^(?:,[ ]*)/,/^(?:"(\\"|[^\"])*")/,/^(?:'(\\'|[^\'])*')/,/^(?:null\b)/,/^(?:false\b)/,/^(?:true\b)/,/^(?:[0-9]+)/,/^(?:[_a-zA-Z][a-zA-Z0-9_\-]*)/,/^(?:[_a-zA-Z][a-zA-Z0-9_\-]*[ ]*(?=\())/,/^(?:#)/,/^(?:.)/,/^(?:\s+)/,/^(?:[\$#])/,/^(?:$)/,/^(?:$)/],
conditions: {"mu":{"rules":[5,27,28,36,37,38,39,40,41,43,52,54,55,56,58],"inclusive":false},"c":{"rules":[18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,38,39,40,41,43,44,45,46,47,48,49,50,51,52],"inclusive":false},"i":{"rules":[18,19,20,21,22,23,24,25,26,27,28,29,30,32,33,33,34,34,35,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],"inclusive":false},"h":{"rules":[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,27,28,29,30,35,38,39,40,41,43,51,53,55,56,58],"inclusive":false},"esc":{"rules":[57],"inclusive":false},"run":{"rules":[27,28,29,31,32,33,34,35,38,39,40,41,43,44,45,46,47,48,49,50,51,52,55,56,58],"inclusive":false},"INITIAL":{"rules":[0,1,2,59],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":4,"fs":2,"path":3}],18:[function(require,module,exports){
"use strict";
var utils = {};

['forEach', 'some', 'every', 'filter', 'map'].forEach(function(fnName) {
  utils[fnName] = function(arr, fn, context) {
    if (!arr || typeof arr === 'string') return arr;
    context = context || this;
    if (arr[fnName]) {
      return arr[fnName](fn, context);
    } else {
      var keys = Object.keys(arr);
      return keys[fnName](function(key) {
        return fn.call(context, arr[key], key, arr);
      }, context);
    }
  };
});

var number = 0;
utils.guid = function() {
  return number++;
};

utils.mixin = function(to, from) {
  utils.forEach(from, function(val, key) {
    if (utils.isArray(val) || utils.isObject(val)) {
      to[key] = utils.mixin(val, to[key] || {});
    } else {
      to[key] = val;
    }
  });
  return to;
};

utils.isArray = function(obj) {
  return {}.toString.call(obj) === '[object Array]';
};

utils.isObject = function(obj) {
  return {}.toString.call(obj) === '[object Object]';
};

utils.indexOf = function(elem, arr) {
  if (utils.isArray(arr)) {
    return arr.indexOf(elem);
  }
};

utils.keys = Object.keys;
utils.now  = Date.now;

module.exports = utils;

},{}],19:[function(require,module,exports){
'use strict';
var Compile = require('./compile/');
var Helper = require('./helper/index');
var parse = require('./parse');

Compile.parse = parse;

var Velocity = {
  parse: parse,
  Compile: Compile,
  Helper: Helper
};

Velocity.render = function(template, context, macros) {

  var asts = parse(template);
  var compile = new Compile(asts);
  return compile.render(context, macros);
};

module.exports = Velocity;

},{"./compile/":10,"./helper/index":14,"./parse":16}]},{},[1]);
