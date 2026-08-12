"""BOT Chain Crate — Independent behavioral sensing crate for BOT Chain.

BOT Chain (chain ID 677) is an EVM-compatible network with native token BOT.
This crate provides the same behavioral sensing capabilities as the EVM crate
but is purpose-built and independently operated for the BOT Chain network.

Network Details:
  - Name: BOT Chain
  - Chain ID: 677
  - RPC: https://rpc.botchain.ai
  - Explorer: https://scan.botchain.ai/
  - Currency: BOT

This crate operates completely independently from the EVM crate,
with its own signal factory, contract monitors, and relayer connection.
"""
from .crate import BotChainCrate
from .contracts import BotChainContracts
from .config import BOT_CHAIN, BOT_CONTRACTS, BOT_CHAIN_ID, BOT_RPC, BOT_EXPLORER, BOT_CURRENCY

__all__ = [
    "BotChainCrate",
    "BotChainContracts",
    "BOT_CHAIN",
    "BOT_CONTRACTS",
    "BOT_CHAIN_ID",
    "BOT_RPC",
    "BOT_EXPLORER",
    "BOT_CURRENCY",
]
