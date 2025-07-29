# Foundation Status Check

Analyzes the current project's foundation setup and provides a comprehensive report on Context Engineering, Claude Hooks & Agents, and PRP methodology implementation status.

## Arguments: None

## Overview

This command evaluates the completeness and health of your project's AI development foundation, identifying missing components, configuration issues, and optimization opportunities.

## Analysis Components

### 1. Claude Configuration Analysis
Check `.claude/` directory structure and configuration:

- **Commands**: Available slash commands and functionality
- **Hooks**: Safety hooks and their operational status  
- **Agents**: Specialized sub-agents and their capabilities
- **Settings**: Permissions and tool access configuration

### 2. PRP Framework Assessment
Evaluate Product Requirement Prompt setup:

- **Templates**: Available PRP templates and customization level
- **Examples**: Sample PRPs for guidance
- **Workflow**: PRP creation and execution capabilities
- **Documentation**: Context engineering documentation

### 3. Hook System Health Check
Test and validate safety/automation hooks:

- **PreToolUse**: Safety validations and blocking capabilities
- **PostToolUse**: Result validation and audit trail
- **UserPromptSubmit**: Context injection and suggestions
- **Logging**: Audit trail functionality and storage

### 4. Agent Availability Assessment
Review specialized sub-agents:

- **Agent Definitions**: Proper configuration and descriptions
- **Tool Access**: Required tools and permissions
- **Domain Expertise**: Coverage for project needs
- **Delegation Logic**: Automatic assignment capabilities

## Execution Process

1. **Scan Directory Structure**
   ```bash
   # Check for foundation directories
   ls -la .claude/
   ls -la PRPs/
   ls -la .claude/hooks/
   ls -la .claude/agents/
   ```

2. **Validate Configuration Files**
   ```bash
   # Check critical configuration
   cat .claude/settings.json
   cat CLAUDE.md
   cat PRPs/templates/*.md
   ```

3. **Test Hook Functionality**
   ```bash
   # Test hooks with sample input
   echo '{"tool_name": "test"}' | .claude/hooks/pre_tool_use.py
   ```

4. **Analyze Agent Definitions**
   ```bash
   # Review agent configurations
   grep -r "description:" .claude/agents/
   ```

5. **Check Documentation Completeness**
   ```bash
   # Verify documentation exists
   test -f CLAUDE.md && echo "✓ CLAUDE.md exists"
   test -f INITIAL.md && echo "✓ INITIAL.md exists"
   ```

## Report Format

### Foundation Health Score: [X/100]

#### ✅ Components Present
- [Component]: [Status] - [Details]

#### ⚠️ Components Missing/Issues
- [Component]: [Issue] - [Recommendation]

#### 🔧 Recommendations
- [Priority]: [Action Item]

---

### Detailed Analysis

#### Claude Configuration Status
```
✅ Commands: [X/Y] implemented
  - /generate-prp: Present
  - /execute-prp: Present
  - Custom commands: [list]

✅ Hooks: [X/3] operational
  - PreToolUse: [Status]
  - PostToolUse: [Status]  
  - UserPromptSubmit: [Status]

✅ Agents: [X] available
  - [agent-name]: [description]
  - Coverage gaps: [list]

✅ Settings: [Status]
  - Permissions: [configured/default]
  - Tool access: [appropriate/too-broad/too-restrictive]
```

#### PRP Framework Status
```
✅ Templates: [X] available
  - Base template: [customized/generic]
  - Domain-specific: [available/needed]
  - Quality: [comprehensive/basic]

✅ Examples: [Status]
  - INITIAL.md: [present/missing]
  - Sample PRPs: [X available]
  - Project-specific: [available/needed]

✅ Workflow: [operational/incomplete]
  - Creation process: [Status]
  - Execution capability: [Status]
  - Validation loops: [Status]
```

#### Integration Assessment
```
✅ Documentation Quality: [comprehensive/basic/missing]
  - CLAUDE.md completeness: [X/10]
  - Project-specific context: [adequate/insufficient]
  - Usage examples: [present/missing]

✅ Customization Level: [high/medium/low]
  - Generic vs project-specific: [ratio]
  - Domain knowledge integration: [Status]
  - Technology stack alignment: [Status]
```

## Action Items Generated

Based on analysis, provide specific action items:

### High Priority
- [ ] [Critical missing component]
- [ ] [Security/safety issue]
- [ ] [Broken functionality]

### Medium Priority  
- [ ] [Optimization opportunity]
- [ ] [Additional customization]
- [ ] [Documentation improvement]

### Low Priority
- [ ] [Enhancement suggestion]
- [ ] [Future consideration]
- [ ] [Nice-to-have addition]

## Quick Fixes Available

For common issues, provide immediate solutions:

```bash
# Missing hooks directory
mkdir -p .claude/hooks/logs

# Basic settings.json
cat > .claude/settings.json << 'EOF'
{
  "permissions": {"write": true, "execute": true, "read": true}
}
EOF

# Basic CLAUDE.md template
cat > CLAUDE.md << 'EOF'
# Project Guidance for Claude Code
[Add project-specific context here]
EOF
```

## Foundation Maturity Levels

**Level 1: Basic** (0-30 points)
- Minimal .claude directory
- No hooks or agents
- Generic documentation

**Level 2: Functional** (31-60 points)  
- Basic hooks implemented
- Some agent definitions
- Project-specific CLAUDE.md

**Level 3: Advanced** (61-85 points)
- Complete hook system
- Multiple specialized agents
- Comprehensive PRP framework

**Level 4: Optimized** (86-100 points)
- Fully customized for project
- Domain-specific expertise
- Proven validation workflows

This status check ensures your foundation supports sophisticated AI-assisted development with appropriate safety, automation, and specialized assistance.