/**
 * custom product-category router
 */

export default {
  routes: [
    {
      method: "get",
      path: "/getBlogList",
      handler: "custom-blog.getBlogList",
      config: {
        auth: false,
      },
    },
    {
      method: "get",
      path: "/getBlogDetail",
      handler: "custom-blog.getBlogDetail",
      config: {
        auth: false,
      },
    }
  ]
}; 