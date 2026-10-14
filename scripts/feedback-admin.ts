/**
 * Prints the SQL that seeds (or resets the password of) a feedback inbox
 * account. Accounts are plain rows in feedback_private.admins with a bcrypt
 * hash; there's no sign-up, so this is the only way in. See docs/feedback.md.
 *
 *   pnpm feedback:admin <username>             asks for the password
 *   pnpm feedback:admin <username> --generate  makes a random password and saves
 *                                              it to tmp/feedback-admin-<username>.txt
 *
 * Run the printed statement in the Supabase SQL editor. Only the hash leaves
 * this machine, and setting a new password signs that account out everywhere.
 */
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import bcrypt from "bcryptjs";

const USERNAME = /^[a-z0-9._-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 12;
/** Same cost as the dummy hash in feedback_admin_login, so timings match. */
const BCRYPT_COST = 10;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** Reads a line without echoing it. */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    // Print the prompt, swallow the typed characters
    const muted = rl as unknown as { _writeToOutput: (text: string) => void };
    muted._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(question);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const generate = args.includes("--generate");
  const username = args.find((arg) => !arg.startsWith("--"))?.trim().toLowerCase();

  if (!username || !USERNAME.test(username)) {
    fail(
      "Usage: pnpm feedback:admin <username> [--generate]\n" +
        "Usernames are 3-32 characters: a-z, 0-9, dot, dash or underscore.",
    );
  }

  let password: string;
  if (generate) {
    password = randomBytes(18).toString("base64url");
    const dir = path.join(process.cwd(), "tmp");
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `feedback-admin-${username}.txt`);
    writeFileSync(file, `username: ${username}\npassword: ${password}\n`, { mode: 0o600 });
    console.error(`Password saved to ${path.relative(process.cwd(), file)} (gitignored).`);
  } else {
    password = await askHidden(`Password for ${username}: `);
    if (password.length < MIN_PASSWORD_LENGTH) {
      fail(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if ((await askHidden("Repeat it: ")) !== password) fail("The passwords don't match.");
  }

  const hash = bcrypt.hashSync(password, BCRYPT_COST);
  console.log(`select feedback_private.set_admin('${username}', '${hash}');`);
}

main();
