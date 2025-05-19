import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  //const customers = await fetchCustomers();
  const customers = [
    {
        id: "1",
        name:"prueba 1"
    },
    {
        id: "2",
        name:"prueba 2"
    },
    {
        id: "3",
        name:"prueba 3"
    },
  ];
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}