#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

"""
DoX PostToolUse Hook
Validates results and provides feedback after tool execution
"""

import json
import sys
from pathlib import Path
from datetime import datetime

def validate_policy_creation(tool_name, tool_response):
    """Validate newly created policies meet Big 12 standards."""
    if tool_name == 'mcp__dox-server__create_policy':
        policy = tool_response.get('policy', {})
        
        # Check required fields
        required_fields = ['policy_number', 'title', 'sport_id', 'category', 'content_text']
        missing_fields = [f for f in required_fields if not policy.get(f)]
        
        if missing_fields:
            return False, f"Policy missing required fields: {', '.join(missing_fields)}"
        
        # Validate policy number format
        policy_number = policy.get('policy_number', '')
        if not policy_number.match(r'^[A-Z]{2,4}-[A-Z]{3}-\d{3}$'):
            return False, f"Invalid policy number format: {policy_number}"
        
    return True, None

def check_manual_generation_success(tool_name, tool_response):
    """Verify PDF manual generation completed successfully."""
    if tool_name == 'mcp__dox-server__generate_manual':
        if 'error' in tool_response:
            return False, f"Manual generation failed: {tool_response['error']}"
        
        manual = tool_response.get('manual', {})
        if not manual.get('pdf_generated'):
            return False, "PDF generation incomplete"
            
    return True, None

def track_database_changes(tool_name, tool_input, tool_response):
    """Track all database modifications for audit trail."""
    modification_tools = [
        'mcp__dox-server__create_policy',
        'mcp__dox-server__update_policy',
        'mcp__dox-server__delete_policy',
        'mcp__dox-server__create_manual',
    ]
    
    if tool_name in modification_tools:
        audit_log = {
            'timestamp': datetime.now().isoformat(),
            'tool': tool_name,
            'input': tool_input,
            'result': 'success' if 'error' not in tool_response else 'failed',
            'details': tool_response.get('error') if 'error' in tool_response else None
        }
        
        # Write to audit log
        audit_path = Path.cwd() / '.claude' / 'hooks' / 'logs' / 'dox_audit.json'
        audit_path.parent.mkdir(parents=True, exist_ok=True)
        
        if audit_path.exists():
            with open(audit_path, 'r') as f:
                audit_data = json.load(f)
        else:
            audit_data = []
            
        audit_data.append(audit_log)
        
        with open(audit_path, 'w') as f:
            json.dump(audit_data, f, indent=2)

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        tool_response = input_data.get('tool_response', {})
        
        # Track database changes
        track_database_changes(tool_name, tool_input, tool_response)
        
        # Validate policy creation
        is_valid, message = validate_policy_creation(tool_name, tool_response)
        if not is_valid:
            output = {
                "decision": "block",
                "reason": f"Policy validation failed: {message}. Please fix and retry."
            }
            print(json.dumps(output))
            sys.exit(0)
        
        # Check manual generation
        is_valid, message = check_manual_generation_success(tool_name, tool_response)
        if not is_valid:
            output = {
                "decision": "block", 
                "reason": f"Manual generation issue: {message}. Check logs and retry."
            }
            print(json.dumps(output))
            sys.exit(0)
        
        # Log successful operations
        log_dir = Path.cwd() / '.claude' / 'hooks' / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'post_tool_use.json'
        
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
            'timestamp': input_data.get('timestamp'),
            'session_id': input_data.get('session_id'),
            'tool_name': tool_name,
            'status': 'success'
        })
        
        # Write log
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        sys.exit(0)
        
    except Exception:
        # Handle errors gracefully
        sys.exit(0)

if __name__ == '__main__':
    main()