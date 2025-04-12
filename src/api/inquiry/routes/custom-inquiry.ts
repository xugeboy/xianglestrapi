/**
 * custom product-category router
 */

export default {
  routes: [
    {
      "method": "POST",
      "path": "/submitInquiry",
      "handler": "custom-inquiry.submitInquiry",
      "config": {
        "policies": []
      }
    }
  ]
}; 