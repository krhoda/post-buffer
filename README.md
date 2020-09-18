# Post-Buffer 
## 1 function to serialize Objects and String to ArrayBuffers, then transfer them between threads. 
### 2 functions to decode them.
#### It's this easy:

Samples come from [this example repo](https://github.com/krhoda/wasm_webworker_example/tree/pure-javascript-example)
Sample usage: 
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