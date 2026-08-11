import logging
from pathlib import Path

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)


def get_logger(name: str) -> logging.Logger:
    """
    Returns a logger with the given name.

    File contains all logs, console contains only errors.

    File name will be parameter name with .log extension.
    """

    if not name:
        raise ValueError("Logger name cannot be empty")

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:

        # log to file
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s | %(message)s"
        )
        file_path = LOG_DIR / f"{name}.log"
        file_handler = logging.FileHandler(
            file_path, mode="w", encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        # log to console (errors only)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.ERROR)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    return logger
