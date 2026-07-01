import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "../components/ChatPanel";
import { submitContactMessage } from "../api/contact";
import { incrementProjectView } from "../api/projects";
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
    fullName: "URL Shortener + QR Code Generator",
    projectIds: ["url-shortener", "url-shortener and-qr-generator"],
  },
  project3: {
    shortLabel: "Project 3",
    fullName: "Video Streaming Platform",
    projectIds: ["video-streaming-platform"],
  },
};

const DEFAULT_WORKSPACE_ID = "project1";
const CONTACT_MESSAGE_MAX_LENGTH = 5000;
const initialContactForm = {
  email: "",
  message: "",
  name: "",
  subject: "",
};

function getWorkspaceIdForProject(projectId) {
  const matchedWorkspace = Object.entries(PROJECT_WORKSPACES).find(
    ([, workspace]) => workspace.projectIds.includes(projectId),
  );

  return matchedWorkspace?.[0] || DEFAULT_WORKSPACE_ID;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Home() {
  const { scrollPercent, activeSection, setActiveSection } = useScrollTracker();
  const { theme, toggleTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [language, setLanguage] = useState("zh-TW");
  const [viewCount, setViewCount] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [contactForm, setContactForm] = useState(initialContactForm);
  const [contactErrors, setContactErrors] = useState({});
  const [contactStatus, setContactStatus] = useState("idle");
  const [contactStatusMessage, setContactStatusMessage] = useState("");
  const [activeWorkspaceId, setActiveWorkspaceId] =
    useState(DEFAULT_WORKSPACE_ID);
  const countedProjectViewsRef = useRef(new Set());
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

  const validateContactForm = () => {
    const nextErrors = {};
    const trimmedForm = {
      email: contactForm.email.trim(),
      message: contactForm.message.trim(),
      name: contactForm.name.trim(),
      subject: contactForm.subject.trim(),
    };

    if (!trimmedForm.name) {
      nextErrors.name = content.contact.validation.nameRequired;
    }

    if (!trimmedForm.email) {
      nextErrors.email = content.contact.validation.emailRequired;
    } else if (!isValidEmail(trimmedForm.email)) {
      nextErrors.email = content.contact.validation.emailInvalid;
    }

    if (!trimmedForm.subject) {
      nextErrors.subject = content.contact.validation.subjectRequired;
    }

    if (!trimmedForm.message) {
      nextErrors.message = content.contact.validation.messageRequired;
    } else if (trimmedForm.message.length > CONTACT_MESSAGE_MAX_LENGTH) {
      nextErrors.message = content.contact.validation.messageTooLong;
    }

    return { errors: nextErrors, values: trimmedForm };
  };

  const handleContactChange = (event) => {
    const { name, value } = event.target;

    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setContactErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const remainingErrors = { ...currentErrors };
      delete remainingErrors[name];

      return remainingErrors;
    });

    if (contactStatus !== "idle") {
      setContactStatus("idle");
      setContactStatusMessage("");
    }
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    const { errors, values } = validateContactForm();

    setContactErrors(errors);

    if (Object.keys(errors).length > 0) {
      setContactStatus("error");
      setContactStatusMessage(content.contact.status.validationError);
      return;
    }

    setContactStatus("submitting");
    setContactStatusMessage("");

    try {
      await submitContactMessage(values);
      setContactForm(initialContactForm);
      setContactErrors({});
      setContactStatus("success");
      setContactStatusMessage(content.contact.status.success);
    } catch {
      setContactStatus("error");
      setContactStatusMessage(content.contact.status.error);
    }
  };

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
    if (!selectedProject) {
      return;
    }

    const projectId = selectedProject.projectId || selectedProject.id;

    const updateSelectedProjectViews = async () => {
      if (countedProjectViewsRef.current.has(projectId)) {
        return;
      }

      countedProjectViewsRef.current.add(projectId);
      await incrementProjectView(projectId);
    };

    updateSelectedProjectViews();
  }, [selectedProject]);

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
              <p className="hero-top">{content.hero.Top}</p>
              <h1
                id="portfolio-title"
                className={
                  content.hero.titleTwoLine
                    ? "hero-title--compact"
                    : "hero-title--single-line"
                }
              >
                {content.hero.titleTwoLine ? (
                  <>
                    <span className="hero-title-line1">
                      <span className="hero-title-aws">{content.hero.titleAws}</span>
                      <span className="hero-title-separator"> {content.hero.titleFt}</span>
                    </span>
                    <span className="hero-title-line2">
                      <span className="hero-title-gcp">{content.hero.titleGcp}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hero-title-aws">{content.hero.titleAws}</span>
                    <span className="hero-title-separator"> {content.hero.titleFt} </span>
                    <span className="hero-title-gcp">{content.hero.titleGcp}</span>
                  </>
                )}
              </h1>
              <p className="hero-bottom">{content.hero.Bottom}</p>
              <p className="hero-description">{content.hero.description}</p>

              <div className="hero-actions">
                <a className="primary-action" href="#portfolio">
                  {content.hero.projectsAction}
                </a>
                <button
                  className="hero-ai-action"
                  type="button"
                  onClick={handleToggleChat}
                >
                  {content.hero.aiAction}
                </button>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <img
                className="hero-illustration-image"
                src="/heroHomejs-images/Homejs3.png"
                alt=""
                aria-hidden="true"
              />
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
            noValidate
            onSubmit={handleContactSubmit}
          >
            <div className="contact-fields-row">
              <label className="contact-field">
                <span>{content.contact.fields.name}</span>
                <input
                  type="text"
                  name="name"
                  placeholder={content.contact.placeholders.name}
                  autoComplete="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  aria-invalid={Boolean(contactErrors.name)}
                  aria-describedby={
                    contactErrors.name ? "contact-error-name" : undefined
                  }
                />
                {contactErrors.name ? (
                  <small className="contact-error" id="contact-error-name">
                    {contactErrors.name}
                  </small>
                ) : null}
              </label>

              <label className="contact-field">
                <span>{content.contact.fields.email}</span>
                <input
                  type="email"
                  name="email"
                  placeholder={content.contact.placeholders.email}
                  autoComplete="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  aria-invalid={Boolean(contactErrors.email)}
                  aria-describedby={
                    contactErrors.email ? "contact-error-email" : undefined
                  }
                />
                {contactErrors.email ? (
                  <small className="contact-error" id="contact-error-email">
                    {contactErrors.email}
                  </small>
                ) : null}
              </label>
            </div>

            <label className="contact-field">
              <span>{content.contact.fields.subject}</span>
              <input
                type="text"
                name="subject"
                placeholder={content.contact.placeholders.subject}
                value={contactForm.subject}
                onChange={handleContactChange}
                aria-invalid={Boolean(contactErrors.subject)}
                aria-describedby={
                  contactErrors.subject ? "contact-error-subject" : undefined
                }
              />
              {contactErrors.subject ? (
                <small className="contact-error" id="contact-error-subject">
                  {contactErrors.subject}
                </small>
              ) : null}
            </label>

            <label className="contact-field">
              <span>{content.contact.fields.message}</span>
              <textarea
                name="message"
                placeholder={content.contact.placeholders.message}
                rows="6"
                maxLength={CONTACT_MESSAGE_MAX_LENGTH}
                value={contactForm.message}
                onChange={handleContactChange}
                aria-invalid={Boolean(contactErrors.message)}
                aria-describedby={
                  contactErrors.message ? "contact-error-message" : undefined
                }
              />
              <span className="contact-character-count">
                {contactForm.message.length}/{CONTACT_MESSAGE_MAX_LENGTH}
              </span>
              {contactErrors.message ? (
                <small className="contact-error" id="contact-error-message">
                  {contactErrors.message}
                </small>
              ) : null}
            </label>

            {contactStatusMessage ? (
              <p
                className={`contact-status contact-status-${contactStatus}`}
                role={contactStatus === "error" ? "alert" : "status"}
              >
                {contactStatusMessage}
              </p>
            ) : null}

            <button type="submit" disabled={contactStatus === "submitting"}>
              {contactStatus === "submitting"
                ? content.contact.status.submitting
                : content.contact.send}
            </button>
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
