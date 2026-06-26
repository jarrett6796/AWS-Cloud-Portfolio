---
title: Overview
---

# Overview


## Project Summary

Status: Planned / Documentation Placeholder

:::note Planned Status
This project is currently documented as a planned architecture placeholder. Implementation claims should be updated only after source code, infrastructure, tests, and deployment evidence exist.
:::

The URL Shortener is planned as a serverless AWS application that converts long URLs into short, shareable links. The intended architecture uses a React frontend, API Gateway, Lambda, DynamoDB, S3, and CloudFront.

## Problem Statement

Long URLs are difficult to share, track, and present cleanly in a portfolio or campaign workflow. A cloud-native shortener should provide predictable redirects, basic validation, and a clear data model without requiring always-on servers.

## Project Goals

- Build a small serverless application with clear API boundaries.
- Store short code mappings in DynamoDB.
- Serve the frontend through S3 and CloudFront.
- Support redirect behavior through an API or edge-aware route.
- Keep implementation evidence separate from planned architecture until source code exists.

## Key Features

- Create a short URL from a long target URL.
- Redirect a short code to the original URL.
- Track click count.
- Support optional expiration date.
- Support optional custom alias.
- Validate empty, malformed, or unsafe URL input.

## Learning Outcome

This project is meant to demonstrate API design, DynamoDB access patterns, Lambda request handling, validation, and serverless deployment planning.

## Current Status

Status: Planned / Documentation Placeholder

The current repository defines this project in `portfolioContent.js`, but implementation source code for the URL shortener was not found during this audit. These Markdown files provide a consistent project documentation structure for the portfolio modal without claiming the project is complete.
