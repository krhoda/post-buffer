"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postBuffer = exports.bufferToJSON = exports.bufferToString = void 0;
function jsonToBuffer(json) {
    try {
        let str = JSON.stringify(json);
        return stringToBuffer(str);
    }
    catch (err) {
        let nextErr = `Error in post-buffer, could not process argument into buffer: ${err}`;
        return [false, nextErr];
    }
}
function stringToBuffer(str) {
    let errMsg = '';
    try {
        let buffer = new ArrayBuffer(str.length * 2);
        let bufferView = new Uint16Array(buffer);
        for (let i = 0, stringLength = str.length; i < stringLength; i++) {
            bufferView[i] = str.charCodeAt(i);
        }
        return [buffer, errMsg];
    }
    catch (err) {
        errMsg = `Error in post-buffer, could not process argument into buffer: ${err}`;
        return [false, errMsg];
    }
}
// bufferToString takes an ArrayBuffer (the result of postBuffer) and decodes it to a plain string
// It returns an array of 2 values, the first being either the decoded string or false literal
// In case a false, the second value is an error message.
function bufferToString(buffer) {
    try {
        let result = new Uint16Array(buffer).reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, '');
        return [result, ''];
    }
    catch (err) {
        let errMsg = `Error in post-buffer, could not process buffer to string, original error: ${err}`;
        return [false, errMsg];
    }
}
exports.bufferToString = bufferToString;
// bufferToJSON takes an ArrayBuffer (the result of postBuffer) and decodes it to a parsed JSON object
// It returns an array of 2 values, the first being either the parsed JSON or false literal
// In case a false, the second value is an error message.
function bufferToJSON(buffer) {
    let [str, errMsg] = bufferToString(buffer);
    if (str === false) {
        return [str, errMsg];
    }
    try {
        let obj = JSON.parse(str);
        return [obj, ''];
    }
    catch (err) {
        errMsg = `Error in post-buffer, could not process buffer to JSON, orginal error: ${err}`;
        return [false, errMsg];
    }
}
exports.bufferToJSON = bufferToJSON;
// postBuffer expects two arguements, the first being a string or something JSON stringifyable
// the second either being the worker (if the caller is the UI thread) or the scope (if a worker)
// Returns an array of two values, the first is boolean indicating if the operation is successful
// If it failed, the second is the error message.
function postBuffer(message, postable) {
    let buffer;
    let errMsg = '';
    if (typeof message === 'object') {
        [buffer, errMsg] = jsonToBuffer(message);
    }
    else if (typeof message === 'string') {
        [buffer, errMsg] = stringToBuffer(message);
    }
    else {
        buffer = false;
        errMsg = `Error in post-buffer, Invalid message type passed, must be an Object, Array or string, was ${typeof message}`;
    }
    if (buffer === false) {
        return [buffer, errMsg];
    }
    postable.postMessage(buffer, [buffer]);
    return [true, ''];
}
exports.postBuffer = postBuffer;
