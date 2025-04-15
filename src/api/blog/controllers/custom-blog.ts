/**
 * Custom blog controller for advanced queries
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::blog.blog",
  ({ strapi }) => ({
    async getBlogList(ctx) {
      try {
        // 获取请求体参数（POST 请求用 ctx.request.body）
        const {
          page = 1,
          pageSize = 12,
        } = ctx.request.body;
        ctx.query.status = "published";

        // 计算分页参数
        const start = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        // 查询产品
        const blogs = await strapi.entityService.findMany(
          "api::blog.blog",
          {
            fields: ["id", "title", "slug", "excerpt"],
            populate: {
              cover_image: { fields: ["url"] }
            },
            sort: { createdAt: "desc" },
            start,
            limit,
          }
        );

        // 获取符合条件的总数
        const total = await strapi.entityService.count("api::product.product");

        return ctx.send({
          data: blogs,
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
        ctx.throw(500, "Error fetching filtered blogs", { error });
      }
    },
    async getBlogDetail(ctx) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 查询产品
        const blogs = await strapi.entityService.findMany(
          "api::blog.blog",
          {
            filters: {
              slug: slug,
            },
            fields: [
              "id",
              "title",
              "slug",
              "content",
            ],
            populate: {
              cover_image: { fields: ["url"] }
            },
          }
        );

        if (!blogs || blogs.length === 0) {
          return ctx.notFound("Blog not found");
        }

        return { data: blogs[0] };
      } catch (error) {
        ctx.throw(500, error);
      }
    }
  })
);
