import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5f0] px-5">
      <form action={loginAction} className="w-full max-w-sm rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-6">
        <h1 className="text-2xl font-semibold">Interview Prep Agent</h1>
        <p className="mt-2 text-sm leading-6 text-[#6c6a63]">
          Enter the local MVP password to continue.
        </p>
        {params.error ? (
          <p className="mt-4 rounded-md border border-[#8f2f2f] bg-[#f5e6e2] px-3 py-2 text-sm text-[#8f2f2f]">
            Incorrect password.
          </p>
        ) : null}
        <input type="hidden" name="next" value={params.next || "/"} />
        <label className="mt-5 grid gap-2 text-sm font-medium">
          Password
          <input name="password" type="password" required className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2" />
        </label>
        <button className="mt-5 w-full rounded-md bg-[#175a63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3f45]">
          Continue
        </button>
      </form>
    </main>
  );
}
