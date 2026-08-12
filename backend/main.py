import uvicorn, logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from oracle_api.protocol_routes import router as pr
from oracle_api.websocket_manager import router as ws_router
from oracle_api.signal_factory import SignalFactory

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="TRION Sensing Oracle", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(pr)
app.include_router(ws_router)

@app.on_event("startup")
async def startup():
    SignalFactory.get()
    logging.info("[TRION] Signal Factory ready - on-demand mode")

@app.get("/")
async def root(): return {"name":"TRION Sensing Oracle","version":"3.0.0","status":"running","ws":"/ws/signals"}

@app.get("/health")
async def health(): return {"status":"healthy","signalsGenerated":SignalFactory.get().counter}

if __name__ == "__main__": uvicorn.run("main:app", host="0.0.0.0", port=5000, log_level="warning")
