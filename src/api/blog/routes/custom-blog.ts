/**
 * custom product-category router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/getBlogList",
      handler: "custom-blog.getBlogList",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/getAllBlogSlug",
      handler: "custom-blog.getAllBlogSlug",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/getBlogDetail/:slug",
      handler: "custom-blog.getBlogDetail",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/getBlogMetaDataBySlug/:slug",
      handler: "custom-blog.getBlogMetaDataBySlug",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/getLatestArticles",
      handler: "custom-blog.getLatestArticles",
      config: {
        auth: false,
      },
    }
  ]
}; 