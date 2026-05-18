"use client";

import { useState, useEffect } from "react";
import { currencyService } from "@/services/currency.service";
import type { Currency } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [form, setForm] = useState({ code: "", name: "", symbol: "", exchangeRate: 1, isDefault: false });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await currencyService.list();
      setCurrencies(data);
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    try {
      if (editing) {
        await currencyService.update(editing.id, form);
      } else {
        await currencyService.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ code: "", name: "", symbol: "", exchangeRate: 1, isDefault: false });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error saving currency");
    }
  }

  function handleEdit(c: Currency) {
    setEditing(c);
    setForm({ code: c.code, name: c.name, symbol: c.symbol, exchangeRate: Number(c.exchangeRate), isDefault: c.isDefault });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this currency?")) return;
    try {
      await currencyService.remove(id);
      await load();
    } catch {}
  }

  function handleNew() {
    setEditing(null);
    setForm({ code: "", name: "", symbol: "", exchangeRate: 1, isDefault: false });
    setShowForm(true);
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Currencies</h1>
          <p className="text-muted-foreground">Manage currencies and exchange rates</p>
        </div>
        <Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" />Add Currency</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit Currency" : "New Currency"}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={3} placeholder="USD" />
              </div>
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="$" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="US Dollar" />
              </div>
              <div className="space-y-2">
                <Label>Exchange Rate</Label>
                <Input type="number" step="0.000001" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4" />
                <Label htmlFor="isDefault">Default currency</Label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {c.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.code}</span>
                      {c.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.name}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground">Rate: </span>
                <span className="font-medium">{Number(c.exchangeRate).toFixed(6)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                  <Pencil className="mr-1 h-3 w-3" />Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)} disabled={c.isDefault}>
                  <Trash2 className="mr-1 h-3 w-3" />Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
