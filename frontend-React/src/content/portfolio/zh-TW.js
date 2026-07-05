/**
 * Traditional Chinese (zh-TW) portfolio content.
 *
 * Contains all zh-TW UI copy and project card metadata used by the
 * portfolio homepage, project modal, contact section, and AI assistant labels.
 *
 * This file is intentionally content-only. Rendering logic belongs in React
 * components, and markdown document loading belongs in projectDocs/.
 */

export const zhTW = {
  brand: "Jarrett / 雲端履歷",
  nav: {
    about: "關於",
    skills: "技能",
    projects: "Portfolio",
    contact: "聯絡",
  },
  hero: {
    Top: "大家好，我是 Jarrett，歡迎來到我的專案作品。",
    titleAws: "AWS 雲端履歷",
    titleFt: "ft.",
    titleGcp: "GCP RAG 助理",
    titleTwoLine: false,
    Bottom: "Tibame AWS雲端工程師養成班專題作品",
    description:
      "這裡記錄了我的 AWS 學習歷程與實作。歡迎自由探索各個專案，並透過 AI 助理深入了解每個專案的內容與細節。",
    projectsAction: "查看 Portfolio",
    aiAction: "詢問 AI 助理",
    monitor: {
      heading: "精選專案",
      archLabel: "架構總覽",
    },
    aiCard: {
      label: "AI 助理",
      onlineLabel: "在線",
      question: "這個專案的整體架構是怎麼設計的？",
      answer:
        "本專案採用 AWS + GCP 多雲端架構，整合 Serverless API 與 RAG AI 問答系統。",
    },
  },
  capstone: {
    label: "目前多雲流程",
    steps: [
      "React 與 Vite 提供作品集體驗。",
      "AWS delivery 與 visitor counter 資源正在新帳號中重建。",
      "Cloud Run 處理 AI assistant 請求。",
      "Gemini、Firestore 與 Cloud Storage 提供 RAG 知識基礎。",
    ],
  },
  about: {
    label: "About Me / 關於我",
    lead: "你好，我是 Jarrett。",
    intro: {
      bold: "Hi Everyone This is Jarrett",
      normal: "各位大家好，我是陳敬智，來自 🇲🇾",
    },
    details: [
      "目前正在 Tibame 進修轉職中，希望進入資訊雲端產業，\n目標成為一名雲端工程師。",
    ],
    autobiographyLabel: "Autobiography / 自傳",
  },
  skills: {
    label: "Skills / 技能",
    groups: [
      {
        key: "cloud",
        category: "雲端平台",
        items: ["AWS", "Google Cloud Platform"],
      },
      { key: "os", category: "作業系統", items: ["Linux"] },
      { key: "container", category: "容器技術", items: ["Docker"] },
      { key: "programming", category: "程式開發", items: ["Python"] },
      {
        key: "iac",
        category: "Infrastructure as Code",
        items: ["Terraform"],
      },
      { key: "database", category: "資料庫", items: ["MySQL"] },
      {
        key: "versionControl",
        category: "版本控制",
        items: ["Git", "GitHub"],
      },
      { key: "devops", category: "DevOps", items: ["CI/CD"] },
    ],
  },
  education: {
    label: "Education / 教育",
    items: [
      {
        title: "Tibame",
        subtitle: "AWS 雲端工程師就業養成班",
        meta: "2026.02 – 2026.07",
      },
      {
        title: "逢甲大學",
        subtitle: "企業管理學系",
        meta: "2020 – 2024",
      },
      {
        title: "交換學程 Exchange Program",
        subtitle: "荷蘭，Hanze University of Applied Sciences 🇳🇱",
      },
    ],
  },
  experience: {
    label: "Experience / 工作經歷",
    items: [
      {
        title: "行銷專員",
        subtitle: "製造業",
        meta: "2025",
      },
      {
        title: "職涯轉換",
        subtitle: "尋求雲端工程師職位",
        variant: "outline",
      },
    ],
  },
  projects: {
    label: "Portfolio",
    description: "橫跨 AWS 與 GCP 的雲端工程、AI 系統與無伺服器應用作品集。",
    more: "更多專案",
    problem: "問題",
    solution: "解法",
    challenge: "挑戰",
    outcome: "結果",
    goal: "專案目標",
    primaryTechnologies: "主要技術",
    currentStatus: "目前狀態",
    statusUnavailable: "已整理為作品集案例。",
    details: "查看專案細節",
    services: "服務與技術",
    architecture: "架構摘要",
    architectureDiagram: "架構圖",
    diagramPlaceholder: "架構圖預留區，可之後替換為正式圖檔。",
    serviceFlow: "服務流程",
    systemLayers: "系統分層",
    notes: "技術筆記",
    documentationHub: "工程文件中心",
    documentationIntro:
      "集中整理架構、開發紀錄、測試、部署與後續規劃的技術文件區。",
    defaultDocs: {
      architecture: {
        type: "Diagram",
        title: "Architecture Diagram",
        description: "服務配置與請求流程參考。",
      },
      development: {
        type: "Log",
        title: "Development Log",
        description: "實作決策、調整與里程碑紀錄。",
      },
      tests: {
        type: "Record",
        title: "Test Records",
        description: "Build、lint、smoke test 與驗證紀錄。",
      },
      deployment: {
        type: "Notes",
        title: "Deployment Notes",
        description: "託管、執行環境與設定紀錄。",
      },
      roadmap: {
        type: "Plan",
        title: "Future Roadmap",
        description: "後續優化與 production hardening 規劃。",
      },
    },
    closeModal: "關閉專案細節",
    continueReading: "向下捲動以繼續閱讀",
    tabs: {
      overview: "總覽",
      architecture: "架構",
      challenges: "挑戰",
      documentation: "文件",
      ai: "AI Assistant",
    },
    // 注意：這裡只保留共用的 UI 標籤。每個專案自己的歷程步驟現在放在該專案的
    // item 底下的 journeySteps（見下方 items）——先前 steps 放在這裡，導致每個
    // 專案顯示的都是同一份 AWS Cloud Resume 歷程。
    projectJourney: {
      label: "專案歷程",
      comingSoon: "即將推出",
    },
    resources: {
      label: "更多資源",
      github: "GitHub",
      slides: "簡報.pdf",
      technicalDocs: "技術文件",
      githubUrl: "https://github.com/jarrett6796/AWS-Cloud-Portfolio",
      slidesUrl: "/resources/slide.pdf",
      technicalDocsUrl: "/resources/technical-documentation.pdf",
    },
    items: [
      {
        id: "cloud-resume-rag",
        projectId: "aws-gcp-rag",
        type: "Capstone Project",
        title: "AWS Cloud Resume + GCP RAG",
        body: "結合 AWS 無伺服器架構與 Gemini 檢索生成系統的多雲 AI 作品集平台。",
        previewImage: {
          src: "/projectCard-images/pc-crcrag-1.png",
          alt: "AWS Cloud Resume and GCP RAG architecture diagram",
        },
        journeySteps: [
          {
            id: "background-story",
            title: "背景故事",
            subsections: [
              {
                id: "from-job-seeker",
                title: "求職者",
                image: "/projectJourney-images/1.1_FromJobSeeker.png",
              },
              {
                id: "from-recruiter",
                title: "企業人資",
                image: "/projectJourney-images/1.2_FromRecruiter.png",
              },
            ],
          },
          {
            id: "problem-statement",
            title: "問題描述",
            subsections: [
              {
                id: "purpose-of-resume-cv",
                title: "履歷／作品集的目的",
                image: "/projectJourney-images/2.1_problemStatement_CV.png",
              },
              {
                id: "job-seeker-perspective",
                title: "求職者角度",
                image:
                  "/projectJourney-images/2.2_proBlemStatement_JobSeeker.png",
              },
              {
                id: "recruiter-perspective",
                title: "企業人資角度",
                image:
                  "/projectJourney-images/2.3_problemStatementRecruiter.png",
              },
              {
                id: "gap-between-both",
                title: "共同落差",
                image: "/projectJourney-images/2.4_problemStamen_GAP.png",
              },
            ],
          },
          {
            id: "solution",
            title: "解決方案",
            image: "/projectJourney-images/3_Solution.png",
          },
          {
            id: "project-inspiration",
            title: "專案靈感",
            image: "/projectJourney-images/4_Inspiration.png",
          },
          {
            id: "system-architecture",
            title: "系統架構設計",
            subsections: [
              {
                id: "frontend-ui-ux",
                title: "前端 UI/UX",
                image: "/projectJourney-images/5.1_FrontendUIUX.png",
              },
              {
                id: "aws-architecture",
                title: "AWS 架構",
                image: "/projectJourney-images/5.2_AWS.png",
              },
              {
                id: "gcp-architecture",
                title: "GCP 架構",
                image: "/projectJourney-images/5.3_GCP.png",
              },
            ],
          },
          {
            id: "development-journey",
            title: "開發歷程",
            subsections: [
              {
                id: "frontend-development",
                title: "前端開發",
                image: "/projectJourney-images/6.1_Frontend.png",
              },
              {
                id: "aws-development",
                title: "AWS 開發",
                image: "/projectJourney-images/6.2_AWS.png",
              },
              {
                id: "gcp-rag-development",
                title: "GCP RAG 開發",
                image: "/projectJourney-images/6.3_GCP.png",
              },
            ],
          },
          {
            id: "challenges-iterations",
            title: "開發挑戰與迭代",
            subsections: [
              {
                id: "frontend-challenges",
                title: "前端挑戰",
                image: "/projectJourney-images/7.1_Frontend.png",
              },
              {
                id: "aws-challenges",
                title: "AWS 挑戰",
                image: "/projectJourney-images/7.2_AWS.png",
              },
              {
                id: "gcp-rag-challenges",
                title: "GCP RAG 挑戰",
                image: "/projectJourney-images/7.3_GCP.png",
              },
            ],
          },
          {
            id: "project-outcome",
            title: "專案成果",
            image: "/projectJourney-images/8_Thankyou.png",
          },
        ],
        problem: "作品集需要快速、容易被招募者理解，並能說明背後的雲端架構。",
        solution:
          "前端與訪客計數保留在 AWS，AI/RAG 後端則使用 GCP 的 Cloud Run、Gemini、Firestore 與 GCS。",
        services: ["AWS", "GCP", "Multi-Cloud", "Cloud Run", "Gemini", "RAG"],
        architecture:
          "React 呈現作品集，訪客計數經 AWS API Gateway、Lambda、DynamoDB，助理問題則送至 Cloud Run 進行檢索與 Gemini 回應。",
        notes:
          "保留 AWS serverless counter 作為雲端履歷里程碑，同時使用 GCP 作為目前實際運作的 RAG 路徑。",
        modal: {
          summary:
            "這是一個多雲工程作品集，結合 AWS 無伺服器基礎設施與 GCP-native retrieval-augmented generation 助理。平台展示 cloud-native 前端部署、serverless 訪客追蹤、AI 知識檢索與跨 AWS、Google Cloud 的現代應用架構。",
          goal: "建立一個容易被招募者理解的雲端工程作品集，同時展示可運作的 AWS serverless 基礎與部署在 GCP 的 RAG 助理。",
          technologies: [
            "React",
            "Vite",
            "S3",
            "CloudFront",
            "API Gateway",
            "Lambda",
            "DynamoDB",
            "Cloud Run",
            "Gemini",
            "Firestore",
            "Cloud Storage",
            "RAG",
          ],
          status:
            "目前已有可運作的 GCP RAG backend 與模組化 React frontend。AWS S3、CloudFront、API Gateway、Lambda、DynamoDB、SNS、EventBridge、IAM 與 CI/CD integration 是新 AWS 帳號中的 migration/rebuild 工作。",
          architecture: {
            diagram: {
              src: "/architecture/aws-gcp-rag-architecture.png",
              alt: "AWS frontend, AWS visitor counter, and GCP RAG backend architecture diagram",
            },
            diagramLabel: "AWS + GCP RAG 架構圖",
            flow: [
              "React + Vite",
              "CloudFront",
              "API Gateway",
              "Lambda",
              "DynamoDB",
              "Cloud Run",
              "Firestore",
              "Gemini",
            ],
            explanation:
              "前端以 AWS 靜態網站方式交付，訪客計數保留在 AWS serverless 路徑；AI 助理問題則透過 API 解耦到 GCP Cloud Run backend，由 Firestore 檢索文件 chunks，再交給 Gemini 產生 grounded responses。",
            layers: [
              {
                title: "Frontend Layer",
                items: ["React", "Vite", "S3", "CloudFront"],
              },
              {
                title: "AWS Serverless Layer",
                items: ["API Gateway", "Lambda", "DynamoDB"],
              },
              {
                title: "GCP AI Backend Layer",
                items: ["Cloud Run", "Gemini", "Firestore", "Cloud Storage"],
              },
              {
                title: "RAG Layer",
                items: [
                  "Retrieval",
                  "Context assembly",
                  "Grounded response generation",
                ],
              },
            ],
          },
          challenges: [
            {
              title: "AWS Bedrock embedding quota limitations",
              problem:
                "原本的 Lambda 與 Bedrock RAG 路徑在專題時程內受到實際存取與 quota 限制影響。",
              solution:
                "改採 GCP-native RAG implementation，使用 Cloud Run、Gemini、Firestore 與 Cloud Storage。",
              outcome:
                "成功部署可運作的 retrieval assistant，同時保留 AWS serverless visitor counter 里程碑。",
            },
            {
              title: "Integrating AWS frontend with GCP backend",
              problem:
                "作品集需要保留 AWS delivery 與 visitor tracking，同時使用獨立的 GCP backend 處理 AI retrieval。",
              solution:
                "透過 API communication 解耦系統，讓 React frontend 能獨立呼叫 Cloud Run RAG endpoint。",
              outcome:
                "維持 AWS frontend/serverless services 與 GCP AI services 的獨立雲端分層。",
            },
            {
              title: "Frontend and backend modularization",
              problem:
                "早期實作容易把 UI、API、state、route 與 service logic 集中在大型檔案中。",
              solution:
                "將 frontend refactor 成 reusable components、hooks 與 API modules，backend 則拆成 config、schemas、routes 與 service layers。",
              outcome:
                "在不改變 `/ask-rag` 行為的前提下，改善架構清晰度與可維護性。",
            },
          ],
          documentation: [
            {
              type: "Diagram",
              title: "System Module Diagram",
              description:
                "Frontend components、hooks、API clients、backend routes 與 service boundaries 的模組視圖。",
            },
            {
              type: "Diagram",
              title: "Architecture Diagram",
              description:
                "AWS static delivery、AWS visitor tracking 與 GCP RAG services 的多雲請求流程。",
            },
            {
              type: "Log",
              title: "Development Log",
              description:
                "AWS RAG 規劃、GCP pivot、frontend integration 與 backend refactor 的時間序紀錄。",
            },
            {
              type: "Record",
              title: "Test Records",
              description:
                "V1 frontend lint/build、AWS visitor counter、GCP health、RAG endpoint 與 CORS 驗證紀錄。",
            },
            {
              type: "Notes",
              title: "Deployment Notes",
              description:
                "Frontend hosting、Cloud Run runtime、本機 port convention 與 production environment reminders。",
            },
            {
              type: "Plan",
              title: "Future Roadmap",
              description:
                "Streaming frontend integration、persistent chat history、vector indexing、CI RAG evaluation 與 monitoring。",
            },
          ],
        },
      },
      {
        id: "url-shortener",
        projectId: "url-shortener",
        type: "Distributed Backend",
        title: "URL Shortener 和 QR Code Generator",
        body: "規劃中的 URL shortener，聚焦 distributed backend architecture、API design、data modeling 與 scalability patterns。",
        journeySteps: [
          { id: "background-story", title: "背景故事" },
          { id: "problem-statement", title: "問題描述" },
          { id: "solution", title: "解決方案" },
          { id: "system-architecture", title: "系統架構設計" },
          { id: "development-journey", title: "開發歷程" },
          { id: "challenges-iterations", title: "開發挑戰與迭代" },
          { id: "project-outcome", title: "專案成果" },
        ],
        problem:
          "URL shortener 需要清楚的 API boundaries、可預測的 data access patterns 與可擴展的 redirect behavior。",
        solution:
          "設計 create/redirect APIs、durable key mapping、collision handling 與 operational metrics。",
        services: ["API Design", "Backend", "Data Modeling", "Scalability"],
        architecture:
          "Clients 透過 API layer 建立 short links，storage 將 slugs 對應到 target URLs，redirect reads 針對低延遲最佳化。",
        notes:
          "Roadmap project only。目前 repository 尚無 implementation evidence。",
      },
      {
        id: "video-streaming-platform",
        projectId: "video-streaming",
        type: "Media Delivery",
        title: "Video Streaming Platform",
        body: "規劃中的 video streaming platform，聚焦 CDN architecture、media delivery、scalable content distribution 與 high availability。",
        journeySteps: [
          { id: "background-story", title: "背景故事" },
          { id: "problem-statement", title: "問題描述" },
          { id: "solution", title: "解決方案" },
          { id: "system-architecture", title: "系統架構設計" },
          { id: "development-journey", title: "開發歷程" },
          { id: "challenges-iterations", title: "開發挑戰與迭代" },
          { id: "project-outcome", title: "專案成果" },
        ],
        problem:
          "Video delivery 需要 low-latency global distribution、resilient storage 與可預測的 content serving behavior。",
        solution:
          "設計 CDN-backed media platform，包含 origin storage、cache behavior 與 availability planning。",
        services: [
          "CDN",
          "Object Storage",
          "Media Delivery",
          "High Availability",
        ],
        architecture:
          "Users 透過 CDN request video assets，CDN 從 origin storage 取得 media，並透過 caching policies 降低 origin load。",
        notes:
          "Roadmap project only。未來 implementation 應包含 upload、processing、delivery 與 observability plans。",
      },
    ],
  },
  contact: {
    label: "聯絡方式",
    title: "開放工作機會",
    role: "雲端工程相關職位與其他相關機會",
    summary: "歡迎聯絡我討論工作機會或面試邀請。",
    invite: "如果想交流 AWS 專案、技術內容或合作想法，也非常歡迎聯繫。",
    fields: {
      name: "姓名",
      email: "電子郵件",
      subject: "主旨",
      message: "訊息",
    },
    placeholders: {
      name: "Your name",
      email: "you@company.com",
      subject: "Cloud role / Collaboration / Just saying hi",
      message: "Tell me what you're building...",
    },
    send: "送出訊息 →",
    status: {
      submitting: "Sending...",
      success: "訊息已成功送出，感謝您的聯繫～",
      error: "訊息無法送出，請稍後再試。",
      validationError: "請先修正標示的欄位再送出。",
    },
    validation: {
      nameRequired: "請填寫姓名。",
      emailRequired: "請填寫電子郵件。",
      emailInvalid: "請輸入有效的電子郵件格式。",
      subjectRequired: "請填寫主旨。",
      messageRequired: "請填寫訊息。",
      messageTooLong: "訊息不可超過 5000 個字元。",
    },
  },
  controls: {
    progress: "閱讀進度",
    language: "語言選擇",
    light: "淺色",
    dark: "深色",
    switchToLight: "切換為淺色模式",
    switchToDark: "切換為深色模式",
    views: "瀏覽",
  },
  chat: {
    open: "開啟 AI 助理",
    close: "關閉 AI 助理",
    newChat: "開始新對話",
    title: "AI Assistant",
    context: "專題聊天",
    currentContext: "目前脈絡",
    askShort: "Ask AI",
    askLineOne: "Ask",
    askLineTwo: "AI",
    askSiteLineOne: "Ask AI",
    askSiteLineTwo: "About Site",
    askProjectLineOne: "Ask AI About",
    askProjectLineTwo: "This Project",
    openPanel: "開啟 AI 助理面板",
    closePanel: "關閉 AI 助理面板",
    suggestionsLabel: "建議問題",
    suggestions: [
      "說明這個專題的請求流程。",
      "這個專案展示哪些 AWS 技能？",
      "摘要 RAG 設計選擇。",
    ],
    projectSuggestions: [
      "說明這個架構。",
      "為什麼使用 serverless？",
      "描述部署流程。",
      "說明 DynamoDB 用途。",
      "為什麼選擇 Lambda？",
    ],
    sampleLabel: "範例回應",
    sampleResponse:
      "這個作品集將交付、運算、中繼資料與檢索職責分開，讓每個 AWS 層次保持聚焦。",
    composer: "訊息輸入區",
    placeholder: "詢問架構、專案或技能",
    send: "傳送訊息",
  },
};
