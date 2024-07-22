#!/bin/bash

# Run database migrations
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -f migrations/add_greenhouseCandidateId_column.sql
