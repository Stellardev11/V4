import express from 'express';
import { projectService } from '../services/projectService';

const router = express.Router();

router.post('/create', async (req, res, next) => {
  try {
    const {
      creatorWalletAddress,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals,
      description,
      logoUrl,
      airdropPercent,
      liquidityPercent,
      initialLiquidityXLM,
      eventDurationDays,
      vestingEnabled,
      vestingMonths,
      projectType,
      sorobanContractId,
      assetCode,
      assetIssuer,
    } = req.body;

    if (!creatorWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Creator wallet address is required'
      });
    }

    if (airdropPercent !== undefined && airdropPercent < 0) {
      return res.status(400).json({
        success: false,
        error: 'Airdrop percent must be non-negative'
      });
    }

    if (liquidityPercent !== undefined && liquidityPercent < 0) {
      return res.status(400).json({
        success: false,
        error: 'Liquidity percent must be non-negative'
      });
    }

    let normalizedAirdropPercent = airdropPercent ?? 20;
    let normalizedLiquidityPercent = liquidityPercent ?? 20;

    const total = normalizedAirdropPercent + normalizedLiquidityPercent;
    if (total > 100) {
      normalizedAirdropPercent = (normalizedAirdropPercent / total) * 80;
      normalizedLiquidityPercent = (normalizedLiquidityPercent / total) * 80;
    }

    const normalizedCreatorPercent = 100 - normalizedAirdropPercent - normalizedLiquidityPercent;

    if (normalizedAirdropPercent < 0 || normalizedLiquidityPercent < 0 || normalizedCreatorPercent < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid percentage allocation after normalization'
      });
    }

    if (normalizedAirdropPercent + normalizedLiquidityPercent > 100) {
      return res.status(400).json({
        success: false,
        error: 'Total allocation cannot exceed 100%'
      });
    }

    if (initialLiquidityXLM !== undefined && initialLiquidityXLM < 0) {
      return res.status(400).json({
        success: false,
        error: 'Initial liquidity XLM must be non-negative'
      });
    }

    if (eventDurationDays !== undefined && (eventDurationDays < 1 || eventDurationDays > 365)) {
      return res.status(400).json({
        success: false,
        error: 'Event duration must be between 1 and 365 days'
      });
    }

    const project = await projectService.createProject({
      creatorWalletAddress,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals,
      description,
      logoUrl,
      airdropPercent: normalizedAirdropPercent,
      liquidityPercent: normalizedLiquidityPercent,
      initialLiquidityXLM,
      eventDurationDays,
      vestingEnabled,
      vestingMonths,
      projectType,
      sorobanContractId,
      assetCode,
      assetIssuer,
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req, res, next) => {
  try {
    const projects = await projectService.getActiveProjects();
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.getProject(projectId);
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:projectId/participate', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { participantWalletAddress, xlmAmount, transactionHash } = req.body;

    if (!participantWalletAddress || !xlmAmount || !transactionHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await projectService.participate({
      projectId,
      participantWalletAddress,
      xlmAmount,
      transactionHash,
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:projectId/participations', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const participations = await projectService.getProjectParticipations(projectId);
    res.json({
      success: true,
      data: participations
    });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:walletAddress/participations', async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const participations = await projectService.getUserParticipations(walletAddress);
    res.json({
      success: true,
      data: participations
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:projectId/finalize', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { distributorPublicKey } = req.body;

    if (!distributorPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'distributor public key is required'
      });
    }

    const result = await projectService.finalizeProject(projectId, distributorPublicKey);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
