import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Project, ProjectType, ProjectStatus } from '../types/project'

interface BackendProject {
  id: string
  creatorWalletId: string
  creatorWalletAddress: string
  projectType: string
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  decimals: number
  description: string
  logoUrl?: string
  airdropPercent: string
  liquidityPercent: string
  creatorPercent: string
  initialLiquidityXLM: string
  eventDurationDays: number
  eventStartDate: string
  eventEndDate: string
  status: string
  totalParticipations: number
  totalXlmContributed: string
  totalStarDistributed: string
  totalStarBurned: string
  creatorStarEarned: string
  tokenCreated: boolean
  tokenIssuer?: string
  sorobanContractId?: string
  assetCode?: string
  assetIssuer?: string
  vestingEnabled: boolean
  vestingMonths?: number
  createdAt: string
  updatedAt: string
}

function mapBackendToProject(backendProject: BackendProject): Project {
  return {
    id: backendProject.id,
    creatorWalletId: backendProject.creatorWalletId,
    creatorWalletAddress: backendProject.creatorWalletAddress,
    projectType: backendProject.projectType as ProjectType,
    tokenName: backendProject.tokenName,
    tokenSymbol: backendProject.tokenSymbol,
    totalSupply: backendProject.totalSupply,
    decimals: backendProject.decimals,
    description: backendProject.description,
    logoUrl: backendProject.logoUrl,
    allocation: {
      airdrop: parseFloat(backendProject.airdropPercent),
      liquidity: parseFloat(backendProject.liquidityPercent),
      creator: parseFloat(backendProject.creatorPercent),
    },
    initialLiquidityXLM: backendProject.initialLiquidityXLM,
    event: {
      startDate: backendProject.eventStartDate,
      endDate: backendProject.eventEndDate,
      durationDays: backendProject.eventDurationDays,
    },
    status: backendProject.status as ProjectStatus,
    metrics: {
      totalParticipations: backendProject.totalParticipations,
      totalXlmContributed: backendProject.totalXlmContributed,
      totalStarDistributed: backendProject.totalStarDistributed,
      totalStarBurned: backendProject.totalStarBurned,
      creatorStarEarned: backendProject.creatorStarEarned,
    },
    features: {
      vestingEnabled: backendProject.vestingEnabled,
      vestingMonths: backendProject.vestingMonths,
      tokenCreated: backendProject.tokenCreated,
    },
    sorobanContractId: backendProject.sorobanContractId,
    assetCode: backendProject.assetCode,
    assetIssuer: backendProject.assetIssuer,
    tokenIssuer: backendProject.tokenIssuer,
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
  }
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.getActiveProjects()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch projects')
      }
      const projects = Array.isArray(response.data) ? response.data : [response.data]
      return projects.map(mapBackendToProject)
    },
    staleTime: 30000,
  })
}

export function useProject(id?: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required')
      const response = await api.getProject(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch project')
      }
      return mapBackendToProject(response.data as BackendProject)
    },
    enabled: !!id,
    staleTime: 30000,
  })
}

export function useProjectsByType(type?: ProjectType) {
  return useQuery({
    queryKey: ['projects', 'by-type', type],
    queryFn: async () => {
      const response = await api.getActiveProjects()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch projects')
      }
      const projects = Array.isArray(response.data) ? response.data : [response.data]
      const mappedProjects = projects.map((project: BackendProject) => mapBackendToProject(project))
      
      if (type) {
        return mappedProjects.filter((project: Project) => project.projectType === type)
      }
      return mappedProjects
    },
    enabled: type !== undefined,
    staleTime: 30000,
  })
}
