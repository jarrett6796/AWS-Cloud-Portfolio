# CRC-RAG Hiring Evaluation - en

- Generated at: `2026-07-04T04:08:34.685702+00:00`
- Questions: `100`
- Overall pass rate: `13.0%`
- HR pass rate: `15.0%`
- Technical hiring manager pass rate: `11.67%`
- Citation success rate: `67.0%`
- Retrieval accuracy: `82.0%`
- Grounding success: `66.0%`
- Average retrieval score: `0.6028`
- Average response time ms: `5139.4017`

## Failure Reasons

- citation_validation: `33`
- insufficient_context: `34`
- missing_keyword: `87`
- safe_no_answer: `25`
- wrong_retrieval: `18`

## Failed Questions

### en_hr_004

- Question: Where does the documentation show your ownership across both AWS and Google Cloud responsibilities?
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `portfolio, Cloud Resume Challenge`

Answer excerpt:

The documentation demonstrates ownership across both AWS and Google Cloud responsibilities through several key areas: * **Multi-Cloud Architecture and Integration:** The project established a Multi-Cloud Architecture using AWS and GCP, integrating services from both platforms. AWS handles website deployment, backend AP...

### en_hr_005

- Question: How does the project make your growth as a cloud or backend candidate visible to employers?
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `portfolio, Cloud Resume Challenge, cloud`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_007

- Question: How does the project reduce the gap between a short resume and the deeper project details behind it?
- Expected source: `Overview 綜覽.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `recruiter, portfolio, AI`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_008

- Question: Why is an interactive AI assistant more useful than a static project page for this portfolio?
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `recruiter`

Answer excerpt:

An interactive AI assistant is more useful than a static project page for this portfolio because it provides dynamic "專案問答" (project Q&A) and "技術文件查詢功能" (technical document inquiry functions) [S2, S1]. It acts as an "操作入口" (operation entry point) for the Multi-Cloud system, connecting to a RAG system for retrieval and...

### en_hr_009

- Question: What makes the project different from a traditional Cloud Resume Challenge implementation?
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `recruiter`

Answer excerpt:

This project differentiates itself from a traditional Cloud Resume Challenge (CRC) implementation by integrating Retrieval-Augmented Generation (RAG) AI and a Serverless architecture [S2, S3]. While the project is based on the AWS Cloud Resume Challenge, it goes further by transforming a traditional static portfolio in...

### en_hr_010

- Question: How could this project scale from a personal portfolio into a broader interview-support tool?
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `recruiter`

Answer excerpt:

This project could scale from a personal portfolio into a broader interview-support tool by transforming traditional static portfolios into an interactive AI technical assistant with Q&A capabilities [S3]. It aims to bridge the information gap between job seekers and companies by integrating diverse project knowledge (...

### en_hr_011

- Question: How would you explain the AWS and GCP split to a non-technical hiring partner?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `documentation`

Answer excerpt:

This project utilizes a multi-cloud architecture, with AWS and GCP each handling distinct responsibilities to create a comprehensive AI-powered portfolio platform [S5]. AWS is primarily responsible for hosting the portfolio website, managing its display, and handling foundational functions such as tracking website visi...

### en_hr_012

- Question: What parts of the system are easiest to summarize for HR, and what details should be saved for engineers?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `documentation`

Answer excerpt:

For HR, the easiest parts of the system to summarize are project outcomes, personal contributions, and job relevance [S2]. For engineers (technical managers or interviewers), details should include architecture design, reasons for technology choices, system scalability, and problem-solving ability [S2]. More in-depth t...

### en_hr_013

- Question: How does the project documentation help someone understand the work without reading the entire codebase?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `documentation, technical`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_hr_014

- Question: How would you describe the project outcome in a two-minute screening interview?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `documentation, technical`

Answer excerpt:

The project successfully implemented a "Project View Counter Module" that tracks independent view counts for each project within the portfolio [S1]. This module utilizes a unique Project ID for each project's statistics, storing this data in DynamoDB [S1]. It operates on a serverless architecture, sharing infrastructur...

### en_hr_015

- Question: What documentation choices would make the project easier for a teammate or reviewer to pick up?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `documentation, technical`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_016

- Question: What information-delivery issue did you identify in the job-search process, and how does the system address it?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `solution, multi-cloud`

Answer excerpt:

The system identified limitations in traditional portfolios regarding information integration, technical display, and interactive experience during the job-search process [S3]. To address this, the project transforms traditional static portfolios into an interactive Q&A AI technical assistant [S3]. It integrates inform...

### en_hr_017

- Question: How does the project help different audiences ask for the level of detail they need?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `information gap, solution, multi-cloud`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_hr_018

- Question: What evidence shows that the project is solving a practical communication problem rather than adding AI for novelty?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `solution, multi-cloud`

Answer excerpt:

The project addresses a practical communication problem by aiming to bridge the information gap between job seekers and companies during the recruitment process [S5]. Evidence for this includes: * Job seekers find it difficult to condense extensive technical details, design considerations, challenges, and optimization...

### en_hr_019

- Question: Which design choice best shows that you considered recruiter time constraints?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `information gap, solution, multi-cloud`

Answer excerpt:

The design choice that best shows consideration for recruiter time constraints is the implementation of an interactive AI technical assistant, powered by Retrieval-Augmented Generation (RAG) [S4, S5]. This platform transforms a traditional static portfolio into an interactive system that helps users quickly understand...

### en_hr_020

- Question: How would you justify the multi-cloud design if an interviewer asks why one cloud was not enough?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `information gap, solution, multi-cloud`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_022

- Question: What did the project require you to learn about serverless architecture?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge`

Answer excerpt:

The project required learning about implementing a complete Serverless application architecture using AWS services such as API Gateway, Lambda, DynamoDB, SNS, and SES [S1, S2]. It involved understanding how Lambda functions serve as the core component for backend business logic, processing API requests, and integrating...

### en_hr_023

- Question: How does the RAG component demonstrate learning beyond basic website deployment?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `Cloud Resume Challenge, serverless, RAG`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_024

- Question: What part of the implementation would you discuss to show persistence through a full cloud workflow?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge, serverless`

Answer excerpt:

To demonstrate persistence through a full cloud workflow, you could discuss the **Contact Record Persistence** [S4] or the **Google Cloud Storage Integration

### en_hr_025

- Question: How does the project position you for roles involving cloud, backend, DevOps, or AI systems?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge`

Answer excerpt:

This project positions Jarrett for roles in cloud, backend, DevOps, and AI systems through several key aspects: * **Cloud:** The project utilizes a Multi-Cloud Architecture with AWS and GCP [S2, S4]. AWS is used for serverless services like website hosting, API Gateway, Lambda, DynamoDB, SNS, and SES [S1, S2, S5]. GCP...

### en_hr_026

- Question: If another engineer joined the project, what documentation would help them understand the architecture first?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `module, documentation`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_hr_027

- Question: How do the module boundaries make it easier to divide work among frontend, AWS, and GCP responsibilities?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `documentation`

Answer excerpt:

Module boundaries facilitate work division by promoting loose coupling and independent development across different parts of the system: * **Frontend** The frontend uses a Single Page Application (SPA) architecture with React components, which reduces coupling between different modules and allows for consistent develop...

### en_hr_028

- Question: What parts of the system would require clear handoff notes before production maintenance?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `module, documentation, architecture`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_029

- Question: How would you explain the RAG assistant to a product manager who cares about user experience?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `module, documentation, architecture`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_030

- Question: What evidence suggests you documented both the user-facing value and the technical design?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `module`

Answer excerpt:

Jarrett's portfolio documentation demonstrates both user-facing value and technical design through the following: * **Frontend Architecture and UI Design** The documentation details the Single Page Application (SPA) architecture, including user-facing features like the homepage, skills, portfolio, Project Modal, AI Ass...

### en_hr_031

- Question: How would you describe Retrieval-Augmented Generation in business terms for a hiring conversation?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `serverless, AWS`

Answer excerpt:

Retrieval-Augmented Generation (RAG) is a core component of this project, transforming a static portfolio into an interactive AI technical assistant [S2].

### en_hr_032

- Question: Why does the project use retrieved project documents instead of relying only on a general-purpose language model?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, serverless, AWS`

Answer excerpt:

The project uses retrieved project documents instead of relying solely on a general-purpose language model for several key reasons: * User questions often involve specific cloud architecture, deployment processes, troubleshooting records, system modules, or technical decisions that must come from project documents to e...

### en_hr_034

- Question: How does the project show practical knowledge of serverless services?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG`

Answer excerpt:

The project demonstrates practical knowledge of serverless services through several implementations: * **Multi-Cloud Architecture** The project utilizes AWS to establish a complete serverless application architecture, integrating services like API Gateway, Lambda, DynamoDB, SNS, and SES [S1, S3]. * **Core Functionality...

### en_hr_035

- Question: How does the serverless design help keep a personal portfolio cost-conscious?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `serverless`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_hr_036

- Question: What future improvements would make the project more useful for real hiring workflows?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, scalability, improvement`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_037

- Question: Which planned or expandable areas would you discuss if asked how the project can keep evolving?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, scalability, improvement`

Answer excerpt:

I do not know based on the indexed project documents.

### en_hr_038

- Question: What trade-off would you revisit first if the site received much higher traffic?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, scalability, improvement`

Answer excerpt:

If the site received much higher traffic, the trade-off to revisit first would be controlling latency and cost within the RAG pipeline [S2]. The project's engineering best practices emphasize observing the time spent at each stage of the RAG pipeline (embedding, retrieval, reranking, context assembly, and response gene...

### en_hr_039

- Question: How can this project continue to support your career story as you add more projects?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, scalability, improvement`

Answer excerpt:

This project is designed to support the addition of more projects to your career story through several mechanisms: * **Reusable Project View Counter:** The project's design allows for the independent tracking of view data for each project. This mechanism can be directly reused when new projects are added, providing con...

### en_hr_040

- Question: Why is evaluating the AI assistant important before presenting it as a hiring tool?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `scalability, improvement`

Answer excerpt:

Evaluating the AI assistant is crucial before presenting it as a hiring tool for several reasons: 1. **Ensuring Accuracy and Reliability**: The evaluation process systematically checks if the AI Assistant answers questions based on correct project documents, rather than just generating fluent but potentially inaccurate...

### en_tech_002

- Question: How do S3 and CloudFront work together to serve the React and Vite frontend securely?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Lambda`

Answer excerpt:

S3 and CloudFront work together to serve the React and Vite frontend securely as follows: * **S3 Static Website Hosting:** The React and Vite frontend, which generates static HTML, CSS, and JavaScript files, is hosted on Amazon S3. S3 stores these static files but does not directly provide public access [S1]. * **Cloud...

### en_tech_003

- Question: Why is API Gateway used between the frontend and Lambda functions instead of calling AWS resources directly?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CloudFront`

Answer excerpt:

API Gateway is used between the frontend and Lambda functions for several reasons: * It serves as a unified entry point for all APIs, receiving HTTP requests from the website and forwarding them to the corresponding AWS Lambda functions [S1, S3, S5]. * It decouples the frontend from the backend, meaning the React front...

### en_tech_004

- Question: Compare the DynamoDB responsibilities on AWS with the Firestore responsibilities on GCP.
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CloudFront, Lambda`

Answer excerpt:

On AWS, DynamoDB is responsible for storing Web views, Project views, Contact records, and Notification state [S2]. Specifically, it stores website browsing statistics, project browsing records, and contact form data, including user information, message content, and submission time [S3]. On GCP, Firestore is responsibl...

### en_tech_005

- Question: Where would CloudWatch fit when debugging Lambda or API Gateway failures in this system?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `S3, CloudFront`

Answer excerpt:

When debugging Lambda failures in this system, error information generated during execution is recorded in CloudWatch Logs. This facilitates subsequent debugging and system maintenance, helping to quickly pinpoint the source of issues [S1]. The context does not specifically mention CloudWatch's role in debugging API Ga...

### en_tech_006

- Question: What CORS and HTTPS controls are described for the AWS side of the portfolio?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Lambda`

Answer excerpt:

For the AWS side of the portfolio, the following CORS and HTTPS controls are described: **CORS Controls:** * CORS (Cross-Origin Resource Sharing) is configured on Amazon API Gateway to allow the React frontend to call the API, addressing same-origin policy restrictions [S1, S2]. * During development, CORS settings perm...

### en_tech_008

- Question: Why is Cloud Run a good fit for deploying the FastAPI RAG backend?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Vertex AI, Firestore`

Answer excerpt:

Cloud Run is a good fit for deploying the FastAPI RAG backend for several reasons: * **Serverless Architecture & Cost Efficiency** The AI backend is deployed on Google Cloud Run using a Serverless architecture [S4]. It operates on a "Scale to Zero" model, meaning it scales down to minimum resource usage when there are...

### en_tech_009

- Question: How are Gemini and the Vertex AI Embedding API used at different points in the RAG flow?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Run, Firestore`

Answer excerpt:

In the RAG flow, Vertex AI Embedding and Vertex AI Gemini serve distinct but complementary roles: * **Vertex AI Embedding Model:** This model is used to convert Markdown technical documents into vectors (Embeddings) [S1]. After documents are chunked, the system generates these vectors and builds an index [S1]. When a u...

### en_tech_010

- Question: What does Google Cloud Storage store, and why is it separate from Firestore?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Run, Vertex AI`

Answer excerpt:

Google Cloud Storage stores RAG (Retrieval Augmented Generation) original Markdown documents and knowledge base sources [S1, S2, S3, S4]. Specifically, it stores files like `/docs/*.md` and `/projects/{project_id}/*.md` [S4]. It is separate from Firestore because Google Cloud Storage is used for managing raw Markdown t...

### en_tech_012

- Question: What deployment benefits come from packaging the FastAPI backend as a Cloud Run container?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Vertex AI, Firestore`

Answer excerpt:

Packaging the FastAPI backend as a Cloud Run container offers several deployment benefits: * **Simplified Updates** Updates are managed by rebuilding the Docker Image and deploying a new Revision, allowing for quick version updates for FastAPI and the RAG system [S1, S2]. * **No Server Management** There is no need to...

### en_tech_014

- Question: Why does the architecture separate portfolio delivery, AI application logic, retrieval, and data storage?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `multi-cloud, GCP`

Answer excerpt:

The architecture separates portfolio delivery, AI application logic, retrieval, and data storage to achieve a clear division of responsibilities and leverage specialized services [S2]. Specifically: * **Portfolio delivery** (Frontend Presentation Layer and AWS Serverless Layer) handles the portfolio interface, project...

### en_tech_015

- Question: What are the key trade-offs of splitting the platform between AWS and GCP?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `multi-cloud, AWS, GCP`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_017

- Question: Which parts of the architecture can scale automatically, and what assumptions make that possible?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `multi-cloud`

Answer excerpt:

The architecture leverages serverless and managed services across AWS and GCP to enable automatic scaling [S2, S3]. The parts of the architecture that can scale automatically include: * **AWS Serverless Layer**: This layer is designed with Serverless as its core, utilizing AWS managed services such as Amazon S3 for sta...

### en_tech_018

- Question: Which architectural components would you revisit first if this became a multi-user SaaS product?
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `multi-cloud, AWS, GCP`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_019

- Question: Identify the main security boundaries between the browser, AWS APIs, and GCP RAG backend.
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `HTTPS, IAM`

Answer excerpt:

The main security boundary identified in the context is Cross-Origin Resource Sharing (CORS) [S4]. * **Browser and AWS APIs**: CORS is configured on the API Gateway to allow the React frontend to

### en_tech_020

- Question: How does the least-privilege principle apply differently to AWS Lambda and GCP Cloud Run?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_021

- Question: How does CloudFront become the public entry point while S3 remains protected?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, IAM`

Answer excerpt:

CloudFront serves as the sole external entry point for the website, positioned in front of Amazon S3 [S1]. CloudFront utilizes the S3 Bucket as its Origin, meaning it fetches content from S3 [S1]. While S3 stores the website's static content, it does not directly provide public access [S5]. Instead, users access the we...

### en_tech_022

- Question: What API design choices keep the frontend from directly accessing databases or AI services?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

The frontend communicates with FastAPI via HTTP API for all AI questions, preventing direct access to Vertex AI or Firestore [S2]. This design centralizes AI logic in the backend, reducing frontend complexity and facilitating maintenance and future expansion [S2]. Additionally, website browsing statistics, project view...

### en_tech_023

- Question: What failure could happen if CORS were configured too broadly, and how does the documentation address CORS?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `HTTPS, IAM`

Answer excerpt:

If CORS were configured too broadly, it could lead to unauthorized sources calling the API, which would compromise system security [S1]. The documentation addresses CORS by explaining that it is configured on Amazon API Gateway to allow the React frontend to securely call backend APIs, as the frontend and backend are d...

### en_tech_024

- Question: What logs or analytics would you inspect first when a recruiter reports that AI answers stopped working?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_025

- Question: Trace a user question from the frontend through retrieval, prompt construction, Gemini generation, and response delivery.
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG`

Answer excerpt:

A user question originates from the frontend, which is built with React, Vite, and JavaScript [S5]. 1. **Retrieval**: After the user asks a question, FastAPI completes document retrieval, returning relevant chunks [S1, S2]. 2. **Prompt Construction**: The system then performs "Context Assembly" and "Prompt Construction...

### en_tech_026

- Question: What role do embeddings play during both ingestion and question-time retrieval?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, retrieval, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_027

- Question: How does vector search help retrieve semantically relevant project documentation?
- Expected source: `RAG 系統設計.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `retrieval, Gemini`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_tech_028

- Question: How would semantic search and keyword retrieval complement each other in this project?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, Gemini`

Answer excerpt:

Based on the indexed project documents, the system primarily uses semantic search as the core of its retrieval pipeline [S1, S2, S3]. Semantic search converts user questions into query embeddings to find semantically similar content, rather than relying solely on keyword matching [S1, S3]. The project's retrieval strat...

### en_tech_029

- Question: Why does parent-child chunking improve the balance between precise retrieval and complete answers?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, retrieval, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_030

- Question: Which metadata fields are most important for source traceability and project isolation?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, retrieval, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_032

- Question: What can go wrong if technical documents are split only by fixed character length?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, chunking, metadata`

Answer excerpt:

If technical documents are split only by fixed character length, it can lead to several issues: * It may destroy the original semantic structure of the document [S2]. * The AI Assistant might retrieve incomplete or context-lacking content [S2]. * If chunks are too large, retrieval results will be less precise, and the...

### en_tech_033

- Question: How does metadata filtering prevent content from other projects from entering the answer context?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, chunking, metadata`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_035

- Question: What chunk-quality checks would you run after updating the CRC-RAG documentation?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, chunking, metadata`

Answer excerpt:

After updating the CRC-RAG documentation, you would regularly check chunk quality [S3]. This involves re-ingesting and updating the knowledge store if the document structure changes, sections become too long, or content becomes outdated [S3].

### en_tech_036

- Question: How would you evolve the knowledge management process as more portfolio projects are added?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, chunking, metadata`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_037

- Question: What responsibilities should remain in FastAPI instead of being moved into the React frontend?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `analytics`

Answer excerpt:

FastAPI is responsible for handling all AI logic, including receiving frontend requests, processing the RAG (Retrieval Augmented Generation) flow, and returning generated results to the website [S1, S2]. Specifically, the following responsibilities should remain in FastAPI: * Receiving frontend requests and questions [...

### en_tech_038

- Question: How does Server-Sent Events improve the user experience for long-running AI answers?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

Server-Sent Events (SSE) improve the user experience for long-running AI answers by streaming the AI-generated content to the frontend gradually, rather than waiting for the entire answer to be generated before sending it [S1]. This allows users to see the AI's response in real-time, which shortens waiting times and en...

### en_tech_039

- Question: How should Lambda and FastAPI error handling differ based on their responsibilities?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `analytics`

Answer excerpt:

Based on the indexed project documents, AWS Lambda implements basic error handling by returning appropriate HTTP Status Codes and error messages for issues such as data validation failures, database operation anomalies, and third-party service errors [S1]. When an API execution fails, Lambda uses a unified response for...

### en_tech_040

- Question: What data should RAG analytics capture to help debug poor answers?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_tech_041

- Question: Where could caching help without making answers stale or ungrounded?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_tech_042

- Question: How would you validate a backend deployment before sending production traffic to it?
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `FastAPI, analytics`

Answer excerpt:

Before sending production traffic to a backend deployment, the following validation steps are performed: * AWS and GCP backend integration testing is completed before formal deployment [S1]. * Functional validation and integration testing are conducted for the overall system, ensuring the frontend, AWS services, GCP AI...

### en_tech_043

- Question: Which parts of the RAG flow are most likely to affect latency, and how would you measure them?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `serverless, cost`

Answer excerpt:

The RAG pipeline stages most likely to affect latency include embedding, retrieval, reranking, context assembly, and response generation [S3]. To measure latency, the system should observe the time spent in each of these stages [S3]. The RAG system needs to record the overall latency, along with the query, retrieved ch...

### en_tech_044

- Question: Why does scale-to-zero matter for a low-traffic portfolio AI assistant?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `latency, serverless`

Answer excerpt:

Scale-to-zero is important for a low-traffic portfolio AI assistant because it allows the system to incur almost no idle computing costs when there are no user requests [S5]. This is achieved by not needing to maintain constant computing resources, making it more suitable for personal portfolios and small to medium-siz...

### en_tech_045

- Question: How do chunk size, retrieval count, and context assembly affect both answer quality and cost?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `latency, serverless, cost`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_046

- Question: What scaling concerns would appear first if many users asked questions at the same time?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `serverless`

Answer excerpt:

If many users asked questions at the same time, the primary scaling concerns would be increased latency and cost [S1]. The RAG pipeline, which includes embedding, retrieval, reranking, context assembly, and response generation, would need to be monitored for the time spent in each stage [S1]. To mitigate these concerns...

### en_tech_047

- Question: What trade-offs would you consider before moving from serverless services to always-on infrastructure?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `latency, serverless, cost`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_048

- Question: Which metrics would indicate that retrieval is working but generation is becoming the bottleneck?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `latency, serverless, cost`

Answer excerpt:

If `Retrieval Accuracy` and `Source Relevance` are high, it indicates that retrieval is working effectively [S1]. However, if `Answer

### en_tech_049

- Question: How would you design a golden question set to prove the assistant understands the CRC-RAG project?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `citation, source`

Answer excerpt:

To design a golden question set to prove the assistant understands the CRC-RAG project, you would establish a fixed set of evaluation questions [S3]. This set should cover key project topics such as architecture design, deployment process, troubleshooting, service selection, data flow, and security [S3]. The purpose of...

### en_tech_050

- Question: What does citation validation protect against in a portfolio assistant?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, citation, source`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_051

- Question: How can source IDs, source files, and section paths help diagnose a wrong answer?
- Expected source: `RAG 系統設計.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `evaluation, citation`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_tech_052

- Question: If retrieval returns the right source but the answer misses the point, where would you investigate next?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, citation, source`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_053

- Question: How would you validate that English questions receive English answers and zh-TW questions receive Traditional Chinese answers?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, citation, source`

Answer excerpt:

During frontend integration and validation, multi-language switching is verified to ensure all functions operate normally [S1].

### en_tech_054

- Question: How should the system behave when no relevant project context can be found?
- Expected source: `RAG 系統設計.md`
- Retrieved source: `RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `evaluation, citation, source`

Answer excerpt:

When no relevant project context can be found, the system should explicitly state that there is not enough information in the current documents [S1, S2]. It should not attempt to supplement content that is not supported by the documents [S1]. This approach helps to reduce hallucination and increase the system's credibi...

### en_tech_055

- Question: What infrastructure-as-code work would make this project easier to reproduce?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `retrieval, monitoring`

Answer excerpt:

To make this project easier to reproduce, Terraform was introduced as an Infrastructure as Code (IaC) tool to unify the management of cloud resources [S1]. By describing AWS and GCP infrastructure as code, it facilitates repeatable deployments and allows the entire cloud architecture to be maintained alongside project...

### en_tech_056

- Question: How would Terraform change the deployment and review process for this architecture?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `retrieval, monitoring`

Answer excerpt:

Terraform significantly changes the deployment and review process for this architecture by: * **Deployment:** It enables repeatable deployment of cloud resources across AWS and GCP by describing infrastructure as code [S1]. This reduces manual operation errors and allows infrastructure adjustments by modifying Terrafor...

### en_tech_057

- Question: What would you improve first if evaluations showed repeated wrong-source retrieval?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform, retrieval, monitoring`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_058

- Question: What would you tune if answers were accurate but too shallow for senior technical interviews?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform, retrieval, monitoring`

Answer excerpt:

I do not know based on the indexed project documents.

### en_tech_059

- Question: What monitoring or analytics additions would help prioritize future RAG improvements?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: ``
- Top retrieved source: `None`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `retrieval, monitoring`

Answer excerpt:

I can answer questions about Jarrett's portfolio projects, AWS Cloud Resume work, GCP RAG backend, architecture, deployment notes, Terraform/CI/CD docs, and indexed source behavior.

### en_tech_060

- Question: How would you redesign the system if it needed to support multiple candidates and private project documents?
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform, retrieval, monitoring`

Answer excerpt:

To support multiple candidates and private project documents, the system would need to implement robust data isolation and management based on project scope. Key redesign considerations would include: * **Project Scope Isolation** The system's metadata design already supports "專案範圍隔離" (project scope isolation) by inclu...
