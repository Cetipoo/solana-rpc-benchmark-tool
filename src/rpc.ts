import { Connection, VersionedTransaction } from "@solana/web3.js";
import { config } from "./config.js";
import bs58 from "bs58";
import axios from "axios";

const RPC_URL = config.get("rpc_url");

const connection: Connection = new Connection(RPC_URL, {
  commitment: "processed",
});

// Function to call the sendTransaction method
async function sendTransaction(transaction: VersionedTransaction, url: string) {
  // Prepare the JSON-RPC request payload
  const rpcPayload = {
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [
      bs58.encode(transaction.serialize()),
      {
        encoding: "base58",
        skipPreflight: true,
        preflightCommitment: "processed",
        maxRetries: 0,
      },
    ],
    id: bs58.encode(transaction.signatures[0]),
  };
  try {
    await axios.post(url, rpcPayload);
  } catch (error) {
    console.log(error);
  }
  return transaction.signatures[0];
}

export { connection, sendTransaction };
