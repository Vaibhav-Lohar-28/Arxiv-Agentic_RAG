# Arxiv Agentic RAG - Frontend

A modern, professional React frontend for the Arxiv Agentic RAG system.

## Features

- 🎨 **Modern UI** - Built with Tailwind CSS and Radix UI components
- 🌙 **Dark/Light Mode** - Automatic theme switching
- 💬 **Chat Interface** - ChatGPT-like conversation experience
- 📊 **Animated Reasoning** - Visualize the agent's thought process
- 📚 **Source Citations** - Expandable source cards with relevance scores
- ⚡ **Fast Development** - Vite-powered development server
- 📱 **Responsive** - Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Headless UI components
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── chat/         # Chat-related components
│   │   └── layout/       # Layout components
│   ├── api/              # API client
│   ├── lib/              # Utilities
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
