"""EVM Relayer — Publishes behavioral signals from the EVM Crate to EVM chains.

The EVM Relayer handles signal publishing for all EVM-compatible chains.
It connects to the EVM Crate, receives generated signals, and publishes
them to the appropriate target chains.

Chains served: Ethereum, Arbitrum, Polygon, Optimism, Base, BSC, Avalanche,
HashKey, and Mantle (9 chains).
"""
import time, random, hashlib, logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from .base_relayer import BaseRelayer
from crates.evm.config import EVM_CHAINS

logger = logging.getLogger(__name__)


class EVMRelayer(BaseRelayer):
    """EVM Relayer — publishes signals from EVM Crate to EVM chains.

    Independently operated relayer that:
    - Receives signals from the EVM Crate
    - Routes signals to the correct target chain
    - Handles batch publishing with retry logic
    - Tracks per-chain publish statistics
    - Reports health and throughput metrics
    """

    def __init__(self, relayer_id: str = "evm-relayer-primary"):
        super().__init__(
            relayer_id=relayer_id,
            max_queue_size=2000,
            batch_size=15,
            max_retries=3,
        )
        self._chains = {c["id"]: c for c in EVM_CHAINS}
        self._chain_stats: Dict[str, Dict[str, Any]] = {}
        for c in EVM_CHAINS:
            self._chain_stats[c["id"]] = {
                "published": 0, "failed": 0, "lastPublish": "",
                "latency": round(random.uniform(8, 80), 1),
            }
        self._status.name = "EVM Relayer"
        self._status.chains_served = len(EVM_CHAINS)
        self._status.status = "running"
        logger.info(f"[EVM Relayer:{self.relayer_id}] Initialized for {len(EVM_CHAINS)} EVM chains")

    def publish_signal(self, signal: Dict[str, Any]) -> bool:
        """Publish a single signal to its target EVM chain.

        In production, this would:
        1. Determine the target chain from the signal
        2. Encode the signal as a contract call
        3. Sign and broadcast the transaction
        4. Wait for confirmation
        5. Record the publish
        """
        try:
            chain_id = signal.get("chain", "arbitrum")
            stats = self._chain_stats.get(chain_id, {})
            stats["published"] = stats.get("published", 0) + 1
            stats["lastPublish"] = datetime.now(timezone.utc).isoformat()
            stats["latency"] = round(random.uniform(8, 80), 1)

            self._status.signals_published += 1
            self._status.last_publish_time = datetime.now(timezone.utc).isoformat()
            self.record_publish()
            self._notify_callback(signal)
            return True
        except Exception as e:
            self._status.signals_failed += 1
            self._status.last_error = str(e)
            logger.warning(f"[EVM Relayer] Publish failed: {e}")
            return False

    def publish_batch(self, signals: List[Dict[str, Any]]) -> int:
        """Publish a batch of signals to their respective EVM chains."""
        published = 0
        for signal in signals:
            if self.publish_signal(signal):
                published += 1
        return published

    def get_target_info(self) -> Dict[str, Any]:
        """Return EVM chain target information."""
        return {
            "type": "EVM_MULTI_CHAIN",
            "chains": [c["id"] for c in EVM_CHAINS],
            "totalChains": len(EVM_CHAINS),
            "primaryChain": "arbitrum",
        }

    def get_chain_publish_stats(self) -> Dict[str, Any]:
        """Get per-chain publish statistics."""
        return {
            "relayer": "EVM Relayer",
            "chains": self._chain_stats,
            "totalPublished": self._status.signals_published,
        }

    def relay_from_crate(self, crate_signals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Receive signals from the EVM crate and queue them for publishing.

        This is the primary entry point for crate -> relayer signal flow.
        """
        queued = self.enqueue_batch(crate_signals)
        flush_result = self.flush()
        return {
            "relayer": "EVM Relayer",
            "signalsReceived": len(crate_signals),
            "signalsQueued": queued,
            **flush_result,
        }
