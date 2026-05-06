// =============================================================
// Orbi — Playwright E2E Test Scenarios
// Covers: Auth, Free tier, Agent tier, Full tier
// =============================================================

import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

// -----------------------------------------------------------
// Test Fixtures / Helpers
// -----------------------------------------------------------
const TEST_USERS = {
  free:  { email: "free@orbi.test",  password: "TestPass123!", displayName: "Free Tester" },
  agent: { email: "agent@orbi.test", password: "TestPass123!", displayName: "Agent Tester" },
  full:  { email: "full@orbi.test",  password: "TestPass123!", displayName: "Full Tester" },
};

async function loginAs(page: Page, tier: keyof typeof TEST_USERS) {
  const user = TEST_USERS[tier];
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/dashboard/);
}

// -----------------------------------------------------------
// AUTH FLOWS
// -----------------------------------------------------------
test.describe("Authentication", () => {
  test("should register a new user successfully", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.getByLabel("Display name").fill("New User");
    await page.getByLabel("Email").fill("newuser@orbi.test");
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/onboarding|dashboard/);
    await expect(page.getByText("New User")).toBeVisible();
  });

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Email").fill("wrong@orbi.test");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toContainText(/invalid|incorrect/i);
  });

  test("should log out successfully", async ({ page }) => {
    await loginAs(page, "free");
    await page.getByRole("button", { name: /menu|avatar/i }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/login|home/);
  });
});

// -----------------------------------------------------------
// FREE TIER
// -----------------------------------------------------------
test.describe("Free Tier — Planner & Calendar", () => {
  test.beforeEach(async ({ page }) => loginAs(page, "free"));

  test("should display the task planner", async ({ page }) => {
    await page.goto(`${BASE_URL}/planner`);
    await expect(page.getByRole("heading", { name: /planner|tasks/i })).toBeVisible();
  });

  test("should create a new task", async ({ page }) => {
    await page.goto(`${BASE_URL}/planner`);
    await page.getByRole("button", { name: /add task|new task/i }).click();
    await page.getByLabel("Task title").fill("Write project proposal");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Write project proposal")).toBeVisible();
  });

  test("should mark a task as complete", async ({ page }) => {
    await page.goto(`${BASE_URL}/planner`);
    const taskCheckbox = page.getByRole("checkbox").first();
    await taskCheckbox.check();
    await expect(taskCheckbox).toBeChecked();
  });

  test("should display the calendar view", async ({ page }) => {
    await page.goto(`${BASE_URL}/calendar`);
    await expect(page.getByRole("grid", { name: /calendar/i })).toBeVisible();
  });

  test("should show upgrade prompt when accessing AI chat", async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await expect(page.getByText(/upgrade|orbi agent|agent plan/i)).toBeVisible();
  });

  test("should enforce 5 task limit on free tier", async ({ page }) => {
    await page.goto(`${BASE_URL}/planner`);
    // Assumes 5 tasks already exist in test DB
    await page.getByRole("button", { name: /add task|new task/i }).click();
    await page.getByLabel("Task title").fill("Sixth task");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/limit|upgrade/i)).toBeVisible();
  });
});

// -----------------------------------------------------------
// AGENT TIER — AI Chat
// -----------------------------------------------------------
test.describe("Agent Tier — AI Orbi Chat", () => {
  test.beforeEach(async ({ page }) => loginAs(page, "agent"));

  test("should access the AI chat interface", async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await expect(page.getByPlaceholder(/message orbi|talk to orbi/i)).toBeVisible();
  });

  test("should send a message and receive a response", async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    const input = page.getByPlaceholder(/message orbi|talk to orbi/i);
    await input.fill("I need help getting started on a big project");
    await page.getByRole("button", { name: /send/i }).click();
    // Wait for streaming response
    await expect(page.locator(".message-assistant").last()).not.toBeEmpty({ timeout: 15000 });
  });

  test("should break down a task via AI", async ({ page }) => {
    await page.goto(`${BASE_URL}/planner`);
    await page.getByRole("button", { name: /add task|new task/i }).click();
    await page.getByLabel("Task title").fill("Clean the entire house");
    await page.getByRole("button", { name: /break down|ai steps/i }).click();
    await expect(page.locator(".task-step")).toHaveCount({ minimum: 2, maximum: 6, timeout: 10000 });
  });

  test("should display chat history", async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await expect(page.getByRole("list", { name: /history|conversations/i })).toBeVisible();
  });

  test("should not access persona customization on agent tier", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/persona`);
    await expect(page.getByText(/full plan|upgrade/i)).toBeVisible();
  });
});

// -----------------------------------------------------------
// FULL TIER — Reminders & Persona
// -----------------------------------------------------------
test.describe("Full Tier — Reminders & Tailored Persona", () => {
  test.beforeEach(async ({ page }) => loginAs(page, "full"));

  test("should access persona customization", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/persona`);
    await expect(page.getByLabel(/orbi name/i)).toBeVisible();
    await expect(page.getByLabel(/tone/i)).toBeVisible();
    await expect(page.getByLabel(/motivation style/i)).toBeVisible();
  });

  test("should save persona customization", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/persona`);
    await page.getByLabel(/orbi name/i).fill("Nova");
    await page.getByLabel(/tone/i).selectOption("energetic");
    await page.getByRole("button", { name: "Save persona" }).click();
    await expect(page.getByText(/saved|updated/i)).toBeVisible();
  });

  test("should create a reminder", async ({ page }) => {
    await page.goto(`${BASE_URL}/reminders`);
    await page.getByRole("button", { name: /add reminder|new reminder/i }).click();
    await page.getByLabel("Reminder title").fill("Take medication");
    await page.getByLabel(/time/i).fill("09:00");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Take medication")).toBeVisible();
  });

  test("should connect Google Calendar", async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/integrations`);
    await expect(page.getByRole("button", { name: /connect google calendar/i })).toBeVisible();
  });

  test("should display Google Calendar events when connected", async ({ page }) => {
    // Assumes Google Calendar is connected in test fixture
    await page.goto(`${BASE_URL}/calendar`);
    await expect(page.getByTestId("calendar-event")).toHaveCount({ minimum: 1, timeout: 5000 });
  });

  test("should reflect custom persona name in chat", async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    // After saving "Nova" as persona name
    await expect(page.getByText(/nova/i)).toBeVisible();
  });
});

// -----------------------------------------------------------
// SUBSCRIPTION / UPGRADE FLOWS
// -----------------------------------------------------------
test.describe("Subscription & Upgrade", () => {
  test("should show upgrade modal from free tier", async ({ page }) => {
    await loginAs(page, "free");
    await page.goto(`${BASE_URL}/chat`);
    await page.getByRole("button", { name: /upgrade/i }).click();
    await expect(page.getByRole("dialog", { name: /upgrade|plans/i })).toBeVisible();
    await expect(page.getByText(/\$9.99/)).toBeVisible();
    await expect(page.getByText(/\$24.99/)).toBeVisible();
  });

  test("should display all three pricing tiers", async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await expect(page.getByText(/free/i)).toBeVisible();
    await expect(page.getByText(/agent/i)).toBeVisible();
    await expect(page.getByText(/full/i)).toBeVisible();
    await expect(page.getByText(/\$9.99 CAD/)).toBeVisible();
    await expect(page.getByText(/\$24.99 CAD/)).toBeVisible();
  });

  test("should redirect to Stripe checkout on upgrade click", async ({ page }) => {
    await loginAs(page, "free");
    await page.goto(`${BASE_URL}/pricing`);
    const upgradeBtn = page.getByRole("button", { name: /get agent|upgrade to agent/i });
    await upgradeBtn.click();
    await expect(page).toHaveURL(/checkout.stripe.com/);
  });
});

// -----------------------------------------------------------
// FOCUS SESSION
// -----------------------------------------------------------
test.describe("Focus Sessions", () => {
  test.beforeEach(async ({ page }) => loginAs(page, "agent"));

  test("should start a focus session", async ({ page }) => {
    await page.goto(`${BASE_URL}/focus`);
    await page.getByRole("button", { name: /start focus|begin session/i }).click();
    await expect(page.getByRole("timer")).toBeVisible();
  });

  test("should complete a focus session and log it", async ({ page }) => {
    await page.goto(`${BASE_URL}/focus`);
    await page.getByRole("button", { name: /start/i }).click();
    // Skip ahead (mock timer or use short test duration)
    await page.getByRole("button", { name: /end session|complete/i }).click();
    await expect(page.getByText(/session complete|great work/i)).toBeVisible();
  });
});
