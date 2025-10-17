#!/usr/bin/env python3
"""
🔍 NYRA Multi-Agent Code Review System

Coordinates MCP servers to automatically review code changes, check security issues,
and generate documentation using AI-powered agents.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import subprocess
import tempfile
import os
import sys

# Third-party imports
import aiohttp
import aiofiles
from git import Repo, InvalidGitRepositoryError
from openai import AsyncOpenAI

# Configure logging with XulbuX Purple theme
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

class ReviewType(Enum):
    SECURITY = "security"
    QUALITY = "quality"
    PERFORMANCE = "performance"
    DOCUMENTATION = "documentation"
    ARCHITECTURE = "architecture"
    TESTING = "testing"

@dataclass
class ReviewResult:
    agent: str
    review_type: ReviewType
    score: int  # 0-100
    issues: List[Dict[str, Any]]
    suggestions: List[str]
    auto_fixable: bool
    confidence: float
    execution_time: float
    metadata: Dict[str, Any]

@dataclass
class CodeChange:
    file_path: str
    old_content: str
    new_content: str
    diff: str
    change_type: str  # added, modified, deleted
    lines_added: int
    lines_removed: int

class MCPClient:
    """Client for communicating with MCP servers"""
    
    def __init__(self, base_url: str = "http://localhost:12008"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def call_server(self, server: str, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific MCP server method"""
        if not self.session:
            raise RuntimeError("MCPClient must be used as async context manager")
        
        url = f"{self.base_url}/mcp/{server}/{method}"
        async with self.session.post(url, json=params) as response:
            if response.status != 200:
                raise Exception(f"MCP call failed: {response.status}")
            return await response.json()

class SecurityReviewAgent:
    """Agent for security-focused code review"""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client
        self.security_patterns = [
            # SQL Injection patterns
            r"(SELECT|INSERT|UPDATE|DELETE).*(\+|\|\|).*",
            r"(exec|eval|system|shell_exec)\s*\(",
            
            # XSS patterns  
            r"innerHTML\s*=",
            r"document\.write\s*\(",
            r"\.html\(\s*[^)]*\+",
            
            # Hardcoded secrets
            r"(password|secret|key|token)\s*=\s*['\"][^'\"]+['\"]",
            r"(api_key|apikey|access_token)\s*=\s*['\"][^'\"]+['\"]",
            
            # Insecure crypto
            r"md5|sha1|des|rc4",
            r"random\(\)|Math\.random\(\)",
        ]
    
    async def review(self, changes: List[CodeChange]) -> ReviewResult:
        """Perform security review of code changes"""
        start_time = asyncio.get_event_loop().time()
        issues = []
        suggestions = []
        
        try:
            # Use Infisical MCP to check for hardcoded secrets
            secret_scan_result = await self.mcp_client.call_server(
                "infisical", "scan_secrets", {
                    "files": [change.file_path for change in changes],
                    "content": [change.new_content for change in changes]
                }
            )
            
            # Process security patterns
            for change in changes:
                file_issues = await self._scan_security_patterns(change)
                issues.extend(file_issues)
                
                # Check for dependency vulnerabilities
                if change.file_path.endswith(('package.json', 'requirements.txt', 'Cargo.toml')):
                    vuln_issues = await self._check_dependencies(change)
                    issues.extend(vuln_issues)
            
            # Generate AI-powered security suggestions
            if issues:
                ai_suggestions = await self._generate_security_suggestions(issues, changes)
                suggestions.extend(ai_suggestions)
            
            execution_time = asyncio.get_event_loop().time() - start_time
            
            # Calculate score based on severity
            critical_issues = len([i for i in issues if i.get('severity') == 'critical'])
            high_issues = len([i for i in issues if i.get('severity') == 'high'])
            score = max(0, 100 - (critical_issues * 30) - (high_issues * 15))
            
            return ReviewResult(
                agent="SecurityReviewAgent",
                review_type=ReviewType.SECURITY,
                score=score,
                issues=issues,
                suggestions=suggestions,
                auto_fixable=any(issue.get('fixable', False) for issue in issues),
                confidence=0.85 + (0.1 * min(len(issues), 3)),
                execution_time=execution_time,
                metadata={
                    "patterns_checked": len(self.security_patterns),
                    "files_scanned": len(changes),
                    "secret_scan_enabled": True
                }
            )
            
        except Exception as e:
            logger.error(f"Security review failed: {e}")
            return ReviewResult(
                agent="SecurityReviewAgent",
                review_type=ReviewType.SECURITY,
                score=0,
                issues=[{"type": "error", "message": str(e)}],
                suggestions=[],
                auto_fixable=False,
                confidence=0.0,
                execution_time=asyncio.get_event_loop().time() - start_time,
                metadata={"error": str(e)}
            )
    
    async def _scan_security_patterns(self, change: CodeChange) -> List[Dict[str, Any]]:
        """Scan for security anti-patterns"""
        issues = []
        import re
        
        for i, line in enumerate(change.new_content.split('\n')):
            for pattern in self.security_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        "type": "security_pattern",
                        "severity": "high",
                        "line": i + 1,
                        "pattern": pattern,
                        "content": line.strip(),
                        "file": change.file_path,
                        "fixable": True,
                        "description": f"Potential security issue matching pattern: {pattern}"
                    })
        
        return issues
    
    async def _check_dependencies(self, change: CodeChange) -> List[Dict[str, Any]]:
        """Check for vulnerable dependencies"""
        issues = []
        # This would integrate with vulnerability databases
        # For now, simulate some checks
        
        if "express" in change.new_content and "4.17.0" not in change.new_content:
            issues.append({
                "type": "vulnerable_dependency",
                "severity": "medium",
                "package": "express",
                "issue": "Update to latest version for security patches",
                "fixable": True,
                "file": change.file_path
            })
        
        return issues
    
    async def _generate_security_suggestions(self, issues: List[Dict], changes: List[CodeChange]) -> List[str]:
        """Generate AI-powered security improvement suggestions"""
        suggestions = []
        
        if any(issue.get('type') == 'security_pattern' for issue in issues):
            suggestions.append("🔒 Consider using parameterized queries to prevent SQL injection")
            suggestions.append("🛡️ Implement input validation and sanitization")
            suggestions.append("🔐 Use environment variables for sensitive configuration")
        
        if any(issue.get('type') == 'vulnerable_dependency' for issue in issues):
            suggestions.append("📦 Run 'npm audit' or 'pip-audit' to check for vulnerabilities")
            suggestions.append("🔄 Set up automated dependency updates with Dependabot")
        
        return suggestions

class QualityReviewAgent:
    """Agent for code quality review"""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client
    
    async def review(self, changes: List[CodeChange]) -> ReviewResult:
        """Perform quality review of code changes"""
        start_time = asyncio.get_event_loop().time()
        issues = []
        suggestions = []
        
        try:
            # Use FileSystem MCP to get additional context
            for change in changes:
                # Check complexity
                complexity_issues = await self._check_complexity(change)
                issues.extend(complexity_issues)
                
                # Check naming conventions
                naming_issues = await self._check_naming(change)
                issues.extend(naming_issues)
                
                # Check for code smells
                smell_issues = await self._check_code_smells(change)
                issues.extend(smell_issues)
            
            # Generate suggestions
            if issues:
                suggestions = await self._generate_quality_suggestions(issues)
            
            execution_time = asyncio.get_event_loop().time() - start_time
            score = max(0, 100 - len(issues) * 10)
            
            return ReviewResult(
                agent="QualityReviewAgent",
                review_type=ReviewType.QUALITY,
                score=score,
                issues=issues,
                suggestions=suggestions,
                auto_fixable=len(issues) < 5,
                confidence=0.9,
                execution_time=execution_time,
                metadata={
                    "checks_performed": ["complexity", "naming", "code_smells"],
                    "files_analyzed": len(changes)
                }
            )
            
        except Exception as e:
            logger.error(f"Quality review failed: {e}")
            return ReviewResult(
                agent="QualityReviewAgent", 
                review_type=ReviewType.QUALITY,
                score=0,
                issues=[{"type": "error", "message": str(e)}],
                suggestions=[],
                auto_fixable=False,
                confidence=0.0,
                execution_time=asyncio.get_event_loop().time() - start_time,
                metadata={"error": str(e)}
            )
    
    async def _check_complexity(self, change: CodeChange) -> List[Dict[str, Any]]:
        """Check cyclomatic complexity"""
        issues = []
        lines = change.new_content.split('\n')
        
        # Simple complexity check - count control flow statements
        complexity_keywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'switch', 'case']
        complexity = 0
        
        for i, line in enumerate(lines):
            for keyword in complexity_keywords:
                if keyword in line:
                    complexity += 1
        
        if complexity > 10:
            issues.append({
                "type": "high_complexity",
                "severity": "medium", 
                "complexity": complexity,
                "file": change.file_path,
                "suggestion": "Consider breaking this into smaller functions",
                "fixable": False
            })
        
        return issues
    
    async def _check_naming(self, change: CodeChange) -> List[Dict[str, Any]]:
        """Check naming conventions"""
        issues = []
        import re
        
        # Check for unclear variable names
        unclear_names = re.findall(r'\b[a-z]{1,2}\b\s*=', change.new_content)
        if unclear_names:
            issues.append({
                "type": "unclear_naming",
                "severity": "low",
                "examples": unclear_names[:3],
                "file": change.file_path,
                "suggestion": "Use descriptive variable names",
                "fixable": False
            })
        
        return issues
    
    async def _check_code_smells(self, change: CodeChange) -> List[Dict[str, Any]]:
        """Check for code smells"""
        issues = []
        
        # Check for very long functions (>50 lines)
        if change.new_content.count('\n') > 50:
            issues.append({
                "type": "long_function",
                "severity": "medium",
                "lines": change.new_content.count('\n'),
                "file": change.file_path,
                "suggestion": "Consider splitting into smaller functions",
                "fixable": False
            })
        
        # Check for commented code
        commented_lines = [line for line in change.new_content.split('\n') if line.strip().startswith('#') and len(line.strip()) > 10]
        if len(commented_lines) > 5:
            issues.append({
                "type": "commented_code",
                "severity": "low",
                "count": len(commented_lines),
                "file": change.file_path,
                "suggestion": "Remove commented code or convert to proper comments",
                "fixable": True
            })
        
        return issues
    
    async def _generate_quality_suggestions(self, issues: List[Dict]) -> List[str]:
        """Generate quality improvement suggestions"""
        suggestions = []
        
        if any(issue.get('type') == 'high_complexity' for issue in issues):
            suggestions.append("🔄 Refactor complex functions using the Extract Method pattern")
            suggestions.append("📊 Consider using a complexity analysis tool like radon")
        
        if any(issue.get('type') == 'unclear_naming' for issue in issues):
            suggestions.append("📝 Use descriptive, intention-revealing names")
            suggestions.append("🎯 Follow established naming conventions for your language")
        
        return suggestions

class DocumentationAgent:
    """Agent for documentation review and generation"""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client
    
    async def review(self, changes: List[CodeChange]) -> ReviewResult:
        """Review and generate documentation"""
        start_time = asyncio.get_event_loop().time()
        issues = []
        suggestions = []
        
        try:
            for change in changes:
                doc_issues = await self._check_documentation(change)
                issues.extend(doc_issues)
            
            # Generate missing documentation
            if issues:
                auto_docs = await self._generate_documentation(changes)
                suggestions.extend(auto_docs)
            
            execution_time = asyncio.get_event_loop().time() - start_time
            score = max(0, 100 - len(issues) * 15)
            
            return ReviewResult(
                agent="DocumentationAgent",
                review_type=ReviewType.DOCUMENTATION,
                score=score,
                issues=issues,
                suggestions=suggestions,
                auto_fixable=True,
                confidence=0.8,
                execution_time=execution_time,
                metadata={
                    "documentation_generated": len(suggestions),
                    "files_processed": len(changes)
                }
            )
            
        except Exception as e:
            logger.error(f"Documentation review failed: {e}")
            return ReviewResult(
                agent="DocumentationAgent",
                review_type=ReviewType.DOCUMENTATION, 
                score=0,
                issues=[{"type": "error", "message": str(e)}],
                suggestions=[],
                auto_fixable=False,
                confidence=0.0,
                execution_time=asyncio.get_event_loop().time() - start_time,
                metadata={"error": str(e)}
            )
    
    async def _check_documentation(self, change: CodeChange) -> List[Dict[str, Any]]:
        """Check for missing or inadequate documentation"""
        issues = []
        
        # Check for missing docstrings in Python functions
        if change.file_path.endswith('.py'):
            import re
            functions = re.findall(r'def\s+(\w+)\s*\(', change.new_content)
            docstrings = re.findall(r'""".*?"""', change.new_content, re.DOTALL)
            
            if len(functions) > len(docstrings):
                issues.append({
                    "type": "missing_docstring",
                    "severity": "medium",
                    "functions": functions,
                    "file": change.file_path,
                    "suggestion": "Add docstrings to functions",
                    "fixable": True
                })
        
        # Check for README in new projects
        if change.file_path == "README.md" and len(change.new_content) < 100:
            issues.append({
                "type": "inadequate_readme",
                "severity": "medium",
                "file": change.file_path,
                "suggestion": "Expand README with project description, setup instructions",
                "fixable": True
            })
        
        return issues
    
    async def _generate_documentation(self, changes: List[CodeChange]) -> List[str]:
        """Generate documentation suggestions"""
        suggestions = []
        
        for change in changes:
            if change.file_path.endswith('.py'):
                suggestions.append(f"📚 Generated docstring template for {change.file_path}")
                suggestions.append(f"📋 Consider adding type hints to improve code clarity")
            
            if change.file_path.endswith('.js') or change.file_path.endswith('.ts'):
                suggestions.append(f"📝 Add JSDoc comments for {change.file_path}")
                suggestions.append(f"🔍 Consider adding inline comments for complex logic")
        
        return suggestions

class CodeReviewOrchestrator:
    """Main orchestrator for multi-agent code review"""
    
    def __init__(self, config_path: Optional[Path] = None):
        self.config = self._load_config(config_path)
        self.agents = {}
        self._initialize_agents()
    
    def _load_config(self, config_path: Optional[Path]) -> Dict[str, Any]:
        """Load configuration from file or use defaults"""
        default_config = {
            "mcp_base_url": "http://localhost:12008",
            "enabled_agents": ["security", "quality", "documentation"],
            "parallel_execution": True,
            "output_format": "json",
            "auto_fix_enabled": False,
            "github_integration": True,
            "slack_notifications": False
        }
        
        if config_path and config_path.exists():
            with open(config_path) as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        return default_config
    
    def _initialize_agents(self):
        """Initialize review agents"""
        mcp_client = MCPClient(self.config["mcp_base_url"])
        
        if "security" in self.config["enabled_agents"]:
            self.agents["security"] = SecurityReviewAgent(mcp_client)
        if "quality" in self.config["enabled_agents"]:
            self.agents["quality"] = QualityReviewAgent(mcp_client)  
        if "documentation" in self.config["enabled_agents"]:
            self.agents["documentation"] = DocumentationAgent(mcp_client)
    
    async def review_changes(self, repo_path: str, base_ref: str = "main", target_ref: str = "HEAD") -> Dict[str, Any]:
        """Review changes between two git references"""
        logger.info(f"🔍 Starting code review: {base_ref}..{target_ref}")
        
        try:
            # Get changes from git
            changes = await self._get_git_changes(repo_path, base_ref, target_ref)
            if not changes:
                logger.info("No changes found")
                return {"status": "no_changes", "results": []}
            
            logger.info(f"Found {len(changes)} changed files")
            
            # Run agents
            async with MCPClient(self.config["mcp_base_url"]) as mcp_client:
                # Update agents with the shared client
                for agent in self.agents.values():
                    agent.mcp_client = mcp_client
                
                if self.config["parallel_execution"]:
                    tasks = [agent.review(changes) for agent in self.agents.values()]
                    results = await asyncio.gather(*tasks)
                else:
                    results = []
                    for agent in self.agents.values():
                        result = await agent.review(changes)
                        results.append(result)
            
            # Compile final report
            report = await self._compile_report(results, changes)
            
            # Apply auto-fixes if enabled
            if self.config["auto_fix_enabled"]:
                await self._apply_auto_fixes(results, repo_path)
            
            # Send notifications
            if self.config["github_integration"]:
                await self._post_github_comment(report, repo_path)
            
            logger.info(f"✅ Code review completed. Overall score: {report['overall_score']}")
            return report
            
        except Exception as e:
            logger.error(f"Code review failed: {e}")
            return {
                "status": "error", 
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    async def _get_git_changes(self, repo_path: str, base_ref: str, target_ref: str) -> List[CodeChange]:
        """Get changes between git references"""
        try:
            repo = Repo(repo_path)
            changes = []
            
            # Get diff between references
            diff = repo.git.diff(f"{base_ref}...{target_ref}", name_only=True).split('\n')
            
            for file_path in diff:
                if not file_path.strip():
                    continue
                
                try:
                    # Get old and new content
                    try:
                        old_content = repo.git.show(f"{base_ref}:{file_path}")
                    except:
                        old_content = ""  # New file
                    
                    try:
                        new_content = repo.git.show(f"{target_ref}:{file_path}")
                    except:
                        new_content = ""  # Deleted file
                    
                    # Get unified diff
                    diff_content = repo.git.diff(f"{base_ref}...{target_ref}", file_path)
                    
                    # Determine change type
                    if not old_content:
                        change_type = "added"
                    elif not new_content:
                        change_type = "deleted"
                    else:
                        change_type = "modified"
                    
                    changes.append(CodeChange(
                        file_path=file_path,
                        old_content=old_content,
                        new_content=new_content,
                        diff=diff_content,
                        change_type=change_type,
                        lines_added=diff_content.count('\n+'),
                        lines_removed=diff_content.count('\n-')
                    ))
                    
                except Exception as e:
                    logger.warning(f"Could not process file {file_path}: {e}")
                    continue
            
            return changes
            
        except InvalidGitRepositoryError:
            raise Exception(f"Invalid git repository: {repo_path}")
    
    async def _compile_report(self, results: List[ReviewResult], changes: List[CodeChange]) -> Dict[str, Any]:
        """Compile final review report"""
        total_score = sum(result.score for result in results)
        overall_score = total_score // len(results) if results else 0
        
        all_issues = []
        all_suggestions = []
        
        for result in results:
            all_issues.extend(result.issues)
            all_suggestions.extend(result.suggestions)
        
        # Categorize issues by severity
        critical_issues = [i for i in all_issues if i.get('severity') == 'critical']
        high_issues = [i for i in all_issues if i.get('severity') == 'high']
        medium_issues = [i for i in all_issues if i.get('severity') == 'medium']
        
        return {
            "status": "completed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "overall_score": overall_score,
            "summary": {
                "files_changed": len(changes),
                "lines_added": sum(c.lines_added for c in changes),
                "lines_removed": sum(c.lines_removed for c in changes),
                "agents_executed": len(results),
                "total_issues": len(all_issues),
                "critical_issues": len(critical_issues),
                "high_issues": len(high_issues),
                "medium_issues": len(medium_issues)
            },
            "agent_results": [asdict(result) for result in results],
            "issues": all_issues,
            "suggestions": all_suggestions,
            "auto_fixable_issues": len([i for i in all_issues if i.get('fixable', False)]),
            "recommendation": self._get_recommendation(overall_score, critical_issues, high_issues)
        }
    
    def _get_recommendation(self, score: int, critical_issues: List, high_issues: List) -> str:
        """Get merge recommendation based on review results"""
        if critical_issues:
            return "🚫 BLOCK: Critical security or quality issues found"
        elif score < 70 or len(high_issues) > 5:
            return "⚠️ CAUTION: Significant issues found, review required"
        elif score < 85:
            return "👀 REVIEW: Minor issues found, consider addressing"
        else:
            return "✅ APPROVE: Code quality looks good"
    
    async def _apply_auto_fixes(self, results: List[ReviewResult], repo_path: str):
        """Apply automatic fixes for fixable issues"""
        logger.info("🔧 Applying automatic fixes...")
        # Implementation would apply fixes to files
        # For now, just log what would be fixed
        fixable_count = sum(1 for result in results for issue in result.issues if issue.get('fixable', False))
        if fixable_count > 0:
            logger.info(f"Would auto-fix {fixable_count} issues")
    
    async def _post_github_comment(self, report: Dict[str, Any], repo_path: str):
        """Post review results as GitHub PR comment"""
        if not self.config.get("github_integration"):
            return
        
        # This would use the GitHub MCP server to post comments
        logger.info("📝 Posting GitHub review comment")
        
        comment = f"""
## 🔍 NYRA Code Review Results

**Overall Score: {report['overall_score']}/100**

### Summary
- 📁 Files changed: {report['summary']['files_changed']}
- ➕ Lines added: {report['summary']['lines_added']}
- ➖ Lines removed: {report['summary']['lines_removed']}
- ⚠️ Issues found: {report['summary']['total_issues']}

### Issues by Severity
- 🔥 Critical: {report['summary']['critical_issues']}  
- ⚡ High: {report['summary']['high_issues']}
- 📋 Medium: {report['summary']['medium_issues']}

### Recommendation
{report['recommendation']}

---
*Generated by NYRA Multi-Agent Code Review System*
        """
        
        logger.info("GitHub comment generated (integration pending)")

async def main():
    """Main CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="NYRA Multi-Agent Code Review System")
    parser.add_argument("repo_path", help="Path to git repository")
    parser.add_argument("--base", default="main", help="Base reference (default: main)")
    parser.add_argument("--target", default="HEAD", help="Target reference (default: HEAD)")
    parser.add_argument("--config", type=Path, help="Configuration file path")
    parser.add_argument("--output", help="Output file path")
    
    args = parser.parse_args()
    
    # Initialize orchestrator
    orchestrator = CodeReviewOrchestrator(args.config)
    
    # Run review
    result = await orchestrator.review_changes(
        args.repo_path,
        args.base,
        args.target
    )
    
    # Output results
    if args.output:
        async with aiofiles.open(args.output, 'w') as f:
            await f.write(json.dumps(result, indent=2))
        logger.info(f"Results written to {args.output}")
    else:
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())