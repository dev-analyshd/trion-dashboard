import json, asyncio, logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .signal_factory import SignalFactory

logger = logging.getLogger(__name__)
router = APIRouter()
connections = []

@router.websocket("/ws/signals")
async def ws_signals(ws: WebSocket):
    await ws.accept()
    connections.append(ws)
    f = SignalFactory.get()
    await ws.send_text(json.dumps({"type":"connected","data":{"message":"TRION Signal Feed Connected","signalsAvailable":len(f.latest())}}))
    for s in f.latest(5):
        try: await ws.send_text(json.dumps({"type":"signal","data":s}))
        except: break
    try:
        while True:
            data = await ws.receive_text()
            if data == "ping":
                s = f.generate_one()
                await ws.send_text(json.dumps({"type":"signal","data":s}))
                await ws.send_text(json.dumps({"type":"status","data":{"connected":True,"signalStats":f.stats()}}))
            elif data == "get_signals":
                for sig in f.latest(10):
                    await ws.send_text(json.dumps({"type":"signal","data":sig}))
    except WebSocketDisconnect:
        if ws in connections: connections.remove(ws)
    except Exception as e:
        logger.warning(f"WS error: {e}")
        if ws in connections: connections.remove(ws)