"""TRION Crates — Independent behavioral sensing modules.

Each crate is a self-contained unit that:
- Monitors a specific chain or chain family
- Generates behavioral signals independently
- Maintains its own state and contract monitors
- Publishes signals through its configured relayer

Available crates:
  - evm: EVM-compatible chains (Ethereum, Arbitrum, Base, BSC, etc.)
  - bot_chain: BOT Chain (chain ID 677) — fully independent
"""
from .evm import EVMCrate
from .bot_chain import BotChainCrate

__all__ = ["EVMCrate", "BotChainCrate"]
