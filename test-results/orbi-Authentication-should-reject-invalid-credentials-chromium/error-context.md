# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbi.spec.ts >> Authentication >> should reject invalid credentials
- Location: tests\e2e\orbi.spec.ts:42:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Email')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img "Astra logo" [ref=e8]
      - generic [ref=e11]: Orbi
    - paragraph [ref=e12]: ADHD Productivity Companion
    - generic [ref=e13]:
      - img [ref=e14]
      - generic [ref=e16]: by GrimmForged AI Solutions
  - generic [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e19]:
        - heading "Welcome back" [level=1] [ref=e20]
        - paragraph [ref=e21]: Sign in to your Orbi workspace
      - generic [ref=e22]:
        - generic [ref=e24]:
          - generic [ref=e25] [cursor=pointer]: Email address
          - textbox "you@example.com" [ref=e27]: alex@example.com
        - generic [ref=e29]:
          - generic [ref=e30] [cursor=pointer]: Password
          - textbox "Your password" [ref=e32]
      - button "Forgot password?" [ref=e34] [cursor=pointer]
      - button "Sign in" [ref=e35] [cursor=pointer]:
        - generic [ref=e36]: Sign in
    - paragraph [ref=e37]:
      - text: Don't have an account?
      - link "Create one" [ref=e38] [cursor=pointer]:
        - /url: /register
  - paragraph [ref=e39]: Built for the ADHD brain. Not around it.
```

# Test source

```ts
  1   | // =============================================================
  2   | // Orbi — Playwright E2E Test Scenarios
  3   | // Covers: Auth, Free tier, Agent tier, Full tier
  4   | // =============================================================
  5   | 
  6   | import { test, expect, type Page } from "@playwright/test";
  7   | 
  8   | const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
  9   | 
  10  | // -----------------------------------------------------------
  11  | // Test Fixtures / Helpers
  12  | // -----------------------------------------------------------
  13  | const TEST_USERS = {
  14  |   free:  { email: "free@orbi.test",  password: "TestPass123!", displayName: "Free Tester" },
  15  |   agent: { email: "agent@orbi.test", password: "TestPass123!", displayName: "Agent Tester" },
  16  |   full:  { email: "full@orbi.test",  password: "TestPass123!", displayName: "Full Tester" },
  17  | };
  18  | 
  19  | async function loginAs(page: Page, tier: keyof typeof TEST_USERS) {
  20  |   const user = TEST_USERS[tier];
  21  |   await page.goto(`${BASE_URL}/login`);
  22  |   await page.getByLabel("Email").fill(user.email);
  23  |   await page.getByLabel("Password").fill(user.password);
  24  |   await page.getByRole("button", { name: "Sign in" }).click();
  25  |   await expect(page).toHaveURL(/dashboard/);
  26  | }
  27  | 
  28  | // -----------------------------------------------------------
  29  | // AUTH FLOWS
  30  | // -----------------------------------------------------------
  31  | test.describe("Authentication", () => {
  32  |   test("should register a new user successfully", async ({ page }) => {
  33  |     await page.goto(`${BASE_URL}/register`);
  34  |     await page.getByLabel("Display name").fill("New User");
  35  |     await page.getByLabel("Email").fill("newuser@orbi.test");
  36  |     await page.getByLabel("Password").fill("TestPass123!");
  37  |     await page.getByRole("button", { name: "Create account" }).click();
  38  |     await expect(page).toHaveURL(/onboarding|dashboard/);
  39  |     await expect(page.getByText("New User")).toBeVisible();
  40  |   });
  41  | 
  42  |   test("should reject invalid credentials", async ({ page }) => {
  43  |     await page.goto(`${BASE_URL}/login`);
> 44  |     await page.getByLabel("Email").fill("wrong@orbi.test");
      |                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  45  |     await page.getByLabel("Password").fill("wrongpassword");
  46  |     await page.getByRole("button", { name: "Sign in" }).click();
  47  |     await expect(page.getByRole("alert")).toContainText(/invalid|incorrect/i);
  48  |   });
  49  | 
  50  |   test("should log out successfully", async ({ page }) => {
  51  |     await loginAs(page, "free");
  52  |     await page.getByRole("button", { name: /menu|avatar/i }).click();
  53  |     await page.getByRole("menuitem", { name: "Sign out" }).click();
  54  |     await expect(page).toHaveURL(/login|home/);
  55  |   });
  56  | });
  57  | 
  58  | // -----------------------------------------------------------
  59  | // FREE TIER
  60  | // -----------------------------------------------------------
  61  | test.describe("Free Tier — Planner & Calendar", () => {
  62  |   test.beforeEach(async ({ page }) => loginAs(page, "free"));
  63  | 
  64  |   test("should display the task planner", async ({ page }) => {
  65  |     await page.goto(`${BASE_URL}/planner`);
  66  |     await expect(page.getByRole("heading", { name: /planner|tasks/i })).toBeVisible();
  67  |   });
  68  | 
  69  |   test("should create a new task", async ({ page }) => {
  70  |     await page.goto(`${BASE_URL}/planner`);
  71  |     await page.getByRole("button", { name: /add task|new task/i }).click();
  72  |     await page.getByLabel("Task title").fill("Write project proposal");
  73  |     await page.getByRole("button", { name: "Save" }).click();
  74  |     await expect(page.getByText("Write project proposal")).toBeVisible();
  75  |   });
  76  | 
  77  |   test("should mark a task as complete", async ({ page }) => {
  78  |     await page.goto(`${BASE_URL}/planner`);
  79  |     const taskCheckbox = page.getByRole("checkbox").first();
  80  |     await taskCheckbox.check();
  81  |     await expect(taskCheckbox).toBeChecked();
  82  |   });
  83  | 
  84  |   test("should display the calendar view", async ({ page }) => {
  85  |     await page.goto(`${BASE_URL}/calendar`);
  86  |     await expect(page.getByRole("grid", { name: /calendar/i })).toBeVisible();
  87  |   });
  88  | 
  89  |   test("should show upgrade prompt when accessing AI chat", async ({ page }) => {
  90  |     await page.goto(`${BASE_URL}/chat`);
  91  |     await expect(page.getByText(/upgrade|orbi agent|agent plan/i)).toBeVisible();
  92  |   });
  93  | 
  94  |   test("should enforce 5 task limit on free tier", async ({ page }) => {
  95  |     await page.goto(`${BASE_URL}/planner`);
  96  |     // Assumes 5 tasks already exist in test DB
  97  |     await page.getByRole("button", { name: /add task|new task/i }).click();
  98  |     await page.getByLabel("Task title").fill("Sixth task");
  99  |     await page.getByRole("button", { name: "Save" }).click();
  100 |     await expect(page.getByText(/limit|upgrade/i)).toBeVisible();
  101 |   });
  102 | });
  103 | 
  104 | // -----------------------------------------------------------
  105 | // AGENT TIER — AI Chat
  106 | // -----------------------------------------------------------
  107 | test.describe("Agent Tier — AI Orbi Chat", () => {
  108 |   test.beforeEach(async ({ page }) => loginAs(page, "agent"));
  109 | 
  110 |   test("should access the AI chat interface", async ({ page }) => {
  111 |     await page.goto(`${BASE_URL}/chat`);
  112 |     await expect(page.getByPlaceholder(/message orbi|talk to orbi/i)).toBeVisible();
  113 |   });
  114 | 
  115 |   test("should send a message and receive a response", async ({ page }) => {
  116 |     await page.goto(`${BASE_URL}/chat`);
  117 |     const input = page.getByPlaceholder(/message orbi|talk to orbi/i);
  118 |     await input.fill("I need help getting started on a big project");
  119 |     await page.getByRole("button", { name: /send/i }).click();
  120 |     // Wait for streaming response
  121 |     await expect(page.locator(".message-assistant").last()).not.toBeEmpty({ timeout: 15000 });
  122 |   });
  123 | 
  124 |   test("should break down a task via AI", async ({ page }) => {
  125 |     await page.goto(`${BASE_URL}/planner`);
  126 |     await page.getByRole("button", { name: /add task|new task/i }).click();
  127 |     await page.getByLabel("Task title").fill("Clean the entire house");
  128 |     await page.getByRole("button", { name: /break down|ai steps/i }).click();
  129 |     await expect(page.locator(".task-step")).toHaveCount({ minimum: 2, maximum: 6, timeout: 10000 });
  130 |   });
  131 | 
  132 |   test("should display chat history", async ({ page }) => {
  133 |     await page.goto(`${BASE_URL}/chat`);
  134 |     await expect(page.getByRole("list", { name: /history|conversations/i })).toBeVisible();
  135 |   });
  136 | 
  137 |   test("should not access persona customization on agent tier", async ({ page }) => {
  138 |     await page.goto(`${BASE_URL}/settings/persona`);
  139 |     await expect(page.getByText(/full plan|upgrade/i)).toBeVisible();
  140 |   });
  141 | });
  142 | 
  143 | // -----------------------------------------------------------
  144 | // FULL TIER — Reminders & Persona
```