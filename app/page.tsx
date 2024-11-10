'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import AcmeLogo from '@/app/ui/acme-logo';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import axios from 'axios';
import HtmlCodePreviewer from '@/components/ui/Validator/HtmlCodePreviewer';

export default function Page() {
  const [htmlInput, setHtmlInput] = useState('');
  const [transformedHtml, setTransformedHtml] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleTransformHtml = async () => {
    setIsTransforming(true);
    try {
      const response = await axios.post('/api/validator-upload', {
        html: htmlInput,
      });
      setTransformedHtml(response.data.transformedHtml); // Adjust based on your API response structure
      setFeedbackDialogOpen(true); // Open the feedback dialog
    } catch (error) {
      console.error('Error transforming HTML:', error);
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSubmitFeedback = () => {
    // Handle feedback submission
    axios
      .post('/api/submit-feedback', { feedback: feedbackText })
      .then(() => {
        setFeedbackDialogOpen(false);
        setFeedbackText('');
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
      });
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      {/* Header */}
      {/* <div className="flex h-20 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div> */}
      <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 p-6  md:p-10">
        <p
          className={`${lusitana.className} text-xl text-gray-800 md:text-2xl md:leading-normal`}
        >
          <strong>EzeMailer.</strong> Instantly convert your HTML into
          email-ready templates, ensuring perfect compatibility with all major
          email clients.
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-4 flex flex-col gap-6">
        {/* Transformation Section */}
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Input Section */}
          <div className="flex flex-col md:w-1/2">
            <p className="mb-2 text-lg font-semibold">Enter your HTML code:</p>
            <Textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="flex-grow"
              rows={15}
            />
            <Button
              onClick={handleTransformHtml}
              disabled={isTransforming || !htmlInput.trim()}
              className="mt-4 w-full self-end md:w-auto"
            >
              {isTransforming ? 'Transforming...' : 'Transform HTML'}
            </Button>
          </div>
          {}
          {/* Output Section */}
          <div className="flex flex-col md:w-1/2">
            <p className="mb-2 text-lg font-semibold">Transformed HTML:</p>
            {transformedHtml ? (
              <HtmlCodePreviewer transformedHtml={transformedHtml} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border">
                <p className="text-gray-500">
                  Your transformed HTML will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Section */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          {/* Introduction */}
          <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 p-6 md:w-1/2 md:p-10">
            <p
              className={`${lusitana.className} text-xl text-gray-800 md:text-2xl md:leading-normal`}
            >
              <strong>EzeMailer.</strong> Instantly convert your HTML into
              email-ready templates, ensuring perfect compatibility with all
              major email clients.
            </p>
            <Link
              href="/dashboard"
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              <span>Try Premium</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
          </div>

          {/* Image Preview */}
          <div className="flex items-center justify-center p-6 md:w-1/2 md:p-12">
            <Image
              src="/hero_desktop.png"
              width={1000}
              height={760}
              className="h-auto w-full"
              alt="Dashboard screenshot"
            />
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Did you like it?</DialogTitle>
            <DialogDescription>
              If you Liked it you can recommend us and we will be happy. We also
              have many premium features for you.
            </DialogDescription>
          </DialogHeader>

          {/* Feedback Form */}
          <div className="mt-4">
            <Button
              onClick={handleSubmitFeedback}
              disabled={!feedbackText.trim()}
              className="w-full"
            ></Button>
            <Button
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={!feedbackText.trim()}
              className="w-full"
            >
              Sure
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
