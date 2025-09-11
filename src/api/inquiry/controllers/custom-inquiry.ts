/**
 * Custom inquiry controller for advanced queries
 */
import { factories } from "@strapi/strapi";

/**
 * Converts Strapi blocks JSON to plain text.
 * @param {Array<object>|null|undefined} blocks - The blocks data.
 * @returns {string} Plain text representation.
 */
function convertBlocksToText(blocks) {
  if (!Array.isArray(blocks)) return "";
  try {
    return blocks
      .filter(
        (block) => block.type === "paragraph" && Array.isArray(block.children)
      )
      .map((block) => block.children.map((child) => child.text || "").join(""))
      .join("\n\n"); // 段落之间用双换行分隔
  } catch (e) {
    strapi.log.error("Error converting blocks to text:", e);
    return "[Error processing message content]";
  }
}

/**
 * Converts Strapi blocks JSON to basic HTML.
 * @param {Array<object>|null|undefined} blocks - The blocks data.
 * @returns {string} HTML representation.
 */
function convertBlocksToHtml(blocks) {
  if (!Array.isArray(blocks)) return "";
  try {
    let html = "";
    for (const block of blocks) {
      if (block.type === "paragraph" && Array.isArray(block.children)) {
        html += "<p>";
        for (const child of block.children) {
          let text = (child.text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"); // 基本HTML转义
          if (child.bold) text = `<strong>${text}</strong>`;
          if (child.italic) text = `<em>${text}</em>`;
          if (child.underline) text = `<u>${text}</u>`;
          // 你可能需要添加对链接、列表、标题等的处理
          html += text;
        }
        html += "</p>";
      }
      // 在此添加对其他块类型（如 heading, list, image 等）的处理逻辑
      // else if (block.type === 'heading') { ... }
      // else if (block.type === 'list') { ... }
    }
    return html;
  } catch (e) {
    strapi.log.error("Error converting blocks to HTML:", e);
    return "<p>[Error processing message content]</p>";
  }
}

export default factories.createCoreController(
  "api::inquiry.inquiry",
  ({ strapi }) => ({
    async submitInquiry(ctx) {
      try {
        // 1. 解析表单数据，匹配你的 schema attributes
        // 注意: 'position' 是大写 P，确保前端发送的键名一致
        const { name, email, phone, company, position, message } =
          ctx.request.body;
        const inquiryData = {
          name,
          email,
          phone,
          company,
          position,
          message,
        };

        // (可选) 添加后端验证，例如检查必需字段
        if (!name || !email || !message) {
          return ctx.badRequest(
            "Missing required fields: name, email, message."
          );
        }

        // 1b. 处理 'message' 字段 (类型: blocks)
        let messageText = "";
        let messageHtml = "";
        let parsedMessage = message;

        // 如果 message 是作为 JSON 字符串发送的，先解析它
        if (typeof message === "string") {
          try {
            parsedMessage = JSON.parse(message);
          } catch (e) {
            strapi.log.warn(
              "Message field received as string, but failed to parse as JSON. Treating as plain text.",
              e
            );
            // 解析失败，将其视为普通文本
            parsedMessage = message; // 回退到原始字符串
          }
        }

        // 现在尝试转换 (如果它是数组结构) 或直接使用 (如果是普通文本)
        if (Array.isArray(parsedMessage)) {
          messageText = convertBlocksToText(parsedMessage);
          messageHtml = convertBlocksToHtml(parsedMessage);
        } else if (typeof parsedMessage === "string") {
          messageText = parsedMessage;
          messageHtml = `<p>${parsedMessage.replace(/\n/g, "<br>")}</p>`; // 简单地将换行符转为<br>
        } else {
          // 其他意外情况
          messageText = "[Could not process message field]";
          messageHtml = "<p>[Could not process message field]</p>";
          strapi.log.warn(
            "Message field was neither a valid blocks array nor a string."
          );
        }

        // 2. 保存询盘数据
        await strapi.entityService.create("api::inquiry.inquiry", {
          data: inquiryData,
        });

        // 3. 发送自动回复邮件给客户
        const customerEmailOptions = {
          to: email,
          from: "info@xiangleratchetstrap.com",
          subject: "Thank you for your inquiry – Xiangle Ratchet Straps",
          text: `Dear ${name},

Thank you for reaching out to us. We have received your inquiry and our sales team will respond to you within 8 hours.

If you would like to share drawings, specifications, or other documents related to your request, please feel free to reply to this email and attach your files directly.

We look forward to learning more about your needs and working together.

Best regards,
Dustin
Vice Sales Director
Xiangle Ratchet Straps`,
          html: `
            <html><body>
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to us. We have received your inquiry and our sales team will respond to you within 8 hours.</p>
            <p>If you would like to share drawings, specifications, or other documents related to your request, please feel free to reply to this email and attach your files directly.</p>
            <p>We look forward to learning more about your needs and working together.</p>
            <p>Best regards,<br>
            Dustin<br>
            Vice Sales Director<br>
            Xiangle Ratchet Straps</p>
            </body></html>
          `,
        };

        // 4. 构造包含所有字段的内部通知邮件
        const internalEmailOptions = {
          to: "info@xianglecargocontrol.com", // 修改为你的接收邮箱
          from: "info@xiangleratchetstrap.com",
          replyTo: email,
          subject: `Website Inquiry: ${name} from ${company || "N/A"}`, // 更具体的标题
          text: `
New inquiry received:
--------------------------------
Name: ${name || "N/A"}
Email: ${email || "N/A"}
Phone: ${phone || "N/A"}
Company: ${company || "N/A"}
Position: ${position || "N/A"}
--------------------------------
Message:
${messageText || "N/A"}
--------------------------------
              `,
          html: `
                <html><body>
                <h1>New Website Inquiry</h1>
                <p><strong>Name:</strong> ${name || "N/A"}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email || "N/A"}</a></p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                <p><strong>Company:</strong> ${company || "N/A"}</p>
                <p><strong>Position:</strong> ${position || "N/A"}</p>
                <hr>
                <h2>Message:</h2>
                <div>${messageHtml || "<p>N/A</p>"}</div>
                </body></html>
              `,
        };

        // 5. 发送邮件
        try {
          // 发送自动回复邮件给客户
          strapi.log.info(`Sending auto-reply email to customer: ${email}...`);
          await strapi.plugin("email").service("email").send(customerEmailOptions);
          strapi.log.info("Customer auto-reply email sent successfully.");

          // 发送内部通知邮件
          strapi.log.info(`Sending internal notification email to ${internalEmailOptions.to}...`);
          await strapi.plugin("email").service("email").send(internalEmailOptions);
          strapi.log.info("Internal notification email sent successfully.");

          return ctx.send({ message: "Inquiry submitted successfully!" });
        } catch (emailError) {
          strapi.log.error("Failed to send inquiry emails:", emailError);
          return ctx.internalServerError("Failed to send inquiry emails.");
        }
      } catch (error) {
        strapi.log.error("Critical error in submitInquiry controller:", error);
        return ctx.internalServerError("An unexpected error occurred.");
      }
    },
  })
);
