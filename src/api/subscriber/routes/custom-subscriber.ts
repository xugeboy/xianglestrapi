/**
 * custom product-category router
 */

export default {
  routes: [
    {
      "method": "POST",
      "path": "/submitSubscribe",
      "handler": "subscriber.submitSubscribe",
      "config": {
        "policies": []
      }
    }
  ]
}; 