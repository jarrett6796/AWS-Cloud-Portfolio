export const contentByLanguage = {
  en: {
    brand: "Jarrett / Cloud Resume",
    nav: {
      about: "About",
      skills: "Skills",
      projects: "Projects",
      contact: "Contact",
    },
    hero: {
      eyebrow: "Cloud Engineer Capstone",
      title: "Cloud Resume + Lambda RAG Assistant",
      description:
        "A serverless portfolio platform that presents cloud engineering work and pairs it with an AWS-powered assistant grounded in project knowledge.",
      projectsAction: "View Projects",
    },
    capstone: {
      label: "Core AWS Path",
      steps: [
        "CloudFront delivers the resume experience.",
        "API Gateway routes assistant requests.",
        "Lambda coordinates retrieval and responses.",
        "Bedrock and S3 Vectors ground the RAG flow.",
      ],
    },
    about: {
      label: "About Me",
      title:
        "Hi, I’m Jarrett,\n\ncurrently transitioning into cloud\ncomputing as a Cloud Engineer.",
      details: [
        "Previously worked as a Marketing Specialist in the solid capacitor manufacturing industry.",
        "Currently taking the Tibame AWS Cloud Engineering course while building hands-on cloud projects and strengthening my AWS knowledge.",
      ],
    },
    skills: {
      label: "Skills",
      title: "Cloud engineering focus areas.",
      items: [
        {
          title: "Serverless",
          body: "Lambda, API Gateway, event-aware design, and managed scaling.",
        },
        {
          title: "Cloud Data",
          body: "DynamoDB metadata, S3 document storage, and vector retrieval.",
        },
        {
          title: "Generative AI",
          body: "Amazon Bedrock workflows with grounded knowledge retrieval.",
        },
        {
          title: "Delivery",
          body: "CloudFront hosting, DNS readiness, CI/CD, and clear logging.",
        },
      ],
    },
    projects: {
      label: "Projects",
      more: "More Projects",
      problem: "Problem",
      solution: "Solution",
      details: "View Project Details",
      services: "AWS Services Used",
      architecture: "Architecture Summary",
      notes: "Technical Notes",
      closeModal: "Close project details",
      tabs: {
        overview: "Overview",
        architecture: "Architecture",
        stack: "Tech Stack",
        lessons: "Lessons Learned",
        ai: "AI Assistant",
      },
      items: [
        {
          id: "cloud-resume",
          type: "Flagship Project",
          title: "Cloud Resume Platform",
          body: "A responsive resume homepage delivered as a cloud-hosted frontend with visitor and deployment foundations.",
          problem:
            "A portfolio needs to be fast, clear to recruiters, and credible as a cloud engineering artifact.",
          solution:
            "Serve a focused resume experience from managed AWS hosting and keep the frontend ready for serverless metrics.",
          services: ["S3", "CloudFront", "Route 53", "GitHub Actions"],
          architecture:
            "Static assets move from S3 through CloudFront to visitors, while deployment automation keeps releases repeatable.",
          notes:
            "Keep hosting static, version releases through CI, and reserve API boundaries for metrics and assistant features.",
        },
        {
          id: "rag-assistant",
          type: "AI Extension",
          title: "Lambda RAG Assistant",
          body: "A serverless assistant surface designed to ground portfolio answers in project context.",
          problem:
            "Portfolio visitors may need quick explanations of architecture decisions without scanning every section.",
          solution:
            "Route assistant requests through Lambda orchestration with retrieval context before generation.",
          services: [
            "API Gateway",
            "Lambda",
            "Amazon Bedrock",
            "S3",
            "S3 Vectors",
          ],
          architecture:
            "API Gateway passes prompts to Lambda, which coordinates retrieval from stored knowledge before a Bedrock response.",
          notes:
            "Keep orchestration serverless, ground responses before generation, and expose only focused assistant endpoints.",
        },
        {
          id: "visitor-metadata",
          type: "Serverless Data",
          title: "Visitor Metadata Tracker",
          body: "A compact tracking layer for portfolio interactions and future resume metrics.",
          problem:
            "A cloud resume should be able to capture useful engagement signals without a heavy application stack.",
          solution:
            "Use focused API events and durable managed storage for lightweight visitor metadata.",
          services: ["API Gateway", "Lambda", "DynamoDB", "CloudWatch"],
          architecture:
            "A narrow API invokes Lambda for validation and DynamoDB writes, with CloudWatch logs available for review.",
          notes:
            "Prefer small event payloads, DynamoDB-friendly access patterns, and structured logs for later metrics work.",
        },
        {
          id: "delivery-pipeline",
          type: "Automation",
          title: "Frontend Delivery Pipeline",
          body: "A CI/CD path for building, validating, and publishing the capstone frontend.",
          problem:
            "Manual releases add drift and make portfolio updates harder to trust.",
          solution:
            "Validate the Vite app in CI and publish versioned frontend output with controlled AWS permissions.",
          services: ["GitHub Actions", "IAM", "S3", "CloudFront"],
          architecture:
            "The pipeline runs checks, uploads static build output, and refreshes the delivery edge after release.",
          notes:
            "Use least-privilege deployment credentials, validate before publish, and keep static release steps repeatable.",
        },
        {
          id: "knowledge-ingestion",
          type: "RAG Data",
          title: "Knowledge Ingestion Layer",
          body: "A document pipeline concept for clean retrieval inputs and vector-backed context.",
          problem:
            "An assistant needs project knowledge that is organized and retrieval-ready.",
          solution:
            "Store source documents, prepare managed knowledge retrieval, and keep vector context aligned with the assistant.",
          services: [
            "S3",
            "Bedrock Knowledge Bases",
            "S3 Vectors",
            "CloudWatch",
          ],
          architecture:
            "Documents land in S3, knowledge retrieval indexes the content, and vector search supports targeted context.",
          notes:
            "Separate source documents from retrieval behavior so knowledge updates stay traceable and easy to evolve.",
        },
      ],
    },
    contact: {
      label: "Contact",
      title: "Open to Hire",
      role: "Cloud Engineering Roles or Other Relevant Opportunities",
      summary:
        "Feel free to reach out regarding opportunities or interview invitations.",
      invite:
        "If you'd like to discuss AWS projects, technical topics, or collaboration ideas, you're also welcome to connect.",
      fields: {
        name: "Name",
        email: "Email",
        subject: "Subject",
        message: "Message",
      },
      placeholders: {
        name: "Your name",
        email: "you@company.com",
        subject: "Cloud role / Collaboration / Just saying hi",
        message: "Tell me what you're building...",
      },
      send: "Send Message →",
    },
    controls: {
      progress: "Reading progress",
      language: "Language selection",
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
      views: "Views",
    },
    chat: {
      open: "Open AI assistant",
      close: "Close AI assistant",
      title: "AI Assistant",
      context: "Capstone chat",
      currentContext: "Current Context",
      askShort: "Ask AI",
      askLineOne: "Ask",
      askLineTwo: "AI",
      askSiteLineOne: "Ask AI",
      askSiteLineTwo: "About Site",
      askProjectLineOne: "Ask AI About",
      askProjectLineTwo: "This Project",
      expand: "Expand AI assistant",
      collapse: "Collapse AI assistant",
      openPanel: "Open AI assistant panel",
      closePanel: "Close AI assistant panel",
      suggestionsLabel: "Suggested questions",
      suggestions: [
        "Explain the capstone request flow.",
        "Which AWS skills does this project demonstrate?",
        "Summarize the RAG design choices.",
      ],
      projectSuggestions: [
        "Explain this architecture.",
        "Why use serverless?",
        "Describe deployment flow.",
        "Explain DynamoDB usage.",
        "Why choose Lambda?",
      ],
      sampleLabel: "Sample response",
      sampleResponse:
        "The portfolio separates delivery, compute, metadata, and retrieval concerns so each AWS layer stays focused.",
      composer: "Message composer",
      placeholder: "Ask about architecture, projects, or skills",
      send: "Send message",
    },
  },
  "zh-TW": {
    brand: "Jarrett / 雲端履歷",
    nav: {
      about: "關於",
      skills: "技能",
      projects: "專案",
      contact: "聯絡",
    },
    hero: {
      eyebrow: "雲端工程師專題",
      title: "雲端履歷 + Lambda RAG 助理",
      description:
        "以無伺服器架構打造的作品集平台，呈現雲端工程實作，並結合以專案知識為基礎的 AWS 助理。",
      projectsAction: "查看專案",
    },
    capstone: {
      label: "核心 AWS 流程",
      steps: [
        "CloudFront 傳遞雲端履歷體驗。",
        "API Gateway 路由助理請求。",
        "Lambda 協調檢索與回應流程。",
        "Bedrock 與 S3 Vectors 提供 RAG 知識基礎。",
      ],
    },
    about: {
      label: "About Me",
      title:
        "你好，我是 Jarrett，\n\n目前正轉職進入雲端運算領域，\n目標成為一名 Cloud Engineer。",
      details: [
        "曾在固態電容製造產業擔任 Marketing Specialist。",
        "目前正在參與 Tibame AWS Cloud Engineering 課程，\n並透過實作型雲端專案持續強化自己的 AWS 技術能力。",
      ],
    },
    skills: {
      label: "技能",
      title: "雲端工程重點能力。",
      items: [
        {
          title: "無伺服器",
          body: "Lambda、API Gateway、事件導向設計與託管擴展能力。",
        },
        {
          title: "雲端資料",
          body: "DynamoDB 中繼資料、S3 文件儲存與向量檢索。",
        },
        {
          title: "生成式 AI",
          body: "以 Amazon Bedrock 建立具知識檢索基礎的工作流程。",
        },
        {
          title: "交付",
          body: "CloudFront 託管、DNS 準備、CI/CD 與清楚的紀錄策略。",
        },
      ],
    },
    projects: {
      label: "專案",
      more: "更多專案",
      problem: "問題",
      solution: "解法",
      details: "查看專案細節",
      services: "使用的 AWS 服務",
      architecture: "架構摘要",
      notes: "技術筆記",
      closeModal: "關閉專案細節",
      tabs: {
        overview: "總覽",
        architecture: "架構",
        stack: "技術堆疊",
        lessons: "學習重點",
        ai: "AI Assistant",
      },
      items: [
        {
          id: "cloud-resume",
          type: "旗艦專案",
          title: "雲端履歷平台",
          body: "以雲端前端交付的可回應式履歷首頁，並預留訪客與部署基礎。",
          problem:
            "作品集需要快速、容易被招募者理解，且能展現可信的雲端工程實作。",
          solution: "使用託管 AWS 靜態交付架構，並讓前端可銜接無伺服器指標。",
          services: ["S3", "CloudFront", "Route 53", "GitHub Actions"],
          architecture:
            "靜態資產由 S3 經 CloudFront 交付給訪客，部署自動化讓發版可重複。",
          notes:
            "保持靜態託管、透過 CI 版控發版，並將指標與助理功能留在清楚的 API 邊界。",
        },
        {
          id: "rag-assistant",
          type: "AI 延伸",
          title: "Lambda RAG 助理",
          body: "以專案脈絡為基礎回應作品集問題的無伺服器助理介面。",
          problem: "訪客可能需要快速理解架構決策，而不是逐段搜尋整個作品集。",
          solution: "透過 Lambda 協調檢索脈絡，再交由生成流程回應。",
          services: [
            "API Gateway",
            "Lambda",
            "Amazon Bedrock",
            "S3",
            "S3 Vectors",
          ],
          architecture:
            "API Gateway 傳入提示，Lambda 協調知識檢索，再由 Bedrock 產生回應。",
          notes:
            "保留無伺服器協調流程、先建立檢索脈絡，再只公開聚焦的助理端點。",
        },
        {
          id: "visitor-metadata",
          type: "無伺服器資料",
          title: "訪客中繼資料追蹤",
          body: "為作品集互動與後續履歷指標建立輕量追蹤層。",
          problem: "雲端履歷需要收集有用互動訊號，但不應引入沉重應用堆疊。",
          solution: "以聚焦的 API 事件與託管儲存保存輕量訪客中繼資料。",
          services: ["API Gateway", "Lambda", "DynamoDB", "CloudWatch"],
          architecture:
            "窄介面 API 呼叫 Lambda 驗證資料並寫入 DynamoDB，同時保留 CloudWatch 紀錄。",
          notes:
            "使用小型事件 payload、符合 DynamoDB 的存取模式，並保留結構化紀錄供後續指標使用。",
        },
        {
          id: "delivery-pipeline",
          type: "自動化",
          title: "前端交付管線",
          body: "建置、驗證並發布專題前端的 CI/CD 路徑。",
          problem: "手動發版容易造成漂移，也降低作品集更新的可信度。",
          solution: "在 CI 中驗證 Vite 應用，再用受控 AWS 權限發布靜態輸出。",
          services: ["GitHub Actions", "IAM", "S3", "CloudFront"],
          architecture:
            "管線先執行檢查，再上傳靜態建置輸出並更新邊緣交付內容。",
          notes: "部署權限維持最小化，先驗證再發布，並讓靜態發版流程可重複。",
        },
        {
          id: "knowledge-ingestion",
          type: "RAG 資料",
          title: "知識匯入層",
          body: "為乾淨的檢索輸入與向量脈絡規劃文件流程。",
          problem: "助理需要整理良好且可檢索的專案知識。",
          solution: "保存來源文件、建立託管知識檢索，並維持向量脈絡一致。",
          services: [
            "S3",
            "Bedrock Knowledge Bases",
            "S3 Vectors",
            "CloudWatch",
          ],
          architecture: "文件進入 S3，知識檢索建立索引，向量搜尋支援聚焦脈絡。",
          notes: "將來源文件與檢索行為分開，讓知識更新可追蹤且容易演進。",
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
      expand: "展開 AI 助理",
      collapse: "縮小 AI 助理",
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
  },
};
