const isFunction = require('lodash.isfunction');

function isPromiseLike(obj) {
  return obj && obj.then && typeof isFunction(obj.then);
}

/**
 * run a queue task until it end
 * @param queue
 * @param ctx
 * @param isAsync
 * @returns {Promise.<T>}
 */
function runQueue(queue, ctx, isAsync) {
  let cb = queue.pop();
  if (isFunction(cb)) {
    const r = cb(ctx);
    if (isPromiseLike(r)) {
      return r
        .then(() => runQueue(queue, ctx, isAsync))
        .catch(() => runQueue(queue, ctx, isAsync));
    } else {
      return runQueue(queue, ctx, isAsync);
    }
  } else {
    return isAsync ? Promise.resolve(ctx) : ctx;
  }
}

/**
 * generate a defer function
 * @param func
 * @returns {defer}
 */
function godefer(func) {
  return function defer() {
    const task = [];

    const ret = func.apply(
      this,
      [].slice.call(arguments).concat([task.push.bind(task)])
    );

    if (isPromiseLike(ret)) {
      return ret
        .then(res => {
          return runQueue(task, res, true);
        })
        .catch(res => {
          return runQueue(task, res, true).then(err => Promise.reject(err));
        });
    } else {
      return runQueue(task, ret, false);
    }
  };
}

module.exports = godefer;
module.exports.godefer = godefer;
module.exports.default = godefer;
