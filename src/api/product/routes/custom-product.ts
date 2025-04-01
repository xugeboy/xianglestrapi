/**
 * Custom product routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/products/attribute-filters',
      handler: 'custom-product.getAttributeFilters',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/filter',
      handler: 'custom-product.filterProducts',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/slug/:slug',
      handler: 'custom-product.getBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/category/:slug',
      handler: 'custom-product.getByCategorySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/featured',
      handler: 'custom-product.getFeatured',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/search',
      handler: 'custom-product.search',
      config: {
        auth: false,
      },
    },
  ],
}; 