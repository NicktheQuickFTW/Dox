# DoX Planning & Architecture Document
*Last Updated: January 29, 2025*

## Executive Summary

DoX is a comprehensive policy management system for the Big 12 Conference, developed by HELiiX AI Solutions. The platform manages 191+ policies across 8 sports, providing advanced search, version control, and AI-powered manual generation capabilities.

## Current Status

### ✅ Completed
- Database schema design and implementation (Supabase)
- 191 policies imported across 8 sports
- MCP server with 18 tools for AI integration
- Basic frontend structure (Next.js 14 App Router)
- Claude Code integration with specialized agents
- UI/UX sub-agent workflow system
- Git repository initialized and pushed

### 🚧 In Progress
- Frontend UI implementation
- Policy search interface
- Manual generation UI
- Authentication system

### 📋 Planned
- Admin dashboard
- Policy editor interface
- Analytics dashboard
- Mobile app development

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        DoX Platform                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   Next.js   │     │     MCP     │     │   Claude    │   │
│  │   Web App   │────▶│   Server    │────▶│   Agents    │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│         │                    │                     │         │
│         ▼                    ▼                     ▼         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Supabase (PostgreSQL)                   │   │
│  │                                                      │   │
│  │  • competition.policies (191 records)               │   │
│  │  • competition.sports (22 sports)                   │   │
│  │  • competition.policy_versions                      │   │
│  │  • competition.manuals                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + HELiiX Design System
- **State Management**: React hooks + Context API
- **Type Safety**: TypeScript 5

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with RLS
- **API**: Supabase client SDK
- **MCP Server**: Node.js + TypeScript

### AI Integration
- **MCP Tools**: 18 specialized tools
- **Claude Agents**: 8 specialized sub-agents
- **Context Engineering**: PRPs and validation loops
- **Safety Hooks**: Pre/post tool validation

## Data Model

### Policy Structure
```typescript
interface Policy {
  id: string;
  policy_number: string;      // Format: "SPORT-CATEGORY-NUMBER"
  sport_id: number | null;    // Null for multi-sport
  title: string;
  content: string;
  category: PolicyCategory;
  tags: string[];
  status: 'current' | 'archived' | 'draft';
  effective_date: Date;
  applies_to_sports: number[]; // For multi-sport policies
  created_at: Date;
  updated_at: Date;
}
```

### Key Relationships
- **policies** ↔ **sports**: Many-to-many via applies_to_sports[]
- **policies** ↔ **policy_versions**: One-to-many version tracking
- **manuals** ↔ **policies**: Many-to-many via manual_policies
- **policies**: Full-text search via PostgreSQL ts_vector

## MVP Implementation Plan (5 Weeks)

### Week 1: Core UI Components
- [ ] Policy search interface with filters
- [ ] Policy list/grid views
- [ ] Policy detail viewer
- [ ] Navigation and layout

### Week 2: Search & Discovery
- [ ] Advanced search with full-text
- [ ] Filter by sport, category, status
- [ ] Search results with highlighting
- [ ] Recent searches and suggestions

### Week 3: Manual Generation
- [ ] Manual template selection
- [ ] Policy selection interface
- [ ] PDF preview functionality
- [ ] Download and share options

### Week 4: Authentication & Admin
- [ ] User authentication flow
- [ ] Role-based access control
- [ ] Basic admin dashboard
- [ ] Policy CRUD operations

### Week 5: Polish & Deployment
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Error handling and edge cases
- [ ] Production deployment

## UI/UX Development Workflow

### Systematic Approach
1. **UX Structure** (ux-engineer) → Wireframes and user flows
2. **Visual Design** (ui-implementation) → HELiiX styling applied
3. **Mobile Optimization** (mobile-ux-engineer) → Touch-friendly design
4. **Framework Conversion** (ui-converter) → React components
5. **A/B Testing** (ui-testing) → Multiple variants for optimization

### Design Principles
- **Minimalist**: Black/white/grayscale aesthetic
- **Professional**: Clean typography (Inter/Helvetica Neue)
- **Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 AA compliance
- **Fast**: Sub-2 second load times

## API Design

### MCP Server Tools
```
Search Tools:
- search_policies(query, filters, pagination)
- search_by_sport(sport_abbreviation)
- search_by_category(category)
- search_by_keywords(keywords[])

Retrieval Tools:
- get_policy(policy_number)
- get_policy_history(policy_id)
- list_policies(filters, pagination)
- list_sports()
- list_categories()

Generation Tools:
- generate_manual(config)
- preview_manual(config)
- get_manual_templates()

Management Tools:
- create_policy(data) [requires auth]
- update_policy(id, data) [requires auth]
- archive_policy(id) [requires auth]
```

### Resource URIs
- `policy://{policy_number}` - Direct policy access
- `policy://sport/{abbreviation}` - Sport-specific policies
- `policy://category/{category}` - Category policies
- `manual://{uuid}` - Generated manuals

## Security & Performance

### Security Measures
- Row-Level Security (RLS) policies
- API key authentication for MCP
- Service key for admin operations
- Input validation with Zod schemas
- XSS protection in React

### Performance Optimization
- PostgreSQL GIN indexes for search
- Lazy loading for large datasets
- React.memo for component optimization
- Edge caching with Vercel
- Optimized PDF generation

## Integration Points

### Claude Code
- MCP server for AI-powered operations
- Custom commands for workflow automation
- Specialized agents for different tasks
- Hooks for safety and validation

### HELiiX Ecosystem
- Shared Supabase instance
- Consistent design system
- Microservice architecture ready
- Cross-service authentication

## Success Metrics

### Technical KPIs
- Search response time < 200ms
- Page load time < 2 seconds
- 99.9% uptime target
- Zero security incidents

### Business KPIs
- 100% policy coverage (191/191)
- Manual generation time < 30 seconds
- User satisfaction > 90%
- Support ticket reduction by 50%

## Risk Mitigation

### Technical Risks
- **Database scaling**: Implement caching and query optimization
- **PDF generation load**: Queue system for large manuals
- **Search performance**: Regular index maintenance

### Business Risks
- **User adoption**: Comprehensive training materials
- **Data accuracy**: Version control and audit trails
- **Compliance**: Regular security audits

## Next Steps

1. **Immediate** (This Week)
   - Complete core UI components
   - Implement search interface
   - Set up authentication flow

2. **Short-term** (Next 2 Weeks)
   - Manual generation UI
   - Admin dashboard basics
   - Mobile optimization

3. **Medium-term** (Next Month)
   - Analytics dashboard
   - Advanced admin features
   - Performance optimization

4. **Long-term** (Q2 2025)
   - Mobile app development
   - API for third-party integration
   - Machine learning features

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Component-driven development
- Test coverage > 80%

### Git Workflow
- Feature branches from main
- PR reviews required
- Semantic commit messages
- No AI attribution in commits

### Documentation
- Inline code comments
- README updates with changes
- API documentation
- User guides

## Contact & Resources

- **Project Lead**: Nick Williams (Director of Competition, Big 12)
- **Development**: HELiiX AI Solutions
- **Repository**: https://github.com/NicktheQuickFTW/DoX
- **MCP Docs**: /mcp-server/README.md
- **Design System**: HELiiX standards

---

*This document is a living guide and will be updated as the project evolves.*