# API Gateway CORS

Export date: 2026-06-26

AWS region: `ap-northeast-1`

## CloudResumeContactAPI

API-level CORS is configured for `CloudResumeContactAPI`.

Allowed origins:

- `http://localhost:5173`
- `http://localhost:5174`
- `https://aws-cloudresume-gcprag-jarrett.cc`

Allowed headers:

- `content-type`

Allowed methods:

- `POST`

Allow credentials: `false`

Max age: `0`

## Viewcounter API

No API Gateway CORS configuration is currently set on `Viewcounter API`.

The deployed `portfolio-view-counter` Lambda returns Lambda-level response headers:

- `Access-Control-Allow-Origin: *`
- `Content-Type: application/json`

## Contact Lambda Response Headers

The deployed `CloudResumeContactHandler` Lambda also returns Lambda-level response headers:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type`
- `Access-Control-Allow-Methods: POST,OPTIONS`
- `Content-Type: application/json`
