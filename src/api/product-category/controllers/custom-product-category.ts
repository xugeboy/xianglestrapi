/**
 * Custom product-category controller for advanced queries
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::product-category.product-category",
  ({ strapi }) => ({
    /**
     * 获取所有产品分类列表
     * 用于导航栏和分类列表页面展示
     * 仅返回分类的基本信息，不包含产品
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Array}>} 返回分类列表数据
     */
    async getAllCategories(ctx: Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";

        const categories = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            fields: ["id", "name", "slug", "description", "sort"],
            populate: {
              featured_image: { fields: ["url"] },
              children: { fields: ["id", "name", "slug"] },
              parent: { fields: ["id", "name", "slug"] },
            },
          }
        );

        return { data: categories };
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    /**
     * 根据分类slug获取分类详情
     * 包含该分类的基本信息
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Object}>} 返回分类详情数据
     */
    async getCategoryDetailsBySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";
        const category = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            filters: {
              slug: slug,
            },
            fields: ["id", "name", "slug", "description"],
            populate: {
              featured_image: { fields: ["url"] },
            },
          }
        );
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    /**
     * 根据分类slug获取分类SEO_METADATA
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Object}>} 返回分类详情数据
     */
    async getCategoryMetaDataBySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";
        const category = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            filters: {
              slug: slug,
            },
            fields: ["seo_title", "seo_description"],
            populate: {
              featured_image: { fields: ["url"] },
            },
          }
        );
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
