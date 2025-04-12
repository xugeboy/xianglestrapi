/**
 * Custom inquiry controller for advanced queries
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::inquiry.inquiry",
  ({ strapi }) => ({
    async submitInquiry(ctx) {
      try {
        const { name, email, phone, company, position, message } = ctx.request.body;
  
        // 拿到上传的附件文件（由 Strapi 自动处理）
        const uploadedFiles = ctx.request.files?.attachments;
  
        // 创建 Inquiry 实体（附件将在下面单独关联）
        const newInquiry = await strapi.entityService.create('api::inquiry.inquiry', {
          data: {
            name,
            email,
            phone,
            company,
            position,
            message,
          },
          files: ctx.request.files
        });

        // 🔔 发送邮件通知你
        const baseUrl = process.env.APP_URL;
        const attachmentLinks = Array.isArray(newInquiry.attachment)
          ? newInquiry.attachment
              .map((file) => `<li><a href="${baseUrl}${file.url}">${file.name}</a></li>`)
              .join('')
          : '';
  
        await strapi.plugin('email').service('email').send({
          to: 'info@xianglecargocontrol.com',
          from: 'info@xiangleratchetstrap.com',
          replyTo: email,
          subject: `XiangleRatchetStrap New Inquiry from ${name}`,
          html: `
            <h2>You received a new inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || '-'}</p>
            <p><strong>Company:</strong> ${company || '-'}</p>
            <p><strong>Position:</strong> ${position || '-'}</p>
            <p><strong>Message:</strong><br/>${message}</p>
            ${fileLinks ? `<p><strong>Attachments:</strong><ul>${fileLinks}</ul></p>` : ''}
          `,
        });
  
        ctx.send({
          message: 'Inquiry submitted successfully.',
          inquiry: newInquiry,
        });
      } catch (err) {
        console.error('❌ Inquiry submission error:', err);
        ctx.throw(500, 'Failed to process inquiry.');
      }
    },
  })
);
