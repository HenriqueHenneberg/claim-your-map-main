import { CheckoutForm } from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ territory?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-28 md:px-6">
      <CheckoutForm initialTerritorySlug={params.territory} />
    </div>
  );
}
