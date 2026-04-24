#!/bin/bash

# AI Cryptocurrency Tax Calculator - Start Script
# This script sets up and starts the full application

set -e

echo "============================================"
echo "  AI Cryptocurrency Tax Calculator"
echo "  Starting Application..."
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kill any processes on our ports
echo -e "\n${YELLOW}Cleaning up used ports...${NC}"
kill_port() {
  local port=$1
  local pid=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo -e "  Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null || true
    sleep 1
  fi
}

kill_port 4000
kill_port 3000

echo -e "${GREEN}Ports cleaned.${NC}"

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found. Please create it first.${NC}"
  exit 1
fi

# Load env variables
source .env 2>/dev/null || export $(grep -v '^#' .env | xargs)

# Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
    echo -e "${GREEN}PostgreSQL is running.${NC}"
  else
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
  fi
fi

# Create database if not exists
echo -e "\n${YELLOW}Setting up database...${NC}"
createdb ${DB_NAME:-crypto_tax_calculator} 2>/dev/null || echo "Database already exists or using existing."
echo -e "${GREEN}Database ready.${NC}"

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install --silent 2>/dev/null
echo -e "${GREEN}Backend dependencies installed.${NC}"

# Seed the database
echo -e "\n${YELLOW}Seeding database with demo data...${NC}"
node src/seeds/seed.js
echo -e "${GREEN}Database seeded successfully.${NC}"

# Start backend with nodemon (hot reload)
echo -e "\n${BLUE}Starting backend server on port ${BACKEND_PORT:-4000}...${NC}"
npx nodemon src/index.js &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:${BACKEND_PORT:-4000}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}Backend is running!${NC}"
    break
  fi
  sleep 1
done

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install --silent 2>/dev/null
echo -e "${GREEN}Frontend dependencies installed.${NC}"

# Start frontend with hot reload (default for react-scripts)
echo -e "\n${BLUE}Starting frontend on port ${FRONTEND_PORT:-3000}...${NC}"
BROWSER=none PORT=${FRONTEND_PORT:-3000} npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Application Started Successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:${FRONTEND_PORT:-3000}${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:${BACKEND_PORT:-4000}${NC}"
echo ""
echo -e "  Demo Login:"
echo -e "    Email:    ${YELLOW}demo@cryptotax.com${NC}"
echo -e "    Password: ${YELLOW}password123${NC}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Trap SIGINT to kill both processes
trap "echo -e '\n${RED}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for processes
wait
