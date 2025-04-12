/**
 * Custom subscriber controller for advanced queries
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::subscriber.subscriber",
  ({ strapi }) => ({
    async submitSubscribe(ctx) {
      try {
        const { email } = ctx.request.body;
  
        // 验证电子邮件是否已存在
        const existingSubscriber = await strapi.services.subscriber.findOne({ email });
        if (existingSubscriber) {
          return ctx.send({ message: 'This email is already subscribed.' }, 400);
        }
  
        // 保存订阅者数据
        const newSubscriber = await strapi.services.subscriber.create({ email });
  
        // 返回成功响应
        ctx.send({ message: 'Subscription successful', subscriber: newSubscriber });
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    
  })
);
