/**
 * Custom product routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/getAttributeFiltersByCategorySlug/:categorySlug',
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
      path: '/getProductBySlug/:slug',
      handler: 'custom-product.getProductBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/searchProducts/:query',
      handler: 'custom-product.searchProducts',
      config: {
        auth: false,
      },
    },{
        method: 'GET',
        path: '/getProductsByCategorySlug/:slug',
        handler: 'custom-product.getProductsByCategorySlug',
        config: {
          auth: false,
        },
    },{
        method: 'GET',
        path: '/getAllProductSlug',
        handler: 'custom-product.getAllProductSlug',
        config: {
          auth: false,
        },
    },{
        method: 'GET',
        path: '/getProductMetaDataBySlug/:slug',
        handler: 'custom-product-category.getProductMetaDataBySlug',
        config: {
          auth: false,
        },
    },
  ],
}; 