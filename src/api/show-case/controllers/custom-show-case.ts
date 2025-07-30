/**
 * Custom show-case controller for advanced queries
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

export default factories.createCoreController(
  "api::show-case.show-case",
  ({ strapi }) => ({
    async getShowCase(ctx: Context) {
      try {
        const {
          page = 1,
          pageSize = 10,
          locale = "en",
        } = ctx.request.body;
        ctx.query.status = "published";

        // 构建查询条件
        const filters: any = {};

        // 计算分页参数
        const start = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::show-case.show-case",
          {
            fields: ["id","description"],
            populate: {
              image: { fields: ["url","alternativeText"] },
              gallery: { fields: ["url","alternativeText"] },
            },
            sort: { createdAt: "desc" },
            start,
            limit,
            locale: locale,
          }
        );

        // 获取符合条件的总数
        const total = await strapi.documents("api::show-case.show-case").count({
          filters: {
            ...filters,
            locale: locale,
          },
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
        ctx.throw(500, "Error fetching showcases", { error });
      }
    }
  })
)