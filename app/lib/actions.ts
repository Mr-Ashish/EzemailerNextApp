'use server';
import { z } from 'zod';
import {
  createInvoice,
  createUser,
  deleteInvoice,
  updateInvoice,
} from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';

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
    await signIn('credentials', formData);
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
      const { email, password } = result.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(name, email, hashedPassword);
      await signIn('credentials', {
        email,
        password,
      });
      redirect('/dashboard');
    }
    if (!result.success) {
      console.log('Validation failed with the following errors:');
      result.error.issues.forEach((issue) => {
        console.log(`Path: ${issue.path.join('.')}, Issue: ${issue.message}`);
      });
      throw new Error('Validation failed.');
    }
  } catch (error) {
    console.error('Signup error:', error);
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
