# DoX - Big 12 Conference Policy Management System

A comprehensive policy management and manual generation system for the Big 12 Conference.

## Overview

Dox is a modern web application designed to manage, search, and generate administrative manuals for Big 12 Conference sports policies. The system provides:

- **Policy Database**: Centralized storage of all conference policies
- **Search & Filter**: Advanced search capabilities across sports, categories, and keywords
- **Manual Generation**: Dynamic PDF generation of administrative manuals
- **Version Control**: Track policy changes and maintain historical records
- **Role-Based Access**: Secure access control for different user types

## Features

- 📚 **Policy Management**: Create, read, update, and delete policies
- 🔍 **Advanced Search**: Full-text search with filtering by sport, category, and tags
- 📄 **Manual Generation**: Generate PDF manuals on-demand with custom selections
- 📊 **Analytics Dashboard**: Track policy usage and changes
- 🔐 **Secure Access**: Role-based permissions for administrators and viewers
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: React PDF
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dox.git
cd dox

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
dox/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── public/              # Static assets
├── supabase/           # Database migrations
└── docs/               # Documentation
```

## Database Schema

The system uses a PostgreSQL database with the following main tables:
- `policies`: Stores all policy documents
- `sports`: List of Big 12 sports
- `categories`: Policy categories
- `versions`: Policy version history
- `users`: User management

## MCP Server

DoX includes a Model Context Protocol (MCP) server that provides programmatic access to the policy management system. This allows integration with AI assistants like Claude.

### MCP Features
- Full-text policy search
- Policy retrieval and management
- PDF manual generation
- Interactive prompts for common workflows
- Resource URIs for direct policy access

See the [MCP Server README](./mcp-server/README.md) for detailed setup and usage instructions.

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

© 2025 Big 12 Conference. All rights reserved.