import { Client } from '@microsoft/microsoft-graph-client';

export interface SafeQueryResult<T> {
  data: T | null;
  errorStatus?: number;
  licenseMissing: boolean;
  errorMessage?: string;
}

/**
 * Safe Graph API query runner per specification section 4.
 * Catches 403 / Non-Premium tenant errors to avoid false score penalties.
 */
export async function safeGraphQuery<T>(
  queryFn: () => Promise<T>
): Promise<SafeQueryResult<T>> {
  try {
    const data = await queryFn();
    return { data, licenseMissing: false };
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status;
    const errorCode = error?.code || error?.error?.code;

    if (
      statusCode === 403 ||
      errorCode === 'Authentication_RequestFromNonPremiumTenantOrB2CTenant' ||
      errorCode === 'Forbidden' ||
      error?.message?.includes('license')
    ) {
      return {
        data: null,
        errorStatus: 403,
        licenseMissing: true,
        errorMessage: error?.message || 'Kontrollen kräver en högre Microsoft-licensnivå (t.ex. Entra ID P1/P2).',
      };
    }

    console.error('[GraphScanner] safeGraphQuery error:', error);
    return {
      data: null,
      errorStatus: statusCode || 500,
      licenseMissing: false,
      errorMessage: error?.message || 'Ett oväntat fel uppstod vid hämtning från Microsoft Graph.',
    };
  }
}

/**
 * Creates an authenticated Microsoft Graph client using a bearer access token.
 */
export function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

