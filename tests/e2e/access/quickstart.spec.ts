import { expect, test } from "@playwright/test";

test.describe("acceso", () => {
  test.skip(!process.env.DATABASE_URL, "Requiere DATABASE_URL y la migración aplicada");

  test("crea una organización y muestra su nombre", async ({ page }) => {
    const subdomain = `org${Date.now()}`;
    await page.goto("/signup");
    await page.getByLabel("Nombre de la organización").fill("Organización prueba");
    await page.getByLabel("Subdominio").fill(subdomain);
    await page.getByLabel("Tu nombre").fill("Ana Pérez");
    await page.getByLabel("Correo").fill(`${subdomain}@example.com`);
    await page.getByLabel("Contraseña", { exact: true }).fill("clave-segura");
    await page.getByLabel("Confirmar contraseña").fill("clave-segura");
    await page.getByRole("button", { name: "Crear" }).click();
    await expect(page.getByRole("heading", { name: "Organización prueba" })).toBeVisible();
  });

  test("la contraseña incorrecta usa un solo mensaje", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill("nadie@example.com");
    await page.getByLabel("Contraseña").fill("incorrecta");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    await expect(page.getByText("no existe")).toHaveCount(0);
  });

  test("muestra y oculta la contraseña", async ({ page }) => {
    await page.goto("/login");
    const input = page.getByLabel("Contraseña");
    await expect(input).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar" }).click();
    await expect(input).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Ocultar" }).click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("el segundo uso del enlace mágico no entra", async ({ page }) => {
    await page.goto("/login/magic?error=invalid");
    await expect(page.getByText("El enlace no es válido.")).toBeVisible();
  });

  test("restablecer exige 8 caracteres", async ({ page }) => {
    await page.goto("/reset/token-de-prueba");
    await page.getByLabel("Contraseña nueva").fill("corta");
    await page.getByLabel("Confirmar contraseña").fill("corta");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("al menos 8 caracteres")).toBeVisible();
  });

  test("el staff sin la función no se guarda", async ({ page }) => {
    await page.goto("/admin/settings/team");
    await expect(page.getByRole("heading", { name: "Roles, permisos y accesos" })).toBeVisible();
  });
});
