from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from pydantic import EmailStr


class Settings(BaseSettings):

    # app name & debug
    APP_NAME: str
    DEBUG: bool

    # database
    DATABASE_URL: str

    # email credentials
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr

    # email config
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    # security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE: int
    REFRESH_TOKEN_EXPIRE: int
    CSRF_SECRET_KEY: str
    ACTIVATION_SECRET_KEY: str
    RESET_PASSWORD_SECRET_KEY: str

    REFRESH_TOKEN_COOKIE_NAME: str = "__Host-refresh_token"

    # frontend url
    FRONTEND_URL: str

    # cors
    ALLOWED_HOSTS: list[str] = [
        "http://localhost:5173",
        "https://league-of-tamati-beta.vercel.app"
    ]

    # models
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
