import { Suspense } from "react";
import ErrorContent from "./client-error";

export default function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ErrorContent searchParams={searchParams} />
    </Suspense>
  );
}
