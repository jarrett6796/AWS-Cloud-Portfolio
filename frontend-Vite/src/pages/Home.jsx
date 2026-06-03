import { useEffect, useState } from "react";
import ChatPanel from "../components/ChatPanel";
import { fetchVisitorCount } from "../api/visitors";
import Navbar from "../components/Navbar";
import PortfolioSection from "../components/PortfolioSection";
import ProjectModal from "../components/ProjectModal";
import { contentByLanguage } from "../content/portfolioContent";
import { useAssistantChat } from "../hooks/useAssistantChat";
import { useScrollTracker } from "../hooks/useScrollTracker";
import { useTheme } from "../hooks/useTheme";

function Home() {
  const { scrollPercent, activeSection } = useScrollTracker();
  const { theme, toggleTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [language, setLanguage] = useState("en");
  const [viewCount, setViewCount] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeProjectTab, setActiveProjectTab] = useState("overview");
  const [activeArchitectureStep, setActiveArchitectureStep] = useState(null);
  const [isProjectAiOpen, setIsProjectAiOpen] = useState(false);
  const [isProjectAiExpanded, setIsProjectAiExpanded] = useState(false);
  const {
    chatQuestion,
    setChatQuestion,
    chatAnswer,
    chatSources,
    isChatLoading,
    chatError,
    handleChatSubmit,
  } = useAssistantChat();
  const content = contentByLanguage[language];
  const navItems = [
    { id: "about", label: content.nav.about },
    { id: "skills", label: content.nav.skills },
    { id: "projects", label: content.nav.projects },
    { id: "contact", label: content.nav.contact },
  ];
  const projectTabs = [
    { id: "overview", label: content.projects.tabs.overview },
    { id: "architecture", label: content.projects.tabs.architecture },
    { id: "stack", label: content.projects.tabs.stack },
    { id: "lessons", label: content.projects.tabs.lessons },
  ];
  const visibleProjects = showAllProjects
    ? content.projects.items
    : content.projects.items.slice(0, 3);
  const selectedProject = content.projects.items.find(
    (project) => project.id === selectedProjectId,
  );
  const chatContext = selectedProject
    ? `${content.chat.currentContext}: ${selectedProject.title}`
    : content.chat.context;
  const chatSuggestions = selectedProject
    ? content.chat.projectSuggestions
    : content.chat.suggestions;
  const launcherExpandedLines = selectedProject
    ? [content.chat.askProjectLineOne, content.chat.askProjectLineTwo]
    : [content.chat.askSiteLineOne, content.chat.askSiteLineTwo];

  const openProject = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveProjectTab("overview");
    setActiveArchitectureStep(null);
    setIsProjectAiOpen(false);
    setIsProjectAiExpanded(false);
    setIsChatOpen(false);
    setIsChatExpanded(false);
  };

  const closeProject = () => {
    setSelectedProjectId(null);
    setActiveProjectTab("overview");
    setActiveArchitectureStep(null);
    setIsProjectAiOpen(false);
    setIsProjectAiExpanded(false);
  };

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
  }, [selectedProjectId]);

  return (
    <div className="app-shell">
      <Navbar
        activeSection={activeSection}
        content={content}
        language={language}
        navItems={navItems}
        onLanguageChange={setLanguage}
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
                <a className="primary-action" href="#projects">
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

        <PortfolioSection id="projects" className="projects">
          <div className="section-heading">
            <h2>{content.projects.label}</h2>
          </div>

          <div className="project-column">
            <div className="project-grid">
              {visibleProjects.map((project) => (
                <article className="project" key={project.id}>
                  <div className="project-head">
                    <div>
                      <h3>{project.title}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => openProject(project.id)}
                      aria-haspopup="dialog"
                    >
                      {content.projects.details}
                    </button>
                  </div>

                  <p>{project.body}</p>

                  <ul className="project-services">
                    {project.services.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {!showAllProjects && (
              <button
                className="more-projects"
                type="button"
                onClick={() => setShowAllProjects(true)}
              >
                {content.projects.more}
              </button>
            )}
          </div>
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

      {!selectedProject && (
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
          isChatLoading={isChatLoading}
          chatError={chatError}
          handleChatSubmit={handleChatSubmit}
          labels={content.chat}
          chatContext={chatContext}
          chatSuggestions={chatSuggestions}
          launcherExpandedLines={launcherExpandedLines}
        />
      )}
      {selectedProject && (
        <ProjectModal
          selectedProject={selectedProject}
          isProjectAiOpen={isProjectAiOpen}
          isProjectAiExpanded={isProjectAiExpanded}
          language={language}
          theme={theme}
          projectTabs={projectTabs}
          activeProjectTab={activeProjectTab}
          activeArchitectureStep={activeArchitectureStep}
          content={content}
          onClose={closeProject}
          setLanguage={setLanguage}
          onToggleTheme={toggleTheme}
          setActiveProjectTab={setActiveProjectTab}
          setActiveArchitectureStep={setActiveArchitectureStep}
          setIsProjectAiOpen={setIsProjectAiOpen}
          setIsProjectAiExpanded={setIsProjectAiExpanded}
        />
      )}
    </div>
  );
}

export default Home;
