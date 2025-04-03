/**
 * custom product-category router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/product-categories/all',
      handler: 'custom-product-category.getAllCategories',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/product-categories/slug/:slug',
      handler: 'custom-product-category.getCategoryBySlug',
      config: {
        auth: false,
        params: {
          slug: { type: 'string' },
        },
      },
    },
  ],
}; 