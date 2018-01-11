const resolve = Promise.resolve.bind(Promise);
const reject = Promise.reject.bind(Promise);

function isPromiseLike(obj) {
  return obj && obj.then && typeof isFunction(obj.then);
}

function isFunction(value) {
  return typeof value === "function";
}

function error() {
  console.error.apply(console, Array.from(arguments));
}

/**
 * run a queue task until it end
 * @param queue
 * @param res
 * @param isAsync
 * @returns {Promise.<T>}
 */
function runQueue(queue, res, isAsync, err) {
  if (!queue.length) return isAsync ? resolve(res) : res;
  let cb = queue.pop();
  if (isFunction(cb)) {
    let r;
    try {
      r = cb(null, res);
    } catch (err) {
      error(err);
    }
    if (isPromiseLike(r)) {
      return r.then(() => runQueue(queue, res, isAsync, err)).catch(err => {
        error(err);
        return runQueue(queue, res, isAsync, err);
      });
    }
  }

  return runQueue(queue, res, isAsync, err);
}

/**
 * generate a defer function
 * @param func
 * @returns {defer}
 */
function godefer(func) {
  return function defer() {
    const t = [];

    let ret;
    let err = null;

    try {
      ret = func.apply(this, Array.from(arguments).concat([t.push.bind(t)]));
    } catch (_err) {
      err = _err;
    }

    if (err) {
      runQueue(t, err, false, err);
      throw err;
    }

    if (isPromiseLike(ret)) {
      return ret
        .then(res => runQueue(t, res, true))
        .catch(err => runQueue(t, err, true, err).then(err => reject(err)));
    } else {
      return runQueue(t, ret, false, err);
    }
  };
}

module.exports = godefer;
module.exports.godefer = godefer;
module.exports.default = godefer;
