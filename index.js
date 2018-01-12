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
  return function defer() {
    const t = [];
    let r;
    try {
      r = func.apply(this, Array.from(arguments).concat([t.push.bind(t)]));
      if (!isPromiseLike(r)) {
        r = resolve(r);
      }
    } catch (err) {
      r = reject(err);
    }
    return r
      .then(res => DigestQueue(t, res, null))
      .catch(err => DigestQueue(t, null, err));
  };
}

module.exports = godefer;
module.exports.godefer = godefer;
module.exports.default = godefer;
