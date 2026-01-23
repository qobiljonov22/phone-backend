"""
Phone Shop API - Asosiy fayl
Bu yerda FastAPI ilovasi yaratiladi va barcha route'lar ulashadi
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from auth_routes import router as auth_router
from database import initialize_sample_data
import uvicorn

# FastAPI ilovasini yaratish
app = FastAPI(
    title="Phone Shop API",
    description="Telefon do'koni uchun REST API",
    version="1.0.0",
    docs_url="/docs",  # Swagger dokumentatsiya: http://127.0.0.1:8000/docs
    redoc_url="/redoc"  # ReDoc dokumentatsiya: http://127.0.0.1:8000/redoc
)

# CORS (Cross-Origin Resource Sharing) sozlamalari
# Bu frontend dan API ga so'rov yuborishga ruxsat beradi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production da aniq domain'lar ko'rsatish kerak
    allow_credentials=True,
    allow_methods=["*"],  # Barcha HTTP metodlar (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Barcha header'lar
)

# Barcha route'larni asosiy ilovaga ulash
app.include_router(router)
app.include_router(auth_router)  # Authentication route'lar


# ============ ROOT ENDPOINT ============
@app.get("/")
def root():
    """
    Asosiy endpoint - API ishlayotganini tekshirish uchun
    """
    return {
        "message": "Phone Shop API ishlayapti! 🚀",
        "docs": "/docs",
        "version": "1.0.0"
    }


# ============ ERROR HANDLERS ============
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """
    404 xato (topilmadi) uchun maxsus handler
    """
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Topilmadi",
            "detail": f"URL topilmadi: {request.url.path}",
            "message": "Kechirasiz, so'ralgan sahifa topilmadi"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """
    500 xato (server xatosi) uchun handler
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Server xatosi",
            "detail": "Ichki server xatosi yuz berdi",
            "message": "Kechirasiz, texnik muammo yuz berdi. Iltimos, keyinroq urinib ko'ring"
        }
    )


# ============ STARTUP EVENT ============
@app.on_event("startup")
async def startup_event():
    """
    Ilova ishga tushganda bajariladigan funksiya
    Namuna ma'lumotlar bilan to'ldirish
    """
    print("🚀 Phone Shop API ishga tushmoqda...")
    initialize_sample_data()
    print("✅ Namuna ma'lumotlar yuklandi")
    print("📚 API dokumentatsiya: http://127.0.0.1:8000/docs")


# ============ SHUTDOWN EVENT ============
@app.on_event("shutdown")
async def shutdown_event():
    """
    Ilova to'xtatilganda bajariladigan funksiya
    """
    print("👋 Phone Shop API to'xtatildi")


# ============ SERVERNI ISHGA TUSHIRISH ============
if __name__ == "__main__":
    """
    Bu kodni to'g'ridan-to'g'ri ishga tushirish uchun
    Terminalda: python main.py
    """
    uvicorn.run(
        "main:app",  # main.py faylidagi app obyekti
        host="0.0.0.0",  # Barcha IP manzillardan kirish mumkin
        port=8000,  # Port raqami
        reload=True  # Kod o'zgarganda avtomatik qayta yuklash
    )
