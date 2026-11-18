import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Campo de percentual (0 a 100), com a mesma aparência do Input.
 * Deixa apagar enquanto digita (sem virar 0 na hora) e, ao sair do campo,
 * mostra o valor que ficou valendo — 150 vira 100, -5 vira 0.
 */
export function CampoPercentual({ valor, aoMudar, className }: {
  valor: number;
  aoMudar: (valor: number) => void;
  className?: string;
}) {
  const [texto, setTexto] = useState(String(valor));
  const [focado, setFocado] = useState(false);

  useEffect(() => {
    if (!focado) setTexto(String(valor));
  }, [valor, focado]);

  return (
    <Input
      type="number"
      min={0}
      max={100}
      step="any"
      value={texto}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      onChange={(e) => {
        const t = e.target.value;
        setTexto(t);
        const n = parseFloat(t);
        if (t.trim() !== "" && Number.isFinite(n)) aoMudar(Math.min(100, Math.max(0, n)));
      }}
      className={className}
    />
  );
}
