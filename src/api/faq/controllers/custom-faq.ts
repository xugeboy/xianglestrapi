/**
 * Custom FAQ controller
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController("api::faq.faq", ({ strapi }) => ({
  /**
   * 获取全局 FAQ 列表（isGobal = true）
   */
  async getGlobalFaqs(ctx: Context) {
    try {
      const locale = (ctx.query.locale as string) || "en";
      // 只返回已发布内容
      // @ts-ignore
      ctx.query.status = "published";

      const faqs = await strapi.entityService.findMany("api::faq.faq", {
        filters: {
          isGobal: true,
        },
        sort: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        locale,
      });

      return { data: faqs };
    } catch (error) {
      ctx.throw(500, error as any);
    }
  },

  /**
   * 根据产品 slug 获取该产品关联的 FAQ（isGobal = false 且关联到该产品）
   */
  async getFaqsByProductSlug(ctx: Context) {
    try {
      const { slug } = ctx.params as { slug: string };
      const locale = (ctx.query.locale as string) || "en";
      if (!slug) {
        return ctx.badRequest("Product slug is required");
      }

      // 只返回已发布内容
      // @ts-ignore
      ctx.query.status = "published";

      const faqs = await strapi.entityService.findMany("api::faq.faq", {
        filters: {
          isGobal: false,
          product: {
            slug,
          },
        },
        sort: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        locale,
      });

      return { data: faqs };
    } catch (error) {
      ctx.throw(500, error as any);
    }
  },
}));


