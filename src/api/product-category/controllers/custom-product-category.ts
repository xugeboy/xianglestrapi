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
        ctx.query.status = ctx.query.status || "published";

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
     * 包含该分类的基本信息，以及该分类下的产品列表（不含产品详情）
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Object}>} 返回分类详情数据
     */
    async getCategoryBySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        const { page = 1, pageSize = 12, includeChildren = true } = ctx.query;

        // 设置默认状态为已发布
        ctx.query.status = ctx.query.status || "published";

        // 分页参数
        const start = ((Number(page) || 1) - 1) * (Number(pageSize) || 12);
        const limit = Number(pageSize) || 12;

        // 构建查询条件
        const filters: any = {
          category: {
            slug: slug,
          },
        };

        // 如果需要包含子分类的产品
        if (includeChildren === "true" || includeChildren === true) {
          // 获取所有子分类的ID
          const subCategories = await strapi.entityService.findMany(
            "api::product-category.product-category",
            {
              filters: {
                parent: {
                  slug: slug,
                },
              },
              fields: ["id", "slug"],
            }
          );

          // 如果有子分类，添加到查询条件中
          if (subCategories && subCategories.length > 0) {
            const subCategorySlugs = subCategories.map((cat: any) => cat.slug);
            filters.category = {
              slug: {
                $in: [slug, ...subCategorySlugs],
              },
            };
          }
        }

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters,
            fields: ["id", "name", "slug", "code"],
            populate: {
              featured_image: { fields: ["url"] },
              category: { fields: ["id", "name", "slug"] },
            },
            start,
            limit,
          }
        );

        // 获取符合条件的总数
        const total = await strapi.entityService.count("api::product.product", {
          filters,
        });

        return {
          data: products,
          meta: {
            pagination: {
              page: Number(page) || 1,
              pageSize: limit,
              pageCount: Math.ceil(total / limit),
              total,
            },
          },
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
