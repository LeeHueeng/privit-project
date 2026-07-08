#!/usr/bin/env node
import { writeCatalog } from "../src/catalog.js";

const summary = await writeCatalog(process.cwd(), process.argv[2] || "catalog/security-checks.jsonl");
console.log(JSON.stringify(summary, null, 2));

