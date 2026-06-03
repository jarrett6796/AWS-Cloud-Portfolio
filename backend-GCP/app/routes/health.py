from fastapi import APIRouter


router = APIRouter()


@router.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "gcp-rag-backend",
        "phase": "rag-with-cors-mvp",
    }
