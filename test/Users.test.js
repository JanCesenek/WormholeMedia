import { describe, expect, test } from "vitest";
import axios from "axios";
import nock from "nock";

describe("User API calls, testing for:", () => {
  test("get request", async () => {
    nock(process.env.VITE_API_URL).get("/users").reply(200, {
      message: "Success!",
    });

    const response = await axios.get(`${process.env.VITE_API_URL}/users`);

    console.log(response.data.message);
    expect(response.status).toEqual(200);
    expect(response.data.message).toEqual("Success!");
  });

  test("login route without a token", async () => {
    nock(process.env.VITE_API_URL).post("/login").reply(401, {
      error: "Unauthorized",
    });

    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/login`, {
        username: "user",
        password: "pass",
      });
    } catch (error) {
      expect(error.response.status).toEqual(401);
      expect(error.response.data.error).toEqual("Unauthorized");
    }
  });

  test("login route with a token", async () => {
    nock(process.env.VITE_API_URL, {
      reqheaders: {
        authorization: "Bearer valid-token",
      },
    })
      .post("/login")
      .reply(200, {
        message: "Login Successful",
      });

    const response = await axios.post(
      `${process.env.VITE_API_URL}/login`,
      {
        username: "user",
        password: "pass",
      },
      {
        headers: {
          Authorization: "Bearer valid-token",
        },
      }
    );

    // Assert the response
    expect(response.status).toEqual(200);
    expect(response.data.message).toEqual("Login Successful");
  });
});
