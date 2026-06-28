# 🚀 Arxiv-Agentic-RAG: Intelligent arXiv Research Assistant

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

## 📑 Table of Contents

- [What is This?](#-what-is-this)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Agentic RAG Workflow](#-agentic-rag-workflow)
- [Data Pipeline](#-data-pipeline)
- [Configuration & Setup](#-configuration--setup)
- [Monitoring & Observability](#-monitoring--observability)
- [License](#-license)

---

## 🎯 What is This?

**Arxiv-Agentic-RAG** is a production-ready, autonomous research assistant that:

1. **Automatically fetches** the latest AI/ML research papers from arXiv.
2. **Intelligently parses** complex academic PDFs to extract structured content using Docling.
3. **Indexes** papers using hybrid search (BM25 + Vector embeddings in OpenSearch).
4. **Answers complex questions** using a self-correcting Agentic RAG system built with LangGraph.
5. **Provides a Modern Web UI** built with React, Vite, and Tailwind CSS.

### Real-World Use Cases

- 🔬 **Researchers**: "What are the latest advancements in transformer architectures?"
- 👨‍🎓 **Students**: "Explain the attention mechanism in simple terms with citations."
- 🏢 **Industry Professionals**: "Find papers on efficient LLM fine-tuning from 2024."
- 🤖 **AI Engineers**: "Compare different RAG implementations and their benchmarks."

---

## ✨ Key Features

### 1. 🤖 Agentic RAG System
Unlike simple RAG, our system uses **LangGraph** to create an intelligent workflow:
- Validates query relevance (Guardrails)
- Grades document relevance automatically
- Decides when to retrieve vs. rewrite queries
- Generates answers with source citations
- Handles out-of-scope queries gracefully to prevent hallucinations

### 2. 🔍 Hybrid Search
Combines the best of both worlds in **OpenSearch**:
- **BM25**: Keyword-based exact matching
- **Vector Search**: Semantic understanding using Jina Embeddings v3 (1024-dim)
- **RRF (Reciprocal Rank Fusion)**: Intelligently merges both results

### 3. 🎨 Modern Web Interface
A fast, responsive, and beautiful frontend:
- **React + TypeScript + Vite**: Ultra-fast performance
- **Tailwind CSS & Radix UI**: Beautiful, accessible components
- **Framer Motion**: Smooth animations
- **Markdown & Math Support**: Renders complex academic formulas and code blocks perfectly using `react-markdown` and `KaTeX`.

### 4. 📄 Automated Data Pipeline
**Apache Airflow** orchestrates:
- Daily paper fetching from arXiv (cs.AI category)
- PDF downloading with retry logic
- Intelligent text chunking (section-aware)
- Embedding generation and indexing

### 5. 📊 Full Observability
Integrated with **Langfuse** for:
- Request tracing and LLM call monitoring
- Performance metrics and Cost tracking

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                 │
│                   React + Vite + Tailwind CSS + Radix UI                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTIC RAG ORCHESTRATOR                            │
│                         (FastAPI + LangGraph)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐      │
│   │Guardrail │───▶│ Retrieve │───▶│  Grade   │───▶│ Generate Answer  │      │
│   │  Check   │    │ Documents│    │Documents │    │                  │      │
│   └──────────┘    └──────────┘    └──────────┘    └──────────────────┘      │
│        │                                    │                               │
│        ▼                                    ▼                               │
│   ┌──────────┐                         ┌──────────┐                         │
│   │ Out of   │                         │ Rewrite  │                         │
│   │ Scope    │                         │  Query   │                         │
│   └──────────┘                         └──────────┘                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SEARCH LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐         ┌─────────────────────┐                   │
│   │    BM25 Search      │◀───────▶│   Vector Search     │                   │
│   │   (Keyword-based)   │   RRF   │    (Semantic)       │                   │
│   └─────────────────────┘         └─────────────────────┘                   │
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
│ arXiv API ─▶ Fetch Papers ─▶ Download PDFs ─▶ Parse (Docling) ─▶ Chunk ─▶  │
│                                                                    │        │
│                                                                    ▼        │
│                                                           ┌─────────────┐   │
│                                                           │   Jina AI   │   │
│                                                           │ Embeddings  │   │
│                                                           └─────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Supporting Services:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PostgreSQL │  │    Redis    │  │   Ollama    │  │  Langfuse   │
│  (Metadata) │  │   (Cache)   │  │ (Local LLM) │  │(Monitoring) │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend UI
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Core Framework** | React 18, Vite, TS | High-performance SPA frontend |
| **Styling** | Tailwind CSS, clsx | Utility-first styling |
| **Components** | Radix UI, lucide-react | Accessible, unstyled primitives & icons |
| **Data Fetching** | React Query, Axios | Asynchronous state management |
| **Rendering** | react-markdown, KaTeX | Markdown and Math equations rendering |
| **Animations** | Framer Motion | Fluid UI transitions |

### Backend API & Agent
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Framework** | FastAPI | High-performance REST API |
| **Agent Framework** | LangGraph | Agentic workflow orchestration |
| **Embeddings** | Jina AI v3 | 1024-dim vector embeddings |
| **Vector DB** | OpenSearch | Hybrid search (BM25 + Vector) |
| **LLM** | Ollama | Local LLM inference (Llama 3.2:1b) |
| **Orchestration** | Apache Airflow | Data pipeline scheduling |

### Storage, Cache & Observability
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Primary DB** | PostgreSQL 16 | Paper metadata & app data |
| **Cache** | Redis 7.4 | Query caching & session storage |
| **Tracing** | Langfuse v3 | LLM observability & metrics |
| **Testing** | pytest | Unit & integration testing |
| **PDF Parsing** | Docling | Academic paper extraction |

---

## 📁 Project Structure

```text
Arxiv-Agentic_RAG/
├── 📂 frontend/                   # React web application
│   ├── src/                       # Components, pages, hooks, utils
│   ├── package.json               # Frontend dependencies
│   ├── tailwind.config.js         # Tailwind configuration
│   ├── vite.config.ts             # Vite configuration
│   └── nginx.conf                 # Nginx config for Docker deployment
│
├── 📂 airflow/                    # Apache Airflow data ingestion pipeline
│   ├── dags/
│   │   ├── arxiv_paper_ingestion.py
│   │   └── arxiv_ingestion/
│   ├── Dockerfile
│   └── entrypoint.sh
│
├── 📂 src/                        # FastAPI Backend & LangGraph Agent
│   ├── main.py                    # API entry point
│   ├── config.py                  # Environment config
│   ├── 📂 routers/                # API route definitions
│   ├── 📂 services/               # Core business logic
│   │   ├── 📂 agents/             # LangGraph agent definitions & nodes
│   │   ├── 📂 indexing/           # Text chunking & hybrid indexer
│   │   ├── 📂 opensearch/         # OpenSearch queries & mappings
│   │   ├── 📂 arxiv/              # arXiv integration
│   │   ├── 📂 pdf_parser/         # Docling extraction
│   │   └── 📂 embeddings/         # Jina AI client
│   └── 📂 schemas/                # Pydantic validation schemas
│
├── 📂 scripts/                    # Utility scripts (indexing, setups)
├── 📂 notebooks/                  # Jupyter notebooks for experimentation
├── compose.yml                    # Docker Compose configuration
├── .env.example                   # Environment template
└── README.md                      # This file
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### 1. Agentic RAG Query
```http
POST /ask-agentic
Content-Type: application/json

{
  "query": "What are the latest developments in multimodal LLMs?",
  "top_k": 3,
  "use_hybrid": true
}
```

**Response:**
```json
{
  "query": "What are the latest developments in multimodal LLMs?",
  "answer": "Recent developments in multimodal LLMs include...",
  "sources": [...],
  "chunks_used": 3,
  "search_mode": "hybrid",
  "reasoning_steps": [
    "Validated query scope (score: 95/100)",
    "Retrieved documents (1 attempt)",
    "Graded documents (3 relevant)",
    "Generated answer from context"
  ],
  "retrieval_attempts": 1,
  "trace_id": "..."
}
```

---

## 🎭 Agentic RAG Workflow

Our system isn't just a simple RAG - it's an **intelligent agent** that makes decisions:

### Step-by-Step Flow

```text
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

---

## ⚙️ Configuration & Setup

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

### Running Locally with Docker

You can easily spin up the entire application (Frontend, Backend, OpenSearch, Postgres, Redis, etc.) using Docker Compose:

```bash
docker-compose up --build
```
- **Web UI (React)**: `http://localhost:80`
- **FastAPI Backend**: `http://localhost:8000/docs`
- **OpenSearch**: `http://localhost:9200`

---

## 📊 Monitoring & Observability

### Langfuse Integration
Track every request:
- Input/output tokens
- Latency metrics
- Cost estimation
- Trace visualization

### Health Checks
All core services expose health endpoints:
```bash
# API Backend
curl http://localhost:8000/api/v1/health

# OpenSearch
curl http://localhost:9200/_cluster/health
```

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>Built with ❤️ for the AI/ML community</strong>
</p>

<p align="center">
  <strong>Author: Vaibhav Lohar</strong>
</p>

<p align="center">
  <a href="https://linkedin.com/in/vaibhav-lohar-38b78a28b">LinkedIn</a> •
  <a href="mailto:your-email@example.com">Email</a>
</p>
