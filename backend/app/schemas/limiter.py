from pydantic import BaseModel
from app.schemas.common import UTCDateTime


class RateLimitError(BaseModel):
    error: str
    unlock_at: UTCDateTime
