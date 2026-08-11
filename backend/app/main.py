from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import custom_rate_limit_handler, limiter

from app.db.database import engine, Base

from app.routes.auth import router as auth_router
from app.routes.friendship import router as friendship_router
from app.routes.game import router as game_router
from app.routes.leaderboard import router as leaderboard_router
from app.routes.search import router as search_router
from app.routes.user import router as user_router
from app.routes.wiki import router as wiki_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Initialize tables on supabase if doesn't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

    # Close the connection
    await engine.dispose()


security = HTTPBearer()

app = FastAPI(
    swagger_ui_parameters={"persistAuthorization": True},
    lifespan=lifespan  # for supabase register life cycle
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-CSRF-Token"],
)

# throttle limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

# Routers
app.include_router(wiki_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(friendship_router)
app.include_router(search_router)
app.include_router(game_router)
app.include_router(leaderboard_router)
