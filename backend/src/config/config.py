from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_config() -> Config:
    """
    Returns a cached instance of `Config`.

    The instance is created on the first call and cached for any subsequent calls.

    Returns:
        Config: The cached config instance.
    """
    return Config()
