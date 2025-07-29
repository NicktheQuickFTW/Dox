#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

"""
DoX UserPromptSubmit Hook
Adds context and validates prompts for Big 12 policy operations
"""

import json
import sys
import re
from datetime import datetime
from pathlib import Path

def add_dox_context(prompt):
    """Add helpful DoX context when relevant keywords are detected."""
    context_triggers = {
        r'\b(policy|policies)\b': "Context: DoX manages 191 Big 12 Conference policies across 8 sports.",
        r'\b(manual|pdf)\b': "Context: DoX can generate PDF manuals using React PDF with Big 12 branding.",
        r'\b(search|find|query)\b': "Context: DoX uses PostgreSQL full-text search with GIN indexes.",
        r'\b(sport|sports)\b': "Context: Sports with policies: Baseball, Basketball (M/W), Soccer, Volleyball, Gymnastics, Tennis, Wrestling.",
        r'\b(mcp|server)\b': "Context: DoX MCP server has 18 tools for policy management (search, retrieve, generate PDFs).",
        r'\b(database|supabase)\b': "Context: DoX uses Supabase project vfzgnvcwakjxtdsaedfq with 'competition' schema.",
    }
    
    contexts = []
    for pattern, context in context_triggers.items():
        if re.search(pattern, prompt, re.IGNORECASE):
            contexts.append(context)
    
    return contexts

def validate_prompt_safety(prompt):
    """Check for potentially dangerous prompt patterns."""
    dangerous_patterns = [
        (r'delete\s+all\s+policies', "Bulk policy deletion requires explicit confirmation"),
        (r'drop\s+(?:table|database)', "Database schema modifications are restricted"),
        (r'truncate\s+', "Table truncation is not allowed"),
        (r'service[_\s]key', "Service key operations should use secure methods"),
        (r'production\s+database.*write', "Direct production writes should use MCP tools"),
    ]
    
    for pattern, message in dangerous_patterns:
        if re.search(pattern, prompt, re.IGNORECASE):
            return False, message
    
    return True, None

def enhance_prompt_with_prp(prompt):
    """Suggest using PRP for complex features."""
    complex_indicators = [
        r'build.*interface',
        r'create.*dashboard',
        r'implement.*feature',
        r'add.*functionality',
        r'design.*system',
    ]
    
    for pattern in complex_indicators:
        if re.search(pattern, prompt, re.IGNORECASE):
            return "\nConsider: For complex features, use `/generate-prp` to create a detailed implementation plan."
    
    return ""

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        prompt = input_data.get('prompt', '')
        session_id = input_data.get('session_id', '')
        timestamp = input_data.get('timestamp', datetime.now().isoformat())
        
        # Validate prompt safety
        is_safe, safety_message = validate_prompt_safety(prompt)
        if not is_safe:
            print(f"⚠️  Safety Warning: {safety_message}", file=sys.stderr)
            print("Please revise your request to be more specific and safe.", file=sys.stderr)
            sys.exit(2)  # Block the prompt
        
        # Add DoX-specific context
        contexts = add_dox_context(prompt)
        prp_suggestion = enhance_prompt_with_prp(prompt)
        
        # Log the prompt
        log_dir = Path.cwd() / '.claude' / 'hooks' / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'user_prompt_submit.json'
        
        # Read existing log or initialize
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except:
                    log_data = []
        else:
            log_data = []
        
        # Append new entry
        log_data.append({
            'timestamp': timestamp,
            'session_id': session_id,
            'prompt': prompt,
            'contexts_added': len(contexts),
            'prp_suggested': bool(prp_suggestion)
        })
        
        # Write log
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Output context to stdout (Claude will see this)
        if contexts or prp_suggestion:
            print("=== DoX Context ===")
            for context in contexts:
                print(f"• {context}")
            if prp_suggestion:
                print(prp_suggestion)
            print("==================")
        
        sys.exit(0)
        
    except Exception as e:
        # Log errors but don't block prompt
        sys.exit(0)

if __name__ == '__main__':
    main()