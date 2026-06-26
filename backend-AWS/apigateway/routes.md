# API Gateway Routes

Export date: 2026-06-26

AWS region: `ap-northeast-1`

## Viewcounter API

- API ID: `ajqu2ciscd`
- Endpoint: `https://ajqu2ciscd.execute-api.ap-northeast-1.amazonaws.com`
- Stage: `$default`
- Auto deploy: `true`
- Integration type: `AWS_PROXY`
- Integration URI: `arn:aws:lambda:ap-northeast-1:001920499658:function:portfolio-view-counter`
- Payload format version: `2.0`

| Method | Route | Lambda |
| --- | --- | --- |
| GET | `/views` | `portfolio-view-counter` |
| GET | `/projects/{projectId}` | `portfolio-view-counter` |
| POST | `/projects/{projectId}/view` | `portfolio-view-counter` |

## CloudResumeContactAPI

- API ID: `fh0e0v86nk`
- Endpoint: `https://fh0e0v86nk.execute-api.ap-northeast-1.amazonaws.com`
- Stage: `$default`
- Auto deploy: `true`
- Integration type: `AWS_PROXY`
- Integration URI: `arn:aws:lambda:ap-northeast-1:001920499658:function:CloudResumeContactHandler`
- Payload format version: `2.0`

| Method | Route | Lambda |
| --- | --- | --- |
| POST | `/contact` | `CloudResumeContactHandler` |

## Route Notes

- The requested `/projects/{id}` route is deployed as `/projects/{projectId}`.
- `portfolio-view-counter` implements the project route handling and reads `projectId` from API Gateway path parameters.
