"use client";

import SubmissionsTable from "@/components/SubmissionsTable";
import { FormSchema } from "@/types";

export default function SubmissionsClient({ forms }: { forms: FormSchema[] }) {
  return <SubmissionsTable forms={forms} />;
}
