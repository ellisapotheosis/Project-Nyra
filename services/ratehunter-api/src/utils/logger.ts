/**
 * Re-exports the shared Nyra logger.
 * Previously contained a bespoke winston logger; now delegates to @nyra/shared.
 */
import { createLogger } from "@nyra/shared";

export const logger = createLogger("ratehunter-api");
export default logger;
