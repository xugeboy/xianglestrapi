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
    async getAttributeFilters(ctx: Context) {
      try {
        const { categoryId } = ctx.query;

        // 设置默认状态为已发布
        ctx.query.status = ctx.query.status || "published";

        // 基础查询条件
        const baseQuery: any = {};

        // 如果提供了分类ID，添加到查询条件
        if (categoryId) {
          baseQuery.category = categoryId;
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
          "fixed_end_length",
          "ratchet_handle",
          "product_weight",
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
        // 设置默认状态为已发布
        ctx.query.status = ctx.query.status || "published";

        const {
          categoryId,
          page = 1,
          pageSize = 10,
          ...attributeFilters
        } = ctx.query;

        // 构建查询条件
        const filters: any = {};

        // 添加分类筛选条件
        if (categoryId) {
          filters.category = categoryId;
        }

        // 添加属性筛选条件
        Object.keys(attributeFilters).forEach((key) => {
          // 跳过分页和status参数
          if (
            attributeFilters[key] &&
            key !== "page" &&
            key !== "pageSize" &&
            key !== "status"
          ) {
            filters[key] = attributeFilters[key];
          }
        });

        // 分页参数
        const start = ((Number(page) || 1) - 1) * (Number(pageSize) || 10);
        const limit = Number(pageSize) || 10;

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters,
            populate: ["category", "featured_image", "gallery"],
            sort: { createdAt: "desc" },
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
