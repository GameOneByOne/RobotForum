import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadSource(file) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(
    readFileSync(new URL(file, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  new Function("require", "exports", "module", code)(
    require,
    loaded.exports,
    loaded,
  );
  return loaded.exports;
}
const { createTranslator, resolveLocale, en } = loadSource(
  "../lib/i18n/messages.ts",
);
const { displayGuestName } = loadSource("../lib/auth/guest.ts");

test("locale cookies accept only supported languages and default to Chinese", () => {
  assert.equal(resolveLocale("en"), "en");
  for (const value of [undefined, "zh", "fr", "EN", "<script>"])
    assert.equal(resolveLocale(value), "zh");
});

test("brand, hero and footer use the agreed copy in both languages", () => {
  const zh = createTranslator("zh"),
    en = createTranslator("en");
  assert.equal(zh("塔洛维恩"), "塔洛维恩");
  assert.equal(en("塔洛维恩"), "Talovryn");
  assert.equal(en("让你的想法，拥有行动的能力"), "Build Your Own Robot");
  assert.equal(zh("让你的想法，拥有行动的能力"), "让你的想法，拥有行动的能力");
  assert.equal(en("机器人开发者社区"), "A community for robot builders.");
});

test("dynamic counts and feedback translate without altering unknown text", () => {
  const t = createTranslator("en");
  assert.equal(
    t("显示 {0} 篇课程 · 按学习顺序排列", { 0: 12 }),
    "12 lessons · in learning order",
  );
  assert.equal(t("正在上传 3 张图片..."), "Uploading 3 images…");
  assert.equal(t("注册失败：Invalid email"), "Sign-up failed: Invalid email");
  assert.equal(
    t("注册成功。请查看邮箱完成验证后登录。"),
    "Account created. Verify your email before signing in.",
  );
  assert.equal(
    t("我的中文笔记：ROS 2 与机械臂"),
    "我的中文笔记：ROS 2 与机械臂",
  );
  assert.equal(t("<img src=x>"), "<img src=x>");
  for (const key of ["constructor", "toString", "__proto__"])
    assert.equal(t(key), key);
});

test("generated guest names change display language without changing identity", () => {
  assert.equal(displayGuestName("脆皮的香蕉", "en"), "Crispy Banana");
  assert.equal(displayGuestName("脆皮的香蕉", "zh"), "脆皮的香蕉");
  assert.equal(displayGuestName("游客", "en"), "Guest");
  assert.equal(displayGuestName("任意用户名称", "en"), "任意用户名称");
});

test("every static Chinese UI translation key has an English counterpart", () => {
  const missing = [];
  for (const dir of ["../app/", "../components/"]) {
    const root = new URL(dir, import.meta.url);
    for (const entry of readdirSync(root, { recursive: true }).filter((file) =>
      file.endsWith(".tsx"),
    )) {
      const file = new URL(entry.replaceAll("\\", "/"), root);
      const source = ts.createSourceFile(
        entry,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node) {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(source) === "t" &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          const key = node.arguments[0].text;
          if (/[\u3400-\u9fff]/.test(key) && !en[key])
            missing.push(`${entry}: ${key}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  assert.deepEqual(missing, []);
});
