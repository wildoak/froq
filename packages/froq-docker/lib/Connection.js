'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Connection {

    constructor(socketPath) {
        this._socketPath = socketPath;
    }

    _qs(query) {
        if (!query) {
            return '';
        }

        return Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
    }

    request({
        path,
        method,
        query = undefined,
        writeStream = undefined,
        headers = {},
        upgrade = undefined
    }) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const pathAndQuery = `${path}?${_this._qs(query)}`;

            const opts = {
                socketPath: _this._socketPath,
                path: pathAndQuery,
                method,
                headers
            };

            const req = _http2.default.request(opts, function () {});

            if (upgrade) {
                req.on('upgrade', upgrade);
            }

            return yield new Promise(function (resolve, reject) {
                req.on('error', reject);
                req.on('response', resolve);

                if (writeStream) {
                    (0, _debug2.default)('writing stream to request');
                    writeStream.pipe(req);
                } else if (upgrade) {
                    (0, _debug2.default)('flush headers');
                    req.flushHeaders();
                } else {
                    (0, _debug2.default)('request end');
                    req.end();
                }
            });
        })();
    }
}
exports.default = Connection;