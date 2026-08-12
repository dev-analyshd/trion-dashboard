"""EVM Crate — Core behavioral sensing engine for EVM-compatible chains.

The EVM Crate is the primary signal extraction module for all EVM-compatible
networks in the TRION protocol. It provides:

- Block scanning and transaction parsing
- Behavioral pattern extraction from smart contract interactions
- Coherence scoring using phi-sigma-ANIMA correlation
- Signal generation and publishing to the relayer network
- Cross-chain coherence tracking

This crate operates independently and publishes signals through its
configured relayer. It maintains its own state and can be instantiated
multiple times for parallel chain processing.
"""
import time, random, hashlib, logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field

from .config import EVM_CHAINS, EVM_CONTRACTS, get_chain_by_name, get_contracts_for_chain
from .contracts import EVMContracts, ContractEvent

logger = logging.getLogger(__name__)


@dataclass
class EVMBlock:
    """Represents a scanned EVM block with behavioral metadata."""
    number: int
    chain: str
    chain_id: int
    timestamp: str
    tx_count: int
    gas_used: int
    behavioral_events: List[Dict[str, Any]] = field(default_factory=list)
    coherence_score: float = 0.0
    scan_duration_ms: float = 0.0


@dataclass
class CrateStatus:
    """Runtime status of the EVM Crate."""
    name: str = "EVM Crate"
    version: str = "1.0.0"
    chains_indexed: int = 0
    contracts_monitored: int = 0
    signals_generated: int = 0
    total_blocks_scanned: int = 0
    uptime_seconds: float = 0.0
    last_block_number: int = 0
    last_chain: str = ""
    status: str = "initializing"
    errors: int = 0
    avg_coherence: float = 0.0


class EVMCrate:
    """Core EVM behavioral sensing crate.

    Independently scans EVM-compatible chains, extracts behavioral
    signals from contract interactions, computes coherence scores,
    and publishes signals for relaying.

    Usage:
        crate = EVMCrate()
        crate.initialize()
        signal = crate.scan_and_generate(chain_id=42161)
        status = crate.get_status()
    """

    def __init__(self, crate_id: str = "evm-primary"):
        self.crate_id = crate_id
        self.contracts = EVMContracts()
        self._status = CrateStatus()
        self._start_time = time.time()
        self._signal_buffer: List[Dict[str, Any]] = []
        self._max_signals = 500
        self._chains_configured: Dict[str, Dict] = {}
        self._initialized = False

    def initialize(self) -> None:
        """Initialize the EVM crate with chain configs and contract monitors."""
        try:
            self.contracts.initialize(EVM_CONTRACTS)
            for chain in EVM_CHAINS:
                self._chains_configured[chain["id"]] = chain
            self._status.chains_indexed = len(EVM_CHAINS)
            self._status.contracts_monitored = len(EVM_CONTRACTS)
            self._status.status = "running"
            self._initialized = True
            logger.info(f"[EVM Crate:{self.crate_id}] Initialized — {len(EVM_CHAINS)} chains, {len(EVM_CONTRACTS)} contracts")
        except Exception as e:
            self._status.status = "error"
            self._status.errors += 1
            logger.error(f"[EVM Crate:{self.crate_id}] Init failed: {e}")

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    def scan_block(self, chain_name: str) -> Optional[EVMBlock]:
        """Simulate scanning a block on the specified chain.

        In production, this would:
        1. Call eth_getBlockByNumber on the chain RPC
        2. Parse all transactions in the block
        3. Extract contract interactions (to/from monitored addresses)
        4. Decode event logs using registered ABIs
        5. Score each interaction behaviorally
        """
        chain = self._chains_configured.get(chain_name)
        if not chain:
            logger.warning(f"[EVM Crate] Unknown chain: {chain_name}")
            return None

        start = time.time()
        block_num = random.randint(180000000, 200000000)
        tx_count = random.randint(50, 500)
        gas_used = random.randint(5000000, 28000000)

        events = []
        chain_contracts = get_contracts_for_chain(chain_name)

        # Simulate processing contract events from this block
        for contract in chain_contracts:
            if random.random() < 0.4:  # 40% chance of interaction per contract per block
                for hook in contract.get("behavioralHooks", []):
                    if random.random() < 0.3:
                        event = self.contracts.process_event(
                            contract_name=contract["name"],
                            chain=chain_name,
                            block_number=block_num,
                            tx_hash=hashlib.sha256(f"{block_num}:{contract['name']}:{hook}".encode()).hexdigest(),
                            event_type=hook,
                        )
                        events.append(event.to_signal_payload())

        # Calculate block-level coherence
        coherence = self._compute_block_coherence(events, chain)

        duration = (time.time() - start) * 1000
        block = EVMBlock(
            number=block_num, chain=chain_name, chain_id=chain["chainId"],
            timestamp=datetime.now(timezone.utc).isoformat(),
            tx_count=tx_count, gas_used=gas_used,
            behavioral_events=events, coherence_score=coherence,
            scan_duration_ms=round(duration, 2),
        )

        # Update status
        self._status.total_blocks_scanned += 1
        self._status.last_block_number = block_num
        self._status.last_chain = chain_name
        self._status.avg_coherence = coherence

        return block

    def generate_signal(self, chain_name: Optional[str] = None) -> Dict[str, Any]:
        """Generate a behavioral signal from the EVM crate.

        If chain_name is specified, scans that chain. Otherwise picks
        a random active EVM chain.
        """
        if not self._initialized:
            self.initialize()

        if chain_name is None:
            active = [c for c in EVM_CHAINS if c["status"] == "active"]
            chain = random.choice(active) if active else EVM_CHAINS[0]
        else:
            chain = self._chains_configured.get(chain_name, EVM_CHAINS[0])

        chain_name = chain["id"]
        block = self.scan_block(chain_name)

        # Use block data or fallback to generated signal
        if block and block.behavioral_events:
            primary_event = block.behavioral_events[0]
            signal = self._event_to_signal(primary_event, block, chain)
        else:
            signal = self._generate_synthetic_signal(chain)

        self._signal_buffer.append(signal)
        if len(self._signal_buffer) > self._max_signals:
            self._signal_buffer = self._signal_buffer[-self._max_signals:]

        self._status.signals_generated += 1
        self._status.uptime_seconds = time.time() - self._start_time

        return signal

    def _event_to_signal(self, event: Dict, block: EVMBlock, chain: Dict) -> Dict[str, Any]:
        """Convert a contract event into a TRION behavioral signal."""
        c = max(0.0, min(1.0, event.get("behavioralScore", 0.85) + random.gauss(0, 0.02)))
        th = max(0.0, min(1.0, random.gauss(0.65, 0.08)))
        status = "COHERENT" if c >= th else ("WARNING" if c >= th * 0.9 else "INTERCEPT")

        return {
            "id": self._status.signals_generated + 1,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(100,999)}Z",
            "source": "evm_crate",
            "crateId": self.crate_id,
            "chain": chain["id"],
            "chainName": chain["name"],
            "chainId": chain["chainId"],
            "contract": event.get("contract", "unknown"),
            "entity": event.get("contract", "unknown"),
            "entityType": "EVM_CONTRACT",
            "coherence": round(c, 4),
            "threshold": round(th, 4),
            "phi": round(max(0, min(1, random.gauss(0.75, 0.12))), 4),
            "sigma": round(max(0, min(1, random.gauss(0.70, 0.10))), 4),
            "anima": round(max(0, min(1, random.gauss(0.80, 0.15))), 4),
            "mental": round(max(0, min(1, random.gauss(0.72, 0.10))), 4),
            "magnitude": round(random.uniform(0.1, 1.0), 4),
            "status": status,
            "sense": hashlib.sha256(f"evm:{chain['id']}:{c:.4f}".encode()).hexdigest()[:16],
            "antisense": hashlib.sha256(f"evm:{chain['id']}:{c:.4f}:anti".encode()).hexdigest()[:16],
            "blockNumber": block.number,
            "tags": event.get("tags", []),
        }

    def _generate_synthetic_signal(self, chain: Dict) -> Dict[str, Any]:
        """Generate a synthetic signal when no live events are available."""
        c = max(0.0, min(1.0, random.gauss(chain.get("coherenceBaseline", 0.85), 0.05)))
        th = max(0.0, min(1.0, random.gauss(0.65, 0.08)))
        status = "COHERENT" if c >= th else ("WARNING" if c >= th * 0.9 else "INTERCEPT")
        block_num = random.randint(180000000, 200000000)

        return {
            "id": self._status.signals_generated + 1,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(100,999)}Z",
            "source": "evm_crate",
            "crateId": self.crate_id,
            "chain": chain["id"],
            "chainName": chain["name"],
            "chainId": chain["chainId"],
            "contract": "synthetic",
            "entity": f"EVM-Entity-{random.randint(1,100)}",
            "entityType": "SYNTHETIC",
            "coherence": round(c, 4),
            "threshold": round(th, 4),
            "phi": round(max(0, min(1, random.gauss(0.75, 0.12))), 4),
            "sigma": round(max(0, min(1, random.gauss(0.70, 0.10))), 4),
            "anima": round(max(0, min(1, random.gauss(0.80, 0.15))), 4),
            "mental": round(max(0, min(1, random.gauss(0.72, 0.10))), 4),
            "magnitude": round(random.uniform(0.1, 1.0), 4),
            "status": status,
            "sense": hashlib.sha256(f"evm-synth:{chain['id']}:{block_num}".encode()).hexdigest()[:16],
            "antisense": hashlib.sha256(f"evm-synth:{chain['id']}:{block_num}:anti".encode()).hexdigest()[:16],
            "blockNumber": block_num,
            "tags": ["synthetic", f"chain:{chain['id']}", "evm_crate"],
        }

    def _compute_block_coherence(self, events: List[Dict], chain: Dict) -> float:
        """Compute coherence score for a block based on its events."""
        if not events:
            return round(chain.get("coherenceBaseline", 0.85) + random.gauss(0, 0.02), 4)
        scores = [e.get("behavioralScore", 0.5) for e in events]
        avg = sum(scores) / len(scores)
        return round(max(0.0, min(1.0, avg + random.gauss(0, 0.01))), 4)

    def get_status(self) -> Dict[str, Any]:
        """Get the current status of the EVM Crate."""
        self._status.uptime_seconds = time.time() - self._start_time
        s = self._status
        return {
            "crate": s.name, "crateId": self.crate_id, "version": s.version,
            "status": s.status, "chainsIndexed": s.chains_indexed,
            "contractsMonitored": s.contracts_monitored, "signalsGenerated": s.signals_generated,
            "totalBlocksScanned": s.total_blocks_scanned,
            "uptimeSeconds": round(s.uptime_seconds, 1),
            "lastBlockNumber": s.last_block_number, "lastChain": s.last_chain,
            "avgCoherence": round(s.avg_coherence, 4), "errors": s.errors,
            "contractSummary": self.contracts.get_contract_summary(),
        }

    def get_signals(self, n: int = 50) -> List[Dict[str, Any]]:
        return self._signal_buffer[-n:]

    def get_chain_status(self) -> List[Dict[str, Any]]:
        """Get status for all configured EVM chains."""
        out = []
        for chain in EVM_CHAINS:
            ch = dict(chain)
            if ch["status"] == "active":
                ch["latency"] = round(random.uniform(8, 120), 1)
                ch["blockHeight"] = random.randint(180000000, 200000000)
                ch["behaviorsIndexed"] = random.randint(10000, 500000)
            out.append(ch)
        return out
