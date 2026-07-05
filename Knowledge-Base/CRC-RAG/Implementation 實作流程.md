5. Implementation（系統實作）

# **5.1 AWS Infrastructure（AWS 基礎設施）**

AWS 為本作品集平台的主要雲端平台，負責網站部署、後端 API、資料儲存以及通知服務等核心功能。整體架構以 Serverless 為設計核心，透過 AWS 提供的受管服務（Managed Services）組成完整的雲端環境，降低基礎設施維護成本，同時提升系統的可用性、擴充性與維護效率。

網站前端完成建置後，部署至 Amazon S3 作為靜態網站託管服務，並透過 CloudFront 提供 HTTPS、全球 CDN 加速及內容快取。使用者操作網站時，所有 API 請求皆經由 API Gateway 轉送至 AWS Lambda 執行後端邏輯，再依照不同功能存取 DynamoDB 或觸發 SNS、SES 等通知服務。各項服務皆依照單一職責進行設計，使網站、API、資料儲存及通知流程彼此獨立，降低系統耦合度，也方便未來持續擴充新功能。

AWS 不僅提供網站運行所需的雲端基礎設施，也成為整個 Multi-Cloud Architecture 的核心。前端負責展示介面與使用者互動，AWS 提供網站與後端服務，而 AI 問答則由 GCP Cloud Run 與 Vertex AI 負責，形成前端、AWS 與 GCP 三個層次分工合作的系統架構。

【Figure 5-1 AWS Infrastructure Architecture】

## **5.1.1 S3 Static Website Hosting（S3 靜態網站託管）**

由於作品集網站採用 React 與 Vite 開發，建置完成後產生的皆為 HTML、CSS 與 JavaScript 等靜態資源，因此選擇 Amazon S3 作為網站託管服務。相較於使用 EC2 建立 Web Server，S3 不需要管理伺服器環境，能降低維護成本，也符合本專案採用 Serverless 架構的設計理念。

網站部署時，前端專案會先透過 Vite 建置產生 dist 目錄，再將靜態檔案同步至 S3 Bucket。S3 負責儲存網站內容，而網站的對外存取則由 CloudFront 負責，因此 S3 不直接提供公開存取。

採用 S3 作為靜態網站託管，不僅簡化了網站部署流程，也方便後續透過 GitHub Actions 自動更新網站內容。當網站新增專案、修改介面或更新技術文件時，只需重新部署靜態檔案即可完成更新，不需額外維護 Web Server。

【Figure 5-2 Amazon S3 Bucket Configuration】

## **5.1.2 CloudFront CDN Integration（CloudFront CDN 整合）**

網站部署至 Amazon S3 後，為了提供 HTTPS 安全連線、全球內容傳遞（CDN）以及更好的存取效能，於 S3 前方部署 Amazon CloudFront 作為網站唯一的對外入口。

CloudFront 以 S3 Bucket 作為 Origin，負責快取網站靜態資源，並透過遍佈全球的 Edge Locations 將內容傳送給使用者，降低延遲並提升網站載入速度。此外，HTTPS 憑證由 ACM 提供，再由 CloudFront 統一管理，因此使用者皆透過 HTTPS 存取網站，而非直接連線至 S3。

網站更新後，GitHub Actions 會同步新的靜態檔案至 S3，並執行 CloudFront Cache Invalidation，確保使用者能取得最新版本的網站內容，而不受舊快取影響。

透過 CloudFront 的整合，網站不僅提升了存取效能，也建立了更安全且穩定的網站發布架構。

【Figure 5-3 CloudFront Distribution Configuration】

## **5.1.3 ACM HTTPS Certificate Integration（ACM HTTPS 憑證整合）**

為了提供安全的 HTTPS 連線，網站使用 AWS Certificate Manager（ACM）申請 SSL/TLS 憑證，並將憑證綁定至 CloudFront Distribution。

由於 CloudFront 支援與 ACM 無縫整合，因此網站不需要自行管理憑證更新或到期續約，大幅降低 HTTPS 維護成本。完成設定後，所有 HTTP 請求皆會自動重新導向至 HTTPS，確保網站資料傳輸過程受到加密保護。

透過 ACM 與 CloudFront 的整合，網站建立了安全且可信任的連線環境，也符合現代網站的基本安全需求。

【Figure 5-4 ACM Certificate Configuration】

## **5.1.4 Cloudflare DNS Integration（Cloudflare DNS 網域解析整合）**

為了讓使用者能透過自訂網域存取網站，本專案使用 Cloudflare 管理 DNS 紀錄，並將網域指向 CloudFront Distribution。

Cloudflare 負責網域解析，而 CloudFront 則負責網站內容傳遞，兩者共同完成網站的對外存取架構。當使用者輸入網站網址時，DNS 會先解析至 CloudFront，再由 CloudFront 提供網站內容。

採用 Cloudflare 管理 DNS 的方式，不僅方便集中管理網域設定，也保留未來使用 Cloudflare 安全性與效能功能的彈性。

【Figure 5-5 Cloudflare DNS Configuration】

## **5.1.5 API Gateway Integration（API Gateway 整合）**

為了讓前端能安全存取後端功能，本專案使用 Amazon API Gateway 作為所有 API 的統一入口，負責接收來自網站的 HTTP 請求，並轉送至對應的 AWS Lambda 函式處理。

API Gateway 將前端與後端解耦，使 React 前端不需要直接存取 AWS 資源，而是透過 API 與後端服務互動，例如網站瀏覽次數統計、專案瀏覽計數及聯絡表單提交等功能皆透過 API Gateway 完成資料交換。

此外，本專案也針對 API 設定 CORS，允許前端網站安全地呼叫後端服務，確保網站在正式部署與本機開發環境下皆能正常運作。

【Figure 5-6 API Gateway Configuration】

## **5.1.6 Lambda Integration（Lambda 無伺服器運算整合）**

AWS Lambda 負責執行網站後端商業邏輯，是整個 Serverless 架構的核心元件。所有 API 請求皆由 API Gateway 轉送至對應的 Lambda Function，再依照不同功能進行資料處理。

目前系統中的 Lambda 主要負責網站瀏覽計數、專案瀏覽計數、聯絡表單處理以及通知流程等功能，並依需求與 DynamoDB、SNS 及 SES 等服務整合。

由於 Lambda 採用事件驅動（Event-driven）執行模式，因此不需要長時間維持伺服器運作，不僅降低營運成本，也能依照請求數量自動擴展，符合 Serverless 架構的設計理念。

【Figure 5-7 AWS Lambda Functions】

## **5.1.7 DynamoDB Integration（DynamoDB 資料庫整合）**

網站所需的瀏覽統計、專案瀏覽紀錄及聯絡表單資料皆儲存於 Amazon DynamoDB。由於資料結構相對簡單，且系統以 API 為主要存取方式，因此選擇 NoSQL 資料庫能提供較佳的彈性與擴充能力。

所有資料皆透過 Lambda 存取 DynamoDB，前端不會直接與資料庫連線，使資料存取流程更加安全，也降低系統耦合度。隨著網站功能增加，仍可依需求新增資料表或調整資料模型，而不影響既有服務。

【Figure 5-8 DynamoDB Tables】

## **5.1.8 SNS and SES Integration（SNS 與 SES 通知服務整合）**

為了讓聯絡表單送出後能即時通知網站管理者，本專案整合 Amazon SNS 與 Amazon SES 建立通知流程。

當使用者成功提交聯絡表單後，Lambda 會完成資料儲存，並依流程觸發通知服務，將相關資訊寄送至指定電子郵件。透過將通知功能獨立於主要業務流程之外，不僅提升系統模組化程度，也方便後續擴充更多通知方式。

SNS 與 SES 的整合，使網站具備基本的事件通知能力，也提升了聯絡功能的實用性。

【Figure 5-9 SNS and SES Integration】

## **5.1.9 AWS CORS Configuration（AWS CORS 設定）**

由於前端網站與後端 API 分別部署於不同的服務，因此瀏覽器會受到同源政策（Same-Origin Policy）的限制。為了讓 React 前端能正常呼叫 API Gateway，本專案於 API Gateway 設定 CORS，允許指定來源存取 API。

在開發階段，CORS 設定允許本機開發環境進行測試；正式部署後，則限制為作品集網站的正式網域，避免未授權來源呼叫 API，提高系統安全性。

完成 CORS 設定後，前端可正常與 AWS 後端服務互動，並避免瀏覽器因跨來源請求而造成 API 呼叫失敗。

【Figure 5-10 API Gateway CORS Configuration】

# **5.2 AWS Functional Modules（AWS 功能模組實作）**

完成 AWS 基礎設施建置後，本專案進一步利用 API Gateway、Lambda、DynamoDB、SNS 與 SES 等服務實作網站的核心功能，包括網站瀏覽計數、專案瀏覽統計、聯絡表單以及通知服務等。

各項功能皆採用 Serverless 架構設計，由 API Gateway 接收請求、Lambda 負責執行商業邏輯，再依功能需求存取 DynamoDB 或觸發通知服務。這種設計讓各功能模組彼此獨立，降低系統耦合度，也方便後續新增或調整功能。

本節將依序介紹各功能模組的設計目的、實作流程及系統整合方式。

【Figure 5-11 AWS Functional Modules Overview】

## **5.2.1 Website Visitor Counter Module（網站瀏覽計數模組）**

網站瀏覽計數器是 Cloud Resume Challenge 的核心功能之一，也是本作品集第一個完成的 Serverless 功能模組。當使用者進入首頁時，前端會呼叫 API Gateway，由 Lambda 更新 DynamoDB 中的瀏覽次數，再將最新結果回傳至前端畫面。

整個流程不需要自行管理伺服器，所有請求皆由 AWS Serverless 服務完成，使網站能依照實際流量自動擴展，同時降低維護成本。

為了避免前端直接存取資料庫，所有資料更新皆經由 Lambda 處理，確保資料存取流程一致，也方便後續加入驗證、日誌紀錄或其他商業邏輯。

此模組除了驗證前後端 API 串接是否正常，也成為後續專案瀏覽計數與其他功能模組的實作基礎。

【Figure 5-12 Website Visitor Counter Workflow】

## **5.2.2 Project View Counter Module（專案瀏覽計數模組）**

除了網站總瀏覽次數之外，作品集也提供各專案的獨立瀏覽統計，方便了解不同專案的瀏覽情況。當使用者開啟 Project Modal 時，前端會呼叫對應的 API，由 Lambda 更新指定專案的瀏覽次數，再將最新結果回傳至前端畫面。

為了避免不同專案共用同一筆資料，每個專案皆使用獨立的識別碼（Project ID）進行統計，並儲存於 DynamoDB 中。此設計讓系統能獨立追蹤各專案的瀏覽數據，也方便未來新增更多作品時直接沿用相同的統計機制。

專案瀏覽計數模組與網站瀏覽計數共用相同的 Serverless 架構，但將資料模型與 API 分開設計，使不同功能彼此獨立，提升系統的可維護性與擴充能力。

【Figure 5-13 Project View Counter Workflow】

## **5.2.3 Contact Form Module（聯絡表單模組）**

聯絡表單提供 Recruiter 或訪客與網站管理者聯繫的管道。使用者填寫表單後，前端會將資料送至 API Gateway，再由 Lambda 負責驗證、處理及儲存資料，最後回傳處理結果至前端。

為了提升使用體驗，前端會在送出前檢查必填欄位，送出後則根據 API 回應顯示成功或失敗訊息，避免使用者重複提交相同內容。

整個流程皆透過 API 完成，不直接與資料庫互動，使前端與後端保持良好的分離，也方便未來增加輸入驗證、垃圾訊息過濾或身份驗證等功能。

【Figure 5-14 Contact Form Workflow】

## **5.2.4 Notification Module（通知模組）**

當聯絡表單成功提交後，系統除了儲存資料外，也會自動觸發通知流程，將聯絡資訊寄送至指定電子郵件，讓網站管理者能即時收到新的訊息。

通知流程由 Lambda 負責觸發，並整合 SNS 與 SES 完成訊息傳遞。由於通知功能獨立於主要資料處理流程，即使通知服務暫時異常，也不會影響聯絡資料的儲存，提高整體系統的穩定性。

此模組讓網站具備完整的聯絡流程，不僅能接收訪客留言，也能即時通知管理者，提升作品集的實用性。

【Figure 5-15 Notification Workflow】

## **5.2.5 Contact Record Persistence（聯絡資料儲存）**

所有聯絡表單資料皆會儲存於 DynamoDB，作為後續查詢與管理使用。每筆資料包含使用者基本資訊、聯絡內容及提交時間，方便後續追蹤每一次聯絡紀錄。

資料儲存流程由 Lambda 統一處理，前端不直接操作資料庫，確保資料格式一致，也降低未授權存取的風險。未來若需要新增欄位或擴充功能，只需調整 Lambda 與資料模型即可，不需修改前端程式。

【Figure 5-16 Contact Record Data Model】

## **5.2.6 DynamoDB Data Model Implementation（DynamoDB 資料模型設計）**

本專案使用 Amazon DynamoDB 儲存網站瀏覽統計、專案瀏覽紀錄及聯絡表單等資料。由於各項功能皆採用 Serverless 架構，資料存取主要由 Lambda 負責，因此選擇 NoSQL 資料庫能提供較高的彈性與擴充能力。

在資料模型設計上，各功能依照不同用途建立獨立的資料結構，例如網站與專案瀏覽計數採用簡單的 Key-Value 結構，而聯絡表單則儲存使用者資訊、訊息內容及提交時間等欄位。透過依功能拆分資料模型，可降低不同模組之間的相互影響，也方便後續新增欄位或調整資料結構。

此外，所有資料存取皆經由 Lambda 統一處理，前端不直接操作資料庫，提升整體資料安全性，也讓後續商業邏輯的擴充更加容易。

【Figure 5-17 DynamoDB Data Model】

## **5.2.7 AWS Lambda Error Handling（AWS Lambda 錯誤處理）**

為了提高系統穩定性，所有 Lambda 函式皆加入基本的錯誤處理機制，針對資料驗證失敗、資料庫操作異常及第三方服務錯誤等情況回傳適當的 HTTP Status Code 與錯誤訊息。

當 API 執行失敗時，Lambda 不會直接回傳系統例外，而是透過統一的回應格式讓前端能正確判斷錯誤原因，並顯示對應提示訊息，避免影響使用者操作體驗。

此外，執行過程中的錯誤資訊皆記錄於 CloudWatch Logs，方便後續除錯與系統維護，也有助於快速定位問題來源。

【Figure 5-18 Lambda Error Handling Flow】

## **5.2.8 AWS Functional Module Summary（AWS 功能模組小結）**

透過 API Gateway、Lambda、DynamoDB、SNS 與 SES 等 AWS 服務的整合，本專案完成了網站瀏覽統計、專案瀏覽計數、聯絡表單及通知服務等核心功能，並建立完整的 Serverless 應用架構。

各功能模組皆採用鬆耦合（Loose Coupling）的設計方式，前端透過 API 與後端互動，後端則依功能需求存取資料庫或通知服務，使各模組能獨立開發、測試與維護，也提升了系統後續擴充的彈性。

AWS 不僅提供穩定的雲端基礎設施，更支撐了整個作品集平台的核心業務流程。透過 Serverless 架構，本系統在降低維護成本的同時，也兼顧了可擴充性、可靠性與開發效率，為後續 GCP AI Assistant 的整合奠定了良好的基礎。

# **5.3 GCP Service Integration（GCP 雲端服務整合）**

為了提供 AI 問答功能，本專案將生成式 AI 服務部署於 Google Cloud Platform（GCP），並與 AWS 前端架構共同組成 Multi-Cloud Architecture。AWS 負責網站部署與後端服務，而 GCP 則負責 AI 推論、知識檢索及對話處理，讓不同雲端平台依照各自優勢分工合作。

整體 AI 後端以 Cloud Run 作為部署平台，FastAPI 提供 API 服務，並整合 Vertex AI、Firestore 及 Cloud Storage 等服務，建立完整的 Retrieval-Augmented Generation（RAG）系統。本節將介紹各項 GCP 服務在系統中的角色，以及它們如何共同支援 AI Assistant 的運作。

【Figure 5-19 GCP Service Architecture】

## **5.3.1 Cloud Run Backend Deployment（Cloud Run 後端部署）**

AI 後端服務部署於 Google Cloud Run，負責執行 FastAPI 應用程式並提供 AI API。Cloud Run 採用 Container 部署方式，系統更新時只需重新建置 Docker Image 並部署新的 Revision，即可完成版本更新，不需自行管理伺服器。

Cloud Run 能依照實際流量自動擴展資源，在沒有請求時可縮減至最低資源使用量，降低整體營運成本，同時維持良好的可用性與部署效率。

【Figure 5-20 Cloud Run Service】

## **5.3.2 FastAPI Backend Service Integration（FastAPI 後端服務整合）**

FastAPI 作為 AI 後端的 API Framework，負責接收前端請求、處理 RAG 流程，並將生成結果回傳至網站。前端所有 AI 問答皆透過 HTTP API 與 FastAPI 溝通，不直接存取 Vertex AI 或 Firestore。

除了 AI 問答之外，FastAPI 也負責文件載入、對話紀錄及串流回應等功能，使所有 AI 邏輯集中於後端管理，降低前端複雜度，也方便後續維護與功能擴充。

【Figure 5-21 FastAPI Architecture】

## **5.3.3 Vertex AI Gemini Integration（Vertex AI Gemini 模型整合）**

本專案使用 Vertex AI Gemini 作為大型語言模型（LLM），負責根據使用者問題與檢索結果產生最終回答。

當 FastAPI 完成文件檢索後，會將相關內容組成 Prompt，再送交 Gemini 產生回應。透過將 LLM 與檢索流程分離，可避免模型直接回答未經驗證的內容，提高回答的準確性與一致性。

【Figure 5-22 Vertex AI Gemini Integration】

## **5.3.4 Vertex AI Embedding Model Integration（Vertex AI Embedding 模型整合）**

除了 Gemini 之外，系統也使用 Vertex AI Embedding Model 將 Markdown 技術文件轉換為向量（Embedding），作為後續語意搜尋的基礎。

文件完成切分（Chunking）後，系統會產生對應的向量並建立索引。當使用者提出問題時，也會先將問題轉換為向量，再進行相似度搜尋，以取得最相關的文件內容。

Embedding 模型主要負責語意表示，而最終回答仍由 Gemini 產生，兩者共同完成完整的 RAG 流程。

【Figure 5-23 Embedding Workflow】

## **5.3.5 Firestore Integration（Firestore 資料庫整合）**

Firestore 主要用於儲存 AI 對話紀錄及相關資訊，使每個聊天 Session 都能保留完整的對話內容。

所有聊天訊息皆透過 FastAPI 統一寫入 Firestore，並依照 Session 進行管理。此設計除了方便後續查詢歷史紀錄，也為 Conversation Memory 功能提供資料來源。

【Figure 5-24 Firestore Conversation Storage】

## **5.3.6 Google Cloud Storage Integration（Google Cloud Storage 文件儲存整合）**

Google Cloud Storage 作為 AI 知識庫文件的儲存空間，負責管理 Markdown 技術文件及相關資源。文件更新後，可重新執行文件匯入流程，建立新的 Embedding 與索引，使 AI Assistant 能取得最新的專案內容。

透過將文件與程式分離管理，可降低維護成本，也方便後續持續擴充更多專案與技術文件。

【Figure 5-25 Google Cloud Storage】

## **5.3.7 GCP IAM and Service Account Configuration（GCP IAM 與 Service Account 設定）**

為了確保各項 GCP 服務能安全互相存取，本專案使用 Service Account 管理 Cloud Run、Vertex AI、Firestore 及 Cloud Storage 的存取權限。

不同服務依照最小權限原則（Principle of Least Privilege）配置 IAM Role，避免使用過高權限執行 AI 服務，提高整體系統安全性，也降低憑證外洩所造成的風險。

【Figure 5-26 IAM Configuration】

## **5.3.8 GCP Environment Configuration（GCP 環境變數與服務設定）**

AI 後端所需的模型名稱、GCP Project ID、Region、資料庫設定及其他系統參數皆透過環境變數管理，避免將敏感資訊直接寫入程式碼。

透過集中管理環境設定，不同部署環境可使用不同參數，而不需修改程式內容，也讓 Cloud Run 部署流程更加一致且容易維護。

【Figure 5-27 Environment Configuration】

# **5.4 GCP RAG Functional Modules（GCP RAG 功能模組實作）**

AI Assistant 是本專案的核心功能之一，主要提供 Recruiter 與使用者透過自然語言了解作品集內容、系統架構及技術細節。為了避免大型語言模型產生與專案無關的回答，系統採用 Retrieval-Augmented Generation（RAG）架構，先從知識庫檢索相關文件，再將檢索結果提供給大型語言模型生成最終回應。

整個 RAG 系統由 FastAPI 負責流程控制，並整合文件解析、向量化、語意檢索、上下文組裝及 Gemini 回應生成等模組，使 AI 回答皆建立於專案技術文件之上，提高回答的準確性與可信度。

【Figure 5-28 RAG System Overview】

## **5.4.1 FastAPI API Module（FastAPI API 模組）**

FastAPI 作為 AI 後端的核心入口，負責接收前端問題、協調 RAG 流程，並將最終回應傳回網站。

當使用者提出問題後，FastAPI 會依序完成問題分析、文件檢索、上下文組裝及模型推論等工作，再透過 API 或 SSE 串流方式將回答回傳至前端。所有 AI 邏輯皆集中於 FastAPI 管理，使前端僅需負責介面呈現，大幅降低系統耦合度。

【Figure 5-29 FastAPI Request Flow】

## **5.4.2 Document Ingestion Module（文件匯入模組）**

知識庫中的技術文件皆以 Markdown 格式維護。當文件新增或更新時，系統會重新執行文件匯入流程，讀取所有 Markdown 檔案並建立最新索引。

文件匯入模組負責統一整理各專案文件，作為後續 Chunking、Embedding 及語意檢索的資料來源，確保 AI 能根據最新內容回答問題。

【Figure 5-30 Document Ingestion Workflow】

## **5.4.3 Markdown Parsing Module（Markdown 文件解析模組）**

文件匯入後，系統會解析 Markdown 內容，移除不必要的格式資訊，同時保留標題、段落及程式碼區塊等結構，方便後續建立知識索引。

透過保留文件原有的層級關係，AI 在回答問題時能取得更完整的上下文，提高回答品質。

【Figure 5-31 Markdown Parsing Process】

## **5.4.4 Chunking and Metadata Module（Chunking 與 Metadata 處理模組）**

由於大型語言模型無法一次處理整份文件，因此系統會將 Markdown 文件切分為多個 Chunk，並為每個 Chunk 建立 Metadata，例如專案名稱、文件來源及章節資訊。

透過 Chunking，可提升檢索效率；Metadata 則協助系統快速篩選相關內容，避免檢索到不同專案或無關文件。

【Figure 5-32 Chunking Workflow】

## **5.4.5 Embedding Generation Module（Embedding 向量生成模組）**

完成 Chunking 後，系統會使用 Vertex AI Embedding Model 將每個 Chunk 轉換為向量表示（Embedding），建立知識庫索引。

當使用者提出問題時，問題也會被轉換為向量，再與知識庫中的文件向量進行相似度比較，找出最相關的內容，作為後續生成回答的依據。

【Figure 5-33 Embedding Generation】

## **5.4.6 Retrieval Module（RAG 檢索模組）**

檢索模組負責根據使用者問題搜尋最相關的文件內容，是整個 RAG 系統的重要核心。

系統會根據問題向量搜尋知識庫，並依照相似度排序取得最相關的文件片段，再交由後續流程組裝上下文。透過檢索機制，AI 回答不再依賴模型本身的知識，而是以作品集中的技術文件作為主要依據，提高回答的可信度。

【Figure 5-34 Retrieval Workflow】

## **5.4.7 Context Assembly Module（上下文組裝模組）**

完成文件檢索後，系統會將多個相關 Chunk 組合成完整的上下文（Context），並加入 Prompt 一同送至 Gemini 模型。

上下文組裝的目的在於提供足夠的背景資訊，避免模型因資訊不足而產生不完整或錯誤的回答，同時也讓 AI 能根據不同問題引用適當的技術文件內容。

【Figure 5-35 Context Assembly】

## **5.4.8 Response Generation Module（回應生成模組）**

完成上下文組裝後，系統將 Prompt 與 Context 傳送至 Vertex AI Gemini，由大型語言模型生成最終回答。

由於回答建立在檢索結果之上，因此 AI 能根據專案實際內容回答問題，而非依賴模型既有知識，大幅降低產生錯誤資訊（Hallucination）的機率。

【Figure 5-36 Response Generation】

## **5.4.9 Conversation Memory Module（對話記憶模組）**

為了提供較自然的對話體驗，系統會保存同一個 Session 的聊天紀錄，使 AI 能理解目前對話的上下文，而不需要使用者重複描述相同內容。

所有聊天紀錄皆儲存於 Firestore，並依 Session 進行管理，使不同使用者的對話彼此獨立，也方便後續查詢與管理。

【Figure 5-37 Conversation Memory】

## **5.4.10 RAG Analytics Module（RAG 分析紀錄模組）**

為了方便系統除錯與效能分析，RAG 系統會記錄每次查詢的重要資訊，例如檢索文件、回應時間及相關執行紀錄。

這些紀錄有助於分析檢索品質、調整 Chunk 大小及優化 Prompt，也為後續 RAG 評估與系統改善提供依據。

【Figure 5-38 RAG Analytics】

## **5.4.11 SSE Streaming Module（SSE 串流回應模組）**

AI 回答採用 Server-Sent Events（SSE）串流方式逐步回傳至前端，而非等待完整回答生成後一次傳送。

透過串流回應，使用者可以即時看到 AI 生成內容，縮短等待時間並提升互動體驗。當回答完成後，系統再回傳最終狀態，完成整個 AI 問答流程。

【Figure 5-39 SSE Streaming Workflow】

# **5.5 Infrastructure as Code with Terraform（Terraform 基礎設施即程式碼）**

隨著專案逐漸整合 AWS、GCP 及多項雲端服務，手動建立與維護雲端資源變得越來越困難。為了提高部署一致性、降低人工操作錯誤，並讓整個基礎設施能納入版本控制，本專案導入 Terraform 作為 Infrastructure as Code（IaC）工具，統一管理雲端資源。

透過 Terraform，AWS 與 GCP 的基礎設施皆可以程式碼方式描述，不僅方便重複部署，也讓整個雲端架構能與專案程式碼一同維護，提升系統的可維護性與可重現性。

【Figure 5-40 Terraform Architecture】

## **5.5.1 Terraform Design Purpose（Terraform 設計目的）**

Terraform 的導入目的並非取代雲端平台，而是將基礎設施管理流程程式化。相較於透過 AWS Console 或 Google Cloud Console 手動建立資源，Terraform 能以宣告式（Declarative）的方式管理整個雲端環境，確保不同環境皆能維持一致的設定。

此外，Terraform 配合 Git 版本控制，也讓基礎設施的每一次修改都有完整紀錄，方便後續追蹤與維護。

## **5.5.2 Terraform Project Structure（Terraform 專案架構）**

Terraform 專案依照不同雲端平台及功能進行模組化管理，將 AWS、GCP 及共用設定拆分為獨立檔案，避免所有資源集中於單一設定檔，提升程式碼可讀性與後續維護效率。

透過模組化設計，未來新增雲端服務或調整既有資源時，只需修改對應模組即可，不會影響其他基礎設施。

【Figure 5-41 Terraform Project Structure】

## **5.5.3 AWS Infrastructure with Terraform（AWS 基礎設施 Terraform 實作）**

AWS 相關資源透過 Terraform 統一管理，包括 S3、CloudFront、API Gateway、Lambda、DynamoDB 及 IAM 等服務。當基礎設施需要調整時，只需修改 Terraform 設定並重新部署，即可完成資源更新，而不需逐一透過 AWS Console 操作。

此方式降低了人工設定錯誤，也讓整個 AWS 環境更容易重建與維護。

## **5.5.4 GCP Infrastructure with Terraform（GCP 基礎設施 Terraform 實作）**

除了 AWS，本專案也利用 Terraform 管理 GCP 雲端資源，包括 Cloud Run、Firestore、Cloud Storage、IAM 及相關設定。透過相同的 IaC 管理方式，使 AWS 與 GCP 維持一致的部署流程，也降低跨平台管理的複雜度。

## **5.5.5 Terraform Variables and Environment Configuration（Terraform 變數與環境設定）**

為了提高 Terraform 的可重複使用性，本專案將 Project ID、Region、Bucket Name 及其他環境相關資訊集中管理於 Variables 中，避免將環境設定直接寫入資源定義。

透過變數化設計，不同部署環境可使用相同的 Terraform 程式，只需調整對應變數即可完成部署。

## **5.5.6 Terraform State Management（Terraform State 管理）**

Terraform 使用 State File 記錄目前基礎設施狀態，作為後續資源比對與更新依據。透過 State 管理，Terraform 能判斷哪些資源需要建立、修改或刪除，避免重複建立相同資源。

在實作過程中，也定期確認 State 與實際雲端資源一致，確保部署結果符合預期。

## **5.5.7 Importing Existing Cloud Resources（既有雲端資源匯入 Terraform）**

由於部分 AWS 與 GCP 資源已於專案初期建立，因此導入 Terraform 時，利用 Import 功能將既有資源納入 Terraform 管理，而非重新建立新的資源。

透過此方式，專案能逐步完成 IaC 轉換，同時避免影響已正常運作的正式環境。

## **5.5.8 Terraform Validation and Plan Review（Terraform 驗證與 Plan 檢查）**

每次部署前，皆會先執行 Terraform Validate 與 Terraform Plan，確認設定檔語法正確，並預先檢查即將變更的資源內容，再進行正式部署。

此流程能有效降低錯誤部署風險，也讓每次基礎設施更新都有明確的變更紀錄。

## **5.5.9 Terraform Limitations and Manual Verification（Terraform 限制與人工驗證）**

雖然 Terraform 能管理大部分雲端資源，但部分服務仍需要人工設定或額外驗證，例如網域驗證、SSL 憑證驗證及部分第三方服務整合。因此，本專案採用 Terraform 與人工驗證並行的方式，兼顧自動化部署與實際管理需求。

透過 Infrastructure as Code 的導入，本專案建立了一套可重複部署、可版本控制且易於維護的 Multi-Cloud Infrastructure，也為後續 CI/CD 自動化部署奠定基礎。

【Figure 5-42 Terraform Deployment Workflow】

# **5.6 CI/CD Pipeline Implementation（CI/CD 自動化部署）**

隨著專案持續開發與功能增加，手動部署容易造成版本不一致或遺漏更新。因此，本專案導入 GitHub Actions 建立 CI/CD（Continuous Integration / Continuous Deployment）流程，將程式建置、測試及部署自動化，降低人工操作錯誤，同時提升部署效率。

前端、AWS 後端、GCP AI Backend 及 Terraform 皆依照不同需求建立獨立的 Workflow，使各項服務可獨立部署與維護，提升整體系統的彈性與可維護性。

【Figure 5-43 CI/CD Architecture】

## **5.6.1 CI/CD Design Purpose（CI/CD 設計目的）**

CI/CD 的主要目的是將原本手動執行的建置與部署流程自動化，確保每次程式更新皆經過一致的流程，提高部署品質與系統穩定性。

透過 GitHub Actions，開發者只需將程式推送至 GitHub，即可自動執行建置、測試及部署，大幅減少人工操作所帶來的風險。

## **5.6.2 GitHub Actions Workflow Structure（GitHub Actions Workflow 架構）**

本專案依照不同系統建立多組 GitHub Actions Workflow，分別負責前端、AWS 後端、GCP AI Backend 及 Terraform 等部署流程。

各 Workflow 皆採用模組化設計，可依需求獨立執行，避免單一流程影響整個系統，也方便後續新增更多部署流程。

【Figure 5-44 GitHub Actions Workflow】

## **5.6.3 Frontend CI/CD Pipeline（前端 CI/CD 流程）**

當前端程式更新後，GitHub Actions 會自動安裝相依套件、執行建置，並將產生的靜態網站部署至 Amazon S3，最後更新 CloudFront 快取，讓使用者能立即存取最新版本的網站。

透過自動化部署，前端更新流程更加一致，也降低手動部署所造成的版本錯誤。

## **5.6.4 AWS Backend CI/CD Pipeline（AWS 後端 CI/CD 流程）**

AWS 後端功能更新後，Workflow 會依照部署需求更新 Lambda Function、API Gateway 或相關 AWS 資源，確保前端 API 能正常使用最新版本的後端服務。

透過自動化部署，後端更新流程更加穩定，也提升維護效率。

## **5.6.5 GCP Backend CI/CD Pipeline（GCP 後端 CI/CD 流程）**

AI Backend 更新後，GitHub Actions 會重新建置 Docker Image，並部署至 Cloud Run 產生新的 Revision，使 FastAPI 與 RAG 系統能快速完成版本更新。

Cloud Run 支援 Revision 管理，因此每次部署皆保留歷史版本，方便後續驗證及必要時進行版本回復。

## **5.6.6 Terraform CI Validation Pipeline（Terraform CI 驗證流程）**

Terraform 相關變更提交後，Workflow 會自動執行格式檢查、語法驗證及 Terraform Plan，確認基礎設施變更內容，再依部署流程更新雲端資源。

此流程可提前發現設定錯誤，降低基礎設施部署失敗的風險。

## **5.6.7 Secrets and Environment Variables Management（Secrets 與環境變數管理）**

所有 API Key、Access Token 及雲端服務憑證皆透過 GitHub Secrets 管理，不直接儲存在程式碼中，避免敏感資訊外洩。

不同部署流程依需求讀取對應的 Secrets，使各項 Workflow 能安全存取 AWS 與 GCP 服務。

## **5.6.8 Deployment Verification（部署驗證）**

完成部署後，系統會確認網站是否可正常存取、API 是否正常運作，以及 AI Assistant 是否能正確回應，確保部署成功且各項功能維持正常運作。

若部署異常，可依 Workflow Log 快速定位問題並重新部署。

## **5.6.9 Pipeline Failure Handling（Pipeline 錯誤處理）**

當 Workflow 執行失敗時，GitHub Actions 會停止後續部署流程，並保留完整執行紀錄供開發者檢查。透過 Workflow Log，可快速分析建置、部署或驗證階段的錯誤原因，降低問題排查時間。

建立 CI/CD 後，不僅提升了部署效率，也讓整個 Multi-Cloud 專案具備一致且可重複的部署流程，降低人工操作風險並提升系統維護品質。

【Figure 5-45 CI/CD Deployment Workflow】

# **5.7 Frontend Implementation（前端實作）**

前端是整個作品集平台與使用者互動的入口，負責展示個人履歷、專案內容以及 AI Assistant 等功能。雖然本專案的核心價值在於 AWS 與 GCP 雲端架構，但前端仍扮演整合各項服務的重要角色，將後端 API、AI 問答及技術文件整合於同一個使用介面。

前端採用 React 與 Vite 開發，並以元件化（Component-Based）的方式建構各項功能，使畫面、商業邏輯及 API 呼叫彼此分離，提高程式碼的可維護性與後續擴充能力。

【Figure 5-46 Frontend Architecture Overview】

## **5.7.1 Frontend Technology Stack（前端技術選型）**

前端以 React 作為主要開發框架，並搭配 Vite 建立開發與建置環境。React 的元件化設計讓網站各功能模組，例如首頁、Project Modal、AI Assistant 及 Documentation Viewer，都能獨立開發與維護；Vite 則提供快速的開發體驗及高效率的正式環境建置流程。

介面樣式主要採用原生 CSS 實作，搭配 Design Tokens 統一管理色彩與版面配置，方便後續調整深色模式、多語系及整體視覺風格。技術文件則使用 Markdown 撰寫，並整合 Mermaid 呈現系統架構圖，使文件內容與程式碼能同步進行版本控制。

## **5.7.2 Frontend Architecture and UI Design（前端架構與介面設計）**

網站採用 Single Page Application（SPA）架構，主要包含首頁、技能介紹、作品集、Project Modal、AI Assistant 及聯絡頁面等功能。所有畫面皆由 React 元件組成，降低不同模組間的耦合度，也讓後續新增功能時能維持一致的開發方式。

除了作品展示之外，前端也整合 AWS API 及 GCP AI Backend。網站瀏覽統計、專案瀏覽次數及聯絡表單透過 AWS API 提供服務；AI Assistant 則與 GCP RAG 系統連接，提供專案問答與技術文件查詢功能，使前端成為整個 Multi-Cloud 系統的操作入口。

【Figure 5-47 Frontend Component Architecture】

## **5.7.3 Frontend Integration and Validation（前端整合與驗證）**

完成前端開發後，分別針對網站介面、響應式版面、多語系切換、深色模式及 API 串接進行驗證，確認各項功能皆能正常運作。正式部署前，也透過 Vite 建置流程確認網站可成功產生正式版本，並完成 AWS 與 GCP 後端整合測試。

經過整合驗證後，網站已能正常展示作品集內容，並與 AWS Serverless 服務及 GCP AI Backend 穩定整合，提供完整的作品展示與 AI 問答體驗。

【Figure 5-48 Frontend Validation】

# **5.8 Testing, Validation, and Troubleshooting（整合測試、驗證與問題排查）**

完成各項功能開發後，針對整體系統進行功能驗證與整合測試，確認前端、AWS 服務、GCP AI Backend 及各項 API 能正常協同運作。此外，在開發過程中也針對 CORS、CloudFront 快取、Cloud Run 部署及 Vertex AI 權限等問題進行排查與修正，提升系統穩定性與可靠性。

【Figure 5-49 System Testing Overview】

# **5.9 Implementation Summary（實作總結）**

本專案以 AWS 與 GCP 建立 Multi-Cloud Architecture，結合 Serverless、Generative AI、Infrastructure as Code 及 CI/CD 等技術，完成一套具備作品展示、AI 問答及雲端服務整合能力的作品集平台。

在 AWS 部分，完成網站部署、API Gateway、Lambda、DynamoDB、SNS、SES 等服務整合，建立完整的 Serverless 應用架構；在 GCP 部分，則透過 Cloud Run、FastAPI、Vertex AI、Firestore 及 RAG 技術，建構 AI Assistant 與知識檢索系統，使網站不只是展示作品，更能提供互動式技術問答。

此外，透過 Terraform 管理雲端基礎設施、GitHub Actions 建立自動化部署流程，以及完整的系統驗證與問題排查，使整個專案具備良好的可維護性與擴充能力。

整體而言，本專案不僅完成了 Multi-Cloud 雲端架構的實作，也驗證了 Serverless、Generative AI、Infrastructure as Code 及 DevOps 等技術在實際專案中的整合方式。透過本次實作，除了累積 AWS 與 GCP 雲端開發經驗，也建立了一套可持續擴充與維護的雲端作品集平台，作為未來學習與職涯發展的重要基礎。