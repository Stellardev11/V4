export enum ProjectType {
  TOKEN_LAUNCH = 'token_launch',
  AIRDROP = 'airdrop',
  STAR_BURN = 'star_burn',
  LIQUIDITY = 'liquidity'
}

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  UPCOMING = 'upcoming'
}

export interface ProjectMetrics {
  totalParticipations: number
  totalXlmContributed: string
  totalStarDistributed: string
  totalStarBurned: string
  creatorStarEarned: string
  volume24h?: number
  marketCap?: number
  price?: number
  change24h?: number
  holders?: number
  launchProgress?: number
}

export interface ProjectAllocation {
  airdrop: number
  liquidity: number
  creator: number
}

export interface ProjectEvent {
  startDate: string
  endDate: string
  durationDays: number
}

export interface ProjectFeatures {
  vestingEnabled: boolean
  vestingMonths?: number
  tokenCreated: boolean
}

export interface Project {
  id: string
  creatorWalletId: string
  creatorWalletAddress: string
  projectType: ProjectType
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  decimals: number
  description: string
  logoUrl?: string
  allocation: ProjectAllocation
  initialLiquidityXLM: string
  event: ProjectEvent
  status: ProjectStatus
  metrics: ProjectMetrics
  features: ProjectFeatures
  sorobanContractId?: string
  assetCode?: string
  assetIssuer?: string
  tokenIssuer?: string
  createdAt: string
  updatedAt: string
  twitter?: string
  discord?: string
  website?: string
}

export interface ProjectApiResponse {
  success: boolean
  data: Project | Project[]
  error?: string
}
