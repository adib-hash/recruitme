import type { ResumeContent } from '../../types';

interface ResumePreviewProps {
  content: ResumeContent;
  template?: 'classic' | 'modern' | 'minimal';
}

export default function ResumePreview({ content, template = 'classic' }: ResumePreviewProps) {
  if (!content || !content.header) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary-dark text-sm">
        No resume content to preview.
      </div>
    );
  }

  const templates = {
    classic: {
      container: 'font-serif',
      name: 'text-2xl font-bold text-center',
      title: 'text-base text-center text-text-secondary-dark mb-1',
      contact: 'text-sm text-center text-text-secondary-dark mb-4',
      sectionTitle: 'text-sm font-bold uppercase tracking-wider border-b border-border-dark pb-1 mb-3 mt-5',
      bullet: 'text-sm leading-relaxed',
    },
    modern: {
      container: 'font-sans',
      name: 'text-3xl font-light tracking-tight',
      title: 'text-lg text-accent mb-1',
      contact: 'text-sm text-text-secondary-dark mb-6',
      sectionTitle: 'text-xs font-semibold uppercase tracking-widest text-accent mb-3 mt-6',
      bullet: 'text-sm leading-relaxed',
    },
    minimal: {
      container: 'font-sans',
      name: 'text-xl font-semibold',
      title: 'text-base text-text-secondary-dark mb-1',
      contact: 'text-sm text-text-secondary-dark mb-4',
      sectionTitle: 'text-sm font-medium text-text-primary-dark mb-2 mt-5',
      bullet: 'text-sm leading-relaxed',
    },
  };

  const t = templates[template];

  return (
    <div className={`${t.container} bg-white text-gray-900 p-8 rounded-lg shadow-sm max-w-[8.5in] mx-auto`}>
      <div className={t.name}>{content.header.name}</div>
      <div className={t.title}>{content.header.title}</div>
      <div className={t.contact}>
        {[content.header.email, content.header.phone, content.header.location, content.header.linkedin]
          .filter(Boolean)
          .join('  |  ')}
      </div>

      {content.summary && (
        <>
          <div className={t.sectionTitle} style={{ color: '#111' }}>Summary</div>
          <p className="text-sm leading-relaxed text-gray-700">{content.summary}</p>
        </>
      )}

      {content.sections.map((section) => (
        <div key={section.id}>
          <div className={t.sectionTitle} style={{ color: '#111', borderColor: '#ddd' }}>{section.title}</div>
          <ul className="list-disc pl-5 space-y-1.5">
            {section.items.map((item) => (
              <li key={item.id} className={`${t.bullet} text-gray-800`}>
                {item.text}
                {item.subItems && item.subItems.length > 0 && (
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    {item.subItems.map((sub, i) => (
                      <li key={i} className="text-sm text-gray-600">{sub}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
