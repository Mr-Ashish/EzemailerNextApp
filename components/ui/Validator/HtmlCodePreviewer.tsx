'use client';
import React, { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Import a highlight.js CSS style
import beautifyHtml from './utils';

const HtmlCodePreviewer = ({ transformedHtml }: { transformedHtml: any }) => {
  useEffect(() => {
    // Apply syntax highlighting to the transformed HTML code
    hljs.highlightAll();
  }, [transformedHtml]);

  const beautifiedHtml = beautifyHtml(transformedHtml);

  return (
    <div>
      <pre>
        <code className="html">{beautifiedHtml}</code>
      </pre>
    </div>
  );
};

export default HtmlCodePreviewer;
