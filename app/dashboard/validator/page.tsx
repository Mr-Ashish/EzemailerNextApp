'use client';
import FileUpload from '@/components/ui/Validator/FileUpload';
import HtmlCodePreviewer from '@/components/ui/Validator/HtmlCodePreviewer';
import PreviewComponent from '@/components/ui/Validator/PreviewComponent';
import TransformAndPreview from '@/components/ui/Validator/TransformAndPreview';
import React, { useState, useEffect } from 'react';

export default function EmailValidator() {
  const [sanitizedData, setSanitizedData] = useState(null);

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
