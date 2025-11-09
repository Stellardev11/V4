import * as StellarSdk from '@stellar/stellar-sdk';

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'testnet';
const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 
  (NETWORK === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org');
const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 
  (NETWORK === 'mainnet' ? 'https://soroban-rpc.mainnet.stellar.org' : 'https://soroban-rpc.testnet.stellar.org');

const CONTRACT_ID_TESTNET = import.meta.env.VITE_LAUNCH_MANAGER_CONTRACT_ID_TESTNET || '';
const CONTRACT_ID_MAINNET = import.meta.env.VITE_LAUNCH_MANAGER_CONTRACT_ID_MAINNET || '';
const CONTRACT_ID = NETWORK === 'mainnet' ? CONTRACT_ID_MAINNET : CONTRACT_ID_TESTNET;

const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);
const sorobanServer = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);

export interface Campaign {
  creator: string;
  token_id: string;
  total_supply: bigint;
  airdrop_amount: bigint;
  liquidity_amount: bigint;
  claimed: bigint;
  is_active: boolean;
}

export interface UserPoints {
  user: string;
  points: bigint;
  referrals: bigint;
}

export class ContractService {
  private contractId: string;

  constructor(contractId: string = CONTRACT_ID) {
    this.contractId = contractId;
  }

  async createCampaign(
    sourceAddress: string,
    tokenId: string,
    totalSupply: bigint,
    airdropPercent: bigint,
    liquidityPercent: bigint
  ): Promise<string> {
    const account = await horizonServer.loadAccount(sourceAddress);
    
    const contract = new StellarSdk.Contract(this.contractId);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK === 'mainnet' 
        ? StellarSdk.Networks.PUBLIC 
        : StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'create_campaign',
          StellarSdk.Address.fromString(sourceAddress).toScVal(),
          StellarSdk.Address.fromString(tokenId).toScVal(),
          StellarSdk.nativeToScVal(totalSupply, { type: 'i128' }),
          StellarSdk.nativeToScVal(airdropPercent, { type: 'i128' }),
          StellarSdk.nativeToScVal(liquidityPercent, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(transaction);
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTx.toXDR();
  }

  async claimAirdrop(
    campaignId: bigint,
    userAddress: string,
    amount: bigint
  ): Promise<string> {
    const account = await horizonServer.loadAccount(userAddress);
    
    const contract = new StellarSdk.Contract(this.contractId);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK === 'mainnet' 
        ? StellarSdk.Networks.PUBLIC 
        : StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'claim_airdrop',
          StellarSdk.nativeToScVal(campaignId, { type: 'u64' }),
          StellarSdk.Address.fromString(userAddress).toScVal(),
          StellarSdk.nativeToScVal(amount, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(transaction);
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTx.toXDR();
  }

  async addPoints(
    userAddress: string,
    points: bigint,
    referrals: bigint
  ): Promise<string> {
    const account = await horizonServer.loadAccount(userAddress);
    
    const contract = new StellarSdk.Contract(this.contractId);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK === 'mainnet' 
        ? StellarSdk.Networks.PUBLIC 
        : StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'add_points',
          StellarSdk.Address.fromString(userAddress).toScVal(),
          StellarSdk.nativeToScVal(points, { type: 'i128' }),
          StellarSdk.nativeToScVal(referrals, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(transaction);
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTx.toXDR();
  }

  async getUserPoints(userAddress: string): Promise<UserPoints | null> {
    try {
      return {
        user: userAddress,
        points: BigInt(0),
        referrals: BigInt(0),
      };
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  async getCampaign(_campaignId: bigint): Promise<Campaign | null> {
    try {
      return null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

}

export const contractService = new ContractService();
