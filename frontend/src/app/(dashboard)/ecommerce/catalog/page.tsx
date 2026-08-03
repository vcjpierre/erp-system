"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Grid3X3, List, Package, Tag, Barcode,
  DollarSign, PackageOpen, ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  code: string;
  barcode: string;
  price: number;
  stock: number;
  image?: string;
}

const products: Product[] = [
  { id: "PRD-001", name: "Wireless Mouse Pro", code: "WM-1001", barcode: "7501234567890", price: 599.99, stock: 142 },
  { id: "PRD-002", name: "Mechanical Keyboard", code: "MK-2002", barcode: "7501234567891", price: 1299.99, stock: 87 },
  { id: "PRD-003", name: "USB-C Hub 7-in-1", code: "UC-3003", barcode: "7501234567892", price: 849.99, stock: 203 },
  { id: "PRD-004", name: "27\" 4K Monitor", code: "MN-4004", barcode: "7501234567893", price: 8499.99, stock: 34 },
  { id: "PRD-005", name: "Webcam HD 1080p", code: "WC-5005", barcode: "7501234567894", price: 1249.99, stock: 56 },
  { id: "PRD-006", name: "Noise Canceling Headphones", code: "HP-6006", barcode: "7501234567895", price: 2499.99, stock: 78 },
  { id: "PRD-007", name: "Portable SSD 1TB", code: "SS-7007", barcode: "7501234567896", price: 1999.99, stock: 112 },
  { id: "PRD-008", name: "Wireless Charger Pad", code: "WC-8008", barcode: "7501234567897", price: 449.99, stock: 245 },
  { id: "PRD-009", name: "Bluetooth Speaker", code: "BS-9009", barcode: "7501234567898", price: 799.99, stock: 61 },
  { id: "PRD-010", name: "Ergonomic Mouse Pad", code: "MP-1010", barcode: "7501234567899", price: 249.99, stock: 320 },
  { id: "PRD-011", name: "Laptop Stand Adjustable", code: "LS-1111", barcode: "7501234567800", price: 699.99, stock: 94 },
  { id: "PRD-012", name: "Cable Management Kit", code: "CM-1212", barcode: "7501234567801", price: 189.99, stock: 410 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search),
  );

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">Ecommerce product catalog with stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name / barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60 pl-8"
            />
          </div>
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("rounded-l-lg p-2 transition-colors", viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50")}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("rounded-r-lg p-2 transition-colors", viewMode === "list" ? "bg-muted" : "hover:bg-muted/50")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Try a different search term." : "The catalog is empty."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card className="h-full transition-all hover:shadow-lg">
                <div className="flex aspect-square items-center justify-center bg-muted/30">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-1 font-medium truncate">{product.name}</h3>
                  <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{product.code}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Barcode className="h-3 w-3" />
                      <span>{product.barcode}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                    <Badge variant={product.stock > 50 ? "success" : product.stock > 10 ? "warning" : "destructive"}>
                      {product.stock} in stock
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left font-medium text-muted-foreground">Product</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Code</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Barcode</th>
                <th className="p-4 text-right font-medium text-muted-foreground">Price</th>
                <th className="p-4 text-right font-medium text-muted-foreground">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.code}</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{product.barcode}</td>
                  <td className="p-4 text-right font-medium">{formatCurrency(product.price)}</td>
                  <td className="p-4 text-right">
                    <Badge variant={product.stock > 50 ? "success" : product.stock > 10 ? "warning" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
