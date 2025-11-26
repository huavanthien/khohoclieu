
import { GoogleGenAI, Chat } from "@google/genai";

// Ensure API Key is available. 
// Vite 'define' in vite.config.ts will replace process.env.API_KEY with the actual string.
const apiKey = process.env.API_KEY || "";

const ai = new GoogleGenAI({ apiKey });

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `Bạn là một trợ lý giáo dục thông minh tên là EduBot. 
      Nhiệm vụ của bạn là hỗ trợ học sinh và giáo viên tìm kiếm tài liệu, giải thích khái niệm, 
      và tạo ra các câu hỏi ôn tập dựa trên nội dung học tập.
      Hãy trả lời ngắn gọn, súc tích, thân thiện và khuyến khích tinh thần tự học.
      Sử dụng tiếng Việt chuẩn xác.`,
    },
  });
};

export const generateQuickSummary = async (title: string, description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Hãy tóm tắt ngắn gọn nội dung chính mà người học có thể mong đợi từ tài liệu có tiêu đề "${title}" và mô tả "${description}". Chỉ đưa ra 3 điểm chính, dùng gạch đầu dòng.`,
    });
    return response.text || "Không thể tạo tóm tắt lúc này.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Đã xảy ra lỗi khi kết nối với AI.";
  }
};

export const generateQuizQuestions = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Tạo 3 câu hỏi trắc nghiệm (kèm đáp án đúng) để kiểm tra kiến thức về chủ đề: "${topic}". Định dạng JSON array.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Error generating quiz:", error);
    return "[]";
  }
};
