import { Client } from '@microsoft/microsoft-graph-client';

export interface SafeQueryResult<T> {
  data: T | null;
  errorStatus?: number;
  licenseMissing: boolean;
  permissionMissing?: boolean;
  errorMessage?: string;
}

/**
 * Safe Graph API query runner per specification section 4.
 * Catches 403 / Non-Premium tenant errors to avoid false score penalties,
 * while accurately distinguishing license errors from permission errors.
 */
export async function safeGraphQuery<T>(
  queryFn: () => Promise<T>
): Promise<SafeQueryResult<T>> {
  try {
    const data = await queryFn();
    return { data, licenseMissing: false, permissionMissing: false };
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status;
    const errorCode = error?.code || error?.error?.code;
    const errMsg = typeof error?.message === 'string' ? error.message : '';

    const isLicenseError =
      errorCode === 'Authentication_RequestFromNonPremiumTenantOrB2CTenant' ||
      errMsg.toLowerCase().includes('non-premium') ||
      errMsg.toLowerCase().includes('license requirement') ||
      errMsg.toLowerCase().includes('subscribed sku');

    if (isLicenseError) {
      return {
        data: null,
        errorStatus: 403,
        licenseMissing: true,
        permissionMissing: false,
        errorMessage: 'Kontrollen kräver en högre Microsoft-licensnivå (t.ex. Entra ID P1/P2).',
      };
    }

    const isPermissionError =
      statusCode === 403 ||
      errorCode === 'Authorization_RequestDenied' ||
      errorCode === 'Forbidden';

    if (isPermissionError) {
      return {
        data: null,
        errorStatus: 403,
        licenseMissing: false,
        permissionMissing: true,
        errorMessage: 'Applikationen saknar API-behörighet i Entra ID (t.ex. AuditLog.Read.All).',
      };
    }

    console.error('[GraphScanner] safeGraphQuery error:', error);
    return {
      data: null,
      errorStatus: statusCode || 500,
      licenseMissing: false,
      permissionMissing: false,
      errorMessage: errMsg || 'Ett oväntat fel uppstod vid hämtning från Microsoft Graph.',
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

