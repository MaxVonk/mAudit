import { Client } from '@microsoft/microsoft-graph-client';
import { TenantCapabilities } from '../types';

/**
 * Standard Microsoft SKU IDs
 * Reference: https://learn.microsoft.com/en-us/entra/identity/users/licensing-service-plan-reference
 */
const SKU_MAPPINGS: Record<string, { entraP1orP2?: boolean; exchange?: boolean; sharepoint?: boolean; businessPremium?: boolean }> = {
  // Microsoft 365 Business Premium
  'cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46': { entraP1orP2: true, exchange: true, sharepoint: true, businessPremium: true },
  // Microsoft 365 E5
  '06da2d64-1f0e-4295-ab23-5c69adc5052e': { entraP1orP2: true, exchange: true, sharepoint: true },
  // Microsoft 365 E3
  '05e01dbe-be68-44a8-aa3f-2a4fe55940d0': { entraP1orP2: true, exchange: true, sharepoint: true },
  // Microsoft Entra ID P1
  'eec0eb4f-6444-437b-9bb1-aa5b459529f5': { entraP1orP2: true },
  // Microsoft Entra ID P2
  '84a661c4-e949-422a-925b-77166f4776fd': { entraP1orP2: true },
  // Microsoft 365 Business Standard
  'f2434e36-e3d6-444e-9f07-2a733747de10': { entraP1orP2: false, exchange: true, sharepoint: true },
  // Microsoft 365 Business Basic
  '3b5550b8-da6a-47c8-89fa-6336366a084f': { entraP1orP2: false, exchange: true, sharepoint: true },
  // Exchange Online Plan 1
  '4b928731-0164-4e78-8316-aa9a5b67ec2e': { exchange: true },
};

export async function detectTenantCapabilities(client: Client): Promise<TenantCapabilities> {
  try {
    const res = await client.api('/subscribedSkus').get();
    const skus = res.value || [];

    const capabilities: TenantCapabilities = {
      hasEntraP1orP2: false,
      hasExchangeOnline: false,
      hasSharePoint: false,
      hasBusinessPremium: false,
      skuList: [],
    };

    for (const sku of skus) {
      const skuId = sku.skuId?.toLowerCase();
      capabilities.skuList.push(sku.skuPartNumber || skuId);

      const mapping = SKU_MAPPINGS[skuId];
      if (mapping) {
        if (mapping.entraP1orP2) capabilities.hasEntraP1orP2 = true;
        if (mapping.exchange) capabilities.hasExchangeOnline = true;
        if (mapping.sharepoint) capabilities.hasSharePoint = true;
        if (mapping.businessPremium) capabilities.hasBusinessPremium = true;
      }

      // Check service plans inside the SKU
      if (sku.servicePlans) {
        for (const sp of sku.servicePlans) {
          const spName = sp.servicePlanName?.toUpperCase() || '';
          if (spName.includes('AAD_PREMIUM') || spName.includes('ENTRA_P')) {
            capabilities.hasEntraP1orP2 = true;
          }
          if (spName.includes('EXCHANGE_S_') || spName.includes('EXCHANGE_ENTERPRISE')) {
            capabilities.hasExchangeOnline = true;
          }
          if (spName.includes('SHAREPOINTENTERPRISE') || spName.includes('SHAREPOINTWAC')) {
            capabilities.hasSharePoint = true;
          }
        }
      }
    }

    return capabilities;
  } catch (error) {
    console.warn('[TenantCapabilities] Kunde inte läsa subscribedSkus, använder grundinställning:', error);
    return {
      hasEntraP1orP2: false,
      hasExchangeOnline: true,
      hasSharePoint: true,
      hasBusinessPremium: false,
      skuList: ['UNKNOWN'],
    };
  }
}

