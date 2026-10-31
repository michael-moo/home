
const Q = require('q');

let va = 0;
const a = () =>{
    va++
    console.log(va);
};

const b = () =>{
    let _b = Q.defer();
    setTimeout(function(){
        console.log('b...')
        _b.resolve(1);
    }, 1000);
    return _b.promise;
};

module.exports = {
    a, b
};
