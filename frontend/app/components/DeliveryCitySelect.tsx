"use client";

import Select from "@/app/components/Select";
import { DELIVERY_CITIES } from "@/lib/utils/delivery";

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
    <Select
      id={id}
      value={value}
      onChange={onChange}
      placeholder="აირჩიეთ ქალაქი ან მდებარეობა"
      className={`tabular-nums ${className}`.trim()}
      options={DELIVERY_CITIES.map((c) => ({
        value: c.name,
        label: `${c.name} — ₾${c.fee.toFixed(2)}`,
      }))}
    />
  );
}
