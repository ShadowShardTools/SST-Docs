export const pdfStyles = `
/* PDF Document Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --page-width: 210mm;
  --page-height: 297mm;
  --page-margin: 20mm;
  --font-body: 'Georgia', 'Times New Roman', serif;
  --font-heading: 'Arial', 'Helvetica', sans-serif;
  --font-mono: 'Courier New', 'Consolas', monospace;
  --color-text: #1a1a1a;
  --color-heading: #000000;
  --color-border: #cccccc;
  --color-bg: #ffffff;
  --color-code-bg: #f5f5f5;
  --color-info: #3498db;
  --color-warning: #f39c12;
  --color-error: #e74c3c;
  --color-success: #27ae60;
  --color-neutral: #95a5a6;
}

body {
  font-family: var(--font-body);
  font-size: 11pt;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

.pdf-document {
  max-width: var(--page-width);
  margin: 0 auto;
  padding: var(--page-margin);
  background: white;
  min-height: var(--page-height);
}

/* Header */
.pdf-header {
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 10mm;
  margin-bottom: 10mm;
}

.pdf-header h1 {
  font-family: var(--font-heading);
  font-size: 24pt;
  color: var(--color-heading);
  margin-bottom: 5mm;
}

.pdf-header .meta {
  font-size: 10pt;
  color: #666;
}

/* Content */
.pdf-content {
  margin-bottom: 10mm;
}

/* Titles */
h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--color-heading);
  margin-top: 8mm;
  margin-bottom: 4mm;
  page-break-after: avoid;
}

h1 {
  font-size: 20pt;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2mm;
}

h2 {
  font-size: 16pt;
}

h3 {
  font-size: 14pt;
}

.title-underline {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2mm;
}

/* Text */
p {
  margin-bottom: 4mm;
  text-align: justify;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Lists */
ul, ol {
  margin-bottom: 4mm;
  padding-left: 8mm;
}

li {
  margin-bottom: 2mm;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 4mm;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid var(--color-border);
  padding: 3mm;
  text-align: left;
}

th {
  background-color: #f0f0f0;
  font-weight: bold;
  font-family: var(--font-heading);
}

/* Code Blocks */
pre {
  background-color: var(--color-code-bg);
  border: 1px solid var(--color-border);
  border-radius: 2mm;
  padding: 4mm;
  margin-bottom: 4mm;
  overflow-x: auto;
  page-break-inside: avoid;
}

code {
  font-family: var(--font-mono);
  font-size: 9pt;
  line-height: 1.4;
}

p code, li code {
  background-color: var(--color-code-bg);
  padding: 1mm 2mm;
  border-radius: 1mm;
}

/* Message Boxes */
.message-box {
  padding: 4mm;
  margin-bottom: 4mm;
  border-left: 4px solid;
  border-radius: 2mm;
  page-break-inside: avoid;
}

.message-box-info {
  background-color: #e3f2fd;
  border-color: var(--color-info);
}

.message-box-warning {
  background-color: #fff3e0;
  border-color: var(--color-warning);
}

.message-box-error {
  background-color: #ffebee;
  border-color: var(--color-error);
}

.message-box-success {
  background-color: #e8f5e9;
  border-color: var(--color-success);
}

.message-box-neutral {
  background-color: #f5f5f5;
  border-color: var(--color-neutral);
}

.message-box-quote {
  background-color: #fafafa;
  border-color: #999;
  font-style: italic;
}

/* Dividers */
hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 6mm 0;
}

hr.divider-dashed {
  border-top-style: dashed;
}

hr.divider-dotted {
  border-top-style: dotted;
}

hr.divider-double {
  border-top: 3px double var(--color-border);
}

hr.divider-thick {
  border-top-width: 3px;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 4mm auto;
  page-break-inside: avoid;
}

.image-caption {
  text-align: center;
  font-size: 9pt;
  color: #666;
  margin-top: 2mm;
  margin-bottom: 4mm;
}

/* Math */
.math-block {
  margin: 4mm 0;
  text-align: center;
  page-break-inside: avoid;
}

/* Footer */
.pdf-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 5mm;
  margin-top: 10mm;
  font-size: 9pt;
  color: #666;
  text-align: center;
}

/* Print Styles */
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }

  body {
    background: white;
  }

  .pdf-document {
    max-width: 100%;
    padding: 0;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  table, pre, .message-box, img {
    page-break-inside: avoid;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .pdf-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
  }
}

/* Syntax Highlighting (Prism.js compatible) */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #708090;
}

.token.punctuation {
  color: #999;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #a67f59;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #07a;
}

.token.function,
.token.class-name {
  color: #DD4A68;
}

.token.regex,
.token.important,
.token.variable {
  color: #e90;
}
`;
