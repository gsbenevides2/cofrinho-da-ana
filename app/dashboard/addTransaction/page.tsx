"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTransactionAction } from "@/app/actions/addTransaction";
import { checkIsAdminAction } from "@/app/actions/checkIsAdmin";

export default function AddTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        setError("Valor inválido");
        setLoading(false);
        return;
      }

      const result = await addTransactionAction({
        description: formData.description,
        amount,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao adicionar transação",
      );
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    checkIsAdminAction().then((result) => {
      if (!result.success) {
        alert(result.message);
        router.push("/dashboard");
      }
    });
  });

  return (
    <div className="bg-black py-8 min-h-screen text-white">
      <div className="mx-auto px-4 max-w-md container">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-block mb-4 text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Voltar
          </Link>
          <h1 className="mb-1 font-light text-2xl">Nova Transação</h1>
          <p className="text-gray-500 text-sm">Adicione um depósito ou saque</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-gray-400 text-sm"
            >
              Descrição
            </label>
            <input
              type="text"
              id="description"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-black px-4 py-3 border border-white/10 focus:border-white/30 rounded-lg focus:outline-none w-full text-white transition-colors"
              placeholder="Ex: Depósito mensal"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block mb-2 text-gray-400 text-sm"
            >
              Valor (R$)
            </label>
            <input
              type="number"
              id="amount"
              required
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="bg-black px-4 py-3 border border-white/10 focus:border-white/30 rounded-lg focus:outline-none w-full text-white transition-colors"
              placeholder="0,00"
            />
            <p className="mt-2 text-gray-500 text-xs">
              Use valores positivos para depósitos e negativos para saques
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 p-3 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white hover:bg-gray-200 disabled:opacity-50 px-4 py-3 rounded-lg font-medium text-black transition-colors disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-3 border border-white/10 hover:border-white/30 rounded-lg text-center transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
