import * as path from "path";
import { FormController } from "./controllers/FormController";
import { ApiController }  from "./controllers/ApiController";

const CONFIG_PATH  = path.resolve(__dirname, "config/form-config.json");
const FORM_OUTPUT  = path.resolve(__dirname, "../Frontend/output/form.html");
const API_OUTPUT   = path.resolve(__dirname, "../Frontend/output/api.py");

// ── 1. Generate the HTML form ─────────────────────────────────────────────────
new FormController(CONFIG_PATH, FORM_OUTPUT).run();

console.log("");

// ── 2. Generate the Python FastAPI file ───────────────────────────────────────
new ApiController(CONFIG_PATH, API_OUTPUT).run();
