from app.routes.wiki import router as wiki_router
from app.routes.auth import router as auth_router
from app.routes.user import router as user_router
from app.routes.friendship import router as friendship_router
from app.routes.search import router as search_router
from app.routes.game import router as game_router
from app.routes.leaderboard import router as leaderboard_router
from fastapi import FastAPI
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter, custom_rate_limit_handler
from fastapi.security import HTTPBearer

security = HTTPBearer()

app = FastAPI(swagger_ui_parameters={"persistAuthorization": True})

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
