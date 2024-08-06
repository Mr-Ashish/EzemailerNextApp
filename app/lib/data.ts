import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  noStore();
  try {
    const data = await prisma.revenue.findMany();
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data: LatestInvoiceRaw[] = await prisma.$queryRaw`
      SELECT 
        i.amount, 
        c.name, 
        c.image_url, 
        c.email, 
        i.id
      FROM "Invoice" i
      JOIN "Customer" c ON i.customer_id = c.id
      ORDER BY i.date DESC
      LIMIT 5`;
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise: Promise<number> = prisma.invoice.count();
    const customerCountPromise: Promise<number> = prisma.customer.count();
    const invoiceStatusPromise: Promise<any> = prisma.$queryRaw`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM "Invoice"`;

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(invoiceCount ?? '0');
    const numberOfCustomers = Number(customerCount ?? '0');
    const totalPaidInvoices = formatCurrency(
      Number(invoiceStatus[0].paid) ?? '0'
    );
    const totalPendingInvoices = formatCurrency(
      Number(invoiceStatus[0].pending) ?? '0'
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  } finally {
    await prisma.$disconnect();
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices: InvoicesTable[] = await prisma.$queryRaw`
      SELECT
        i.id,
        i.amount,
        i.date,
        i.status,
        c.name,
        c.email,
        c.image_url
      FROM "Invoice" i
      JOIN "Customer" c ON i.customer_id = c.id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`} OR
        i.amount::text ILIKE ${`%${query}%`} OR
        i.date::text ILIKE ${`%${query}%`} OR
        i.status ILIKE ${`%${query}%`}
      ORDER BY i.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await prisma.$queryRaw`SELECT COUNT(*)
    FROM "Invoice" i
    JOIN "Customer" c ON i.customer_id = c.id
    WHERE
      c.name ILIKE ${`%${query}%`} OR
      c.email ILIKE ${`%${query}%`} OR
      i.amount::text ILIKE ${`%${query}%`} OR
      i.date::text ILIKE ${`%${query}%`} OR
      i.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data: InvoiceForm[] = await prisma.$queryRaw`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM "Invoice" invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice: any) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchCustomers() {
  try {
    const data: CustomerField[] = await prisma.$queryRaw`
      SELECT
        id,
        name
      FROM "Customer" 
      ORDER BY name ASC
    `;

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data: CustomersTableType[] = await prisma.$queryRaw`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function getUser(email: string) {
  try {
    const user =
      await prisma.$queryRaw`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function createInvoice(
  customerId: string,
  amountInCents: number,
  status: string,
  date: string
) {
  try {
    const newInvoice = await prisma.invoice.create({
      data: {
        amount: amountInCents,
        status: status,
        date: new Date(date),
        Customer: {
          connect: { id: customerId }, // Connect to an existing customer by ID
        },
      },
    });

    return newInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateInvoice(
  id: string,
  customerId: string,
  amountInCents: number,
  status: string
) {
  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status: status,
      },
    });

    return updatedInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to update invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function createUser(
  name: string,
  email: string,
  hashedPassword: string
) {
  try {
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export function getAllHtmlTemplatesForUser(userId: string) {
  try {
    return prisma.$queryRaw`SELECT * FROM "EmailTemplates" WHERE "userId"=${userId}`;
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
}
