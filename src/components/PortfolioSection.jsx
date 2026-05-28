export default function PortfolioSection({ id, className = "", children }) {
  const sectionClassName = className ? `section ${className}` : "section";

  return (
    <section id={id} className={sectionClassName}>
      {children}
    </section>
  );
}
