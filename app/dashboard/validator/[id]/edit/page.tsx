'use client';
import { updateTemplateContent } from '@/app/lib/data';
import FileUpload from '@/components/ui/Validator/FileUpload';
import HtmlCodePreviewer from '@/components/ui/Validator/HtmlCodePreviewer';
import PreviewComponent from '@/components/ui/Validator/PreviewComponent';
import TransformAndPreview from '@/components/ui/Validator/TransformAndPreview';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function EmailValidator() {
  const [sanitizedData, setSanitizedData] = useState(null);
  const [content, setContent] = useState(null);
  const pathname = usePathname();
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Extract the ID from the pathname
  useEffect(() => {
    const parts = pathname?.split('/');
    const id = parts?.[3] || null; // Assuming the id is at this position
    setTemplateId(id);
  }, [pathname]);

  const handleUpdateTemplate = async () => {
    if (!templateId || !content) return;
    await updateTemplateContent(templateId, content);
    // Add any additional logic, such as navigating away or displaying a success message
  };

  //   useEffect(() => {
  //     console.log('---here', sanitizedHtml);
  //   }, [sanitizedHtml]);

  return (
    <div>
      <h1>Email HTML Preview Tool</h1>
      <FileUpload onUploadSuccess={(data) => setSanitizedData(data)} />
      {sanitizedData && (
        <>
          <PreviewComponent htmlContent={sanitizedData.sanitizedOriginal} />

          <PreviewComponent htmlContent={sanitizedData.transformedHtml} />
          <div>{JSON.stringify(sanitizedData.errors)}</div>
          {/* <TransformAndPreview sanitizedHtml={sanitizedHtml} /> */}
        </>
      )}
    </div>
  );
}
