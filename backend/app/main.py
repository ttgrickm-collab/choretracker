from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_database
from app.routes import auth, tasks, photos, task_instances
from app.scheduler import start_scheduler, shutdown_scheduler
from app.version import __version__, __status__


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events - runs on startup and shutdown"""
    # Startup
    print("🚀 Starting Chore Tracker API...")
    init_database()
    start_scheduler()  # Start APScheduler
    print(f"✓ Server ready! Version {__version__} ({__status__})")
    yield
    # Shutdown
    print("👋 Shutting down...")
    shutdown_scheduler()  # Stop APScheduler gracefully


app = FastAPI(
    title=settings.APP_NAME,
    version=__version__,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(photos.router)
app.include_router(task_instances.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Chore Tracker API",
        "version": __version__,
        "status": __status__,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
