# 🤖 Arxuv-Agentic_RAG: Intelligent arXiv Research Assistant

<p align="center">
  <img src="./ai_project_rag_architecture.gif" alt="Agentic RAG Architecture" width="800"/>
</p>

<p align="center">
  <strong>An autonomous AI system that fetches, understands, and answers questions about AI/ML research papers from arXiv</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#api-documentation">API</a> •     
  <a href="#project-structure">Structure</a>
</p>

---

##  Table of Contents

- [What is This?](#-what-is-this)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Agentic RAG Workflow](#-agentic-rag-workflow)
- [Data Pipeline](#-data-pipeline)
- [Configuration](#-configuration)
- [Development](#-development)
- [Monitoring & Observability](#-monitoring--observability)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)

---

## 🎯 What is This?

**Arxuv-Agentic_RAG** is a production-ready, autonomous research assistant that:

1. **Automatically fetches** the latest AI/ML research papers from arXiv daily
2. **Intelligently parses** PDFs to extract structured content
3. **Indexes** papers using hybrid search (BM25 + Vector embeddings)
4. **Answers complex questions** using an Agentic RAG system with reasoning
5. **Provides multiple interfaces** - REST API, Telegram Bot, and Web UI

### Real-World Use Cases

- 🔬 **Researchers**: "What are the latest advancements in transformer architectures?"
- 👨‍🎓 **Students**: "Explain the attention mechanism in simple terms with citations"
- 🏢 **Industry Professionals**: "Find papers on efficient LLM fine-tuning from 2024"
- 🤖 **AI Engineers**: "Compare different RAG implementations and their benchmarks"

---

## ✨ Key Features

### 1. 🤖 Agentic RAG System
Unlike simple RAG, our system uses **LangGraph** to create an intelligent agent that:
- Validates query relevance (guardrails)
- Decides when to retrieve vs. rewrite queries
- Grades document relevance
- Generates answers with source citations
- Handles out-of-scope queries gracefully

### 2. 🔍 Hybrid Search
Combines the best of both worlds:
- **BM25**: For keyword-based exact matching
- **Vector Search**: For semantic understanding using Jina Embeddings v3 (1024-dim)
- **RRF (Reciprocal Rank Fusion)**: Intelligently merges both results

### 3. 📄 Automated Data Pipeline
Apache Airflow orchestrates:
- Daily paper fetching from arXiv (cs.AI category)
- PDF downloading with retry logic
- Intelligent text chunking (section-aware)
- Embedding generation and indexing
- Error handling and monitoring

### 4. 💬 Multi-Interface Support
- **REST API**: Full-featured FastAPI backend
- **Telegram Bot**: Ask questions on-the-go
- **Streaming Support**: Real-time response streaming

### 5. 📊 Full Observability
Integrated with **Langfuse** for:
- Request tracing
- LLM call monitoring
- Performance metrics
- Cost tracking

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACES                                │
├──────────────┬──────────────┬─────────────────┬─────────────────────────────┤
│  REST API    │ Telegram Bot │  Web UI (Soon)  │     Jupyter Notebooks       │
│  (FastAPI)   │   (Python)   │                 │                             │
└──────┬───────┴──────┬───────┴─────────────────┴─────────────────────────────┘
       │              │
       └──────────────┴──────────────────┐
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTIC RAG ORCHESTRATOR                            │
│                              (LangGraph)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐     │
│   │Guardrail │───▶│ Retrieve │───▶│  Grade   │───▶│  Generate Answer │     │
│   │  Check   │    │ Documents│    │Documents │    │                  │     │
│   └──────────┘    └──────────┘    └──────────┘    └──────────────────┘     │
│        │                                    │                               │
│        ▼                                    ▼                               │
│   ┌──────────┐                         ┌──────────┐                        │
│   │ Out of   │                         │ Rewrite  │                        │
│   │ Scope    │                         │  Query   │                        │
│   └──────────┘                         └──────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SEARCH LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐         ┌─────────────────────┐                  │
│   │    BM25 Search      │◀───────▶│   Vector Search     │                  │
│   │   (Keyword-based)   │   RRF   │  (Semantic)         │                  │
│   └─────────────────────┘         └─────────────────────┘                  │
│              │                                    │                         │
│              └──────────────┬─────────────────────┘                         │
│                             ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │  OpenSearch     │                                      │
│                    │  (Hybrid Index) │                                      │
│                    └─────────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                         ▲
                                         │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA PIPELINE                                     │
│                          (Apache Airflow)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   arXiv API ──▶ Fetch Papers ──▶ Download PDFs ──▶ Parse ──▶ Chunk ──▶     │
│                                                                    │        │
│                                                                    ▼        │
│                                                           ┌─────────────┐   │
│                                                           │   Jina AI   │   │
│                                                           │ Embeddings  │   │
│                                                           └─────────────┘   │
│                                                                  │          │
│                                                                  ▼          │
│                                                           ┌─────────────┐   │
│                                                           │  OpenSearch │   │
│                                                           │   Index     │   │
│                                                           └─────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Supporting Services:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PostgreSQL │  │    Redis    │  │   Ollama    │  │  Langfuse   │
│  (Metadata) │  │   (Cache)   │  │   (Local    │  │(Monitoring) │
│             │  │             │  │    LLM)     │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🛠️ Tech Stack

### Core Framework
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Framework** | FastAPI | High-performance REST API |
| **Agent Framework** | LangGraph | Agentic workflow orchestration |
| **Embeddings** | Jina AI v3 | 1024-dim vector embeddings |
| **Vector DB** | OpenSearch | Hybrid search (BM25 + Vector) |
| **LLM** | Ollama | Local LLM inference (Llama 3.2) |
| **Orchestration** | Apache Airflow | Data pipeline scheduling |

### Storage & Cache
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Primary DB** | PostgreSQL 16 | Paper metadata & app data |
| **Cache** | Redis 7.4 | Query caching & session storage |
| **Object Storage** | MinIO | File storage for Langfuse |
| **Analytics** | ClickHouse | Event analytics for Langfuse |

### Observability
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Tracing** | Langfuse v3 | LLM observability & metrics |
| **Dashboards** | OpenSearch Dashboards | Search analytics |

### Development
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Language** | Python 3.12 | Main development language |
| **Container** | Docker + Compose | Service orchestration |
| **Testing** | pytest | Unit & integration testing |
| **PDF Parsing** | Docling | Academic paper extraction |

---

## 📁 Project Structure

```
Arxuv-Agentic_RAG/
├── 📂 airflow/                    # Apache Airflow configuration
│   ├── dags/
│   │   ├── arxiv_paper_ingestion.py    # Main DAG for daily ingestion
│   │   └── arxiv_ingestion/            # DAG helper modules
│   │       ├── common.py
│   │       ├── fetching.py
│   │       ├── indexing.py
│   │       ├── reporting.py
│   │       └── setup.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements-airflow.txt
│
├── 📂 data/                       # Data storage (gitignored)
│   └── arxiv_pdfs/               # Downloaded PDFs
│
├── 📂 notebooks/                  # Jupyter notebooks for exploration
│   ├── all_required_setup.ipynb
│   ├── arxiv_integration.ipynb
│   ├── cache_testing.ipynb
│   ├── Complete_rag_system.ipynb
│   ├── hybrid_search.ipynb
│   └── opensearch.ipynb
│
├── 📂 src/                        # Main application code
│   ├── main.py                    # FastAPI application entry
│   ├── config.py                  # Pydantic settings
│   ├── database.py               # Database connection
│   ├── dependencies.py           # FastAPI dependencies
│   ├── exceptions.py             # Custom exceptions
│   ├── gradio_app.py            # (Future) Web UI
│   ├── middlewares.py           # API middlewares
│   │
│   ├── 📂 db/                     # Database layer
│   │   ├── factory.py
│   │   ├── interfaces/
│   │   │   ├── base.py
│   │   │   └── postgresql.py
│   │   └── models/
│   │       └── paper.py
│   │
│   ├── 📂 models/                 # SQLAlchemy models
│   │   └── paper.py
│   │
│   ├── 📂 repositories/           # Data access layer
│   │   └── paper.py
│   │
│   ├── 📂 routers/                # API endpoints
│   │   ├── agentic_ask.py        # Agentic RAG endpoint
│   │   ├── ask.py                # Simple RAG endpoints
│   │   ├── hybrid_search.py      # Search endpoints
│   │   ├── ping.py               # Health check
│   │   └── __init__.py
│   │
│   ├── 📂 schemas/                # Pydantic schemas
│   │   ├── api/                   # API request/response schemas
│   │   ├── arxiv/                # arXiv data schemas
│   │   ├── database/             # Database schemas
│   │   ├── embeddings/           # Embedding schemas
│   │   ├── indexing/             # Indexing schemas
│   │   ├── pdf_parser/           # PDF parsing schemas
│   │   └── telegram/             # Bot schemas
│   │
│   └── 📂 services/               # Business logic layer
│       ├── metadata_fetcher.py
│       │
│       ├── 📂 agents/             # 🤖 Agentic RAG implementation
│       │   ├── agentic_rag.py     # Main service
│       │   ├── config.py          # Graph configuration
│       │   ├── context.py         # Runtime context
│       │   ├── models.py          # Agent models
│       │   ├── prompts.py         # LLM prompts
│       │   ├── state.py           # Graph state
│       │   ├── tools.py           # Agent tools
│       │   ├── nodes/             # Graph nodes
│       │   │   ├── generate_answer_node.py
│       │   │   ├── grade_documents_node.py
│       │   │   ├── guardrail_node.py
│       │   │   ├── out_of_scope_node.py
│       │   │   ├── retrieve_node.py
│       │   │   └── rewrite_query_node.py
│       │   └── __init__.py
│       │
│       ├── 📂 arxiv/              # arXiv integration
│       │   ├── client.py
│       │   └── factory.py
│       │
│       ├── 📂 cache/              # Redis caching
│       │   ├── client.py
│       │   └── factory.py
│       │
│       ├── 📂 embeddings/         # Jina AI embeddings
│       │   ├── factory.py
│       │   ├── jina_client.py
│       │   └── __init__.py
│       │
│       ├── 📂 indexing/           # Document indexing
│       │   ├── factory.py
│       │   ├── hybrid_indexer.py
│       │   ├── text_chunker.py
│       │   └── __init__.py
│       │
│       ├── 📂 langfuse/           # Observability
│       │   ├── client.py
│       │   ├── factory.py
│       │   ├── tracer.py
│       │   └── __init__.py
│       │
│       ├── 📂 ollama/             # Local LLM
│       │   ├── client.py
│       │   ├── factory.py
│       │   ├── prompts.py
│       │   └── prompts/
│       │       └── rag_system.txt
│       │
│       ├── 📂 opensearch/         # Search engine
│       │   ├── client.py
│       │   ├── factory.py
│       │   ├── index_config_hybrid.py
│       │   ├── query_builder.py
│       │   └── __init__.py
│       │
│       ├── 📂 pdf_parser/         # PDF extraction
│       │   ├── docling.py
│       │   ├── factory.py
│       │   └── parser.py
│       │
│       └── 📂 telegram/           # Telegram bot
│           ├── bot.py
│           ├── factory.py
│           └── __init__.py
│
├── 📂 tests/                      # Test suite
│   ├── conftest.py
│   ├── api/                       # API tests
│   ├── integration/               # Integration tests
│   └── unit/                      # Unit tests
│
├── ai_project_rag_architecture.gif   # Architecture diagram
├── compose.yml                    # Docker Compose configuration
├── .env.example                   # Environment template
├── .gitignore
└── README.md                      # This file
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. Agentic RAG Query
```http
POST /agentic-ask
Content-Type: application/json

{
  "query": "What are the latest developments in multimodal LLMs?",
  "user_id": "user_123",
  "model": "llama3.2:1b"
}
```

**Response:**
```json
{
  "query": "What are the latest developments in multimodal LLMs?",
  "answer": "Recent developments in multimodal LLMs include...",
  "sources": [
    {
      "arxiv_id": "2401.12345",
      "title": "Advanced Multimodal Architectures",
      "authors": "Smith et al.",
      "chunk_text": "...",
      "score": 0.89
    }
  ],
  "reasoning_steps": [
    "Validated query scope (score: 95/100)",
    "Retrieved documents (1 attempt)",
    "Graded documents (3 relevant)",
    "Generated answer from context"
  ],
  "retrieval_attempts": 1,
  "execution_time": 4.23,
  "guardrail_score": 95
}
```

#### 3. Streaming RAG Query
```http
POST /ask/stream
Content-Type: application/json

{
  "query": "Explain transformer architecture"
}
```
**Response:** Server-Sent Events (SSE) stream

#### 4. Hybrid Search
```http
POST /search
Content-Type: application/json

{
  "query": "attention mechanism",
  "top_k": 10,
  "search_type": "hybrid"
}
```

**Response:**
```json
{
  "query": "attention mechanism",
  "results": [
    {
      "arxiv_id": "1706.03762",
      "title": "Attention Is All You Need",
      "chunk_text": "...",
      "bm25_score": 0.95,
      "vector_score": 0.88,
      "final_score": 0.92
    }
  ],
  "total_results": 42,
  "search_type": "hybrid"
}
```

---

## 🎭 Agentic RAG Workflow

Our system isn't just a simple RAG - it's an **intelligent agent** that makes decisions:

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GUARDRAIL CHECK                                              │
│    ├─ Score query relevance (0-100)                             │
│    ├─ If score < 70: Route to OUT_OF_SCOPE                      │
│    └─ If score >= 70: Proceed to RETRIEVE                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. RETRIEVE DOCUMENTS                                           │
│    ├─ Hybrid search (BM25 + Vector)                             │
│    ├─ Fetch top-k chunks                                        │
│    └─ Pass to grading node                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. GRADE DOCUMENTS                                              │
│    ├─ LLM grades each doc: Relevant / Not Relevant              │
│    ├─ If relevant docs found: GENERATE ANSWER                   │
│    └─ If no relevant docs: REWRITE QUERY                        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ 4A. GENERATE ANSWER   │       │ 4B. REWRITE QUERY     │
│    ├─ Use context     │       │    ├─ Improve query   │
│    ├─ Cite sources    │       │    ├─ Add keywords    │
│    └─ Return answer   │       │    └─ Loop back to #2 │
└───────────────────────┘       └───────────────────────┘
```

### Why This is Better Than Simple RAG

| Feature | Simple RAG | Agentic RAG (Ours) |
|---------|------------|-------------------|
| Query validation | ❌ No | ✅ Yes (guardrails) |
| Query rewriting | ❌ No | ✅ Yes (self-correction) |
| Document grading | ❌ No | ✅ Yes (relevance check) |
| Multi-step reasoning | ❌ No | ✅ Yes (conditional flow) |
| Out-of-scope handling | ❌ No | ✅ Yes (polite rejection) |

---

## 🔄 Data Pipeline

### Daily Automation (Apache Airflow)

```
Every day at 2:00 AM
         │
         ▼
┌────────────────────┐
│ Fetch arXiv Papers │──▶ Query: cat:cs.AI + last 24h
│ (cs.AI category)   │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Download PDFs      │──▶ Parallel downloads with retry
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Parse PDFs         │──▶ Docling extraction
│ (Docling)          │    Title, Abstract, Sections
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Chunk Text         │──▶ Section-aware chunking
│ (600 words/chunk)  │    100 word overlap
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Generate Embeddings│──▶ Jina AI v3 API
│ (1024 dimensions)  │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Index to OpenSearch│──▶ Hybrid index
│                    │    BM25 + Vector fields
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Store Metadata     │──▶ PostgreSQL
│                    │
└────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
JINA_API_KEY=your_jina_api_key_here
POSTGRES_PASSWORD=secure_password

# Optional (have defaults)
OLLAMA_MODEL=llama3.2:1b
ARXIV__MAX_RESULTS=15
CHUNKING__CHUNK_SIZE=600
```

### Key Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `JINA_API_KEY` | - | **Required** for embeddings |
| `OLLAMA_MODEL` | llama3.2:1b | Local LLM model |
| `OPENSEARCH__VECTOR_DIMENSION` | 1024 | Jina v3 dimension |
| `CHUNKING__CHUNK_SIZE` | 600 | Words per chunk |
| `ARXIV__SEARCH_CATEGORY` | cs.AI | arXiv category |

---

## 🚀 Development

### Prerequisites
- Docker & Docker Compose
- Python 3.12+ (for local dev)
- 8GB+ RAM (for Ollama)
- Jina AI API key (free tier available)

### Quick Start

```bash
# 1. Clone and enter directory
cd Arxuv-Agentic_RAG

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start all services
docker-compose up -d

# 4. Check health
curl http://localhost:8000/api/v1/health

# 5. Test query
curl -X POST http://localhost:8000/api/v1/agentic-ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is attention mechanism?"}'
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:8000 | FastAPI backend |
| Airflow | http://localhost:8080 | Pipeline management |
| OpenSearch | http://localhost:9200 | Search engine |
| Dashboards | http://localhost:5601 | Search analytics |
| Langfuse | http://localhost:3001 | LLM observability |
| MinIO | http://localhost:9091 | Object storage console |

---

## 📊 Monitoring & Observability

### Langfuse Integration

Track every request:
- Input/output tokens
- Latency metrics
- Cost estimation
- Trace visualization

### OpenSearch Dashboards

Monitor search performance:
- Query latency
- Index statistics
- Search analytics

### Health Checks

All services expose health endpoints:
```bash
# API
curl http://localhost:8000/api/v1/health

# OpenSearch
curl http://localhost:9200/_cluster/health

# Airflow
curl http://localhost:8080/health
```

---

## 🔮 Future Roadmap

- [ ] **Web UI**: Gradio/React frontend
- [ ] **Multi-category Support**: Beyond cs.AI
- [ ] **Citation Network**: Paper relationship graphs
- [ ] **Alert System**: Notify on relevant new papers
- [ ] **Collaborative Features**: Share paper collections
- [ ] **Advanced Analytics**: Research trend analysis

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>Built with ❤️ for the AI/ML community</strong>
</p>

<p align="center">
  <a href="https://linkedin.com/in/vaibhav-lohar-38b78a28b">LinkedIn</a> •
  <a href="mailto:your-email@example.com">Email</a>
</p>
