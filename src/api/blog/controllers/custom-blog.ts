/**
 * Custom blog controller for advanced queries
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::blog.blog",
  ({ strapi }) => ({
    async getBlogList(ctx:Context) {
      try {
        // 获取 GET 请求的查询参数
        const { pageNumber = 1 } = ctx.query;
        ctx.query.status = "published";

        // 计算分页参数
        const start = (Number(pageNumber) - 1) * 12;
        const limit = 12;

        // 查询产品
        const blogs = await strapi.entityService.findMany("api::blog.blog", {
          fields: ["id", "title", "slug", "excerpt"],
          populate: {
            cover_image: { fields: ["url"] },
          },
          sort: { createdAt: "desc" },
          start,
          limit,
        });

        // 获取符合条件的总数
        const total = await strapi.entityService.count("api::product.product");

        return ctx.send({
          data: blogs,
          meta: {
            pagination: {
              page: Number(pageNumber),
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
    async getBlogDetail(ctx:Context) {
      try {
        const { slug } = ctx.params;
        if (!slug) {
          return ctx.badRequest("Slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 查询产品
        const blogs = await strapi.entityService.findMany("api::blog.blog", {
          filters: {
            slug: slug,
          },
          fields: ["id", "title", "slug", "content"],
          populate: {
            cover_image: { fields: ["url"] },
          },
        });

        if (!blogs || blogs.length === 0) {
          return ctx.notFound("Blog not found");
        }

        return { data: blogs[0] };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async getAllBlogSlug(ctx:Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";
        const blogs = await strapi.entityService.findMany(
          "api::blog.blog",
          {
            fields: ["slug"],
          }
        );
        return {
          data: blogs,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
