#!/bin/bash

# E2E Test Runner Script
# Usage: ./run-tests.sh [options]

set -e

# Default values
TEST_SUITE="all"
BROWSER="chromium"
HEADLESS="true"
PARALLEL="false"
UPDATE_SNAPSHOTS="false"
VERBOSE="false"
DOCKER="false"
CI="false"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${!1}%s${NC}\n" "$2"
}

# Function to print usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

E2E Test Runner for Speech Processing Application

OPTIONS:
    -s, --suite SUITE           Test suite to run (default: all)
                               Options: all, auth, navigation, tts, voice-cloning, 
                                       visual, accessibility, performance, cross-browser
    -b, --browser BROWSER       Browser to use (default: chromium)
                               Options: chromium, firefox, webkit, all
    -h, --headless             Run in headless mode (default: true)
    --headed                   Run in headed mode
    -p, --parallel             Run tests in parallel
    -u, --update-snapshots     Update visual test snapshots
    -v, --verbose              Verbose output
    -d, --docker               Run tests in Docker
    -c, --ci                   CI mode (optimized for CI environments)
    --help                     Show this help message

EXAMPLES:
    $0                         # Run all tests
    $0 -s auth                 # Run only authentication tests
    $0 -s visual -u            # Run visual tests and update snapshots
    $0 -b firefox --headed     # Run in Firefox with GUI
    $0 -p -v                   # Run in parallel with verbose output
    $0 --ci                    # Run in CI mode

ENVIRONMENT VARIABLES:
    FRONTEND_URL               Frontend server URL (default: http://localhost:3000)
    BACKEND_URL                Backend server URL (default: http://localhost:8000)
    MOBILE_URL                 Mobile server URL (default: http://localhost:19006)
    TEST_TIMEOUT               Test timeout in ms (default: 60000)
    SLOWMO                     Slow motion delay in ms (default: 0)
    DEVTOOLS                   Open browser devtools (default: false)

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--suite)
            TEST_SUITE="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--headless)
            HEADLESS="true"
            shift
            ;;
        --headed)
            HEADLESS="false"
            shift
            ;;
        -p|--parallel)
            PARALLEL="true"
            shift
            ;;
        -u|--update-snapshots)
            UPDATE_SNAPSHOTS="true"
            shift
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift
            ;;
        -d|--docker)
            DOCKER="true"
            shift
            ;;
        -c|--ci)
            CI="true"
            HEADLESS="true"
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            usage
            exit 1
            ;;
    esac
done

# Set CI-specific optimizations
if [[ "$CI" == "true" ]]; then
    export CI=true
    export NODE_ENV=test
    HEADLESS="true"
    print_color "CYAN" "🤖 Running in CI mode"
fi

# Export environment variables
export HEADLESS
export UPDATE_SNAPSHOTS
export TEST_SUITE
export BROWSER

# Print configuration
print_color "WHITE" "🧪 E2E Test Configuration"
print_color "WHITE" "=========================="
echo "Test Suite: $TEST_SUITE"
echo "Browser: $BROWSER"
echo "Headless: $HEADLESS"
echo "Parallel: $PARALLEL"
echo "Update Snapshots: $UPDATE_SNAPSHOTS"
echo "Verbose: $VERBOSE"
echo "Docker: $DOCKER"
echo "CI Mode: $CI"
echo ""

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_color "RED" "❌ Error: package.json not found. Please run this script from the e2e-tests directory."
    exit 1
fi

# Function to check if servers are running
check_servers() {
    print_color "YELLOW" "🔍 Checking server availability..."
    
    if [[ "$DOCKER" == "true" ]]; then
        # Use Docker compose to start services
        print_color "BLUE" "🐳 Starting services with Docker..."
        docker-compose -f ../docker-compose.yml up -d
        sleep 10
    fi
    
    node scripts/check-servers.js --wait --health
    
    if [[ $? -ne 0 ]]; then
        print_color "RED" "❌ Servers are not ready. Please start the required services:"
        print_color "YELLOW" "Frontend: cd ../frontend && npm run dev"
        print_color "YELLOW" "Backend: cd ../backend && npm run dev"
        print_color "YELLOW" "Mobile: cd ../mobile && npm run web"
        exit 1
    fi
    
    print_color "GREEN" "✅ All required servers are ready!"
}

# Function to install dependencies
install_dependencies() {
    print_color "YELLOW" "📦 Installing dependencies..."
    
    if [[ ! -d "node_modules" ]] || [[ "$CI" == "true" ]]; then
        npm ci
    else
        npm install
    fi
    
    print_color "GREEN" "✅ Dependencies installed!"
}

# Function to run specific test suite
run_test_suite() {
    local suite=$1
    local test_files=""
    
    case $suite in
        "auth")
            test_files="tests/frontend/auth.test.ts"
            ;;
        "navigation")
            test_files="tests/frontend/navigation.test.ts"
            ;;
        "tts")
            test_files="tests/frontend/tts-workflow.test.ts"
            ;;
        "voice-cloning")
            test_files="tests/frontend/voice-cloning-workflow.test.ts"
            ;;
        "visual")
            test_files="tests/visual/visual-regression.test.ts"
            ;;
        "accessibility")
            test_files="tests/accessibility/accessibility.test.ts"
            ;;
        "performance")
            test_files="tests/performance/performance.test.ts"
            ;;
        "cross-browser")
            test_files="tests/cross-browser/cross-browser.test.ts"
            ;;
        "all")
            test_files="tests/"
            ;;
        *)
            print_color "RED" "❌ Unknown test suite: $suite"
            exit 1
            ;;
    esac
    
    local jest_args=""
    
    if [[ "$PARALLEL" == "true" ]]; then
        jest_args="--maxWorkers=4"
    else
        jest_args="--runInBand"
    fi
    
    if [[ "$VERBOSE" == "true" ]]; then
        jest_args="$jest_args --verbose"
    fi
    
    if [[ "$CI" == "true" ]]; then
        jest_args="$jest_args --ci --coverage --watchAll=false"
    fi
    
    print_color "BLUE" "🏃 Running $suite tests..."
    
    # Run the tests
    npm test -- $test_files $jest_args
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        print_color "GREEN" "✅ $suite tests passed!"
    else
        print_color "RED" "❌ $suite tests failed!"
        return $exit_code
    fi
}

# Function to run tests in Docker
run_docker_tests() {
    print_color "BLUE" "🐳 Running tests in Docker..."
    
    # Build Docker image for E2E tests
    docker build -t speech-app-e2e .
    
    # Run tests in container
    docker run --rm \
        -v $(pwd)/reports:/app/reports \
        -v $(pwd)/screenshots:/app/screenshots \
        -e HEADLESS=$HEADLESS \
        -e TEST_SUITE=$TEST_SUITE \
        -e BROWSER=$BROWSER \
        -e UPDATE_SNAPSHOTS=$UPDATE_SNAPSHOTS \
        --network="host" \
        speech-app-e2e
}

# Function to generate test report
generate_report() {
    print_color "YELLOW" "📊 Generating test report..."
    
    local report_file="reports/test-summary.md"
    mkdir -p reports
    
    cat > "$report_file" << EOF
# E2E Test Report

**Generated:** $(date)
**Test Suite:** $TEST_SUITE
**Browser:** $BROWSER
**Headless:** $HEADLESS

## Configuration
- Parallel: $PARALLEL
- Update Snapshots: $UPDATE_SNAPSHOTS
- CI Mode: $CI

## Test Results
EOF

    if [[ -f "reports/jest-results.json" ]]; then
        echo "See jest-results.json for detailed results" >> "$report_file"
    fi
    
    if [[ -d "screenshots" ]]; then
        echo -e "\n## Screenshots\nTest screenshots available in ./screenshots directory" >> "$report_file"
    fi
    
    print_color "GREEN" "✅ Test report generated: $report_file"
}

# Function to cleanup
cleanup() {
    print_color "YELLOW" "🧹 Cleaning up..."
    
    if [[ "$DOCKER" == "true" ]]; then
        docker-compose -f ../docker-compose.yml down
    fi
    
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    print_color "GREEN" "✅ Cleanup completed!"
}

# Set up trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    print_color "CYAN" "🚀 Starting E2E tests..."
    
    # Install dependencies
    install_dependencies
    
    # Check servers (unless running in Docker)
    if [[ "$DOCKER" != "true" ]]; then
        check_servers
    fi
    
    # Create required directories
    mkdir -p reports screenshots screenshots/failures screenshots/snapshots screenshots/diffs
    
    # Run tests
    if [[ "$DOCKER" == "true" ]]; then
        run_docker_tests
    else
        if [[ "$BROWSER" == "all" ]]; then
            # Run tests on all browsers
            for browser in chromium firefox webkit; do
                print_color "MAGENTA" "🌐 Testing with $browser..."
                export BROWSER=$browser
                run_test_suite "$TEST_SUITE" || true
            done
        else
            run_test_suite "$TEST_SUITE"
        fi
    fi
    
    # Generate report
    generate_report
    
    print_color "GREEN" "🎉 E2E tests completed!"
}

# Run main function
main "$@"