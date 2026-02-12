import logging
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Tuple

# Add project root to path (Docker + Local both)
possible_roots = [
    Path("/opt/airflow"),  # Docker path
    Path(__file__).parent.parent.parent.parent.absolute(),  # Local path
    Path(__file__).parent.parent.parent.absolute(),  # Alternative local
]

for root in possible_roots:
    src_path = root / "src"
    if src_path.exists() and str(root) not in sys.path:
        sys.path.insert(0, str(root))
        logging.getLogger(__name__).info(f"Added to path: {root}")
        break

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_cached_services() -> Tuple[Any, Any, Any, Any, Any]:
    """Get cached service instances using lru_cache for automatic memoization.

    :returns: Tuple of (arxiv_client, pdf_parser, database, metadata_fetcher, opensearch_client)
    """
    # Lazy imports - only loaded when function is called, not when module is parsed
    from src.db.factory import make_database
    from src.services.arxiv.factory import make_arxiv_client
    from src.services.metadata_fetcher import make_metadata_fetcher
    from src.services.opensearch.factory import make_opensearch_client
    from src.services.pdf_parser.factory import make_pdf_parser_service
    
    logger.info("Initializing services (cached with lru_cache)")

    # Initialize core services
    arxiv_client = make_arxiv_client()
    pdf_parser = make_pdf_parser_service()
    database = make_database()
    opensearch_client = make_opensearch_client()

    # Create metadata fetcher with dependencies
    metadata_fetcher = make_metadata_fetcher(arxiv_client, pdf_parser)

    logger.info("All services initialized and cached with lru_cache")
    return arxiv_client, pdf_parser, database, metadata_fetcher, opensearch_client
