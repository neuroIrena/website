import type { ExperimentResponse } from "./types";

/**
 * Where a finished response goes. Nothing is stored yet: this logs in the
 * local preview and does nothing on the live site. Supabase will plug in here.
 */
export async function saveResponse(response: ExperimentResponse): Promise<void> {
  if (import.meta.env.DEV) {
    console.log("[experiment] response (not saved anywhere yet)", response);
  }
}
