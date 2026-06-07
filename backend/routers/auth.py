from fastapi import APIRouter, HTTPException, Header
from supabase import create_client
import os

router = APIRouter()

def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_KEY"]
    )

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Geçersiz token")
    token = authorization.split(" ")[1]
    try:
        sb = get_supabase()
        user = sb.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Token doğrulanamadı")

@router.get("/me")
async def me(user=None):
    # Client-side Supabase auth kullanılıyor
    # Bu endpoint sadece backend sağlık kontrolü için
    return {"status": "auth via supabase client"}
