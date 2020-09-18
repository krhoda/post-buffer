interface Postable {
    postMessage(message: any, transferable?: any): void;
}

type Message = string | object;
type PostBufferResult = [success: boolean, err: string];
type MakeBufferResult = [buf: ArrayBuffer | false, err: string];
type StringBufferResult = [str: string | false, err: string];
type JSONBufferResult = [json: object | false, err: string];

function jsonToBuffer(json: object): MakeBufferResult {
    try {
        let str = JSON.stringify(json);
        return stringToBuffer(str);
    } catch (err) {
        let nextErr = `Error in post-buffer, could not process argument into buffer: ${err}`;
        return [false, nextErr];
    }
}

function stringToBuffer(str: string): MakeBufferResult {
    let errMsg = '';
    try {
        let buffer = new ArrayBuffer(str.length * 2); 
        let bufferView = new Uint16Array(buffer);
        for (let i = 0, stringLength = str.length; i < stringLength; i++) {
            bufferView[i] = str.charCodeAt(i);
        }

        return [buffer, errMsg];
    } catch (err) {
        errMsg = `Error in post-buffer, could not process argument into buffer: ${err}`;
        return [false, errMsg];
    }
}

// bufferToString takes an ArrayBuffer (the result of postBuffer) and decodes it to a plain string
// It returns an array of 2 values, the first being either the decoded string or false literal
// In case a false, the second value is an error message.
export function bufferToString(buffer: ArrayBuffer): StringBufferResult {
    try {
        let result = new Uint16Array(buffer).reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, '');

        return [result, ''];
    } catch (err) {
        let errMsg = `Error in post-buffer, could not process buffer to string, original error: ${err}`;
        return [false, errMsg];
    }
}

// bufferToJSON takes an ArrayBuffer (the result of postBuffer) and decodes it to a parsed JSON object
// It returns an array of 2 values, the first being either the parsed JSON or false literal
// In case a false, the second value is an error message.
export function bufferToJSON(buffer: ArrayBuffer): JSONBufferResult {
    let [str, errMsg] = bufferToString(buffer);
    if (str === false) {
        return [str, errMsg];
    }

    try {
        let obj = JSON.parse(str);
        return [obj, ''];
    } catch (err) {
        errMsg = `Error in post-buffer, could not process buffer to JSON, orginal error: ${err}`;
        return [false, errMsg];
    }
}

// postBuffer expects two arguements, the first being a string or something JSON stringifyable
// the second either being the worker (if the caller is the UI thread) or the scope (if a worker)
// Returns an array of two values, the first is boolean indicating if the operation is successful
// If it failed, the second is the error message.
export function postBuffer(message: Message, postable: Postable): PostBufferResult {
    let buffer: ArrayBuffer | false;
    let errMsg = '';
    if (typeof message === 'object') {
        [buffer, errMsg] = jsonToBuffer(message);
    } else if (typeof message === 'string') {
        [buffer, errMsg] = stringToBuffer(message);
    } else {
        buffer = false;
        errMsg = `Error in post-buffer, Invalid message type passed, must be an Object, Array or string, was ${typeof message}`;
    }

    if (buffer === false) {
        return [buffer, errMsg];
    }

    postable.postMessage(buffer, [buffer]);

    return [true, ''];
}
