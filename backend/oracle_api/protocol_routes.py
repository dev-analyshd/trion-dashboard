import time, random, hashlib, math
from datetime import datetime, timezone
from fastapi import APIRouter, Query
from .config import (
    CHAINS, VM_FAMILIES, RELAYERS, DEPLOYMENTS, GOVERNANCE_ITEMS,
    CONTRACTS, ARCHETYPES, FALSIFIABILITY,
    ANIMA_STREAMS, TRADING_PAIRS, BEO_ENTITIES, CRISPR_SIGNATURES,
    LIVING_SECURITY, ZERO_BRIDGE_ROUTES, ANNOTATORS, VALIDATORS,
    EVOLUTIONARY_FITNESS, SBA_DATA, BIBL_DATA, AKASHIC_INDEX_DATA,
    CONTINUUM_DEX, BEHAVIORAL_MARKETPLACE, GENOMIC_KEYS, TIMESCALE_DB,
)
from .signal_factory import SignalFactory

router = APIRouter(prefix="/api/v1")

# ============================================================
# EXISTING ENDPOINTS (preserved)
# ============================================================

@router.get("")
async def root():
    f = SignalFactory.get()
    return {"name":"TRION Oracle","version":"3.1.0","status":"running","signalsGenerated":f.counter}

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
    h = hashlib.sha256(f"trion-{int(time.time())}-{random.randint(1000,9999)}".encode()).hexdigest()
    return {"timestamp":datetime.now(timezone.utc).isoformat(),"rootHash":h,"blockNumber":random.randint(1500000,2000000),"numLeaves":random.randint(100,1000),"verified":True}

@router.get("/0g/sync/history")
async def zg_sync():
    return {"history":[{"timestamp":datetime.now(timezone.utc).isoformat(),"type":random.choice(["da_commitment","faiss_sync","proof_generation"]),"status":"success","duration":f"{random.uniform(0.1,3.0):.2f}s"} for _ in range(10)],"total":10}

@router.get("/0g/da/commitments")
async def zg_commitments():
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
    eps = [
        {"method":"GET","path":"/api/v1/signals/latest","description":"Latest behavioral signals","auth":"public"},
        {"method":"GET","path":"/api/v1/chains","description":"All indexed chains (120+)","auth":"public"},
        {"method":"GET","path":"/api/v1/trading/pairs","description":"Trading pairs with firewall","auth":"public"},
        {"method":"GET","path":"/api/v1/security/crispr","description":"CRISPR engine status","auth":"public"},
        {"method":"GET","path":"/api/v1/0g/status","description":"0G network status","auth":"public"},
        {"method":"GET","path":"/api/v1/protocol/health","description":"Protocol health metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/beo/entities","description":"BEO entity data","auth":"public"},
        {"method":"GET","path":"/api/v1/governance/proposals","description":"Governance proposals","auth":"public"},
        {"method":"GET","path":"/api/v1/anima/streams","description":"ANIMA stream status","auth":"public"},
        {"method":"WS","path":"/ws/signals","description":"Real-time signal feed","auth":"public"},
        {"method":"GET","path":"/api/v1/crates/status","description":"All crate and relayer statuses","auth":"public"},
        {"method":"GET","path":"/api/v1/botchain/status","description":"BOT Chain dedicated status","auth":"public"},
        {"method":"GET","path":"/api/v1/botchain/contracts","description":"BOT Chain monitored contracts","auth":"public"},
        {"method":"GET","path":"/api/v1/zero-bridge/routes","description":"BTCP routing data","auth":"public"},
        {"method":"GET","path":"/api/v1/zero-bridge/stats","description":"BTCP routing summary","auth":"public"},
        {"method":"GET","path":"/api/v1/beo/live","description":"Live BEO entity data","auth":"public"},
        {"method":"GET","path":"/api/v1/bh/explorer","description":"Behavioral hash stream","auth":"public"},
        {"method":"GET","path":"/api/v1/bh/stream","description":"Streaming BH data","auth":"public"},
        {"method":"GET","path":"/api/v1/akashic/index","description":"Akashic Index metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/akashic/search","description":"Search Akashic Index","auth":"public"},
        {"method":"GET","path":"/api/v1/akashic/depth","description":"D(t) depth metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/living-security/gk","description":"Genomic Key stream","auth":"public"},
        {"method":"GET","path":"/api/v1/living-security/epigenetic","description":"Epigenetic layer state","auth":"public"},
        {"method":"GET","path":"/api/v1/living-security/immune","description":"Immune system status","auth":"public"},
        {"method":"GET","path":"/api/v1/annotators","description":"Human annotator network","auth":"public"},
        {"method":"GET","path":"/api/v1/annotators/reviews","description":"Recent annotation reviews","auth":"public"},
        {"method":"GET","path":"/api/v1/evolutionary/fitness","description":"Evolutionary fitness data","auth":"public"},
        {"method":"GET","path":"/api/v1/evolutionary/love-protocol","description":"Love Protocol metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/validators","description":"TRION-BFT validators","auth":"public"},
        {"method":"GET","path":"/api/v1/validators/consensus","description":"Consensus state","auth":"public"},
        {"method":"GET","path":"/api/v1/continuum/dex","description":"Continuum DEX data","auth":"public"},
        {"method":"GET","path":"/api/v1/continuum/bid-engine","description":"BID engine metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/continuum/cme-engine","description":"CME engine metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/continuum/bdc-credit","description":"BDC credit data","auth":"public"},
        {"method":"GET","path":"/api/v1/marketplace/listings","description":"Behavioral marketplace","auth":"public"},
        {"method":"GET","path":"/api/v1/marketplace/stats","description":"Marketplace summary","auth":"public"},
        {"method":"GET","path":"/api/v1/sba/assessments","description":"SBA assessments","auth":"public"},
        {"method":"GET","path":"/api/v1/bibl/analysis","description":"BIBL inter-block analysis","auth":"public"},
        {"method":"GET","path":"/api/v1/timescale/metrics","description":"TimescaleDB metrics","auth":"public"},
        {"method":"GET","path":"/api/v1/timescale/events","description":"Recent TimescaleDB events","auth":"public"},
        {"method":"GET","path":"/api/v1/ai-agents","description":"AI Agent data","auth":"public"},
        {"method":"GET","path":"/api/v1/settings","description":"TRION settings","auth":"public"},
    ]
    return {"endpoints":eps,"total":len(eps)}

@router.get("/crates/status")
async def crates_status():
    f = SignalFactory.get()
    return {"timestamp":datetime.now(timezone.utc).isoformat(), **f.get_crate_statuses()}

@router.get("/botchain/status")
async def botchain_status():
    f = SignalFactory.get()
    result = {"timestamp":datetime.now(timezone.utc).isoformat(), "chainId":677, "chainName":"BOT Chain", "rpc":"https://rpc.botchain.ai", "explorer":"https://scan.botchain.ai/", "currency":"BOT"}
    if f.bot_crate:
        result["crateStatus"] = f.bot_crate.get_status()
    if f.bot_relayer:
        result["relayerStatus"] = f.bot_relayer.get_status()
    bot_signals = [s for s in f.latest(50) if s.get("chain") == "botchain"]
    result["recentBotSignals"] = len(bot_signals)
    result["botCoherence"] = round(sum(s["coherence"] for s in bot_signals) / len(bot_signals), 4) if bot_signals else 0
    return result

@router.get("/botchain/contracts")
async def botchain_contracts():
    from crates.bot_chain.config import BOT_CONTRACTS
    return {"chainId":677, "chainName":"BOT Chain", "contracts":[{"name":c["name"],"address":c["address"],"language":c["language"],"verified":c["verified"],"loc":c["loc"],"behavioralHooks":c.get("behavioralHooks",[]),"signalTypes":c.get("signalTypes",[]),"description":c.get("description","")} for c in BOT_CONTRACTS], "total":len(BOT_CONTRACTS)}

# ============================================================
# NEW ENDPOINTS
# ============================================================

# --- Zero Bridge Routes ---

@router.get("/zero-bridge/routes")
async def zero_bridge_routes():
    out = []
    for r in ZERO_BRIDGE_ROUTES:
        route = dict(r)
        route["btcpScore"] = round(max(0, min(1, route["btcpScore"] + random.gauss(0, 0.01))), 4)
        route["gasSaved"] = round(max(0, route["gasSaved"] + random.gauss(0, 1.5)), 1)
        route["beoContinuity"] = round(max(0, min(1, route["beoContinuity"] + random.gauss(0, 0.005))), 4)
        route["value"] = round(max(0, route["value"] + random.gauss(0, route["value"]*0.005)), 0)
        route["lastUpdated"] = datetime.now(timezone.utc).isoformat()
        out.append(route)
    return {"routes": out, "total": len(out)}

@router.get("/zero-bridge/stats")
async def zero_bridge_stats():
    active = sum(1 for r in ZERO_BRIDGE_ROUTES if r["status"] == "active")
    completed = sum(1 for r in ZERO_BRIDGE_ROUTES if r["status"] == "completed")
    avg_score = round(sum(r["btcpScore"] for r in ZERO_BRIDGE_ROUTES) / len(ZERO_BRIDGE_ROUTES) + random.gauss(0, 0.005), 4)
    total_gas_saved = round(sum(r["gasSaved"] for r in ZERO_BRIDGE_ROUTES) + random.gauss(0, 10), 1)
    total_value = round(sum(r["value"] for r in ZERO_BRIDGE_ROUTES) + random.gauss(0, 50000), 0)
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "totalRoutes": len(ZERO_BRIDGE_ROUTES),
        "activeRoutes": active,
        "completedRoutes": completed,
        "pendingRoutes": len(ZERO_BRIDGE_ROUTES) - active - completed,
        "avgBtcpScore": max(0, min(1, avg_score)),
        "totalGasSaved": max(0, total_gas_saved),
        "totalValueLocked": max(0, total_value),
        "uniqueChains": len(set(r["anchorChain"] for r in ZERO_BRIDGE_ROUTES) | set(r["execChain"] for r in ZERO_BRIDGE_ROUTES)),
        "routeTypes": list(set(r["routeType"] for r in ZERO_BRIDGE_ROUTES)),
        "throughput": f"{random.uniform(45, 120):.1f} tx/min",
    }

# --- BEO Live ---

@router.get("/beo/live")
async def beo_live():
    f = SignalFactory.get()
    now = datetime.now(timezone.utc).isoformat()
    entities = []
    for e in BEO_ENTITIES:
        key = e["name"].lower().replace(" ","_")
        coh = round(f.entity_coh.get(key, e["coherence"]), 4)
        vec_summary = [round(random.gauss(0, 1), 3) for _ in range(128)]
        vec_summary[0] = round(coh, 3)
        vec_summary[1] = round(e.get("mental", 0.8), 3)
        vec_summary[2] = round(e.get("spiritual", 0.7), 3)
        archetype_match = {a["name"]: round(max(0, min(1, random.gauss(0.5, 0.2))), 4) for a in ARCHETYPES[:6]}
        d_t = round(max(0.1, min(20.0, random.gauss(8.0, 3.0) + coh * 2)), 2)
        entities.append({
            **e,
            "currentCoherence": coh,
            "vector128Summary": vec_summary,
            "archetypeMatch": archetype_match,
            "behavioralDepth": d_t,
            "phi": round(max(0, min(1, random.gauss(0.75, 0.12))), 4),
            "sigma": round(max(0, min(1, random.gauss(0.70, 0.10))), 4),
            "lastUpdate": now,
        })
    return {"entities": entities, "timestamp": now}

# --- Behavioral Hash Explorer ---

@router.get("/bh/explorer")
async def bh_explorer():
    now = datetime.now(timezone.utc).isoformat()
    event_types = ["SWAP", "TRANSFER", "STAKE", "UNSTAKE", "LEND", "BORROW", "GOVERNANCE", "MEV_CAPTURE", "BRIDGE", "MINT"]
    entries = []
    for i in range(100):
        chain = random.choice(CHAINS)
        entity = random.choice(BEO_ENTITIES)
        payload = f"{i}:{chain['id']}:{entity['name']}:{now}"
        entries.append({
            "index": i,
            "sense": hashlib.sha256(payload.encode()).hexdigest()[:32],
            "antisense": hashlib.sha256((payload + ":anti").encode()).hexdigest()[:32],
            "chain": chain["id"],
            "chainName": chain["name"],
            "block": random.randint(180000000, 200000000),
            "entity": entity["name"],
            "eventType": random.choice(event_types),
            "coherence": round(max(0, min(1, random.gauss(0.85, 0.08))), 4),
            "timestamp": now,
        })
    return {"entries": entries, "total": 100, "timestamp": now}

@router.get("/bh/stream")
async def bh_stream():
    now = datetime.now(timezone.utc).isoformat()
    event_types = ["SWAP", "TRANSFER", "STAKE", "UNSTAKE", "LEND", "BORROW", "GOVERNANCE", "MEV_CAPTURE", "BRIDGE", "MINT"]
    entries = []
    for i in range(50):
        chain = random.choice(CHAINS)
        entity = random.choice(BEO_ENTITIES)
        payload = f"stream-{i}:{chain['id']}:{entity['name']}:{now}"
        entries.append({
            "index": i,
            "sense": hashlib.sha256(payload.encode()).hexdigest()[:32],
            "antisense": hashlib.sha256((payload + ":anti").encode()).hexdigest()[:32],
            "chain": chain["id"],
            "entity": entity["name"],
            "eventType": random.choice(event_types),
            "coherence": round(max(0, min(1, random.gauss(0.85, 0.08))), 4),
            "block": random.randint(190000000, 200000000),
            "live": True,
            "timestamp": now,
        })
    return {"entries": entries, "total": 50, "streaming": True, "timestamp": now}

# --- Akashic Index ---

@router.get("/akashic/index")
async def akashic_index():
    base = dict(AKASHIC_INDEX_DATA)
    base["totalBHEntities"] = base["totalBHEntities"] + random.randint(-100, 500)
    base["totalBHGenerated"] = base["totalBHGenerated"] + random.randint(100, 5000)
    base["depthScore"] = round(max(0, min(1, base["depthScore"] + random.gauss(0, 0.003))), 4)
    base["vectorsIndexed"] = base["vectorsIndexed"] + random.randint(50, 2000)
    base["queryLatency"] = round(max(1, base["queryLatency"] + random.gauss(0, 1.5)), 1)
    base["appendRate"] = round(max(100, base["appendRate"] + random.gauss(0, 100)), 1)
    base["newestRecord"] = datetime.now(timezone.utc).isoformat()
    base["timestamp"] = datetime.now(timezone.utc).isoformat()
    base["convergenceVelocity"] = round(random.uniform(0.001, 0.01), 6)
    base["indexHealth"] = round(random.uniform(95, 99.9), 1)
    return base

@router.get("/akashic/search")
async def akashic_search(q: str = Query(default="", description="Search query for BEO entities")):
    query = q.lower() if q else ""
    results = []
    all_entities = list(BEO_ENTITIES) + [
        {"name": "PancakeSwap", "archetype": "AMM_NAVIGATOR", "coherence": 0.88, "chain": "BNB Smart Chain"},
        {"name": "Jupiter", "archetype": "ARBITRAGE_SEEKER", "coherence": 0.86, "chain": "Solana"},
        {"name": "Osmosis", "archetype": "LIQUIDITY_PROVIDER", "coherence": 0.84, "chain": "Cosmos"},
        {"name": "Raydium", "archetype": "TREND_FOLLOWER", "coherence": 0.82, "chain": "Solana"},
        {"name": "TraderJoe", "archetype": "AMM_NAVIGATOR", "coherence": 0.81, "chain": "Avalanche"},
        {"name": "Aerodrome", "archetype": "LIQUIDITY_PROVIDER", "coherence": 0.90, "chain": "Base"},
        {"name": "Velodrome", "archetype": "LIQUIDITY_PROVIDER", "coherence": 0.87, "chain": "Optimism"},
        {"name": "TrionBotOracle", "archetype": "SAFE_HAVEN", "coherence": 0.96, "chain": "BOT Chain"},
    ]
    for e in all_entities:
        name_l = e["name"].lower()
        if not query or query in name_l:
            score = round(max(0, min(1, e.get("coherence", 0.8) + random.gauss(0, 0.02))), 4)
            results.append({
                "name": e["name"], "archetype": e.get("archetype", "UNKNOWN"),
                "chain": e.get("chain", "Unknown"),
                "relevanceScore": score,
                "bhCount": random.randint(100000, 5000000),
                "lastIndexed": datetime.now(timezone.utc).isoformat(),
                "depthD_t": round(max(0.1, random.gauss(8.0, 3.0)), 2),
            })
    return {"query": q, "results": results, "total": len(results)}

@router.get("/akashic/depth")
async def akashic_depth():
    now = datetime.now(timezone.utc).isoformat()
    entities = []
    all_names = [e["name"] for e in BEO_ENTITIES] + ["PancakeSwap", "Jupiter", "Osmosis", "Raydium", "TraderJoe", "Aerodrome"]
    for name in all_names:
        d_t = round(max(0.1, min(25.0, random.gauss(9.0, 4.0))), 2)
        convergence_rate = round(max(0, min(1, random.gauss(0.7, 0.15))), 4)
        entities.append({
            "entity": name,
            "depthD_t": d_t,
            "convergenceRate": convergence_rate,
            "causalLayers": random.randint(3, 18),
            "entropy": round(max(0, min(1, random.gauss(0.4, 0.15))), 4),
            "shannonInfo": round(random.uniform(2.0, 6.0), 3),
            "bhAccumulated": random.randint(500000, 20000000),
            "lastDepthUpdate": now,
        })
    return {"entities": entities, "timestamp": now}

# --- Living Security ---

@router.get("/living-security/gk")
async def living_security_gk():
    now = datetime.now(timezone.utc).isoformat()
    entries = []
    for gk in GENOMIC_KEYS:
        entry = dict(gk)
        entry["generation"] = gk["generation"] + random.randint(0, 3)
        entry["eventsAbsorbed"] = gk["eventsAbsorbed"] + random.randint(10, 500)
        entry["causalDepth"] = round(max(0.1, gk["causalDepth"] + random.gauss(0, 0.2)), 2)
        entry["securityBound"] = round(max(0.9, min(1.0, gk["securityBound"] + random.gauss(0, 0.001))), 4)
        entry["complementValid"] = random.random() > 0.02
        entry["lastEvolution"] = now
        entry["mutationRate"] = round(random.uniform(0.001, 0.05), 6)
        entries.append(entry)
    return {"genomicKeys": entries, "total": len(entries), "timestamp": now}

@router.get("/living-security/epigenetic")
async def living_security_epigenetic():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "timestamp": now,
        "status": "active",
        "layerDepth": random.randint(7, 15),
        "activeMethylationSites": random.randint(12000, 45000),
        "histoneModifications": random.randint(8000, 30000),
        "silencedGenes": random.randint(50, 500),
        "expressedGenes": random.randint(2000, 8000),
        "environmentalSensitivity": round(random.uniform(0.6, 0.95), 4),
        "adaptationRate": round(random.uniform(0.01, 0.15), 4),
        "lastTrigger": now,
        "epigeneticMemory": round(random.uniform(0.8, 0.99), 4),
        "stressSignals": random.randint(0, 8),
        "geneExpressionVector": [round(random.gauss(0, 1), 3) for _ in range(32)],
    }

@router.get("/living-security/immune")
async def living_security_immune():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "timestamp": now,
        "status": "active",
        "innate": {
            "name": "Innate Immune Layer",
            "active": True,
            "responseTime": f"{random.uniform(5, 50):.1f}ms",
            "threatsDetected": random.randint(100, 500),
            "patternRecognizers": random.randint(50, 200),
            "baselineThreshold": round(random.uniform(0.3, 0.5), 4),
            "falsePositiveRate": round(random.uniform(0.0001, 0.001), 6),
        },
        "adaptive": {
            "name": "Adaptive Immune Layer",
            "active": True,
            "antibodies": random.randint(500, 2000),
            "specificity": round(random.uniform(0.92, 0.99), 4),
            "memoryCells": random.randint(10000, 50000),
            "clonalExpansion": random.choice(["resting", "active", "expanding"]),
            "novelThreatsLearned": random.randint(5, 50),
        },
        "memory": {
            "name": "Immunological Memory",
            "active": True,
            "knownSignatures": random.randint(10000, 50000),
            "recallAccuracy": round(random.uniform(0.95, 0.999), 4),
            "longTermRetention": round(random.uniform(0.85, 0.99), 4),
            "crossChainImmunity": round(random.uniform(0.7, 0.95), 4),
            "lastInfectionClearance": now,
        },
        "overallImmuneScore": round(random.uniform(92, 99.5), 1),
        "activeThreats": random.randint(0, 3),
    }

# --- Annotators ---

@router.get("/annotators")
async def annotators():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for a in ANNOTATORS:
        ann = dict(a)
        ann["accuracy"] = round(max(0.7, min(1.0, a["accuracy"] + random.gauss(0, 0.005))), 4)
        ann["reviewsCompleted"] = a["reviewsCompleted"] + random.randint(0, 5)
        ann["lastActive"] = now
        ann["currentLoad"] = round(random.uniform(0.1, 0.9), 2)
        out.append(ann)
    return {"annotators": out, "total": len(out), "activeCount": sum(1 for a in out if a["status"] == "active")}

@router.get("/annotators/reviews")
async def annotators_reviews():
    now = datetime.now(timezone.utc).isoformat()
    reviews = []
    categories = ["MEV Detection", "Oracle Manipulation", "Flash Loan", "Wash Trading", "Rug Pull", "Front-Running", "Honeypot", "Phishing"]
    for i in range(20):
        reviews.append({
            "reviewId": f"REV-{int(time.time())}-{i}",
            "annotatorId": random.choice(ANNOTATORS)["annotatorId"],
            "category": random.choice(categories),
            "chain": random.choice(CHAINS)["name"],
            "entity": random.choice(BEO_ENTITIES)["name"],
            "verdict": random.choice(["confirmed", "rejected", "escalated", "pending"]),
            "confidence": round(random.uniform(0.7, 0.99), 4),
            "severity": random.choice(["low", "medium", "high", "critical"]),
            "timestamp": now,
            "processingTime": f"{random.uniform(0.5, 15.0):.1f}s",
        })
    return {"reviews": reviews, "total": len(reviews), "timestamp": now}

# --- Evolutionary Fitness ---

@router.get("/evolutionary/fitness")
async def evolutionary_fitness():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for comp in EVOLUTIONARY_FITNESS:
        c = dict(comp)
        c["pa"] = round(max(0.5, min(1, comp["pa"] + random.gauss(0, 0.008))), 4)
        c["ice"] = round(max(0.5, min(1, comp["ice"] + random.gauss(0, 0.008))), 4)
        c["as"] = round(max(0.5, min(1, comp["as"] + random.gauss(0, 0.008))), 4)
        c["love"] = round(max(0.5, min(1, comp["love"] + random.gauss(0, 0.008))), 4)
        c["fitness"] = round(c["pa"] * c["ice"] * c["as"] * c["love"], 4)
        c["im"] = round(max(0.5, min(1, comp["im"] + random.gauss(0, 0.005))), 4)
        c["lastUpdate"] = now
        out.append(c)
    return {"components": out, "timestamp": now}

@router.get("/evolutionary/love-protocol")
async def love_protocol():
    now = datetime.now(timezone.utc).isoformat()
    components = []
    for comp in EVOLUTIONARY_FITNESS:
        love_val = round(max(0.5, min(1, comp["love"] + random.gauss(0, 0.01))), 4)
        components.append({
            "component": comp["name"],
            "lifeServiceCoefficient": love_val,
            "altruismIndex": round(random.uniform(0.6, 0.98), 4),
            "symbiosisFactor": round(random.uniform(0.7, 0.99), 4),
            "regenerationRate": round(random.uniform(0.01, 0.2), 4),
            "collectiveHealthContribution": round(random.uniform(0.5, 0.95), 4),
        })
    avg_love = round(sum(c["lifeServiceCoefficient"] for c in components) / len(components), 4)
    return {
        "timestamp": now,
        "components": components,
        "protocolAvgLove": avg_love,
        "globalLifeServiceIndex": round(random.uniform(0.75, 0.95), 4),
        "networkAliveness": round(random.uniform(0.85, 0.99), 4),
        "totalRegenerationEvents": random.randint(10000, 50000),
        "symbioticPairs": random.randint(50, 200),
    }

# --- Validators ---

@router.get("/validators")
async def validators():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for v in VALIDATORS:
        val = dict(v)
        val["diversity"] = round(max(0.5, min(1, v["diversity"] + random.gauss(0, 0.005))), 4)
        val["effectiveWeight"] = round(max(0.01, min(0.15, v["effectiveWeight"] + random.gauss(0, 0.002))), 4)
        val["uptime"] = round(max(95, min(100, v["uptime"] + random.gauss(0, 0.05))), 2)
        val["lastVote"] = f"{random.randint(1, 30)}s ago"
        val["proposalsVoted"] = random.randint(50000, 500000)
        val["lastUpdate"] = now
        out.append(val)
    return {"validators": out, "total": len(out), "activeCount": sum(1 for v in out if v["status"] == "active")}

@router.get("/validators/consensus")
async def validators_consensus():
    now = datetime.now(timezone.utc).isoformat()
    active_vals = [v for v in VALIDATORS if v["status"] == "active"]
    weights = [v["effectiveWeight"] for v in active_vals]
    total_weight = sum(weights)
    hhi = round(sum((w / total_weight) ** 2 for w in weights), 6)
    arch_dist = {}
    for v in active_vals:
        arch = v["architecture"]
        arch_dist[arch] = arch_dist.get(arch, 0) + 1
    return {
        "timestamp": now,
        "consensusState": random.choice(["finalized", "voting", "precommit"]),
        "currentBlock": random.randint(190000000, 200000000),
        "hhi": hhi,
        "diversityScore": round(1 - hhi, 6),
        "activeValidators": len(active_vals),
        "totalStake": sum(v["stake"] for v in active_vals),
        "avgDiversity": round(sum(v["diversity"] for v in active_vals) / len(active_vals), 4),
        "architectureDistribution": arch_dist,
        "regionDistribution": {"us-east": random.randint(3, 8), "us-west": random.randint(2, 6), "eu-west": random.randint(4, 9), "eu-north": random.randint(2, 5), "ap-east": random.randint(2, 6), "ap-south": random.randint(2, 5), "other": random.randint(1, 4)},
        "jurisdictionSpread": len(set(v["jurisdiction"] for v in active_vals)),
        "lastFinalization": f"{random.randint(1, 10)}s ago",
        "consensusRound": random.randint(10000, 99999),
    }

# --- Continuum DEX ---

@router.get("/continuum/dex")
async def continuum_dex():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for entry in CONTINUUM_DEX:
        e = dict(entry)
        e["bidScore"] = round(max(0.5, min(1, entry["bidScore"] + random.gauss(0, 0.01))), 4)
        e["complementScore"] = round(max(0.5, min(1, entry["complementScore"] + random.gauss(0, 0.01))), 4)
        e["pmoPrice"] = round(entry["pmoPrice"] * (1 + random.gauss(0, 0.002)), 4)
        e["ccpPremium"] = round(max(0.9, min(1.1, entry["ccpPremium"] + random.gauss(0, 0.005))), 4)
        e["gasSaved"] = round(max(0, entry["gasSaved"] + random.gauss(0, 2)), 1)
        e["volume24h"] = round(random.uniform(100000, 50000000), 0)
        e["lastUpdate"] = now
        out.append(e)
    return {"pairs": out, "total": len(out), "timestamp": now}

@router.get("/continuum/bid-engine")
async def continuum_bid_engine():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "timestamp": now,
        "status": "active",
        "activeBids": random.randint(50, 300),
        "matchedBids24h": random.randint(500, 5000),
        "totalBidVolume24h": round(random.uniform(10000000, 500000000), 0),
        "avgBidScore": round(random.uniform(0.75, 0.95), 4),
        "behavioralPremium": round(random.uniform(1.0, 1.15), 4),
        "matchRate": round(random.uniform(0.6, 0.9), 4),
        "avgSettlementTime": f"{random.uniform(0.5, 5.0):.2f}s",
        "pendingOrders": random.randint(10, 100),
        "engineLoad": round(random.uniform(0.3, 0.8), 2),
    }

@router.get("/continuum/cme-engine")
async def continuum_cme_engine():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "timestamp": now,
        "status": "active",
        "complementPairs": random.randint(20, 150),
        "matched24h": random.randint(200, 3000),
        "avgComplementScore": round(random.uniform(0.7, 0.95), 4),
        "behavioralSynergy": round(random.uniform(0.6, 0.95), 4),
        "crossChainMatches": random.randint(50, 500),
        "avgComplementarity": round(random.uniform(0.65, 0.92), 4),
        "symbiosisRate": round(random.uniform(0.4, 0.85), 4),
        "engineUptime": f"{random.uniform(99.5, 99.99):.2f}%",
        "processingLatency": f"{random.uniform(5, 50):.1f}ms",
    }

@router.get("/continuum/bdc-credit")
async def continuum_bdc_credit():
    now = datetime.now(timezone.utc).isoformat()
    credits = []
    for i in range(10):
        credits.append({
            "creditId": f"BDC-{1000 + i}",
            "entity": random.choice(BEO_ENTITIES)["name"],
            "behavioralDepth": round(max(0.1, random.gauss(8.0, 3.0)), 2),
            "creditScore": round(max(300, min(850, random.gauss(680, 80))), 0),
            "creditLimit": round(random.uniform(10000, 500000), 0),
            "utilization": round(random.uniform(0.1, 0.9), 4),
            "historyLength": random.randint(30, 730),
            "defaultRisk": round(max(0, min(1, random.gauss(0.05, 0.03))), 4),
            "coherenceFactor": round(random.uniform(0.7, 0.99), 4),
            "lastAssessment": now,
        })
    return {
        "timestamp": now,
        "credits": credits,
        "totalCreditIssued": round(random.uniform(10000000, 50000000), 0),
        "avgCreditScore": round(sum(c["creditScore"] for c in credits) / len(credits), 0),
        "defaultRate": round(random.uniform(0.001, 0.02), 4),
    }

# --- Marketplace ---

@router.get("/marketplace/listings")
async def marketplace_listings():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for listing in BEHAVIORAL_MARKETPLACE:
        l = dict(listing)
        l["buyers"] = listing["buyers"] + random.randint(0, 3)
        l["rating"] = round(max(3.5, min(5.0, listing["rating"] + random.gauss(0, 0.02))), 2)
        l["freshness"] = f"{random.uniform(0.1, 20.0):.1f}s"
        l["dataPoints"] = listing["dataPoints"] + random.randint(100, 5000)
        l["revenue24h"] = round(listing["price"] * listing["buyers"] * random.uniform(0.01, 0.05), 2)
        l["lastSale"] = now
        out.append(l)
    return {"listings": out, "total": len(out), "timestamp": now}

@router.get("/marketplace/stats")
async def marketplace_stats():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "timestamp": now,
        "totalListings": len(BEHAVIORAL_MARKETPLACE),
        "totalBuyers": sum(l["buyers"] for l in BEHAVIORAL_MARKETPLACE) + random.randint(0, 20),
        "avgRating": round(sum(l["rating"] for l in BEHAVIORAL_MARKETPLACE) / len(BEHAVIORAL_MARKETPLACE), 2),
        "totalDataPoints": sum(l["dataPoints"] for l in BEHAVIORAL_MARKETPLACE) + random.randint(10000, 50000),
        "totalRevenue24h": round(random.uniform(50000, 500000), 2),
        "activeListings": sum(1 for l in BEHAVIORAL_MARKETPLACE if l["price"] > 0),
        "topCategory": "behavioral_feed",
        "categoryBreakdown": {
            "behavioral_feed": sum(1 for l in BEHAVIORAL_MARKETPLACE if l["dataType"] == "behavioral_feed"),
            "akashic_snapshot": sum(1 for l in BEHAVIORAL_MARKETPLACE if l["dataType"] == "akashic_snapshot"),
            "anima_intelligence": sum(1 for l in BEHAVIORAL_MARKETPLACE if l["dataType"] == "anima_intelligence"),
            "btc_proof": sum(1 for l in BEHAVIORAL_MARKETPLACE if l["dataType"] == "btc_proof"),
        },
        "avgFreshness": f"{random.uniform(1.0, 10.0):.1f}s",
    }

# --- SBA ---

@router.get("/sba/assessments")
async def sba_assessments():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for s in SBA_DATA:
        entry = dict(s)
        entry["institutionalQuality"] = round(max(0.3, min(1, s["institutionalQuality"] + random.gauss(0, 0.005))), 4)
        entry["informationIntegrity"] = round(max(0.3, min(1, s["informationIntegrity"] + random.gauss(0, 0.005))), 4)
        entry["socialStability"] = round(max(0.3, min(1, s["socialStability"] + random.gauss(0, 0.005))), 4)
        entry["governanceBehavior"] = round(max(0.3, min(1, s["governanceBehavior"] + random.gauss(0, 0.005))), 4)
        entry["capitalFreedom"] = round(max(0.3, min(1, s["capitalFreedom"] + random.gauss(0, 0.005))), 4)
        entry["sbaScore"] = round((entry["institutionalQuality"] + entry["informationIntegrity"] + entry["socialStability"] + entry["governanceBehavior"] + entry["capitalFreedom"]) / 5, 4)
        entry["lastAssessed"] = now
        out.append(entry)
    return {"assessments": out, "total": len(out), "timestamp": now}

# --- BIBL ---

@router.get("/bibl/analysis")
async def bibl_analysis():
    now = datetime.now(timezone.utc).isoformat()
    out = []
    for b in BIBL_DATA:
        entry = dict(b)
        entry["nlScore"] = round(max(0.5, min(1, b["nlScore"] + random.gauss(0, 0.008))), 4)
        entry["gasForecast"] = round(max(0.0001, b["gasForecast"] + random.gauss(0, b["gasForecast"]*0.05)), 4)
        entry["ccCoherence"] = round(max(0.5, min(1, b["ccCoherence"] + random.gauss(0, 0.006))), 4)
        entry["mfScore"] = round(max(0, min(1, b["mfScore"] + random.gauss(0, 0.003))), 4)
        entry["blockCapacity"] = round(max(0.1, min(1, b["blockCapacity"] + random.gauss(0, 0.02))), 4)
        entry["finalityDist"] = round(max(0.01, b["finalityDist"] + random.gauss(0, 0.5)), 2)
        entry["timestamp"] = now
        out.append(entry)
    return {"analysis": out, "total": len(out), "timestamp": now}

# --- TimescaleDB ---

@router.get("/timescale/metrics")
async def timescale_metrics():
    base = dict(TIMESCALE_DB)
    base["totalEvents"] = base["totalEvents"] + random.randint(100, 10000)
    base["eventsPerSecond"] = round(max(100, base["eventsPerSecond"] + random.gauss(0, 50)), 1)
    base["queryAvgLatency"] = round(max(0.5, base["queryAvgLatency"] + random.gauss(0, 0.5)), 1)
    base["newestData"] = datetime.now(timezone.utc).isoformat()
    base["timestamp"] = datetime.now(timezone.utc).isoformat()
    base["connectionPool"] = {
        "active": max(5, base["connectionPool"]["active"] + random.randint(-2, 2)),
        "idle": max(1, base["connectionPool"]["idle"] + random.randint(-1, 1)),
        "max": base["connectionPool"]["max"],
    }
    base["compressionSavings"] = f"{random.uniform(80, 95):.1f}%"
    base["diskReadThroughput"] = f"{random.uniform(50, 500):.1f} MB/s"
    base["diskWriteThroughput"] = f"{random.uniform(20, 200):.1f} MB/s"
    return base

@router.get("/timescale/events")
async def timescale_events():
    now = datetime.now(timezone.utc).isoformat()
    event_types = ["SIGNAL_GENERATED", "BH_COMMITTED", "BEO_UPDATED", "CRISPR_TRIGGERED", "ROUTE_EXECUTED", "VALIDATOR_VOTE", "ANNOTATION_SUBMITTED", "GENOMIC_EVOLUTION", "ANIMA_VECTOR", "FAISS_INDEXED"]
    events = []
    for i in range(50):
        events.append({
            "eventId": f"EVT-{int(time.time())}-{i}",
            "eventType": random.choice(event_types),
            "chain": random.choice(CHAINS)["id"],
            "entity": random.choice(BEO_ENTITIES)["name"],
            "coherence": round(random.uniform(0.5, 1.0), 4),
            "magnitude": round(random.uniform(0.1, 1.0), 4),
            "processed": True,
            "latency": f"{random.uniform(0.5, 15.0):.2f}ms",
            "timestamp": now,
        })
    return {"events": events, "total": 50, "timestamp": now}

# --- AI Agents ---

@router.get("/ai-agents")
async def ai_agents():
    now = datetime.now(timezone.utc).isoformat()
    agents_data = [
        {"agentId": "AGT-001", "entity": "Uniswap V3", "archetype": "AMM_NAVIGATOR", "capabilities": ["price_oracle", "mev_detection", "liquidity_analysis"], "coherence": 0.94, "depth": 12.4, "status": "active", "chains": ["Ethereum", "Arbitrum", "Base", "Polygon"], "lastActivity": now},
        {"agentId": "AGT-002", "entity": "Aave V3", "archetype": "LIQUIDITY_GUARDIAN", "capabilities": ["risk_scoring", "rate_monitoring", "liquidation_prediction"], "coherence": 0.91, "depth": 11.8, "status": "active", "chains": ["Ethereum", "Arbitrum", "Optimism"], "lastActivity": now},
        {"agentId": "AGT-003", "entity": "Lido", "archetype": "STAKING_ANCHOR", "capabilities": ["staking_monitoring", "validator_tracking", "withdrawal_analysis"], "coherence": 0.93, "depth": 13.1, "status": "active", "chains": ["Ethereum"], "lastActivity": now},
        {"agentId": "AGT-004", "entity": "Jupiter", "archetype": "ARBITRAGE_SEEKER", "capabilities": ["swap_routing", "price_impact", "arbitrage_detection"], "coherence": 0.86, "depth": 10.2, "status": "active", "chains": ["Solana"], "lastActivity": now},
        {"agentId": "AGT-005", "entity": "TrionBotOracle", "archetype": "SAFE_HAVEN", "capabilities": ["behavioral_sensing", "genomic_keys", "bot_coherence"], "coherence": 0.96, "depth": 14.7, "status": "active", "chains": ["BOT Chain"], "lastActivity": now},
        {"agentId": "AGT-006", "entity": "Curve Finance", "archetype": "STABILITY_KEEPER", "capabilities": ["pool_monitoring", "imbalance_detection", "gauge_analysis"], "coherence": 0.89, "depth": 12.0, "status": "active", "chains": ["Ethereum", "Arbitrum", "Polygon"], "lastActivity": now},
        {"agentId": "AGT-007", "entity": "Compound V3", "archetype": "RATE_ARBITRAGEUR", "capabilities": ["interest_rate_tracking", "borrow_analysis", "market_risk"], "coherence": 0.87, "depth": 10.9, "status": "monitoring", "chains": ["Ethereum", "Base"], "lastActivity": now},
        {"agentId": "AGT-008", "entity": "Osmosis", "archetype": "LIQUIDITY_PROVIDER", "capabilities": ["ibc_routing", "pool_creation", "token_swaps"], "coherence": 0.84, "depth": 9.1, "status": "active", "chains": ["Cosmos"], "lastActivity": now},
        {"agentId": "AGT-009", "entity": "SigmoidVault", "archetype": "YIELD_FARMER", "capabilities": ["yield_optimization", "vault_monitoring", "reward_tracking"], "coherence": 0.83, "depth": 9.8, "status": "active", "chains": ["StarkNet"], "lastActivity": now},
        {"agentId": "AGT-010", "entity": "PancakeSwap", "archetype": "AMM_NAVIGATOR", "capabilities": ["lp_analysis", "farm_monitoring", "cake_tracking"], "coherence": 0.88, "depth": 11.4, "status": "active", "chains": ["BNB Smart Chain"], "lastActivity": now},
        {"agentId": "AGT-011", "entity": "SuiOracle", "archetype": "TREND_FOLLOWER", "capabilities": ["object_tracking", "liquidity_monitoring", "move_analysis"], "coherence": 0.82, "depth": 7.8, "status": "active", "chains": ["Sui"], "lastActivity": now},
        {"agentId": "AGT-012", "entity": "Aerodrome", "archetype": "LIQUIDITY_PROVIDER", "capabilities": ["veToken_tracking", "bribe_analysis", "pool_health"], "coherence": 0.90, "depth": 11.2, "status": "active", "chains": ["Base"], "lastActivity": now},
    ]
    out = []
    for a in agents_data:
        agent = dict(a)
        agent["coherence"] = round(max(0.5, min(1, a["coherence"] + random.gauss(0, 0.01))), 4)
        agent["depth"] = round(max(1, a["depth"] + random.gauss(0, 0.3)), 2)
        agent["signalsProcessed"] = random.randint(100000, 5000000)
        agent["lastUpdate"] = now
        out.append(agent)
    return {"agents": out, "total": len(out), "timestamp": now}

# --- Settings ---

@router.get("/settings")
async def settings():
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "consensus": {
            "algorithm": "TRION-BFT",
            "blockTime": "2.0s",
            "finality": "2 blocks",
            "validatorSetSize": 27,
            "minStake": 100000,
            "diversityThreshold": 0.70,
            "hhiMax": 0.15,
        },
        "thresholds": {
            "coherenceMin": 0.60,
            "coherenceWarning": 0.75,
            "interceptThreshold": 0.50,
            "mfScoreMax": 0.10,
            "nlScoreMin": 0.70,
            "btcpScoreMin": 0.70,
        },
        "featureFlags": {
            "zeroBridgeEnabled": True,
            "livingSecurityEnabled": True,
            "akashicIndexEnabled": True,
            "continuumDexEnabled": True,
            "loveProtocolEnabled": True,
            "genomicKeysEnabled": True,
            "sbaAssessmentEnabled": True,
            "biblAnalysisEnabled": True,
            "annotatorNetworkEnabled": True,
            "evolutionaryFitnessEnabled": True,
        },
        "network": {
            "chainsIndexed": len(CHAINS),
            "vmFamilies": len(VM_FAMILIES),
            "activeRelayers": sum(1 for r in RELAYERS if r["status"] == "active"),
            "faissDimension": 128,
            "signalFrequency": "2.0s",
            "maxSignalHistory": 200,
        },
        "security": {
            "crisprEngineVersion": "v2.1",
            "maxThreatSeverity": "critical",
            "autoIntercept": True,
            "falsifiabilityEnabled": True,
            "selfVerificationInterval": "30s",
        },
    }
