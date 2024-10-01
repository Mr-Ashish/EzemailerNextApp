'use client';

import FileUpload from '@/components/ui/Validator/FileUpload';
import PreviewComponent from '@/components/ui/Validator/PreviewComponent';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'; // Importing Shadcn Button component
import { ArrowLeft, ArrowRight, Clipboard, Download } from 'lucide-react'; // Importing icons

import { getTemplateByIdAction, updateTemplateAction } from '@/app/lib/actions'; // Import server actions

export default function EmailValidator() {
  const [sanitizedData, setSanitizedData] = useState<any>(null); // Holds the data after upload
  const [previewMode, setPreviewMode] = useState<'original' | 'transformed'>(
    'original'
  ); // State to manage preview mode
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
          if (result.success && result.template && result.template.content) {
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

  const handleUpdateTemplate = useCallback(
    async (content: string) => {
      if (!templateId || !content) return;

      const result = await updateTemplateAction(templateId, content); // Calls server action
      if (result.success) {
        console.log('Template updated successfully:', result.template);
      } else {
        console.error('Failed to update template:', result.error);
      }
    },
    [templateId]
  );

  useEffect(() => {
    if (!sanitizedData || !templateId) return;
    handleUpdateTemplate(JSON.stringify(sanitizedData));
  }, [sanitizedData, templateId, handleUpdateTemplate]);

  const handleFileUploadSuccess = (data: any) => {
    setSanitizedData(data);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard');
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const handleLiveEdit = () => {
    router.push(`/dashboard/validator/${templateId}/liveedit`); // Navigate to live edit route
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      {!sanitizedData ? (
        // Show only FileUpload component in the center of the screen before the file is uploaded
        <div className="flex h-screen w-full items-center justify-center">
          <div className="w-full max-w-md">
            <FileUpload
              onUploadSuccess={handleFileUploadSuccess}
              isEditView={false}
            />
          </div>
        </div>
      ) : (
        // Show the sectional view once the file is uploaded
        <div className="flex h-full w-full flex-col space-y-4 md:flex-row md:space-y-0">
          {/* Left Section */}
          <div className="flex w-full flex-col space-y-6 border-r p-4 md:w-1/3">
            <Button
              onClick={() => router.push('/dashboard/validator')}
              variant="outline"
              className="mb-4 flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h2 className="text-lg font-semibold">Preview Options</h2>

            {/* Preview Selection */}
            <div className="flex flex-col space-y-4">
              <Button
                variant={previewMode === 'original' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('original')}
                className="flex items-center justify-between"
              >
                Preview Original HTML
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'transformed' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('transformed')}
                className="flex items-center justify-between"
              >
                Preview Transformed HTML
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Warnings Section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Warnings</h2>
              {sanitizedData?.errors && sanitizedData.errors.length > 0 ? (
                <ul className="ml-4 list-disc text-red-600">
                  {sanitizedData.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              ) : (
                <p>No warnings or errors found.</p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full p-4 md:w-2/3">
            <h2 className="mb-4 text-lg font-semibold">
              {previewMode === 'original'
                ? 'Original HTML Preview'
                : 'Transformed HTML Preview'}
            </h2>

            {/* Preview Area */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <PreviewComponent
                htmlContent={
                  previewMode === 'original'
                    ? sanitizedData?.sanitizedOriginal
                    : sanitizedData?.transformedHtml
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex space-x-4">
              <Button
                variant="outline"
                onClick={() =>
                  handleCopyCode(
                    previewMode === 'original'
                      ? sanitizedData?.sanitizedOriginal
                      : sanitizedData?.transformedHtml
                  )
                }
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Code
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  handleDownloadFile(
                    'minified.html',
                    previewMode === 'original'
                      ? sanitizedData?.sanitizedOriginal
                      : sanitizedData?.transformedHtml
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download Minified
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  handleDownloadFile(
                    'original.html',
                    previewMode === 'original'
                      ? sanitizedData?.sanitizedOriginal
                      : sanitizedData?.transformedHtml
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download Original
              </Button>
            </div>

            {/* Live Edit Button for Transformed HTML */}
            {previewMode === 'transformed' && (
              <Button
                className="mt-4"
                variant="default"
                onClick={handleLiveEdit}
              >
                Live Edit Transformed HTML
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
