from .riot_api import ExtractApiContent
from .validate_data import validate_urls
from shared.logger import get_logger

logger = get_logger("extract_and_validate")

# ============  Extract data  ==============
logger.info("Extracting data...")

extract = ExtractApiContent()
data = extract.to_json()

logger.info("Data extracted")

# ============  Validate data  ==============
logger.info("Validating data...")

error_list = validate_urls(data)

if error_list:
    logger.error("Some images are not valid")
    logger.error(error_list)

else:
    logger.info("All images are valid")
