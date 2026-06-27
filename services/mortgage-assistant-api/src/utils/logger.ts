/**
 * Re-exports the shared Nyra logger.
 * Previously contained a bespoke winston logger; now delegates to @nyra/shared.
 */
import { createLogger } from "@nyra/shared";

const logger = createLogger("mortgage-assistant-api");

export default logger;
export { createLogger };
