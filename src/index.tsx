import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { cors } from "hono/cors";
import type { Bindings, UserRole, Variables } from "@/src/types/core.js";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { websocket, upgradeWebSocket } from "hono/bun";
import { AppRouter } from "./router.js";
import { htmlString } from "./html-string.js";
import { APIError } from "better-auth";
import { usernameGenerator, userRepo } from "./routes/users/usersRepo.js";
import { faker } from "@faker-js/faker";
import { db } from "./db/index.js";
import { user as UserSchema } from "./db/schema.js";
import { eq } from "drizzle-orm";
import type { CandidateRow } from "@/dist/src/middlewares/candidate-parser.js";

declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      role: UserRole;
    };
    candidates: CandidateRow[];
  }
}

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"], // Allow requests from these origins
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allow these HTTP methods
    allowHeaders: ["Content-Type", "Authorization"], // Allow these headersss
    credentials: true,
  }),
);

app.use("/api/*", async (c, next) => {
  const userDetails = await auth.api.getSession({
    headers: new Headers(c.req.raw.headers),
  });

  const isAuthRoute = c.req.path.startsWith("/api/auth");

  if (isAuthRoute) {
    return next();
  }

  if (!userDetails?.user) {
    throw new HTTPException(401, {
      message: "Sign in to access api resources",
    });
  }
  c.set("user", {
    id: userDetails?.user.id,
    role: userDetails?.user.role as UserRole,
  });
  await next();
});
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("*", logger());

app.get("/system/health", async (c) => {
  return c.json({
    currentUser: {
      ...c.get("user"),
    },
    systemHealth: "Perfect",
  });
});

app.get("/system/seed-all", async (c) => {
  try {
    for (let i = 0; i < 100; i++) {
      const sex = faker.person.sexType();
      const firstName = faker.person.firstName(sex);
      const lastName = faker.person.lastName(sex);
      const email = faker.internet.email({ firstName, lastName });

      const name = faker.person.fullName({
        firstName,
        lastName,
      });

      const username =
        usernameGenerator() +
        faker.internet.username({
          firstName,
          lastName,
        });
      console.log("username", username);
      const password = faker.internet.password();
      console.log("Password", password);
      const image = faker.image.avatar();
      const user = await auth.api.createUser({
        // headers: c.req.raw.headers,
        body: {
          email,
          name,
          password,
          data: {
            image,
            temporaryCandidate: true,
            username,
          },
        },
      });
    }
  } catch (err) {
    console.log("Error Seeding: ");
    console.log(err);
    throw new APIError("EXPECTATION_FAILED", {
      message: "Seeding  failed",
    });
  }
});

app.onError((err, c) => {
  if (err instanceof APIError) {
    console.log(c.error);
    return c.json(
      {
        success: false,
        error: {
          code: err.body?.code,
          message: err.body?.message,
        },
      },
      400,
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          code: err.status,
          message: err.message,
        },
      },
      400,
    );
  }
  return c.json(
    {
      message: "Internal Server Error",
      success: false,
    },
    500,
  );
});

// Router
app.route("/", AppRouter);

app.get("/", (c) => {
  return c.html(htmlString);
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    let intervalId: any;
    return {
      onOpen(_event, ws) {
        intervalId = setInterval(() => {
          ws.send(new Date().toString());
        }, 200);
      },
      onClose() {
        clearInterval(intervalId);
      },
      onMessage(_event, ws) {
        console.log(_event.data);
        ws.send(Math.floor(Math.random() * 10000000000000).toString());
      },
    };
  }),
);

export default {
  websocket,
  fetch: app.fetch,
  port: 4455,
};
