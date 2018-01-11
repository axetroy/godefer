const resolve = Promise.resolve.bind(Promise);
const reject = Promise.reject.bind(Promise);

function isPromiseLike(obj) {
  return obj && obj.then && typeof isFunction(obj.then);
}

function isFunction(value) {
  return typeof value === 'function';
}

/**
 * run a queue task until it end
 * @param queue
 * @param ctx
 * @param isAsync
 * @returns {Promise.<T>}
 */
function runQueue(queue, ctx, isAsync) {
  if (!queue.length) return isAsync ? resolve(ctx) : ctx;
  let cb = queue.pop();
  if (isFunction(cb)) {
    const r = cb(ctx);
    if (isPromiseLike(r)) {
      return r.then(() => runQueue(queue, ctx, isAsync)).catch(err => {
        console.error(err);
        return runQueue(queue, ctx, isAsync);
      });
    } else {
      return runQueue(queue, ctx, isAsync);
    }
  } else {
    return runQueue(queue, ctx, isAsync);
  }
}

/**
 * generate a defer function
 * @param func
 * @returns {defer}
 */
function godefer(func) {
  return function defer() {
    const t = [];

    const ret = func.apply(
      this,
      Array.from(arguments).concat([t.push.bind(t)])
    );

    if (isPromiseLike(ret)) {
      return ret
        .then(res => runQueue(t, res, true))
        .catch(res => runQueue(t, res, true).then(err => reject(err)));
    } else {
      return runQueue(t, ret, false);
    }
  };
}

module.exports = godefer;
module.exports.godefer = godefer;
module.exports.default = godefer;
