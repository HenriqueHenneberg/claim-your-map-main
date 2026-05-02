import { PaymentPageClient } from "@/components/PaymentPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-28 md:px-6">
      <PaymentPageClient paymentId={id} />
    </div>
  );
}
