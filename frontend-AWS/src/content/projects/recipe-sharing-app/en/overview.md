---
title: Overview
---
# Project Summary

> Full-stack AWS Recipe Sharing App

The Recipe Sharing App is a full-stack cloud project built with React, FastAPI, DynamoDB, and AWS infrastructure services.

The original book project focused on a basic frontend, backend, and database workflow. My implementation extended the project into a more cloud-engineering-oriented architecture by adding custom networking, Application Load Balancer, Auto Scaling Group, CloudFront, IAM roles, and CloudFormation Infrastructure as Code.

This project demonstrates how a simple full-stack application can evolve from a local development project into a reproducible AWS deployment.

# Features

- Recipe listing, creation, and deletion workflow.
- React frontend connected to a FastAPI backend.
- FastAPI REST API for recipe operations.
- DynamoDB-backed recipe persistence.
- CloudFront entry point for frontend and API access.
- Application Load Balancer routing traffic to backend instances.
- Auto Scaling Group for EC2 self-healing and scalability.
- IAM role-based DynamoDB access from EC2.
- CloudFormation templates for reproducible infrastructure deployment.
- Real troubleshooting experience with ALB health checks, CloudFront 403 errors, S3 public access restrictions, and CloudFormation rollback failures.

# Project Outcome

The project successfully progressed through three stages:

| Stage                  | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| Book Version           | Basic React, FastAPI, and DynamoDB application                           |
| Manual AWS Version     | Custom AWS deployment using VPC, EC2, ALB, ASG, CloudFront, and DynamoDB |
| CloudFormation Version | Infrastructure converted into layered CloudFormation stacks              |

# Key Learning Outcomes

- Understood how frontend, backend, and database layers communicate in a cloud-hosted application.
- Learned how to expose a FastAPI backend through an Application Load Balancer.
- Practiced Auto Scaling Group behavior, launch templates, user data, and health checks.
- Used CloudFront as a unified public entry point for frontend and API routes.
- Converted manually created AWS resources into CloudFormation templates.
- Troubleshot real deployment failures and cleaned up resources to control AWS cost.
