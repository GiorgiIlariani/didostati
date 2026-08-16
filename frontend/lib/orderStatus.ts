export const statusLabels: Record<string, string> = {
  pending: "ახალი შეკვეთა",
  confirmed: "დადასტურებული",
  processing: "დამუშავების პროცესში",
  ready_to_ship: "მზადაა გასაგზავნად",
  shipped: "გზაშია",
  delivered: "ჩაბარებულია",
  cancelled: "გაუქმებულია",
};

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  confirmed: "bg-sky-500/20 text-sky-400 border-sky-500/50",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  ready_to_ship: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  shipped: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  delivered: "bg-green-700/30 text-green-300 border-green-600/50",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
};
