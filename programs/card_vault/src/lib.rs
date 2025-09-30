// Anchor program skeleton for CardVault (stub)
// This is a placeholder; wire real CPI to token program and swap router in production.

use anchor_lang::prelude::*;

declare_id!("CardVault111111111111111111111111111111111111");

#[program]
pub mod card_vault {
    use super::*;

    pub fn deposit_and_swap(ctx: Context<DepositAndSwap>, amount: u64) -> Result<()> {
        // TODO: Transfer DOPE tokens from user to vault PDA via token CPI
        // TODO: Invoke DEX router to swap DOPE -> USDC (CPI)
        // TODO: Credit vault USDC balance for the user (internal PDA ledger)
        emit!(CardTopUp { user: *ctx.accounts.user.key, dope_amount: amount, usdc_amount: amount });
        Ok(())
    }

    pub fn withdraw_usdc(_ctx: Context<WithdrawUsdc>, _amount: u64) -> Result<()> {
        // TODO: Transfer USDC back to user (refund path)
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositAndSwap<'info> {
    /// CHECK: user signer
    pub user: Signer<'info>,
    // TODO: token accounts, vault PDAs, system program, token program, etc.
}

#[derive(Accounts)]
pub struct WithdrawUsdc<'info> {
    /// CHECK: user signer
    pub user: Signer<'info>,
}

#[event]
pub struct CardTopUp {
    pub user: Pubkey,
    pub dope_amount: u64,
    pub usdc_amount: u64,
}

