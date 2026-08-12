import os, json, hashlib, time, random, math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

"""EVM Chain configuration registry.

Each chain entry contains RPC endpoints, chain metadata, and behavioral
indexing parameters. This crate supports all EVM-compatible networks
that TRION indexes for behavioral signal extraction.
"""

# ── RPC Configuration ─────────────────────────────────────────────
default_timeout = float(os.getenv("EVM_RPC_TIMEOUT", "10"))
default_retries = int(os.getenv("EVM_RPC_RETRIES", "3"))

EVM_CHAINS: List[Dict[str, Any]] = [
    {
        "id": "ethereum",
        "name": "Ethereum Mainnet",
        "chainId": 1,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://eth.llamarpc.com",
        "explorer": "https://etherscan.io",
        "currency": "ETH",
        "blockTime": 12.0,
        "confirmations": 12,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.88,
    },
    {
        "id": "arbitrum",
        "name": "Arbitrum One",
        "chainId": 42161,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://arb1.arbitrum.io/rpc",
        "explorer": "https://arbiscan.io",
        "currency": "ETH",
        "blockTime": 0.25,
        "confirmations": 1,
        "maxGasLimit": 200000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.92,
    },
    {
        "id": "polygon",
        "name": "Polygon PoS",
        "chainId": 137,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://polygon-rpc.com",
        "explorer": "https://polygonscan.com",
        "currency": "MATIC",
        "blockTime": 2.0,
        "confirmations": 128,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.85,
    },
    {
        "id": "optimism",
        "name": "Optimism",
        "chainId": 10,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://mainnet.optimism.io",
        "explorer": "https://optimistic.etherscan.io",
        "currency": "ETH",
        "blockTime": 2.0,
        "confirmations": 1,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.86,
    },
    {
        "id": "base",
        "name": "Base",
        "chainId": 8453,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://mainnet.base.org",
        "explorer": "https://basescan.org",
        "currency": "ETH",
        "blockTime": 2.0,
        "confirmations": 1,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.87,
    },
    {
        "id": "bsc",
        "name": "BNB Smart Chain",
        "chainId": 56,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://bsc-rpc.publicnode.com",
        "explorer": "https://bscscan.com",
        "currency": "BNB",
        "blockTime": 3.0,
        "confirmations": 15,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.84,
    },
    {
        "id": "avalanche",
        "name": "Avalanche C-Chain",
        "chainId": 43114,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://api.avax.network/ext/bc/C/rpc",
        "explorer": "https://snowtrace.io",
        "currency": "AVAX",
        "blockTime": 2.0,
        "confirmations": 12,
        "maxGasLimit": 15000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.83,
    },
    {
        "id": "hsk",
        "name": "HashKey Chain",
        "chainId": 177,
        "vm": "EVM",
        "status": "active",
        "rpc": "https://mainnet.hsk.xyz",
        "explorer": "https://explorer.hsk.xyz",
        "currency": "HSK",
        "blockTime": 3.0,
        "confirmations": 1,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "block",
        "coherenceBaseline": 0.81,
    },
    {
        "id": "mantle",
        "name": "Mantle",
        "chainId": 5000,
        "vm": "EVM",
        "status": "indexing",
        "rpc": "https://rpc.mantle.xyz",
        "explorer": "https://mantlescan.xyz",
        "currency": "MNT",
        "blockTime": 2.0,
        "confirmations": 1,
        "maxGasLimit": 30000000,
        "behavioralIndex": True,
        "signalFrequency": "batch",
        "coherenceBaseline": 0.80,
    },
]

# ── EVM Contract Registry ─────────────────────────────────────────
EVM_CONTRACTS: List[Dict[str, Any]] = [
    {
        "name": "TrionOracleV3",
        "chain": "arbitrum",
        "address": "0xb819c...58b3",
        "language": "Solidity",
        "verified": True,
        "loc": 1847,
        "abiHash": hashlib.sha256(b"TrionOracleV3-abi").hexdigest()[:16],
        "behavioralHooks": ["onSwap", "onTransfer", "onGovernance"],
        "signalTypes": ["COHERENCE", "PHI_SIGMA", "ANIMA_CORRELATION"],
    },
    {
        "name": "TrionVaultV3",
        "chain": "arbitrum",
        "address": "0x93fD...716D",
        "language": "Solidity",
        "verified": True,
        "loc": 1456,
        "abiHash": hashlib.sha256(b"TrionVaultV3-abi").hexdigest()[:16],
        "behavioralHooks": ["onDeposit", "onWithdraw", "onRebalance"],
        "signalTypes": ["COHERENCE", "BEHAVIORAL_SHIFT"],
    },
    {
        "name": "PriceAggregator",
        "chain": "arbitrum",
        "address": "0x...",
        "language": "Vyper",
        "verified": True,
        "loc": 312,
        "abiHash": hashlib.sha256(b"PriceAggregator-abi").hexdigest()[:16],
        "behavioralHooks": ["onPriceUpdate", "onDeviation"],
        "signalTypes": ["BTV_PRICE", "FIREWALL_CHECK"],
    },
    {
        "name": "BEOAttestation",
        "chain": "arbitrum",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 672,
        "abiHash": hashlib.sha256(b"BEOAttestation-abi").hexdigest()[:16],
        "behavioralHooks": ["onAttest", "onRevoke"],
        "signalTypes": ["ENTITY_BEHAVIOR", "ARCHETYPE_UPDATE"],
    },
    {
        "name": "BIRPAttestation",
        "chain": "arbitrum",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 534,
        "abiHash": hashlib.sha256(b"BIRPAttestation-abi").hexdigest()[:16],
        "behavioralHooks": ["onAttest"],
        "signalTypes": ["IRP_SIGNAL"],
    },
    {
        "name": "BTCFiGuard",
        "chain": "arbitrum",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 445,
        "abiHash": hashlib.sha256(b"BTCFiGuard-abi").hexdigest()[:16],
        "behavioralHooks": ["onBridge", "onLock", "onMint"],
        "signalTypes": ["CROSS_CHAIN_COHERENCE"],
    },
    {
        "name": "BEOCore",
        "chain": "ethereum",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 1567,
        "abiHash": hashlib.sha256(b"BEOCore-abi").hexdigest()[:16],
        "behavioralHooks": ["onBehavioralUpdate", "onEntityRegister"],
        "signalTypes": ["ENTITY_BEHAVIOR", "COHERENCE"],
    },
    {
        "name": "AnimaIndex",
        "chain": "arbitrum",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 876,
        "abiHash": hashlib.sha256(b"AnimaIndex-abi").hexdigest()[:16],
        "behavioralHooks": ["onIndexUpdate", "onVectorAdd"],
        "signalTypes": ["ANIMA_CORRELATION"],
    },
    {
        "name": "CrisprEngine",
        "chain": "arbitrum",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 1345,
        "abiHash": hashlib.sha256(b"CrisprEngine-abi").hexdigest()[:16],
        "behavioralHooks": ["onIntercept", "onSignatureUpdate"],
        "signalTypes": ["CRISPR_INTERCEPT", "SECURITY_ALERT"],
    },
    {
        "name": "HskOracle",
        "chain": "hsk",
        "address": "0x...",
        "language": "Solidity",
        "verified": True,
        "loc": 723,
        "abiHash": hashlib.sha256(b"HskOracle-abi").hexdigest()[:16],
        "behavioralHooks": ["onSwap", "onTransfer"],
        "signalTypes": ["COHERENCE"],
    },
    {
        "name": "MantleAdapter",
        "chain": "mantle",
        "address": "0x...",
        "language": "Solidity",
        "verified": False,
        "loc": 387,
        "abiHash": hashlib.sha256(b"MantleAdapter-abi").hexdigest()[:16],
        "behavioralHooks": ["onBridge"],
        "signalTypes": ["CROSS_CHAIN_COHERENCE"],
    },
]

# ── ABI Fragments (common event signatures) ──────────────────────
EVM_EVENT_SIGS = {
    "Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "Swap": "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    "Approval": "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
    "GovernanceProposed": hashlib.sha256(b"GovernanceProposed(uint256,address,bytes32)").hexdigest(),
    "BehavioralSignal": hashlib.sha256(b"BehavioralSignal(uint256,int256,bytes32)").hexdigest(),
    "CoherenceUpdate": hashlib.sha256(b"CoherenceUpdate(address,uint256,int256)").hexdigest(),
}

# ── Helper Functions ───────────────────────────────────────────────
def get_chain_by_id(chain_id: int) -> Optional[Dict[str, Any]]:
    for c in EVM_CHAINS:
        if c["chainId"] == chain_id:
            return c
    return None


def get_chain_by_name(name: str) -> Optional[Dict[str, Any]]:
    for c in EVM_CHAINS:
        if c["id"] == name:
            return c
    return None


def get_contracts_for_chain(chain_name: str) -> List[Dict[str, Any]]:
    return [c for c in EVM_CONTRACTS if c["chain"] == chain_name]
