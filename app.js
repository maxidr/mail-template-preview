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
