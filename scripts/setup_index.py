import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.indexing.factory import make_hybrid_indexing_service

def setup():
    indexing_service = make_hybrid_indexing_service()
    print("Setting up OpenSearch indices (force=True)...")
    results = indexing_service.opensearch_client.setup_indices(force=True)
    print(f"Results: {results}")

if __name__ == "__main__":
    setup()
