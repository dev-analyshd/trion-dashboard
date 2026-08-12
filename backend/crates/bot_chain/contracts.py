"""BOT Chain Contract interface layer.

Provides typed wrappers for interacting with BOT Chain smart contracts.
This module is fully independent from the EVM contracts module and
covers BOT Chain-specific contract behaviors and signal extraction.

Monitored contracts:
  - TrionBotOracle: Primary behavioral oracle
  - BotVaultV1: BOT token vault with behavioral tracking
  - BotChainBEO: BEO entity attestation
  - BotChainCRISPR: Security engine
  - BotChainPriceFeed: BTV price feed
  - BotChainGovernance: Protocol governance
"""
import json, hashlib, time, random, logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


@dataclass
class BotContractEvent:
    """Parsed BOT Chain contract event with behavioral metadata."""
    contract_name: str
    block_number: int
    tx_hash: str
    event_type: str
    topics: List[str]
    data: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    behavioral_score: float = 0.0
    signal_tags: List[str] = field(default_factory=list)
    bot_specific: bool = False

    def to_signal_payload(self) -> Dict[str, Any]:
        return {
            "source": "bot_chain_crate",
            "contract": self.contract_name,
            "chain": "botchain",
            "chainId": 677,
            "blockNumber": self.block_number,
            "txHash": self.tx_hash[:16] + "...",
            "eventType": self.event_type,
            "behavioralScore": round(self.behavioral_score, 4),
            "tags": self.signal_tags,
            "botSpecific": self.bot_specific,
            "timestamp": self.timestamp,
        }


@dataclass
class BotContractState:
    """Current behavioral state of a monitored BOT Chain contract."""
    name: str
    address: str
    total_interactions: int = 0
    last_block: int = 0
    coherence: float = 0.90
    anomaly_count: int = 0
    last_signal_time: str = ""
    active_hooks: List[str] = field(default_factory=list)
    bot_signals_published: int = 0


class BotChainContracts:
    """Manages BOT Chain contract interfaces for behavioral signal extraction.

    This is a fully independent contract manager that:
    - Tracks state for all BOT Chain monitored contracts
    - Processes events from BOT Chain blocks
    - Extracts BOT-specific behavioral signals
    - Computes coherence scores for the BOT Chain ecosystem
    - Provides summary statistics and health metrics
    """

    def __init__(self):
        self._contracts: Dict[str, BotContractState] = {}
        self._event_buffer: List[BotContractEvent] = []
        self._max_buffer = 500
        self._initialized = False
        self._total_bot_signals = 0

    def initialize(self, contracts_config: List[Dict[str, Any]]) -> None:
        """Initialize BOT Chain contract states from configuration."""
        for cfg in contracts_config:
            key = cfg["name"]
            self._contracts[key] = BotContractState(
                name=cfg["name"],
                address=cfg["address"],
                active_hooks=cfg.get("behavioralHooks", []),
                coherence=0.90,  # BOT Chain starts with higher baseline
            )
        self._initialized = True
        logger.info(f"[BOT Chain Contracts] Initialized {len(self._contracts)} contract monitors on BOT Chain (ID: 677)")

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    def get_state(self, name: str) -> Optional[BotContractState]:
        return self._contracts.get(name)

    def get_all_states(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": s.name, "chain": "botchain", "chainId": 677,
                "address": s.address, "totalInteractions": s.total_interactions,
                "lastBlock": s.last_block, "coherence": round(s.coherence, 4),
                "anomalyCount": s.anomaly_count, "activeHooks": s.active_hooks,
                "botSignalsPublished": s.bot_signals_published,
            }
            for s in self._contracts.values()
        ]

    def process_event(self, contract_name: str, block_number: int,
                      tx_hash: str, event_type: str,
                      data: Optional[Dict] = None) -> BotContractEvent:
        """Process an incoming BOT Chain contract event."""
        state = self._contracts.get(contract_name)

        event = BotContractEvent(
            contract_name=contract_name, block_number=block_number,
            tx_hash=tx_hash, event_type=event_type, topics=[],
            data=data or {}, bot_specific=event_type.startswith("onBot"),
        )

        event.behavioral_score = self._calculate_behavioral_score(event, state)
        event.signal_tags = self._extract_signal_tags(event, state)

        if state:
            state.total_interactions += 1
            state.last_block = block_number
            state.coherence = max(0.0, min(1.0, state.coherence + random.gauss(0, 0.015)))
            state.last_signal_time = event.timestamp
            if event.bot_specific:
                state.bot_signals_published += 1
            if event.behavioral_score < 0.3:
                state.anomaly_count += 1

        self._event_buffer.append(event)
        if len(self._event_buffer) > self._max_buffer:
            self._event_buffer = self._event_buffer[-self._max_buffer:]
        self._total_bot_signals += 1

        return event

    def _calculate_behavioral_score(self, event: BotContractEvent,
                                     state: Optional[BotContractState]) -> float:
        base = 0.90 if state is None else state.coherence
        modifiers = {
            "onBotSignal": 0.02, "onSwap": 0.0, "onTransfer": 0.01,
            "onBehavioralUpdate": 0.03, "onBotTransfer": 0.02,
            "onDeposit": 0.01, "onWithdraw": -0.02, "onRebalance": 0.0,
            "onAttest": 0.02, "onRevoke": -0.03, "onEntityRegister": 0.04,
            "onArchetypeUpdate": 0.01, "onIntercept": -0.15,
            "onSignatureUpdate": 0.0, "onThreatDetect": -0.12,
            "onPriceUpdate": 0.0, "onDeviation": -0.08, "onBTVUpdate": 0.03,
            "onPropose": 0.01, "onVote": 0.0, "onExecute": 0.02, "onDelegate": 0.01,
        }
        mod = modifiers.get(event.event_type, 0.0)
        score = base + mod + random.gauss(0, 0.02)
        return max(0.0, min(1.0, score))

    def _extract_signal_tags(self, event: BotContractEvent,
                              state: Optional[BotContractState]) -> List[str]:
        tags = [f"botchain:{event.event_type}", "chain:botchain", "chainId:677"]
        if event.bot_specific:
            tags.append("BOT_SPECIFIC")
        if event.behavioral_score < 0.5:
            tags.append("WARNING")
        if event.behavioral_score < 0.3:
            tags.append("INTERCEPT")
        if event.behavioral_score >= 0.85:
            tags.append("COHERENT")
        if event.behavioral_score >= 0.95:
            tags.append("HIGH_COHERENCE")
        if state and state.anomaly_count > 5:
            tags.append("ELEVATED_RISK")
        return tags

    def get_recent_events(self, n: int = 50) -> List[Dict[str, Any]]:
        return [e.to_signal_payload() for e in self._event_buffer[-n:]]

    def get_contract_summary(self) -> Dict[str, Any]:
        total = len(self._contracts)
        active = sum(1 for c in self._contracts.values() if c.total_interactions > 0)
        avg_coh = (sum(c.coherence for c in self._contracts.values()) / total) if total > 0 else 0
        return {
            "chain": "botchain",
            "chainId": 677,
            "rpc": "https://rpc.botchain.ai",
            "explorer": "https://scan.botchain.ai/",
            "currency": "BOT",
            "totalContracts": total,
            "activeContracts": active,
            "avgCoherence": round(avg_coh, 4),
            "totalEventsProcessed": sum(c.total_interactions for c in self._contracts.values()),
            "totalAnomalies": sum(c.anomaly_count for c in self._contracts.values()),
            "totalBotSpecificSignals": self._total_bot_signals,
        }
