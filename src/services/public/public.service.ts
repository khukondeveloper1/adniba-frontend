import publicAxios from "@/lib/axios/public";
import type { ApiResponse, GlobalNetwork, StaticPage, ApiDoc } from "@/types";

// ─────────────────────────────────────────────────────────────────
// PUBLIC SERVICE
// Module 1: /api/v1/public/*  — No authentication required
// ─────────────────────────────────────────────────────────────────

export const publicService = {
  /**
   * GET /public/networks
   * Returns globally active ad networks for landing page display
   */
  getNetworks: async (): Promise<GlobalNetwork[]> => {
    const res = await publicAxios.get<ApiResponse<GlobalNetwork[]>>(
      "/public/networks",
    );
    return res.data.data;
  },

  /**
   * GET /public/pages
   * Returns all published static pages (about, privacy, terms, contact)
   */
  getPages: async (): Promise<StaticPage[]> => {
    const res = await publicAxios.get<ApiResponse<StaticPage[]>>(
      "/public/pages",
    );
    return res.data.data;
  },

  /**
   * GET /public/pages/{key}
   * Returns a single static page by key
   */
  getPage: async (key: string): Promise<StaticPage> => {
    const res = await publicAxios.get<ApiResponse<StaticPage>>(
      `/public/pages/${key}`,
    );
    return res.data.data;
  },

  /**
   * GET /public/api-docs
   * Returns all published API documentation entries
   * Optional query param: ?category=authentication
   */
  getApiDocs: async (category?: string): Promise<ApiDoc[]> => {
    const res = await publicAxios.get<ApiResponse<ApiDoc[]>>(
      "/public/api-docs",
      { params: category ? { category } : undefined },
    );
    return res.data.data;
  },
};
