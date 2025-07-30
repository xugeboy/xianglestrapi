/**
 * custom show-case router
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/getShowCase",
      handler: "custom-show-case.getShowCase",
      config: {
        auth: false,
      },
    }
  ]
}; 