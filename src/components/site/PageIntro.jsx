export default function PageIntro({ eyebrow, title, description, children }) {
  return (
    <section className="page-intro">
      <div className="shell page-intro-inner">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}
