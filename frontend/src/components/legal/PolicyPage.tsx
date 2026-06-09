export const LEGAL_CONTACT = {
  brandName: 'Royce Lighting',
  companyName: '[Company Name]',
  gstNumber: '[GST Number]',
  email: '[Email Address]',
  phone: '[Phone Number]',
  registeredAddress: '[Registered Address]',
  supportTimings: '[Support Timings]',
};

export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'orderedList'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'subsection'; title: string; blocks: LegalBlock[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalPolicy = {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  summary: string[];
  sections: LegalSection[];
};

function renderBlock(block: LegalBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return <p key={index}>{block.text}</p>;
    case 'list':
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case 'note':
      return (
        <div className="legal-note" key={index}>
          {block.text}
        </div>
      );
    case 'table':
      return (
        <div className="legal-table-wrap" key={index}>
          <table className="legal-table">
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'subsection':
      return (
        <section className="legal-subsection" key={block.title}>
          <h3>{block.title}</h3>
          {block.blocks.map(renderBlock)}
        </section>
      );
    default:
      return null;
  }
}

export function PolicyPage({ policy }: { policy: LegalPolicy }) {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div>
          <p className="luxury-kicker">Legal Information</p>
          <h1>{policy.title}</h1>
          <p>{policy.description}</p>
          <dl className="legal-meta">
            <div>
              <dt>Effective Date</dt>
              <dd>{policy.effectiveDate}</dd>
            </div>
            <div>
              <dt>Last Updated</dt>
              <dd>{policy.lastUpdated}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="legal-shell">
        <aside className="legal-sidebar" aria-label="Policy navigation">
          <nav className="legal-toc">
            <h2>On This Page</h2>
            <ol>
              {policy.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-contact-card">
            <h2>Business Details</h2>
            <p>
              {LEGAL_CONTACT.brandName} is operated by {LEGAL_CONTACT.companyName}.
            </p>
            <address>
              GSTIN: {LEGAL_CONTACT.gstNumber}
              <br />
              Email: {LEGAL_CONTACT.email}
              <br />
              Phone: {LEGAL_CONTACT.phone}
              <br />
              Registered Office: {LEGAL_CONTACT.registeredAddress}
              <br />
              Support Hours: {LEGAL_CONTACT.supportTimings}
            </address>
          </div>
        </aside>

        <article className="legal-content">
          <section className="legal-summary" aria-labelledby="policy-summary">
            <h2 id="policy-summary">Policy Overview</h2>
            <ul>
              {policy.summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {policy.sections.map((section) => (
            <section className="legal-section" id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.blocks.map(renderBlock)}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
