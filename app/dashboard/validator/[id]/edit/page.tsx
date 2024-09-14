'use client';

import FileUpload from '@/components/ui/Validator/FileUpload';
import PreviewComponent from '@/components/ui/Validator/PreviewComponent';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Importing Shadcn Button component
import { ArrowLeft } from 'lucide-react'; // Importing back arrow icon from lucide-react
import { getTemplateByIdAction, updateTemplateAction } from '@/app/lib/actions'; // Import server actions

export default function EmailValidator() {
  const [sanitizedData, setSanitizedData] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Loading state to handle the template loading

  // Extract the ID from the pathname
  useEffect(() => {
    const parts = pathname?.split('/');
    const id = parts?.[3] || null; // Assuming the id is at this position
    setTemplateId(id);
  }, [pathname]);

  // Fetch the template data if templateId is present
  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId) {
        try {
          const result = await getTemplateByIdAction(templateId); // Call the server-side action to get the template
          if (result.success && result.template) {
            console.log('Template fetched:', result.template);
            setSanitizedData(JSON.parse(result.template.content)); // Assuming the content is in JSON format
          }
        } catch (error) {
          console.error('Failed to fetch template:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

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

      {sanitizedData && (
        <div className="flex flex-row">
          <div className="w-1/2">
            <PreviewComponent htmlContent={sanitizedData.sanitizedOriginal} />
          </div>
          <div className="w-1/2">
            <PreviewComponent htmlContent={sanitizedData.transformedHtml} />
          </div>
          {/* <div>{JSON.stringify(sanitizedData.errors)}</div> */}
        </div>
      )}
      <div className="mt-4">Input/Upload your HTML file to preview</div>
      <FileUpload
        onUploadSuccess={handleFileUploadSuccess}
        isEditView={!!sanitizedData}
      />
    </div>
  );
}
