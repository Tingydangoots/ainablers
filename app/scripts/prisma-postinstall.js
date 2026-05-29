const { execSync } = require("child_process")
const { writeFileSync } = require("fs")

execSync("prisma generate", { stdio: "inherit" })
writeFileSync("src/generated/prisma/index.ts", 'export * from "./client"\n')
