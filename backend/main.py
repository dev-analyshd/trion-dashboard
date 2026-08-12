import uvicorn, logging, asyncio, json, signal as sig_mod, sys, os
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from oracle_api.protocol_routes import router as pr
from oracle_api.websocket_manager import router as ws_router, broadcast_signal, connections
from oracle_api.signal_factory import SignalFactory

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("trion")

# Global state
_background_thread = None
_running = False

def _background_signal_loop():
    """Background thread: generates and broadcasts signals every 2 seconds.
    
    This runs in a separate daemon thread so it cannot crash the main
    uvicorn event loop. Any exception is caught and logged.
    """
    global _running
    logger.info("[TRION] Background signal loop started — publishing every 2s")
    while _running:
        try:
            f = SignalFactory.get()
            # Alternate between EVM and BOT Chain signals
            if f.counter % 3 == 0:
                signal = f.generate_from_crate("bot_chain")
            else:
                signal = f.generate_from_crate("evm")
            broadcast_signal(signal)
        except Exception as e:
            logger.error(f"[TRION] Signal loop error: {e}", exc_info=True)
        # Sleep in small increments to check _running flag
        for _ in range(20):
            if not _running:
                break
            import time
            time.sleep(0.1)
    logger.info("[TRION] Background signal loop stopped")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan: start/stop background tasks."""
    global _background_thread, _running
    # Startup
    f = SignalFactory.get()
    f.init_crates()
    logger.info(f"[TRION] Signal Factory ready — {f.counter} pre-generated signals, crates initialized")
    # Store event loop reference for WebSocket broadcast
    try:
        import oracle_api.websocket_manager as _wsm
        _wsm._main_loop = asyncio.get_running_loop()
    except Exception:
        pass
    _running = True
    _background_thread = threading.Thread(target=_background_signal_loop, daemon=True)
    _background_thread.start()
    yield
    # Shutdown
    _running = False
    if _background_thread:
        _background_thread.join(timeout=3)
    logger.info("[TRION] Shutdown complete")

app = FastAPI(title="TRION Sensing Oracle", version="3.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(pr)
app.include_router(ws_router)

@app.get("/")
async def root():
    f = SignalFactory.get()
    return {
        "name": "TRION Sensing Oracle", "version": "3.1.0",
        "status": "running", "signalsGenerated": f.counter,
        "crates": list(f.get_crate_statuses().keys()),
        "ws": "/ws/signals",
    }

@app.get("/health")
async def health():
    f = SignalFactory.get()
    return {"status": "healthy", "signalsGenerated": f.counter, "crates": f.get_crate_statuses()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv('PORT', '5001')), log_level="info")
