export const projectDocsNavigationLabels = {
  en: {
    documents: {
      overview: "Overview",
      architecture: "Architecture",
      implementation: "Implementation",
    },
    sections: {
      "overview-summary": "Project Summary",
      "overview-features": "Features",
      "architecture-diagram": "Architecture Diagram",
      "architecture-system-module": "System Module",
      "architecture-workflow": "Workflow",
      "architecture-tech-stack": "Technology Stack",
      "implementation-frontend": "Frontend",
      "implementation-backend": "Backend",
      "implementation-gcp-rag": "GCP-RAG",
      "implementation-database": "Database",
      "implementation-api": "API",
      "implementation-network": "Network",
      "implementation-security": "Security",
      "implementation-deployment": "Deployment",
      "implementation-cicd": "CI/CD",
      "implementation-iac": "IaC",
      "implementation-monitoring": "Monitoring",
      "implementation-troubleshooting": "Troubleshooting",
    },
  },
  "zh-TW": {
    documents: {
      overview: "專案概述",
      architecture: "架構設計",
      implementation: "實作細節",
    },
    sections: {
      "overview-summary": "專案介紹",
      "overview-features": "功能特色",
      "architecture-diagram": "架構圖",
      "architecture-system-module": "系統模組",
      "architecture-workflow": "工作流程",
      "architecture-tech-stack": "技術棧",
      "implementation-frontend": "前端",
      "implementation-backend": "後端",
      "implementation-gcp-rag": "GCP-RAG",
      "implementation-database": "資料庫",
      "implementation-api": "API",
      "implementation-network": "網路架構",
      "implementation-security": "安全性",
      "implementation-deployment": "部署流程",
      "implementation-cicd": "CI/CD",
      "implementation-iac": "IaC",
      "implementation-monitoring": "監控",
      "implementation-troubleshooting": "Troubleshooting",
    },
  },
};

export function getProjectDocsLabels(language) {
  return (
    projectDocsNavigationLabels[language] ?? projectDocsNavigationLabels.en
  );
}
