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
      path: "/getBlogDetail",
      handler: "custom-blog.getBlogDetail",
      config: {
        auth: false,
      },
    }
  ]
}; 