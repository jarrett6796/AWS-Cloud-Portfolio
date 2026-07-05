# CRC-RAG 技術主管面試題庫

## AWS 平台

1. 請走過作品集交付所用的 AWS 服務，並說明每個服務的責任邊界。
2. S3 與 CloudFront 如何一起安全地提供 React 與 Vite 前端？
3. 為什麼前端要透過 API Gateway 呼叫 Lambda，而不是直接存取 AWS 資源？
4. 請比較 AWS DynamoDB 與 GCP Firestore 在這個系統中的資料責任。
5. 如果 Lambda 或 API Gateway 發生錯誤，你會把 CloudWatch 放在除錯流程的哪裡？
6. AWS 端文件中提到哪些 CORS 與 HTTPS 的控制？
## Google Cloud 平台

7. 請說明組成 RAG 助理後端的 Google Cloud 服務。
8. 為什麼 Cloud Run 適合部署 FastAPI RAG 後端？
9. Gemini 與 Vertex AI Embedding API 分別在 RAG 流程的哪個階段使用？
10. Google Cloud Storage 儲存什麼資料，為什麼要和 Firestore 分開？
11. Service Account 與最小權限 IAM 應如何支援 Cloud Run、Vertex AI、Firestore 與 Cloud Storage？
12. 把 FastAPI 後端包成 Cloud Run container 對部署有什麼好處？
## 系統架構

13. 請說明多雲架構的邏輯分層，以及每一層的責任。
14. 為什麼架構要分離作品集交付、AI 應用邏輯、檢索層與資料層？
15. 把平台拆在 AWS 與 GCP 之間，主要技術取捨是什麼？
16. 資料庫與物件儲存的選擇如何對應到各元件負責的資料？
17. 架構中哪些部分可以自動擴展，這背後需要哪些假設？
18. 如果這個系統要變成多人使用的 SaaS，你會先重看哪些架構元件？
## 安全與網路

19. 請指出瀏覽器、AWS API 與 GCP RAG 後端之間的主要安全邊界。
20. 最小權限原則在 AWS Lambda 與 GCP Cloud Run 上有什麼不同實作重點？
21. CloudFront 如何成為公開入口，同時讓 S3 維持受保護？
22. 哪些 API 設計讓前端不需要直接接觸資料庫或 AI 服務？
23. 如果 CORS 設太寬可能會造成什麼風險，文件中如何描述 CORS 控制？
24. 如果招聘方回報 AI 回答突然失效，你會先查哪些日誌或分析資料？
## RAG 流程

25. 請追蹤一個使用者問題從前端到檢索、Prompt 組裝、Gemini 生成與回傳的流程。
26. 向量嵌入在文件匯入與提問時檢索分別扮演什麼角色？
27. 向量搜尋如何協助找出語意相關的專案文件？
28. 語意搜尋與關鍵字檢索在這個專題中如何互補？
29. 父子 Chunking 為什麼能在精準檢索與完整回答之間取得平衡？
30. 哪些 metadata 欄位最能支援來源追蹤與專案隔離？
## 文件切分與知識管理

31. 為什麼 Markdown 比 Word、PDF 或圖片更適合作為這個 RAG 系統的知識來源？
32. 如果技術文件只用固定字數切分，可能會發生哪些問題？
33. Metadata filtering 如何避免其他專案內容進入回答上下文？
34. Ingestion pipeline 如何把 Markdown 文件轉成 Firestore knowledge records？
35. 更新 CRC-RAG 文件後，你會做哪些 chunk 品質檢查？
36. 當作品集專案越來越多時，知識管理流程應如何演進？
## API 與後端設計

37. 哪些責任應該留在 FastAPI，而不是移到 React 前端？
38. Server-Sent Events 對較長時間的 AI 回答有什麼使用者體驗上的幫助？
39. Lambda 與 FastAPI 的錯誤處理應如何依責任不同而設計？
40. RAG analytics 應該記錄哪些資料，才能協助除錯回答品質？
41. 哪些地方可以加入快取，同時避免答案過期或失去根據？
42. 正式導流前，你會如何驗證後端部署是否成功？
## 效能與成本

43. RAG 流程中哪些部分最可能影響延遲，你會如何量測？
44. 對低流量作品集 AI 助理來說，Scale to Zero 為什麼重要？
45. Chunk 大小、檢索數量與上下文組裝如何同時影響回答品質與成本？
46. 如果同時有很多使用者提問，最先出現的擴展問題可能是什麼？
47. 在從無伺服器改成常駐基礎設施前，你會評估哪些取捨？
48. 哪些指標可以看出檢索正常，但生成階段逐漸成為瓶頸？
## 評估與 grounding

49. 你會如何設計 golden questions 來證明助理理解 CRC-RAG 專題？
50. 引用驗證在作品集 AI 助理中要防止什麼問題？
51. source IDs、source files 與 section paths 如何幫助診斷錯誤回答？
52. 如果檢索到了正確來源，但回答沒有答到重點，你下一步會查哪裡？
53. 你會如何驗證英文問題得到英文回答、繁中問題得到繁中回答？
54. 當找不到相關專案上下文時，系統應該怎麼回應？
## 未來優化

55. 哪些 Infrastructure as Code 工作會讓這個專題更容易重現？
56. Terraform 會如何改變這個架構的部署與審查流程？
57. 如果評估結果常出現錯誤來源檢索，你會優先改善什麼？
58. 如果回答正確但對資深技術面試來說太淺，你會調整什麼？
59. 哪些監控或分析資料可以幫助排序未來的 RAG 改善工作？
60. 如果系統要支援多位候選人與私人專案文件，你會如何重新設計？
