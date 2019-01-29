/**
 * Created by J.Son on 2019/1/29
 */
const InterceptorManager = require('./InterceptorManager');
const mergeConfig = require('./mergeConfig');
const dispatchRequest = require('./dispatchRequest');
class Request {
  interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };

  constructor (instanceConfig) {
    this.defaults = instanceConfig;
  }
  request (config) {
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }
    config = mergeConfig(this.defaults, config);
    config.method = config.method ? config.method.toLowerCase() : 'get';
    const chain = [
      dispatchRequest,
      undefined
    ];
    let promise = Promise.resolve(config);

    this.interceptors.request.forEach(function unshiftRequestInterceptors (interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors (interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }
}

['post', 'put', 'patch', 'delete', 'get', 'head', 'options'].map(method => {
  Request.prototype[method] = function (url, data, config) {
    return this.request(Object.assign(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
module.exports = exports = Request;
module.exports.default = Request;
