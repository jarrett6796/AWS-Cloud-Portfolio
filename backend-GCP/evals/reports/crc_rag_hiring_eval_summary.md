# CRC-RAG Hiring Evaluation

## Files Created

- `backend-GCP/evals/questionnaires/en/hr.md`
- `backend-GCP/evals/questionnaires/en/technical_hiring_manager.md`
- `backend-GCP/evals/questionnaires/zh-TW/hr.md`
- `backend-GCP/evals/questionnaires/zh-TW/technical_hiring_manager.md`
- `backend-GCP/evals/golden_questions/crc_rag_en.json`
- `backend-GCP/evals/golden_questions/crc_rag_zh_TW.json`
- `backend-GCP/evals/run_crc_rag_hiring_eval.py`
- `backend-GCP/evals/reports/crc_rag_hiring_eval_en.md`
- `backend-GCP/evals/reports/crc_rag_hiring_eval_en.json`
- `backend-GCP/evals/reports/crc_rag_hiring_eval_zh.md`
- `backend-GCP/evals/reports/crc_rag_hiring_eval_zh.json`
- `backend-GCP/evals/reports/crc_rag_hiring_eval_summary.md`

## English

Questions: `100`

Pass Rate: `13.0%`

## Traditional Chinese

Questions: `100`

Pass Rate: `5.0%`

## HR

Pass Rate: `11.25%`

## Technical Hiring Manager

Pass Rate: `7.5%`

## Citation Success

`62.0%`

## Retrieval Accuracy

`84.0%`

## Grounding Success

`60.0%`

## Response Time

Average response time: `4987.2383 ms`

## Common Failure Reasons

- citation_validation: `76`
- insufficient_context: `80`
- language_mismatch: `52`
- missing_keyword: `180`
- safe_no_answer: `71`
- wrong_retrieval: `32`

## Top 10 Failed Questions

### zh_tech_032

- Question: 如果技術文件只用固定字數切分，可能會發生哪些問題？
- Expected Source: `RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_tech_024

- Question: 如果招聘方回報 AI 回答突然失效，你會先查哪些日誌或分析資料？
- Expected Source: `Architecture 架構圖.md, Implementation 實作流程.md`
- Actual Source: `Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_tech_046

- Question: 如果同時有很多使用者提問，最先出現的擴展問題可能是什麼？
- Expected Source: `RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_tech_048

- Question: 哪些指標可以看出檢索正常，但生成階段逐漸成為瓶頸？
- Expected Source: `RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_tech_047

- Question: 在從無伺服器改成常駐基礎設施前，你會評估哪些取捨？
- Expected Source: `RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_tech_052

- Question: 如果檢索到了正確來源，但回答沒有答到重點，你下一步會查哪裡？
- Expected Source: `RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_tech_054

- Question: 當找不到相關專案上下文時，系統應該怎麼回應？
- Expected Source: `RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `wrong_retrieval, missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.

### zh_hr_036

- Question: 如果要讓這個專題更貼近真實招募流程，你會優先補強什麼？
- Expected Source: `Overview 綜覽.md, Architecture 架構圖.md, Implementation 實作流程.md, RAG 系統設計.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.

### zh_hr_024

- Question: 你會用哪一段實作流程來說明自己完成完整雲端工作流的能力？
- Expected Source: `Overview 綜覽.md, Architecture 架構圖.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md, RAG 系統設計.md`
- Reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.

### zh_hr_016

- Question: 你在求職資訊傳遞上看見什麼痛點，這個系統如何處理？
- Expected Source: `Overview 綜覽.md, Architecture 架構圖.md`
- Actual Source: `Architecture 架構圖.md, Overview 綜覽.md`
- Reason: `missing_keyword, citation_validation, language_mismatch, safe_no_answer, insufficient_context`
- Possible Fix: Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.

## Recommendations

### Quick Wins

- Tighten the answer prompt and validator trace fields so every factual answer cites returned source IDs.
- Add explicit locale-specific answer instructions for English and zh-TW evaluation prompts.

### Medium Effort

- Review failed keyword coverage and add clearer source wording for hiring-facing project value and technical trade-off claims.
- Strengthen CRC-RAG metadata, section headings, and retrieval ranking for Overview, Architecture, Implementation, and RAG design documents.

### Major Architectural Improvements

- Improve parent-child context assembly and retrieval diagnostics for multi-step technical hiring-manager questions.
- Add pre-validation answer traces and validator replacement reasons to distinguish retrieval failure from citation replacement.
