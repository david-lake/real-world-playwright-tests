#!/bin/bash
# Wrapper script to load .env and start dev server
set -a
source "$(dirname "$0")/.env"
set +a
exec yarn dev