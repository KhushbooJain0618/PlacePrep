'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
}

/**
 * Regex-based markdown formatter for PlacePrep AI Chatbot.
 * Parses code blocks, markdown tables, headers, blockquotes, bold/italic, lists, and inline code without heavy external dependencies.
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  // 1. Split text into code blocks and non-code blocks using regex
  // Regex matches ```[language]\n[code]```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderTextAndTables(textBefore, `txt-${lastIndex}`));
    }

    const language = match[1] || 'code';
    const code = match[2]?.trimEnd() || '';
    parts.push(
      <CodeBlock key={`code-${match.index}`} language={language} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(renderTextAndTables(remainingText, `txt-${lastIndex}`));
  }

  return <div className="space-y-3 text-sm leading-relaxed text-neutral-200">{parts}</div>;
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#09090D] overflow-hidden my-3 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.04] border-b border-white/[0.08] text-xs">
        <span className="font-mono text-[11px] text-purple-300 uppercase tracking-wider font-semibold">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-neutral-200 bg-transparent">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Splits standard markdown text into tables and text paragraphs using regex.
 */
function renderTextAndTables(text: string, keyPrefix: string): React.ReactNode {
  // Regex to detect Markdown tables:
  // Requires at least a header row, delimiter row (|---|---|), and 1+ data rows
  const tableRegex = /((?:\|[^\n]+\|\r?\n)+\|[\s:\-|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      nodes.push(renderParagraphsAndLists(textBefore, `${keyPrefix}-before-${lastIndex}`));
    }

    nodes.push(renderTable(match[0], `${keyPrefix}-tbl-${match.index}`));
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.substring(lastIndex);
  if (remaining) {
    nodes.push(renderParagraphsAndLists(remaining, `${keyPrefix}-rem-${lastIndex}`));
  }

  return <React.Fragment key={keyPrefix}>{nodes}</React.Fragment>;
}

/**
 * Renders markdown tables into styled responsive HTML tables using regex parsing.
 */
function renderTable(tableString: string, key: string): React.ReactNode {
  const lines = tableString
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim().startsWith('|'));

  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    return line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());
  };

  const headerCells = parseRow(lines[0]);
  // line[1] is the separator line (e.g. |:---|:---|)
  const dataRows = lines.slice(2).map(parseRow);

  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#0B0B10]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            {headerCells.map((h, i) => (
              <th key={i} className="py-2.5 px-3.5 font-semibold text-white">
                {parseInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="py-2 px-3.5 text-neutral-300 align-top">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders headings, lists, blockquotes, and normal paragraphs line-by-line using regex.
 */
function renderParagraphsAndLists(block: string, key: string): React.ReactNode {
  const lines = block.split(/\r?\n/);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    // Heading regex: # H1, ## H2, ### H3, #### H4
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      if (level === 1) {
        elements.push(
          <h2 key={`${key}-h1-${i}`} className="text-base font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">
            {parseInline(text)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={`${key}-h2-${i}`} className="text-sm font-bold text-white mt-3.5 mb-1.5">
            {parseInline(text)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={`${key}-h3-${i}`} className="text-xs font-semibold text-purple-300 mt-2.5 mb-1">
            {parseInline(text)}
          </h4>
        );
      }
      continue;
    }

    // Blockquote regex: > text
    const quoteMatch = line.match(/^>\s*(.+)$/);
    if (quoteMatch) {
      elements.push(
        <div key={`${key}-quote-${i}`} className="pl-3 py-1 my-2 border-l-2 border-purple-400 bg-purple-500/5 text-xs text-neutral-300 italic rounded-r">
          {parseInline(quoteMatch[1])}
        </div>
      );
      continue;
    }

    // Unordered List item regex: - or *
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={`${key}-li-${i}`} className="flex items-start gap-2 text-xs text-neutral-300 pl-2 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
          <div className="flex-1">{parseInline(bulletMatch[1])}</div>
        </div>
      );
      continue;
    }

    // Ordered List item regex: 1. or 2.
    const numListMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numListMatch) {
      elements.push(
        <div key={`${key}-numli-${i}`} className="flex items-start gap-2 text-xs text-neutral-300 pl-2 my-1">
          <span className="font-mono text-purple-400 font-semibold shrink-0 text-[11px] mt-0.5">
            {numListMatch[1]}.
          </span>
          <div className="flex-1">{parseInline(numListMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`${key}-p-${i}`} className="text-xs text-neutral-300 leading-relaxed my-1">
        {parseInline(line)}
      </p>
    );
  }

  return <div key={key}>{elements}</div>;
}

/**
 * Parses inline formatting: bold (**text**), italics (*text*), and inline code (`code`) using regex.
 */
function parseInline(text: string): React.ReactNode {
  // Regex matching inline formatting tokens:
  // 1: `code`
  // 2: **bold**
  // 3: *italic*
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

  const parts = text.split(inlineRegex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300 text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="text-neutral-300 italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
