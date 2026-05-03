export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Missing required environment variable: ${name}\n` +
        `See .env.example for the expected configuration.`,
    );
    process.exit(1);
  }
  return value;
}
