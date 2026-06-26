---
title: 專案概述
---
# Overview

## Project Summary
> Serverless Events

Event Announcement System 是使用 AWS API Gateway、Lambda、SNS、DynamoDB 建立的 serverless notification platform。

這個專案展示 event-driven cloud fundamentals：接收 event publish request、fan out messages、使用 managed compute 處理訊息，並保留可觀測的 operational logs。

## Problem Statement

Status: Planned / Documentation Placeholder

:::note Planned Status
This project is currently documented as a planned architecture placeholder. Implementation claims should be updated only after source code, infrastructure, tests, and deployment evidence exist.
:::

This project is a planned event-driven notification workflow. Implementation evidence was not confirmed in the inspected frontend source.

## Project Goals

- Publish events through an API boundary.
- Fan out notifications with managed messaging.
- Process events with Lambda.
- Store event metadata in DynamoDB.

## Key Features
- API-driven event publishing。
- SNS-based fan-out。
- Lambda workers 負責 message processing。
- DynamoDB-backed event metadata。
- CloudWatch-friendly operational flow。


## Learning Outcome

This project is intended to demonstrate event-driven AWS design, serverless fan-out, message processing, and operational logging.

## Current Status

Status: Planned / Documentation Placeholder

The portfolio contains documentation for this project, but source implementation and deployment evidence are not confirmed.
