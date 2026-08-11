from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
)

fastmail = FastMail(conf)


async def send_activation_email(email: str, token: str) -> None:
    """
    Sends activation email
    """

    activation_link = f"{settings.FRONTEND_URL}/activate-account/{token}"

    message = MessageSchema(
        subject="Activate your account - League of Tamati",
        recipients=[email],
        body=f"Click here to activate your account: {activation_link}",
        subtype=MessageType.plain,
    )

    await fastmail.send_message(message)


async def send_reset_password_email(email: str, token: str) -> None:
    """
    Sends reset password email
    """

    reset_password_link = f"{settings.FRONTEND_URL}/reset-password/{token}"

    message = MessageSchema(
        subject="Reset your password - League of Tamati",
        recipients=[email],
        body=f"Click here to reset your password: {reset_password_link}",
        subtype=MessageType.plain,
    )

    await fastmail.send_message(message)
