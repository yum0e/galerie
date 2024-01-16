import { createHttpServer } from "./api";
import { expect, test } from "vitest";
import supertest from "supertest";
import axios from "axios";

const server = createHttpServer({});

test("with superset", async () => {
  const app = server.getApi();

  const res = await supertest(app).get("/health").expect(200);
  expect(res.body).toMatchInlineSnapshot(`
    {
      "status": "ok",
    }
  `);
});

test("with axios", async () => {
  const port = 3000;
  await server.start({ port });

  const response = await axios.get(`http://localhost:${port}/health`);

  expect(response.status).toBe(200);
  expect(response.data).toMatchInlineSnapshot(`
    {
      "status": "ok",
    }
  `);

  await server.stop();
});

test("tearDown", async () => {
  const port = 3000;
  await server.start({ port });
  await server.teardown();

  try {
    await axios.get(`http://localhost:${port}/health`);
  } catch (err: any) {
    expect(err.cause).toMatchInlineSnapshot(
      `[Error: connect ECONNREFUSED ::1:${port}]`,
    );
  }
});
