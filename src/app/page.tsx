"use client";

import { usePathname } from "next/navigation";
import MilestonePage from "@/components/MilestonePage";

export default function Home() {
  const pathname = usePathname();
  const dateParam =
    pathname && pathname !== "/" ? pathname.substring(1) : undefined;

  return <MilestonePage initialDateParam={dateParam} />;
}
