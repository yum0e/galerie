import { createHttpServer } from ".";
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

  server.stop();
});
