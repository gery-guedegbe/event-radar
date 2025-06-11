"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleJobs = scheduleJobs;
// utils/cron.ts
const node_cron_1 = __importDefault(require("node-cron"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const node_abort_controller_1 = require("node-abort-controller");
function scheduleJobs() {
    // Toutes les 2 minutes (pour test - configurable via env)
    node_cron_1.default.schedule(process.env.SCRAPE_CRON || "0 */6 * * *", async () => {
        console.log(`[${new Date().toISOString()}] Running scheduled scraping...`);
        const controller = new node_abort_controller_1.AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        try {
            const port = process.env.PORT || 4000;
            const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
            const response = await (0, node_fetch_1.default)(`${baseUrl}/api/scrape`, {
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
            });
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            console.log(`[${new Date().toISOString()}] Scraping job completed.`);
        }
        catch (err) {
            console.error(`[${new Date().toISOString()}] Scrape error:`, err instanceof Error ? err.message : err);
        }
        finally {
            clearTimeout(timeout);
        }
    });
    // Cleanup quotidien
    node_cron_1.default.schedule("0 0 * * *", async () => {
        console.log(`[${new Date().toISOString()}] Running cleanup...`);
        const controller = new node_abort_controller_1.AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        try {
            const port = process.env.PORT || 4000;
            const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
            const response = await (0, node_fetch_1.default)(`${baseUrl}/api/events/cleanup`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
            });
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log(`[${new Date().toISOString()}] Cleanup completed`);
        }
        catch (err) {
            console.error(`[${new Date().toISOString()}] Cleanup error:`, err instanceof Error ? err.message : err);
        }
        finally {
            clearTimeout(timeout);
        }
    });
}
