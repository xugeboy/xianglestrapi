/**
 * Custom blog controller for advanced queries
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::blog.blog",
  ({ strapi }) => ({
    async getBlogList(ctx: Context) {
      try {
        // 获取 GET 请求的查询参数
        const { pageNumber = 1 } = ctx.query;
        ctx.query.status = "published";
        const locale = ctx.query.locale || 'en';

        // 计算分页参数
        const start = (Number(pageNumber) - 1) * 12;
        const limit = 12;

        // 查询产品
        const blogs = await strapi.entityService.findMany("api::blog.blog", {
          fields: ["id", "title", "slug", "excerpt", "createdAt"],
          populate: {
            cover_image: { fields: ["url"] },
          },
          sort: { createdAt: "desc" },
          start,
          limit,
          locale:locale
        });

        // 获取符合条件的总数
        const total = await strapi.entityService.count("api::blog.blog");

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
    async getBlogDetail(ctx: Context) {
      try {
        const { slug } = ctx.params;
        const locale = ctx.query.locale || 'en';
        if (!slug) {
          return ctx.badRequest("Slug is required");
        }

        ctx.query.status = "published";
        const blogs = await strapi.entityService.findMany("api::blog.blog", {
          filters: {
            slug: slug,
          },
          fields: [
            "id",
            "title",
            "slug",
            "content",
            "seo_title",
            "seo_description",
            "publishedAt",
            "updatedAt",
            "createdAt",
          ],
          populate: {
            cover_image: { fields: ["url"] },
            blogs: { fields: ["title", "slug"] },
          },
          locale:locale
        });

        if (!blogs || blogs.length === 0) {
          return ctx.notFound("Blog not found");
        }

        return { data: blogs[0] };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async getAllBlogSlug(ctx: Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";
        const locale = ctx.query.locale || 'en';
        const blogs = await strapi.entityService.findMany("api::blog.blog", {
          fields: ["slug","updatedAt","publishedAt"],
          locale:locale
        });
        return {
          data: blogs,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async getBlogMetaDataBySlug(ctx: Context) {
      try {
        const { slug } = ctx.params;
        const locale = ctx.query.locale || 'en';
        if (!slug) {
          return ctx.badRequest("Slug is required");
        }
        // 设置默认状态为已发布
        ctx.query.status = "published";
        const blogs = await strapi.entityService.findMany("api::blog.blog", {
          filters: {
            slug: slug,
          },
          fields: [
            "slug",
            "excerpt",
            "seo_title",
            "seo_description",
            "publishedAt",
            "updatedAt",
            "createdAt",
          ],
          locale:locale,
          populate: { cover_image: { fields: ["url"] } },
        });

        return { data: blogs[0] };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async getLatestArticles(ctx: Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";
        const locale = ctx.query.locale || 'en';
        const latestBlogs = await strapi.entityService.findMany(
          "api::blog.blog",
          {
            fields: ["slug", "title", "excerpt", "seo_title", "createdAt"],
            populate: { cover_image: { fields: ["url"] } },
            sort: { createdAt: "desc" },
            locale: locale,
            limit: 3,
          }
        );

        return { data: latestBlogs };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
