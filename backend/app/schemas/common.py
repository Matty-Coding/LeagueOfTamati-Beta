from datetime import datetime, timezone
from typing import Annotated
from pydantic import AfterValidator


def _ensure_utc(value: datetime) -> datetime:
    """ 
    Ensure datetime is UTC
    """

    if value.tzinfo is None:
        # naive (assume UTC)
        return value.replace(tzinfo=timezone.utc)

    # aware (setup timezone to UTC)
    return value.astimezone(timezone.utc)


# type to ensure datetime is UTC
UTCDateTime = Annotated[
    datetime,
    AfterValidator(_ensure_utc)
]
