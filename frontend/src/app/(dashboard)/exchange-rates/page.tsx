"use client";

import { useState, useEffect } from "react";
import { currencyService } from "@/services/currency.service";
import type { CurrentRate, ExchangeRateEntry } from "@/services/currency.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Plus } from "lucide-react";

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<CurrentRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [history, setHistory] = useState<ExchangeRateEntry[]>([]);
  const [newRate, setNewRate] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await currencyService.getCurrentRates();
      setRates(data);
    } catch {}
    setLoading(false);
  }

  async function loadHistory(currencyId: string) {
    setSelectedCurrency(currencyId);
    setHistoryLoading(true);
    try {
      const data = await currencyService.getExchangeRates(currencyId);
      setHistory(data);
    } catch {}
    setHistoryLoading(false);
  }

  async function handleAddRate() {
    if (!selectedCurrency || !newRate) return;
    try {
      await currencyService.createExchangeRate(selectedCurrency, { rate: parseFloat(newRate) });
      setNewRate("");
      await loadHistory(selectedCurrency);
      await load();
    } catch {}
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const selected = rates.find((r) => r.currencyId === selectedCurrency);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exchange Rates</h1>
        <p className="text-muted-foreground">View and update exchange rates for all currencies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((r) => (
          <Card
            key={r.currencyId}
            className={`cursor-pointer transition-colors ${selectedCurrency === r.currencyId ? "ring-2 ring-primary" : ""}`}
            onClick={() => loadHistory(r.currencyId)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.code}</span>
                    <span className="text-muted-foreground">{r.symbol}</span>
                    {r.isDefault && <Badge variant="secondary">Base</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.name}</p>
                </div>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-lg font-bold">{r.currentRate.toFixed(6)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCurrency && (
        <Card>
          <CardHeader>
            <CardTitle>Rate History - {selected?.code} ({selected?.name})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-end gap-3">
              <div className="space-y-1">
                <Label>New Rate</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Enter rate..."
                  className="w-48"
                />
              </div>
              <Button onClick={handleAddRate}><Plus className="mr-1 h-4 w-4" />Add Rate</Button>
            </div>

            {historyLoading ? (
              <p className="text-muted-foreground">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground">No exchange rate history yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b last:border-0">
                        <td className="py-2">{new Date(h.date).toLocaleDateString()}</td>
                        <td className="py-2 font-mono">{Number(h.rate).toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
