import { useCallback, useEffect, useState } from "react";
import ChatPanel from "../components/ChatPanel";
import { fetchVisitorCount } from "../api/visitors";
import Navbar from "../components/Navbar";
import PortfolioCaseStudies from "../components/PortfolioCaseStudies";
import PortfolioSection from "../components/PortfolioSection";
import ProjectModal from "../components/ProjectModal";
import { contentByLanguage } from "../content/portfolioContent";
import { useAssistantChat } from "../hooks/useAssistantChat";
import { useScrollTracker } from "../hooks/useScrollTracker";
import { useTheme } from "../hooks/useTheme";

const PROJECT_WORKSPACES = {
  project1: {
    shortLabel: "Project 1",
    fullName: "AWS Cloud Resume Challenge + GCP RAG",
    projectIds: ["cloud-resume-rag"],
  },
  project2: {
    shortLabel: "Project 2",
    fullName: "Recipe Sharing App",
    projectIds: ["recipe-sharing-app"],
  },
  project3: {
    shortLabel: "Project 3",
    fullName: "Serverless Event Announcement System",
    projectIds: ["event-system"],
  },
};

const DEFAULT_WORKSPACE_ID = "project1";

function getWorkspaceIdForProject(projectId) {
  const matchedWorkspace = Object.entries(PROJECT_WORKSPACES).find(
    ([, workspace]) => workspace.projectIds.includes(projectId),
  );

  return matchedWorkspace?.[0] || DEFAULT_WORKSPACE_ID;
}

function Home() {
  const { scrollPercent, activeSection, setActiveSection } = useScrollTracker();
  const { theme, toggleTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [language, setLanguage] = useState("zh-TW");
  const [viewCount, setViewCount] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(DEFAULT_WORKSPACE_ID);
  const {
    chatQuestion,
    setChatQuestion,
    chatAnswer,
    chatSources,
    chatMessages,
    isChatLoading,
    chatError,
    chatStatus,
    handleChatSubmit,
    handleNewChat,
  } = useAssistantChat(activeWorkspaceId);
  const content = contentByLanguage[language];
  const navItems = [
    { id: "about", label: content.nav.about },
    { id: "skills", label: content.nav.skills },
    { id: "portfolio", label: content.nav.projects },
    { id: "contact", label: content.nav.contact },
  ];
  const selectedProject = content.projects.items.find(
    (project) => project.id === selectedProjectId,
  );
  const activeWorkspace = PROJECT_WORKSPACES[activeWorkspaceId];
  const chatSuggestions = selectedProject
    ? content.chat.projectSuggestions
    : content.chat.suggestions;
  const launcherExpandedLines = selectedProject
    ? [content.chat.askProjectLineOne, content.chat.askProjectLineTwo]
    : [content.chat.askSiteLineOne, content.chat.askSiteLineTwo];

  const openProject = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveWorkspaceId(getWorkspaceIdForProject(projectId));
    setIsChatOpen(false);
    setIsChatExpanded(false);
  };

  const closeProject = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsChatExpanded(false);
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);

    if (isChatOpen) {
      setIsChatExpanded(false);
    }
  };

  const handleToggleChatExpanded = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const views = await fetchVisitorCount();
        setViewCount(views);
      } catch (error) {
        console.error("Failed to fetch visitor count:", error);
      }
    };

    fetchViews();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        closeProject();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeProject, selectedProjectId]);

  return (
    <div className="app-shell">
      <Navbar
        activeSection={activeSection}
        content={content}
        language={language}
        navItems={navItems}
        onLanguageChange={setLanguage}
        onSectionSelect={setActiveSection}
        onToggleTheme={toggleTheme}
        scrollPercent={scrollPercent}
        theme={theme}
        viewCount={viewCount}
      />

      <main className="portfolio">
        <section className="hero" aria-labelledby="portfolio-title">
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1 id="portfolio-title">{content.hero.title}</h1>
              <p className="hero-description">{content.hero.description}</p>

              <div className="hero-actions">
                <a className="primary-action" href="#portfolio">
                  {content.hero.projectsAction}
                </a>
              </div>
            </div>
          </div>
        </section>

        <PortfolioSection id="about" className="about">
          <div>
            <p className="section-label">{content.about.label}</p>
            <h2 className="about-lead">{content.about.title}</h2>
          </div>

          <div className="about-details">
            {content.about.details.map((detail) => (
              <p className="about-detail" key={detail}>
                {detail}
              </p>
            ))}
          </div>
        </PortfolioSection>

        <PortfolioSection id="skills">
          <div className="section-heading">
            <p className="section-label">{content.skills.label}</p>
            <h2>{content.skills.title}</h2>
          </div>

          <div className="skill-grid">
            {content.skills.items.map((skill) => (
              <article key={skill.title}>
                <h3>{skill.title}</h3>
                <p>{skill.body}</p>
              </article>
            ))}
          </div>
        </PortfolioSection>

        <PortfolioSection id="portfolio" className="projects">
          <div className="section-heading">
            <h2>{content.projects.label}</h2>
            <p>{content.projects.description}</p>
          </div>

          <PortfolioCaseStudies
            projects={content.projects.items}
            labels={content.projects}
            onOpenProject={openProject}
          />
        </PortfolioSection>

        <PortfolioSection id="contact" className="contact">
          <div className="contact-intro">
            <p className="section-label">{content.contact.label}</p>
            <h2>{content.contact.title}</h2>
            <div className="contact-opportunity">
              <p className="contact-role">{content.contact.role}</p>
              <p className="contact-summary">{content.contact.summary}</p>
              <p className="contact-invite">{content.contact.invite}</p>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="contact-fields-row">
              <label className="contact-field">
                <span>{content.contact.fields.name}</span>
                <input
                  type="text"
                  name="name"
                  placeholder={content.contact.placeholders.name}
                  autoComplete="name"
                />
              </label>

              <label className="contact-field">
                <span>{content.contact.fields.email}</span>
                <input
                  type="email"
                  name="email"
                  placeholder={content.contact.placeholders.email}
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="contact-field">
              <span>{content.contact.fields.subject}</span>
              <input
                type="text"
                name="subject"
                placeholder={content.contact.placeholders.subject}
              />
            </label>

            <label className="contact-field">
              <span>{content.contact.fields.message}</span>
              <textarea
                name="message"
                placeholder={content.contact.placeholders.message}
                rows="6"
              />
            </label>

            <button type="submit">{content.contact.send}</button>
          </form>
        </PortfolioSection>
      </main>

      {selectedProject && (
        <ProjectModal
          selectedProject={selectedProject}
          language={language}
          theme={theme}
          content={content}
          onClose={closeProject}
          setLanguage={setLanguage}
          onToggleTheme={toggleTheme}
        />
      )}
      <ChatPanel
        isChatOpen={isChatOpen}
        isChatExpanded={isChatExpanded}
        onClose={handleCloseChat}
        onToggle={handleToggleChat}
        onToggleExpanded={handleToggleChatExpanded}
        chatQuestion={chatQuestion}
        setChatQuestion={setChatQuestion}
        chatAnswer={chatAnswer}
        chatSources={chatSources}
        chatMessages={chatMessages}
        isChatLoading={isChatLoading}
        chatError={chatError}
        chatStatus={chatStatus}
        handleChatSubmit={handleChatSubmit}
        onNewChat={handleNewChat}
        labels={content.chat}
        chatSuggestions={chatSuggestions}
        launcherExpandedLines={launcherExpandedLines}
        projectWorkspaces={PROJECT_WORKSPACES}
        activeProjectId={activeWorkspaceId}
        activeProjectName={activeWorkspace.fullName}
        onSelectProject={setActiveWorkspaceId}
      />
    </div>
  );
}

export default Home;
