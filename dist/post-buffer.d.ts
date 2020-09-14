interface Postable {
    postMessage(message: any, transferable?: any): void;
}
declare type Message = string | object;
export declare function jsonToBuffer(json: object): ArrayBuffer | false;
export declare function stringToBuffer(str: string): ArrayBuffer | false;
export declare function bufferToString(buffer: ArrayBuffer): string | false;
export declare function bufferToJSON(buffer: ArrayBuffer): object | false;
export declare function postBuffer(message: Message, postable?: Postable): boolean;
export {};
