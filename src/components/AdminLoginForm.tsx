"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Senha inválida ou painel não configurado.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="panel mx-auto max-w-md rounded-lg p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-lg bg-emerald-400 text-zinc-950">
          <Lock className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black text-white">Admin</h1>
          <p className="text-sm text-zinc-500">Acesso protegido por cookie httpOnly assinado.</p>
        </div>
      </div>
      <label className="grid gap-2 text-sm font-bold text-zinc-200">
        Senha administrativa
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-3 font-normal outline-none focus:border-emerald-300/60"
        />
      </label>
      {error ? <p className="mt-3 rounded-lg border border-orange-400/30 bg-orange-400/10 p-3 text-sm text-orange-100">{error}</p> : null}
      <button
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-emerald-400 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
