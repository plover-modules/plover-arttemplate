'use strict';


const escape = require('escape-html');


module.exports = {
  $string: toString,
  $escape: escapeHtml,
  $each: each,
  $range: range
};


function toString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const type = typeof value;
  return type === 'string' ? value :
      type === 'function' ? toString(value()) : String(value);
}


function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value.toHTML === 'function') {
    return value.toHTML();
  }

  const type = typeof value;
  return type === 'string' ? escape(value) :
    type === 'function' ? escapeHtml(value()) : escape(String(value));
}


function each(data, fn) {
  if (!data) {
    return;
  }

  if (Array.isArray(data)) {
    for (let i = 0, len = data.length; i < len; i++) {
      fn(data[i], i, data);
    }
  } else {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      fn(data[key], key, data);
    }
  }
}


function range(num, from, step) {
  const list = [];
  from = from || 0;
  step = step || 1;
  for (let i = 0; i < num; i++) {
    list.push(from);
    from += step;
  }
  return list;
}
