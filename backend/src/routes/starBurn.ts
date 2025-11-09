import { Router } from 'express';
import { starBurnService } from '../services/starBurnService';

const router = Router();

router.post('/burn', async (req, res, next) => {
  try {
    const { walletAddress, projectId, starAmount, requestId } = req.body;

    if (!walletAddress || !projectId || !starAmount || !requestId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, projectId, starAmount, requestId',
      });
    }

    const amount = parseFloat(starAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid star amount. Must be a positive number',
      });
    }

    const result = await starBurnService.burnStarForProject(
      walletAddress,
      projectId,
      amount,
      requestId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('Insufficient') || 
        error.message.includes('not found') ||
        error.message.includes('not active') ||
        error.message.includes('ended') ||
        error.message.includes('Duplicate')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

router.get('/project/:projectId/burns', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required',
      });
    }

    const burns = await starBurnService.getProjectBurns(projectId);

    res.json({
      success: true,
      data: burns,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/project/:projectId/stats', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required',
      });
    }

    const stats = await starBurnService.getProjectStats(projectId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

router.get('/user/:walletAddress/burns', async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required',
      });
    }

    const burns = await starBurnService.getUserBurns(walletAddress);

    res.json({
      success: true,
      data: burns,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
