import { GoogleAuth } from 'google-auth-library';
import { firebaseAuth } from '../config/firebase';
import { env } from '../config/env';

const PROVIDER_IDS = ['google.com', 'apple.com', 'facebook.com'] as const;

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

function getProviderConfigs() {
  return {
    'google.com': env.oauth.google,
    'apple.com': env.oauth.apple,
    'facebook.com': env.oauth.facebook,
  } as Record<string, { clientId: string; clientSecret: string }>;
}

async function configureOAuthProviders(ipTenantId: string): Promise<void> {
  const token = await auth.getAccessToken();
  const baseUrl = `https://identitytoolkit.googleapis.com/v2/projects/${env.firebase.projectId}/tenants/${ipTenantId}/defaultSupportedIdpConfigs`;
  const providerConfigs = getProviderConfigs();

  for (const providerId of PROVIDER_IDS) {
    const config = providerConfigs[providerId];
    const response = await fetch(`${baseUrl}?idpId=${providerId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `projects/${env.firebase.projectId}/tenants/${ipTenantId}/defaultSupportedIdpConfigs/${providerId}`,
        enabled: true,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to configure ${providerId}: ${JSON.stringify(error)}`);
    }
  }
}

export async function createIdentityPlatformTenant(displayName: string): Promise<string> {
  const tenant = await firebaseAuth.tenantManager().createTenant({
    displayName,
    emailSignInConfig: { enabled: true, passwordRequired: true },
  });

  try {
    await configureOAuthProviders(tenant.tenantId);
  } catch (error) {
    await firebaseAuth.tenantManager().deleteTenant(tenant.tenantId).catch(() => {});
    throw error;
  }

  return tenant.tenantId;
}

export async function deleteIdentityPlatformTenant(ipTenantId: string): Promise<void> {
  await firebaseAuth.tenantManager().deleteTenant(ipTenantId);
}
