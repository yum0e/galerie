import { test, expect, afterAll } from "vitest";
import supertest from "supertest";
import { spawn } from "child_process";

let slsOfflineProcess: any;

test("with supertest", async () => {
  const port = 3004;

  // start the lambda in offline mode
  // exit the test if the lambda does not start after 10 seconds
  await Promise.race([startSlsOffline(port), stopTest()]);

  // send a request to the lambda and check the response
  const response = await supertest(`http://localhost:${port}`)
    .get(`/health`)
    .expect(200);

  expect(response.body).toMatchInlineSnapshot(`
    {
      "status": "ok",
    }
  `);
});

afterAll(() => {
  slsOfflineProcess.kill();
});

//////////////
// Helpers  //
/////////////
const startSlsOffline = (port: number): Promise<void> => {
  return new Promise((resolve) => {
    slsOfflineProcess = spawn("sls", [
      "offline",
      "--httpPort",
      port.toString(),
    ]);

    // wait until the lambda is ready to receive requests
    slsOfflineProcess.stdout.on("data", (data: any) => {
      if (data.includes(`http://localhost:${port}/{default*}`)) {
        resolve();
      }
    });
  });
};

const stopTest = (): Promise<Error> => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          new Error(
            "Timeout: Serverless Offline did not start after 10 seconds",
          ),
        ),
      10000,
    ),
  );
};
