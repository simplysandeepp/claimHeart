#!/usr/bin/env python3
"""
Script to create GitHub issues from markdown files
Usage: python create_issues.py
"""

import os
import re
import requests
from pathlib import Path

# Configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # Set this as environment variable
REPO_OWNER = "simplysandeepp"
REPO_NAME = "claimHeart"
ISSUES_DIR = Path(__file__).parent.parent / "issues"

# GitHub API endpoint
API_URL = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues"


def parse_issue_file(file_path):
    """Parse markdown file and extract issue details"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title (first # heading or from filename)
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if title_match:
        title = title_match.group(1).replace("GitHub Issue: ", "")
    else:
        title = file_path.stem.replace("-", " ").title()
    
    # Extract labels from content
    labels = []
    labels_match = re.search(r'## 🏷️ Labels to Add\s*\n\s*-\s*`(.+?)`', content, re.DOTALL)
    if labels_match:
        labels_text = labels_match.group(1)
        labels = [label.strip().strip('`') for label in re.findall(r'`([^`]+)`', labels_text)]
    
    # Clean up content (remove the "Copy and paste" instruction)
    body = re.sub(r'\*\*Copy and paste this into GitHub Issues:\*\*\s*\n\s*---\s*\n', '', content)
    body = re.sub(r'^#\s+GitHub Issue:.+\n', '', body)
    
    return {
        "title": title,
        "body": body.strip(),
        "labels": labels if labels else ["enhancement"]
    }


def create_github_issue(issue_data):
    """Create issue on GitHub using API"""
    if not GITHUB_TOKEN:
        print("❌ Error: GITHUB_TOKEN environment variable not set")
        print("Set it with: export GITHUB_TOKEN='your_token_here'")
        return None
    
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    response = requests.post(API_URL, json=issue_data, headers=headers)
    
    if response.status_code == 201:
        issue = response.json()
        return issue
    else:
        print(f"❌ Failed to create issue: {response.status_code}")
        print(f"Response: {response.text}")
        return None


def main():
    """Main function to process all issue files"""
    if not ISSUES_DIR.exists():
        print(f"❌ Issues directory not found: {ISSUES_DIR}")
        return
    
    issue_files = sorted(ISSUES_DIR.glob("*.md"))
    
    if not issue_files:
        print(f"❌ No issue files found in {ISSUES_DIR}")
        return
    
    print(f"📋 Found {len(issue_files)} issue(s) to create\n")
    
    created_count = 0
    failed_count = 0
    
    for issue_file in issue_files:
        print(f"Processing: {issue_file.name}")
        
        try:
            issue_data = parse_issue_file(issue_file)
            print(f"  Title: {issue_data['title']}")
            print(f"  Labels: {', '.join(issue_data['labels'])}")
            
            # Create issue
            issue = create_github_issue(issue_data)
            
            if issue:
                print(f"  ✅ Created: {issue['html_url']}\n")
                created_count += 1
            else:
                print(f"  ❌ Failed to create issue\n")
                failed_count += 1
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}\n")
            failed_count += 1
    
    print("=" * 60)
    print(f"✅ Successfully created: {created_count} issue(s)")
    print(f"❌ Failed: {failed_count} issue(s)")
    print("=" * 60)


if __name__ == "__main__":
    main()
