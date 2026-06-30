---
title: Overview
---

# Overview

## Project Summary

Status: Planned / Documentation Placeholder

:::note Planned Status
This project is currently documented as a planned architecture placeholder. Implementation claims should be updated only after source code, infrastructure, tests, and deployment evidence exist.
:::

QR Code Generator 規劃為一個 serverless utility，可將 URL 或文字轉換成 QR image。目標架構包含 React frontend、API Gateway、Lambda、S3、CloudFront，以及 optional DynamoDB metadata storage。

## Problem Statement

使用者常需要快速將連結或短文字轉換成可下載的 QR code。Serverless approach 可保持工具輕量，同時展示 cloud storage、API design 與 asset delivery。

## Project Goals

- 從 URL 或 text input 產生 QR code。
- 在 browser preview QR output。
- 下載 generated QR images。
- 啟用 persistence 時將 generated assets 儲存在 S3。
- Optionally store generated code metadata。

## Key Features

- URL 或 text input validation。
- QR preview before download。
- Downloadable PNG or SVG output。
- Optional S3 storage for generated assets。
- Optional URL shortener integration。

## Learning Outcome

此專案用來練習 serverless utility design、Lambda processing、storage integration 與 frontend-to-backend API flow。

## Current Status

Status: Planned / Documentation Placeholder

此 project 已定義在 `portfolioContent.js`，但 audit 時未找到 implementation source code。新的 Markdown docs 讓 portfolio modal 結構一致，同時清楚標示 project 仍是 planned。
