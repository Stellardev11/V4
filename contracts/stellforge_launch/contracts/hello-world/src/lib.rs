#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub creator: Address,
    pub token_id: Address,
    pub total_supply: i128,
    pub airdrop_amount: i128,
    pub liquidity_amount: i128,
    pub claimed: i128,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct UserPoints {
    pub user: Address,
    pub points: i128,
    pub referrals: i128,
}

#[contracttype]
pub enum DataKey {
    Campaign(u64),
    CampaignCount,
    UserPoints(Address),
    UserClaimed(Address, u64),
}

#[contract]
pub struct LaunchManager;

#[contractimpl]
impl LaunchManager {
    /// Create a new token launch campaign
    pub fn create_campaign(
        env: Env,
        creator: Address,
        token_id: Address,
        total_supply: i128,
        airdrop_percent: i128,
        liquidity_percent: i128,
    ) -> u64 {
        creator.require_auth();

        let campaign_id = Self::get_next_campaign_id(&env);
        
        let airdrop_amount = (total_supply * airdrop_percent) / 100;
        let liquidity_amount = (total_supply * liquidity_percent) / 100;

        let campaign = Campaign {
            creator: creator.clone(),
            token_id: token_id.clone(),
            total_supply,
            airdrop_amount,
            liquidity_amount,
            claimed: 0,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
        env.storage().persistent().set(&DataKey::CampaignCount, &(campaign_id + 1));

        campaign_id
    }

    /// Claim airdrop tokens
    pub fn claim_airdrop(
        env: Env,
        campaign_id: u64,
        user: Address,
        amount: i128,
    ) -> bool {
        user.require_auth();

        // Check if already claimed
        if env.storage().persistent().has(&DataKey::UserClaimed(user.clone(), campaign_id)) {
            return false;
        }

        let mut campaign: Campaign = env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or(Campaign {
                creator: user.clone(),
                token_id: user.clone(),
                total_supply: 0,
                airdrop_amount: 0,
                liquidity_amount: 0,
                claimed: 0,
                is_active: false,
            });

        if !campaign.is_active || campaign.claimed + amount > campaign.airdrop_amount {
            return false;
        }

        // Update campaign
        campaign.claimed += amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);

        // Mark as claimed
        env.storage().persistent().set(&DataKey::UserClaimed(user.clone(), campaign_id), &true);

        true
    }

    /// Add points to user
    pub fn add_points(
        env: Env,
        user: Address,
        points: i128,
        referrals: i128,
    ) {
        let mut user_points = Self::get_user_points(&env, &user);
        user_points.points += points;
        user_points.referrals += referrals;

        env.storage().persistent().set(&DataKey::UserPoints(user), &user_points);
    }

    /// Get user points
    pub fn get_user_points(env: &Env, user: &Address) -> UserPoints {
        env.storage()
            .persistent()
            .get(&DataKey::UserPoints(user.clone()))
            .unwrap_or(UserPoints {
                user: user.clone(),
                points: 0,
                referrals: 0,
            })
    }

    /// Get campaign details
    pub fn get_campaign(env: Env, campaign_id: u64) -> Option<Campaign> {
        env.storage().persistent().get(&DataKey::Campaign(campaign_id))
    }

    /// Close campaign
    pub fn close_campaign(env: Env, campaign_id: u64, creator: Address) -> bool {
        creator.require_auth();

        if let Some(mut campaign) = env.storage().persistent().get::<DataKey, Campaign>(&DataKey::Campaign(campaign_id)) {
            if campaign.creator == creator {
                campaign.is_active = false;
                env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
                return true;
            }
        }
        false
    }

    fn get_next_campaign_id(env: &Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_create_campaign() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LaunchManager);
        let client = LaunchManagerClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let token = Address::generate(&env);

        let campaign_id = client.create_campaign(
            &creator,
            &token,
            &1_000_000,
            &50,
            &30,
        );

        assert_eq!(campaign_id, 0);
    }
}
