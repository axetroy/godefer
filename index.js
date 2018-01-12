const resolve = Promise.resolve.bind(Promise);
const reject = Promise.reject.bind(Promise);

function isPromiseLike(obj) {
  return obj && obj.then && typeof isFunction(obj.then);
}

function isFunction(value) {
  return typeof value === 'function';
}

function isAsyncFunction(value) {
  return Object.prototype.toString.call(value) === '[object AsyncFunction]';
}

/**
 * run a queue task until it end
 * @param queue
 * @param res
 * @param mainFuncErr
 * @returns {Promise.<T>}
 */
function DigestQueue(queue, res, mainFuncErr) {
  if (!queue.length) {
    return mainFuncErr ? reject(mainFuncErr) : resolve(res);
  }
  const cb = queue.pop();
  if (isFunction(cb)) {
    let r;
    try {
      r = cb(mainFuncErr, res);
    } catch (_err) {
      return DigestQueue(queue, res, mainFuncErr || _err);
    }
    if (isPromiseLike(r)) {
      return r
        .then(() => DigestQueue(queue, res, mainFuncErr))
        .catch(err => DigestQueue(queue, res, mainFuncErr || err));
    }
  }
  return DigestQueue(queue, res, mainFuncErr);
}

/**
 * generate a defer function
 * @param func
 * @returns {defer}
 */
function godefer(func) {
  if (!isAsyncFunction(func)) {
    throw new Error('godefer argument only accept async function.');
  }
  return function defer() {
    const t = [];
    return func
      .apply(this, Array.from(arguments).concat([t.push.bind(t)]))
      .then(res => DigestQueue(t, res, null))
      .catch(err => DigestQueue(t, null, err));
  };
}

module.exports = godefer;
module.exports.godefer = godefer;
module.exports.default = godefer;
