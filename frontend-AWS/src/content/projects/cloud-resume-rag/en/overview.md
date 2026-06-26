---
title: Overview
---

## Project Summary

> Capstone Project

AWS Cloud Resume + GCP RAG is a multi-cloud engineering portfolio that combines AWS static delivery and serverless visitor tracking with a GCP-native retrieval-augmented generation assistant.

The project demonstrates a recruiter-facing cloud portfolio, a working GCP Cloud Run RAG backend, and the documented AWS Cloud Resume architecture. The original AWS S3, CloudFront, API Gateway, Lambda, and DynamoDB resources were previously deployed and operational, but the original AWS account is no longer available. AWS infrastructure is now treated as a migration/rebuild workstream in the new account.

## 1

### 1

#### 1

# 1

## Problem Statement

Static resumes do not show architecture decisions, deployment evidence, or troubleshooting depth. The portfolio needs to explain cloud engineering work interactively while staying honest about what is currently deployed, what was previously operational, and what is planned.

## Project Goals

- Present a multi-cloud portfolio centered on AWS Cloud Resume Challenge plus GCP RAG.
- Preserve historical AWS deployment evidence without representing old-account resources as currently deployed.
- Rebuild AWS delivery, visitor counter, notification, IAM, and CI/CD integration in the new AWS account.
- Keep the GCP RAG assistant grounded in project documentation.

## Key Features

- React and Vite portfolio with bilingual content and project documentation modal.
- Previous AWS visitor counter architecture using API Gateway, Lambda, and DynamoDB.
- GCP Cloud Run RAG backend using FastAPI, Firestore, Cloud Storage, and Gemini.
- Streaming assistant responses through `POST /ask-rag-stream`.
- Persistent chat sessions stored in Firestore.
- Source-grounded answers with visible source IDs.
- Metadata-only RAG analytics and admin-only analytics summary endpoint.

## Learning Outcome

- Current implemented scope: frontend application, documentation portal, GCP RAG backend, streaming assistant, Firestore memory, RAG analytics, and CI/CD backend evaluation.
- AWS rebuild scope: S3, CloudFront, Lambda, API Gateway, DynamoDB, SNS, EventBridge, IAM roles and policies, and frontend deployment integration.
- Planned portfolio scope: event-driven notifications, URL shortener, QR code generator, real-time chat, and video streaming platform.

## Current Status

- Shipped a modular React/Vite frontend and deployed GCP RAG backend.
- Implemented intermediate RAG with several advanced features, including citation validation, metadata filtering, multi-query retrieval, streaming, persistent memory, and analytics.
- Documented the AWS account migration boundary so historical AWS work remains accurate without overstating current deployment status.
