/**
 * custom product-category router
 */

export default {
  routes: [
    {
      "method": "POST",
      "path": "/submitSubscribe",
      "handler": "custom-subscriber.submitSubscribe",
      "config": {
        "policies": []
      }
    }
  ]
}; 