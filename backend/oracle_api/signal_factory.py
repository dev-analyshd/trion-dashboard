import time, random, hashlib
from datetime import datetime, timezone
from .config import CHAINS, BEO_ENTITIES, ARCHETYPES

def _ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(100,999)}Z"

class SignalFactory:
    _instance = None
    def __init__(self):
        self.counter = 0
        self.signals = []
        self.max_history = 200
        self.entity_coh = {e["name"].lower().replace(" ","_"): e["coherence"] for e in BEO_ENTITIES}
        for _ in range(50): self.signals.append(self._gen())

    @classmethod
    def get(cls):
        if cls._instance is None: cls._instance = cls()
        return cls._instance

    def _gen(self):
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
        }

    def latest(self, n=50): return self.signals[-n:]
    def generate_one(self):
        s = self._gen()
        self.signals.append(s)
        if len(self.signals) > self.max_history: self.signals = self.signals[-self.max_history:]
        return s
    def stats(self):
        r = self.signals[-100:] if len(self.signals) >= 100 else self.signals
        if not r: return {"total":0,"coherent":0,"warnings":0,"intercepts":0,"avgCoherence":0}
        return {"total":len(r),"coherent":sum(1 for s in r if s["status"]=="COHERENT"),
                "warnings":sum(1 for s in r if s["status"]=="WARNING"),
                "intercepts":sum(1 for s in r if s["status"]=="INTERCEPT"),
                "avgCoherence":round(sum(s["coherence"] for s in r)/len(r),4)}
