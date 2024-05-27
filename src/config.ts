import convict from "convict";
import * as dotenv from "dotenv";
dotenv.config();

const config = convict({
  auth_keypair_path: {
    format: String,
    default: "./auth.json",
    env: "AUTH_KEYPAIR_PATH",
  },
  compute_unit_limit: {
    format: Number,
    default: 200000,
    env: "COMPUTE_UNIT_LIMIT",
  },
  compute_unit_price: {
    format: Number,
    default: 1000,
    env: "COMPUTE_UNIT_PRICE",
  },
  rpc_url: {
    format: String,
    default: "https://api.mainnet-beta.solana.com",
    env: "RPC_URL",
  },
  send_rpc_url: {
    format: String,
    default: "https://api.mainnet-beta.solana.com",
    env: "SEND_RPC_URL",
  },
  num_of_transactions_per_round: {
    format: Number,
    default: 20,
    env: "NUM_OF_TRANSACTIONS_PER_ROUND",
  },
  num_of_rounds: {
    format: Number,
    default: 5,
    env: "NUM_OF_ROUNDS",
  },
  num_of_spam_per_tx: {
    format: Number,
    default: 1,
    env: "NUM_OF_SPAM_PER_TX",
  },
});

config.validate({ allowed: "strict" });

export { config };
