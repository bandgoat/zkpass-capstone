import { type FormEvent, useState } from "react";
import "./App.css";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import type { Result } from "@zkpass/transgate-js-sdk/lib/types";
import { ethers } from "ethers";

export type TransgateError = {
  message: string;
  code: number;
};

const App = () => {
  const requestVerifyMessage = async (
    e: FormEvent,
    appId: string,
    schemaId: string
  ) => {
    e.preventDefault();
    try {
      const connector = new TransgateConnect(appId);
      const isAvailable = await connector.isTransgateAvailable();

      if (isAvailable) {
        const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;

        // Check if provider is available
        if (provider) {
          const signer = await provider.getSigner();
          const recipient = await signer.getAddress();

          // Launch the verification process
          const res = (await connector.launch(schemaId, recipient)) as Result;
          console.log("Result", res);

          // Await the verification result (if the method is asynchronous)
          const verifiedResult = await connector.verifyProofMessageSignature(
            "evm",
            schemaId,
            res
          );

          if (verifiedResult) {
            alert("Verified Result");
            setResult(res);
          } else {
            alert("Verification failed");
          }
        } else {
          console.log("Ethereum provider not found");
        }
      } else {
        console.log(
          "Please install zkPass Transgate from https://chromewebstore.google.com/detail/zkpass-transgate/afkoofjocpbclhnldmmaphappihehpma"
        );
      }
    } catch (error) {
      const transgateError = error as TransgateError;
      alert(`Transgate Error: ${transgateError.message}`);
      console.log(transgateError);
    }
  };

  const [appId, setAppId] = useState<string>("947134aa-f5e7-40b2-bc50-17adb580a265");
  const [schemaId, setSchemaId] = useState<string>("a798aa1704474682b40267aa755cd072");
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [error, setError] = useState<string | null>(null); // Error state for displaying errors in the UI

  return (
    <div className="app">
      <form className="form" onSubmit={(e) => requestVerifyMessage(e, appId, schemaId)}>
        <label htmlFor="app-id">
          AppId:
          <input
            id="app-id"
            type="text"
            placeholder="Your App ID"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
          />
        </label>
        <label htmlFor="schema-id">
          SchemaId:
          <input
            id="schema-id"
            type="text"
            placeholder="Your Schema ID"
            value={schemaId}
            onChange={(e) => setSchemaId(e.target.value)}
          />
        </label>
        <button type="submit">Start Verification</button>
      </form>

      {error && <div className="error">{error}</div>} {/* Display error message if exists */}

      {result !== undefined ? (
        <pre>Result: {JSON.stringify(result, null, 2)}</pre>
      ) : (
        ""
      )}
    </div>
  );
};

export default App;
