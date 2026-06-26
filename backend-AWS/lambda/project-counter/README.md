# Project Counter

Project view routes are implemented by the shared `portfolio-view-counter` Lambda.

This folder is reserved only if the project counter is later separated.

## Current Routes

- `GET /projects/{projectId}`
- `POST /projects/{projectId}/view`

## Current Implementation

- Source folder: `../visitor-counter/`
- Lambda function: `portfolio-view-counter`
- DynamoDB table: `portfolio-views`
