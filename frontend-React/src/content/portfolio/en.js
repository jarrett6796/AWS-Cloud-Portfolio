/**
 * English portfolio content.
 *
 * Contains all English UI copy and project card metadata used by the
 * portfolio homepage, project modal, contact section, and AI assistant labels.
 *
 * This file is intentionally content-only. Rendering logic belongs in React
 * components, and markdown document loading belongs in projectDocs/.
 */

export const en = {
  brand: "Jarrett / Cloud Resume",
  nav: {
    about: "About",
    skills: "Skills",
    projects: "Portfolio",
    contact: "Contact",
  },
  hero: {
    Top: "Hi, I'm Jarrett",
    title: "AWS Cloud Resume ft GCP RAG AI Assistant",
    Bottom: "Tibame AWS Cloud Engineer Capstone Project",
    description:
      "This portfolio showcases my cloud engineering journey through AWS and GCP projects. Feel free to explore more and interact with the AI assistant to learn more about each project.",
    projectsAction: "View Portfolio",
    aiAction: "Ask AI Assistant",
    monitor: {
      heading: "Featured Projects",
      archLabel: "Architecture Overview",
    },
    aiCard: {
      label: "AI Assistant",
      onlineLabel: "Online",
      question: "What's the overall architecture of this project?",
      answer:
        "Multi-cloud: AWS Serverless for delivery & metrics + GCP RAG for AI-grounded responses.",
    },
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
      "Hi, I'm Jarrett,\n\ncurrently transitioning into cloud\ncomputing as a Cloud Engineer.",
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
    continueReading: "Scroll down to continue reading",
    tabs: {
      overview: "Overview",
      architecture: "Architecture",
      challenges: "Challenges",
      documentation: "Documentation",
      ai: "AI Assistant",
    },
    projectJourney: {
      label: "Project Journey",
      comingSoon: "Coming Soon",
      steps: [
        {
          id: "background-story",
          title: "Background Story",
          subsections: [
            {
              id: "from-job-seeker",
              title: "From Job Seeker",
              image: "/projectJourney-images/1.1_FromJobSeeker.png",
            },
            {
              id: "from-recruiter",
              title: "From Recruiter",
              image: "/projectJourney-images/1.2_FromRecruiter.png",
            },
          ],
        },
        {
          id: "problem-statement",
          title: "Problem Statement",
          subsections: [
            {
              id: "purpose-of-resume-cv",
              title: "Purpose of Resume / CV",
              image: "/projectJourney-images/2.1_problemStatement_CV.png",
            },
            {
              id: "job-seeker-perspective",
              title: "Job Seeker Perspective",
              image:
                "/projectJourney-images/2.2_proBlemStatement_JobSeeker.png",
            },
            {
              id: "recruiter-perspective",
              title: "Recruiter Perspective",
              image:
                "/projectJourney-images/2.3_problemStatementRecruiter.png",
            },
            {
              id: "gap-between-both",
              title: "Gap Between Both",
              image: "/projectJourney-images/2.4_problemStamen_GAP.png",
            },
          ],
        },
        {
          id: "solution",
          title: "Solution",
          image: "/projectJourney-images/3_Solution.png",
        },
        { id: "project-inspiration", title: "Project Inspiration" },
        {
          id: "system-architecture",
          title: "System Architecture",
          subsections: [
            { id: "frontend-ui-ux", title: "Frontend UI/UX" },
            { id: "aws-architecture", title: "AWS Architecture" },
            { id: "gcp-architecture", title: "GCP Architecture" },
          ],
        },
        { id: "development-journey", title: "Development Journey" },
        { id: "challenges-iterations", title: "Challenges & Iterations" },
        { id: "project-outcome", title: "Project Outcome" },
      ],
    },
    resources: {
      label: "Resources",
      github: "GitHub",
      slides: "Slide.pdf",
      technicalDocs: "Technical Documentation",
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
        body: "Multi-cloud AI portfolio platform combining AWS serverless architecture with a Gemini-powered retrieval system.",
        previewImage: {
          src: "/project-images/pc-crcrag-2.png",
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
              src: "/projectCard-images/pc-crcrag-2.png",
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
        id: "url-shortener",
        projectId: "url-shortener",
        type: "Distributed Backend",
        title: "URL Shortener and QR Code Generator",
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
};
