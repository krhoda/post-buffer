# Post-Buffer 
## 1 function to serialize Objects and String to ArrayBuffers, then transfer them between Worker/UI threads. 
### 2 functions to decode them.

#### Motivation:
Passing messages from the Browser UI thread to [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) allow 2 basic ways to pass messages, the first is to copy the data and allow both threads to manipulate the data independantly. The other way is to "transfer" the memory, making it unavailable on the sending thread. The latter way is less expensive in terms of time and memory management. It's also a real pain -- until now!

#### postBuffer:
The `postBuffer` function takes 2 arguments. The first is the variable to transfer, either a string or a `JSON.stringify`-able Object (thus Arrays, etc also work). The second depends on the caller, if the UI thread, then this argument is the worker to post to. If a worker is the caller, then the current `scope`, often called `this`, is required.

The return value is an array of 2 elements. The first is a boolean indicating success. If success is false, then the second is an error string.

#### bufferToString:
`bufferToString` takes an `ArrayBuffer` (the result of `postBuffer` on the receiving end) and decodes it to a plain string.
It returns an array of 2 values, the first being either the decoded string or false literal.
In case a false, the second value is an error message.

#### bufferToJSON:
`bufferToJSON` takes an `ArrayBuffer` (the result of `postBuffer`) and decodes it to a parsed JSON object.
It returns an array of 2 values, the first being either the parsed JSON or false literal.
In case a false, the second value is an error message.

Complete example is available from [this example repo](https://github.com/krhoda/wasm_webworker_example/tree/pure-javascript-example)

Sample Usage:
App.js (UI Thread):
```javascript
import * as pb from "post-buffer";
...

function App() {
  useEffect(() => {
    echoWorker.onmessage = (msg) => {
      console.log(msg);
      let {data} = msg;
      let [result, errMsg] = pb.bufferToJSON(data);

      if (result) {
        console.log("UI thread heard:")
        console.log(result);
      } else {
        console.error("Error in UI unpacking buffer:")
        console.error(errMsg);
      }
    };
  })

  ...
}
```

echo.worker.js (Worker Thread):
```javascript
const pb = require("post-buffer");

module.exports = function(scope) {
    scope.onmessage = (msg) => {
        let {data} = msg;
        let [result, err] = pb.bufferToJSON(data);
        if (!result) {
            console.error("Err in worker while building buffer:")
            console.error(err);
            return
        }

        console.log("Echo worker heard:");
        console.log(result);
        let [success, err2] = pb.postBuffer(result, scope);
        if (!success) {
            console.error("Err in worker while posting buffer:")
            console.error(err2);
        }
    }
}
```
