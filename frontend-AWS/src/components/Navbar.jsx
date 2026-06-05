export default function Navbar({
  activeSection,
  content,
  language,
  navItems,
  onLanguageChange,
  onToggleTheme,
  scrollPercent,
  theme,
  viewCount,
}) {
  return (
    <header className="sticky-header">
      <nav className="site-nav" aria-label="Portfolio sections">
        <div className="nav-identity">
          <a className="brand" href="#portfolio-title">
            {content.brand}
          </a>
          <span className="view-counter">
            {content.controls.views}: {viewCount}
          </span>
        </div>

        <div className="nav-actions">
          <div className="nav-links">
            {navItems.map((item) => (
              <a
                className={activeSection === item.id ? "is-active" : ""}
                href={`#${item.id}`}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-tools">
            <div
              className="language-switch"
              role="group"
              aria-label={content.controls.language}
            >
              <button
                className={language === "en" ? "is-active" : ""}
                type="button"
                onClick={() => onLanguageChange("en")}
                aria-pressed={language === "en"}
              >
                EN
              </button>
              <button
                className={language === "zh-TW" ? "is-active" : ""}
                type="button"
                onClick={() => onLanguageChange("zh-TW")}
                aria-pressed={language === "zh-TW"}
              >
                繁中
              </button>
            </div>

            <button
              className="theme-toggle"
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === "light"
                  ? content.controls.switchToDark
                  : content.controls.switchToLight
              }
            >
              <span className="theme-icon" aria-hidden="true">
                {theme === "light" ? "☾" : "☀"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className="scroll-progress"
        role="progressbar"
        aria-label={content.controls.progress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={scrollPercent}
      >
        <span className="scroll-progress-track">
          <span
            className="scroll-progress-fill"
            style={{ transform: `scaleX(${scrollPercent / 100})` }}
          />
        </span>
      </div>
    </header>
  );
}
