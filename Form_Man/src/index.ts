import * as path from "path";
import { FormController } from "./controllers/FormController";

const CONFIG_PATH = path.resolve(__dirname, "config/form-config.json");
const OUTPUT_PATH = path.resolve(__dirname, "../Frontend/output/form.html");

new FormController(CONFIG_PATH, OUTPUT_PATH).run();
