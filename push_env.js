import { execSync } from 'child_process';

const pushEnv = (key, value) => {
  if (!value) return;
  console.log(`Pushing ${key}...`);
  try {
    execSync(`npx --yes vercel env add ${key} production`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`Successfully pushed ${key}`);
  } catch (err) {
    console.error(`Error pushing ${key}:`, err.message);
  }
};

pushEnv('VITE_API_URL', 'https://cancalcultorbackend.vercel.app/api');
