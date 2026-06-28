"""
Script to fetch, parse, and index arXiv papers into OpenSearch.
Usage: python -m scripts.ingest_papers
"""
import asyncio
import logging
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.arxiv.factory import make_arxiv_client
from src.services.pdf_parser.factory import make_pdf_parser_service
from src.services.indexing.factory import make_hybrid_indexing_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def main():
    logger.info("=" * 60)
    logger.info("arXiv Paper Ingestion Script")
    logger.info("=" * 60)

    # Initialize services
    arxiv_client = make_arxiv_client()
    pdf_parser = make_pdf_parser_service()
    indexing_service = make_hybrid_indexing_service()

    # Step 1: Fetch papers from arXiv (cs.AI category)
    logger.info("\n📡 Step 1: Fetching papers from arXiv...")
    
    # Fetch recent AI/ML papers 
    papers = await arxiv_client.fetch_papers(max_results=10)
    logger.info(f"✓ Fetched {len(papers)} papers from arXiv")

    if not papers:
        logger.error("No papers fetched! Check arXiv API connectivity.")
        return

    # Step 2: Process each paper
    successfully_indexed = 0
    failed = 0

    for i, paper in enumerate(papers, 1):
        logger.info(f"\n{'─' * 60}")
        logger.info(f"📄 Processing paper {i}/{len(papers)}: {paper.title[:80]}...")
        logger.info(f"   arXiv ID: {paper.arxiv_id}")

        try:
            # Step 2a: Download PDF
            logger.info(f"   📥 Downloading PDF...")
            try:
                pdf_path = await arxiv_client.download_pdf(paper)
            except Exception as e:
                logger.warning(f"   ⚠ PDF download exception: {e}")
                pdf_path = None
            
            if not pdf_path:
                logger.warning(f"   ⚠ PDF download failed, using abstract only")
                # Index with abstract only (no full text)
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
                stats = await indexing_service.index_paper(paper_data)
                logger.info(f"   ✓ Indexed (abstract only): {stats}")
                successfully_indexed += 1
                continue

            # Step 2b: Parse PDF
            logger.info(f"   📖 Parsing PDF with Docling...")
            pdf_content = await pdf_parser.parse_pdf(pdf_path)

            if pdf_content:
                full_text = pdf_content.raw_text
                sections_data = [
                    {"title": s.title, "content": s.content}
                    for s in pdf_content.sections
                ] if pdf_content.sections else None
                logger.info(f"   ✓ Parsed: {len(full_text)} chars, {len(pdf_content.sections) if pdf_content.sections else 0} sections")
            else:
                logger.warning(f"   ⚠ PDF parsing failed, using abstract only")
                full_text = f"{paper.title}\n\nAbstract: {paper.abstract}"
                sections_data = None

            # Step 2c: Build paper_data dict and index
            paper_data = {
                "arxiv_id": paper.arxiv_id,
                "id": paper.arxiv_id,
                "title": paper.title,
                "abstract": paper.abstract,
                "raw_text": full_text,
                "sections": sections_data,
                "authors": [a for a in paper.authors] if paper.authors else [],
                "categories": paper.categories if paper.categories else [],
                "published_date": paper.published_date,
            }

            logger.info(f"   🔗 Chunking + Embedding + Indexing...")
            stats = await indexing_service.index_paper(paper_data)
            logger.info(f"   ✓ Indexed: chunks={stats.get('chunks_indexed', 0)}, embeddings={stats.get('embeddings_generated', 0)}")
            successfully_indexed += 1

        except Exception as e:
            logger.error(f"   ✗ Failed to process paper: {e}")
            failed += 1
            continue

    # Summary
    logger.info(f"\n{'=' * 60}")
    logger.info(f"📊 Ingestion Summary")
    logger.info(f"   Total papers fetched: {len(papers)}")
    logger.info(f"   Successfully indexed: {successfully_indexed}")
    logger.info(f"   Failed: {failed}")
    logger.info(f"{'=' * 60}")

    # Verify OpenSearch document count
    try:
        count = indexing_service.opensearch_client.client.count(
            index=indexing_service.opensearch_client.index_name
        )
        logger.info(f"\n🔍 OpenSearch index '{indexing_service.opensearch_client.index_name}' now has {count['count']} documents")
    except Exception as e:
        logger.warning(f"Could not verify document count: {e}")


if __name__ == "__main__":
    asyncio.run(main())
