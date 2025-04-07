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
      path: '/getCategoryDetailsBySlug/:slug',
      handler: 'custom-product-category.getCategoryDetailsBySlug',
      config: {
        auth: false,
      },
    },{
        method: 'GET',
        path: '/getCategoryMetaDataBySlug/:slug',
        handler: 'custom-product-category.getCategoryMetaDataBySlug',
        config: {
          auth: false,
        },
    },
  ],
}; 