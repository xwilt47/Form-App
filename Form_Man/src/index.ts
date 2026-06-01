import * as fs from "fs";
import * as path from "path";
import { ConfigLoader } from "./ConfigLoader";
import { FormGenerator } from "./formGenerator";

const CONFIG_PATH = path.resolve(__dirname, "config/form-config.json");
const OUTPUT_PATH = path.resolve(__dirname, "../Frontend/output/form.html");

function main(): void {
  console.log("📖 Loading form config...");
  const config = ConfigLoader.load(CONFIG_PATH);

  console.log(`✅ Config loaded: "${config.formTitle}"`);
  console.log(`   Pages   : ${config.pages.length}`);
  config.pages.forEach((p, i) => {
    console.log(`   Page ${i + 1} : "${p.pageTitle}" — ${p.inputs.length} input(s)`);
  });

  console.log("\n⚙️  Generating HTML...");
  const html = new FormGenerator().generate(config);

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUTPUT_PATH, html, "utf-8");
  console.log(`\n✨ Form generated → ${OUTPUT_PATH}`);
}

main();
