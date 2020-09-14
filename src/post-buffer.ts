interface Postable {
    postMessage(message: any, transferable?: any): void;
}

type Message = string | object;

export function jsonToBuffer(json: object): ArrayBuffer | false {
    try {
        let str = JSON.stringify(json);
        return stringToBuffer(str);
    } catch (err) {
        console.error(`Error in post-worker: Could not process argument into buffer: ${err}`);
        return false;
    }
}

export function stringToBuffer(str: string): ArrayBuffer | false {
    try {
        let buffer = new ArrayBuffer(str.length * 2); 
        let bufferView = new Uint16Array(buffer);
        for (let i = 0, stringLength = str.length; i < stringLength; i++) {
            bufferView[i] = str.charCodeAt(i);
        }

        return buffer;
    } catch (err) {
        console.error(`Error in post-worker: Could not process argument into buffer: ${err}`);
        return false;
    }
}

export function bufferToString(buffer: ArrayBuffer): string | false {
    try {
        let result = new Uint16Array(buffer).reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, '');

        return result;
    } catch (err) {
        console.error(`Error in post-worker: Could not process buffer to string: ${err}`);
        return false;
    }
}

export function bufferToJSON(buffer: ArrayBuffer): object | false {
    let str = bufferToString(buffer);
    if (str === false) {
        return str;
    }

    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (err) {
        console.error(`Error in post-worker: Could not process buffer to JSON: ${err}, Target:`);
        return false;
    }
}

export function postBuffer(message: Message, postable?: Postable): boolean {
    let buffer: ArrayBuffer | false;
    if (typeof message === 'object') {
        buffer = jsonToBuffer(message);
        if (buffer === false) {
            return buffer;
        }
    } else if (typeof message === 'string') {
        buffer = stringToBuffer(message);
        if (buffer === false) {
            return buffer;
        }
    } else {
        console.error(`Error in post-worker: Invalid message type passed, must be an Object, Array or string, was ${typeof message}`);
        return false;
    }

    if (postable) {
        postable.postMessage(buffer, [buffer]);
    } else {
        // TODO: Test with worker loader
        this.postMessage(buffer, [buffer]);
    }

    return true;
}