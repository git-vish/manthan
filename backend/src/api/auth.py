from fastapi import HTTPException, Security, status
from fastapi.security.api_key import APIKeyHeader

from src.config import settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_api_key(api_key: str = Security(_api_key_header)) -> str:
    """Verifies the API key provided in the X-API-Key header.

    Args:
        api_key (str): The API key to verify.

    Returns:
        str: The verified API key if valid.

    Raises:
        HTTPException: With status code 403 if the API key is invalid.
    """
    if api_key == settings.APP_API_KEY:
        return api_key
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
