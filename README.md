# Solana RPC sendTransaction Benchmark

This repository contains a script designed to evaluate the efficiency of the `sendTransaction` function on a Solana RPC.

## Configuration Parameters

- **`AUTH_KEYPAIR_PATH`**:  
  Path to the JSON file containing your keypair.

- **`RPC_URL`**:  
  The RPC URL used to retrieve block and slot information. For consistent results, use the same `RPC_URL` when testing different `SEND_RPC_URL` endpoints.

- **`SEND_RPC_URL`**:  
  The RPC URL you wish to test. Maintain consistency in other parameters when testing different RPCs to ensure comparable results.

- **`NUM_OF_TRANSACTIONS_PER_ROUND`**:  
  The number of transactions sent together in each round.

- **`NUM_OF_ROUNDS`**:  
  The total number of rounds to run during the test.

- **`COMPUTE_UNIT_LIMIT`**:  
  The compute unit limit set for each transaction.

- **`COMPUTE_UNIT_PRICE`**:  
  The price per compute unit set for the transactions.

- **`NUM_OF_SPAM_PER_TX`**:  
  The number of times to send an individual transaction to the same rpc.

## Usage

Before running the script, ensure that all configuration parameters are set according to your testing requirements. Rename `.env.example` to `.env`, adjust the parameters as needed.

To execute the script, use the following command:

```bash
npm install
npm run start
```

Example output
```bash
Round 0: Tx sent: 20, Tx landed: 3, landing rate: 0.15
Average slot gap: 8, Min slot gap: 8, Max slot gap: 8
Round 1: Tx sent: 20, Tx landed: 0, landing rate: 0.00
Average slot gap: NaN, Min slot gap: Infinity, Max slot gap: -Infinity
Round 2: Tx sent: 20, Tx landed: 3, landing rate: 0.15
Average slot gap: 16, Min slot gap: 3, Max slot gap: 42
Round 3: Tx sent: 20, Tx landed: 2, landing rate: 0.10
Average slot gap: 38.5, Min slot gap: 37, Max slot gap: 40
Round 4: Tx sent: 20, Tx landed: 0, landing rate: 0.00
Average slot gap: NaN, Min slot gap: Infinity, Max slot gap: -Infinity


Overall: Tx sent: 100, Tx landed: 8, landing rate: 0.08
Average slot gap: 18.625, Min slot gap: 3, Max slot gap: 42
```
