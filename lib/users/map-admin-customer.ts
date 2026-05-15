/** Shape returned by admin customer list/detail APIs. */
export type AdminCustomerDto = {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  customerPublicId: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
};

export function mapAdminCustomerDto(u: {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  customers: {
    publicCustomerId: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
  } | null;
}): AdminCustomerDto {
  const p = u.customers;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    banned: u.banned,
    customerPublicId: p?.publicCustomerId ?? null,
    phone: p?.phone ?? null,
    address: p?.address ?? null,
    city: p?.city ?? null,
    country: p?.country ?? null,
  };
}
