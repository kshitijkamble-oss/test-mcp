import { Injectable } from '@nestjs/common';

interface TokenCache {
  access_token: string;
  expires_at: number;
}

@Injectable()
export class ApsService {
  private cache: TokenCache | null = null;

  async getToken(): Promise<{ access_token: string; expires_in: number } | { mock: true }> {
    const clientId = process.env.APS_CLIENT_ID;
    const clientSecret = process.env.APS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { mock: true };
    }

    if (this.cache && Date.now() < this.cache.expires_at) {
      const remaining = Math.floor((this.cache.expires_at - Date.now()) / 1000);
      return { access_token: this.cache.access_token, expires_in: remaining };
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'data:read viewables:read',
    });

    const res = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: body.toString(),
    });

    if (!res.ok) {
      throw new Error(`APS token request failed: ${res.status}`);
    }

    const data = await res.json() as { access_token: string; expires_in: number };
    this.cache = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };

    return { access_token: data.access_token, expires_in: data.expires_in };
  }
}
