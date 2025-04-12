/**
 * custom product-category router
 */

export default {
  routes: [
    {
      "method": "POST",
      "path": "/submitInquiry",
      "handler": "inquiry.submitInquiry",
      "config": {
        "policies": []
      }
    }
  ]
}; 