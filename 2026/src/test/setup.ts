import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * This project runs Vitest with `globals: false` (tests import `describe`,
 * `it`, `expect` explicitly). Testing Library only auto-registers its
 * cleanup hook when a global `afterEach` exists, so unmount between tests
 * explicitly here. Without this, renders accumulate within a file and
 * role-based queries match multiple elements.
 */
afterEach(cleanup);
