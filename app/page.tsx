import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col justify-between items-center sm:items-start bg-white dark:bg-black px-16 py-32 w-full max-w-3xl">
        <h1 className="mb-4 font-bold text-2xl">Seja muito bem vindo!</h1>
        <p className="text-lg">Use o sistema de logon único para entrar:</p>
        <Link
          href="/auth/login"
          className="mt-8 btn btn-primary"
          prefetch={false}
        >
          Logar com SSO
        </Link>
      </main>
    </div>
  );
}
