/**
 * Created by J.Son on 2019/1/29
 */
import adapter from "./wxRequest";
const DEFAULT_CONTENT_TYPE = 'application/json';

function normalizeHeaderName (headers, normalizedName) {
  Object.keys(headers).map(function processHeader (name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  });
};

const defaults = {
  adapter,
  transformRequest: [
    function transformRequest (data, headers) {
      if (!headers['Content-Type']) headers['Content-Type'] = DEFAULT_CONTENT_TYPE;
      normalizeHeaderName(headers, 'accept');
      normalizeHeaderName(headers, 'content-type');
      return data;
    }
  ],
  transformResponse: [
    function transformResponse (data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {

        }
      }
      return data;
    }
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  validateStatus: function validateStatus (status) {
    return status >= 200 && status < 300;
  }
};
export default defaults;
