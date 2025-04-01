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
  ],
}; 