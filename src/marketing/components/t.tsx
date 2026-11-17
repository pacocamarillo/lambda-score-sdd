"use client";

import type { MessageId } from "@/marketing/lib/i18n";
import { usePreferences } from "@/marketing/components/preferences";

export function T({ id }: { id: MessageId }) {
  const { t } = usePreferences();
  return t(id);
}
