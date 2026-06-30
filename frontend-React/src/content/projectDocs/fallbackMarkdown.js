/**
 * Fallback markdown templates.
 *
 * Generates safe documentation content when a project does not yet have
 * dedicated markdown files. This prevents Project Modal empty states.
 */

export function fallbackMarkdown(selectedProject, documentId) {
  if (documentId === "overview") {
    return `---
title: Overview
---
# Overview

## Project Summary
> ${selectedProject.type}

${selectedProject.body}

## Solution
${selectedProject.solution}

## Features
- ${selectedProject.problem}
- ${selectedProject.solution}
- ${selectedProject.notes}`;
  }

  if (documentId === "architecture") {
    return `---
title: Architecture
---
# Architecture

## Architecture Diagram
${selectedProject.architecture}

## System Module
| Layer | Component |
| --- | --- |
${selectedProject.services.map((service) => `| Project Service | ${service} |`).join("\n")}

## Workflow
${selectedProject.architecture}

## Technology Stack
${selectedProject.services.map((service) => `- ${service}`).join("\n")}`;
  }

  return `---
title: Implementation
---
# Implementation

## Frontend
${selectedProject.body}

## Backend
${selectedProject.solution}

## Database
Project data storage depends on the selected implementation.

## API
Project API details are documented as the implementation matures.

## Network
Network flow follows the project architecture.

## Security
Security controls should be documented with deployment details.

## Deployment
Deployment notes should be maintained with the project.

## CI/CD
CI/CD notes should be maintained with the project.

## IaC
Infrastructure as Code is a future documentation area.

## Monitoring
Monitoring notes should be maintained with the project.

## Troubleshooting
${selectedProject.notes}`;
}
