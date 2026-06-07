from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, documents, analyze, export

app = FastAPI(title="BilgiHaritası API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(export.router, prefix="/export", tags=["export"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "BilgiHaritası Backend"}
