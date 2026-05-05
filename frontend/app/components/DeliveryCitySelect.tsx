"use client";

import { NATIVE_SELECT_CLASS } from "@/lib/nativeSelectClass";
import { DELIVERY_CITIES } from "@/lib/utils/delivery";

const fieldClass = `${NATIVE_SELECT_CLASS} tabular-nums`;

type Props = {
  value: string;
  onChange: (city: string) => void;
  id?: string;
  className?: string;
};

export default function DeliveryCitySelect({
  value,
  onChange,
  id,
  className = "",
}: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} ${className}`.trim()}>
      <option value="">აირჩიეთ ქალაქი ან მდებარეობა</option>
      {DELIVERY_CITIES.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name} — ₾{c.fee.toFixed(2)}
        </option>
      ))}
    </select>
  );
}
