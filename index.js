const isFunction = require('lodash.isfunction');

function defer(func) {
  return function() {
    const task = [];

    // run function and get result
    const ret = func.apply(
      this,
      [].slice.call(arguments).concat([task.push.bind(task)])
    );

    if (ret && ret.then && typeof isFunction(ret.then)) {
      return ret
        .then(res => {
          for (let i = task.length - 1; i >= 0; i--) {
            const cb = task[i];
            isFunction(cb) && cb(res);
          }
          return Promise.resolve(res);
        })
        .catch(err => {
          for (let i = task.length - 1; i >= 0; i--) {
            const cb = task[i];
            isFunction(cb) && cb(err);
          }
          return Promise.reject(err);
        });
    } else {
      for (let i = task.length - 1; i >= 0; i--) {
        const cb = task[i];
        isFunction(cb) && cb(ret);
      }
      return ret;
    }
  };
}

module.exports = defer;
module.exports.default = defer;
