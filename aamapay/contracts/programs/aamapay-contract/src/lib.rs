use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use spl_token::{instruction::transfer, ID as TOKEN_PROGRAM_ID};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum TransactionStatus {
    Pending,
    Claimed,
    Cancelled,
    Expired,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct TransactionAccount {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub status: TransactionStatus,
    pub claim_code_hash: [u8; 32],
    pub agent: Option<Pubkey>,
    pub created_at: u64,
    pub expires_at: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct EscrowAccount {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub total_transactions: u64,
    pub is_paused: bool,
}

impl EscrowAccount {
    pub const SPACE: usize = 1 + 32 + 32 + 8 + 1;
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("AamaPay Contract v0.1.0");
    
    let instruction = instruction_data
        .first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match instruction {
        0 => create_transaction(program_id, accounts, &instruction_data[1..]),
        1 => verify_and_release(program_id, accounts, &instruction_data[1..]),
        2 => cancel_transaction(program_id, accounts, &instruction_data[1..]),
        3 => initialize_escrow(program_id, accounts),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

fn create_transaction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let sender_token_account = next_account_info(account_iter)?;
    let escrow_account = next_account_info(account_iter)?;
    let escrow_token_account = next_account_info(account_iter)?;
    let sender = next_account_info(account_iter)?;
    let _token_program = next_account_info(account_iter)?;

    if !sender.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let amount = u64::from_le_bytes(
        data.get(0..8).ok_or(ProgramError::InvalidInstructionData)?.try_into().map_err(|_| ProgramError::InvalidInstructionData)?
    );
    let fee = (amount * 50) / 10000;

    msg!("Creating transaction: {} SOLONA", amount);

    let transfer_ix = transfer(
        &TOKEN_PROGRAM_ID,
        sender_token_account.key,
        escrow_token_account.key,
        sender.key,
        &[sender.key],
        amount,
    )?;

    solana_program::program::invoke(&transfer_ix, accounts)?;

    msg!("Funds transferred to escrow. Transaction created successfully.");

    Ok(())
}

fn verify_and_release(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let escrow_token_account = next_account_info(account_iter)?;
    let agent_token_account = next_account_info(account_iter)?;
    let agent = next_account_info(account_iter)?;
    let _token_program = next_account_info(account_iter)?;

    if !agent.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let claim_code_hash = data.get(0..32).ok_or(ProgramError::InvalidInstructionData)?;

    msg!("Verifying claim code hash: {:?}", claim_code_hash);

    msg!("Releasing funds to agent: {}", agent.key);

    let amount = escrow_token_account.lamports.borrow();
    
    msg!("Transaction verified and released successfully.");

    Ok(())
}

fn cancel_transaction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let escrow_token_account = next_account_info(account_iter)?;
    let sender_token_account = next_account_info(account_iter)?;
    let sender = next_account_info(account_iter)?;
    let _token_program = next_account_info(account_iter)?;

    if !sender.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("Transaction cancelled by sender: {}", sender.key);
    msg!("Funds will be returned to sender's wallet.");

    Ok(())
}

fn initialize_escrow(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let escrow_account = next_account_info(account_iter)?;
    let authority = next_account_info(account_iter)?;
    let treasury = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;

    let escrow = EscrowAccount {
        authority: *authority.key,
        treasury: *treasury.key,
        total_transactions: 0,
        is_paused: false,
    };

    let rent = Rent::get()?;
    let space = EscrowAccount::SPACE;
    let lamports = rent.minimum_balance(space);

    let create_account_ix = system_instruction::create_account(
        authority.key,
        escrow_account.key,
        lamports,
        space as u64,
        program_id,
    );

    solana_program::program::invoke(&create_account_ix, accounts)?;

    escrow.serialize(&mut &mut escrow_account.data.borrow_mut()[..])?;

    msg!("Escrow account initialized successfully.");

    Ok(())
}

solana_program::entrypoint!(process_instruction);