---
title: Overview
---
# Project Summary
> Capstone Project

AWS Cloud Resume + GCP RAG is a multi-cloud engineering portfolio that combines AWS static delivery and serverless visitor tracking with a GCP-native retrieval-augmented generation assistant.

The project demonstrates a recruiter-facing cloud portfolio, a working AWS visitor counter, and a deployed Cloud Run backend that retrieves project documentation from Firestore and generates grounded answers with Gemini.

# Features
- Static React and Vite portfolio delivered through AWS S3 and CloudFront.
- Live AWS visitor counter using API Gateway, Lambda, and DynamoDB.
- GCP Cloud Run RAG backend using FastAPI, Firestore, Cloud Storage, and Gemini.
- Streaming assistant responses through `POST /ask-rag-stream`.
- Persistent chat sessions stored in Firestore.
- Source-grounded answers with visible source IDs.
- Metadata-only RAG analytics and admin-only analytics summary endpoint.
