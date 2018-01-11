const isFunction = require('lodash.isfunction');

function defer(func) {
  return function() {
    const task = [];

    // run function and get result
    const ret = func.apply(
      this,
      [].slice.call(arguments).concat([task.push.bind(task)])
    );

    let cb;

    if (ret && ret.then && typeof isFunction(ret.then)) {
      return ret
        .then(res => {
          try {
            while ((cb = task.pop())) {
              isFunction(cb) && cb(res);
            }
          } catch (err) {
            return Promise.reject(err);
          }
          return Promise.resolve(res);
        })
        .catch(res => {
          try {
            while ((cb = task.pop())) {
              isFunction(cb) && cb(res);
            }
          } catch (err) {
            return Promise.reject(err);
          }
          return Promise.reject(res);
        });
    } else {
      while ((cb = task.pop())) {
        isFunction(cb) && cb(ret);
      }
      return ret;
    }
  };
}

module.exports = defer;
module.exports.default = defer;
