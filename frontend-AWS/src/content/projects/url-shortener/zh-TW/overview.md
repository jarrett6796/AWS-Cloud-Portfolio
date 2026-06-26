---
title: Overview
---

# Overview

## Project Summary

Status: Planned / Documentation Placeholder

:::note Planned Status
This project is currently documented as a planned architecture placeholder. Implementation claims should be updated only after source code, infrastructure, tests, and deployment evidence exist.
:::

URL Shortener 規劃為一個 AWS serverless URL shortening application，將較長的網址轉換成較短且容易分享的連結。目標架構包含 React frontend、API Gateway、Lambda、DynamoDB、S3 與 CloudFront。

## Problem Statement

長網址不容易分享、追蹤與呈現。Cloud-native URL shortener 應該提供可預測的 redirect behavior、基本 validation，以及清楚的 data model，同時避免管理長時間運行的伺服器。

## Project Goals

- 建立具清楚 API boundaries 的 serverless application。
- 使用 DynamoDB 保存 short code mappings。
- 使用 S3 與 CloudFront 交付 frontend。
- 支援 redirect behavior。
- 在 source code 尚未存在前，清楚標示為 planned architecture。

## Key Features

- 從 long target URL 建立 short URL。
- 將 short code redirect 到 original URL。
- 追蹤 click count。
- 支援 optional expiration date。
- 支援 optional custom alias。
- 驗證空值、格式錯誤或不安全的 URL input。

## Learning Outcome

此專案用來練習 API design、DynamoDB access pattern、Lambda request handling、validation 與 serverless deployment planning。

## Current Status

Status: Planned / Documentation Placeholder

目前 repository 只在 `portfolioContent.js` 定義此 project，尚未找到 URL shortener implementation source code。這些 Markdown files 用來讓 portfolio modal 文件結構一致，但不宣稱專案已完成。
