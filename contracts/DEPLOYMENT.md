# Soroban Contract Deployment Guide

## Current Status

✅ Contract Code: Ready (`contracts/stellforge_launch/contracts/hello-world/src/lib.rs`)
✅ Contract Features: Campaign creation, airdrop claims, points tracking
⚠️ Deployment: Pending (requires WASM build environment)

## Environment Issue

The current Nix Rust environment doesn't include the `wasm32v1-none` target required by Stellar CLI. 

## Deployment Options

### Option 1: Deploy with Stellar CLI (Recommended)

**Prerequisites:**
1. Install Rust with rustup: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Add WASM target: `rustup target add wasm32-unknown-unknown`
3. Install Stellar CLI: `cargo install stellar-cli`

**Build and Deploy:**
```bash
# Navigate to contract directory
cd contracts/stellforge_launch/contracts/hello-world

# Build the contract
stellar contract build

# Deploy to Futurenet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source <YOUR_SECRET_KEY> \
  --network futurenet

# Deploy to Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet

# Deploy to Mainnet (production)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source <YOUR_SECRET_KEY> \
  --network mainnet
```

### Option 2: Use Online Build Service

Use Stellar's playground or GitHub Actions to build and deploy:
- https://laboratory.stellar.org/

### Option 3: Docker Build Environment

```bash
# Use official Stellar Soroban Docker image
docker run --rm -v $(pwd):/workspace \
  stellar/quickstart:soroban-dev \
  bash -c "cd /workspace/contracts/stellforge_launch/contracts/hello-world && stellar contract build"
```

## After Deployment

1. Save the contract ID returned by the deploy command
2. Update `frontend/.env` with:
   ```
   VITE_CONTRACT_ID=<YOUR_CONTRACT_ID>
   VITE_NETWORK=testnet
   ```
3. Generate TypeScript bindings:
   ```bash
   stellar contract bindings typescript \
     --contract-id <CONTRACT_ID> \
     --network testnet \
     --output-dir frontend/src/contracts
   ```
4. Restart the frontend to use the deployed contract

## Contract Functions

### create_campaign
Create a token launch campaign
- Returns: Campaign ID

### claim_airdrop
Claim airdrop tokens
- Returns: Success boolean

### add_points
Add points to user account

### get_user_points
Get user's points and referrals

### get_campaign
Get campaign details

### close_campaign
Close a campaign (creator only)
