/**
 * Custom product controller for advanced queries
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    /**
     * 获取产品属性分组数据，用于筛选
     *
     * @param {Context} ctx - Koa context
     */
    async getAttributeFiltersByCategorySlug(ctx: Context) {
      try {
        const { categorySlug } = ctx.params;

        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 基础查询条件
        const baseQuery: any = {};

        // 如果提供了分类Slug，添加到查询条件
        if (categorySlug) {
          baseQuery.category = {
            slug: categorySlug,
          };
        }

        // 定义要分组的属性字段
        const attributeFields = [
          "length",
          "width",
          "material",
          "finish",
          "grade",
          "working_load_limit",
          "assembly_break_strength",
          "webbing_break_strength",
          "end_fitting",
          "ratchet_handle",
        ];

        // 查询所有符合条件的产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: baseQuery,
          }
        );

        // 处理属性分组数据
        const attributeFilters: Record<string, Record<string, number>> = {};

        // 为每个属性字段创建分组数据
        attributeFields.forEach((field) => {
          const values: Record<string, number> = {};

          // 统计每个属性值的产品数量
          products.forEach((product: any) => {
            if (product[field]) {
              values[product[field]] = (values[product[field]] || 0) + 1;
            }
          });

          // 只保留有值的属性字段
          if (Object.keys(values).length > 0) {
            attributeFilters[field] = values;
          }
        });

        return attributeFilters;
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    /**
     * 根据属性筛选产品
     *
     * @param {Context} ctx - Koa context
     */
    async filterProducts(ctx: Context) {
      try {
        // 获取请求体参数（POST 请求用 ctx.request.body）
        const {
          categorySlug,
          page = 1,
          pageSize = 10,
          attributeFilters = {}, // 允许空对象
        } = ctx.request.body;
        ctx.query.status = "published";

        // 构建查询条件
        const filters: any = {};

        // 添加分类筛选条件
        if (categorySlug) {
          filters.category = { slug: categorySlug };
        }

        // 添加属性筛选条件
        Object.keys(attributeFilters).forEach((key) => {
          if (attributeFilters[key]) {
            filters[key] = attributeFilters[key];
          }
        });

        // 计算分页参数
        const start = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            fields: ["id", "name", "slug", "code"],
            filters,
            populate: ["category", "featured_image"],
            sort: { createdAt: "desc" },
            start,
            limit,
          }
        );

        // 获取符合条件的总数
        const total = await strapi.entityService.count("api::product.product", {
          filters,
        });

        return ctx.send({
          data: products,
          meta: {
            pagination: {
              page: Number(page),
              pageSize: limit,
              pageCount: Math.ceil(total / limit),
              total,
            },
          },
        });
      } catch (error) {
        ctx.throw(500, "Error fetching filtered products", { error });
      }
    },

    /**
     * 根据产品slug获取完整产品信息
     *
     * @param {Context} ctx - Koa context
     */
    async getProductBySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: {
              slug: slug,
            },
            fields: [
              "id",
              "name",
              "slug",
              "code",
              "about",
              "see_more",
              "youtube_url",
              "assembly_break_strength",
              "length",
              "fixed_end_length",
              "end_fitting",
              "width",
              "working_load_limit",
              "material",
              "webbing_break_strength",
              "grade",
              "ratchet_handle",
              "finish",
              "product_weight",
            ],
            populate: {
              featured_image: { fields: ["url"] },
              gallery: { fields: ["url"] },
              category: { fields: ["id", "name", "slug"] },
              related_products: {
                fields: ["id", "name", "slug", "code"],
                populate: {
                  featured_image: { fields: ["url"] },
                },
              },
              related_blogs: { fields: ["id", "title", "slug"] },
            },
          }
        );

        if (!products || products.length === 0) {
          return ctx.notFound("Product not found");
        }

        return { data: products[0] };
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    /**
     * 搜索产品
     *
     * @param {Context} ctx - Koa context
     */
    async searchProducts(ctx: Context) {
      try {
        const { query } = ctx.params;
        if (!query || typeof query !== "string") {
          return ctx.badRequest("Search query is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: {
              name: {
                $containsi: query,
              },
            },
            fields: ["id", "name", "slug", "code"],
            populate: {
              featured_image: { fields: ["url"] },
              gallery: { fields: ["url"] },
              category: { fields: ["id", "name", "slug"] },
            },
          }
        );

        return {
          data: products,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    /**
     * 搜索产品
     *
     * @param {Context} ctx - Koa context
     */
    async getAllProductSlug(ctx: Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            fields: ["slug"],
          }
        );
        return {
          data: products,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    /**
     * 分页获取当前分类下的产品列表
     *
     * @param {Context} ctx - Koa context
     */
    async getProductsByCategorySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        const { page = 1, pageSize = 12, sort = "createdAt:desc" } = ctx.query;
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        // 构建查询条件
        const filters: any = {
          category: {
            slug: slug,
          },
        };

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

        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: filters,
            fields: ["id", "name", "slug", "code"],
            populate: ["featured_image"],
            sort: sort,
            start: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
          }
        );
        const total = await strapi.entityService.count("api::product.product", {
          filters: { category: { slug: slug } },
        });
        return ctx.send({
          data: products,
          meta: {
            pagination: { total, page, pageSize },
          },
        });
      } catch (error) {
        ctx.throw(500, error);
      }
    } /**
     * 根据slug获取产品SEO_METADATA
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Object}>} 返回分类详情数据
     */,
    async getProductMetaDataBySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";
        const product = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: {
              slug: slug,
            },
            fields: ["seo_title", "seo_description"],
          }
        );
        return {
          data: product,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
