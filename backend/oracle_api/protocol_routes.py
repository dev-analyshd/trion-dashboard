import time, random
from datetime import datetime, timezone
from fastapi import APIRouter
from .config import (
    CHAINS, VM_FAMILIES, RELAYERS, DEPLOYMENTS, GOVERNANCE_ITEMS,
    CONTRACTS, LANGUAGE_STATS, ARCHETYPES, FALSIFIABILITY,
    ANIMA_STREAMS, TRADING_PAIRS, BEO_ENTITIES, CRISPR_SIGNATURES,
    LIVING_SECURITY,
)
from .signal_factory import SignalFactory

router = APIRouter(prefix="/api/v1")

@router.get("")
async def root(): return {"name":"TRION Oracle","version":"3.0.0","status":"running"}

@router.get("/signals/latest")
async def latest_signals(count: int = 50):
    f = SignalFactory.get()
    return {"signals": f.latest(count), "count": len(f.latest(count))}

@router.get("/signals/stats")
async def signal_stats():
    s = SignalFactory.get().stats()
    s["timestamp"] = datetime.now(timezone.utc).isoformat()
    return s

@router.get("/chains")
async def chains():
    out = []
    for c in CHAINS:
        ch = dict(c)
        if ch["status"] == "active":
            ch["latency"] = round(random.uniform(8, 120), 1)
            ch["blockHeight"] = random.randint(180000000, 200000000)
            ch["behaviorsIndexed"] = random.randint(10000, 500000)
        out.append(ch)
    return {"chains": out, "active": sum(1 for c in out if c["status"]=="active"), "total": len(out), "indexing": sum(1 for c in out if c["status"]=="indexing")}

@router.get("/vm-families")
async def vm_families(): return {"families": VM_FAMILIES, "totalChains": len(CHAINS)}

@router.get("/contracts")
async def contracts(): return {"contracts": CONTRACTS, "total": len(CONTRACTS)}

@router.get("/languages")
async def languages(): return {"languages": LANGUAGE_STATS, "totalLoc": sum(l["loc"] for l in LANGUAGE_STATS)}

@router.get("/relayers")
async def relayers():
    out = []
    for r in RELAYERS:
        rel = dict(r)
        if rel["status"] == "active": rel["uptime"] = f"{random.uniform(99.5,99.99):.2f}%"; rel["signalsProcessed"] = random.randint(100000,999999)
        out.append(rel)
    return {"relayers": out, "total": len(out)}

@router.get("/deployments")
async def deployments(): return {"deployments": DEPLOYMENTS}

@router.get("/governance/proposals")
async def governance(): return {"proposals": GOVERNANCE_ITEMS, "total": len(GOVERNANCE_ITEMS)}

@router.get("/falsifiability")
async def falsifiability(): return {"tests": FALSIFIABILITY}

@router.get("/anima/streams")
async def anima_streams():
    out = [{**s, "lastUpdate": datetime.now(timezone.utc).isoformat(), "vectorsProcessed": random.randint(100000,5000000)} for s in ANIMA_STREAMS]
    return {"streams": out}

@router.get("/beo/entities")
async def beo_entities():
    f = SignalFactory.get()
    out = []
    for e in BEO_ENTITIES:
        ent = dict(e)
        key = e["name"].lower().replace(" ","_")
        ent["currentCoherence"] = round(f.entity_coh.get(key, e["coherence"]), 4)
        ent["lastSignal"] = datetime.now(timezone.utc).isoformat()
        out.append(ent)
    return {"entities": out}

@router.get("/trading/pairs")
async def trading_pairs():
    out = []
    for p in TRADING_PAIRS:
        pair = dict(p)
        pair["price"] = round(pair["price"] + random.gauss(0, pair["price"]*0.001), 2)
        pair["btv"] = round(pair["btv"] + random.gauss(0, pair["btv"]*0.0005), 2)
        pair["change24h"] = round(pair["change24h"] + random.gauss(0, 0.1), 2)
        pair["lastUpdate"] = datetime.now(timezone.utc).isoformat()
        out.append(pair)
    return {"pairs": out}

@router.get("/security/crispr")
async def crispr():
    out = [{**s, "lastTriggered": datetime.now(timezone.utc).isoformat(), "active": random.choice([True,True,True,False])} for s in CRISPR_SIGNATURES]
    return {"signatures": out, "totalIntercepts": sum(s["intercepts"] for s in CRISPR_SIGNATURES)}

@router.get("/security/living")
async def living_security():
    out = []
    for s in LIVING_SECURITY:
        comp = dict(s)
        comp["score"] = round(max(85.0, min(100.0, comp["score"] + random.gauss(0, 0.3))), 1)
        comp["lastCheck"] = datetime.now(timezone.utc).isoformat()
        out.append(comp)
    return {"components": out}

@router.get("/security/alerts")
async def security_alerts():
    alerts = []
    for i in range(random.randint(5,15)):
        sig = random.choice(CRISPR_SIGNATURES)
        chain = random.choice(CHAINS)
        alerts.append({"id":f"ALERT-{int(time.time())}-{i}","timestamp":datetime.now(timezone.utc).isoformat(),
            "signature":sig["name"],"severity":sig["severity"],"chain":chain["name"],
            "entity":random.choice(BEO_ENTITIES)["name"],"status":random.choice(["intercepted","monitoring","resolved"]),
            "coherence":round(random.uniform(0.1,0.5),4)})
    return {"alerts": alerts, "total": len(alerts)}

@router.get("/archetypes")
async def archetypes(): return {"archetypes": ARCHETYPES}

@router.get("/0g/status")
async def zg_status():
    return {"timestamp":datetime.now(timezone.utc).isoformat(),"network":"0G Galileo Testnet","chainId":16602,"connected":True,
        "blockHeight":random.randint(1500000,2000000),
        "executionGate":{"address":"0xDB5910Dc6CfD219D00F64be1F23DA0289901356d","status":"active","lastExecution":datetime.now(timezone.utc).isoformat(),"totalExecutions":random.randint(50000,200000)},
        "daStorage":{"endpoint":"https://da-node.0g.ai","status":"connected","totalCommitments":random.randint(10000,80000),"storageUsed":f"{random.uniform(1.2,4.8):.1f} GB","lastCommitment":datetime.now(timezone.utc).isoformat()},
        "faissSync":{"status":"syncing","vectorsSynced":random.randint(500000,3000000),"lastSync":datetime.now(timezone.utc).isoformat(),"indexSize":f"{random.uniform(2.1,3.8):.1f} GB"},
        "zkProof":{"enabled":True,"proofsGenerated":random.randint(20000,100000),"avgProofTime":f"{random.uniform(0.5,2.3):.2f}s"}}

@router.get("/0g/proof")
async def zg_proof():
    import hashlib
    h = hashlib.sha256(f"trion-{int(time.time())}-{random.randint(1000,9999)}".encode()).hexdigest()
    return {"timestamp":datetime.now(timezone.utc).isoformat(),"rootHash":h,"blockNumber":random.randint(1500000,2000000),"numLeaves":random.randint(100,1000),"verified":True}

@router.get("/0g/sync/history")
async def zg_sync():
    return {"history":[{"timestamp":datetime.now(timezone.utc).isoformat(),"type":random.choice(["da_commitment","faiss_sync","proof_generation"]),"status":"success","duration":f"{random.uniform(0.1,3.0):.2f}s"} for _ in range(10)],"total":10}

@router.get("/0g/da/commitments")
async def zg_commitments():
    import hashlib
    return {"commitments":[{"hash":hashlib.sha256(f"{int(time.time())}-{i}".encode()).hexdigest(),"timestamp":datetime.now(timezone.utc).isoformat(),"size":f"{random.uniform(0.01,1.5):.3f} MB"} for i in range(10)],"total":10}

@router.get("/protocol/health")
async def protocol_health():
    f = SignalFactory.get()
    return {"timestamp":datetime.now(timezone.utc).isoformat(),
        "coreEngine":{"status":"running","uptime":"99.97%","memoryUsage":f"{random.uniform(45,72):.1f}%"},
        "faiss":{"status":"running","indexSize":f"{random.uniform(2.1,3.8):.1f} GB","vectorsIndexed":random.randint(1000000,5000000)},
        "relayers":{"status":"running","activeRelayers":sum(1 for r in RELAYERS if r["status"]=="active")},
        "zeroG":{"status":"connected","syncHeight":random.randint(1500000,2000000)},
        "anima":{"status":"active","streams":len(ANIMA_STREAMS),"accuracy":round(random.uniform(0.88,0.95),4)},
        "signals":f.stats(),
        "chains":{"active":sum(1 for c in CHAINS if c["status"]=="active"),"total":len(CHAINS)},
        "security":{"livingScore":round(random.uniform(94,99),1),"threatsActive":random.randint(0,5)}}

@router.get("/overview")
async def overview():
    f = SignalFactory.get()
    st = f.stats()
    ac = sum(1 for c in CHAINS if c["status"]=="active")
    return {"timestamp":datetime.now(timezone.utc).isoformat(),"signalStats":st,"latestSignals":f.latest(5),
        "chains":{"active":ac,"total":len(CHAINS),"indexing":len(CHAINS)-ac},
        "coherence":{"overall":round(random.uniform(0.82,0.96),4),"physical":round(random.uniform(0.85,0.98),4),
            "mental":round(random.uniform(0.80,0.95),4),"spiritual":round(random.uniform(0.70,0.90),4),
            "conscious":round(random.uniform(0.75,0.92),4),"anima":round(random.uniform(0.78,0.94),4)},
        "security":{"livingScore":round(random.uniform(94,99),1),"attacksIntercepted":random.randint(7000,12000)},
        "relayers":{"active":sum(1 for r in RELAYERS if r["status"]=="active"),"total":len(RELAYERS)}}

@router.get("/endpoints")
async def endpoints():
    eps = [{"method":"GET","path":"/api/v1/signals/latest","description":"Latest behavioral signals","auth":"public"},
        {"method":"GET","path":"/api/v1/chains","description":"All indexed chains","auth":"public"},
        {"method":"GET","path":"/api/v1/trading/pairs","description":"Trading pairs with firewall","auth":"public"},
        {"method":"GET","path":"/api/v1/security/crispr","description":"CRISPR engine status","auth":"public"},
        {"method":"GET","path":"/api/v1/0g/status","description":"0G network status","auth":"public"},
        {"method":"GET","path":"/api/v1/protocol/health","description":"Protocol health metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/beo/entities","description":"BEO entity data","auth":"public"},
        {"method":"GET","path":"/api/v1/governance/proposals","description":"Governance proposals","auth":"public"},
        {"method":"GET","path":"/api/v1/anima/streams","description":"ANIMA stream status","auth":"public"},
        {"method":"WS","path":"/ws/signals","description":"Real-time signal feed","auth":"public"}]
    return {"endpoints":eps,"total":len(eps)}
