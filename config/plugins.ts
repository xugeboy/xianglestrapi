module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
      // 禁用自动生成不同尺寸的图片
      responsive: false,
      formats: [], // 不生成任何额外格式
    },
  },
email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // 使用 SSL
        auth: {
          user: env('EMAIL_USERNAME'), // 例如 yourname@yourdomain.com
          pass: env('EMAIL_PASSWORD'), // 应用专用密码或你的邮箱密码
        },
      },
      settings: {
        defaultFrom: env('EMAIL_USERNAME'),
        defaultReplyTo: env('EMAIL_USERNAME'),
      },
    },
  },
});