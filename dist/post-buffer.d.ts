interface Postable {
    postMessage(message: any, transferable?: any): void;
}
declare type Message = string | object;
declare type PostBufferResult = [success: boolean, err: string];
declare type StringBufferResult = [str: string | false, err: string];
declare type JSONBufferResult = [json: object | false, err: string];
export declare function bufferToString(buffer: ArrayBuffer): StringBufferResult;
export declare function bufferToJSON(buffer: ArrayBuffer): JSONBufferResult;
export declare function postBuffer(message: Message, postable: Postable): PostBufferResult;
export {};
