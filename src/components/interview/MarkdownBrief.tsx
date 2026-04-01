import type { ReactNode } from 'react';

interface MarkdownBriefProps {
  markdown: string;
  className?: string;
}

type BlockType = 'h1' | 'h2' | 'paragraph' | 'ul' | 'ol' | 'blank';

interface Block {
  type: BlockType;
  lines: string[];
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Match **bold**, *italic*, and plain text segments
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-text-primary-dark">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic text-text-secondary-dark">
          {match[3]}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', lines: [line.slice(2)] });
      i++;
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', lines: [line.slice(3)] });
      i++;
      continue;
    }

    // Unordered list: collect consecutive lines starting with * or -
    if (/^[*-] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[*-] /.test(lines[i])) {
        items.push(lines[i].replace(/^[*-] /, ''));
        i++;
        // Skip blank lines between list items
        while (i < lines.length && lines[i].trim() === '' && i + 1 < lines.length && /^[*-] /.test(lines[i + 1])) {
          i++;
        }
      }
      blocks.push({ type: 'ul', lines: items });
      continue;
    }

    // Ordered list: collect consecutive lines starting with number.
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
        // Skip blank lines between list items
        while (i < lines.length && lines[i].trim() === '' && i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1])) {
          i++;
        }
      }
      blocks.push({ type: 'ol', lines: items });
      continue;
    }

    // Paragraph: collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('# ') &&
      !lines[i].startsWith('## ') &&
      !/^[*-] /.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', lines: [paraLines.join(' ')] });
    }
  }

  return blocks;
}

export default function MarkdownBrief({ markdown, className = '' }: MarkdownBriefProps) {
  const blocks = parseBlocks(markdown);

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2
                key={idx}
                className="text-base font-semibold text-text-primary-dark mt-8 mb-2 pb-2 border-b border-border-dark first:mt-0"
              >
                {renderInline(block.lines[0])}
              </h2>
            );

          case 'h2':
            return (
              <h3
                key={idx}
                className="text-sm font-semibold text-accent mt-6 mb-2"
              >
                {renderInline(block.lines[0])}
              </h3>
            );

          case 'ul':
            return (
              <ul key={idx} className="space-y-3">
                {block.lines.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent/50"
                  >
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx} className="space-y-4 counter-reset-list">
                {block.lines.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed pl-7 relative"
                  >
                    <span className="absolute left-0 top-0 text-accent font-semibold text-sm">
                      {i + 1}.
                    </span>
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );

          case 'paragraph':
            return (
              <p key={idx} className="text-sm leading-relaxed text-text-primary-dark">
                {renderInline(block.lines[0])}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
