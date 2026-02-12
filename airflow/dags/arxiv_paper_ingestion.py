"""
arXiv Paper Ingestion DAG for Agentic RAG System.

This DAG performs daily ingestion of arXiv CS.AI papers:
1. Fetches papers from arXiv API
2. Downloads and parses PDFs using Docling
3. Stores metadata and content in PostgreSQL
4. Creates chunks with embeddings using Jina AI
5. Indexes into OpenSearch for hybrid search
"""
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator

# Default DAG arguments
default_args = {
    "owner": "arxiv-curator",
    "depends_on_past": False,
    "start_date": datetime(2025, 8, 8),
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=30),
    "catchup": False,
}


# Import task functions (lazy loading at task execution time, not DAG parse time)
def _get_setup_task():
    from arxiv_ingestion.setup import setup_environment
    return setup_environment


def _get_fetch_task():
    from arxiv_ingestion.fetching import fetch_daily_papers
    return fetch_daily_papers


def _get_index_task():
    from arxiv_ingestion.indexing import index_papers_hybrid
    return index_papers_hybrid


def _get_report_task():
    from arxiv_ingestion.reporting import generate_daily_report
    return generate_daily_report


# Create the DAG
dag = DAG(
    "arxiv_paper_ingestion",
    default_args=default_args,
    description="Daily arXiv CS.AI paper pipeline: fetch → store to PostgreSQL → chunk & embed → hybrid OpenSearch indexing",
    schedule="0 6 * * 1-5",  # Monday-Friday at 6 AM UTC
    max_active_runs=1,
    catchup=False,
    tags=["arxiv", "papers", "ingestion", "hybrid-search", "embeddings", "chunks"],
)

# Task definitions
setup_task = PythonOperator(
    task_id="setup_environment",
    python_callable=_get_setup_task(),
    dag=dag,
)

fetch_task = PythonOperator(
    task_id="fetch_daily_papers",
    python_callable=_get_fetch_task(),
    dag=dag,
)

# Hybrid search indexing task (replaces old OpenSearch task)
index_hybrid_task = PythonOperator(
    task_id="index_papers_hybrid",
    python_callable=_get_index_task(),
    dag=dag,
)

report_task = PythonOperator(
    task_id="generate_daily_report",
    python_callable=_get_report_task(),
    dag=dag,
)

cleanup_task = BashOperator(
    task_id="cleanup_temp_files",
    bash_command="""
    echo "Cleaning up temporary files..."
    # Remove PDFs older than 30 days to manage disk space
    find /tmp -name "*.pdf" -type f -mtime +30 -delete 2>/dev/null || true
    echo "Cleanup completed"
    """,
    dag=dag,
)

# Task dependencies
# Simplified pipeline: setup -> fetch -> hybrid index -> report -> cleanup
setup_task >> fetch_task >> index_hybrid_task >> report_task >> cleanup_task
