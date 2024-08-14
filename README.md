# Demo of new Singleton Paymaster

*NOTE:* This is an experimental API and NOT production ready, schema + format is subject to change.

Running

```bash
pnpm install
pnpm run start
```

## Layout

- `src/index.ts` holds the demo flow.
- `src/erc20PaymasterActions.ts` holds a very barebone wrapper around the erc20 paymaster api. In production, the `erc20PaymasterActions` will be fully fleshed out and part of permissionless.js.
- `src/tokenMap.ts` holds supported tokens. Currently this is a lmit set, in production, there will be more tokens and chains supported.

## Paymaster

At the time of writing, the permissioned erc20 paymaster is only deployed on polygon at address [`0x2Ec2c2D9f5cEdE2b4c8bA9bb26212949a0016195`](https://polygonscan.com/address/0x2Ec2c2D9f5cEdE2b4c8bA9bb26212949a0016195).

## Endpoint Schema

```
{
    "id": 4337,
    "jsonrpc": "2.0",
    "method": "pm_erc20SponsorUserOperation",
    "params": [
        {
            "sender": ...,
            "nonce": ...,
            "factory": ...,
            "factoryData": ...,
            "callData": ...,
            "callGasLimit": ...,
            "verificationGasLimit": ...,
            "preVerificationGas": ...,
            "maxPriorityFeePerGas": "...,
            "maxFeePerGas": ...,
            "paymaster": ...,
            "paymasterVerificationGasLimit": ...,
            "paymasterPostOpGasLimit": ...,
            "paymasterData": ...,
            "signature": ...
        },
        "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // TOKEN
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032"
    ]
}

Response:
{
    "id": 4337,
    "jsonrpc": "2.0",
    "result": {
        "preVerificationGas": "0xd3e3",
        "verificationGasLimit": "0x60b01",
        "callGasLimit": "0x13880",
        "paymasterPostOpGasLimit": "0x0"
        "paymasterVerificationGasLimit": "0x0",
        "paymaster": ...,
        "paymasterData": ...,
    }
}
```

```
{
    "id": 4337,
    "jsonrpc": "2.0",
    "method": "pm_erc20GetMaxCost",
    "params": [
        {
            "sender": ...,
            "nonce": ...,
            "factory": ...,
            "factoryData": ...,
            "callData": ...,
            "callGasLimit": ...,
            "verificationGasLimit": ...,
            "preVerificationGas": ...,
            "maxPriorityFeePerGas": "...,
            "maxFeePerGas": ...,
            "paymaster": ...,
            "paymasterVerificationGasLimit": ...,
            "paymasterPostOpGasLimit": ...,
            "paymasterData": ...,
            "signature": ...
        },
        "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // TOKEN
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032"
    ]
}

Response:
{
    "id": 4337,
    "jsonrpc": "2.0",
    "result": "0x90F560"
}
```

> Schema format and endpoints are subject to change.

