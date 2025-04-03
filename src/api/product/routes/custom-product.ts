/**
 * Custom product routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/getAttributeFiltersByCategorySlug',
      handler: 'custom-product.getAttributeFiltersByCategorySlug',
      config: {
        auth: false,
        params: {
          categorySlug: { type: 'string' },
        }
      },
    },
    {
      method: 'POST',
      path: '/filterProducts',
      handler: 'custom-product.filterProducts',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/getProductBySlug',
      handler: 'custom-product.getProductBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/searchProducts',
      handler: 'custom-product.searchProducts',
      config: {
        auth: false,
      },
    },
  ],
}; 