import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.arxiv.factory import make_arxiv_client
from src.services.indexing.factory import make_hybrid_indexing_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

async def main():
    logger.info("Fetching 10 papers for fast abstract-only indexing...")
    arxiv_client = make_arxiv_client()
    indexing_service = make_hybrid_indexing_service()

    papers = await arxiv_client.fetch_papers(max_results=10)
    successfully_indexed = 0

    for i, paper in enumerate(papers, 1):
        logger.info(f"Processing abstract {i}/10: {paper.title[:50]}...")
        
        # Build paper data for abstract-only
        paper_data = {
            "arxiv_id": paper.arxiv_id,
            "id": paper.arxiv_id,
            "title": paper.title,
            "abstract": paper.abstract,
            "raw_text": f"{paper.title}\n\nAbstract: {paper.abstract}",
            "sections": None,
            "authors": [a for a in paper.authors] if paper.authors else [],
            "categories": paper.categories if paper.categories else [],
            "published_date": paper.published_date,
        }

        try:
            stats = await indexing_service.index_paper(paper_data)
            logger.info(f" ✓ Indexed: {stats}")
            successfully_indexed += 1
        except Exception as e:
            logger.error(f" ✗ Failed: {e}")

    logger.info(f"Successfully indexed {successfully_indexed} abstracts!")
    
    count = indexing_service.opensearch_client.client.count(index=indexing_service.opensearch_client.index_name)
    logger.info(f"OpenSearch now has {count['count']} documents.")

if __name__ == "__main__":
    asyncio.run(main())
