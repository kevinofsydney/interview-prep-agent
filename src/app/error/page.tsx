import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string; detail?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5f0] px-5">
      <section className="w-full max-w-lg rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8f2f2f]">
          {params.code ?? "error"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Something needs attention</h1>
        <p className="mt-3 leading-7 text-[#5f5b51]">
          {params.message ?? "The request could not be completed."}
        </p>
        {params.detail ? (
          <p className="mt-4 rounded-md border border-[#f0c9bd] bg-[#f5e6e2] px-3 py-2 text-sm text-[#8f2f2f]">
            {params.detail}
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-5 inline-flex rounded-md bg-[#175a63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3f45]"
        >
          Back to runs
        </Link>
      </section>
    </main>
  );
}

