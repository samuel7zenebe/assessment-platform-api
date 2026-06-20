import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { websocket, upgradeWebSocket } from "hono/bun";
import { AppRouter } from "./router.js";
import { htmlString } from "./html-string.js";
import { APIError } from "better-auth";
const app = new Hono();
app.use("*", cors({
    origin: ["http://localhost:3000"], // Allow requests from these origins
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allow these HTTP methods
    allowHeaders: ["Content-Type", "Authorization"], // Allow these headersss
    credentials: true,
}));
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
        role: userDetails?.user.role,
    });
    await next();
});
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.use("*", logger());
app.get("/health", async (c) => {
    return c.json({
        currentUser: {
            ...c.get("user"),
        },
        systemHealth: "Perfect",
    });
});
app.onError((err, c) => {
    console.log(c.error);
    if (err instanceof APIError) {
        return c.json({
            success: false,
            error: {
                code: err.body?.code,
                message: err.body?.message,
            },
        }, 400);
    }
    if (err instanceof HTTPException) {
        return c.json({
            success: false,
            error: {
                code: err.status,
                message: err.message,
            },
        }, 400);
    }
    return c.json({
        message: "Internal Server Error",
        success: false,
    }, 500);
});
// Router
app.route("/", AppRouter);
app.get("/", (c) => {
    return c.html(htmlString);
});
app.get("/ws", upgradeWebSocket((c) => {
    let intervalId;
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
}));
export default {
    websocket,
    fetch: app.fetch,
    port: 4455,
};
