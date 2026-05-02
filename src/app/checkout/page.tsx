import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{ territory?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  redirect(`/?territory=${params?.territory ?? "curitiba-parana"}`);
}
