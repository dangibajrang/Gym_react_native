#!/bin/bash

# GymApp Setup Script
# This script will help you set up the complete GymApp project

set -e

echo "🏋️‍♂️ Welcome to GymApp Setup!"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js $(node --version) is installed"
}

# Check if MongoDB is installed
check_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community"
        print_info "You can also use MongoDB Atlas (cloud) instead"
    else
        print_status "MongoDB is installed"
    fi
}

# Install dependencies for a project
install_dependencies() {
    local project_name=$1
    local project_path=$2
    
    print_info "Installing dependencies for $project_name..."
    cd "$project_path"
    
    if [ -f "package.json" ]; then
        npm install
        print_status "$project_name dependencies installed"
    else
        print_warning "No package.json found in $project_path"
    fi
    
    cd - > /dev/null
}

# Setup environment files
setup_env_files() {
    print_info "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_status "Created backend/.env from template"
        print_warning "Please update backend/.env with your actual configuration"
    else
        print_info "backend/.env already exists"
    fi
    
    # Web admin environment
    if [ ! -f "web-admin/.env" ]; then
        cp web-admin/env.example web-admin/.env
        print_status "Created web-admin/.env from template"
    else
        print_info "web-admin/.env already exists"
    fi
    
    # Mobile app environment
    if [ ! -f "mobile-app/.env" ]; then
        cp mobile-app/env.example mobile-app/.env
        print_status "Created mobile-app/.env from template"
    else
        print_info "mobile-app/.env already exists"
    fi
}

# Seed the database
seed_database() {
    print_info "Seeding the database..."
    
    cd backend
    if [ -f "src/utils/seedData.ts" ]; then
        npm run seed
        print_status "Database seeded successfully"
    else
        print_warning "Seed script not found"
    fi
    cd - > /dev/null
}

# Main setup function
main() {
    echo "Starting GymApp setup..."
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_node
    check_mongodb
    echo ""
    
    # Install dependencies
    print_info "Installing project dependencies..."
    install_dependencies "Backend" "backend"
    install_dependencies "Web Admin" "web-admin"
    install_dependencies "Mobile App" "mobile-app"
    echo ""
    
    # Setup environment files
    setup_env_files
    echo ""
    
    # Build projects
    print_info "Building projects..."
    cd backend && npm run build && cd - > /dev/null
    print_status "Backend built successfully"
    echo ""
    
    # Final instructions
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment files with your configuration:"
    echo "   - backend/.env (MongoDB URI, JWT secret, etc.)"
    echo "   - web-admin/.env (API URL)"
    echo "   - mobile-app/.env (API URL)"
    echo ""
    echo "2. Start MongoDB (if using local installation):"
    echo "   mongod"
    echo ""
    echo "3. Seed the database (optional):"
    echo "   cd backend && npm run seed"
    echo ""
    echo "4. Start the applications:"
    echo "   Backend:     cd backend && npm run dev"
    echo "   Web Admin:   cd web-admin && npm run dev"
    echo "   Mobile App:  cd mobile-app && npm start"
    echo ""
    echo "5. Access the applications:"
    echo "   Backend API: http://localhost:3001"
    echo "   Web Admin:   http://localhost:5173"
    echo "   Mobile App:  Follow Expo instructions"
    echo ""
    echo "Default admin credentials (after seeding):"
    echo "   Email: admin@gymapp.com"
    echo "   Password: admin123456"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
