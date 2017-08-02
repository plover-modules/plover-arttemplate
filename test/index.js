'use strict';


const SafeString = require('plover-util/lib/safe-string');


const fs = require('fs');
const pathUtil = require('path');
const co = require('co');
const Engine = require('..');


const engine = new Engine();
const asyncEngine = new Engine({ async: true });


/* global __dirname */


describe('index', function() {
  it('compile template for render', function() {
    const tpl = '{{name}}';
    const fn = engine.compile(tpl);
    const text = fn({ name: 'plover' });
    text.should.equal('plover');
  });


  it('use art template features', function() {
    const path = pathUtil.join(__dirname, 'fixtures/t2.art');
    const tpl = fs.readFileSync(path, 'utf-8');
    const fn = engine.compile(tpl);
    const context = {
      name: 'Plover',
      version: '1.0.1',
      keywords: ['framework', 'koa', 'es6'],
      tag: 'b',
      showIndexInPage: 1
    };

    context.o = new SafeString('<h1>hello world</h1>');
    context.map = {
      name: 'Plover',
      version: '0.1.0'
    };

    context.format = function(v, postfix) {
      return v + postfix;
    };

    const outpath = pathUtil.join(__dirname, 'fixtures/t2.out');
    const text = fn(context);
    text.replace(/\s+/g, ' ').should
      .equal(fs.readFileSync(outpath, 'utf-8').replace(/\s+/g, ' '));
  });


  it('comple error should throw', function() {
    const tpl = '{{each list as item}}';
    (function() {
      engine.compile(tpl, {});
    }).should.throw();
  });


  it('with async feature', function() {
    const tpl = `
      ABC
      {{async('<div>')}}
      DEF
      {{=async('<div>')}}
      GHI
    `;
    const fn = asyncEngine.compile(tpl);

    return co(function* () {
      const html = yield fn({ async: async });
      const expect = `
      ABC
      async &lt;div&gt;
      DEF
      async <div>
      GHI
      `;
      html.trim().should.equal(expect.trim());
    });
  });


  it('coverage async', function() {
    const tpl = '{{async(123)}}';
    const fn = asyncEngine.compile(tpl);
    return co(function* () {
      const html = yield fn({ async: async });
      html.should.equal('async 123');
    });
  });


  it('with helpers', function() {
    const helpers = {
      formatPrice: function(v) {
        return v.toFixed(2) + '元';
      }
    };
    const art = new Engine({ helpers: helpers });
    const tpl = '{{formatPrice price}}';
    const fn = art.compile(tpl);
    fn({ price: 1 / 3 }).should.equal('0.33元');
  });

  it('config art', function() {
    const config = {
      viewExt: 'html',
      compress: true,
      async: true,
      openTag: '<%',
      closeTag: '%>'
    };
    const art = new Engine(config);
    const tpl = '<% hello %>';
    const fn = art.compile(tpl);
    fn({ hello: 'hello plover' }).should.equal('hello plover');
  });
});


function async(value) {
  return Promise.resolve('async ' + value);
}
