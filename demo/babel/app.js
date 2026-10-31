
"use strict";

require("babel-polyfill");
//require('core-js');

const a = require('./a');

let run = async () => {
    a.a();
    a.b();
    a.a();
    await a.b();
    a.a();
}

run();
