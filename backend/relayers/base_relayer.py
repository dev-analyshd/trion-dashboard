"""Base Relayer — Abstract relayer interface for TRION signal publishing.

All relayers extend this base class. The base relayer provides:
- Signal queuing and batching
- Retry logic with exponential backoff
- Health monitoring and status reporting
- Throughput tracking
- Publish acknowledgment handling
"""
import time, random, logging, asyncio
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone
from abc import ABC, abstractmethod
from collections import deque

logger = logging.getLogger(__name__)


@dataclass
class RelayerStatus:
    """Runtime status of a relayer."""
    name: str = "base"
    version: str = "1.0.0"
    status: str = "initializing"
    chains_served: int = 0
    signals_published: int = 0
    signals_pending: int = 0
    signals_failed: int = 0
    throughput: str = "0 tx/s"
    uptime_seconds: float = 0.0
    last_publish_time: str = ""
    last_error: str = ""
    total_batches: int = 0
    avg_batch_size: float = 0.0
    retry_count: int = 0
    max_retries: int = 3


class BaseRelayer(ABC):
    """Abstract base relayer for TRION signal publishing.

    Subclasses must implement:
    - publish_signal(signal): Publish a single signal to the target chain
    - publish_batch(signals): Publish a batch of signals
    - get_target_info(): Return target chain/network info

    The base class provides:
    - Signal queuing with max queue size
    - Automatic batching
    - Retry with exponential backoff
    - Health monitoring
    - Throughput calculation
    """

    def __init__(self, relayer_id: str, max_queue_size: int = 1000,
                 batch_size: int = 10, max_retries: int = 3):
        self.relayer_id = relayer_id
        self._queue: deque = deque(maxlen=max_queue_size)
        self._batch_size = batch_size
        self._max_retries = max_retries
        self._status = RelayerStatus(name=self.__class__.__name__, max_retries=max_retries)
        self._start_time = time.time()
        self._publish_times: List[float] = []
        self._signal_callback: Optional[Callable] = None
        self._running = False

    @property
    def status(self) -> RelayerStatus:
        return self._status

    @abstractmethod
    def publish_signal(self, signal: Dict[str, Any]) -> bool:
        """Publish a single signal. Returns True on success."""
        pass

    @abstractmethod
    def publish_batch(self, signals: List[Dict[str, Any]]) -> int:
        """Publish a batch of signals. Returns count of successful publishes."""
        pass

    @abstractmethod
    def get_target_info(self) -> Dict[str, Any]:
        """Return target chain/network information."""
        pass

    def enqueue(self, signal: Dict[str, Any]) -> bool:
        """Add a signal to the publish queue."""
        try:
            self._queue.append(signal)
            self._status.signals_pending = len(self._queue)
            return True
        except Exception as e:
            logger.warning(f"[{self.relayer_id}] Queue full, dropping signal: {e}")
            return False

    def enqueue_batch(self, signals: List[Dict[str, Any]]) -> int:
        """Add multiple signals to the queue. Returns count actually queued."""
        count = 0
        for s in signals:
            if self.enqueue(s):
                count += 1
        return count

    def flush(self) -> Dict[str, Any]:
        """Flush all queued signals by publishing in batches."""
        if not self._queue:
            return {"published": 0, "failed": 0, "batches": 0}

        total_published = 0
        total_failed = 0
        batches = 0

        while self._queue:
            batch = [self._queue.popleft() for _ in range(min(self._batch_size, len(self._queue)))]
            try:
                published = self._publish_with_retry(batch)
                total_published += published
                total_failed += len(batch) - published
                batches += 1
            except Exception as e:
                total_failed += len(batch)
                batches += 1
                self._status.last_error = str(e)
                logger.error(f"[{self.relayer_id}] Batch publish failed: {e}")

        self._status.signals_published += total_published
        self._status.signals_failed += total_failed
        self._status.total_batches += batches
        self._status.signals_pending = len(self._queue)
        self._status.last_publish_time = datetime.now(timezone.utc).isoformat()

        if batches > 0:
            self._status.avg_batch_size = total_published / batches

        return {"published": total_published, "failed": total_failed, "batches": batches}

    def _publish_with_retry(self, signals: List[Dict[str, Any]]) -> int:
        """Publish a batch with exponential backoff retry."""
        for attempt in range(self._max_retries):
            try:
                result = self.publish_batch(signals)
                if result > 0:
                    return result
            except Exception as e:
                self._status.retry_count += 1
                if attempt < self._max_retries - 1:
                    wait = 0.1 * (2 ** attempt) + random.uniform(0, 0.1)
                    time.sleep(wait)
                else:
                    raise
        return 0

    def calculate_throughput(self) -> str:
        """Calculate current throughput in signals per second."""
        now = time.time()
        self._publish_times = [t for t in self._publish_times if now - t < 60]
        if len(self._publish_times) < 2:
            return "0 tx/s"
        elapsed = now - self._publish_times[0]
        if elapsed <= 0:
            return "0 tx/s"
        rate = len(self._publish_times) / elapsed
        return f"{rate:.1f} tx/s"

    def record_publish(self):
        """Record a publish event for throughput calculation."""
        self._publish_times.append(time.time())

    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive relayer status."""
        self._status.uptime_seconds = time.time() - self._start_time
        self._status.throughput = self.calculate_throughput()
        s = self._status
        return {
            "relayer": s.name, "relayerId": self.relayer_id,
            "version": s.version, "status": s.status,
            "chainsServed": s.chains_served,
            "signalsPublished": s.signals_published,
            "signalsPending": s.signals_pending,
            "signalsFailed": s.signals_failed,
            "throughput": s.throughput,
            "uptimeSeconds": round(s.uptime_seconds, 1),
            "lastPublishTime": s.last_publish_time,
            "lastError": s.last_error,
            "totalBatches": s.total_batches,
            "avgBatchSize": round(s.avg_batch_size, 1),
            "retryCount": s.retry_count,
            "target": self.get_target_info(),
        }

    def set_signal_callback(self, callback: Callable):
        """Set a callback to be called after each successful publish."""
        self._signal_callback = callback

    def _notify_callback(self, signal: Dict[str, Any]):
        """Notify the registered callback of a published signal."""
        if self._signal_callback:
            try:
                self._signal_callback(signal)
            except Exception as e:
                logger.warning(f"[{self.relayer_id}] Callback error: {e}")
