import { redirect } from "next/navigation";

export default async function NoticiasSlugRedirect(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  redirect(`/blog/${slug}`);
}
