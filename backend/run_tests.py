#!/usr/bin/env python3
"""
Comprehensive test runner for the Speech App
Provides easy access to different test categories and reporting options
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
from typing import List, Optional


class TestRunner:
    """Main test runner class"""
    
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.tests_dir = self.backend_dir / "tests"
        
    def run_command(self, cmd: List[str], capture_output: bool = False) -> subprocess.CompletedProcess:
        """Run a command with proper error handling"""
        try:
            if capture_output:
                result = subprocess.run(cmd, cwd=self.backend_dir, capture_output=True, text=True)
            else:
                result = subprocess.run(cmd, cwd=self.backend_dir)
            return result
        except FileNotFoundError:
            print(f"Error: Command not found: {cmd[0]}")
            print("Make sure pytest is installed: pip install -r test-requirements.txt")
            sys.exit(1)
    
    def install_dependencies(self):
        """Install test dependencies"""
        print("Installing test dependencies...")
        requirements_file = self.backend_dir / "test-requirements.txt"
        
        if not requirements_file.exists():
            print(f"Error: {requirements_file} not found")
            return False
        
        cmd = [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)]
        result = self.run_command(cmd)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print("❌ Failed to install dependencies")
            return False
    
    def run_unit_tests(self, verbose: bool = False, coverage: bool = False):
        """Run unit tests"""
        print("🧪 Running unit tests...")
        
        cmd = ["pytest", "-m", "unit"]
        if verbose:
            cmd.append("-v")
        if coverage:
            cmd.extend(["--cov=app", "--cov-report=term-missing"])
        
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def run_integration_tests(self, verbose: bool = False):
        """Run integration tests"""
        print("🔗 Running integration tests...")
        
        cmd = ["pytest", "-m", "integration"]
        if verbose:
            cmd.append("-v")
        
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def run_performance_tests(self, benchmark: bool = False):
        """Run performance tests"""
        print("⚡ Running performance tests...")
        
        cmd = ["pytest", "-m", "performance"]
        if benchmark:
            cmd.extend(["--benchmark-only", "--benchmark-sort=mean"])
        
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def run_security_tests(self, verbose: bool = False):
        """Run security tests"""
        print("🔒 Running security tests...")
        
        cmd = ["pytest", "-m", "security"]
        if verbose:
            cmd.append("-v")
        
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def run_e2e_tests(self, verbose: bool = False):
        """Run end-to-end tests"""
        print("🌍 Running end-to-end tests...")
        
        cmd = ["pytest", "-m", "e2e"]
        if verbose:
            cmd.append("-v")
        
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def run_all_tests(self, verbose: bool = False, coverage: bool = False):
        """Run all tests"""
        print("🚀 Running complete test suite...")
        
        cmd = ["pytest"]
        if verbose:
            cmd.append("-v")
        if coverage:
            cmd.extend([
                "--cov=app", 
                "--cov-report=html:htmlcov",
                "--cov-report=term-missing",
                "--cov-report=xml:coverage.xml"
            ])
        
        result = self.run_command(cmd)
        
        if coverage and result.returncode == 0:
            print("\n📊 Coverage report generated:")
            print(f"  - HTML: {self.backend_dir}/htmlcov/index.html")
            print(f"  - XML: {self.backend_dir}/coverage.xml")
        
        return result.returncode == 0
    
    def run_fast_tests(self):
        """Run only fast tests (exclude slow markers)"""
        print("⚡ Running fast tests only...")
        
        cmd = ["pytest", "-m", "not slow", "-v"]
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def run_specific_test(self, test_path: str, verbose: bool = False):
        """Run a specific test file or function"""
        print(f"🎯 Running specific test: {test_path}")
        
        cmd = ["pytest", test_path]
        if verbose:
            cmd.append("-v")
        
        result = self.run_command(cmd)
        return result.returncode == 0
    
    def generate_coverage_report(self):
        """Generate comprehensive coverage report"""
        print("📊 Generating coverage report...")
        
        cmd = [
            "pytest", 
            "--cov=app",
            "--cov-branch",
            "--cov-report=html:htmlcov",
            "--cov-report=term-missing",
            "--cov-report=xml:coverage.xml",
            "--cov-fail-under=85"
        ]
        
        result = self.run_command(cmd)
        
        if result.returncode == 0:
            print("✅ Coverage report generated successfully:")
            print(f"  - HTML Report: {self.backend_dir}/htmlcov/index.html")
            print(f"  - XML Report: {self.backend_dir}/coverage.xml")
            print("\nOpen the HTML report in your browser to view detailed coverage.")
        else:
            print("❌ Coverage report generation failed or coverage below threshold")
        
        return result.returncode == 0
    
    def run_linting(self):
        """Run code linting and formatting checks"""
        print("🧹 Running linting checks...")
        
        # Check if black is available
        black_result = self.run_command(["black", "--check", "--diff", "app/"], capture_output=True)
        
        if black_result.returncode != 0:
            print("⚠️  Code formatting issues found. Run 'black app/' to fix.")
        else:
            print("✅ Code formatting looks good")
        
        # Check if flake8 is available  
        flake8_result = self.run_command(["flake8", "app/"], capture_output=True)
        
        if flake8_result.returncode != 0:
            print("⚠️  Linting issues found:")
            print(flake8_result.stdout)
        else:
            print("✅ No linting issues found")
        
        return black_result.returncode == 0 and flake8_result.returncode == 0
    
    def run_type_checking(self):
        """Run type checking with mypy"""
        print("🔍 Running type checking...")
        
        cmd = ["mypy", "app/", "--ignore-missing-imports"]
        result = self.run_command(cmd, capture_output=True)
        
        if result.returncode == 0:
            print("✅ No type checking issues found")
        else:
            print("⚠️  Type checking issues found:")
            print(result.stdout)
        
        return result.returncode == 0
    
    def run_quality_checks(self):
        """Run all quality checks (linting, type checking, tests)"""
        print("🏆 Running comprehensive quality checks...\n")
        
        results = []
        
        # Linting
        results.append(("Linting", self.run_linting()))
        
        # Type checking  
        results.append(("Type Checking", self.run_type_checking()))
        
        # Fast tests
        results.append(("Fast Tests", self.run_fast_tests()))
        
        # Security tests
        results.append(("Security Tests", self.run_security_tests()))
        
        # Print summary
        print("\n" + "="*50)
        print("QUALITY CHECK SUMMARY")
        print("="*50)
        
        all_passed = True
        for check_name, passed in results:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{check_name:20} {status}")
            if not passed:
                all_passed = False
        
        print("="*50)
        if all_passed:
            print("🎉 All quality checks passed!")
        else:
            print("💥 Some quality checks failed. Please review and fix.")
        
        return all_passed


def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(
        description="Speech App Test Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_tests.py --all --coverage    # Run all tests with coverage
  python run_tests.py --unit --verbose    # Run unit tests with verbose output
  python run_tests.py --performance       # Run performance tests
  python run_tests.py --fast              # Run only fast tests
  python run_tests.py --quality           # Run quality checks
  python run_tests.py --install           # Install test dependencies
        """
    )
    
    # Test categories
    parser.add_argument("--all", action="store_true", help="Run all tests")
    parser.add_argument("--unit", action="store_true", help="Run unit tests")
    parser.add_argument("--integration", action="store_true", help="Run integration tests")
    parser.add_argument("--performance", action="store_true", help="Run performance tests")
    parser.add_argument("--security", action="store_true", help="Run security tests")
    parser.add_argument("--e2e", action="store_true", help="Run end-to-end tests")
    parser.add_argument("--fast", action="store_true", help="Run fast tests only")
    
    # Options
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--coverage", "-c", action="store_true", help="Generate coverage report")
    parser.add_argument("--benchmark", "-b", action="store_true", help="Run benchmarks")
    
    # Utilities
    parser.add_argument("--install", action="store_true", help="Install test dependencies")
    parser.add_argument("--coverage-report", action="store_true", help="Generate coverage report")
    parser.add_argument("--quality", action="store_true", help="Run quality checks")
    parser.add_argument("--lint", action="store_true", help="Run linting checks")
    parser.add_argument("--type-check", action="store_true", help="Run type checking")
    
    # Specific tests
    parser.add_argument("--test", "-t", help="Run specific test file or function")
    
    args = parser.parse_args()
    
    runner = TestRunner()
    
    # Handle specific operations first
    if args.install:
        success = runner.install_dependencies()
        sys.exit(0 if success else 1)
    
    if args.coverage_report:
        success = runner.generate_coverage_report()
        sys.exit(0 if success else 1)
    
    if args.quality:
        success = runner.run_quality_checks()
        sys.exit(0 if success else 1)
    
    if args.lint:
        success = runner.run_linting()
        sys.exit(0 if success else 1)
    
    if args.type_check:
        success = runner.run_type_checking()
        sys.exit(0 if success else 1)
    
    if args.test:
        success = runner.run_specific_test(args.test, args.verbose)
        sys.exit(0 if success else 1)
    
    # Handle test categories
    success = True
    
    if args.all:
        success = runner.run_all_tests(args.verbose, args.coverage)
    elif args.unit:
        success = runner.run_unit_tests(args.verbose, args.coverage)
    elif args.integration:
        success = runner.run_integration_tests(args.verbose)
    elif args.performance:
        success = runner.run_performance_tests(args.benchmark)
    elif args.security:
        success = runner.run_security_tests(args.verbose)
    elif args.e2e:
        success = runner.run_e2e_tests(args.verbose)
    elif args.fast:
        success = runner.run_fast_tests()
    else:
        # No specific category chosen, show help
        parser.print_help()
        print("\n💡 Tip: Start with 'python run_tests.py --install' to install dependencies")
        print("Then try 'python run_tests.py --fast' for a quick test run")
        sys.exit(0)
    
    print("\n" + "="*50)
    if success:
        print("✅ Tests completed successfully!")
    else:
        print("❌ Some tests failed. Check the output above for details.")
    print("="*50)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()