/**
 * Custom product routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/getAttributeFiltersByCategorySlug/:slug',
      handler: 'custom-product.getAttributeFiltersByCategorySlug',
      config: {
        auth: false,
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
      handler: 'custom-product.getProductBySlug/:slug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/searchProducts',
      handler: 'custom-product.searchProducts/:slug',
      config: {
        auth: false,
      },
    },
  ],
}; 