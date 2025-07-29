#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

"""
DoX Pre-Tool-Use Hook
Prevents dangerous operations on Big 12 Conference policy data
"""

import json
import sys
import re
from pathlib import Path

def is_dangerous_db_operation(tool_name, tool_input):
    """Check for potentially destructive database operations."""
    if tool_name == 'Bash':
        command = tool_input.get('command', '').lower()
        
        # Dangerous Supabase/PostgreSQL patterns
        dangerous_patterns = [
            r'drop\s+(?:table|database|schema)',  # DROP commands
            r'truncate\s+table',                   # TRUNCATE commands
            r'delete\s+from\s+.*where\s*1\s*=\s*1', # Delete all records
            r'delete\s+from\s+[^w]*$',            # Delete without WHERE
            r'update\s+.*set.*where\s*1\s*=\s*1',  # Update all records
            r'alter\s+table.*drop',               # Drop columns
            r'competition\.\*',                   # Wildcard on schema
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, command):
                return True
                
    # Check for dangerous MCP tool usage
    if tool_name.startswith('mcp__'):
        # Block bulk deletions via MCP
        if 'delete' in tool_name.lower() and 'policy_ids' in tool_input:
            policy_ids = tool_input.get('policy_ids', [])
            if len(policy_ids) > 10:  # Arbitrary limit for safety
                return True
                
    return False

def is_production_supabase_access(tool_input):
    """Check if trying to access production Supabase with service key."""
    command = tool_input.get('command', '')
    
    # Pattern to detect production Supabase URL with service key
    if 'vfzgnvcwakjxtdsaedfq.supabase.co' in command:
        if 'service_role' in command or 'SERVICE_KEY' in command:
            # Allow read operations but block writes
            write_patterns = [
                r'insert\s+into',
                r'update\s+',
                r'delete\s+from',
                r'create\s+',
                r'alter\s+',
                r'drop\s+',
            ]
            for pattern in write_patterns:
                if re.search(pattern, command.lower()):
                    return True
    return False

def validate_policy_format(tool_name, tool_input):
    """Validate policy number format for policy operations."""
    if tool_name in ['mcp__dox-server__create_policy', 'mcp__dox-server__update_policy']:
        policy_number = tool_input.get('policy_number', '')
        
        # Big 12 policy format: {SPORT}-{CATEGORY}-{NUMBER}
        if not re.match(r'^[A-Z]{2,4}-[A-Z]{3}-\d{3}$', policy_number):
            return False
    return True

def main():
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        
        # DoX-specific validations
        
        # 1. Check for dangerous database operations
        if is_dangerous_db_operation(tool_name, tool_input):
            print("BLOCKED: Dangerous database operation detected", file=sys.stderr)
            print("Use specific WHERE clauses and avoid bulk deletions", file=sys.stderr)
            sys.exit(2)
        
        # 2. Check for production Supabase write access
        if tool_name == 'Bash' and is_production_supabase_access(tool_input):
            print("BLOCKED: Direct production database writes are restricted", file=sys.stderr)
            print("Use MCP tools or application APIs for data modifications", file=sys.stderr)
            sys.exit(2)
        
        # 3. Validate policy format
        if not validate_policy_format(tool_name, tool_input):
            print("BLOCKED: Invalid policy number format", file=sys.stderr)
            print("Format must be: {SPORT}-{CATEGORY}-{NUMBER} (e.g., BSB-OFF-001)", file=sys.stderr)
            sys.exit(2)
        
        # 4. Block access to service keys
        if tool_name in ['Read', 'Edit', 'MultiEdit']:
            file_path = tool_input.get('file_path', '')
            if '.env' in file_path and 'SERVICE_KEY' in Path(file_path).read_text():
                print("BLOCKED: Access to service keys is restricted", file=sys.stderr)
                sys.exit(2)
        
        # Log all tool usage for audit trail
        log_dir = Path.cwd() / '.claude' / 'hooks' / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'pre_tool_use.json'
        
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
            'timestamp': input_data.get('timestamp'),
            'session_id': input_data.get('session_id'),
            'tool_name': tool_name,
            'tool_input': tool_input,
            'status': 'allowed'
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