"use server";

import { Database } from "@/app/db";

interface GetBalanceResponse {
  balance: number;
}

export async function getBalanceAction(): Promise<GetBalanceResponse> {
  const balance = await Database.getInstance().getBalance();
  return { balance };
}
