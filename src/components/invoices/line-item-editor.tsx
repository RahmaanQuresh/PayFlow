"use client";

import { FormInput } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export interface LineItemData {
  description: string;
  quantity: number;
  rate: number;
}

interface LineItemEditorProps {
  items: LineItemData[];
  onChange: (items: LineItemData[]) => void;
  currency?: string;
}

export function LineItemEditor({ items, onChange, currency = "INR" }: LineItemEditorProps) {
  function addLine() {
    onChange([...items, { description: "", quantity: 1, rate: 0 }]);
  }

  function removeLine(index: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof LineItemData, value: string | number) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    });
    onChange(updated);
  }

  const subtotal = items.reduce((sum, li) => sum + li.quantity * li.rate, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-extrabold">Line Items</h3>
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl border-2 border-foreground bg-background"
          >
            <div className="flex-1 space-y-2">
              <FormInput
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateLine(i, "description", e.target.value)}
              />
              <div className="flex gap-2">
                <div className="w-20">
                  <FormInput
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLine(i, "quantity", Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>
                <div className="flex-1">
                  <FormInput
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateLine(i, "rate", Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center min-w-[80px] text-sm font-bold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency,
                    minimumFractionDigits: 2,
                  }).format(item.quantity * item.rate)}
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(i)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end text-sm font-extrabold text-muted-foreground">
        Subtotal:{" "}
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
        }).format(subtotal)}
      </div>
    </div>
  );
}
