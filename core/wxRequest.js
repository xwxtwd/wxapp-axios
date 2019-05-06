/**
 * Created by J.Son on 2019/1/29
 */
'use strict';
import utils from "./utils";
import { buildURL} from "./helpers/buildURL";
import enhanceError from "./enhanceError";
function wxAdapter (config) {
  return new Promise(function dispatchWxRequest (resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    // Listen for ready state
    function handleLoad (res) {
      const response = {
        data: res.data,
        status: res.statusCode,
        statusText: res.statusCode,
        headers: res.header,
        config: config,
        request: RequestTask
      };
      settle(resolve, reject, response);

      // Clean up request
      RequestTask = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    function handleAbort (RequestTask) {
      if (!RequestTask) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', RequestTask));

      RequestTask.abort();

      // Clean up request
      RequestTask = null;
    };

    // Handle low level network errors
    function handleError () {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, RequestTask));

      // Clean up request
      RequestTask = null;
    };

    // Handle timeout
    function handleTimeout (RequestTask) {
      if (!RequestTask) {
        return;
      }
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        RequestTask));

      handleAbort(RequestTask);
      // Clean up request
      RequestTask = null;
    };

    // Add headers to the request
    Object.keys(requestHeaders).map(function setRequestHeader (key) {
      if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
        // Remove Content-Type if data is undefined
        delete requestHeaders[key];
      }
    });

    // // Handle progress if needed
    // if (typeof config.onDownloadProgress === 'function') {
    //   request.addEventListener('progress', config.onDownloadProgress);
    // }
    //
    // // Not all browsers support upload events
    // if (typeof config.onUploadProgress === 'function' && request.upload) {
    //   request.upload.addEventListener('progress', config.onUploadProgress);
    // }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled (cancel) {
        if (!RequestTask) {
          return;
        }

        RequestTask.abort();
        reject(cancel);
        // Clean up request
        RequestTask = null;
      });
    }

    if (requestData === undefined) {
      requestData = {};
    }

    // Send the request
    var RequestTask = wx.request({
      url: buildURL(config.url, config.params, config.paramsSerializer),
      method: config.method.toUpperCase(),
      data: requestData,
      header: requestHeaders,
      dataType: 'json',
      responseType: config.responseType,
      fail: handleError,
      success: handleLoad,
      complete: function () {

      }
    });

    if (config.timeout) {
      setTimeout(function () {
        handleTimeout(RequestTask);
      }, config.timeout);
    }
  });
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(response);
  }
};


/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function createError(message, config, code, request, response) {
  const error = new Error(message);
  return enhanceError(error, config, code, request, response);
};
export default wxAdapter
