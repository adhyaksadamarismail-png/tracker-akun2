import { defaultMenuList } from '../data/defaultMenu';

export interface MenuItem {
  id: string | number;
  code?: string;
  name: string;
  category: string;
  origPrice: number;
  salePrice?: number;
  jasdorPrice?: number;
  img?: string;
  isSoldOut?: boolean;
  isNew?: boolean;
  isDiscount?: boolean;
  discountPct?: number;
}

export interface MenuApiResponse {
  menu: MenuItem[];
  total?: number;
  storeCode?: string;
  isPremium?: boolean;
  americanoPrice?: number;
  isClosed?: boolean;
}

/**
 * Fetch menu list from API endpoint:
 * GET /api/menu?outletCode={outletCode}
 * 
 * Uses process.env.NEXT_PUBLIC_API_BASE as base URL, falling back to default menu dataset.
 */
export async function getMenu(outletCode?: string): Promise<MenuItem[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
    const query = outletCode ? `?outletCode=${encodeURIComponent(outletCode)}` : '';
    const url = `${apiBase}/api/menu${query}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`API menu status ${response.status}. Using default menu dataset.`);
      return defaultMenuList;
    }

    const data = await response.json();

    let items: MenuItem[] = [];
    if (Array.isArray(data)) {
      items = data as MenuItem[];
    } else if (data) {
      if (Array.isArray((data as { menu?: MenuItem[] }).menu)) {
        items = (data as { menu: MenuItem[] }).menu;
      } else if (Array.isArray((data as { data?: MenuItem[] }).data)) {
        items = (data as { data: MenuItem[] }).data;
      } else if (Array.isArray((data as { result?: MenuItem[] }).result)) {
        items = (data as { result: MenuItem[] }).result;
      }
    }

    return items.length > 0 ? items : defaultMenuList;
  } catch (err) {
    console.warn('Network error fetching menu API. Using default menu dataset.', err);
    return defaultMenuList;
  }
}
