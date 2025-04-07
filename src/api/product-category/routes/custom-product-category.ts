/**
 * custom product-category router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/getAllCategories',
      handler: 'custom-product-category.getAllCategories',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/getCategoryBySlug/:slug',
      handler: 'custom-product-category.getCategoryBySlug',
      config: {
        auth: false,
      },
    },
  ],
}; 