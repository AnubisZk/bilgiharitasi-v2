from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, documents, analyze, export

app = FastAPI(title="BilgiHaritası API", version="1.0.0")

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        from fastapi.responses import Response
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(export.router, prefix="/export", tags=["export"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "BilgiHaritası Backend"}
