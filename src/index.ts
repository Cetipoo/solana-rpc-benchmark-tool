import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { connection, sendTransaction } from "./rpc.js";
import { config } from "./config.js";
import * as fs from "fs";
import bs58 from "bs58";

const SEND_RPC_URL = config.get("send_rpc_url");
const NUM_OF_TRANSACTIONS_PER_ROUND = config.get(
  "num_of_transactions_per_round"
);
const NUM_OF_SPAM_PER_TX = config.get("num_of_spam_per_tx");
const NUM_OF_ROUNDS = config.get("num_of_rounds");
const CHECK_LANDED_DELAY_MS = 30000;
let slotGaps: number[] = [];

const payer = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(fs.readFileSync(config.get("auth_keypair_path"), "utf-8"))
  )
);

const setComputeUnitPrice = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: config.get("compute_unit_price"),
});

const setComputeUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({
  units: config.get("compute_unit_limit"),
});

function generateMemoIx(content: string): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
    ],
    data: Buffer.from(content, "utf-8"),
    programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  });
}

async function checkTxStatus(signature: string, slot: number): Promise<number> {
  const txn = await connection
    .getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 10,
    })
    .catch(() => {
      return null;
    });

  if (txn !== null) {
    const slotProcessed = txn.slot - slot;
    console.log(
      `Transaction ${signature} landed in slot ${txn.slot}. Submitted in slot ${slot}. Processed in ${slotProcessed} slots.`
    );
    return slotProcessed;
  } else {
    console.log(`Transaction ${signature} not landed.`);
  }
  return -1;
}

async function benchmark() {
  const txSlots = [];
  const output = [];
  console.log(
    `Benchmarking ${NUM_OF_ROUNDS} rounds with ${NUM_OF_TRANSACTIONS_PER_ROUND} transactions per round.`
  );
  console.log(`RPC URL: ${config.get("rpc_url")}`);
  console.log(`Send RPC URL: ${SEND_RPC_URL}`);
  console.log(`Compute unit price: ${config.get("compute_unit_price")}`);
  console.log(`Compute unit limit: ${config.get("compute_unit_limit")}`);
  for (let i = 0; i < NUM_OF_ROUNDS; i++) {
    console.log(`Round ${i} started.`);
    const transactions = [];
    slotGaps = [];
    const blockhash = await connection.getLatestBlockhash();
    for (let j = 0; j < NUM_OF_TRANSACTIONS_PER_ROUND; j++) {
      const instructions: TransactionInstruction[] = [];
      instructions.push(setComputeUnitPrice);
      instructions.push(setComputeUnitLimit);
      instructions.push(generateMemoIx(`Round ${i}, Transaction ${j}`));
      const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash.blockhash,
        instructions: instructions,
      }).compileToV0Message();
      const tx = new VersionedTransaction(messageV0);
      tx.sign([payer]);
      transactions.push(tx);
    }
    const currentSlot = await connection.getSlot();
    for (const tx of transactions) {
      for (let j = 0; j < NUM_OF_SPAM_PER_TX; j++) {
        sendTransaction(tx, SEND_RPC_URL);
      }
      setTimeout(() => {
        checkTxStatus(bs58.encode(tx.signatures[0]), currentSlot).then(
          (slotProcessed) => slotGaps.push(slotProcessed)
        );
      }, CHECK_LANDED_DELAY_MS);
    }
    console.log(
      `Round ${i} transactions sent. Waiting ${CHECK_LANDED_DELAY_MS}ms to check landed status.`
    );
    // Wait until all transactions are processed
    while (slotGaps.length < NUM_OF_TRANSACTIONS_PER_ROUND) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    txSlots.push(...slotGaps);
    const landedTx = slotGaps.filter((gap) => gap !== -1);
    const landingRate = landedTx.length / NUM_OF_TRANSACTIONS_PER_ROUND;
    const avgSlotGap =
      landedTx.reduce((acc, gap) => acc + gap, 0) / landedTx.length;
    const minSlotGap = Math.min(...landedTx);
    const maxSlotGap = Math.max(...landedTx);
    output.push(
      `Round ${i}: Tx sent: ${NUM_OF_TRANSACTIONS_PER_ROUND}, Tx landed: ${
        landedTx.length
      }, landing rate: ${landingRate.toFixed(2)}`
    );
    output.push(
      `Average slot gap: ${avgSlotGap}, Min slot gap: ${minSlotGap}, Max slot gap: ${maxSlotGap}`
    );
  }
  output.push("\n");
  const landedTx = txSlots.filter((gap) => gap !== -1);
  const landingRate = landedTx.length / txSlots.length;
  const avgSlotGap =
    landedTx.reduce((acc, gap) => acc + gap, 0) / landedTx.length;
  const minSlotGap = Math.min(...landedTx);
  const maxSlotGap = Math.max(...landedTx);
  output.push(
    `Overall: Tx sent: ${txSlots.length}, Tx landed: ${
      landedTx.length
    }, landing rate: ${landingRate.toFixed(2)}`
  );
  output.push(
    `Average slot gap: ${avgSlotGap}, Min slot gap: ${minSlotGap}, Max slot gap: ${maxSlotGap}`
  );
  console.log(output.join("\n"));
}

benchmark();
