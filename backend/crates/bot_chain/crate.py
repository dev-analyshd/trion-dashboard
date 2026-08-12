"""BOT Chain Crate — Independent behavioral sensing engine for BOT Chain.

This crate is a fully independent behavioral sensing module for the
BOT Chain network (chain ID 677). It mirrors the EVM crate architecture
but operates as a standalone unit with its own:

- Signal generation pipeline
- Contract monitoring system
- Coherence scoring engine
- Block scanning simulation
- Status reporting

The BOT Chain crate publishes signals through the BOT Chain Relayer
and does not depend on the EVM crate or any other crate for operation.

Network: BOT Chain (https://botchain.ai)
Chain ID: 677
RPC: https://rpc.botchain.ai
Explorer: https://scan.botchain.ai/
"""
import time, random, hashlib, logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field

from .config import (
    BOT_CHAIN, BOT_CONTRACTS, BOT_CHAIN_ID, BOT_RPC,
    BOT_EXPLORER, BOT_CURRENCY, BOT_TRADING_PAIRS,
)
from .contracts import BotChainContracts, BotContractEvent

logger = logging.getLogger(__name__)


@dataclass
class BotBlock:
    """Represents a scanned BOT Chain block with behavioral metadata."""
    number: int
    timestamp: str
    tx_count: int
    gas_used: int
    behavioral_events: List[Dict[str, Any]] = field(default_factory=list)
    coherence_score: float = 0.0
    scan_duration_ms: float = 0.0
    bot_transactions: int = 0


@dataclass
class BotCrateStatus:
    """Runtime status of the BOT Chain Crate."""
    name: str = "BOT Chain Crate"
    version: str = "1.0.0"
    chain_name: str = "BOT Chain"
    chain_id: int = 677
    rpc: str = BOT_RPC
    explorer: str = BOT_EXPLORER
    currency: str = BOT_CURRENCY
    contracts_monitored: int = 0
    signals_generated: int = 0
    total_blocks_scanned: int = 0
    uptime_seconds: float = 0.0
    last_block_number: int = 0
    status: str = "initializing"
    errors: int = 0
    avg_coherence: float = 0.0
    bot_specific_signals: int = 0
    publishing_active: bool = False


class BotChainCrate:
    """Core BOT Chain behavioral sensing crate.

    Independently scans BOT Chain blocks, extracts behavioral
    signals from contract interactions, computes coherence scores,
    and publishes signals through the BOT Chain Relayer.

    This crate is fully independent — it does NOT depend on the
    EVM crate or any shared infrastructure. It has its own:
    - Contract monitors (6 BOT Chain contracts)
    - Signal generation pipeline
    - Coherence scoring
    - Block scanning
    - Status tracking

    Usage:
        crate = BotChainCrate()
        crate.initialize()
        signal = crate.generate_signal()
        status = crate.get_status()
    """

    def __init__(self, crate_id: str = "botchain-primary"):
        self.crate_id = crate_id
        self.contracts = BotChainContracts()
        self._status = BotCrateStatus()
        self._start_time = time.time()
        self._signal_buffer: List[Dict[str, Any]] = []
        self._max_signals = 500
        self._initialized = False
        self._publishing = False

    def initialize(self) -> None:
        """Initialize the BOT Chain crate with contract monitors."""
        try:
            self.contracts.initialize(BOT_CONTRACTS)
            self._status.contracts_monitored = len(BOT_CONTRACTS)
            self._status.status = "running"
            self._initialized = True
            logger.info(
                f"[BOT Chain Crate:{self.crate_id}] Initialized on chain ID 677 — "
                f"{len(BOT_CONTRACTS)} contracts, RPC: {BOT_RPC}"
            )
        except Exception as e:
            self._status.status = "error"
            self._status.errors += 1
            logger.error(f"[BOT Chain Crate:{self.crate_id}] Init failed: {e}")

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    def scan_block(self) -> Optional[BotBlock]:
        """Simulate scanning a BOT Chain block.

        In production, this would:
        1. Call eth_getBlockByNumber on https://rpc.botchain.ai
        2. Parse all transactions in the BOT Chain block
        3. Extract contract interactions from monitored BOT contracts
        4. Decode event logs using registered ABIs
        5. Score each interaction behaviorally
        """
        if not self._initialized:
            self.initialize()

        start = time.time()
        block_num = random.randint(1000000, 5000000)
        tx_count = random.randint(10, 150)
        gas_used = random.randint(1000000, 15000000)

        events = []
        bot_tx_count = 0

        for contract in BOT_CONTRACTS:
            if random.random() < 0.5:  # 50% interaction rate on BOT Chain
                for hook in contract.get("behavioralHooks", []):
                    if random.random() < 0.35:
                        tx_hash = hashlib.sha256(
                            f"bot:{block_num}:{contract['name']}:{hook}".encode()
                        ).hexdigest()
                        event = self.contracts.process_event(
                            contract_name=contract["name"],
                            block_number=block_num,
                            tx_hash=tx_hash,
                            event_type=hook,
                        )
                        events.append(event.to_signal_payload())
                        if event.bot_specific:
                            bot_tx_count += 1

        coherence = self._compute_block_coherence(events)

        duration = (time.time() - start) * 1000
        block = BotBlock(
            number=block_num,
            timestamp=datetime.now(timezone.utc).isoformat(),
            tx_count=tx_count, gas_used=gas_used,
            behavioral_events=events, coherence_score=coherence,
            scan_duration_ms=round(duration, 2),
            bot_transactions=bot_tx_count,
        )

        self._status.total_blocks_scanned += 1
        self._status.last_block_number = block_num
        self._status.avg_coherence = coherence

        return block

    def generate_signal(self) -> Dict[str, Any]:
        """Generate a behavioral signal from the BOT Chain crate.

        Scans a BOT Chain block, extracts behavioral events, and
        produces a TRION signal with BOT Chain metadata.
        """
        if not self._initialized:
            self.initialize()

        block = self.scan_block()

        if block and block.behavioral_events:
            primary_event = block.behavioral_events[0]
            signal = self._event_to_signal(primary_event, block)
        else:
            signal = self._generate_synthetic_signal()

        self._signal_buffer.append(signal)
        if len(self._signal_buffer) > self._max_signals:
            self._signal_buffer = self._signal_buffer[-self._max_signals:]

        self._status.signals_generated += 1
        self._status.uptime_seconds = time.time() - self._start_time
        if "BOT_SPECIFIC" in signal.get("tags", []):
            self._status.bot_specific_signals += 1

        return signal

    def _event_to_signal(self, event: Dict, block: BotBlock) -> Dict[str, Any]:
        """Convert a BOT Chain contract event into a TRION behavioral signal."""
        c = max(0.0, min(1.0, event.get("behavioralScore", 0.90) + random.gauss(0, 0.015)))
        th = max(0.0, min(1.0, random.gauss(0.65, 0.08)))
        status = "COHERENT" if c >= th else ("WARNING" if c >= th * 0.9 else "INTERCEPT")

        return {
            "id": self._status.signals_generated + 1,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(100,999)}Z",
            "source": "bot_chain_crate",
            "crateId": self.crate_id,
            "chain": "botchain",
            "chainName": "BOT Chain",
            "chainId": 677,
            "contract": event.get("contract", "unknown"),
            "entity": event.get("contract", "unknown"),
            "entityType": "BOT_CONTRACT",
            "coherence": round(c, 4),
            "threshold": round(th, 4),
            "phi": round(max(0, min(1, random.gauss(0.80, 0.10))), 4),
            "sigma": round(max(0, min(1, random.gauss(0.76, 0.08))), 4),
            "anima": round(max(0, min(1, random.gauss(0.85, 0.12))), 4),
            "mental": round(max(0, min(1, random.gauss(0.78, 0.08))), 4),
            "magnitude": round(random.uniform(0.1, 1.0), 4),
            "status": status,
            "sense": hashlib.sha256(f"bot:{block.number}:{c:.4f}".encode()).hexdigest()[:16],
            "antisense": hashlib.sha256(f"bot:{block.number}:{c:.4f}:anti".encode()).hexdigest()[:16],
            "blockNumber": block.number,
            "currency": "BOT",
            "tags": event.get("tags", []),
            "explorerUrl": f"https://scan.botchain.ai/block/{block.number}",
        }

    def _generate_synthetic_signal(self) -> Dict[str, Any]:
        """Generate a synthetic signal when no live events are available."""
        c = max(0.0, min(1.0, random.gauss(0.90, 0.04)))
        th = max(0.0, min(1.0, random.gauss(0.65, 0.08)))
        status = "COHERENT" if c >= th else ("WARNING" if c >= th * 0.9 else "INTERCEPT")
        block_num = random.randint(1000000, 5000000)
        contract = random.choice(BOT_CONTRACTS)

        return {
            "id": self._status.signals_generated + 1,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(100,999)}Z",
            "source": "bot_chain_crate",
            "crateId": self.crate_id,
            "chain": "botchain",
            "chainName": "BOT Chain",
            "chainId": 677,
            "contract": contract["name"],
            "entity": f"BOT-Entity-{random.randint(1,100)}",
            "entityType": "BOT_SYNTHETIC",
            "coherence": round(c, 4),
            "threshold": round(th, 4),
            "phi": round(max(0, min(1, random.gauss(0.80, 0.10))), 4),
            "sigma": round(max(0, min(1, random.gauss(0.76, 0.08))), 4),
            "anima": round(max(0, min(1, random.gauss(0.85, 0.12))), 4),
            "mental": round(max(0, min(1, random.gauss(0.78, 0.08))), 4),
            "magnitude": round(random.uniform(0.1, 1.0), 4),
            "status": status,
            "sense": hashlib.sha256(f"bot-synth:{block_num}".encode()).hexdigest()[:16],
            "antisense": hashlib.sha256(f"bot-synth:{block_num}:anti".encode()).hexdigest()[:16],
            "blockNumber": block_num,
            "currency": "BOT",
            "tags": ["synthetic", "chain:botchain", "bot_chain_crate"],
            "explorerUrl": f"https://scan.botchain.ai/block/{block_num}",
        }

    def _compute_block_coherence(self, events: List[Dict]) -> float:
        if not events:
            return round(0.90 + random.gauss(0, 0.015), 4)
        scores = [e.get("behavioralScore", 0.5) for e in events]
        avg = sum(scores) / len(scores)
        return round(max(0.0, min(1.0, avg + random.gauss(0, 0.01))), 4)

    def get_status(self) -> Dict[str, Any]:
        """Get the current status of the BOT Chain Crate."""
        self._status.uptime_seconds = time.time() - self._start_time
        s = self._status
        return {
            "crate": s.name, "crateId": self.crate_id, "version": s.version,
            "chainName": s.chain_name, "chainId": s.chain_id,
            "rpc": s.rpc, "explorer": s.explorer, "currency": s.currency,
            "status": s.status, "contractsMonitored": s.contracts_monitored,
            "signalsGenerated": s.signals_generated,
            "totalBlocksScanned": s.total_blocks_scanned,
            "uptimeSeconds": round(s.uptime_seconds, 1),
            "lastBlockNumber": s.last_block_number,
            "avgCoherence": round(s.avg_coherence, 4),
            "botSpecificSignals": s.bot_specific_signals,
            "errors": s.errors,
            "publishingActive": self._publishing,
            "contractSummary": self.contracts.get_contract_summary(),
            "tradingPairs": [{
                **p,
                "price": round(p["price"] + random.gauss(0, p["price"] * 0.001), 6),
                "btv": round(p["btv"] + random.gauss(0, p["btv"] * 0.0005), 6),
                "lastUpdate": datetime.now(timezone.utc).isoformat(),
            } for p in BOT_TRADING_PAIRS],
        }

    def get_signals(self, n: int = 50) -> List[Dict[str, Any]]:
        return self._signal_buffer[-n:]

    def get_chain_info(self) -> Dict[str, Any]:
        """Get BOT Chain network info for the API."""
        return {
            "id": "botchain",
            "name": "BOT Chain",
            "vm": "EVM",
            "chainId": 677,
            "status": "active",
            "rpc": BOT_RPC,
            "explorer": BOT_EXPLORER,
            "currency": BOT_CURRENCY,
            "latency": round(random.uniform(15, 80), 1),
            "blockHeight": random.randint(1000000, 5000000),
            "behaviorsIndexed": random.randint(5000, 200000),
            "coherenceBaseline": 0.90,
            "contractsMonitored": len(BOT_CONTRACTS),
            "cratedBy": "bot_chain_crate",
        }
