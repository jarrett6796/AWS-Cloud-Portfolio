from fastapi import APIRouter

from app.config.settings import settings


router = APIRouter()


@router.get("/")
def health_check():
    return {
        "status": "ok",
        "service": settings.service_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "phase": "advanced-rag-monitoring-hardening",
        "config": settings.public_summary(),
        "warnings": settings.startup_warnings(),
    }


@router.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "service": settings.service_name,
        "version": settings.app_version,
    }
