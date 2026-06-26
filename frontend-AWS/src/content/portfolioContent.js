export const contentByLanguage = {
  en: {
    brand: "Jarrett / Cloud Resume",
    nav: {
      about: "About",
      skills: "Skills",
      projects: "Portfolio",
      contact: "Contact",
    },
    hero: {
      eyebrow: "Cloud Engineer Capstone",
      title: "Cloud Resume Challenge + GCP RAG Assistant",
      description:
        "A serverless portfolio platform that presents cloud engineering work and pairs it with a GCP RAG assistant grounded in project knowledge.",
      projectsAction: "View Portfolio",
    },
    capstone: {
      label: "Current Multi-Cloud Path",
      steps: [
        "React and Vite provide the portfolio experience.",
        "AWS delivery and visitor-counter resources are being rebuilt in the new account.",
        "Cloud Run handles assistant requests.",
        "Gemini, Firestore, and Cloud Storage ground the RAG flow.",
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
          body: "DynamoDB planning, Firestore metadata, Cloud Storage documents, and vector retrieval.",
        },
        {
          title: "Generative AI",
          body: "Gemini-based RAG workflows with grounded knowledge retrieval.",
        },
        {
          title: "Delivery",
          body: "CloudFront hosting, DNS readiness, CI/CD, and clear logging.",
        },
      ],
    },
    projects: {
      label: "Portfolio",
      description:
        "A collection of cloud engineering, AI systems, and serverless applications built across AWS and GCP.",
      more: "More Projects",
      problem: "Problem",
      solution: "Solution",
      challenge: "Challenge",
      outcome: "Outcome",
      goal: "Project Goal",
      primaryTechnologies: "Primary Technologies",
      currentStatus: "Current Status",
      statusUnavailable: "Documented project case study.",
      details: "View Project Details",
      services: "Services and Technologies",
      architecture: "Architecture Summary",
      architectureDiagram: "Architecture diagram",
      diagramPlaceholder:
        "Diagram placeholder ready for a future visual export.",
      serviceFlow: "Service Flow",
      systemLayers: "System Layers",
      notes: "Technical Notes",
      documentationHub: "Engineering Documentation Hub",
      documentationIntro:
        "A compact documentation center for architecture, delivery notes, testing, and future project direction.",
      defaultDocs: {
        architecture: {
          type: "Diagram",
          title: "Architecture Diagram",
          description: "Service layout and request flow reference.",
        },
        development: {
          type: "Log",
          title: "Development Log",
          description: "Implementation decisions, pivots, and milestones.",
        },
        tests: {
          type: "Record",
          title: "Test Records",
          description: "Build, lint, smoke test, and validation notes.",
        },
        deployment: {
          type: "Notes",
          title: "Deployment Notes",
          description: "Hosting, runtime, and environment configuration notes.",
        },
        roadmap: {
          type: "Plan",
          title: "Future Roadmap",
          description: "Next improvements and production hardening work.",
        },
      },
      closeModal: "Close project details",
      tabs: {
        overview: "Overview",
        architecture: "Architecture",
        challenges: "Challenges",
        documentation: "Documentation",
        ai: "AI Assistant",
      },
      items: [
        {
          id: "cloud-resume-rag",
          projectId: "aws-gcp-rag",
          type: "Capstone Project",
          title: "AWS Cloud Resume + GCP RAG",
          body: "Multi-cloud AI portfolio platform combining AWS serverless architecture with a Gemini-powered retrieval system.",
          previewImage: {
            src: "/projects-images/Architecture-Overview.png",
            alt: "AWS Cloud Resume and GCP RAG architecture diagram",
          },
          problem:
            "A portfolio needs to be fast, credible to recruiters, and able to explain the architecture behind the work.",
          solution:
            "Keep the frontend and visitor metrics on AWS while running the AI/RAG backend on GCP with Gemini, Firestore, and GCS.",
          services: ["AWS", "GCP", "Multi-Cloud", "Cloud Run", "Gemini", "RAG"],
          architecture:
            "React serves the portfolio, the visitor counter runs through AWS API Gateway, Lambda, and DynamoDB, and assistant questions route to Cloud Run for grounded retrieval and Gemini responses.",
          notes:
            "Preserve the AWS serverless counter as a working cloud-resume milestone while using GCP for the current production RAG path.",
          modal: {
            summary:
              "A multi-cloud engineering portfolio that combines AWS serverless infrastructure with a GCP-native retrieval-augmented generation assistant. The platform demonstrates cloud-native frontend deployment, serverless visitor tracking, AI-assisted knowledge retrieval, and modern application architecture across AWS and Google Cloud.",
            goal: "Demonstrate a recruiter-friendly cloud engineering portfolio with documented AWS serverless fundamentals, a new-account AWS rebuild plan, and a deployed GCP RAG assistant grounded in project documentation.",
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
              "Working GCP RAG backend and modular React frontend. AWS S3, CloudFront, API Gateway, Lambda, DynamoDB, SNS, EventBridge, IAM, and CI/CD integration are migration/rebuild work in the new AWS account.",
            architecture: {
              diagram: {
                src: "/architecture/aws-gcp-rag-architecture.png",
                alt: "AWS frontend, AWS visitor counter, and GCP RAG backend architecture diagram",
              },
              diagramLabel: "AWS + GCP RAG architecture diagram",
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
                "The frontend is delivered as a static React application through AWS. Visitor metrics remain on the AWS serverless path, while assistant questions are decoupled through API calls to a GCP Cloud Run backend that retrieves Firestore chunks and asks Gemini to generate grounded responses.",
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
                  "The original Lambda and Bedrock RAG path was blocked by practical access and quota constraints during the capstone timeline.",
                solution:
                  "Pivot to a GCP-native RAG implementation using Cloud Run, Gemini, Firestore, and Cloud Storage.",
                outcome:
                  "Successfully deployed a working retrieval assistant while preserving the AWS serverless visitor counter milestone.",
              },
              {
                title: "Integrating AWS frontend with GCP backend",
                problem:
                  "The portfolio needed to keep AWS delivery and visitor tracking while using a separate GCP backend for AI retrieval.",
                solution:
                  "Decouple systems through API communication so the React frontend can call the Cloud Run RAG endpoint independently.",
                outcome:
                  "Maintained independent cloud layers with clear ownership between AWS frontend/serverless services and GCP AI services.",
              },
              {
                title: "Frontend and backend modularization",
                problem:
                  "The early implementation risked concentrating UI, API, state, route, and service logic in large files.",
                solution:
                  "Refactor the frontend into reusable components, hooks, and API modules, and refactor the backend into config, schemas, routes, and service layers.",
                outcome:
                  "Cleaner architecture and maintainability without changing the working `/ask-rag` behavior.",
              },
            ],
            documentation: [
              {
                type: "Diagram",
                title: "System Module Diagram",
                description:
                  "Module-level view of frontend components, hooks, API clients, backend routes, and service boundaries.",
              },
              {
                type: "Diagram",
                title: "Architecture Diagram",
                description:
                  "Multi-cloud request flow across AWS static delivery, AWS visitor tracking, and GCP RAG services.",
              },
              {
                type: "Log",
                title: "Development Log",
                description:
                  "Chronological record of the AWS RAG plan, GCP pivot, frontend integration, and backend refactor.",
              },
              {
                type: "Record",
                title: "Test Records",
                description:
                  "V1 verification notes for frontend lint/build, AWS visitor counter, GCP health, RAG endpoint, and CORS behavior.",
              },
              {
                type: "Notes",
                title: "Deployment Notes",
                description:
                  "Frontend hosting, Cloud Run runtime, local port conventions, and production environment reminders.",
              },
              {
                type: "Plan",
                title: "Future Roadmap",
                description:
                  "Streaming frontend integration, persistent chat history, vector indexing, CI RAG evaluation, and monitoring.",
              },
            ],
          },
        },
        {
          id: "event-system",
          projectId: "event-notification",
          type: "Event-Driven AWS",
          title: "Event-Driven Notification System",
          body: "Planned AWS event-driven notification system for portfolio activity and recruiter contact workflows.",
          problem:
            "Portfolio activity and recruiter contact events need decoupled notifications without long-running servers.",
          solution:
            "Use EventBridge, SNS, Lambda, DynamoDB, and API Gateway to publish milestones and process notification workflows.",
          services: [
            "AWS",
            "EventBridge",
            "SNS",
            "Lambda",
            "DynamoDB",
            "API Gateway",
          ],
          architecture:
            "Portfolio event producers publish milestone and contact events through API Gateway/EventBridge, Lambda workers process events, SNS delivers notifications, and DynamoDB stores event state.",
          notes:
            "Roadmap project only. Planned features include visitor milestones, project modal view milestones, recruiter contact notifications, and event-driven workflows.",
        },
        {
          id: "url-shortener",
          projectId: "url-shortener",
          type: "Distributed Backend",
          title: "URL Shortener",
          body: "Planned URL shortener focused on distributed backend architecture, API design, data modeling, and scalability patterns.",
          problem:
            "A URL shortener needs clean API boundaries, predictable data access patterns, and scalable redirect behavior.",
          solution:
            "Design a backend service with explicit create/redirect APIs, durable key mapping, collision handling, and operational metrics.",
          services: ["API Design", "Backend", "Data Modeling", "Scalability"],
          architecture:
            "Clients create short links through an API layer, storage maps slugs to target URLs, and redirect reads are optimized for low latency.",
          notes:
            "Roadmap project only. Implementation evidence is not present in this repository yet.",
        },
        {
          id: "qr-code-generator",
          projectId: "qr-code-generator",
          type: "Serverless Utility",
          title: "QR Code Generator",
          body: "Planned serverless QR code generator focused on Lambda processing, storage integration, and API design.",
          problem:
            "Users need a small utility that converts input URLs or text into generated QR code assets without managing servers.",
          solution:
            "Expose an API for QR generation, process requests with Lambda, and store generated assets for retrieval.",
          services: ["AWS", "Lambda", "Storage", "API Design"],
          architecture:
            "API requests trigger Lambda QR generation, generated files are written to storage, and callers receive a retrievable asset URL.",
          notes:
            "Roadmap project only. Implementation and IaC are still pending.",
        },
        {
          id: "real-time-chat",
          projectId: "realtime-chat",
          type: "Realtime Systems",
          title: "Real-Time Chat Application",
          body: "Planned WebSocket application focused on real-time messaging and stateful communication patterns.",
          problem:
            "Realtime user interactions need persistent connections, message fan-out, and clear session state handling.",
          solution:
            "Use a WebSocket architecture to manage connection lifecycle, message routing, and conversation state.",
          services: [
            "WebSocket",
            "Realtime Messaging",
            "Backend",
            "State Management",
          ],
          architecture:
            "Clients maintain WebSocket connections to a backend gateway, messages are routed to active participants, and state is stored for continuity.",
          notes:
            "Roadmap project only. No implementation evidence is present in this repository yet.",
        },
        {
          id: "video-streaming-platform",
          projectId: "video-streaming",
          type: "Media Delivery",
          title: "Video Streaming Platform",
          body: "Planned video streaming platform focused on CDN architecture, media delivery, scalable content distribution, and high availability.",
          problem:
            "Video delivery needs low-latency global distribution, resilient storage, and predictable content serving behavior.",
          solution:
            "Design a CDN-backed media platform with origin storage, cache behavior, and availability planning.",
          services: [
            "CDN",
            "Object Storage",
            "Media Delivery",
            "High Availability",
          ],
          architecture:
            "Users request video assets through a CDN, the CDN retrieves media from origin storage, and caching policies reduce origin load.",
          notes:
            "Roadmap project only. Future implementation should include upload, processing, delivery, and observability plans.",
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
      status: {
        submitting: "Sending...",
        success: "Message sent successfully. Thank you for reaching out.",
        error: "Unable to send the message. Please try again later.",
        validationError: "Please fix the highlighted fields before sending.",
      },
      validation: {
        nameRequired: "Name is required.",
        emailRequired: "Email is required.",
        emailInvalid: "Enter a valid email address.",
        subjectRequired: "Subject is required.",
        messageRequired: "Message is required.",
        messageTooLong: "Message must be 5000 characters or fewer.",
      },
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
      newChat: "Start New Chat",
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
      projects: "Portfolio",
      contact: "聯絡",
    },
    hero: {
      eyebrow: "雲端工程師專題",
      title: "雲端履歷 + GCP RAG 助理",
      description:
        "以無伺服器架構打造的作品集平台，呈現雲端工程實作，並結合以專案知識為基礎的 GCP RAG 助理。",
      projectsAction: "查看 Portfolio",
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
          body: "DynamoDB 規劃、Firestore metadata、Cloud Storage 文件與向量檢索。",
        },
        {
          title: "生成式 AI",
          body: "以 Gemini-based RAG 建立具知識檢索基礎的工作流程。",
        },
        {
          title: "交付",
          body: "CloudFront 託管、DNS 準備、CI/CD 與清楚的紀錄策略。",
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
      tabs: {
        overview: "總覽",
        architecture: "架構",
        challenges: "挑戰",
        documentation: "文件",
        ai: "AI Assistant",
      },
      items: [
        {
          id: "cloud-resume-rag",
          projectId: "aws-gcp-rag",
          type: "Capstone Project",
          title: "AWS Cloud Resume + GCP RAG",
          body: "結合 AWS 無伺服器架構與 Gemini 檢索生成系統的多雲 AI 作品集平台。",
          previewImage: {
            src: "/projects-images/Architecture-Overview.png",
            alt: "AWS Cloud Resume and GCP RAG architecture diagram",
          },
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
          id: "event-system",
          projectId: "event-notification",
          type: "Event-Driven AWS",
          title: "Event-Driven Notification System",
          body: "規劃中的 AWS event-driven notification system，用於 portfolio activity 與 recruiter contact workflows。",
          problem:
            "Portfolio activity 與 recruiter contact events 需要 decoupled notifications，不應維護長時間運行的伺服器。",
          solution:
            "使用 EventBridge、SNS、Lambda、DynamoDB、API Gateway 發布 milestone 並處理 notification workflows。",
          services: [
            "AWS",
            "EventBridge",
            "SNS",
            "Lambda",
            "DynamoDB",
            "API Gateway",
          ],
          architecture:
            "Portfolio event producers 透過 API Gateway/EventBridge 發布 milestone 與 contact events，Lambda workers 處理事件，SNS 發送通知，DynamoDB 保存 event state。",
          notes:
            "Roadmap project only。規劃功能包含 visitor milestones、project modal view milestones、recruiter contact notifications 與 event-driven workflows。",
        },
        {
          id: "url-shortener",
          projectId: "url-shortener",
          type: "Distributed Backend",
          title: "URL Shortener",
          body: "規劃中的 URL shortener，聚焦 distributed backend architecture、API design、data modeling 與 scalability patterns。",
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
          id: "qr-code-generator",
          projectId: "qr-code-generator",
          type: "Serverless Utility",
          title: "QR Code Generator",
          body: "規劃中的 serverless QR code generator，聚焦 Lambda processing、storage integration 與 API design。",
          problem:
            "使用者需要小型 utility 將 URL 或文字轉換成 QR code assets，不需要管理伺服器。",
          solution:
            "提供 QR generation API，由 Lambda 處理請求並將 generated assets 存入 storage。",
          services: ["AWS", "Lambda", "Storage", "API Design"],
          architecture:
            "API requests 觸發 Lambda QR generation，generated files 寫入 storage，caller 取得可讀取的 asset URL。",
          notes: "Roadmap project only。Implementation 與 IaC 仍待完成。",
        },
        {
          id: "real-time-chat",
          projectId: "realtime-chat",
          type: "Realtime Systems",
          title: "Real-Time Chat Application",
          body: "規劃中的 WebSocket application，聚焦 real-time messaging 與 stateful communication patterns。",
          problem:
            "Realtime user interactions 需要 persistent connections、message fan-out 與清楚的 session state handling。",
          solution:
            "使用 WebSocket architecture 管理 connection lifecycle、message routing 與 conversation state。",
          services: [
            "WebSocket",
            "Realtime Messaging",
            "Backend",
            "State Management",
          ],
          architecture:
            "Clients 維持 WebSocket connections 到 backend gateway，messages 路由給 active participants，並保存 state 以維持 continuity。",
          notes:
            "Roadmap project only。目前 repository 尚無 implementation evidence。",
        },
        {
          id: "video-streaming-platform",
          projectId: "video-streaming",
          type: "Media Delivery",
          title: "Video Streaming Platform",
          body: "規劃中的 video streaming platform，聚焦 CDN architecture、media delivery、scalable content distribution 與 high availability。",
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
