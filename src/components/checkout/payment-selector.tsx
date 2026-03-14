'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, QrCode, Globe } from 'lucide-react';

interface PaymentSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PaymentSelector({ value, onValueChange }: PaymentSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange} className="grid gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
        <Label
          htmlFor="pix"
          className="flex flex-1 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <QrCode className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold">Pix (Brasil)</p>
              <p className="text-sm text-muted-foreground">Confirmação instantânea</p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grátis</span>
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
        <Label
          htmlFor="stripe"
          className="flex flex-1 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Cartão / Global</p>
              <p className="text-sm text-muted-foreground">Visa, Master, Cripto (via Stripe)</p>
            </div>
          </div>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </Label>
      </div>
    </RadioGroup>
  );
}
