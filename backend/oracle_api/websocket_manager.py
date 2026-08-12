import json, asyncio, logging, threading
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .signal_factory import SignalFactory

logger = logging.getLogger(__name__)
router = APIRouter()
connections = []
_lock = threading.Lock()

def broadcast_signal(signal: dict):
    """Thread-safe broadcast of a signal to all connected WebSocket clients.
    
    This is called from the background thread and schedules the actual
    send on the main asyncio event loop to avoid thread-safety issues.
    """
    if not connections:
        return
    data = json.dumps({"type": "signal", "data": signal})
    with _lock:
        dead = []
        for ws in connections:
            try:
                # Schedule send on the event loop
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(_safe_send(ws, data))
                else:
                    dead.append(ws)
            except Exception:
                dead.append(ws)
        for ws in dead:
            if ws in connections:
                connections.remove(ws)

async def _safe_send(ws, data):
    """Safely send data to a WebSocket client."""
    try:
        await ws.send_text(data)
    except Exception:
        if ws in connections:
            connections.remove(ws)

@router.websocket("/ws/signals")
async def ws_signals(ws: WebSocket):
    await ws.accept()
    with _lock:
        connections.append(ws)
    f = SignalFactory.get()
    await ws.send_text(json.dumps({
        "type": "connected",
        "data": {"message": "TRION Signal Feed Connected", "signalsAvailable": len(f.latest())}
    }))
    for s in f.latest(5):
        try:
            await ws.send_text(json.dumps({"type": "signal", "data": s}))
        except:
            break
    try:
        while True:
            data = await ws.receive_text()
            if data == "ping":
                s = f.generate_one()
                await ws.send_text(json.dumps({"type": "signal", "data": s}))
                await ws.send_text(json.dumps({"type": "status", "data": {"connected": True, "signalStats": f.stats()}}))
            elif data == "get_signals":
                for sig in f.latest(10):
                    await ws.send_text(json.dumps({"type": "signal", "data": sig}))
    except WebSocketDisconnect:
        with _lock:
            if ws in connections:
                connections.remove(ws)
    except Exception as e:
        logger.warning(f"WS error: {e}")
        with _lock:
            if ws in connections:
                connections.remove(ws)
