import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeContent } from '../types';
import { createElement } from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: '#666',
  },
  summary: {
    marginBottom: 12,
    fontSize: 10,
    color: '#333',
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 3,
    marginTop: 14,
    marginBottom: 8,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
  // Modern template
  modernName: {
    fontSize: 24,
    fontFamily: 'Helvetica',
    fontWeight: 300,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  modernTitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  modernSectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#3B82F6',
    marginTop: 14,
    marginBottom: 8,
  },
});

function ResumeDocument({ content, template }: { content: ResumeContent; template: string }) {
  const isModern = template === 'modern';

  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: 'LETTER', style: styles.page },
      // Header
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: isModern ? styles.modernName : styles.name }, content.header.name),
        createElement(Text, { style: isModern ? styles.modernTitle : styles.title }, content.header.title),
        createElement(
          Text,
          { style: styles.contact },
          [content.header.email, content.header.phone, content.header.location, content.header.linkedin]
            .filter(Boolean)
            .join('  |  ')
        )
      ),
      // Summary
      content.summary
        ? createElement(View, null, createElement(Text, { style: styles.summary }, content.summary))
        : null,
      // Sections
      ...content.sections.map((section) =>
        createElement(
          View,
          { key: section.id },
          createElement(
            Text,
            { style: isModern ? styles.modernSectionTitle : styles.sectionTitle },
            section.title
          ),
          ...section.items.map((item) =>
            createElement(
              View,
              { key: item.id, style: styles.bullet },
              createElement(Text, { style: styles.bulletDot }, '\u2022'),
              createElement(Text, { style: styles.bulletText }, item.text)
            )
          )
        )
      )
    )
  );
}

export async function exportResumePDF(
  content: ResumeContent,
  template: 'classic' | 'modern' | 'minimal' = 'classic'
): Promise<void> {
  const doc = createElement(ResumeDocument, { content, template });
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${content.header.name.replace(/\s+/g, '_')}_Resume.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
