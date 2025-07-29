# Copy Foundation from DoX

Copies the complete standardized foundation from the DoX project to a new project directory. This transfers all the Context Engineering, Claude Hooks & Agents, and PRP methodology components.

## Arguments: $TARGET_PATH

## Overview

This command copies the proven foundation from DoX (Big 12 Policy Management) to establish the same sophisticated AI development framework in a new project.

## What Gets Copied

### 1. Claude Configuration
```bash
# Copy complete .claude directory
cp -r .claude/ $TARGET_PATH/.claude/

# Includes:
# - Commands (generate-prp, execute-prp)
# - Hooks (safety and context)
# - Agents (specialized assistants)
# - Settings (permissions and configuration)
```

### 2. PRP Framework
```bash
# Copy PRP templates and structure
cp -r PRPs/templates/ $TARGET_PATH/PRPs/templates/
cp PRPs/README.md $TARGET_PATH/PRPs/
cp INITIAL.md $TARGET_PATH/
cp INITIAL_EXAMPLE.md $TARGET_PATH/
```

### 3. Documentation
```bash
# Copy base documentation
cp CLAUDE.md $TARGET_PATH/CLAUDE.md
```

## Execution Steps

1. **Validate Source**
   - Confirm DoX foundation is complete
   - Check all components are present
   - Verify no sensitive data in configs

2. **Prepare Target Directory**
   - Create target path if needed
   - Check for existing .claude directory
   - Backup existing configurations

3. **Copy Foundation Components**
   - Transfer .claude directory structure
   - Copy PRP templates and examples
   - Install base documentation

4. **Customize for New Project**
   - Update CLAUDE.md with new project details
   - Modify PRP templates for new domain
   - Adjust agent descriptions for context
   - Update hook validation patterns

5. **Initialize New Project Context**
   - Create project-specific INITIAL.md
   - Generate example PRP for new domain
   - Set up logging directories
   - Configure permissions

## Customization Process

After copying, customize these files:

### CLAUDE.md Updates
```markdown
# Update project overview
- Change from "DoX Policy Management" to new project
- Update database/architecture details
- Modify development commands
- Adjust technology stack references
```

### PRP Template Updates
```markdown
# In PRPs/templates/project_prp_base.md
- Update system architecture context
- Change database schema references  
- Modify technology patterns
- Adjust validation commands
```

### Hook Customizations
```python
# In .claude/hooks/pre_tool_use.py
- Update dangerous pattern detection
- Modify project-specific validations
- Adjust file protection rules
- Change audit logging context
```

### Agent Adjustments
```markdown
# Update agent descriptions
- Change domain context
- Modify tool requirements
- Adjust expertise areas
- Update output formats
```

## Usage Examples

### Copy to New Project
```
/copy-foundation /Users/username/new-project
```

### Copy and Analyze Existing Code
```
/copy-foundation /Users/username/existing-app --analyze-codebase
```

### Copy with Specific Domain
```
/copy-foundation /Users/username/ecommerce-app --domain retail
```

## Post-Copy Checklist

After copying foundation:

- [ ] Update CLAUDE.md project overview
- [ ] Customize PRP templates for new domain
- [ ] Modify hook validation patterns
- [ ] Update agent descriptions and tools
- [ ] Create project-specific INITIAL_EXAMPLE.md
- [ ] Test hook execution in new environment
- [ ] Verify agent availability
- [ ] Generate first example PRP
- [ ] Update .claude/settings.json permissions
- [ ] Initialize git repository if needed

## Validation Commands

Test the copied foundation:

```bash
# Test hook execution
echo '{"tool_name": "test", "tool_input": {}}' | uv run .claude/hooks/pre_tool_use.py

# Verify agents are accessible
ls .claude/agents/

# Test PRP template
cp PRPs/templates/project_prp_base.md PRPs/test-feature.md

# Check Claude commands
# In Claude: type / to see available commands
```

## Benefits

This foundation provides:

1. **Immediate Productivity** - Start with proven patterns
2. **Safety Guardrails** - Hooks prevent dangerous operations  
3. **Specialized Assistance** - Domain agents for complex tasks
4. **Structured Development** - PRP methodology for features
5. **Quality Assurance** - Validation loops and audit trails
6. **Consistent Standards** - Proven patterns across projects

The copied foundation enables sophisticated AI-assisted development from day one, with all the lessons learned and optimizations from the DoX project.