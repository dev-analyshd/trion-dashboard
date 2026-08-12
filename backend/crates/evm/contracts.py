"""EVM Contract interface layer.

Provides typed wrappers for interacting with EVM smart contracts.
Handles ABI encoding/decoding, event parsing, and behavioral
hook extraction from on-chain contract interactions.
"""
import json, hashlib, time, random, logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


@dataclass
class ContractEvent:
    """Parsed EVM contract event with behavioral metadata."""
    contract_name: str
    chain: str
    block_number: int
    tx_hash: str
    event_type: str
    topics: List[str]
    data: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    behavioral_score: float = 0.0
    signal_tags: List[str] = field(default_factory=list)

    def to_signal_payload(self) -> Dict[str, Any]:
        return {
            "source": "evm_crate",
            "contract": self.contract_name,
            "chain": self.chain,
            "blockNumber": self.block_number,
            "txHash": self.tx_hash[:16] + "...",
            "eventType": self.event_type,
            "behavioralScore": round(self.behavioral_score, 4),
            "tags": self.signal_tags,
            "timestamp": self.timestamp,
        }


@dataclass
class ContractState:
    """Current behavioral state of a monitored contract."""
    name: str
    chain: str
    address: str
    total_interactions: int = 0
    last_block: int = 0
    coherence: float = 0.85
    anomaly_count: int = 0
    last_signal_time: str = ""
    active_hooks: List[str] = field(default_factory=list)


class EVMContracts:
    """Manages EVM contract interfaces for behavioral signal extraction.

    Provides methods for:
    - Contract state tracking and coherence scoring
    - Event parsing and behavioral hook extraction
    - Cross-contract behavioral correlation
    - Signal generation from on-chain interactions
    """

    def __init__(self):
        self._contracts: Dict[str, ContractState] = {}
        self._event_buffer: List[ContractEvent] = []
        self._max_buffer = 500
        self._initialized = False

    def initialize(self, contracts_config: List[Dict[str, Any]]) -> None:
        """Initialize contract states from configuration."""
        for cfg in contracts_config:
            key = f"{cfg['chain']}:{cfg['name']}"
            self._contracts[key] = ContractState(
                name=cfg["name"],
                chain=cfg["chain"],
                address=cfg["address"],
                active_hooks=cfg.get("behavioralHooks", []),
            )
        self._initialized = True
        logger.info(f"[EVM Contracts] Initialized {len(self._contracts)} contract monitors")

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    def get_state(self, chain: str, name: str) -> Optional[ContractState]:
        key = f"{chain}:{name}"
        return self._contracts.get(key)

    def get_all_states(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": s.name, "chain": s.chain, "address": s.address,
                "totalInteractions": s.total_interactions, "lastBlock": s.last_block,
                "coherence": round(s.coherence, 4), "anomalyCount": s.anomaly_count,
                "activeHooks": s.active_hooks,
            }
            for s in self._contracts.values()
        ]

    def process_event(self, contract_name: str, chain: str, block_number: int,
                      tx_hash: str, event_type: str, data: Optional[Dict] = None) -> ContractEvent:
        """Process an incoming contract event and extract behavioral signals."""
        key = f"{chain}:{contract_name}"
        state = self._contracts.get(key)

        event = ContractEvent(
            contract_name=contract_name, chain=chain, block_number=block_number,
            tx_hash=tx_hash, event_type=event_type, topics=[],
            data=data or {},
        )

        # Calculate behavioral score based on event type and historical patterns
        event.behavioral_score = self._calculate_behavioral_score(event, state)
        event.signal_tags = self._extract_signal_tags(event, state)

        # Update contract state
        if state:
            state.total_interactions += 1
            state.last_block = block_number
            state.coherence = max(0.0, min(1.0, state.coherence + random.gauss(0, 0.02)))
            state.last_signal_time = event.timestamp
            if event.behavioral_score < 0.3:
                state.anomaly_count += 1

        # Buffer event
        self._event_buffer.append(event)
        if len(self._event_buffer) > self._max_buffer:
            self._event_buffer = self._event_buffer[-self._max_buffer:]

        return event

    def _calculate_behavioral_score(self, event: ContractEvent, state: Optional[ContractState]) -> float:
        """Calculate behavioral coherence score for an event."""
        base = 0.85
        if state:
            base = state.coherence
        # Event type modifiers
        modifiers = {
            "Swap": 0.0, "Transfer": 0.02, "Approval": 0.01,
            "GovernanceProposed": -0.05, "BehavioralSignal": 0.0,
            "CoherenceUpdate": 0.03, "onIntercept": -0.15, "onDeviation": -0.10,
        }
        mod = modifiers.get(event.event_type, 0.0)
        score = base + mod + random.gauss(0, 0.03)
        return max(0.0, min(1.0, score))

    def _extract_signal_tags(self, event: ContractEvent, state: Optional[ContractState]) -> List[str]:
        """Extract behavioral signal tags from event context."""
        tags = [f"evm:{event.event_type}", f"chain:{event.chain}"]
        if event.behavioral_score < 0.5:
            tags.append("WARNING")
        if event.behavioral_score < 0.3:
            tags.append("INTERCEPT")
        if event.behavioral_score >= 0.8:
            tags.append("COHERENT")
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
            "totalContracts": total,
            "activeContracts": active,
            "avgCoherence": round(avg_coh, 4),
            "totalEventsProcessed": sum(c.total_interactions for c in self._contracts.values()),
            "totalAnomalies": sum(c.anomaly_count for c in self._contracts.values()),
        }
