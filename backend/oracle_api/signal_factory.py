import time, random, hashlib, logging, threading
from datetime import datetime, timezone
from .config import CHAINS, BEO_ENTITIES, ARCHETYPES

logger = logging.getLogger(__name__)

def _ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(100,999)}Z"

class SignalFactory:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.counter = 0
        self.signals = []
        self.max_history = 200
        self.entity_coh = {e["name"].lower().replace(" ","_"): e["coherence"] for e in BEO_ENTITIES}
        self._evm_crate = None
        self._bot_crate = None
        self._evm_relayer = None
        self._bot_relayer = None
        self._crates_initialized = False
        for _ in range(50):
            self.signals.append(self._gen())

    @classmethod
    def get(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def init_crates(self):
        """Initialize independent crates and relayers."""
        if self._crates_initialized:
            return
        try:
            from crates.evm import EVMCrate
            from crates.bot_chain import BotChainCrate
            from relayers.evm_relayer import EVMRelayer
            from relayers.bot_chain_relayer import BotChainRelayer

            self._evm_crate = EVMCrate()
            self._evm_crate.initialize()
            self._bot_crate = BotChainCrate()
            self._bot_crate.initialize()
            self._evm_relayer = EVMRelayer()
            self._bot_relayer = BotChainRelayer()
            self._crates_initialized = True
            logger.info("[SignalFactory] All crates and relayers initialized")
        except Exception as e:
            logger.warning(f"[SignalFactory] Crate init failed (using fallback): {e}")

    @property
    def evm_crate(self):
        if not self._crates_initialized:
            self.init_crates()
        return self._evm_crate

    @property
    def bot_crate(self):
        if not self._crates_initialized:
            self.init_crates()
        return self._bot_crate

    @property
    def evm_relayer(self):
        if not self._crates_initialized:
            self.init_crates()
        return self._evm_relayer

    @property
    def bot_relayer(self):
        if not self._crates_initialized:
            self.init_crates()
        return self._bot_relayer

    def _gen(self, source=None):
        self.counter += 1
        chain = random.choice(CHAINS)
        entity = random.choice(BEO_ENTITIES)
        archetype = random.choice(ARCHETYPES)
        key = entity["name"].lower().replace(" ","_")
        base_c = self.entity_coh.get(key, 0.85)
        c = max(0.0, min(1.0, base_c + random.gauss(0, 0.03)))
        self.entity_coh[key] = c
        th = max(0.0, min(1.0, random.gauss(0.65, 0.08)))
        status = "COHERENT" if c >= th else ("WARNING" if c >= th * 0.9 else "INTERCEPT")
        payload = f"{self.counter}:{chain['id']}:{entity['name']}:{c:.4f}"
        return {
            "id": self.counter, "timestamp": _ts(), "chain": chain["id"], "chainName": chain["name"],
            "chainId": chain.get("chainId", 0), "currency": chain.get("currency", ""),
            "entity": entity["name"], "entityType": entity["archetype"], "archetype": archetype["name"],
            "archetypeLevel": archetype["level"], "coherence": round(c, 4), "threshold": round(th, 4),
            "phi": round(max(0, min(1, random.gauss(0.75, 0.12))), 4),
            "sigma": round(max(0, min(1, random.gauss(0.70, 0.10))), 4),
            "anima": round(max(0, min(1, random.gauss(0.80, 0.15))), 4),
            "mental": round(max(0, min(1, random.gauss(0.72, 0.10))), 4),
            "magnitude": round(random.uniform(0.1, 1.0), 4), "status": status,
            "sense": hashlib.sha256(payload.encode()).hexdigest()[:16],
            "antisense": hashlib.sha256((payload+":anti").encode()).hexdigest()[:16],
            "blockNumber": random.randint(180000000, 200000000),
            "source": source or "signal_factory",
        }

    def latest(self, n=50): return self.signals[-n:]

    def generate_one(self, source=None):
        s = self._gen(source=source)
        self.signals.append(s)
        if len(self.signals) > self.max_history:
            self.signals = self.signals[-self.max_history:]
        return s

    def generate_from_crate(self, crate_type="evm"):
        """Generate a signal from a specific crate."""
        try:
            if crate_type == "bot_chain" and self._bot_crate:
                signal = self._bot_crate.generate_signal()
                signal["id"] = self.counter + 1
                self.counter += 1
                self.signals.append(signal)
                if len(self.signals) > self.max_history:
                    self.signals = self.signals[-self.max_history:]
                if self._bot_relayer:
                    self._bot_relayer.enqueue(signal)
                return signal
            elif crate_type == "evm" and self._evm_crate:
                signal = self._evm_crate.generate_signal()
                signal["id"] = self.counter + 1
                self.counter += 1
                self.signals.append(signal)
                if len(self.signals) > self.max_history:
                    self.signals = self.signals[-self.max_history:]
                if self._evm_relayer:
                    self._evm_relayer.enqueue(signal)
                return signal
        except Exception as e:
            logger.warning(f"[SignalFactory] Crate generation failed: {e}")
        return self.generate_one(source=f"{crate_type}_crate_fallback")

    def get_crate_statuses(self):
        """Get statuses of all crates and relayers."""
        result = {}
        try:
            if self._evm_crate:
                result["evmCrate"] = self._evm_crate.get_status()
            if self._bot_crate:
                result["botChainCrate"] = self._bot_crate.get_status()
            if self._evm_relayer:
                result["evmRelayer"] = self._evm_relayer.get_status()
            if self._bot_relayer:
                result["botChainRelayer"] = self._bot_relayer.get_status()
        except Exception as e:
            logger.warning(f"[SignalFactory] Error getting crate statuses: {e}")
        return result

    def stats(self):
        r = self.signals[-100:] if len(self.signals) >= 100 else self.signals
        if not r: return {"total":0,"coherent":0,"warnings":0,"intercepts":0,"avgCoherence":0}
        return {"total":len(r),"coherent":sum(1 for s in r if s["status"]=="COHERENT"),
                "warnings":sum(1 for s in r if s["status"]=="WARNING"),
                "intercepts":sum(1 for s in r if s["status"]=="INTERCEPT"),
                "avgCoherence":round(sum(s["coherence"] for s in r)/len(r),4)}
