/**
 * custom faq router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/getGlobalFaqs",
      handler: "custom-faq.getGlobalFaqs",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/getFaqsByProductSlug/:slug",
      handler: "custom-faq.getFaqsByProductSlug",
      config: {
        auth: false,
      },
    },
  ],
};


