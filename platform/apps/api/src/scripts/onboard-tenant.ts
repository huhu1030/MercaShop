import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { onboardTenant, parseOnboardTenantInput, validateOnboardTenantInput } from '../services/onboardingService';

function getConfigPath(argv: string[]): string {
  const configFlagIndex = argv.indexOf('--config');
  if (configFlagIndex === -1 || !argv[configFlagIndex + 1]) {
    throw new Error('Missing required --config argument.');
  }

  return argv[configFlagIndex + 1];
}

function printErrorDetails(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n  Error: ${message}`);
}

async function main(): Promise<void> {
  const configPath = getConfigPath(process.argv.slice(2));
  const rawConfig = await readFile(configPath, 'utf-8').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') {
      throw new Error(`Config file not found: ${configPath}`);
    }

    throw error;
  });

  let config: unknown;
  try {
    config = JSON.parse(rawConfig);
  } catch (error) {
    throw new Error(`Invalid JSON in config file: ${configPath}\n${String(error)}`);
  }

  const input = parseOnboardTenantInput(config);

  const uri = `${env.databaseUrl}/${env.databaseName}`;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  try {
    await validateOnboardTenantInput(input);

    console.log(`\nOnboarding tenant "${input.tenant.name}"...\n`);

    const result = await onboardTenant(input, {
      stepStarted(stepNumber, totalSteps, label) {
        process.stdout.write(`[${stepNumber}/${totalSteps}] ${label}... `);
      },
      stepSucceeded(_step, details) {
        console.log(`done${details ? ` (${details})` : ''}`);
      },
      stepFailed(_step, error) {
        console.log('FAILED');
        printErrorDetails(error);
      },
      rollbackStarted() {
        console.log('\nRolling back...');
      },
      rollbackStepStarted(_step, label) {
        process.stdout.write(`  ${label}... `);
      },
      rollbackStepSucceeded() {
        console.log('done');
      },
      rollbackStepFailed(_step, error) {
        console.log('FAILED');
        printErrorDetails(error);
      },
    });

    console.log('\nTenant onboarded successfully!\n');
    console.log(`  Tenant:        ${result.tenant.name} (slug: ${result.tenant.slug})`);
    console.log(`  IP Tenant ID:  ${result.ipTenantId}`);
    console.log(`  Domains:       ${result.tenant.domains.join(', ')}`);
    console.log(`  Admin email:   ${result.adminUser.email}`);
    console.log(`  Admin UID:     ${result.firebaseUid}`);
    console.log('\nThe admin should reset their password on first login.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  printErrorDetails(error);
  console.error('\nOnboarding failed. No resources were left behind.');
  process.exit(1);
});
