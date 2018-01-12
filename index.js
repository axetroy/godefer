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
 * @param res
 * @param isAsync
 * @param mainFuncErr
 * @returns {Promise.<T>}
 */
function DigestQueue(queue, res, isAsync, mainFuncErr) {
  if (!queue.length) {
    return isAsync
      ? mainFuncErr ? reject(mainFuncErr) : resolve(res)
      : mainFuncErr ? mainFuncErr : res;
  }
  let cb = queue.pop();
  if (isFunction(cb)) {
    let r;
    try {
      r = cb(null, res);
    } catch (_err) {
      console.error(_err);
    }
    if (isPromiseLike(r)) {
      return r
        .then(() => DigestQueue(queue, res, isAsync, mainFuncErr))
        .catch(() => DigestQueue(queue, res, isAsync, mainFuncErr));
    }
  }

  return DigestQueue(queue, res, isAsync, mainFuncErr);
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
      DigestQueue(t, null, false, err);
      throw err;
    }

    if (isPromiseLike(ret)) {
      return ret
        .then(res => DigestQueue(t, res, true, null))
        .catch(err => DigestQueue(t, null, true, err));
    } else {
      return DigestQueue(t, ret, false, null);
    }
  };
}

module.exports = godefer;
module.exports.godefer = godefer;
module.exports.default = godefer;
