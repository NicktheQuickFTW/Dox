# Initialize Project Foundation

Sets up a standardized project foundation incorporating Context Engineering, Claude Hooks & Agents, and PRP methodology. This command establishes the complete development framework used in DoX.

## Arguments: $ARGUMENTS

## Framework Components

This command integrates three proven methodologies:

1. **Context Engineering** - Comprehensive context for AI-assisted development
2. **Claude Hooks & Agents** - Safety hooks and specialized sub-agents  
3. **Product Requirement Prompts (PRPs)** - Structured feature development

## Implementation

### 1. Parse Project Information

Extract project details from arguments or current directory:
- Project name and purpose
- Technology stack (Next.js, Python, etc.)
- Domain/industry context
- Existing codebase analysis

### 2. Create Directory Structure

Set up the standardized foundation:

```bash
# Create core directories
mkdir -p .claude/{commands,hooks,agents}
mkdir -p PRPs/{templates,completed}
mkdir -p .claude/hooks/{logs,utils}

# Initialize logs directory
touch .claude/hooks/logs/.gitkeep
```

### 3. Install Context Engineering Framework

Copy and customize context engineering templates:

**Context Engineering Commands:**
- `/generate-prp` - Create comprehensive PRPs with research
- `/execute-prp` - Execute PRPs with validation loops

**Files to create:**
- `.claude/commands/generate-prp.md`
- `.claude/commands/execute-prp.md`
- `PRPs/templates/project_prp_base.md`
- `INITIAL.md` template
- `INITIAL_EXAMPLE.md`

### 4. Setup Claude Hooks for Safety

Create project-specific safety hooks:

**Pre-Tool-Use Hook:**
```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

# Project-specific safety validations:
# - Block dangerous operations
# - Validate project patterns  
# - Enforce coding standards
# - Protect sensitive files
```

**User-Prompt-Submit Hook:**
```python
# Add project context automatically
# Suggest PRP usage for complex features
# Log all interactions for audit
```

**Post-Tool-Use Hook:**
```python
# Validate results match project standards
# Track modifications for audit trail
# Ensure quality gates are met
```

### 5. Create Specialized Sub-Agents

Generate domain-specific agents based on project type:

**Common Agents:**
- `code-reviewer` - Code quality and standards enforcement
- `documentation-writer` - Technical documentation specialist
- `test-engineer` - Test strategy and implementation

**Domain-Specific Agents:**
- Web apps: `api-designer`, `ui-component-builder`
- Data projects: `data-validator`, `pipeline-optimizer`
- AI/ML: `model-evaluator`, `feature-engineer`

### 6. Configure Claude Settings

Create `.claude/settings.json` with:
- Tool permissions appropriate for project
- Hook configurations
- Agent availability

### 7. Generate Project-Specific CLAUDE.md

Create comprehensive guidance including:
- Project overview and architecture
- Development commands and workflows
- Framework integration instructions
- Best practices and patterns
- Troubleshooting guidelines

### 8. Setup PRP Templates

Create customized PRP templates with:
- Project-specific context patterns
- Technology stack details
- Domain knowledge integration
- Validation loops for the tech stack

## Usage Examples

### Basic Initialization
```
/init-foundation "Task management app with Next.js and Supabase"
```

### With Specific Framework
```
/init-foundation "AI analytics platform" --stack python --domain data-science
```

### From Existing Project
```
/init-foundation --analyze-existing --enhance-with-foundation
```

## Execution Steps

1. **Analyze Current State**
   - Check if already initialized
   - Identify existing patterns
   - Determine project technology

2. **Create Foundation Structure**
   - Set up directory tree
   - Install base templates
   - Configure permissions

3. **Customize for Project**
   - Generate project-specific hooks
   - Create domain agents
   - Customize PRP templates

4. **Generate Documentation**
   - Create CLAUDE.md
   - Document commands available
   - Provide usage examples

5. **Validate Installation**
   - Test hook execution
   - Verify agent availability
   - Confirm PRP workflow

## Output

After completion, the project will have:

```
project-root/
├── .claude/
│   ├── commands/
│   │   ├── generate-prp.md
│   │   ├── execute-prp.md
│   │   └── [project-specific commands]
│   ├── hooks/
│   │   ├── pre_tool_use.py
│   │   ├── user_prompt_submit.py
│   │   ├── post_tool_use.py
│   │   └── logs/
│   ├── agents/
│   │   ├── [domain-specific agents]
│   │   └── meta-agent.md
│   └── settings.json
├── PRPs/
│   ├── templates/
│   │   └── project_prp_base.md
│   └── completed/
├── CLAUDE.md
├── INITIAL.md
└── INITIAL_EXAMPLE.md
```

## Success Criteria

- [ ] All framework components installed
- [ ] Project-specific customizations applied
- [ ] Hooks functioning and logging
- [ ] Agents accessible and operational
- [ ] PRP workflow executable
- [ ] Documentation complete and accurate
- [ ] Example PRP generated successfully

This foundation enables immediate productive AI-assisted development with safety guardrails, specialized assistance, and structured feature development methodology.