"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "Ocorreu um erro desconhecido.";
  return (
    <div className="flex flex-col flex-1 justify-center items-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col justify-between items-center sm:items-start bg-white dark:bg-black px-16 py-32 w-full max-w-3xl">
        <h1 className="mb-4 font-bold text-2xl">Ops ocorreu um erro!</h1>
        <p className="text-lg">{message}</p>
        <Link href="/" className="mt-8 btn btn-primary">
          Voltar para Home
        </Link>
      </main>
    </div>
  );
}
