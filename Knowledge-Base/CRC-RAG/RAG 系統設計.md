Tab 1

# 4.1 RAG 架構概覽

![](data:image/png;base64...)

本系統採用 **Retrieval-Augmented Generation（RAG）** 架構，並以 **Google Cloud Platform（GCP）** 建置 AI Assistant 後端，提供以專案知識為基礎的智慧問答服務。整體架構將知識管理、文件檢索、內容生成、對話記憶及使用分析等功能解耦（Decoupling），形成一套具備高可維護性、可擴充性及易於演進的 AI 系統。

相較於直接使用大型語言模型（LLM）回答問題，本系統透過 RAG 架構，先從知識庫中檢索與使用者問題最相關的文件內容，再將檢索結果作為上下文（Context）提供給 **Vertex AI Gemini** 生成最終回答。此設計不僅能有效降低大型語言模型產生幻覺（Hallucination）的風險，也能提升回答內容與專案文件的一致性及準確性。

此外，本系統採用 **Serverless** 架構設計，AI 後端部署於 **Google Cloud Run**，並採用按需啟動（Scale to Zero）及依實際使用量計費（Pay-as-you-go）的模式。當沒有使用者請求時，系統無需維持常駐運算資源，因此幾乎不會產生閒置（Idle）運算成本。相較於部署於虛擬機器（VM）或 Kubernetes 等需持續運行的 AI 服務，此架構更適合作為個人作品集及中小型 AI 應用，在兼顧成本效益的同時，也具備良好的自動擴展能力與維運彈性。

當使用者於作品集網站提出問題時，請求會送至部署於 **Google Cloud Run** 的 FastAPI 後端，由 **RAG Engine** 協調整個回答流程，包括查詢處理、知識檢索、上下文組裝（Context Assembly）、答案生成以及串流回應（Streaming Response）。系統會根據使用者問題至知識庫中檢索最相關的 **Document Chunks**，再將檢索結果組裝為 Prompt，交由 **Vertex AI Gemini** 產生最終回答，並透過 **Server-Sent Events（SSE）** 即時串流回傳至前端介面，以提升使用者互動體驗。

知識來源以 **Markdown 文件** 作為主要格式，並集中儲存於 **Google Cloud Storage（GCS）**。文件經過 **Document Ingestion Pipeline** 處理後，會依據預先定義的 Chunking Strategy 建立 **Document Chunks**、產生 **Embeddings** 及建立 **Metadata**，最後儲存至 **Cloud Firestore** 作為 AI Assistant 的知識庫。除此之外，Cloud Firestore 同時負責儲存對話紀錄（Conversation History）與 RAG Analytics，而後端則根據對話紀錄建立 Conversation Memory，以支援多輪對話及提供更具上下文的回答能力。

整體架構將知識管理、檢索流程、模型推論、對話記憶及資料儲存分別交由不同元件負責，使各子系統能夠獨立維護與持續演進。此設計不僅提升了系統的模組化程度，也使未來能夠彈性替換 **Embedding Model**、大型語言模型（LLM）或檢索策略，而無需大幅修改整體架構，進一步提升系統的可維護性、可擴充性與長期發展能力。

| **比較項目** | **本專案（Serverless RAG）** | **傳統 AI 服務（VM／Kubernetes）** |
| --- | --- | --- |
| **部署方式** | Google Cloud Run（Serverless） | Virtual Machine（VM）或 Kubernetes |
| **計費模式** | 依實際使用量計費（Pay-as-you-go） | 持續支付運算資源費用 |
| **閒置成本** | 幾乎為零（Scale to Zero） | 即使無請求仍需支付運算成本 |
| **擴充能力** | 自動擴縮（Auto Scaling） | 需自行規劃與管理容量 |
| **維運成本** | 低，無須管理基礎設施 | 較高，需管理主機、叢集及更新維護 |
| **適用情境** | AI 助理、文件搜尋、知識庫問答、企業內部知識管理 | 高流量 AI 平台、企業級 AI 服務、需長時間維持運行和需要穩定的 AI 系統 |

###

## **4.2 知識管理**

![](data:image/png;base64...)

AI Assistant 的回答品質高度依賴知識來源（Knowledge Source）的完整性、正確性與可維護性，因此本系統建立了一套以 **Markdown 文件** 為核心的知識管理機制，作為 RAG 系統唯一的知識來源（Single Source of Truth）。所有技術文件皆採用 Markdown 格式撰寫，並透過版本控制與標準化文件結構，確保知識內容具備一致性、可維護性及可追蹤性。

目前的大型語言模型（Large Language Models, LLMs）已具備理解 PDF、HTML、Word、圖片等多種文件格式的能力。然而，對於 Retrieval-Augmented Generation（RAG）系統而言，文件是否容易解析（Parsing）、切分（Chunking）、建立 Metadata 及持續維護，往往比模型是否能閱讀該文件格式更為重要。因此，本專案選擇 **Markdown** 作為主要知識來源，主要考量其具有結構化程度高、語意清晰、易於版本控制及維護成本低等優勢，特別適合作為技術文件與知識庫管理格式。

相較於 PDF、Word 或圖片等格式，Markdown 能夠透過標題（Heading）、段落（Paragraph）、清單（List）及程式碼區塊（Code Block）等結構資訊，協助 Document Ingestion Pipeline 更精確地執行 Chunking、建立 Metadata 並保留文件語意，進一步提升知識檢索品質與 AI 回答的準確性。此外，Markdown 可直接與 Git 版本控制整合，使技術文件能隨專案持續演進，並透過重新執行 Ingestion Pipeline 即可同步更新 AI 知識庫，而無須修改 AI 應用程式本身。

為提升知識管理效率，本系統依照文件用途與生命週期，將技術文件區分為 **Current Documents** 與 **Archive Documents**。Current Documents 作為 AI Assistant 的主要知識來源，提供最新且經驗證的技術內容；Archive Documents 則保存歷史版本、開發紀錄及已淘汰文件，以保留專案演進歷程，同時避免過時資訊影響 AI 回答品質。

所有 Current Documents 均集中儲存於 **Google Cloud Storage（GCS）**，並透過 **Document Ingestion Pipeline** 自動完成文件解析、Chunking、Embedding 建立及 Metadata 產生，最後儲存至 **Cloud Firestore** 作為 RAG 知識庫。當技術文件更新時，僅需重新執行 Ingestion Pipeline，即可同步更新知識庫，而無需修改 AI 應用程式程式碼。

整體而言，本系統將知識內容與應用程式邏輯分離，使 AI Assistant 能透過持續更新技術文件來擴充知識，而非修改 Prompt 或程式碼。此設計不僅提升了知識管理效率，也增強了系統的可維護性、可擴充性與長期發展能力。

| 文件格式 | 結構化程度 | Chunking 品質 | 維護性 | Git 版本控制 | RAG 適用性 |
| --- | --- | --- | --- | --- | --- |
| Markdown (.md) | ✓ | ✓ | ✓ | ✓ | ✓ 最佳選擇 |
| HTML | ✓ | ✓ | △ | △ | ✓ |
| PDF | △ | △ | △ | ✗ | △ |
| Word (.docx) | △ | △ | △ | ✗ | △ |
| Image (PNG/JPG) | ✗ | ✗ | ✗ | ✗ | ✗ |

**註解（Legend）**

* **✓**：適合（Suitable）— 可直接作為 RAG 知識來源，幾乎不需額外處理。
* **△**：部分適合（Partially Suitable）— 可作為 RAG 知識來源，但需額外解析、轉換或前處理。
* **✗**：不適合（Not Recommended）— 不建議直接作為 RAG 知識來源，需大量前處理或容易影響檢索品質。

##

## **4.3 文件匯入流程**

![](data:image/png;base64...)

本系統透過 **Document Ingestion Pipeline**，將 Markdown 技術文件轉換為 AI Assistant 可檢索的知識庫。整個流程採用自動化處理機制，當技術文件新增或更新時，系統可重新執行 Ingestion Pipeline，完成文件解析、知識切分、Metadata 建立、Embedding 生成及資料儲存，確保知識庫內容與最新技術文件保持同步。

相較於直接將整份文件提供給大型語言模型，Ingestion Pipeline 先將文件轉換為結構化知識，再建立向量表示（Embeddings），使 RAG 系統能更有效率地檢索相關內容，同時提升回答品質與檢索效率。

由於知識建置流程與 AI 推論流程完全分離，因此未來新增技術文件、修改內容或調整 Chunking Strategy 時，皆無須修改 AI 應用程式，只需重新執行 Ingestion Pipeline，即可完成知識更新。

##

##

##

## **4.4 Chunking 切分策略**

在本專案的 GCP RAG AI Assistant 中，知識來源主要來自 Markdown 技術文件，例如專案狀態紀錄、架構說明、開發日誌、測試紀錄與部署文件。這些文件通常不是一般文章，而是包含雲端服務、系統模組、API 流程、錯誤排查、架構決策與實作紀錄的工程文件。

因此，文件不能直接以整份檔案的方式送入模型，也不適合只用固定字數進行切分。若 chunk 過大，檢索結果會不夠精準，模型可能收到太多無關內容；若 chunk 過小，內容又可能失去原本的工程脈絡，導致回答片段化或不完整。

本系統的 chunking strategy 採用 **Markdown-aware chunking** 的設計理念。系統會盡量保留 Markdown 文件中的標題階層、段落結構、表格、程式碼區塊與技術說明脈絡，讓每一個 chunk 都能成為可獨立檢索、可理解、可追蹤的知識單位。

此外，本專案也採用 **parent-child chunking** 的概念。Child chunk 負責提升檢索精準度，讓系統能快速找到與使用者問題最相關的內容；Parent chunk 則保留較完整的章節上下文，在生成回答時補充背景資訊。這樣的設計可以在「精準檢索」與「完整回答」之間取得平衡。

整體而言，本節的設計目標是將技術文件轉換成適合 RAG 系統使用的知識單位，使 AI Assistant 能夠根據專案文件回答問題，而不是依賴模型本身的泛用知識或猜測

### 4.4.2 Chunking Strategy

Chunking Strategy 位於整個 RAG pipeline 的中間層，主要承接前一節 **Document Ingestion Pipeline** 的輸出，並為後續的 **Embedding Generation** 與 **Retrieval Pipeline** 準備資料。

在本專案中，Markdown 文件不會直接被送入 embedding model。系統會先解析文件內容，辨識標題、段落、表格與程式碼區塊，再依照文件結構切分成較小的知識單位。這些知識單位會被轉換成 embeddings，並與 metadata 一起儲存在 Firestore 中，供後續查詢使用。

整體流程如下：

| Markdown Documents  → 原始知識來源，例如專案狀態、架構文件、開發紀錄與測試文件  Markdown Parsing  → 解析 Markdown 結構，保留標題、段落、表格與程式碼區塊  Section Detection  → 根據 heading 層級辨識文件章節，建立內容的上下文邊界  Chunk Creation  → 將章節內容切分成適合檢索的知識片段  Parent-Child Mapping  → 建立 child chunk 與 parent section 的關係，兼顧精準檢索與完整上下文  Embedding Generation  → 將每個 chunk 轉換成向量表示，支援後續語意搜尋  Firestore Storage  → 儲存 chunk 內容、embedding 與 metadata，作為 RAG knowledge store |
| --- |

在這個架構中，chunking layer 的主要責任有三個：

| **Responsibility** | **Explanation** |
| --- | --- |
| Structure Preservation | 保留 Markdown 文件的章節結構，避免知識內容失去原本脈絡 |
| Retrieval Optimization | 將文件切分成適合語意搜尋的大小，提高檢索精準度 |
| Context Preparation | 建立 parent-child 關係，讓回答生成時能補回完整上下文 |

在本專案中，chunking layer 介於 Markdown parsing 與 embedding generation 之間。它負責將已解析的 Markdown 結構轉換成可檢索的知識片段，並保留必要的章節關係與 metadata。

因此，chunking layer 並不是單純的文字切割工具，而是 RAG 系統中的知識結構化層。它決定了文件如何被理解、如何被檢索，以及最後如何被模型用來產生回答。

###

### 4.4.3 Chunking Flow 流程圖

下圖展示本專案的文件切分流程。Markdown 技術文件會先經過結構解析，再依照章節與語意邊界建立 chunks。系統會保留 parent-child 關係，使 child chunks 能用於精準檢索，而 parent sections 能在回答生成時提供完整上下文。

這個流程的目的不是單純壓縮文件，而是將原始技術文件轉換成可檢索、可追蹤、可維護的知識單位。

![](data:image/png;base64...)

###

###

###

###

###

###

### 4.4.4 Chunking Design Rules

為了讓 RAG 系統能夠穩定檢索技術文件，本專案在 chunking layer 中定義了一組文件切分規則。這些規則的目標是保留文件語意、避免破壞技術內容，並讓每個 chunk 都能成為可檢索、可追蹤的知識單位。

| **設計規則** | **說明** |
| --- | --- |
| 標題感知切分 | 以 Markdown heading 作為主要切分依據，保留文件章節結構與上下文層級。 |
| 段落感知切分 | 避免在語意尚未完成的段落中間切分，確保 chunk 內容可被獨立理解。 |
| 程式碼區塊保護 | 避免切斷 fenced code block，防止設定檔、指令或程式碼片段失去完整性。 |
| 表格結構保留 | 儘量保留表格完整結構，避免欄位名稱與資料內容分離。 |
| 父子 Chunk 對應 | 使用 child chunk 進行精準檢索，並透過 parent section 補充完整上下文。 |
| Metadata 附加 | 每個 chunk 都會附加 source file、section title、chunk id 等 metadata，支援後續檢索、追蹤與除錯。 |

###

### 4.4.5 Engineering Best Practices

在本專案中，chunking strategy 不只是資料前處理的一部分，也會直接影響 RAG 系統的檢索品質、回答準確性與後續維護成本。因此，文件切分設計需要遵守以下工程實務：

1. **避免單純使用固定長度切分**技術文件通常包含標題、段落、表格、程式碼區塊與架構說明。如果只根據固定字數或固定 token 數切分，可能會破壞原本的語意結構，導致 AI Assistant 檢索到不完整或缺乏上下文的內容。
2. **控制 chunk 大小，避免過大或過小** Chunk 過大會降低檢索精準度，並增加 LLM context window 的使用成本；chunk 過小則可能失去必要背景，使回答變得片段化。因此，chunk size 需要在檢索精準度與上下文完整性之間取得平衡。
3. **保留文件結構與章節脈絡** 每個 chunk 應盡量保留原始 Markdown 文件中的 heading、section title 與內容層級。這有助於系統理解 chunk 在原始文件中的位置，也方便後續追蹤回答來源。
4. **使用 parent-child chunking 提升回答品質** Child chunk 適合用於精準檢索，parent section 則適合在生成回答時提供完整背景。這種方式可以避免只回傳零碎片段，也能降低將整份文件放入 prompt 的成本。
5. **為每個 chunk 附加 metadata** 每個 chunk 都應包含 source file、section title、chunk id、parent id 等 metadata。這些資料可用於檢索過濾、來源追蹤、知識庫更新與問題除錯。
6. **定期檢查 chunk 品質** 當專案文件持續更新時，chunking 結果也需要定期檢查。若文件結構改變、章節過長或內容過期，應重新 ingestion 並更新 knowledge store，確保 RAG 系統使用的是最新且結構良好的知識內容。

## **4.5 Metadata 設計（中繼資料設計）**

本節說明 RAG 系統中 metadata 的設計方式。Metadata 用於描述每個知識片段的來源、章節位置、所屬專案、父子關係與更新狀態，使系統能夠支援精準檢索、來源追蹤、知識庫維護與回答評估。

本節包含以下內容：

| **小節** | **說明** |
| --- | --- |
| 4.5.1 Purpose & Design Philosophy | 說明 metadata 在 RAG 系統中的角色與設計目標 |
| 4.5.2 Architecture Explanation | 說明 metadata layer 在整體 RAG pipeline 中的位置 |
| 4.5.3 Metadata Schema | 定義每個 chunk 應包含的 metadata 欄位 |
| 4.5.4 Metadata Usage in RAG Pipeline | 說明 metadata 如何支援檢索、來源追蹤與評估 |
| 4.5.5 Engineering Best Practices | 整理 metadata 設計與維護的工程原則 |

### 4.5.1 目的與設計理念

在本專案的 RAG 系統中，metadata 是連接 **文件內容、檢索流程、來源追蹤與知識庫維護** 的關鍵設計。當 Markdown 文件經過 chunking layer 被切分成多個知識片段後，系統不能只儲存 chunk 文字本身，還需要記錄每個 chunk 的來源、章節位置、所屬專案、父子關係與更新狀態。

Metadata 的主要目的，是讓每個 chunk 不只是單純的文字片段，而是成為一個可以被管理、檢索、追蹤與評估的知識單位。這對技術文件型 RAG 系統非常重要，因為使用者詢問的問題通常會涉及特定專案、特定模組、特定架構決策或特定錯誤排查紀錄。

在本專案中，metadata design 需要支援以下需求：

| **設計需求** | **說明** |
| --- | --- |
| 來源追蹤 | 紀錄 chunk 來自哪一份文件與哪一個章節 |
| 專案範圍控制 | 確保 AI Assistant 只檢索目前專案相關內容 |
| 檢索過濾 | 根據 project id、module、document type 等條件篩選知識 |
| 上下文還原 | 透過 parent id 找回完整章節內容 |
| 知識庫更新 | 使用 chunk id 與 content hash 判斷文件是否需要重新匯入 |
| 回答評估 | 追蹤回答使用了哪些 chunks，支援後續 RAG evaluation |

### 4.5.2 架構說明

Metadata layer 位於 **chunking layer 之後、retrieval pipeline 之前**。當 Markdown 文件被切分成 chunks 後，系統會為每個 chunk 附加 metadata，使這些知識片段不只是可被 embedding 的文字內容，也能被分類、過濾、追蹤與維護。

在本專案中，metadata 會與 **chunk content** 和 **embedding** 一起儲存在 Firestore 中。每一筆 chunk record 都會包含文字內容、向量表示，以及描述該 chunk 來源與結構位置的 metadata。這樣的設計讓 RAG 系統不只依靠語意相似度搜尋內容，也能根據專案、文件類型、章節、模組與父子關係進行更精準的篩選。

當使用者提出問題時，retrieval pipeline 會先根據目前選擇的 project id 或 project context 限制搜尋範圍，避免系統混入其他專案的知識內容。接著，系統會根據 query embedding 搜尋相關 chunks，並透過 metadata 追蹤 chunk 的來源文件、章節位置與 parent section。這些資訊會在 response generation 與 source tracking 階段被使用，幫助 AI Assistant 產生更準確、可追蹤的回答。

![](data:image/png;base64...)

以上架構圖展示 metadata layer 在 RAG pipeline 中的位置。文件經過 chunking 後，系統會為每個 chunk 附加來源、專案、章節與父子關係等 metadata，並與 chunk content 和 embedding 一起儲存在 Firestore。後續 retrieval pipeline 可根據 metadata 進行專案範圍控制、檢索過濾、來源追蹤與 RAG 評估

在這個架構中，metadata layer 主要負責三個任務：

| **架構任務** | **說明** |
| --- | --- |
| Knowledge Organization | 將 chunk 依照專案、文件類型、章節與模組進行組織 |
| Retrieval Control | 在檢索階段根據 project id、module、document type 等條件限制搜尋範圍 |
| Source Traceability | 在回答生成後追蹤使用了哪些 source chunks，支援除錯與評估 |

Metadata layer 的設計重點，是讓 RAG 系統具備明確的知識邊界。沒有 metadata 的情況下，系統只能依靠語意相似度搜尋內容；但在多專案、多文件與多模組的 portfolio assistant 中，單純的 vector similarity 並不足夠。系統還需要知道每個 chunk 屬於哪個專案、哪個章節、哪個模組，以及是否仍然是有效資訊。

因此，metadata layer 是本專案 RAG architecture 中的知識治理層。它連接前面的 document ingestion 與 chunking 流程，也支援後續的 retrieval pipeline、response generation 與 RAG evaluation。

### 4.5.3 Metadata 欄位設計

在本專案中，每一個 chunk 都會搭配一組 metadata 一起儲存在 Firestore 中。Metadata 的設計目標，是讓系統能夠清楚知道每個知識片段的來源、所屬專案、章節位置、父子關係與更新狀態。

以下是本專案 RAG knowledge store 中主要使用的 metadata 欄位設計：

| **Metadata 欄位** | **說明** |
| --- | --- |
| chunk\_id | 每個 chunk 的唯一識別碼，用於查詢、更新、追蹤與除錯 |
| parent\_id | 對應 parent section 的識別碼，用於還原完整上下文 |
| project\_id | 標示 chunk 所屬的專案，例如 AWS + GCP AI Capstone Project |
| source\_file | 紀錄 chunk 來自哪一份 Markdown 文件 |
| document\_type | 標示文件類型，例如 architecture、development log、test record 或 deployment note |
| section\_title | 紀錄 chunk 所屬的章節標題 |
| section\_path | 紀錄 chunk 在文件中的章節層級，例如 Overview > Architecture > Retrieval Pipeline |
| chunk\_index | 表示 chunk 在原始文件或章節中的順序 |
| content\_hash | 根據 chunk 內容產生的 hash，用於判斷文件是否更新 |
| created\_at | 紀錄 chunk 第一次匯入 knowledge store 的時間 |
| updated\_at | 紀錄 chunk 最近一次更新的時間 |
| embedding\_model | 紀錄產生 embedding 時使用的模型版本 |
| language | 標示 chunk 的語言，例如 English 或 Traditional Chinese |
| tags | 補充分類標籤，例如 AWS、GCP、RAG、Firestore、Cloud Run |

這些 metadata 欄位讓每個 chunk 不只是文字資料，而是具備結構化描述的知識單位。透過這些欄位，系統可以更容易進行專案範圍控制、檢索過濾、來源追蹤、版本管理與品質評估。

### 4.5.4 Metadata 在 RAG Pipeline 中的用途

Metadata 不只是在資料儲存時提供描述資訊，也會在整個 RAG pipeline 的不同階段被使用。從文件匯入、chunk 儲存、檢索篩選、回答生成到後續評估，metadata 都扮演重要角色。

| **Pipeline 階段** | **Metadata 的用途** |
| --- | --- |
| Document Ingestion | 讀取文件來源、文件類型與專案資訊，確保文件被正確匯入 knowledge store |
| Chunking Process | 為每個 chunk 附加 section title、section path、chunk index 與 parent id |
| Embedding Generation | 記錄 embedding model 與 chunk id，方便後續模型版本追蹤 |
| Firestore Storage | 將 chunk content、embedding 與 metadata 一起儲存，形成完整的知識紀錄 |
| Retrieval Filtering | 根據 project id、document type、module 或 tags 限制搜尋範圍 |
| Context Reconstruction | 透過 parent id 與 section path 還原 chunk 的完整上下文 |
| Response Generation | 將檢索到的 chunks 與來源資訊提供給 LLM，幫助產生更準確的回答 |
| Source Tracking | 記錄回答使用了哪些 source chunks，讓使用者與開發者可以追蹤答案依據 |
| RAG Evaluation | 根據 chunk id、source file 與 retrieval result 分析回答品質與檢索效果 |

在本專案的 portfolio AI Assistant 中，metadata 尤其重要，因為系統可能同時管理多個專案文件。如果沒有 metadata，AI Assistant 可能會把不同專案的內容混在一起，導致回答不準確。透過 project id、document type 與 section metadata，系統可以維持清楚的知識邊界，讓回答更符合目前使用者選擇的專案情境。

因此，metadata 是 retrieval pipeline 的控制基礎。它讓系統不只依靠 vector similarity，也能加入結構化條件進行篩選，提升 RAG 回答的穩定性與可信度。

###

### 4.5.5 工程最佳實務

為了讓 metadata design 能夠長期支援 RAG 系統的維護與擴充，本專案在設計上遵循以下工程最佳實務：

1. **使用一致的欄位命名**：Metadata 欄位應保持一致的命名方式，例如使用 project\_id、source\_file、section\_title 與 chunk\_id。一致的命名可以降低開發與除錯成本，也方便後續在 retrieval pipeline 中進行條件篩選。

2. **保留完整來源資訊** ：每個 chunk 都應保留來源文件、章節標題與章節路徑。這樣可以讓系統在回答生成後追蹤答案依據，也能幫助開發者判斷某個回答是否來自正確的文件內容。

3. **支援專案範圍隔離** ：由於本專案的 AI Assistant 可能支援多個 portfolio projects，因此 metadata 必須包含 project\_id。這可以避免系統在回答某個專案問題時，錯誤檢索到其他專案的內容。

4. **使用 content hash 支援增量更新** ：當文件內容更新時，系統可以透過 content\_hash 判斷 chunk 是否真的改變。這樣可以避免每次都重新處理所有文件，降低 ingestion 成本並提升知識庫更新效率。

5. **記錄 embedding model 版本** ：Embedding model 可能會隨著系統演進而更換。透過記錄 embedding\_model，系統可以知道某個 chunk 的向量是由哪個模型產生，避免不同模型版本產生的 embeddings 混用而影響檢索品質。

6. **避免 metadata 過度複雜**：Metadata 應該保留對檢索、追蹤、更新與評估真正有用的欄位。過多不必要的 metadata 會增加儲存與維護成本，也可能讓 retrieval filtering 變得過於複雜。

7. **定期檢查 metadata 品質**：當文件結構、專案分類或 ingestion pipeline 發生變更時，需要檢查 metadata 是否仍然正確。例如 source file 是否正確、section title 是否遺失、project id 是否一致，以及 parent-child 關係是否能正常還原上下文。

整體而言，metadata design 是 RAG 系統中非常重要的知識治理基礎。良好的 metadata 設計可以提升檢索準確性、降低回答錯誤風險，並讓系統在多專案、多文件與長期維護的情境下保持穩定。

##

##

##

##

## **4.6 檢索流程（Retrieval Pipeline）**

這一節會說明：**當使用者提出問題後，RAG 系統如何從 Firestore knowledge store 中找出最相關的 chunks，並把它們提供給 LLM 生成回答。**

| **小節** | **內容** |
| --- | --- |
| 4.6.1 Purpose & Design Philosophy（目的與設計理念） | 說明 retrieval pipeline 為什麼是 RAG 的核心。 |
| 4.6.2 Architecture Explanation（架構說明） | 說明 query、embedding、Firestore search、ranking、context assembly 的流程。 |
| 4.6.3 Retrieval Flow Diagram（檢索流程圖） | 用流程圖展示使用者問題如何轉換成檢索結果。 |
| 4.6.4 Retrieval Strategy（檢索策略） | 說明 semantic search、metadata filtering、parent-child retrieval、reranking。 |
| 4.6.5 Engineering Best Practices（工程最佳實務） | 說明如何避免錯誤檢索、混入其他專案內容、context 過長等問題。 |

### 4.6.1 Purpose & Design Philosophy（目的與設計理念）

在本專案的 RAG AI Assistant 中，retrieval pipeline 是連接 **使用者問題** 與 **專案知識庫** 的核心流程。當使用者提出問題時，系統不能直接依賴 LLM 本身的泛用知識回答，而是需要先從已建立的 knowledge store 中找出與問題最相關的文件片段，再將這些內容提供給模型作為回答依據。

Retrieval pipeline 的主要目的，是讓 AI Assistant 能夠根據專案文件回答問題，而不是依靠猜測或模型記憶。這對本專案特別重要，因為使用者的問題通常會涉及特定的雲端架構、部署流程、錯誤排查紀錄、系統模組或技術決策。這些內容必須來自專案文件本身，才能確保回答具有可信度與可追溯性。

在本系統中，retrieval pipeline 需要支援以下設計目標：

| **設計目標** | **說明** |
| --- | --- |
| 語意檢索 | 將使用者問題轉換成 query embedding，找出語意上最相關的 chunks |
| 專案範圍控制 | 根據 project id 限制檢索範圍，避免不同專案內容混在一起 |
| Metadata Filtering | 使用 document type、module、section title 等 metadata 進行篩選 |
| Context Reconstruction | 透過 parent-child chunking 補回完整上下文 |
| Ranking & Reranking | 對候選 chunks 進行排序，提升最終提供給 LLM 的內容品質 |
| Source Traceability | 保留檢索到的 source chunks，讓回答可以被追蹤與評估 |

整體而言，retrieval pipeline 的設計理念是平衡 **檢索精準度** 與 **上下文完整性**。如果檢索結果太少，模型可能缺乏足夠背景；如果檢索結果太多，則可能增加 context window 成本，甚至引入不相關資訊。因此，本專案透過 semantic search、metadata filtering、parent-child retrieval 與 reranking，讓 AI Assistant 能夠取得最有用的知識內容，再交由 LLM 生成回答。

因此，retrieval pipeline 不只是搜尋功能，而是 RAG 系統中的知識選擇層。它決定模型會看到哪些文件內容，也直接影響最終回答的準確性、穩定性與可信度。

###

### 4.6.2 架構說明

Retrieval pipeline 位於 **user query 之後、response generation 之前**。當使用者在 AI Assistant 中提出問題時，系統會先將問題轉換成 query embedding，接著從 Firestore knowledge store 中搜尋語意最相關的 chunks，再根據 metadata、ranking 與 context assembly 產生可供 LLM 使用的上下文內容。

在本專案中，retrieval pipeline 不只是單純搜尋文字，而是結合 **semantic search、metadata filtering、parent-child retrieval 與 ranking** 的知識檢索流程。這樣可以確保 AI Assistant 回答問題時，使用的是與目前專案最相關、最可靠的文件內容，而不是依靠模型本身的泛用知識或猜測。

| User Question → Query Processing → Query Embedding → Metadata Filtering → Firestore Vector Search → Candidate Chunk Ranking → Parent Context Retrieval → Context Assembly → Response Generation |
| --- |

在這個架構中，每個步驟的責任如下：

| **流程階段** | **說明** |
| --- | --- |
| User Question | 使用者在 AI Assistant 中提出與專案相關的問題 |
| Query Processing | 系統整理使用者問題，保留主要語意與查詢意圖 |
| Query Embedding | 使用 embedding model 將問題轉換成向量表示 |
| Metadata Filtering | 根據 project id、document type、module 等 metadata 限制檢索範圍 |
| Firestore Vector Search | 從 Firestore knowledge store 中找出語意相似的 chunks |
| Candidate Chunk Ranking | 依照相似度分數與 metadata 條件排序候選 chunks |
| Parent Context Retrieval | 根據 parent id 補回較完整的章節上下文 |
| Context Assembly | 將檢索到的內容整理成 LLM 可使用的 context |
| Response Generation | LLM 根據檢索內容產生回答 |

Retrieval pipeline 的設計重點，是讓系統能夠在大量技術文件中選出最有價值的內容。由於本專案的知識來源包含架構文件、開發紀錄、測試紀錄與部署文件，使用者問題可能會對應到不同類型的文件。因此，metadata filtering 對本系統非常重要，它可以避免 AI Assistant 在回答 AWS + GCP Capstone Project 問題時，混入其他專案或不相關文件內容。

此外，本專案也採用 parent-child retrieval 的概念。Child chunks 用於提升檢索精準度，parent sections 則用於補充完整上下文。這樣可以避免只回傳過短的片段，也能避免直接將整份文件放入 prompt，降低 context window 成本。

### 4.6.3 檢索流程圖

下圖展示本專案的 retrieval pipeline。當使用者提出問題後，系統會先產生 query embedding，並根據 metadata 進行範圍控制。接著，系統會從 Firestore knowledge store 中檢索相關 chunks，經過 ranking 與 context assembly 後，再交由 LLM 產生回答。

![](data:image/png;base64...)

展示本專案 RAG 系統的檢索流程。使用者問題會先被轉換成 query embedding，並透過 metadata filtering 限制檢索範圍。系統接著從 Firestore knowledge store 中找出相關 chunks，經過 ranking、parent context retrieval 與 context assembly 後，再交由 LLM 產生回答

### 4.6.4 檢索策略

本專案的 retrieval strategy 採用多層次設計，目標是在檢索精準度、上下文完整性與系統穩定性之間取得平衡。系統不只依靠單一的向量相似度搜尋，而是結合 metadata filtering、parent-child retrieval 與 ranking 機制，讓 AI Assistant 能夠取得最符合問題情境的知識內容。

| **檢索策略** | **說明** |
| --- | --- |
| Semantic Search | 將使用者問題轉換成 query embedding，並與 knowledge store 中的 chunk embeddings 進行語意相似度比對 |
| Metadata Filtering | 根據 project id、document type、module、tags 等 metadata 限制搜尋範圍 |
| Parent-Child Retrieval | 使用 child chunks 進行精準檢索，再透過 parent id 補回完整章節上下文 |
| Candidate Ranking | 根據相似度分數、metadata 條件與內容相關性排序候選 chunks |
| Context Assembly | 將最相關的 chunks 組合成 LLM 可使用的上下文內容 |
| Source Tracking | 保留檢索到的 source chunks，支援回答來源追蹤與後續評估 |

Semantic Search

Semantic search 是 retrieval pipeline 的核心。它讓系統可以根據語意相似度尋找相關內容，而不是只依靠關鍵字完全匹配。例如，使用者可能詢問「AI Assistant 如何避免回答錯誤專案內容？」即使文件中沒有完全相同的句子，系統仍然可以透過 embedding 找到與 project id、metadata filtering 或 knowledge boundary 相關的 chunks。

Metadata Filtering

Metadata filtering 用於控制檢索範圍。由於本專案的 AI Assistant 可能支援多個 portfolio projects，系統必須根據目前選擇的 project id 限制搜尋範圍，避免將其他專案的內容混入回答。

Parent-Child Retrieval

Child chunks 通常較短，適合用於精準檢索；parent sections 則保留較完整的章節脈絡。當系統找到相關 child chunk 後，可以透過 parent id 取得更完整的背景內容，使 LLM 在生成回答時不會只依賴零碎片段。

Candidate Ranking

檢索階段可能會找到多個相關 chunks，因此需要進行 ranking。系統會根據語意相似度、metadata 條件與內容相關性，選出最適合放入 prompt 的內容。這可以降低不相關資訊進入 context 的機率。

Context Assembly

Context assembly 負責將檢索到的 chunks 整理成 LLM 可以理解的上下文。這個階段需要避免 context 過長，也需要保留來源資訊，讓回答可以被追蹤與評估。

### 4.6.5 工程最佳實務

為了讓 retrieval pipeline 能夠穩定支援 RAG AI Assistant，本專案在設計上遵循以下工程最佳實務：

1. 先限制檢索範圍，再執行語意搜尋

在多專案 AI Assistant 中，系統應先根據 project id 或 project context 限制知識範圍，再進行 semantic search。這樣可以避免不同專案的 chunks 混在一起，降低錯誤回答的風險。

2. 避免只依靠 vector similarity

Vector similarity 可以找到語意相近的內容，但不一定能判斷內容是否屬於正確專案、正確文件或正確模組。因此，retrieval pipeline 應搭配 metadata filtering 使用，提升結果可靠性。

3. 控制候選 chunks 數量

檢索結果不應無限制地放入 LLM prompt。過多 chunks 會增加 context window 成本，也可能引入不相關內容。系統應設定 top-k 或 score threshold，只選擇最相關的內容。

4. 保留來源資訊

每次檢索都應保留 source file、section title、chunk id 與 similarity score 等資訊。這些資料可以支援 source tracking、debugging 與 RAG evaluation，讓開發者知道回答依據來自哪裡。

5. 使用 parent context 補充背景

如果只使用短小的 child chunks，回答可能會缺乏完整上下文。透過 parent-child retrieval，系統可以在保持精準檢索的同時，補回必要的章節背景。

6. 避免 context 過長

Context assembly 應控制最終送入 LLM 的內容長度。若 context 過長，可能增加成本、降低模型注意力，也可能讓回答變得不聚焦。因此，系統需要平衡內容完整性與 prompt 精簡度。

7. 定期檢查檢索品質

當文件內容更新、metadata schema 調整或 embedding model 更換時，需要重新測試 retrieval pipeline。測試問題應包含架構問題、部署問題、錯誤排查問題與專案比較問題，以確認系統能穩定找到正確來源。

整體而言，retrieval pipeline 是 RAG 系統中最關鍵的知識選擇層。良好的 retrieval design 可以降低模型幻覺風險、提升回答準確性，並確保 AI Assistant 的回答能夠根據實際專案文件產生。

###

###

## **4.7 回應生成流程**

| **小節** | **內容** |
| --- | --- |
| 4.7.1 目的與設計理念 | 說明 response generation 為什麼不能只依靠 LLM，而要根據 retrieved context 生成回答。 |
| 4.7.2 架構說 | 說明 retrieved chunks、context assembly、prompt construction、LLM generation、source-aware response 的流程。 |
| 4.7.3 回應生成流程圖 | 用流程圖展示 retrieval results 如何被組合成 prompt，並產生 final answer。 |
| 4.7.4 Prompt Grounding 依據策略 | 說明如何讓 LLM 依照專案文件回答，降低 hallucination，並保留來源依據。 |
| 4.7.5 工程最佳實務 | 說明如何控制 context 長度、避免無來源回答、處理找不到資料的情況。 |

### 4.7.1 目的與設計理念

在本專案的 RAG AI Assistant 中，response generation pipeline 是將 **檢索結果轉換成最終回答** 的流程。當 retrieval pipeline 從 Firestore knowledge store 中找出相關 chunks 後，系統不會直接把使用者問題交給 LLM 回答，而是會先將檢索到的專案文件內容整理成上下文，再交由 LLM 產生 grounded response。

Response generation 的主要目的，是確保 AI Assistant 的回答能夠根據實際專案文件產生，而不是依賴模型本身的泛用知識或猜測。這對本專案非常重要，因為使用者詢問的內容通常涉及具體的雲端架構、部署流程、技術選型、錯誤排查紀錄與系統設計決策。如果回答沒有依據專案文件，就可能產生不準確或無法追蹤來源的內容。

在本系統中，response generation pipeline 需要支援以下設計目標：

| **設計目標** | **說明** |
| --- | --- |
| Grounded Response | 回答必須根據 retrieved context，而不是只依靠 LLM 記憶 |
| Context Assembly | 將檢索到的 chunks 整理成模型可理解的上下文 |
| Source Awareness | 保留來源資訊，讓回答可以追蹤到相關文件與章節 |
| Hallucination Reduction | 降低模型產生無根據內容或錯誤推測的風險 |
| Project-Specific Answering | 確保回答符合目前選擇的專案情境 |
| Fallback Handling | 當知識庫沒有足夠資料時，系統應明確說明限制，而不是強行 |

整體而言，response generation pipeline 的設計理念是讓 LLM 成為 **根據文件進行整理與表達的生成器**，而不是未受限制的知識來源。Retrieval pipeline 負責選出相關知識，response generation pipeline 則負責將這些知識轉換成清楚、完整且可追蹤的回答。

因此，本專案將 response generation 視為 RAG 系統中的 **knowledge-grounded answer layer**。它連接前面的 retrieval pipeline，也支援後續的 source tracking、conversation memory 與 RAG evaluation。透過這樣的設計，AI Assistant 可以在回答專案問題時維持準確性、上下文一致性與工程可信度。

### 4.7.2 架構說明

Response generation pipeline 位於 **retrieval pipeline 之後、conversation memory storage 之前**。當系統完成檢索後，會將 retrieved chunks、source metadata 與使用者問題一起整理成 prompt context，並交由 LLM 產生最終回答。

在本專案中，response generation 並不是單純呼叫 LLM API，而是一個包含 **context assembly、prompt construction、LLM generation、source-aware response 與 response storage** 的完整流程。這樣可以確保 AI Assistant 的回答能夠依據專案知識庫，而不是只依靠模型本身的泛用知識。

整體流程如下：

| User Question → Retrieved Chunks → Context Assembly → Prompt Construction → LLM Generation → Source-Aware Response → Conversation Storage |
| --- |

在這個架構中，每個階段的責任如下：

| **流程階段** | **說明** |
| --- | --- |
| User Question | 使用者提出與專案相關的問題 |
| Retrieved Chunks | Retrieval pipeline 回傳與問題最相關的 chunks |
| Context Assembly | 將 retrieved chunks、parent context 與 source metadata 整理成可用上下文 |
| Prompt Construction | 將使用者問題、系統指令與檢索內容組合成 prompt |
| LLM Generation | LLM 根據 prompt 與 retrieved context 產生回答 |
| Source-Aware Response | 回答保留來源意識，避免產生無根據內容 |
| Conversation Storage | 將使用者問題與 AI 回答儲存到 Firestore conversation history |

Response generation pipeline 的設計重點，是讓模型回答時受到 retrieved context 的約束。系統會將與問題最相關的文件片段放入 prompt，並要求模型根據這些內容回答。如果檢索結果不足，AI Assistant 應清楚說明目前文件中沒有足夠資訊，而不是自行推測。

此外，response generation 也需要與 conversation memory 配合。當使用者進行多輪對話時，系統可以保留前面的問題與回答，使後續回答能維持上下文一致性。不過，conversation memory 不應取代 RAG knowledge base；它主要用於保存對話脈絡，而專案事實仍應以 retrieved project documents 為主要依據。

因此，response generation pipeline 是 RAG 系統中的回答組裝層。它將 retrieval pipeline 找到的知識內容轉換成清楚、完整、可追蹤的自然語言回答，並支援後續的 conversation memory 與 RAG evaluation。

### 4.7.3 Response Generation 回應生成流程圖

本節展示本專案的 response generation pipeline。當 retrieval pipeline 找到相關 chunks 後，系統會將這些 chunks、source metadata、parent context 與使用者問題組合成 prompt，接著交由 LLM 產生回答。最後，回答會與對話紀錄一起儲存，支援後續 conversation memory 與 RAG evaluation。

![](data:image/png;base64...)

**4.7.3** 展示本專案 RAG AI Assistant 的回應生成流程。使用者問題會先經過 retrieval pipeline 找到相關 chunks，接著系統會將 retrieved chunks、source metadata 與 parent context 整理成 prompt context。LLM 會根據這些上下文產生 source-aware response，最後系統將使用者問題與 AI 回答儲存到 Firestore conversation history，支援後續多輪對話與 RAG evaluation

###

### 4.7.4 Prompt Grounding， Prompt 依據策略

在本專案的 RAG AI Assistant 中，prompt grounding strategy 的目標，是讓 LLM 產生回答時必須依據 retrieval pipeline 提供的專案文件內容，而不是單純依靠模型本身的泛用知識。這樣可以降低 hallucination 的風險，並提升回答的可信度與可追蹤性。

本系統會將使用者問題、retrieved chunks、parent context 與 source metadata 組合成 prompt context。LLM 在生成回答時，應優先根據這些 context 進行整理、摘要與解釋。如果檢索結果不足，系統應明確回覆目前文件中沒有足夠資訊，而不是自行補充未被文件支持的內容。

| **Grounding 設計** | **說明** |
| --- | --- |
| Retrieved Context First | 回答應優先依據 retrieval pipeline 找到的 chunks |
| Source Metadata Included | Prompt 中保留 source file、section title、chunk id 等來源資訊 |
| Project Context Control | 根據目前 project id 限制回答範圍，避免混入其他專案內容 |
| No Unsupported Claims | 若文件中沒有明確資訊，模型不應自行推測或編造 |
| Context-Aware Answering | 根據 parent context 補充背景，使回答更完整 |
| Fallback Response | 當檢索結果不足時，明確說明限制並建議補充文件 |

Prompt grounding 的核心原則是：**LLM 負責組織與表達答案，但知識依據必須來自 retrieved context**。因此，模型不是作為獨立知識來源，而是作為一個根據專案文件生成回答的 reasoning and summarization layer。

這樣的設計能讓 AI Assistant 在回答雲端架構、部署流程、錯誤排查與技術決策時，更貼近實際專案內容，也方便後續進行 source tracking 與 RAG evaluation。

###

###

###

### 4.7.5 工程最佳實務

為了讓 response generation pipeline 能夠穩定產生準確、可追蹤且符合專案情境的回答，本專案在設計上遵循以下工程最佳實務：

**1. 回答必須依據 retrieved context ：**AI Assistant 的回答應以 retrieval pipeline 提供的 chunks 為主要依據。LLM 可以負責整理語意、補充結構與改善表達，但不應加入未被專案文件支持的內容。

**2. 控制 prompt context 長度：**Context assembly 不應將過多 chunks 全部放入 prompt。過長的 context 會增加成本，也可能讓模型注意力分散。因此，系統應根據 relevance score、metadata 與 parent-child 關係選擇最有價值的內容。

**3. 保留來源資訊：**每次 response generation 都應保留 source file、section title、chunk id 或其他 metadata。這些資訊可以幫助開發者追蹤回答依據，也能支援後續 RAG evaluation。

**4. 處理檢索不足的情況：**如果 retrieval pipeline 找不到足夠相關內容，AI Assistant 應明確說明目前知識庫沒有足夠資料，而不是強行回答。這可以降低 hallucination，並提高系統可信度。

**5. 區分專案知識與對話記憶：**Conversation memory 可以協助維持多輪對話脈絡，但不應取代 project knowledge base。專案事實應以 retrieved documents 為主，對話記憶主要用於理解使用者前後文。

**6. 避免跨專案回答污染：**在 portfolio AI Assistant 中，不同專案可能有不同架構與技術選型。因此，response generation 應配合 project id 與 metadata filtering，避免將其他專案內容混入目前回答。

**7. 將錯誤回答納入評估：**如果 AI Assistant 產生不準確回答，應記錄該問題、retrieved chunks、source metadata 與最終回答。這些資料可用於分析問題是來自 retrieval failure、context assembly 問題，還是 prompt grounding 不足。

整體而言，response generation pipeline 是 RAG 系統中的最後一層知識轉換流程。良好的 response generation 設計可以讓 AI Assistant 不只是回答流暢，也能做到內容準確、來源清楚、符合專案情境，並能被後續評估與改進。

##

##

## **4.8 對話記憶管理**

| **小節** | **內容** |
| --- | --- |
| 4.8.1 目的與設計理念 | 說明 conversation memory 為什麼對 AI Assistant 重要，以及它和 RAG knowledge base 的差別。 |
| 4.8.2 架構說明 | 說明 session id、user message、assistant response、Firestore conversation storage 的流程。 |
| 4.8.3 對話記憶流程圖 | 用流程圖展示使用者訊息如何被儲存，並在後續對話中被讀取。 |
| 4.8.4 記憶範圍與資料設計 | 說明哪些資料適合存成 conversation memory，哪些不應該混入 long-term knowledge base。 |
| 4.8.5 工程最佳實務 | 說明如何控制 session 範圍、避免記憶污染、保護資料隱私與管理儲存成本。 |

### 4.8.1 目的與設計理念

在本專案的 RAG AI Assistant 中，conversation memory management 是用來保存使用者與 AI Assistant 之間的對話紀錄，使系統能夠支援多輪問答、維持對話上下文，並提供更連貫的使用者體驗。

Conversation memory 的主要目的，是讓 AI Assistant 能夠理解使用者在同一個 session 中前後提到的內容。例如，使用者可能先詢問某個專案的架構，接著再問「那這個部分是怎麼部署的？」。如果系統完全不保存對話脈絡，就無法理解「這個部分」指的是前一輪提到的專案或系統模組。

不過，conversation memory 與 RAG knowledge base 的角色不同。RAG knowledge base 儲存的是專案技術文件、架構紀錄、開發日誌與測試紀錄，屬於長期、可檢索的專案知識；conversation memory 則儲存使用者與 AI Assistant 的互動紀錄，主要用於維持短期對話脈絡。

在本專案中，conversation memory design 需要支援以下需求：

| **設計需求** | **說明** |
| --- | --- |
| 多輪對話支援 | 讓 AI Assistant 能理解同一個 session 中前後問題的關係 |
| Session-based Context | 使用 session id 區分不同使用者或不同對話階段 |
| 對話紀錄保存 | 儲存 user message 與 assistant response，支援後續查詢與分析 |
| 上下文一致性 | 讓後續回答能延續前一輪對話內容 |
| RAG Evaluation 支援 | 保留問題、回答與檢索來源，方便後續檢查回答品質 |
| 知識邊界控制 | 避免把短期對話記憶誤當成長期專案知識 |

整體而言，conversation memory 的設計理念是支援 AI Assistant 的對話連續性，但不讓它取代 RAG knowledge base。專案事實仍然應以 retrieved project documents 為主要依據，而 conversation memory 主要用於理解使用者目前的對話脈絡。

因此，本專案將 conversation memory 視為 session-level context layer。它連接 response generation pipeline 與後續的多輪互動，使 AI Assistant 能夠在同一個對話 session 中保持上下文一致，同時維持專案知識來源的清楚邊界。

### 4.8.2 Architecture Explanation（架構說明）

Conversation memory layer 位於 **response generation pipeline 之後**，主要負責儲存使用者與 AI Assistant 之間的互動紀錄。在本專案中，當使用者送出問題後，系統會產生或讀取一個 session\_id，並將使用者訊息、AI 回答、時間戳記與相關 metadata 儲存到 Firestore。

這個設計讓 AI Assistant 能夠支援 session-based conversation。也就是說，同一個使用者在同一個對話 session 中提出多輪問題時，系統可以透過 session\_id 找回過去的對話紀錄，協助後續回答維持上下文一致性。

在本專案中，conversation memory 不會取代 RAG knowledge base。RAG knowledge base 儲存的是專案技術文件與長期知識；conversation memory 儲存的是使用者與 AI Assistant 的短期互動紀錄。當系統需要回答專案事實時，仍然應以 retrieval pipeline 找到的 project documents 為主要依據。

整體流程如下：

| User Message → Session ID → Response Generation → Assistant Response → Firestore Conversation Storage → Future Context Retrieval |
| --- |

在這個架構中，每個階段的責任如下：

| **流程階段** | **說明** |
| --- | --- |
| User Message | 使用者在 AI Assistant 中提出問題 |
| Session ID | 系統使用 session id 區分不同對話紀錄 |
| Response Generation | AI Assistant 根據 retrieved context 產生回答 |
| Assistant Response | 系統回傳模型生成的回答 |
| Firestore Conversation Storage | 將 user message、assistant response、timestamp 與 metadata 儲存到 Firestore |
| Future Context Retrieval | 後續多輪對話時，系統可讀取同一 session 的歷史訊息作為短期上下文 |

在 Firestore 中，conversation memory 可以使用類似以下的資料結構：

| **資料層級** | **說明** |
| --- | --- |
| conversations | 儲存所有對話 session 的集合 |
| session\_id | 每一個對話 session 的唯一識別碼 |
| messages | 儲存該 session 中的所有訊息 |
| message\_id | 每一則訊息的唯一識別碼 |
| role | 標示訊息來源，例如 user 或 assistant |
| content | 儲存實際訊息內容 |
| created\_at | 儲存訊息建立時間 |
| request\_id | 可選欄位，用於追蹤單次請求與除錯 |

Conversation memory layer 的設計重點，是在保留對話連續性的同時，維持清楚的知識邊界。系統可以使用 conversation history 理解使用者前後文，但不應把對話內容直接當成專案知識來源。若使用者詢問專案架構、部署流程或技術決策，系統仍需要透過 RAG retrieval pipeline 檢索正式專案文件。

因此，conversation memory layer 是本專案 AI Assistant 的短期上下文管理層。它支援多輪對話體驗，也為後續的 RAG evaluation、debugging 與使用者互動分析提供基礎資料。

###

###

###

###

###

###

###

###

### 4.8.3 對話記憶流程圖

本節展示本專案 AI Assistant 的 conversation memory flow。當使用者送出訊息時，系統會先確認目前的 session\_id，接著完成 RAG retrieval 與 response generation。回答產生後，系統會將 user message、assistant response、timestamp 與相關 metadata 儲存到 Firestore conversation history。後續多輪對話時，系統可以根據相同的 session\_id 讀取歷史訊息，維持對話上下文一致性。

![](data:image/png;base64...)

**4.8.3** 展示本專案 AI Assistant 的對話記憶流程。使用者訊息會先透過 session\_id 對應到特定 conversation session，接著系統會進行 RAG retrieval 與 response generation。回答產生後，user message 與 assistant response 會被儲存到 Firestore conversation history。後續對話可以讀取同一個 session 的歷史訊息，協助 AI Assistant 維持多輪對話脈絡。

### 4.8.4 記憶範圍與資料設計

在本專案中，conversation memory 的設計重點不是永久保存所有知識，而是保存同一個對話 session 中必要的互動脈絡。因此，系統需要清楚區分哪些資料適合存入 conversation memory，哪些資料應該保留在 RAG knowledge base 中。

Conversation memory 主要用於支援多輪對話。例如，使用者先詢問某個專案的架構，接著再追問「那這個模組怎麼部署？」時，系統可以透過 session history 理解使用者仍然在討論同一個專案或同一個模組。

但是，conversation memory 不應該取代正式的 project documentation。專案架構、部署流程、錯誤排查紀錄、測試結果與技術決策等長期知識，應該透過 document ingestion pipeline 匯入 RAG knowledge base，而不是只存在對話紀錄中。

| **資料類型** | **是否適合存入 Conversation Memory** | **說明** |
| --- | --- | --- |
| User message | 適合 | 儲存使用者問題，支援後續多輪對話理解 |
| Assistant response | 適合 | 儲存 AI 回答，讓後續對話能延續前文 |
| Session id | 適合 | 用於區分不同對話 session |
| Timestamp | 適合 | 用於排序訊息與追蹤對話時間 |
| Request id | 適合 | 支援單次請求追蹤與除錯 |
| Retrieved source metadata | 適合 | 可記錄回答使用的 source chunks，支援 RAG evaluation |
| Project architecture facts | 不適合只存在 memory | 應整理成正式 Markdown 文件並匯入 knowledge base |
| Deployment procedure | 不適合只存在 memory | 屬於長期專案知識，應由 project documentation 管理 |
| Temporary clarification | 適合 | 例如使用者在同一輪對話中補充的限制或上下文 |
| Personal or sensitive information | 應避免 | 若非必要，不應儲存敏感資訊或與專案無關的個人資料 |

在資料結構上，conversation memory 可以採用 session-based 設計。每個 session 對應一組 messages，每則 message 包含 role、content、created\_at 與可選的 metadata。這種結構可以支援多輪對話，也方便後續依照 session 讀取歷史紀錄。

範例資料結構如下：

| **欄位** | **說明** |
| --- | --- |
| session\_id | 對話 session 的唯一識別碼 |
| message\_id | 每則訊息的唯一識別碼 |
| role | 訊息角色，例如 user 或 assistant |
| content | 訊息內容 |
| created\_at | 訊息建立時間 |
| request\_id | 單次請求識別碼，用於追蹤與除錯 |
| project\_id | 對應目前對話所屬的專案 |
| source\_chunks | 可選欄位，記錄回答使用的 retrieved chunks |
| metadata | 可選欄位，用於保存其他除錯或評估資訊 |

整體而言，conversation memory 的資料設計應該保持輕量、清楚且具有 session 邊界。它的責任是保存互動脈絡，而不是成為新的知識庫。正式專案知識仍應透過 Markdown 文件、document ingestion pipeline 與 RAG knowledge store 進行管理。

### 4.8.5 工程最佳實務

為了讓 conversation memory 能夠穩定支援 AI Assistant 的多輪對話功能，本專案在設計上遵循以下工程最佳實務：

**1. 明確區分 memory 與 knowledge base：**Conversation memory 用於保存短期對話脈絡，RAG knowledge base 用於保存長期專案知識。系統不應把對話紀錄直接當成正式知識來源，否則可能造成知識污染與回答不一致。

**2. 使用 session id 管理對話範圍：**每一段對話都應該對應到明確的 session\_id。這可以避免不同使用者、不同專案或不同對話階段的內容互相混在一起，降低上下文錯亂的風險。

**3. 控制記憶讀取長度：**後續對話不應無限制讀取所有歷史訊息。系統應根據最近對話、重要訊息或 token budget 選擇必要內容，避免 context 過長導致成本增加或模型注意力分散。

**4. 避免記憶污染：**如果使用者在對話中提出錯誤假設或臨時想法，系統不應將其視為正式專案事實。對話內容只能作為短期上下文，專案事實仍應回到 RAG knowledge base 驗證。

**5. 保護資料隱私：**Conversation memory 可能包含使用者輸入的自然語言內容，因此系統應避免儲存不必要的敏感資訊。若未來系統開放更多使用者使用，應進一步考慮資料保留期限、存取權限與刪除機制。

**6. 支援除錯與評估：**每則對話紀錄可以搭配 request\_id、project\_id 與 source metadata，以便後續追蹤某次回答使用了哪些檢索內容。這對 RAG evaluation、錯誤分析與系統改善非常重要。

**7. 定期清理不必要的對話紀錄：**為了控制 Firestore 儲存成本與維持資料品質，系統應定期檢查是否有過舊、無效或不再需要的 conversation history。必要時可以設計 retention policy 或手動清理流程。

整體而言，conversation memory 是提升 AI Assistant 使用體驗的重要功能，但它必須被限制在 session-level context 的範圍內。良好的 memory design 可以支援自然的多輪對話，同時避免知識污染、隱私風險與儲存成本失控。

###

### 4.9 RAG 分析與評估

| **小節** | **內容** |
| --- | --- |
| 4.9.1 Purpose & Design Philosophy（目的與設計理念） | 說明為什麼 RAG 系統需要 evaluation，而不能只看 LLM 回答是否流暢。 |
| 4.9.2 Architecture Explanation（架構說明） | 說明 query logs、retrieved chunks、source tracking、response quality review 的分析流程。 |
| 4.9.3 RAG Evaluation Flow Diagram（RAG 評估流程圖） | 用流程圖展示使用者問題、檢索結果、回答內容與評估指標之間的關係。 |
| 4.9.4 Evaluation Metrics（評估指標） | 說明 retrieval accuracy、source relevance、answer groundedness、latency、failure rate 等指標。 |
| 4.9.5 Engineering Best Practices（工程最佳實務） | 說明如何建立測試問題集、檢查錯誤回答、追蹤 retrieval failure，並持續改善 knowledge base。 |

# **4.9 RAG Analytics and Evaluation（RAG 分析與評估）**

## **4.9.1 目的與設計理念**

在本專案的 RAG AI Assistant 中，analytics and evaluation 的目標，是用系統化方式檢查 AI Assistant 是否真的根據正確的專案文件回答問題，而不是只看回答表面上是否流暢。對 RAG 系統而言，一個回答即使語句自然，也不代表它一定正確、可追蹤或符合專案實際內容。

RAG evaluation 的核心目的，是評估整個系統從 **使用者問題、檢索結果、來源文件、上下文組合到最終回答** 的品質。這與一般 LLM 評估不同，因為 RAG 系統的回答品質不只取決於模型本身，也取決於 retrieval pipeline 是否找到正確 chunks、metadata filtering 是否限制正確範圍、context assembly 是否提供足夠上下文，以及 response generation 是否依據 retrieved context 產生回答。

在本專案中，RAG analytics and evaluation 需要支援以下設計目標：

| **設計目標** | **說明** |
| --- | --- |
| Retrieval Quality Review | 檢查系統是否檢索到與問題真正相關的 chunks |
| Source Relevance | 評估 retrieved chunks 是否來自正確文件、正確專案與正確章節 |
| Answer Groundedness | 確認 AI 回答是否根據 retrieved context，而不是自行推測 |
| Failure Analysis | 分析錯誤回答是來自檢索失敗、context 不足、metadata 錯誤或 prompt grounding 不足 |
| Latency Monitoring | 觀察檢索、生成與整體回應時間，確保使用者體驗穩定 |
| Knowledge Base Improvement | 根據評估結果改善 Markdown 文件、chunking strategy、metadata schema 與 retrieval strategy |

RAG evaluation 對本專案特別重要，因為 AI Assistant 的知識來源包含多種技術文件，例如架構文件、開發紀錄、測試紀錄、部署文件與錯誤排查內容。如果系統檢索到錯誤文件，或將不同專案的內容混在一起，即使 LLM 生成的文字很流暢，回答仍然可能不可靠。

因此，本專案不只關注 final answer，也會關注回答背後的 retrieval evidence。系統需要記錄 query、retrieved chunks、source metadata、response content、latency 與錯誤狀態，讓開發者可以回頭分析每一次回答的品質。

整體而言，RAG analytics and evaluation 是本專案 RAG 系統的品質控制層。它讓 AI Assistant 不只是能回答問題，也能被檢查、被除錯、被改進。透過持續評估，系統可以逐步改善 knowledge base、retrieval strategy 與 response generation，使回答更準確、更穩定，也更符合實際專案內容。

## **4.9.2 Architecture Explanation（架構說明）**

RAG analytics and evaluation layer 位於整個 AI Assistant 流程的後段，主要負責記錄、分析與評估每一次 RAG 回答的品質。當使用者提出問題後，系統會經過 retrieval pipeline、response generation pipeline 與 conversation memory storage，而 evaluation layer 則會針對這些過程中的關鍵資料進行紀錄與分析。

在本專案中，RAG evaluation 不只檢查最終回答內容，也會檢查回答背後的檢索證據。也就是說，系統需要知道使用者問了什麼、檢索到哪些 chunks、這些 chunks 來自哪些文件、最終回答是否有根據 retrieved context，以及整體回應時間是否符合使用體驗需求。

整體分析流程如下：

| User Query → Query Log → Retrieved Chunks → Source Metadata → Generated Response → Evaluation Metrics → Knowledge Base Improvement |
| --- |

在這個架構中，每個階段的責任如下：

| **流程階段** | **說明** |
| --- | --- |
| User Query | 使用者提出的原始問題 |
| Query Log | 記錄 query text、session id、project id 與 request id |
| Retrieved Chunks | 記錄 retrieval pipeline 回傳的 chunks |
| Source Metadata | 記錄 source file、section title、chunk id、similarity score 等資訊 |
| Generated Response | 儲存 AI Assistant 產生的最終回答 |
| Evaluation Metrics | 分析 retrieval accuracy、source relevance、answer groundedness、latency 與 failure rate |
| Knowledge Base Improvement | 根據評估結果改善文件內容、chunking strategy、metadata schema 或 retrieval strategy |

RAG analytics 的重點，是建立一條從使用者問題到最終回答的可追蹤路徑。如果某一次回答不準確，開發者可以根據 query log、retrieved chunks 與 source metadata 判斷問題出在哪一層。例如，如果 retrieved chunks 本身不相關，問題可能來自 retrieval pipeline；如果 chunks 正確但回答偏離內容，問題可能來自 prompt grounding 或 response generation。

在本專案中，evaluation layer 也可以支援後續知識庫改善。當系統多次在某類問題上檢索失敗，代表 knowledge base 可能缺少相關文件、chunking 不夠理想，或 metadata 標記不夠清楚。透過分析這些失敗案例，開發者可以更新 Markdown 文件、重新 ingestion、調整 chunking rules，或改善 retrieval strategy。

因此，RAG analytics and evaluation layer 是本專案 AI Assistant 的品質回饋機制。它讓系統不只完成一次回答，也能透過紀錄與評估持續改善整體 RAG pipeline。

## **4.9.3 RAG 評估流程圖**

本節展示本專案 RAG analytics and evaluation 的流程。當使用者提出問題後，系統會記錄 query、retrieved chunks、source metadata 與 generated response。這些資料會被用來分析檢索品質、來源相關性、回答是否根據文件，以及整體回應效能。

![](data:image/png;base64...)

**4.9.3** 展示本專案 RAG 系統的分析與評估流程。系統會從使用者問題開始記錄 query log，接著保存 retrieval pipeline 回傳的 chunks 與 source metadata。生成回答後，evaluation layer 會根據 retrieval accuracy、source relevance、answer groundedness、latency 與 failure rate 等指標進行分析，並將結果用於改善 knowledge base、chunking strategy、metadata schema 與 retrieval strategy。

## **4.9.4 Evaluation Metrics（評估指標）**

在本專案中，RAG evaluation 需要同時評估 **檢索品質、來源相關性、回答依據、系統效能與錯誤率**。因為 RAG 系統的回答品質不只取決於 LLM，也取決於 retrieval pipeline 是否找到正確內容，以及 response generation 是否根據 retrieved context 產生回答。

以下是本專案使用的主要 RAG evaluation metrics：

| **評估指標** | **說明** |
| --- | --- |
| Retrieval Accuracy | 評估系統是否能檢索到與使用者問題真正相關的 chunks |
| Source Relevance | 檢查 retrieved chunks 是否來自正確專案、正確文件與正確章節 |
| Answer Groundedness | 評估 AI 回答是否根據 retrieved context，而不是模型自行推測 |
| Context Completeness | 檢查提供給 LLM 的 context 是否足夠完整，是否缺少必要背景 |
| Metadata Correctness | 檢查 chunk 的 project id、source file、section title、parent id 等 metadata 是否正確 |
| Latency | 觀察 query embedding、retrieval、reranking、response generation 的整體耗時 |
| Failure Rate | 統計 retrieval failure、empty result、timeout、backend error 或回答無法生成的比例 |
| Source Traceability | 確認每次回答是否能追蹤到使用的 source chunks |
| User Query Coverage | 評估 knowledge base 是否能覆蓋常見的使用者問題類型 |
| Knowledge Freshness | 檢查檢索到的內容是否來自最新版本的專案文件 |

這些指標可以幫助開發者判斷 RAG 系統的問題來自哪一層。例如，如果 retrieval accuracy 低，代表檢索策略、chunking 或 metadata filtering 可能需要調整；如果 retrieved chunks 正確但 answer groundedness 低，則可能是 prompt grounding 或 response generation 的問題。

在本專案中，evaluation metrics 不只是用於系統測試，也可以作為 knowledge base improvement 的依據。當某些問題長期無法被正確回答時，開發者可以檢查是否缺少 Markdown 文件、chunking 是否切得太碎、metadata 是否標記錯誤，或 retrieval strategy 是否需要加入更嚴格的 filtering 與 reranking。

## **4.9.5 Engineering Best Practices（工程最佳實務）**

為了讓 RAG analytics and evaluation 能夠長期支援系統品質改善，本專案在設計上遵循以下工程最佳實務：

**1. 建立固定測試問題集 ：**RAG 系統應建立一組固定的 evaluation questions，涵蓋架構設計、部署流程、錯誤排查、服務選型、資料流與安全性等主題。這可以讓開發者在每次更新 knowledge base、chunking strategy 或 retrieval logic 後，重新測試系統表現。

**2. 同時檢查檢索結果與最終回答：**只看 AI 回答是否流暢是不夠的。開發者應同時檢查 retrieved chunks 是否正確、source metadata 是否合理，以及 final answer 是否真正根據 retrieved context 生成。

3. **記錄 source chunks 與 similarity score：**每次 RAG 回答都應保留 source file、section title、chunk id、parent id 與 similarity score。這些資訊可以幫助開發者判斷檢索結果是否可信，也方便追蹤錯誤回答的原因。

**4. 區分 retrieval failure 與 generation failure：**如果回答錯誤，需要判斷問題來自哪一層。若 retrieved chunks 不相關，問題通常來自 retrieval pipeline；若 chunks 正確但回答仍然錯誤，問題可能來自 prompt construction、context assembly 或 LLM generation。

**5. 定期審查 knowledge base：**當系統多次無法回答某類問題時，可能代表 knowledge base 缺少對應文件。開發者應定期檢查 Markdown 文件是否完整、是否過期，以及是否需要新增 deployment、troubleshooting、security 或 monitoring 文件。

6. **控制 latency 與成本：**RAG pipeline 包含 embedding、retrieval、reranking、context assembly 與 response generation。系統應觀察每個階段的耗時，避免過大的 candidate pool、過長的 context 或不必要的模型呼叫造成延遲與成本增加。

**7. 持續改善 chunking、metadata 與 retrieval strategy：**RAG evaluation 的結果應回饋到前面的 knowledge management 設計。如果 evaluation 發現檢索結果不穩定，就需要重新檢查 chunking rules、metadata schema、parent-child mapping、reranking 邏輯與 source organization。

整體而言，RAG analytics and evaluation 是本專案 AI Assistant 的品質控制與持續改善機制。它讓系統不只是能產生回答，也能讓開發者知道回答是否可信、來源是否正確、檢索是否有效，以及 knowledge base 是否需要更新。

# 4.10 RAG 系統總結

本章節完整說明本專案 GCP RAG AI Assistant 的系統設計。整體架構從知識來源管理開始，經過文件匯入、chunking、metadata 設計、retrieval pipeline、response generation、conversation memory，到最後的 RAG analytics and evaluation，形成一套完整的 AI knowledge management and retrieval system。

在 knowledge management 層，本系統使用 Markdown 技術文件作為主要知識來源，包含專案狀態紀錄、架構說明、開發日誌、測試紀錄與部署文件。這些文件經由 document ingestion pipeline 進入系統，並透過 Markdown-aware chunking 被轉換成適合檢索的知識片段。

在 chunking 與 metadata 設計上，本專案不只是將文件切成固定長度的文字，而是保留 Markdown heading、章節結構、parent-child 關係與 source metadata。這樣可以讓每個 chunk 成為可檢索、可追蹤、可維護的知識單位，也讓系統能夠根據 project id、document type、section title 與 parent id 進行更精準的檢索與上下文還原。

在 retrieval pipeline 中，系統會將使用者問題轉換成 query embedding，並從 Firestore knowledge store 中搜尋相關 chunks。為了避免不同專案內容混在一起，本系統結合 semantic search、metadata filtering、parent-child retrieval 與 ranking，使 AI Assistant 能夠找到最符合目前專案情境的知識內容。

在 response generation 階段，LLM 不會直接依靠自身知識回答，而是根據 retrieval pipeline 提供的 retrieved context 產生 grounded response。系統會透過 context assembly 與 prompt construction 將相關 chunks、source metadata 與使用者問題組合成 prompt，讓回答更符合專案文件內容，並降低 hallucination 的風險。

此外，本系統也設計了 conversation memory management，用於保存同一個 session 中的使用者訊息與 AI 回答。Conversation memory 主要支援多輪對話與上下文延續，但不取代 RAG knowledge base。專案事實仍然以正式文件與 retrieval results 為主要依據。

最後，RAG analytics and evaluation 提供系統品質控制與持續改善機制。透過記錄 query log、retrieved chunks、source metadata、generated response、latency 與 failure cases，開發者可以分析回答是否根據正確來源、檢索結果是否相關，以及 knowledge base 是否需要更新。

整體而言，本專案的 RAG 系統不只是單純的 AI 問答功能，而是一套結合 cloud architecture、knowledge management、semantic retrieval、LLM response generation 與 evaluation feedback 的完整 AI assistant system。這樣的設計讓 AI Assistant 能夠根據實際專案文件回答問題，並在多專案、多文件與多輪對話的情境下維持可追蹤性、準確性與工程可信度。