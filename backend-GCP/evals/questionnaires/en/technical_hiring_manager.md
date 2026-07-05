# CRC-RAG Technical Hiring Manager Questionnaire

## AWS Platform

1. Walk through the AWS services used to deliver the portfolio and explain each service boundary.
2. How do S3 and CloudFront work together to serve the React and Vite frontend securely?
3. Why is API Gateway used between the frontend and Lambda functions instead of calling AWS resources directly?
4. Compare the DynamoDB responsibilities on AWS with the Firestore responsibilities on GCP.
5. Where would CloudWatch fit when debugging Lambda or API Gateway failures in this system?
6. What CORS and HTTPS controls are described for the AWS side of the portfolio?
## Google Cloud Platform

7. Explain the Google Cloud services that make up the RAG assistant backend.
8. Why is Cloud Run a good fit for deploying the FastAPI RAG backend?
9. How are Gemini and the Vertex AI Embedding API used at different points in the RAG flow?
10. What does Google Cloud Storage store, and why is it separate from Firestore?
11. How should service accounts and least-privilege IAM support Cloud Run, Vertex AI, Firestore, and Cloud Storage?
12. What deployment benefits come from packaging the FastAPI backend as a Cloud Run container?
## System Architecture

13. Describe the logical layers of the multi-cloud architecture and the responsibility of each layer.
14. Why does the architecture separate portfolio delivery, AI application logic, retrieval, and data storage?
15. What are the key trade-offs of splitting the platform between AWS and GCP?
16. How do the database and object-storage choices map to the data each component owns?
17. Which parts of the architecture can scale automatically, and what assumptions make that possible?
18. Which architectural components would you revisit first if this became a multi-user SaaS product?
## Security and Networking

19. Identify the main security boundaries between the browser, AWS APIs, and GCP RAG backend.
20. How does the least-privilege principle apply differently to AWS Lambda and GCP Cloud Run?
21. How does CloudFront become the public entry point while S3 remains protected?
22. What API design choices keep the frontend from directly accessing databases or AI services?
23. What failure could happen if CORS were configured too broadly, and how does the documentation address CORS?
24. What logs or analytics would you inspect first when a recruiter reports that AI answers stopped working?
## RAG Pipeline

25. Trace a user question from the frontend through retrieval, prompt construction, Gemini generation, and response delivery.
26. What role do embeddings play during both ingestion and question-time retrieval?
27. How does vector search help retrieve semantically relevant project documentation?
28. How would semantic search and keyword retrieval complement each other in this project?
29. Why does parent-child chunking improve the balance between precise retrieval and complete answers?
30. Which metadata fields are most important for source traceability and project isolation?
## Chunking and Knowledge Management

31. Why is Markdown a better knowledge-source format than Word, PDF, or images for this RAG system?
32. What can go wrong if technical documents are split only by fixed character length?
33. How does metadata filtering prevent content from other projects from entering the answer context?
34. How does the ingestion pipeline transform Markdown files into Firestore knowledge records?
35. What chunk-quality checks would you run after updating the CRC-RAG documentation?
36. How would you evolve the knowledge management process as more portfolio projects are added?
## API and Backend Design

37. What responsibilities should remain in FastAPI instead of being moved into the React frontend?
38. How does Server-Sent Events improve the user experience for long-running AI answers?
39. How should Lambda and FastAPI error handling differ based on their responsibilities?
40. What data should RAG analytics capture to help debug poor answers?
41. Where could caching help without making answers stale or ungrounded?
42. How would you validate a backend deployment before sending production traffic to it?
## Performance and Cost

43. Which parts of the RAG flow are most likely to affect latency, and how would you measure them?
44. Why does scale-to-zero matter for a low-traffic portfolio AI assistant?
45. How do chunk size, retrieval count, and context assembly affect both answer quality and cost?
46. What scaling concerns would appear first if many users asked questions at the same time?
47. What trade-offs would you consider before moving from serverless services to always-on infrastructure?
48. Which metrics would indicate that retrieval is working but generation is becoming the bottleneck?
## Evaluation and Grounding

49. How would you design a golden question set to prove the assistant understands the CRC-RAG project?
50. What does citation validation protect against in a portfolio assistant?
51. How can source IDs, source files, and section paths help diagnose a wrong answer?
52. If retrieval returns the right source but the answer misses the point, where would you investigate next?
53. How would you validate that English questions receive English answers and zh-TW questions receive Traditional Chinese answers?
54. How should the system behave when no relevant project context can be found?
## Future Improvements

55. What infrastructure-as-code work would make this project easier to reproduce?
56. How would Terraform change the deployment and review process for this architecture?
57. What would you improve first if evaluations showed repeated wrong-source retrieval?
58. What would you tune if answers were accurate but too shallow for senior technical interviews?
59. What monitoring or analytics additions would help prioritize future RAG improvements?
60. How would you redesign the system if it needed to support multiple candidates and private project documents?
