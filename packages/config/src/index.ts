import { z } from "zod";

export const versionedBundleSchema = z.object({
  id: z.string().min(1),
  effectiveFrom: z.string().datetime({ offset: true }),
  trustId: z.string().min(1),
  contentVersion: z.string().min(1)
});

export type VersionedBundle = z.infer<typeof versionedBundleSchema>;

export function validateVersionedBundle(input: unknown): VersionedBundle {
  return versionedBundleSchema.parse(input);
}
