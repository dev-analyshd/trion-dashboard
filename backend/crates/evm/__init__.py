"""EVM Crate — Behavioral sensing interface for all EVM-compatible chains.

Provides the base implementation for chain indexing, contract analysis,
behavioral signal extraction, and cross-chain coherence tracking across
EVM-compatible networks (Ethereum, Arbitrum, Base, BSC, Polygon, etc.).
"""
from .crate import EVMCrate
from .contracts import EVMContracts
from .config import EVM_CHAINS, EVM_CONTRACTS

__all__ = ["EVMCrate", "EVMContracts", "EVM_CHAINS", "EVM_CONTRACTS"]
