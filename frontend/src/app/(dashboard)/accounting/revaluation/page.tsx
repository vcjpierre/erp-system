"use client";

import { useState, useEffect } from "react";
import { currencyService } from "@/services/currency.service";
import type { RevaluationResult } from "@/services/currency.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, History } from "lucide-react";

export default function RevaluationPage() {
  const [revaluations, setRevaluations] = useState<RevaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<RevaluationResult | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await currencyService.getRevaluations();
      setRevaluations(data);
    } catch {}
    setLoading(false);
  }

  async function handleRun() {
    setRunning(true);
    try {
      await currencyService.runRevaluation({
        accountingPeriodId: "current",
        description: `Revaluation ${new Date().toISOString().slice(0, 10)}`,
      });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Revaluation failed");
    }
    setRunning(false);
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Currency Revaluation</h1>
          <p className="text-muted-foreground">Run period-end FX revaluation and view history</p>
        </div>
        <Button onClick={handleRun} disabled={running}>
          <RefreshCw className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Running..." : "Run Revaluation"}
        </Button>
      </div>

      <div className="grid gap-4">
        {revaluations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <History className="mx-auto mb-2 h-8 w-8" />
              <p>No revaluations yet. Click "Run Revaluation" to start.</p>
              <p className="text-sm">Ensure you have monetary accounts configured and exchange rates set.</p>
            </CardContent>
          </Card>
        ) : (
          revaluations.map((r) => (
            <Card
              key={r.id}
              className={`cursor-pointer transition-colors ${selected?.id === r.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelected(selected?.id === r.id ? null : r)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{new Date(r.date).toLocaleDateString()}</span>
                      <Badge variant={r.status === "POSTED" ? "default" : "secondary"}>{r.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                  <div className={`text-right font-bold ${r.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {r.totalGainLoss >= 0 ? "+" : ""}{Number(r.totalGainLoss).toFixed(2)}
                  </div>
                </div>

                {selected?.id === r.id && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Account</th>
                          <th className="pb-2 font-medium">Currency</th>
                          <th className="pb-2 font-medium">Prev Rate</th>
                          <th className="pb-2 font-medium">Curr Rate</th>
                          <th className="pb-2 font-medium">Balance</th>
                          <th className="pb-2 font-medium">Revalued</th>
                          <th className="pb-2 font-medium">Gain/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.lines.map((l) => (
                          <tr key={l.id} className="border-b last:border-0">
                            <td className="py-2">{l.account?.code} {l.account?.name}</td>
                            <td className="py-2">{l.currencyCode}</td>
                            <td className="py-2 font-mono">{l.previousRate.toFixed(6)}</td>
                            <td className="py-2 font-mono">{l.currentRate.toFixed(6)}</td>
                            <td className="py-2 font-mono">{l.balanceBefore.toFixed(2)}</td>
                            <td className="py-2 font-mono">{l.balanceAfter.toFixed(2)}</td>
                            <td className={`py-2 font-mono ${l.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {l.gainLoss >= 0 ? "+" : ""}{l.gainLoss.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold">
                          <td colSpan={6} className="pt-2 text-right">Total:</td>
                          <td className={`pt-2 font-mono ${r.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {r.totalGainLoss >= 0 ? "+" : ""}{Number(r.totalGainLoss).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
