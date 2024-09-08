'use client';

import FileUpload from '@/components/ui/Validator/FileUpload';
import PreviewComponent from '@/components/ui/Validator/PreviewComponent';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Importing Shadcn Button component
import { ArrowLeft } from 'lucide-react'; // Importing back arrow icon from lucide-react
import { updateTemplateAction } from '@/app/lib/actions';

export default function EmailValidator() {
  const [sanitizedData, setSanitizedData] = useState(null);
  const [content, setContent] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Extract the ID from the pathname
  useEffect(() => {
    const parts = pathname?.split('/');
    const id = parts?.[3] || null; // Assuming the id is at this position
    setTemplateId(id);
  }, [pathname]);

  const handleUpdateTemplate = async (content: string) => {
    console.log('----here updating template', templateId, content);
    if (!templateId || !content) return;

    const result = await updateTemplateAction(templateId, content); // Calls server action
    if (result.success) {
      console.log('Template updated successfully:', result.template);
    } else {
      console.error('Failed to update template:', result.error);
    }
  };

  useEffect(() => {
    console.log('----here sanitizedData', sanitizedData, templateId);
    if (!sanitizedData || !templateId) return;
    handleUpdateTemplate(JSON.stringify(sanitizedData));
  }, [sanitizedData, templateId]);

  const handleFileUploadSuccess = (data: any) => {
    console.log('----here data', data);
    setSanitizedData(data);
  };

  return (
    <div>
      <Button
        onClick={() => router.push('/dashboard/validator')}
        variant="outline" // You can change the variant as needed
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {/* Back icon */}
        Back
      </Button>
      <h1>Email HTML Preview Tool</h1>
      {/* Back button using Shadcn Button component with back icon */}

      <FileUpload onUploadSuccess={handleFileUploadSuccess} />
      {sanitizedData && (
        <>
          <PreviewComponent htmlContent={sanitizedData.sanitizedOriginal} />
          <PreviewComponent htmlContent={sanitizedData.transformedHtml} />
          <div>{JSON.stringify(sanitizedData.errors)}</div>
        </>
      )}
    </div>
  );
}
