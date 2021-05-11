const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.fulfilledCallbacks = [];
    this.rejectedCallbacks = [];

    let resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        this.fulfilledCallbacks.forEach((fn) => fn());
      }
    };

    let reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        this.rejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 异步执行拿到promise2
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            promiseResolve(x, promise2, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            promiseResolve(x, promise2, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === PENDING) {
        this.fulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              promiseResolve(x, promise2, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.rejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              promiseResolve(x, promise2, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }

  static resolve(val) {
    return new Promise((resolve) => {
      resolve(val);
    });
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }
}

function promiseResolve(x, promise2, resolve, reject) {
  // 如果x是promise2的引用
  if (x === promise2) {
    return reject(new TypeError("引用错误"));
  }
  // 判断x是一个普通值还是一个promise
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 防止不规范的promise
    let called;
    try {
      let then = x.then;
      // 如果x是一个promise
      if (typeof then === "function") {
        then.call(
          x,
          function (y) {
            if (called) return;
            called = true;
            // 递归解析成功后的值
            promiseResolve(y, promise2, resolve, reject);
          },
          function (r) {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        if (called) return;
        called = true;
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // x是一个普通值
    resolve(x);
  }
}

// Promise.prototype.finally 最终的执行结果 不会影响后续的结果
Promise.prototype.finally = function () {
  return this.then(
    (data) => {
      return Promise.resolve(callback()).then(() => data);
    },
    (err) => {
      return Promise.resolve(callback()).then(() => {
        throw err;
      });
    }
  );
};

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let result = [];
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(
        (data) => {
          result[i] = data;
          if (result.length === promises.length) {
            resolve(result);
          }
        },
        (e) => {
          reject(e);
        }
      );
    }
  });
};
