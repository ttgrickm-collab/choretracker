from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_database
from app.routes import auth, tasks, photos, task_instances, users, rewards
from app.scheduler import start_scheduler, shutdown_scheduler
from app.version import __version__, __status__


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events - runs on startup and shutdown"""
    print("🚀 Starting Launch Pad API...")
    init_database()
    start_scheduler()
    print(f"✓ Server ready! Version {__version__} ({__status__})")
    yield
    print("👋 Shutting down...")
    shutdown_scheduler()


app = FastAPI(
    title=settings.APP_NAME,
    version=__version__,
    debug=settings.DEBUG,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(photos.router)
app.include_router(task_instances.router)
app.include_router(users.router)
app.include_router(rewards.router)


@app.get("/")
async def root():
    return {
        "message": "Launch Pad API",
        "version": __version__,
        "status": __status__,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
