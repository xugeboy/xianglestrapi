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
        const locale = ctx.query.locale || 'en';

        const categories = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            fields: ["id", "name", "slug", "description", "sort"],
            populate: {
              featured_image: { fields: ["url"] },
              children: { fields: ["id", "name", "slug"] },
              parent: { fields: ["id", "name", "slug"] },
            },
            locale: locale
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
        const locale = ctx.query.locale || 'en';
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
            locale: locale
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
        const locale = ctx.query.locale || 'en';
        if (!slug) {
          return ctx.badRequest("Category slug is required");
        }

        // 设置默认状态为已发布
        ctx.query.status = "published";
        const categories = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            filters: {
              slug: slug,
            },
            fields: [
              "slug",
              "name",
              "seo_title",
              "seo_description",
              "publishedAt",
              "updatedAt",
            ],
            populate: { featured_image: { fields: ["url"] },
            localizations: {
              fields: ["slug", "locale"]
            } },
            locale: locale
          }
        );

        
        const mainProduct = categories[0];
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
    /**
     * 获取所有分类slug及其children
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Object}>} 返回分类详情数据
     */
    async getAllCategorySlugAndChildren(ctx: Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";
        const locale = ctx.query.locale || 'en';
        const categories = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            fields: ["slug", "name"],
            sort: { sort: "asc" },
            populate: {
              children: { fields: ["slug"] },
            },
            locale: locale
          }
        );
        return {
          data: categories,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    /**
     * 获取所有分类slug
     *
     * @param {Context} ctx - Koa context
     * @returns {Promise<{data: Object}>} 返回分类详情数据
     */
    async getAllCategorySlug(ctx: Context) {
      try {
        // 设置默认状态为已发布
        ctx.query.status = "published";
        const locale = ctx.query.locale || 'en';
        const categories = await strapi.entityService.findMany(
          "api::product-category.product-category",
          {
            fields: ["slug","updatedAt","publishedAt"],
            locale: locale
          }
        );
        return {
          data: categories,
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async getCorrectCategorySlugForLocale(ctx: any) {
      try {
        const { slug: inputSlug } = ctx.params as { slug: string }; 
        const locale = ctx.query.locale;
        
        if (!inputSlug) {
          return ctx.badRequest("Input slug is required");
        }
  
        const productsWithAnySlug = await strapi.entityService.findMany("api::product-category.product-category", {
          filters: { slug: inputSlug },
          fields: ["id", "locale", "slug"],
          populate: { 
            localizations: { 
              fields: ['id', 'locale', 'slug'] 
            } 
          },
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
  })
);
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