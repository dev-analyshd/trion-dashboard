"""BOT Chain configuration registry.

Independent configuration for the BOT Chain (chain ID 677) behavioral
sensing crate. Contains chain parameters, contract registry, ABI
fragments, and all BOT Chain-specific settings.

Network: BOT Chain
Chain ID: 677
RPC: https://rpc.botchain.ai
Explorer: https://scan.botchain.ai/
Currency: BOT
"""
import os, hashlib, random, logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# ── Chain Constants ───────────────────────────────────────────────
BOT_CHAIN_ID = 677
BOT_RPC = "https://rpc.botchain.ai"
BOT_EXPLORER = "https://scan.botchain.ai/"
BOT_CURRENCY = "BOT"
BOT_NETWORK_NAME = "BOT Chain"

# ── Chain Configuration ───────────────────────────────────────────
BOT_CHAIN: Dict[str, Any] = {
    "id": "botchain",
    "name": BOT_NETWORK_NAME,
    "chainId": BOT_CHAIN_ID,
    "vm": "EVM",
    "status": "active",
    "rpc": BOT_RPC,
    "explorer": BOT_EXPLORER,
    "currency": BOT_CURRENCY,
    "blockTime": 2.0,
    "confirmations": 3,
    "maxGasLimit": 30000000,
    "behavioralIndex": True,
    "signalFrequency": "block",
    "coherenceBaseline": 0.90,
    "nativeToken": BOT_CURRENCY,
    "deploymentStage": "mainnet",
    "description": "BOT Chain — EVM-compatible behavioral sensing network",
}

# ── BOT Chain Contract Registry ───────────────────────────────────
BOT_CONTRACTS: List[Dict[str, Any]] = [
    {
        "name": "TrionBotOracle",
        "chain": "botchain",
        "address": "0xBOT...0001",
        "language": "Solidity",
        "verified": True,
        "loc": 2156,
        "abiHash": hashlib.sha256(b"TrionBotOracle-abi-v1").hexdigest()[:16],
        "behavioralHooks": ["onBotSignal", "onSwap", "onBehavioralUpdate"],
        "signalTypes": ["COHERENCE", "PHI_SIGMA", "ANIMA_CORRELATION", "BOT_SPECIFIC"],
        "description": "Primary TRION oracle for BOT Chain behavioral signals",
    },
    {
        "name": "BotVaultV1",
        "chain": "botchain",
        "address": "0xBOT...0002",
        "language": "Solidity",
        "verified": True,
        "loc": 1678,
        "abiHash": hashlib.sha256(b"BotVaultV1-abi-v1").hexdigest()[:16],
        "behavioralHooks": ["onDeposit", "onWithdraw", "onRebalance", "onBotTransfer"],
        "signalTypes": ["COHERENCE", "BEHAVIORAL_SHIFT", "VAULT_METRICS"],
        "description": "Vault for BOT token behavioral tracking",
    },
    {
        "name": "BotChainBEO",
        "chain": "botchain",
        "address": "0xBOT...0003",
        "language": "Solidity",
        "verified": True,
        "loc": 1234,
        "abiHash": hashlib.sha256(b"BotChainBEO-abi-v1").hexdigest()[:16],
        "behavioralHooks": ["onAttest", "onRevoke", "onEntityRegister", "onArchetypeUpdate"],
        "signalTypes": ["ENTITY_BEHAVIOR", "ARCHETYPE_UPDATE", "BEO_ATTESTATION"],
        "description": "BEO (Behavioral Entity Oracle) for BOT Chain entities",
    },
    {
        "name": "BotChainCRISPR",
        "chain": "botchain",
        "address": "0xBOT...0004",
        "language": "Solidity",
        "verified": False,
        "loc": 1890,
        "abiHash": hashlib.sha256(b"BotChainCRISPR-abi-v1").hexdigest()[:16],
        "behavioralHooks": ["onIntercept", "onSignatureUpdate", "onThreatDetect"],
        "signalTypes": ["CRISPR_INTERCEPT", "SECURITY_ALERT", "THREAT_VECTOR"],
        "description": "CRISPR security engine for BOT Chain",
    },
    {
        "name": "BotChainPriceFeed",
        "chain": "botchain",
        "address": "0xBOT...0005",
        "language": "Solidity",
        "verified": True,
        "loc": 567,
        "abiHash": hashlib.sha256(b"BotChainPriceFeed-abi-v1").hexdigest()[:16],
        "behavioralHooks": ["onPriceUpdate", "onDeviation", "onBTVUpdate"],
        "signalTypes": ["BTV_PRICE", "FIREWALL_CHECK", "PRICE_ANOMALY"],
        "description": "Behavioral True Value price feed for BOT Chain",
    },
    {
        "name": "BotChainGovernance",
        "chain": "botchain",
        "address": "0xBOT...0006",
        "language": "Solidity",
        "verified": False,
        "loc": 945,
        "abiHash": hashlib.sha256(b"BotChainGovernance-abi-v1").hexdigest()[:16],
        "behavioralHooks": ["onPropose", "onVote", "onExecute", "onDelegate"],
        "signalTypes": ["GOVERNANCE_SIGNAL", "VOTE_PATTERN", "CONSENSUS_SHIFT"],
        "description": "Governance contract for BOT Chain protocol decisions",
    },
]

# ── BOT Chain Trading Pairs ───────────────────────────────────────
BOT_TRADING_PAIRS: List[Dict[str, Any]] = [
    {
        "pair": "BOT/USD",
        "price": 0.045,
        "change24h": 3.21,
        "volume24h": 12500000,
        "firewall": "active",
        "btv": 0.0448,
        "chain": "botchain",
    },
    {
        "pair": "BOT/ETH",
        "price": 0.0000132,
        "change24h": -1.05,
        "volume24h": 3200000,
        "firewall": "active",
        "btv": 0.0000131,
        "chain": "botchain",
    },
    {
        "pair": "BOT/BTC",
        "price": 0.000000668,
        "change24h": 2.87,
        "volume24h": 1800000,
        "firewall": "monitoring",
        "btv": 0.000000665,
        "chain": "botchain",
    },
]

# ── BOT Chain Event Signatures ────────────────────────────────────
BOT_EVENT_SIGS: Dict[str, str] = {
    "Transfer": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "Swap": "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    "Approval": "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
    "onBotSignal": hashlib.sha256(b"onBotSignal(uint256,int256,bytes32,bytes32)").hexdigest(),
    "onBehavioralUpdate": hashlib.sha256(b"onBehavioralUpdate(address,uint256,int256)").hexdigest(),
    "onBotTransfer": hashlib.sha256(b"onBotTransfer(address,address,uint256,bytes)").hexdigest(),
    "onIntercept": hashlib.sha256(b"onIntercept(uint256,bytes32,uint8)").hexdigest(),
    "onThreatDetect": hashlib.sha256(b"onThreatDetect(address,bytes32,uint8,bytes)").hexdigest(),
    "onBTVUpdate": hashlib.sha256(b"onBTVUpdate(uint256,int256,uint256)").hexdigest(),
}

# ── Helper Functions ───────────────────────────────────────────────
def get_bot_chain() -> Dict[str, Any]:
    """Return the BOT Chain configuration."""
    return BOT_CHAIN


def get_bot_contracts() -> List[Dict[str, Any]]:
    """Return all BOT Chain monitored contracts."""
    return BOT_CONTRACTS


def get_bot_contract_by_name(name: str) -> Optional[Dict[str, Any]]:
    for c in BOT_CONTRACTS:
        if c["name"] == name:
            return c
    return None


def bot_explorer_url(tx_hash: str = "", address: str = "", block: int = 0) -> str:
    """Generate a BOT Chain explorer URL."""
    base = BOT_EXPLORER.rstrip("/")
    if tx_hash:
        return f"{base}/tx/{tx_hash}"
    if address:
        return f"{base}/address/{address}"
    if block:
        return f"{base}/block/{block}"
    return base
