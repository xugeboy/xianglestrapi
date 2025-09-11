/**
 * Custom inquiry controller for advanced queries
 */
const fs = require("fs"); // Node.js 文件系统模块
const path = require("path"); // Node.js 路径模块

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
        const files = ctx.request.files;

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

        // 2. 准备邮件附件 (最多3个文件 - 逻辑不变)
        const attachments = [];
        const processedTempFilePaths = [];
        const uploadedFilesInput = files?.attachment; // 确保使用你前端设置的文件字段名
        const filesToProcess = Array.isArray(uploadedFilesInput)
          ? uploadedFilesInput
          : uploadedFilesInput
            ? [uploadedFilesInput]
            : [];

        if (filesToProcess.length > 3) {
          filesToProcess.forEach((file) => {
            if (file && file.filepath && fs.existsSync(file.filepath)) {
              fs.unlink(file.filepath, (err) => {
                if (err)
                  strapi.log.warn(
                    `Cleanup failed for ${file.filepath} during limit check rejection.`
                  );
              });
            }
          });
          return ctx.badRequest("You can upload a maximum of 3 files.");
        }

        strapi.log.info(
          `Processing ${filesToProcess.length} potential attachments.`
        );
        for (const uploadedFile of filesToProcess) {
          if (
            uploadedFile &&
            uploadedFile.filepath &&
            uploadedFile.originalFilename &&
            uploadedFile.mimetype
          ) {
            strapi.log.info(
              `Processing attachment: ${uploadedFile.originalFilename}`
            );
            try {
              const fileContent = fs.readFileSync(uploadedFile.filepath);
              attachments.push({
                filename: uploadedFile.originalFilename,
                content: fileContent,
                contentType: uploadedFile.mimetype,
              });
              processedTempFilePaths.push(uploadedFile.filepath);
              strapi.log.info(
                `Attachment ${uploadedFile.originalFilename} prepared.`
              );
            } catch (readError) {
              strapi.log.error(
                `Error reading uploaded file ${uploadedFile.originalFilename} from path ${uploadedFile.filepath}:`,
                readError
              );
              strapi.log.warn(
                `Skipping attachment ${uploadedFile.originalFilename} due to read error.`
              );
            }
          } else {
            strapi.log.warn(
              "Skipping an invalid or incomplete file data object."
            );
          }
        }
        // 3. 保存询盘数据
        await strapi.entityService.create("api::inquiry.inquiry", {
          data: inquiryData,
        });
        // 4. 构造包含所有字段的邮件选项
        const emailOptions = {
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
${attachments.length > 0 ? `${attachments.length} file(s) attached.` : "No files attached."}
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
                <hr>
                <p><strong>${attachments.length > 0 ? `${attachments.length} file(s) attached.` : "No files attached."}</strong></p>
                </body></html>
              `,
          attachments: attachments,
        };

        // 5. 发送邮件并进行清理 (try...finally 结构保持不变)
        try {
          strapi.log.info(
            `Sending email with ${attachments.length} attachments to ${emailOptions.to}...`
          );
          await strapi.plugin("email").service("email").send(emailOptions);
          strapi.log.info("Email sent successfully.");
          return ctx.send({ message: "Inquiry submitted successfully!" });
        } catch (emailError) {
          strapi.log.error("Failed to send inquiry email:", emailError);
          return ctx.internalServerError("Failed to send inquiry email.");
        } finally {
          strapi.log.info(
            `Cleaning up ${processedTempFilePaths.length} processed temporary files...`
          );
          processedTempFilePaths.forEach((filePath) => {
            if (fs.existsSync(filePath)) {
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr)
                  strapi.log.warn(
                    `Could not delete temp file ${filePath}:`,
                    unlinkErr
                  );
                else strapi.log.info(`Temporary file ${filePath} deleted.`);
              });
            } else {
              strapi.log.warn(
                `Attempted cleanup for non-existent temp file: ${filePath}`
              );
            }
          });
        }
      } catch (error) {
        strapi.log.error("Critical error in submitInquiry controller:", error);
        // 尝试在严重错误时清理所有上传的文件 (逻辑不变)
        const files = ctx.request.files;
        if (files && files.attachment) {
          const cleanupCandidates = Array.isArray(files.attachment)
            ? files.attachment
            : [files.attachment];
          cleanupCandidates.forEach((file) => {
            if (file && file.filepath && fs.existsSync(file.filepath)) {
              fs.unlink(file.filepath, (err) => {
                if (err)
                  strapi.log.warn(
                    `Cleanup failed for ${file.filepath} during critical error handling.`
                  );
              });
            }
          });
        }
        return ctx.internalServerError("An unexpected error occurred.");
      }
    },
  })
);
