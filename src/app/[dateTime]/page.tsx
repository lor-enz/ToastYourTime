"use client";

import { useParams } from "next/navigation";
import MilestonePage from "@/components/MilestonePage";

export default function DateTimePage() {
  const params = useParams();
  const dateTime = params.dateTime as string;

  return <MilestonePage initialDateParam={dateTime} />;
}
