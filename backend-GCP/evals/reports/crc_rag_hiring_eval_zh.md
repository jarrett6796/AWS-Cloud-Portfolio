# CRC-RAG Hiring Evaluation - zh-TW

- Generated at: `2026-07-04T04:16:38.242872+00:00`
- Questions: `100`
- Overall pass rate: `5.0%`
- HR pass rate: `7.5%`
- Technical hiring manager pass rate: `3.33%`
- Citation success rate: `57.0%`
- Retrieval accuracy: `86.0%`
- Grounding success: `54.0%`
- Average retrieval score: `0.709`
- Average response time ms: `4835.0748`

## Failure Reasons

- citation_validation: `43`
- insufficient_context: `46`
- language_mismatch: `52`
- missing_keyword: `93`
- safe_no_answer: `46`
- wrong_retrieval: `14`

## Failed Questions

### zh_hr_001

- Question: 如果人資只快速看過你的履歷，你會怎麼介紹這個 CRC-RAG 專題？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge`

Answer excerpt:

這個 CRC-RAG 專題是一個結合了雲端工程實踐、生成式 AI 應用與成本效益考量的智慧型技術作品集平台 [S5]。 它採用 Retrieval-Augmented Generation (RAG) 技術，透過結合知識檢索與大型語言模型 (LLM)，讓 AI 助理能夠理解作品內容、架構設計與技術決策，提供更準確且具上下文的互動式問答體驗 [S5]。 主要特色包括： * **提升回答品質**：RAG 系統在回答問題前會先取得相關上下文資訊，提高回答的可信度並降低模型幻覺問題 [S5]。檢索模組會根據使用者問題搜尋最相關的文件內容，並依照相似度排序取得文件片段，作為 AI 回答的依據 [S4]。 * **Serverless 架構**...

### zh_hr_002

- Question: 這個專題除了建立作品集網站之外，還支援你哪一個職涯目標？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge, 雲端`

Answer excerpt:

根據索引的專案文件，除了建立作品集網站之外，此專題旨在解決求職者與企業在資訊傳遞上的落差，透過智慧型作品集平台整合專案知識、提供即時互動，並協助不同背景的閱讀者快速理解專案內容 [S3]。 然而，文件中並未明確說明此專題具體支援Jarrett的哪一個職涯目標。

### zh_hr_003

- Question: 哪些內容可以看出你把雲端理論轉成實際作品的能力？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `作品集, Cloud Resume Challenge, 雲端`

Answer excerpt:

Based on the indexed project documents, the ability to translate cloud theory into practical work can be seen in the "事件通知與表單聯絡 序列圖" (Event Notification and Form Contact Sequence Diagram) [S3], "瀏覽次數 序列圖" (Page Views Sequence Diagram) [S4], and the "RAG 系統設計" (RAG System Design) [S5].

### zh_hr_004

- Question: 文件中哪些地方能看出你同時承擔 AWS 與 Google Cloud 的實作責任？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge`

Answer excerpt:

根據文件內容，以下幾點能看出專案同時承擔 AWS 與 Google Cloud 的實作責任： * 本專題是結合 AWS 與 Google Cloud 的多雲個人履歷作品平台，簡稱雲端履歷 [S1]。 * 該系統以 Amazon Web Service 作為網站基礎架構，負責前端託管、內容傳遞與無伺服器服務；同時利用 Google Cloud 建立 Retrieval-Augmented Generation（RAG）知識檢索系統，打造能夠理解專案內容的 AI 助理 [S1]。 * 本專案以 AWS 與 GCP 建立 Multi-Cloud Architecture，結合 Serverless、Generative AI、Infras...

### zh_hr_005

- Question: 這個專題如何讓雲端或後端職缺的面試官看見你的成長？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `作品集, Cloud Resume Challenge, 雲端`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_007

- Question: 它如何補足短履歷無法呈現完整專案細節的限制？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `人資, 作品集, AI`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_009

- Question: 這個專題和一般 Cloud Resume Challenge 最大的差異在哪裡？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `人資`

Answer excerpt:

這個專案與一般的 Cloud Resume Challenge 最大的差異在於，它以 AWS Cloud Resume Challenge 為基礎，進一步導入 Retrieval-Augmented Generation (RAG) 技術，將傳統靜態作品集轉變為具備互動式問答能力的 AI 技術助理 [S1]。 一般的 Cloud Resume Challenge 旨在透過建立個人履歷網站，將雲端理論知識轉化為實際應用能力，涵蓋前端、後端、雲端部署、資料庫、API 開發及 CI/CD 等核心實務內容 [S3]。 而本專案則結合了 Cloud Resume Challenge 的雲端實作理念與 Serverless RAG 的智慧化架構...

### zh_hr_010

- Question: 如果未來要變成更完整的面試輔助工具，這個專題可以怎麼擴充？
- Expected source: `Overview 綜覽.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `人資, 作品集, AI`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_011

- Question: 你會如何用非技術人員聽得懂的方式說明 AWS 與 GCP 的分工？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `技術文件, 溝通`

Answer excerpt:

在這個專案中，AWS 和 GCP 扮演著不同的角色，就像一個團隊分工合作一樣： * **AWS (Amazon Web Services)** 負責網站的「骨架」和「運作」。它提供網站的基礎設施，包括託管網站前端、處理後端邏輯、儲存資料以及發送通知服務等 [S1, S3]。簡單來說，AWS 讓網站能夠被大家看到，並且處理網站背後的所有運作 [S3]。 * **GCP (Google Cloud Platform)** 則負責網站的「智慧大腦」。它建立了 AI 助理和知識檢索系統，讓使用者可以直接向 AI 提問，了解專案的架構和實作細節 [S1, S2]。所以，GCP 讓網站不只是一個展示平台，還能提供互動式的技術問答 [S2, S3...

### zh_hr_012

- Question: 哪些內容適合先跟人資說明，哪些技術細節應該留給工程面試？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `技術文件, 溝通`

Answer excerpt:

根據索引專案文件，非技術背景的人資（HR）可能更關注專案成果、個人貢獻以及職務相關性 [S3]。而技術主管或面試官則更重視架構設計、技術選型原因、系統擴充性以及問題解決能力 [S3]。

### zh_hr_013

- Question: 這些專案文件如何幫助讀者不用直接看完整程式碼也能理解作品？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `技術文件, 專案, 溝通`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_014

- Question: 如果篩選面試只有兩分鐘，你會怎麼說明這個專題成果？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `技術文件, 溝通`

Answer excerpt:

這個專題旨在解決求職者與企業在履歷和作品集審核過程中面臨的資訊傳遞落差問題 [S3]。 現有作品集難以完整呈現專案的技術細節、設計思維與解決方案，而企業在有限時間內審閱大量資料時，也難以深入理解專案全貌 [S3]。即使生成式AI興起，也缺乏對求職者個人專案的完整理解，無法像與專案作者對話般快速獲得答案 [S3]。 因此，本專案的核心成果是建立一個智慧型作品集平台，它能夠整合專案知識、提供即時互動，並協助不同背景的閱讀者（如HR或技術主管）快速理解專案內容，有效彌補資訊落差，提升求職與招募流程的效率 [S3]。

### zh_hr_015

- Question: 哪些文件設計能讓未來加入的隊友更快理解與接手？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `技術文件, 專案, 溝通`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_016

- Question: 你在求職資訊傳遞上看見什麼痛點，這個系統如何處理？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `資訊落差, 解決方案, 多雲`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_017

- Question: 這個專題如何讓不同背景的讀者取得不同層次的資訊？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `資訊落差, 解決方案, 多雲`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_018

- Question: 哪些證據顯示你不是為了追流行才加入 AI，而是真的在解決溝通問題？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `資訊落差, 多雲`

Answer excerpt:

本專案整合 AI 是為了解決求職者與企業之間的資訊傳遞落差，而非僅是追隨流行。以下是相關證據： * **現有溝通問題**： * 求職者難以在有限的履歷篇幅中完整表達專案的技術細節、設計思維與技術深度，即使透過作品集也難以完整呈現 [S1]。 * 企業（招聘主管、面試官、人資）審閱大量履歷與作品集時，難以投入過多時間深入研究，且專案資訊分散於不同平台，需額外時間整理 [S1]。 * 傳統作品集難以根據不同閱讀者（如非技術背景的人資或技術主管）的需求，提供對應層級的資訊 [S1]。 * 當面試官希望深入了解專案細節時，傳統方式仍需閱讀文件、程式碼或架構圖，無法像與專案作者對話般快速獲得答案 [S1]。 * 即使現代 AI 具備理解與推理...

### zh_hr_019

- Question: 哪一個設計最能看出你有考量人資審閱時間有限的情境？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `資訊落差, 解決方案, 多雲`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_020

- Question: 如果面試官問為什麼不用單一雲端平台，你會怎麼說明多雲選擇？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `資訊落差, 解決方案, 多雲`

Answer excerpt:

Based on the indexed project documents, I do not know why a multi-cloud choice would be explained over a single cloud platform [S1, S2, S3, S4, S5]. The documents discuss challenges in conveying technical details like "雲端服務應用" (cloud service application) in resumes, but they do not elaborate on specific cloud platform...

### zh_hr_021

- Question: 為什麼 Cloud Resume Challenge 適合作為這個專題的起點？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `無伺服器, RAG`

Answer excerpt:

Cloud Resume Challenge (CRC) 適合作為這個專題的起點，原因如下： * 它以專題導向（Project-Based Learning）的方式，鼓勵學習者透過建立個人履歷網站，將雲端理論知識轉化為實際應用能力 [S3]。 * CRC 涵蓋前端開發、後端服務、雲端部署、資料庫、API 開發以及 CI/CD 等核心實務內容，讓學習者能夠從零開始完成一個完整的雲端專案，並了解系統從開發、部署到正式上線的完整流程 [S3]。 * 此挑戰的核心目標不僅是建立一個履歷網站，更希望幫助初學者透過實際專案驗證自身的雲端實作能力，並累積可應用於作品集與求職過程中的專案經驗 [S3]。

### zh_hr_022

- Question: 這個專題讓你學到哪些無伺服器架構的實務能力？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge, 無伺服器, RAG`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_023

- Question: RAG 元件如何展現你不只會部署靜態網站？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `無伺服器`

Answer excerpt:

RAG 系統展現了超越靜態網站部署的能力，體現在以下幾個方面： * **智慧化架構與雲端工程實踐**：本專案採用 Serverless 架構設計，利用雲端服務的按需運算特性，實現系統自動擴展並在閒置時降低資源消耗 [S4]。這結合了 Cloud Resume Challenge 的雲端實作理念與 Serverless RAG 的智慧化架構，是一個兼具雲端工程實踐、生成式 AI 應用與成本效益考量的智慧型技術作品集平台 [S4]。 * **複雜的 AI 知識管理與檢索系統**：RAG 系統不僅是單純的 AI 問答功能，而是一套結合雲端架構、知識管理、語義檢索、LLM 回應生成與評估回饋的完整 AI 助理系統 [S5]。 * 它包含文件...

### zh_hr_024

- Question: 你會用哪一段實作流程來說明自己完成完整雲端工作流的能力？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge, 無伺服器, RAG`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_025

- Question: 這個專題如何連結到雲端、後端、DevOps 或 AI 系統相關職位？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Resume Challenge, 無伺服器, RAG`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_026

- Question: 如果新工程師加入，哪份文件最適合先協助他理解系統架構？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `模組`

Answer excerpt:

根據索引專案文件，目前提供的內容中沒有一份文件明確指出最適合協助新工程師理解系統架構的總體概覽文件。雖然有提及「事件通知與表單聯絡 序列圖」[S4] 和「瀏覽次數 序列圖」[S5]，但這些是特定功能的序列

### zh_hr_027

- Question: 模組邊界如何讓前端、AWS 與 GCP 的工作更容易分工？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `模組, 文件`

Answer excerpt:

前端、AWS 與 GCP 的工作分工如下： * **前端** 負責展示介面與使用者互動 [S3]。 * **AWS** 提供網站與後端服務，包括網站部署、API Gateway、Lambda、DynamoDB、SNS、SES 等服務整合，建立完整的 Serverless 應用架構 [S2, S3]。AWS 服務依照單一職責設計，降低系統耦合度 [S3]。 * **GCP** 負責 AI 問答，透過 Cloud Run、FastAPI、Vertex AI、Firestore 及 RAG 技術，建構 AI Assistant 與知識檢索系統 [S2, S3]。 這種分工形成前端、AWS 與 GCP 三個層次分工合作的系統架構 [S3]。

### zh_hr_028

- Question: 正式維護前，哪些系統部分最需要清楚的交接說明？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `模組, 文件, 系統架構`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_029

- Question: 如果產品經理在意使用者體驗，你會怎麼說明 RAG 助理的價值？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `系統架構`

Answer excerpt:

對於在意使用者體驗的產品經理，RAG 助理的價值體現在以下幾個方面： * **提高回答的可信度與準確性**：RAG 系統的 AI 回答不再依賴模型本身的知識，而是以專案中的技術文件作為主要依據 [S4, S5]。這能大幅降低 AI 產生幻覺 (hallucination) 的風險，確保使用者獲得的資訊是基於實際專案文件且可追溯的 [S5]。 * **提供高度相關的資訊**：透過精準的檢索機制，系統能根據使用者問題搜尋最相關的文件內容，並結合語義搜尋、元數據過濾與排序，找到最符合當前專案情境的知識內容 [S4, S5]。這意味著使用者能快速獲得他們真正需要的資訊。 * **支援流暢的多輪對話**：系統設計了對話記憶管理，能夠保存同一個...

### zh_hr_030

- Question: 哪些內容能看出你同時記錄了使用者價值與技術設計？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `模組, 系統架構`

Answer excerpt:

根據索引的專案文件，標題為「背景 → 痛點 → 解方」的內容可能同時記錄了使用者價值（痛點）與技術設計（解方）[S1]。

### zh_hr_031

- Question: 你會如何用商業語言向人資說明 Retrieval-Augmented Generation？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 無伺服器, AWS`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_032

- Question: 為什麼系統要先檢索專案文件，而不是只讓通用語言模型直接回答？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 無伺服器, AWS`

Answer excerpt:

通用語言模型（General Language Models, LLMs）的知識主要來自公開資料與通用訓練內容，因此不具備對求職者個人專案的完整理解 [S3]。當需要評估特定專案的架構設計、技術選型、開發歷程或問題解決方式時，LLMs 缺乏專案相關的背景知識與資訊 [S3]。 因此，系統需要先檢索專案文件，以提供 LLMs 專案相關的背景知識與資訊，使其能夠理解專案內容、技術背景與設計思維，進而協助企業與求職者建立更有效率的資訊溝通橋樑 [S3]。

### zh_hr_034

- Question: 這個專題如何展現你對無伺服器服務的實務理解？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 無伺服器, AWS`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_035

- Question: 無伺服器設計如何幫助個人作品集控制營運成本？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 無伺服器, AWS`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_036

- Question: 如果要讓這個專題更貼近真實招募流程，你會優先補強什麼？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 擴充, 優化`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_037

- Question: 如果面試官問後續發展，你會提到哪些可擴充方向？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 擴充, 優化`

Answer excerpt:

Based on the indexed project documents, I do not know what scalable directions would be mentioned for future development if an interviewer asked about them [S1, S2, S3]. The context primarily focuses on the problems and pain points that the project aims to solve, such as the information gap between job seekers and comp...

### zh_hr_038

- Question: 如果網站流量突然增加，你會優先重新評估哪一個架構取捨？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 擴充, 優化`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_039

- Question: 當你加入更多作品時，這個專題如何持續支援你的職涯敘事？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 擴充, 優化`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_hr_040

- Question: 在把 AI 助理作為求職工具展示前，為什麼需要先做評估？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `擴充, 優化`

Answer excerpt:

在將 AI 助理作為求職工具展示前，需要先進行評估，因為即使現代 AI 具備強大的理解與推理能力，其知識仍主要來自公開資料與通用訓練內容，並不具備對求職者個人專案的完整理解 [S1]。當需要評估特定專案的架構設計、技術選型、開發歷程或問題解決方式時，AI 缺乏專案相關的背景知識與資訊 [S1]。

### zh_tech_001

- Question: 請走過作品集交付所用的 AWS 服務，並說明每個服務的責任邊界。
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `language_mismatch`
- Possible fix: Add explicit answer-language instructions for the requested locale.
- Missing keywords: ``

Answer excerpt:

Jarrett's portfolio platform utilizes AWS as its primary cloud platform, responsible for website deployment, backend API, data storage, and notification services [S2]. The overall architecture is serverless, leveraging AWS managed services to reduce maintenance costs and enhance availability, scalability, and efficienc...

### zh_tech_002

- Question: S3 與 CloudFront 如何一起安全地提供 React 與 Vite 前端？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Lambda`

Answer excerpt:

S3 與 CloudFront 協同合作，安全地提供 React 與 Vite 前端的方式如下： * **S3 靜態網站託管**：作品集網站使用 React 與 Vite 開發，建置後產生 HTML、CSS、JavaScript 等靜態資源，並選擇 Amazon S3 作為網站託管服務 [S1]。S3 負責儲存網站內容，但**不直接提供公開存取** [S1]。 * **CloudFront CDN 整合**：為了提供 HTTPS 安全連線、全球內容傳遞（CDN）以及更好的存取效能，網站部署至 Amazon S3 後，會在 S3 前方部署 Amazon CloudFront 作為網站唯一的對外入口 [S3]。CloudFront 以...

### zh_tech_003

- Question: 為什麼前端要透過 API Gateway 呼叫 Lambda，而不是直接存取 AWS 資源？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CloudFront`

Answer excerpt:

前端透過 API Gateway 呼叫 Lambda 的原因在於 API Gateway 能夠將前端與後端解耦 [S3]。這樣一來，React 前端就不需要直接存取 AWS 資源，而是透過 API 與後端服務互動 [S3]。例如，網站瀏覽次數統計、專案瀏覽計數及聯絡表單提交等功能皆透過 API Gateway 完成資料交換 [S3]。

### zh_tech_004

- Question: 請比較 AWS DynamoDB 與 GCP Firestore 在這個系統中的資料責任。
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CloudFront`

Answer excerpt:

在這個系統中，AWS DynamoDB 和 GCP Firestore 各自承擔不同的資料責任： * **AWS DynamoDB** 負責儲存前端網站與分析資料，包括網站瀏覽統計 (Web views)、專案瀏覽紀錄 (Project views)、聯絡表單資料 (Contact records) 和通知狀態 (Notification state) [S1, S3, S4]。它被選用是因為資料結構相對簡單，且能提供較佳的彈性與擴充能力，所有資料存取皆透過 Lambda 處理，以確保安全性和降低系統耦合度 [S3, S4]。 * **GCP Firestore** 則負責 RAG 知識庫、對話記憶與 AI 相關資料管理 [S1]。...

### zh_tech_005

- Question: 如果 Lambda 或 API Gateway 發生錯誤，你會把 CloudWatch 放在除錯流程的哪裡？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `S3, CloudFront`

Answer excerpt:

當 API 執行失敗時，Lambda 執行過程中的錯誤資訊皆記錄於 CloudWatch Logs，方便後續除錯與系統維護，也有助於快速定位問題來源 [S1]。

### zh_tech_006

- Question: AWS 端文件中提到哪些 CORS 與 HTTPS 的控制？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Lambda`

Answer excerpt:

根據提供的文件，AWS 端提到了以下 CORS 與 HTTPS 控制： **CORS (跨來源資源共享)** * **API Gateway CORS 設定**：由於前端網站與後端 API 部署於不同服務，為避免瀏覽器同源政策限制，專案在 API Gateway 設定 CORS，允許指定來源存取 API [S1]。 * **開發與部署階段的 CORS 策略**：在開發階段，CORS 設定允許本機開發環境進行測試；正式部署後，則限制為作品集網站的正式網域，以避免未授權來源呼叫 API，提高系統安全性 [S1]。 * **API Gateway 整合中的 CORS**：API Gateway 針對 API 設定 CORS，允許前端網站安...

### zh_tech_008

- Question: 為什麼 Cloud Run 適合部署 FastAPI RAG 後端？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Vertex AI, Firestore`

Answer excerpt:

Cloud Run 適合部署 FastAPI RAG 後端的原因包括： * **部署效率與版本管理**：Cloud Run 採用 Container 部署方式，系統更新時只需重新建置 Docker Image 並部署新的 Revision，即可完成版本更新，無需自行管理伺服器 [S2]。它也支援 Revision 管理，每次部署皆保留歷史版本，方便後續驗證及必要時進行版本回復 [S1]。 * **成本效益**：Cloud Run 支援 Serverless 架構設計，採用按需啟動 (Scale to Zero) 及依實際使用量計費 (Pay-as-you-go) 的模式 [S5]。在沒有請求時可縮減至最低資源使用量，幾乎不會產生閒置...

### zh_tech_009

- Question: Gemini 與 Vertex AI Embedding API 分別在 RAG 流程的哪個階段使用？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Run, Vertex AI, Firestore`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_010

- Question: Google Cloud Storage 儲存什麼資料，為什麼要和 Firestore 分開？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Cloud Run, Vertex AI`

Answer excerpt:

Google Cloud Storage 儲存 RAG 原始 Markdown 文件與知識庫來源 [S2]，以及 AI 知識庫文件、Markdown 技術文件及相關資源 [S1]。 Google Cloud Storage 與 Firestore 分開的原因是為了根據不同的資料類型選擇合適的儲存服務 [S2]。Google Cloud Storage 透過將文件與程式分離管理，可降低維護成本，並方便後續持續擴充更多專案與技術文件 [S1]。Firestore 則主要用於儲存 AI 對話紀錄、相關資訊、文件 chunks、conversation memory 和 RAG analytics 等結構化資料 [S2, S4, S5]。

### zh_tech_012

- Question: 把 FastAPI 後端包成 Cloud Run container 對部署有什麼好處？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Vertex AI, Firestore`

Answer excerpt:

將 FastAPI 後端部署為 Cloud Run 容器有以下好處： * **簡化部署與更新**：Cloud Run 採用容器部署方式，系統更新時只需重新建置 Docker Image 並部署新的 Revision，即可完成版本更新，無需自行管理伺服器 [S1]。GitHub Actions 會重新建置 Docker Image 並部署至 Cloud Run，使 FastAPI 與 RAG 系統能快速完成版本更新 [S2]。 * **自動擴展與成本效益**：Cloud Run 能依照實際流量自動擴展資源，在沒有請求時可縮減至最低資源使用量，降低整體營運成本，同時維持良好的可用性與部署效率 [S1]。 * **版本管理與回復**：Cl...

### zh_tech_013

- Question: 請說明多雲架構的邏輯分層，以及每一層的責任。
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `多雲架構, AWS, GCP`

Answer excerpt:

Based on the indexed project documents, I do not know the logical layers of a multi-cloud architecture or their responsibilities. The provided context focuses on the challenges of information transfer between job seekers and employers regarding project details and how AI can help bridge this gap [S3].

### zh_tech_014

- Question: 為什麼架構要分離作品集交付、AI 應用邏輯、檢索層與資料層？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, language_mismatch`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `多雲架構, AWS, GCP`

Answer excerpt:

Based on the indexed project documents, the specific reasons for separating the architecture into "portfolio delivery, AI application logic, retrieval layer, and data layer" are not explicitly detailed. However, the project does utilize a multi-cloud approach where Amazon Web Service is used for website infrastructure,...

### zh_tech_015

- Question: 把平台拆在 AWS 與 GCP 之間，主要技術取捨是什麼？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `wrong_retrieval`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: ``

Answer excerpt:

本專案將平台拆分在 AWS 與 GCP 之間，主要的技術取捨如下： * **AWS 作為網站基礎架構與無伺服器服務的核心**：AWS 負責前端託管、內容傳遞、後端 API、資料儲存以及通知服務等核心功能 [S2, S5]。這包括使用 Amazon S3 進行靜態網站託管、CloudFront 提供 CDN 加速、API Gateway 轉送請求、AWS Lambda 執行後端邏輯、DynamoDB 進行資料儲存，以及 SNS、SES 等通知服務 [S1, S5]。整體架構以 Serverless 為設計核心，旨在降低基礎設施維護成本，提升系統可用性、擴充性與維護效率 [S5]。 * **GCP 專注於 AI 助理與知識檢索系統**：...

### zh_tech_016

- Question: 資料庫與物件儲存的選擇如何對應到各元件負責的資料？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `多雲架構, AWS, GCP`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_017

- Question: 架構中哪些部分可以自動擴展，這背後需要哪些假設？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `多雲架構, AWS, GCP`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_018

- Question: 如果這個系統要變成多人使用的 SaaS，你會先重看哪些架構元件？
- Expected source: `Architecture 架構圖.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `多雲架構, AWS, GCP`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_019

- Question: 請指出瀏覽器、AWS API 與 GCP RAG 後端之間的主要安全邊界。
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_020

- Question: 最小權限原則在 AWS Lambda 與 GCP Cloud Run 上有什麼不同實作重點？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS`

Answer excerpt:

根據提供的文件，本專案在 GCP 雲端資源（包括 Cloud Run、Firestore、Cloud Storage、IAM 及相關設定）上，透過 Terraform 進行管理，以實現與 AWS 一致的 IaC 管理方式，並降低跨平台管理的複雜度 [S4]。 文件中沒有提及 AWS Lambda 在最小權限原則上的具體實作重點。

### zh_tech_021

- Question: CloudFront 如何成為公開入口，同時讓 S3 維持受保護？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

CloudFront 透過將 Amazon S3 Bucket 作為其 Origin，成為網站唯一的對外入口 [S1]。使用者透過 CloudFront 存取網站，而不是直接連線至 S3 [S1]。因此，S3 負責儲存網站內容，但不會直接提供公開存取，其對外存取由 CloudFront 負責 [S3]。

### zh_tech_022

- Question: 哪些 API 設計讓前端不需要直接接觸資料庫或 AI 服務？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

FastAPI 作為 AI 後端的 API Framework，負責接收前端請求、處理 RAG 流程，並將生成結果回傳至網站 [S4]。前端所有 AI 問答皆透過 HTTP API 與 FastAPI 溝通，不直接存取 Vertex AI 或 Firestore [S4]。 這種設計將所有 AI 邏輯集中於後端 FastAPI 管理，使前端僅需負責介面呈現，大幅降低系統耦合度與前端複雜度 [S3, S4]。

### zh_tech_023

- Question: 如果 CORS 設太寬可能會造成什麼風險，文件中如何描述 CORS 控制？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `HTTPS, IAM`

Answer excerpt:

如果 CORS 設定過於寬鬆，可能會導致未經授權的來源呼叫 API，進而降低系統的安全性 [S1]。 文件中描述 CORS 控制如下： * 專案在 API Gateway 上設定 CORS，以允許指定的來源存取 API，確保 React 前端能夠正常呼叫 API Gateway [S1, S2]。 * 在開發階段，CORS 設定允許本機開發環境進行測試；正式部署後，則限制為作品集網站的正式網域，以避免未授權來源呼叫 API，提高系統安全性 [S1]。 * 此設定確保前端網站能夠安全地呼叫後端服務，並在正式部署與本機開發環境下皆能正常運作 [S2]。 * 在開發過程中，也針對 CORS 相關問題進行了排查與修正，以提升系統穩定性與可靠...

### zh_tech_024

- Question: 如果招聘方回報 AI 回答突然失效，你會先查哪些日誌或分析資料？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `CORS, HTTPS, IAM`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_025

- Question: 請追蹤一個使用者問題從前端到檢索、Prompt 組裝、Gemini 生成與回傳的流程。
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `RAG`

Answer excerpt:

根據專案文件，使用者問題從前端到最終回答的流程如下： 1. **使用者提問**：使用者透過前端介面（例如 React Chat UI）提出問題，啟動專案問答流程 [S5]。 2. **問題向量化與檢索**：系統會將使用者問題轉換為向量（Embedding），並進行相似度搜尋，以取得最相關的文件內容。這可能涉及混合式檢索，包含 Firestore Vector Search 和 Keyword Search [S4, S5]。 3. **上下文組裝**：完成文件檢索後，系統會將多個相關的文件區塊（Chunk）組合成完整的上下文（Context），並將其與 Prompt 一同送至 Gemini 模型 [S1, S3]。此步驟由 Cont...

### zh_tech_026

- Question: 向量嵌入在文件匯入與提問時檢索分別扮演什麼角色？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 檢索, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_027

- Question: 向量搜尋如何協助找出語意相關的專案文件？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 檢索, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_028

- Question: 語意搜尋與關鍵字檢索在這個專題中如何互補？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 檢索, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_029

- Question: 父子 Chunking 為什麼能在精準檢索與完整回答之間取得平衡？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, Gemini`

Answer excerpt:

父子 Chunking 能夠在精準檢索與完整回答之間取得平衡，是因為它將 Child chunk 用於提升檢索精準度，讓系統能快速找到與使用者問題最相關的內容；而 Parent chunk 則保留較完整的章節上下文，在生成回答時補充背景資訊 [S5]。系統會保留 parent-child 關係，使 child chunks 能用於精準檢索，而 parent sections 能在回答生成時提供完整上下文 [S1]。

### zh_tech_030

- Question: 哪些 metadata 欄位最能支援來源追蹤與專案隔離？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `RAG, 檢索, Gemini`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_031

- Question: 為什麼 Markdown 比 Word、PDF 或圖片更適合作為這個 RAG 系統的知識來源？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `文件切分`

Answer excerpt:

Markdown 比 Word、PDF 或圖片更適合作為這個 RAG 系統的知識來源，主要原因如下： * **結構化程度高與語意清晰**：Markdown 具有高結構化程度，能透過標題、段落、清單及程式碼區塊等結構資訊，協助 Document Ingestion Pipeline 更精確地執行 Chunking、建立 Metadata 並保留文件語意，進而提升知識檢索品質與 AI 回答的準確性 [S1]。 * **易於版本控制與維護成本低**：Markdown 可直接與 Git 版本控制整合，使技術文件能隨專案持續演進，並透過重新執行 Ingestion Pipeline 即可同步更新 AI 知識庫，而無須修改 AI 應用程式本身...

### zh_tech_032

- Question: 如果技術文件只用固定字數切分，可能會發生哪些問題？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `Markdown, 文件切分, metadata`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_033

- Question: Metadata filtering 如何避免其他專案內容進入回答上下文？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, language_mismatch`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, 文件切分`

Answer excerpt:

Metadata filtering prevents content from other projects from entering the response context by using the `project_id` metadata [S1, S4, S5]. Since the AI Assistant may support multiple portfolio projects, the system must include `project_id` in the metadata to avoid incorrectly retrieving content from other projects whe...

### zh_tech_034

- Question: Ingestion pipeline 如何把 Markdown 文件轉成 Firestore knowledge records？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, 文件切分, metadata`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_035

- Question: 更新 CRC-RAG 文件後，你會做哪些 chunk 品質檢查？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Markdown, 文件切分`

Answer excerpt:

更新 CRC-RAG 文件後，會進行以下 chunk 品質檢查： * 定期檢查 metadata 品質，確保 `source file` 正確、`section title` 未遺失、`project id` 一致，以及 `parent-child` 關係能正常還原上下文 [S4]。 * 透過 `content hash` 判斷 chunk 內容是否改變，以支援增量更新並提升知識庫更新效率 [S2, S4]。 * 使用 `chunk id` 判斷文件是否需要重新匯入，以支援知識庫更新 [S2]。

### zh_tech_036

- Question: 當作品集專案越來越多時，知識管理流程應如何演進？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, language_mismatch`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `Markdown, 文件切分, metadata`

Answer excerpt:

When the number of portfolio projects increases, the existing portfolio methods face challenges in effectively managing and conveying project knowledge. Project information is often scattered across resumes, GitHub repositories, technical documents, architecture diagrams, and other platforms, making it difficult for re...

### zh_tech_037

- Question: 哪些責任應該留在 FastAPI，而不是移到 React 前端？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `analytics`

Answer excerpt:

FastAPI 應負責以下責任，而不是移到 React 前端： * 接收前端問題、協調 RAG 流程，並將最終回應傳回網站 [S1]。 * 完成問題分析、文件檢索、上下文組裝及模型推論等工作 [S1]。 * 處理 RAG 流程，並將生成結果回傳至網站 [S2]。 * 文件載入、對話紀錄及串流回應等功能 [S2]。 * 所有 AI 邏輯皆集中於 FastAPI 管理，以降低系統耦合度及前端複雜度，並方便後續維護與功能擴充 [S1, S2]。

### zh_tech_038

- Question: Server-Sent Events 對較長時間的 AI 回答有什麼使用者體驗上的幫助？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

Server-Sent Events (SSE) 透過串流方式逐步回傳 AI 生成內容，而非等待完整回答後一次傳送 [S1]。這有助於使用者即時看到 AI 生成的內容，縮短等待時間，並提升互動體驗 [S1, S3]。

### zh_tech_039

- Question: Lambda 與 FastAPI 的錯誤處理應如何依責任不同而設計？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword, language_mismatch`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `analytics`

Answer excerpt:

Lambda functions incorporate basic error handling mechanisms to enhance system stability [S5]. They are designed to return appropriate HTTP Status Codes and error messages for issues such as data validation failures, database operation exceptions, and third-party service errors [S5]. Instead of returning system excepti...

### zh_tech_040

- Question: RAG analytics 應該記錄哪些資料，才能協助除錯回答品質？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_041

- Question: 哪些地方可以加入快取，同時避免答案過期或失去根據？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_042

- Question: 正式導流前，你會如何驗證後端部署是否成功？
- Expected source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `FastAPI, API, analytics`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_043

- Question: RAG 流程中哪些部分最可能影響延遲，你會如何量測？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `無伺服器, 成本`

Answer excerpt:

在 RAG 流程中，延遲 (latency) 是一個重要的評估指標 [S5]。 為了量測延遲

### zh_tech_044

- Question: 對低流量作品集 AI 助理來說，Scale to Zero 為什麼重要？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `延遲, 無伺服器`

Answer excerpt:

對於低流量的作品集 AI 助理來說，Scale to Zero 模式非常重要，原因如下： * **降低閒置運算成本**：當沒有使用者請求時，系統無需維持常駐運算資源，因此幾乎不會產生閒置（Idle）運算成本 [S2]。這對於個人專案或作品集這類可能長時間處於低流量狀態的應用來說，能有效避免不必要的營運成本 [S3]。 * **成本效益**：相較於部署在虛擬機器（VM）或 Kubernetes 等需持續運行的 AI 服務，Serverless 架構（如 Google Cloud Run）採用按需啟動（Scale to Zero）及依實際使用量計費（Pay-as-you-go）的模式，在兼顧成本效益的同時，也具備良好的自動擴展能力與維運...

### zh_tech_045

- Question: Chunk 大小、檢索數量與上下文組裝如何同時影響回答品質與成本？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `延遲, 無伺服器, 成本`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_046

- Question: 如果同時有很多使用者提問，最先出現的擴展問題可能是什麼？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `延遲, 無伺服器, 成本`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_047

- Question: 在從無伺服器改成常駐基礎設施前，你會評估哪些取捨？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `延遲, 無伺服器, 成本`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_048

- Question: 哪些指標可以看出檢索正常，但生成階段逐漸成為瓶頸？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `延遲, 無伺服器, 成本`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_049

- Question: 你會如何設計 golden questions 來證明助理理解 CRC-RAG 專題？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 引用, 來源`

Answer excerpt:

根據工程最佳實務，可以透過建立測試問題集來證明助理對 CRC-RAG 專題的理解 [S4]。

### zh_tech_050

- Question: 引用驗證在作品集 AI 助理中要防止什麼問題？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `評估, 來源`

Answer excerpt:

在作品集 AI 助理中，引用驗證有助於提升回答品質並降低模型幻覺（Hallucination）問題 [S5]。

### zh_tech_051

- Question: source IDs、source files 與 section paths 如何幫助診斷錯誤回答？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `RAG 系統設計.md`
- Failure reason: `missing_keyword, language_mismatch`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 引用, 來源`

Answer excerpt:

`source IDs` (chunk IDs), `source files`, and `section paths` (section titles/chapter paths) are crucial for diagnosing incorrect answers in a RAG system because they support source tracking, debugging, and RAG evaluation [S1, S2]. Specifically: * **Source tracking**: By retaining this information, the system can track...

### zh_tech_052

- Question: 如果檢索到了正確來源，但回答沒有答到重點，你下一步會查哪裡？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `評估, 引用, 來源`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_053

- Question: 你會如何驗證英文問題得到英文回答、繁中問題得到繁中回答？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `評估, 引用, 來源`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_054

- Question: 當找不到相關專案上下文時，系統應該怎麼回應？
- Expected source: `RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.
- Missing keywords: `評估, 引用, 來源`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_055

- Question: 哪些 Infrastructure as Code 工作會讓這個專題更容易重現？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `檢索, 監控`

Answer excerpt:

透過 Terraform 實作 Infrastructure as Code (IaC) 可以讓專案更容易重現，主要原因如下： * **提高部署一致性與可重現性**：Terraform 允許以程式碼方式描述 AWS 與 GCP 的基礎設施，不僅方便重複部署，也讓整個雲端架構能與專案程式碼一同維護，提升系統的可維護性與可重現性 [S1]。 * **降低人工操作錯誤**：IaC 減少了手動建立與維護雲端資源的需求，從而降低了人工操作錯誤的可能性 [S1]。 * **基礎設施納入版本控制**：將基礎設施定義為程式碼，使其可以納入版本控制，便於追蹤變更、協同合作及回溯 [S1]。 * **易於重建與維護**：當基礎設施需要調整時，只需修改...

### zh_tech_056

- Question: Terraform 會如何改變這個架構的部署與審查流程？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Implementation 實作流程.md`
- Top retrieved source: `Implementation 實作流程.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `檢索, 監控`

Answer excerpt:

Terraform 改變了架構的部署與審查流程，主要體現在以下幾個方面： * **提高部署一致性與可重複性**：透過將基礎設施以程式碼方式描述，Terraform 確保不同環境皆能維持一致的設定，並方便重複部署 [S1, S3]。這也使得 AWS 與 GCP 的部署流程保持一致，降低跨平台管理的複雜度 [S5]。 * **降低人工操作錯誤**：自動化管理雲端資源，減少了手動建立與維護資源時可能發生的人為錯誤 [S1, S2]。 * **納入版本控制與追蹤**：基礎設施程式碼可以與專案程式碼一同維護，並配合 Git 進行版本控制，使得每一次修改都有完整紀錄，便於後續追蹤與維護 [S1, S3]。 * **簡化更新與維護**：當基礎設施...

### zh_tech_057

- Question: 如果評估結果常出現錯誤來源檢索，你會優先改善什麼？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform, 檢索, 監控`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_058

- Question: 如果回答正確但對資深技術面試來說太淺，你會調整什麼？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform, 檢索, 監控`

Answer excerpt:

I do not know based on the indexed project documents.

### zh_tech_059

- Question: 哪些監控或分析資料可以幫助排序未來的 RAG 改善工作？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Implementation 實作流程.md, Overview 綜覽.md, RAG 系統設計.md`
- Top retrieved source: `Architecture 架構圖.md`
- Failure reason: `missing_keyword`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform`

Answer excerpt:

為排序未來的 RAG 改善工作，RAG 系統會記錄以下監控與分析資料： * **查詢紀錄 (Query log)**：記錄每次查詢的內容 [S5]。 * **檢索文件 (Retrieved chunks)**：每次查詢所檢索到的相關文件或知識片段 [S3, S5]。 * **來源中繼資料 (Source metadata)**：檢索文件的相關中繼資料 [S5]。 * **生成回應 (Generated response)**：AI 助理根據檢索結果生成的回應 [S5]。 * **回應時間 (Latency)**：每次查詢的回應時間 [S3, S5]。 * **相關執行紀錄 (Related execution logs)**：其他相...

### zh_tech_060

- Question: 如果系統要支援多位候選人與私人專案文件，你會如何重新設計？
- Expected source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Retrieved source: `Architecture 架構圖.md, Overview 綜覽.md`
- Top retrieved source: `Overview 綜覽.md`
- Failure reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.
- Missing keywords: `Terraform, 檢索, 監控`

Answer excerpt:

I do not know based on the indexed project documents.
