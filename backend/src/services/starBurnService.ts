import { db } from '../db';
import { starBurns, pointBalances, projects, wallets, starBurns as starBurnsTable } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { mintService } from './mintService';

export class StarBurnService {
  private mintService: typeof mintService;

  constructor() {
    this.mintService = mintService;
  }

  async burnStarForProject(
    walletAddress: string,
    projectId: string,
    starAmount: number,
    requestId: string
  ) {
    if (!Number.isFinite(starAmount) || starAmount <= 0) {
      throw new Error('Burn amount must be a positive finite number');
    }

    const rounded = Math.round(starAmount * 100) / 100;
    if (Math.abs(starAmount - rounded) > 0.001) {
      throw new Error('Burn amount can have at most 2 decimal places');
    }

    const wallet = await this.mintService.getOrCreateWallet(walletAddress);

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.status !== 'active') {
      throw new Error('Project is not active');
    }

    const now = new Date();
    if (now > new Date(project.eventEndDate)) {
      throw new Error('Project participation period has ended');
    }

    const starDestroyed = Math.round((starAmount * 0.5) * 100) / 100;
    const starToCreator = Math.round((starAmount * 0.5) * 100) / 100;

    let newBalance = 0;

    await db.transaction(async (tx) => {
      const [existingBurn] = await tx
        .select()
        .from(starBurns)
        .where(eq(starBurns.requestId, requestId));

      if (existingBurn) {
        throw new Error('Duplicate request. Burn already processed');
      }

      const lockedBalanceResult = await tx.execute(
        sql`SELECT * FROM ${pointBalances} WHERE ${pointBalances.walletId} = ${wallet.id} FOR UPDATE`
      );
      
      const [lockedBalance] = lockedBalanceResult.rows;

      if (!lockedBalance) {
        throw new Error('Wallet balance not found');
      }

      const currentBalance = parseFloat((lockedBalance as any).star_points || '0');
      if (currentBalance < starAmount) {
        throw new Error(`Insufficient STAR balance. Have ${currentBalance.toFixed(2)}, need ${starAmount.toFixed(2)}`);
      }

      newBalance = currentBalance - starAmount;

      await tx
        .update(pointBalances)
        .set({
          starPoints: newBalance.toFixed(2),
          pointsBurned: sql`${pointBalances.pointsBurned} + ${starAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(pointBalances.walletId, wallet.id));

      await tx
        .update(projects)
        .set({
          totalStarBurned: sql`${projects.totalStarBurned} + ${starAmount}`,
          creatorStarEarned: sql`${projects.creatorStarEarned} + ${starToCreator}`,
          totalParticipations: sql`${projects.totalParticipations} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

      await tx.insert(starBurnsTable).values({
        projectId,
        walletId: wallet.id,
        walletAddress,
        starBurned: starAmount.toFixed(2),
        starToCreator: starToCreator.toFixed(2),
        starDestroyed: starDestroyed.toFixed(2),
        requestId,
      });
    });

    return {
      success: true,
      starBurned: starAmount,
      starDestroyed,
      starToCreator,
      newBalance,
    };
  }

  async getProjectBurns(projectId: string) {
    const burns = await db
      .select({
        id: starBurns.id,
        walletAddress: starBurns.walletAddress,
        starBurned: starBurns.starBurned,
        starToCreator: starBurns.starToCreator,
        starDestroyed: starBurns.starDestroyed,
        createdAt: starBurns.createdAt,
      })
      .from(starBurns)
      .where(eq(starBurns.projectId, projectId))
      .orderBy(sql`${starBurns.createdAt} DESC`);

    return burns;
  }

  async getUserBurns(walletAddress: string) {
    const wallet = await this.mintService.getOrCreateWallet(walletAddress);

    const burns = await db
      .select({
        id: starBurns.id,
        projectId: starBurns.projectId,
        projectName: projects.tokenName,
        projectSymbol: projects.tokenSymbol,
        starBurned: starBurns.starBurned,
        createdAt: starBurns.createdAt,
      })
      .from(starBurns)
      .leftJoin(projects, eq(starBurns.projectId, projects.id))
      .where(eq(starBurns.walletId, wallet.id))
      .orderBy(sql`${starBurns.createdAt} DESC`);

    return burns;
  }

  async getProjectStats(projectId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new Error('Project not found');
    }

    const burns = await db
      .select({
        walletAddress: starBurns.walletAddress,
        totalBurned: sql<string>`SUM(${starBurns.starBurned})`,
      })
      .from(starBurns)
      .where(eq(starBurns.projectId, projectId))
      .groupBy(starBurns.walletAddress);

    const totalBurned = parseFloat(project.totalStarBurned);
    const airdropTokens = parseFloat(project.totalSupply) * (parseFloat(project.airdropPercent) / 100);

    let participantsWithAllocation: Array<{
      walletAddress: string;
      starBurned: number;
      percentage: number;
      tokenAllocation: number;
    }> = [];

    if (totalBurned > 0) {
      participantsWithAllocation = burns.map((b) => {
        const starBurned = parseFloat(b.totalBurned);
        const percentage = (starBurned / totalBurned) * 100;
        const tokenAllocation = (starBurned / totalBurned) * airdropTokens;

        return {
          walletAddress: b.walletAddress,
          starBurned,
          percentage,
          tokenAllocation,
        };
      });
    }

    return {
      projectId: project.id,
      projectName: project.tokenName,
      projectSymbol: project.tokenSymbol,
      totalStarBurned: totalBurned,
      creatorStarEarned: parseFloat(project.creatorStarEarned),
      totalParticipants: project.totalParticipations,
      airdropTokens,
      participants: participantsWithAllocation,
    };
  }
}

export const starBurnService = new StarBurnService();
