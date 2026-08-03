"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Search, X, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, Scan, Printer, DollarSign, Percent, RotateCcw,
  Monitor, Check, ChevronDown, Landmark, AlertCircle, Ticket,
} from "lucide-react";

type Product = {
  id: string;
  barcode: string;
  name: string;
  price: number;
  hasTax: boolean;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type PaymentMethod = "cash" | "card" | "transfer" | "other";

type SaleStatus = "idle" | "payment" | "complete" | "error";

const TAX_RATE = 0.16;

const MOCK_PRODUCTS: Product[] = [
  { id: "1", barcode: "750100123456", name: "Coca-Cola 355ml", price: 18.5, hasTax: true, stock: 150 },
  { id: "2", barcode: "750100654321", name: "Sabritas Papas 45g", price: 15, hasTax: true, stock: 200 },
  { id: "3", barcode: "750100111222", name: "Pan Bimbo Blanco 680g", price: 32.5, hasTax: false, stock: 80 },
  { id: "4", barcode: "750100333444", name: "Leche Lala 1L", price: 22, hasTax: true, stock: 120 },
  { id: "5", barcode: "750100555666", name: "Huevo San Juan 30pz", price: 58, hasTax: false, stock: 60 },
  { id: "6", barcode: "750100777888", name: "Arroz SOS 1kg", price: 28, hasTax: true, stock: 90 },
  { id: "7", barcode: "750100999000", name: "Frijoles La Sierra 900g", price: 25.5, hasTax: true, stock: 75 },
  { id: "8", barcode: "750100222333", name: "Aceite Capullo 1L", price: 42, hasTax: true, stock: 45 },
  { id: "9", barcode: "750100444555", name: "Jabón Zote 200g", price: 12, hasTax: false, stock: 200 },
  { id: "10", barcode: "750100666777", name: "Cloralex 1L", price: 18, hasTax: false, stock: 100 },
  { id: "11", barcode: "750100888999", name: "Cerveza Victoria Sixpack", price: 89, hasTax: true, stock: 40 },
  { id: "12", barcode: "750100000111", name: "Galletas Marias 170g", price: 14.5, hasTax: true, stock: 180 },
];

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [status, setStatus] = useState<SaleStatus>("idle");
  const [sessionOpen, setSessionOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cashReceived, setCashReceived] = useState<number | null>(null);

  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const findProductByBarcode = useCallback(
    (barcode: string) => MOCK_PRODUCTS.find((p) => p.barcode === barcode),
    [],
  );

  const searchProducts = useCallback(
    (query: string) =>
      MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.barcode.includes(query) ||
          p.id === query,
      ),
    [],
  );

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
      setSelectedIndex(0);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery, searchProducts]);

  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    },
    [],
  );

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleBarcodeSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = barcodeInput.trim();
      if (!trimmed) return;
      const product = findProductByBarcode(trimmed);
      if (product) {
        addToCart(product);
        setBarcodeInput("");
      }
    },
    [barcodeInput, findProductByBarcode, addToCart],
  );

  const selectSearchProduct = useCallback(
    (product: Product) => {
      addToCart(product);
      setSearchQuery("");
      setShowSearch(false);
      searchRef.current?.blur();
      barcodeRef.current?.focus();
    },
    [addToCart],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSearch || searchResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectSearchProduct(searchResults[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSearch(false);
        searchRef.current?.blur();
      }
    },
    [showSearch, searchResults, selectedIndex, selectSearchProduct],
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const taxableAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + (item.product.hasTax ? item.product.price * item.quantity : 0),
        0,
      ),
    [cart],
  );

  const tax = taxableAmount * TAX_RATE;
  const total = subtotal + tax;
  const change = cashReceived !== null ? cashReceived - total : 0;

  const clearSale = useCallback(() => {
    setCart([]);
    setSelectedPayment(null);
    setStatus("idle");
    setCashReceived(null);
    barcodeRef.current?.focus();
  }, []);

  const completeSale = useCallback(() => {
    if (cart.length === 0 || !selectedPayment) return;
    setStatus("complete");
    setTimeout(() => {
      clearSale();
    }, 3000);
  }, [cart.length, selectedPayment, clearSale]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (e.key === "F2") {
        e.preventDefault();
        if (cart.length > 0) setStatus("payment");
      } else if (e.key === "F3") {
        e.preventDefault();
        if (cart.length > 0) clearSale();
      } else if (e.key === "F4") {
        e.preventDefault();
        setSessionOpen((prev) => !prev);
      }
    },
    [cart.length, clearSale],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (status === "idle" && cart.length === 0) {
      barcodeRef.current?.focus();
    }
  }, [status, cart.length]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Panel - Search & Cart */}
      <div className="flex w-[70%] flex-col gap-4">
        {/* Top Bar */}
        <Card className="shrink-0">
          <CardContent className="flex items-center gap-4 p-3">
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
              <Scan className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or type barcode..."
                className="h-10 pl-9 font-mono text-base"
              />
            </form>

            <div className="relative flex-1" ref={searchContainerRef}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.length > 0 && searchResults.length > 0) {
                    setShowSearch(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSearch(false), 200);
                }}
                placeholder="Search products... (F1)"
                className="h-10 pl-9"
              />

              {showSearch && searchResults.length > 0 && (
                <Card className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto shadow-lg">
                  <CardContent className="p-1">
                    {searchResults.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                          index === selectedIndex
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                        )}
                        onMouseDown={() => selectSearchProduct(product)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.barcode}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(product.price)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">F1</kbd>
              Search
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">F2</kbd>
              Pay
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">F3</kbd>
              Cancel
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">F4</kbd>
              Session
            </div>
          </CardContent>
        </Card>

        {/* Cart Table */}
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader className="shrink-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Sale Cart
                <Badge variant="secondary" className="ml-1 text-xs">
                  {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p className="text-sm">Scan or search products to start</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Price</th>
                      <th className="w-28 pb-2 text-center font-medium">Qty</th>
                      <th className="pb-2 text-right font-medium">Subtotal</th>
                      <th className="w-10 pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.product.barcode}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">{formatCurrency(item.product.price)}</td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-mono text-base font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono font-medium tabular-nums">
                          {formatCurrency(item.product.price * item.quantity)}
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Summary & Payment */}
      <div className="flex w-[30%] flex-col gap-4">
        {/* Session Status */}
        <Card className="shrink-0">
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">POS Terminal</span>
            </div>
            <Badge
              variant={sessionOpen ? "success" : "secondary"}
              className="gap-1"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  sessionOpen ? "bg-green-500 animate-pulse" : "bg-gray-400",
                )}
              />
              {sessionOpen ? "Open" : "Closed"}
            </Badge>
          </CardContent>
        </Card>

        {/* Ticket / Summary */}
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-4 w-4" />
              Sale Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items ({cartItemCount})</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax (16%)</span>
                <span className="font-mono tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="font-mono text-2xl font-bold tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {status === "complete" && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 p-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  Sale completed!
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="space-y-3 pt-4">
              {status === "payment" && (
                <>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedPayment === "cash" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-1 text-xs",
                        selectedPayment === "cash" && "ring-2 ring-primary",
                      )}
                      onClick={() => setSelectedPayment("cash")}
                    >
                      <Banknote className="h-5 w-5" />
                      Cash
                    </Button>
                    <Button
                      variant={selectedPayment === "card" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-1 text-xs",
                        selectedPayment === "card" && "ring-2 ring-primary",
                      )}
                      onClick={() => setSelectedPayment("card")}
                    >
                      <CreditCard className="h-5 w-5" />
                      Card
                    </Button>
                    <Button
                      variant={selectedPayment === "transfer" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-1 text-xs",
                        selectedPayment === "transfer" && "ring-2 ring-primary",
                      )}
                      onClick={() => setSelectedPayment("transfer")}
                    >
                      <Landmark className="h-5 w-5" />
                      Transfer
                    </Button>
                    <Button
                      variant={selectedPayment === "other" ? "default" : "outline"}
                      className={cn(
                        "h-16 flex-col gap-1 text-xs",
                        selectedPayment === "other" && "ring-2 ring-primary",
                      )}
                      onClick={() => setSelectedPayment("other")}
                    >
                      <DollarSign className="h-5 w-5" />
                      Other
                    </Button>
                  </div>

                  {selectedPayment === "cash" && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Quick Amount
                      </p>
                      <div className="grid grid-cols-5 gap-1">
                        {QUICK_AMOUNTS.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-8 text-xs font-mono",
                              cashReceived === amount && "bg-primary text-primary-foreground",
                            )}
                            onClick={() => setCashReceived(amount)}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      {cashReceived !== null && (
                        <div className="rounded-lg border p-2 text-center">
                          <div className="text-xs text-muted-foreground">Change</div>
                          <div
                            className={cn(
                              "font-mono text-lg font-bold tabular-nums",
                              change < 0 ? "text-destructive" : "text-green-600",
                            )}
                          >
                            {change >= 0
                              ? formatCurrency(change)
                              : `Short ${formatCurrency(Math.abs(change))}`}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStatus("idle");
                        setSelectedPayment(null);
                        setCashReceived(null);
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 gap-1"
                      disabled={
                        !selectedPayment ||
                        (selectedPayment === "cash" &&
                          (cashReceived === null || cashReceived < total))
                      }
                      onClick={completeSale}
                    >
                      Pay {formatCurrency(total)}
                    </Button>
                  </div>
                </>
              )}

              {status === "idle" && cart.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 gap-1"
                    onClick={clearSale}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-1"
                    onClick={() => setStatus("payment")}
                  >
                    <DollarSign className="h-4 w-4" />
                    Pay (F2)
                  </Button>
                </div>
              )}

              {status === "idle" && cart.length === 0 && (
                <div className="flex gap-2">
                  <Button
                    variant={sessionOpen ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => setSessionOpen((prev) => !prev)}
                  >
                    {sessionOpen ? "Close Session" : "Open Session"}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-1" disabled>
                    <Printer className="h-4 w-4" />
                    Reports
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
