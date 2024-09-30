'use server';
import { z } from 'zod';
import {
  createInvoice,
  createUser,
  deleteHtmlTemplate,
  deleteInvoice,
  getAllHtmlTemplatesForUser,
  getHtmlTemplateById,
  getUser,
  getUserForResetToken,
  getUserSubscriptions,
  insertHtmlTemplate,
  resetNewPasswordForUser,
  setResetTokenForUser,
  updateInvoice,
  updateTemplateContent,
} from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth.config';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import { sendEmail } from './resendActions';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoiceAction(
  prevState: State,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  await createInvoice(customerId, amountInCents, status, date);
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoiceAction(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  await updateInvoice(id, customerId, amountInCents, status);

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoiceAction(id: string) {
  await deleteInvoice(id);
  revalidatePath('/dashboard/invoices');
}

export async function authenticateAction(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const response = await signIn('credentials', formData);
    // console.log('Response:', response);
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function signUpAction(
  name: string,
  email: string,
  password: string
) {
  try {
    const schema = z.object({
      name: z.string().min(6),
      email: z.string().email(),
      password: z.string().min(6),
    });
    const result = schema.safeParse({ name, email, password });

    if (result.success) {
      console.log('----here signupin process', result);
      const { email, password } = result.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(name, email, hashedPassword);
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      console.log('----here', signInResult);
      if (!signInResult?.error) {
        return { success: true };
      } else {
        throw new Error(`Sign-in failed.${signInResult?.error}`);
      }
    }
    if (!result.success) {
      console.log('Validation failed with the following errors:');
      result.error.issues.forEach((issue) => {
        console.log(`Path: ${issue.path.join('.')}, Issue: ${issue.message}`);
      });
      return { success: false, error: result.error.issues };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false };
  }
}

// export async function createSubscriptionForUser({}) {
//   try {
//     const subscription = await prisma.subscription.create({
//       data: {
//         userId: user.id, // Link to the user
//         moduleId: module.id, // Link to the module
//         subscriptionType: 'FULL',
//         price: 100.0,
//         durationInMonths: 12,
//         startDate: new Date(),
//         endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
//       },
//     });
//   } catch (error) {
//     console.error('Subscription error:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function getHtmlTemplates(userId: string) {
  try {
    const templates = await getAllHtmlTemplatesForUser(userId);
    // console.log('Templates:', templates);
    return { success: true, templates };
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}

export async function createHtmlTemplateAction(
  name: string,
  description: string
) {
  try {
    const result = await insertHtmlTemplate(name, description);
    console.log('Result:', result.template);
    if (result.success) {
      return { success: true, template: result.template };
    }
    return { success: false, error: 'Failed to create template' };
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export async function updateTemplateAction(
  templateId: string,
  newContent: string
) {
  try {
    const result = await updateTemplateContent(templateId, newContent);
    console.log('Result:', result.template);
    if (result.success) {
      return { success: true, template: result.template };
    }
    return { success: false, error: 'Failed to create template' };
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export const deleteTemplateAction = async (templateId: string) => {
  const result = await deleteHtmlTemplate(templateId);
  if (result.success) {
    // Optionally, update your state or provide user feedback
    console.log('Template deleted successfully:', result.template);
    return { success: true };
  } else {
    console.error('Failed to delete template:', result.error);
  }
};

export const getTemplateByIdAction = async (templateId: string) => {
  const result = await getHtmlTemplateById(templateId);
  if (result.success) {
    console.log('Template fetched:', result.template);
    return { success: true, template: result.template };
  } else {
    console.error('Failed to fetch template:', result.error);
    return { success: false, error: 'Failed to fetch template' };
  }
};

export async function getUserSubscriptionsAction() {
  try {
    const subscriptions = await getUserSubscriptions();
    return { success: true, subscription: subscriptions };
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return { success: false, error: 'No subscripts available' };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
  redirect('/login');
}

export async function resetPasswordAction(token: string, newPassword: string) {
  // Step 1: Find user by token and check if token is still valid
  const user = await getUserForResetToken(token);
  // Step 2: Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Step 3: Update the user's password and clear the reset token and expiry
  const updatedUser = await resetNewPasswordForUser({
    userId: user.id,
    hashedPassword,
  });
  return true;
}

export async function sendResetPasswordMailAction(email: string) {
  try {
    const user = await getUser(email);
    if (!user) throw new Error('No user found with that email address');

    // Generate reset token and send email here
    // For example, you can generate a reset token and store it in the database.
    // After that, you'd send an email to the user with a reset link containing the token.
    const resetToken = bcrypt.hashSync(user.email + Date.now(), 10);
    await setResetTokenForUser({
      email: user.email,
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000),
    });

    // Send email with the reset token
    // console.log(`Send email to ${user.email} with token: ${resetToken}`);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const subject = 'Ezemailer Password Reset Request';
    const htmlContent = `<p>Click the link below to reset your password:</p>
                       <a href="${resetLink}">${resetLink}</a>`;

    // await sendEmail(user.email, subject, htmlContent);
    return { success: true };
  } catch (error) {
    console.error('Failed to reset password:', error);
    return { success: false };
  }
}
