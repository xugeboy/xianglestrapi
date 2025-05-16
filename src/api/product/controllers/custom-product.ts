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
        const locale = ctx.query.locale || 'en';

        // 设置默认状态为已发布
        ctx.query.status = "published";

        // 基础查询条件
        const baseQuery: any = {};

        const allCategorySlugs = await getAllSubCategorySlugs(categorySlug,locale);
        baseQuery.category = {
          slug: {
            $in: allCategorySlugs,
          },
        };

        // 定义要分组的属性字段
        const attributeFields = [
          "width",
          "grade",
          "working_load_limit",
          "assembly_break_strength",
          "end_fitting",
        ];

        // 查询所有符合条件的产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: baseQuery,
            locale: locale
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
          locale = 'en'
        } = ctx.request.body;
        ctx.query.status = "published";

        // 构建查询条件
        const filters: any = {};

        const allCategorySlugs = await getAllSubCategorySlugs(categorySlug,locale);
        filters.category = {
          slug: {
            $in: allCategorySlugs,
          },
        };

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
            fields: ["id", "name", "slug", "about", "code"],
            filters,
            populate: ["category", "featured_image"],
            sort: { createdAt: "desc" },
            start,
            limit,
            locale: locale
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
        const locale = ctx.query.locale || 'en';
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
              "seo_title",
              "seo_description",
              "publishedAt",
              "updatedAt",
            ],
            populate: {
              featured_image: { fields: ["url"] },
              gallery: { fields: ["url","name","width","height"] },
              category: { fields: ["id", "name", "slug"] },
              related_products: {
                fields: ["id", "name", "slug", "code"],
                populate: {
                  featured_image: { fields: ["url"] },
                },
              },
              related_blogs: { fields: ["id", "title", "slug"] },
              alternating_content: {
                fields: ["title", "Text"],
                populate: {
                  Image: { fields: ["url"] },
                },
              },
              localizations: {
                fields: ["slug", "locale"]
              }
            },
            locale: locale
          }
        );

        if (!products || products.length === 0) {
          return ctx.notFound("Product not found");
        }

      const mainProduct = products[0];
      const allLanguageSlugs: { [urlPrefix: string]: string } = {};

      if (mainProduct.slug) {
        // @ts-ignore
        allLanguageSlugs[locale] = mainProduct.slug;
      }

      // @ts-ignore
      if (mainProduct.localizations && Array.isArray(mainProduct.localizations)) {
        // @ts-ignore
        mainProduct.localizations.forEach(localization => {
          if (localization.slug && localization.locale) {
            const urlPrefixForLocalization = mapStrapiLocaleToUrlPrefix(localization.locale);
            if (urlPrefixForLocalization) {
              allLanguageSlugs[urlPrefixForLocalization] = localization.slug;
            }
          }
        });
      }

      const responseData = {
        ...mainProduct,
        allLanguageSlugs: allLanguageSlugs,
      };

        return { data: responseData };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async getCorrectProductSlugForLocale(ctx: any) {
      try {
        const { slug: inputSlug } = ctx.params as { slug: string }; 
        const locale = ctx.query.locale;
        const previousLocale = ctx.query.previousLocale;
        
        if (!inputSlug) {
          return ctx.badRequest("Input slug is required");
        }
  
        const productsWithAnySlug = await strapi.entityService.findMany("api::product.product", {
          filters: { slug: inputSlug },
          fields: ["id", "locale", "slug"],
          populate: { 
            localizations: { 
              fields: ['id', 'locale', 'slug'] 
            } 
          },
          locale: previousLocale
        });
  
        if (!productsWithAnySlug || productsWithAnySlug.length === 0) {
          return ctx.notFound("Entity not found with the given slug in any language.");
        }
        
        const anchorProduct = productsWithAnySlug[0];
  
        let correctSlugForTargetLocale: string | undefined = undefined;
  
        if (anchorProduct.locale === locale) {
          correctSlugForTargetLocale = anchorProduct.slug;
          //@ts-ignore
        } else if (anchorProduct.localizations && Array.isArray(anchorProduct.localizations)) {
          //@ts-ignore
          const targetLocalization = anchorProduct.localizations.find(
            (loc: any) => loc.locale === locale
          );
          if (targetLocalization && targetLocalization.slug) {
            correctSlugForTargetLocale = targetLocalization.slug;
          }
        }
  
        if (correctSlugForTargetLocale) {
          return {
            data: correctSlugForTargetLocale,
          };
        } else {
          return ctx.notFound(`Slug for locale prefix '${locale}' not found for this product.`);
        }
  
      } catch (error: any) {
        console.error("Error in getCorrectSlugForLocale:", error);
        return ctx.internalServerError(error.message || "Internal server error");
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
        const locale = ctx.query.locale || 'en';
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
            fields: ["id", "name", "slug", "about", "code"],
            populate: {
              featured_image: { fields: ["url"] },
              gallery: { fields: ["url"] },
              category: { fields: ["id", "name", "slug"] },
            },
            locale: locale
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
        const locale = ctx.query.locale || 'en';

        // 查询产品
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            fields: ["slug","updatedAt","publishedAt"],
            locale: locale
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
        const { page = 1, pageSize = 12, sort = "createdAt:desc", locale = "en" } = ctx.query;
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
            locale: locale
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
            fields: ["id", "name", "slug", "about", "code"],
            populate: ["featured_image"],
            sort: sort,
            start: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            locale: locale
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
        const locale = ctx.query.locale || 'en';
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            filters: {
              slug: slug,
            },
            fields: [
              "slug",
              "name",
              "code",
            ],
            populate: { featured_image: { fields: ["url"] } },
            locale: locale
          }
        );
        return { data: products[0] };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async createProductFromJson(ctx) {
      try {
        const body = ctx.request.body;
    
        if (!body || typeof body !== 'object') {
          return ctx.badRequest('Invalid or empty JSON payload.');
        }
    
        const { code, ...localizedFields } = body;
    
        if (!code) {
          return ctx.badRequest('Missing required field: code');
        }
    
        const locales = Object.keys(localizedFields);
    
        // Create localized entries per locale
        const createdProductIds = [];
        for (let i = 0; i < locales.length; i++) {
          const locale = locales[i];
          const localeData = localizedFields[locale];
    
          // On first iteration, create the base entry
          const createdProduct = await strapi.db.query('api::product.product').create({
            data: {
              ...localeData,
              code,
              locale,
            }
          });
          createdProductIds.push(createdProduct.id);
        }
    
        ctx.send({ message: 'Products created successfully', ids: createdProductIds });
      } catch (error) {
        console.error('Error creating product:', error);
        ctx.internalServerError('Error creating product');
      }
    }
  })
);

async function getAllSubCategorySlugs(slug: string, locale: unknown): Promise<string[]> {
  const result: string[] = [slug];

  async function recurse(currentSlug: string) {
    const children = await strapi.entityService.findMany(
      "api::product-category.product-category",
      {
        filters: {
          parent: {
            slug: currentSlug,
          },
        },
        fields: ["slug"],
        locale: locale
      }
    );

    for (const child of children) {
      result.push(child.slug);
      await recurse(child.slug);
    }
  }

  await recurse(slug);

  return result;
}

function mapStrapiLocaleToUrlPrefix(strapiLocale: string): string | undefined {
  const mapping: { [strapiCode: string]: string } = {
    "en": "en",
    "en-AU": "au",      
    "en-CA": "ca",
    "en-GB": "uk",
    "de-DE": "de",      
    "fr-FR": "fr",
    "es-ES": "es",
  };
  return mapping[strapiLocale];
}
function mapUrlPrefixToStrapiLocale(urlPrefix: string | undefined | null): string | undefined {
  if (!urlPrefix) {
    return undefined;
  }

  const mapping: { [key: string]: string } = {
    "en": "en",     
    "au": "en-AU",
    "ca": "en-CA",
    "uk": "en-GB",
    "de": "de-DE",
    "fr": "fr-FR", 
    "es": "es-ES",
  };

  return mapping[urlPrefix.toLowerCase()] || urlPrefix;
}