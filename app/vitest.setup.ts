import { server } from "./__tests__/mocks/node";
import { beforeAll, afterEach, afterAll } from "vitest";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
