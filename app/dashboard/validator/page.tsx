'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect, use } from 'react';
import { getHtmlTemplates } from '@/app/lib/actions';
import { useSession, signIn } from 'next-auth/react';
import { EmailTemplateType } from '../../lib/definitions';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ValidatorDashboard = () => {
  const { data: session, status } = useSession();

  const [templates, setTemplates] = useState<EmailTemplateType[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('---session', session);
  });
  useEffect(() => {
    const fetchTemplates = async () => {
      const result = await getHtmlTemplates(session?.userId);
      if (result.success && result?.templates) {
        setTemplates(result?.templates);
      } else {
        setMessage('Failed to fetch templates.');
      }
    };

    fetchTemplates();
  }, [session?.userId]);

  return (
    <div>
      {templates.length === 0 ? (
        <div>
          {/* create a view which shows no tmplates and a button to create one */}
          <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mb-4 text-xl font-semibold text-gray-700">
                No templates found. Start creating your first template now!
              </div>
              <Button
                variant="outline"
                className="inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Template</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="font mb-8 flex justify-between text-lg font-bold">
            <span>Templates</span>
            <Button
              variant="outline"
              className="inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Template</span>
            </Button>
          </div>
          <Table>
            <TableCaption>A list of your created templates.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => {
                return (
                  <TableRow key={template.id}>
                    <TableCell>{template.id}</TableCell>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.content}</TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex flex-row justify-end text-right">
                      <Button className="mr-4" size="sm">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ValidatorDashboard;
