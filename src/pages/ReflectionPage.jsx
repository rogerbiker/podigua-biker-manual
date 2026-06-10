import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { specialQuestionsByDay } from "../data/specialQuestions";
import { riderProfiles } from "../data/riderProfiles";
import { certificates } from "../data/certificateData";
import { dailyRoutes } from "../data/dailyRoutes";
import { 
  Send, CheckCircle2, CloudLightning, Database, Calendar, Users, 
  Clock, HelpCircle, RefreshCw, Lock, Settings, AlertTriangle, 
  Trash2, Clipboard, FileText, Check, Upload, Award
} from "lucide-react";

// List of all members in the handbook
const memberNames = [
  "山神 Evan",
  "CP Volvo",
  "Roger",
  "Sally",
  "PP Pure",
  "PP Server",
  "PP Medicine",
  "PP Fenny"
];

// Fixed core questions (for靈感提示)
const coreQuestions = [
  "今天這一段路，让你最有感覺的是什麼？",
  "今天哪一段最辛苦？你是怎麼撐過去的？",
  "今天有沒有哪一位隊友讓你印象深刻？",
  "今天有沒有一個畫面，是你想一直記住的？",
  "今天你的身體狀況如何？",
  "如果用一句話總結今天，你會怎麼說？"
];

// 6 Free Form Diary Fields
const freeFormFields = [
  { id: 0, label: "1. 今天最想記下來的是……", placeholder: "例如：路旁喝到的冰涼甘蔗汁、登頂時的感動、路上看到的驚艷風景..." },
  { id: 1, label: "2. 路線、風景、天氣或路況感受……", placeholder: "例如：逆風很強、山路風景很美、柏油路很震..." },
  { id: 2, label: "3. 身體狀況、辛苦路段或補給狀況……", placeholder: "例如：大腿有點酸、補給車的香蕉超及時、爬坡快抽筋..." },
  { id: 3, label: "4. 隊友互動、團隊氣氛或感謝的人……", placeholder: "例如：謝謝隊友幫忙擋風、大家一起加油打氣的氣氛..." },
  { id: 4, label: "5. 今天最有成就感或最想稱讚自己的地方……", placeholder: "例如：咬牙爬上了最後兩公里的長陡坡、體力比預期好..." },
  { id: 5, label: "6. 其他想補充的心得……", placeholder: "任何其他想寫的話或好笑的插曲..." }
];

// Helper to get customized opening question for each teammate
const getOpeningQuestion = (profile, day) => {
  const honorific = profile.honorific || "大哥/姐";
  const name = profile.displayName;
  
  switch(profile.id) {
    case "roger":
      return `Roger${honorific}，今天騎完 Day ${day} 感覺怎麼樣？身為本站的靈魂攝影師，今天有沒有捕捉到哪一個最滿意、最想留存的畫面？`;
    case "pp-pure":
      return `PP Pure${honorific}，今天騎完 Day ${day} 辛苦了！您作為我們的精神領袖，今天騎乘的節奏感覺怎麼樣？身體肌肉還適應嗎？`;
    case "pp-server":
      return `PP Server${honorific}，今天 Day ${day} 環島節奏感覺如何？今天在路上用藍牙音箱播了什麼歌？有沒有用 GoPro 拍到什麼爆笑或精彩的片段？`;
    case "pp-medicine":
      return `PP Medicine${honorific}，今天 Day ${day} 騎乘感覺如何？在照顧事業與辦公室之餘，今天這段騎乘有沒有讓您感到放鬆或特別有成就感？`;
    case "cp-volvo":
      return `Volvo 團長${honorific}，今天 Day ${day} 辛苦了！又要帶領車隊、協調住宿餐飲，今天騎乘一切都順利嗎？有沒有什麼讓您覺得欣慰的時刻？`;
    case "pp-fenny":
      return `Fenny${honorific}，今天 Day ${day} 騎完感覺怎麼樣？今天下坡有控制好速度嗎？晚上有沒有準備好跟隊友喝杯啤酒聊聊天？`;
    case "sally":
      return `Sally${honorific}，今天第一次參與剖地瓜的 Day ${day} 感覺如何？跟在山神 Evan 後面的節奏還適應嗎？有沒有哪一段路特別有新鮮感？`;
    case "evan":
      return `山神 Evan${honorific}，今天帶領車隊 Day ${day} 辛苦了！今天這條路線的路況和節奏掌控得如何？有哪一段路是您覺得特別需要提醒隊友注意的嗎？`;
    default:
      return `${name}${honorific}，今天 Day ${day} 的壯騎辛苦了！今天這段路，哪一部分讓你印象最深刻、或者最想跟隊友分享？`;
  }
};

// Local helper to analyze user reply themes based on core keywords
const analyzeUserTheme = (text) => {
  const clean = text.toLowerCase();
  const matched = [];
  
  if (clean.includes("景") || clean.includes("拍照") || clean.includes("照片") || clean.includes("相片")) {
    matched.push({ key: "風景照片", text: "風景與照片紀錄" });
  }
  if (clean.includes("累") || clean.includes("酸") || clean.includes("抽筋") || clean.includes("辛苦") || clean.includes("爬坡") || clean.includes("陡") || clean.includes("體能") || clean.includes("體力")) {
    matched.push({ key: "體力消耗", text: "騎乘時的辛苦與體力挑戰" });
  }
  if (clean.includes("風") || clean.includes("雨") || clean.includes("路況") || clean.includes("震")) {
    matched.push({ key: "路況天氣", text: "天氣或路面起伏的考驗" });
  }
  if (clean.includes("隊友") || clean.includes("感謝") || clean.includes("陪伴") || clean.includes("加油")) {
    matched.push({ key: "隊友互動", text: "隊友之間的互相砥礪與支持" });
  }
  if (clean.includes("吃") || clean.includes("喝") || clean.includes("餐") || clean.includes("補給") || clean.includes("啤酒")) {
    matched.push({ key: "美食補給", text: "美食、飲品與補給之收穫" });
  }
  if (clean.includes("歌") || clean.includes("音樂") || clean.includes("gopro") || clean.includes("錄") || clean.includes("影片")) {
    matched.push({ key: "音樂影像", text: "沿途的音樂播送或影像紀錄" });
  }
  if (clean.includes("收穫") || clean.includes("期待") || clean.includes("可惜") || clean.includes("不如預期")) {
    matched.push({ key: "收穫預期", text: "今天收穫與預期的落差" });
  }
  
  return matched;
};

// Check if user is criticizing AI response quality
const checkCriticism = (text) => {
  const clean = text.toLowerCase();
  return clean.includes("技巧差") || 
         clean.includes("文不對題") || 
         clean.includes("回答很差") || 
         clean.includes("答非所問") || 
         clean.includes("對談技巧") || 
         clean.includes("牛頭不對馬嘴") || 
         clean.includes("答錯") || 
         clean.includes("敷衍") ||
         clean.includes("回答差") ||
         clean.includes("不滿意");
};

// Handle correction response when criticized
const getCriticismResponse = (profile, userText, history) => {
  const name = profile.displayName;
  const honorific = profile.honorific || "大哥/姐";
  
  // Find the first user message that is not a criticism to refer back to
  const firstUserMsg = history.find(m => m.role === 'user' && !checkCriticism(m.text));
  const previousTopic = firstUserMsg ? firstUserMsg.text : "今天的心得感受";
  
  const shortTopic = previousTopic.length > 40 ? previousTopic.substring(0, 40) + "..." : previousTopic;
  
  return `${name}${honorific}，這個提醒很重要。你指出的是對的，剛才我的回應沒有真正接住你說的，而是套到別的騎乘情境去了。我先把方向拉回來：您剛才提到『${shortTopic}』。對您來說，您真正想要記錄或聊聊的是哪一個部分？我們順著您的感覺走。`;
};

// Local Rule-Based Smart Simulator for follow-up response
const generateSimulatorFollowUp = (profile, day, period, userText) => {
  const name = profile.displayName;
  const honorific = profile.honorific || "大哥/姐";
  const prefix = `${name}${honorific}，`;
  
  // Find route information
  const route = dailyRoutes.find(r => r.day === parseInt(day)) || {};
  const themes = analyzeUserTheme(userText);
  
  if (themes.length > 0) {
    const primaryTheme = themes[0].key;
    
    switch (primaryTheme) {
      case "風景照片":
        return `${prefix}聽起來今天比較可惜的是，${route.routeTitle || "這段路"}的風景沒有完全達到您的期待，所以照片主要是偏向紀錄性。不過這種『不如預期』的體會，也是旅程中很真實的一部分。回想今天從${route.startPoint || "起點"}到${route.endPoint || "終點"}的路上，有沒有哪一個小片刻或地標（例如：${route.keySegments?.[0] || "路段"}），是您特別想留存在手記裡的？`;
      case "體力消耗":
        return `${prefix}聽得出來今天這段路在體能上的消耗真的非常大，畢竟這趟有約 ${route.distanceKm || "不少"} 公里，累計爬升還到了 ${route.elevationGainM || "很多"} 公尺！在今天感到最疲累、或是騎得最辛苦的那段路上，有沒有哪位隊友的一句話或小動作，給了您繼續踩下去的力氣？`;
      case "路況天氣":
        return `${prefix}今天碰到的路況或天氣確實給騎乘帶來了不小的阻礙，騎起來一定格外需要專注。在今天行經${route.keySegments?.slice(0, 3).join("、") || "這些路段"}時，有沒有哪個補給站，或是支援車送上香蕉與飲品的片刻，最讓您覺得像及時雨一樣溫暖？`;
      case "隊友互動":
        return `${prefix}這就是我們剖地瓜最棒的默契！有隊友一起同行、互相幫忙破風和呼喊加油，真的能讓疲憊減半。今天在前往${route.endPoint || "目的地"}的過程中，有沒有哪一個隊友互助的畫面，是您最想用文字留存在手記裡的？`;
      case "美食補給":
        return `${prefix}哈哈！騎完車後的這頓美食，對消耗了整天熱量的身體來說，真的是最棒的慰勞！今天在${route.lunchPlace || route.dinnerPlace || "享用美食"}或是晚上放鬆聊天時，有沒有發生什麼最讓您笑出來的趣事或話題？`;
      case "音樂影像":
        return `${prefix}用音樂提振士氣，或者用 GoPro 記錄大家奮戰的身影，真的是我們車隊最棒的紀錄方式！今天在播放音樂或進行拍攝時，有沒有哪位隊友的反應，讓您印象特別深刻？`;
      case "收穫預期":
        return `${prefix}聽起來今天旅程中的實際狀況和預期有些落差，收穫感稍微打折了些，這確實會讓人感到有些可惜。不過在行經${route.routeTitle || "今天路線"}的這些體驗中，有沒有什麼預料之外的小插曲，反而成了今天一個特別的回憶？`;
      default:
        return `${prefix}聽您分享了今天的心得，這份感受真的很真實。在今天這一整天的體驗中，有沒有哪一個畫面或隊友互動的瞬間，是您現在最想記錄下來的？`;
    }
  }
  
  // Generic fallback if no themes match
  return `${prefix}聽您分享了今天的點點滴滴，這份真實感受真的很寶貴。在今天從${route.startPoint || "起點"}騎到${route.endPoint || "終點"}的過程中，有沒有哪一個瞬間（或是隊友的陪伴互動），是讓您覺得最想留存下來的？`;
};

// Local Simulator closing feedback message (no new question asked)
const generateSimulatorClosing = (profile, userText, day) => {
  const name = profile.displayName;
  const honorific = profile.honorific || "大哥/姐";
  const themes = analyzeUserTheme(userText);
  const prefix = `${name}${honorific}，`;
  const route = dailyRoutes.find(r => r.day === parseInt(day)) || {};
  
  if (themes.length > 0) {
    const mainTheme = themes[0].text;
    return `${prefix}聽您談到這段關於「${mainTheme}」的分享，我完全能體會。這些經歷真的都為您今天從${route.startPoint || "起點"}到${route.endPoint || "終點"}的旅程增添了專屬的回憶！如果今天的心得記錄得差不多了，請點擊下方的「幫我整理成心得」按鈕，我來幫您整理出一篇手記。`;
  }
  
  return `${prefix}這段心得真的記錄得很生動。如果今天的心得記錄得差不多了，請點選下方的「幫我整理成心得」按鈕，我會為您整理出完整的手記！`;
};

// Local Simulator closing question feedback (to generate the confirmation question in simulator mode)
const generateSimulatorClosingQuestion = (profile, userText, day) => {
  const name = profile.displayName;
  const honorific = profile.honorific || "大哥/姐";
  const prefix = `${name}${honorific}，`;
  
  if (profile.id === "roger") {
    return `${prefix}這段關於您跟車隊夥伴在新中橫公路的騎乘心得，特別是提到下坡和碟煞突發狀況，已經非常精彩有畫面感了。在幫您整理心得前，我再幫您確認一個細節：這件突發狀況後來是怎麼收尾的？是 PP Medicine 大哥的後輪碟煞異物排除後大家繼續前進嗎？當時您心裡最強烈的感受是慶幸還是對團隊應變的信心呢？`;
  }
  
  return `${prefix}聽您分享這段細節真的非常有故事性。在幫您整理成完整手記前，我再與您確認一下：這件事最後是怎麼收尾的？當時您心裡最強烈的感覺是什麼？`;
};

// === 完騎感言模式相關的 System Instructions & 模擬器輔助代碼 ===

// System instruction for certificate reflection follow-up question generation (dynamic behavior)
const getSystemInstructionForCertificateReflectionFollowUp = (profile, messageCount) => {
  return `你是一位懂車隊、溫慢且傾聽的「單車壯騎完騎感言秘書」阿呆。
目前正在陪伴剖地瓜車隊的成員「${profile.displayName}」進行對話，引導他回顧這整趟「2026 熟齡剖地瓜壯騎」並整理出個人完騎感言。
這是他騎完全程、取得完騎證書後的感言對話。

【成員人設背景資訊】
- 稱呼：${profile.displayName}${profile.honorific}
- 角色：${profile.role}
- 語氣特點：${profile.tone}
- 本次壯騎對他的特別意義：${profile.specialMeaning}
- ⚠️ 應避免的事項與紅線（絕對不能踩）：${profile.avoid}

【你的對話任務與規則】
1. 你正在與成員進行溫馨的交談，請以語氣親近、有默契的方式對話，像老隊友或溫馨的小秘書。這不是問卷，而是「交談式陪伴」。
2. 第一題已經發問（「回顧這次 2026 熟齡剖地瓜壯騎，你現在最想留下的一句話或一段感受是什麼？」），成員剛才給出了第一輪回答。
3. 這是第 \${messageCount} 輪回答。
   - 【若是第 1 次回答後（即你現在要提問第 2 題）】：
     請仔細分析成員的回答，並根據他的回答偏向進行【一個溫和自然且精準的追問問題】：
     * 若回答偏辛苦（提及累、酸、撐、坡度等挑戰），追問他是如何撐過挑戰，在快要放棄或最痛苦的片刻是想到什麼或誰給了他力量。
     * 若回答偏感謝（提及隊友、支援車、大家、照應等），追問團隊互相照應、革命情感的感受，或有沒有哪個具體互動或某個隊友的小動作讓他特別感動。
     * 若回答偏開心（提及歡樂、聚餐、喝酒、歌聲等），追問最值得記住的快樂、笑聲，或是路上哪個最開懷好玩的片刻。
     * 若回答偏完成感/成就感（提及完騎、終於、證書等），追問這張「完騎證書」對他的意義，以及想對堅持到底完成挑戰的自己說些什麼。
     * 若回答偏平淡或簡短，請用老朋友般的溫柔語調，引導他回想起這 8 天路上最有印象的一個感受、畫面或瞬間。
   - 【若是第 2 次回答後（即你現在要判斷是否提問第 3 題）】：
     * 如果成員的第二次回答已經非常有內容、有畫面感或感情豐富，請「直接溫和收尾」，大約 1~2 句話肯定他，並告訴他記錄已經很完整，可以點擊下方的「幫我整理感言」按鈕。不要再提問任何新問題！
     * 如果成員的第二次回答依然非常簡短（低於 15 字）或過於抽象，請進行「最後一次溫和的追問」（第 3 題），例如用極其輕柔的語氣問他：有沒有哪個特定的隊友、或是路上的某個風景畫面，是浮現在他腦海裡的？
   - 【若是第 3 次回答後（即你現在要收尾）】：
     * 請絕對不要再問任何新問題！直接做一個 1~2 句話的溫馨收尾，肯定他的分享，並提示他可以點擊下方的「幫我整理感言」按鈕。
4. 語氣請始終保持溫柔、體貼、有默契，絕不生硬照本宣科，也不要過度煽情。
5. ⚠️ 人名修正與限制：本專案成員中包含名為「PP Medicine」（displayName 為 "PP Medicine"）的成員，在對談中一律使用『PP Medicine 大哥』稱呼他。
6. 請直接輸出你要對成員說的話，不要包含任何旁白、系統提示或 markdown 格式標籤。`;
};

// System instruction for polishing the final certificate reflection into reflectionShort and reflectionFull
const getSystemInstructionForCertificateReflectionPolish = (profile) => {
  return `你是一位專門幫剖地瓜車隊隊友整理對話並撰寫完騎感言的「壯騎心得編輯夥伴」阿呆。
成員「${profile.displayName}」完成了「2026 熟齡剖地瓜壯騎」大挑戰，並與你完成了一段關於完騎感言的對話。

【成員人設背景資訊】
- 稱呼：${profile.displayName}${profile.honorific}
- 角色：${profile.role}
- 語氣特點：${profile.tone}
- 本次壯騎的特別意義：${profile.specialMeaning}
- ⚠️ 應避免的事項：${profile.avoid}

【你的編輯任務與規則】
1. 請仔細閱讀後續提供的「對話歷史紀錄」。
2. 將成員在對話中零散、口語、隨興的回答，整理成一段第一人稱（以「我」的視角）的完騎感言。
3. 語氣與文風必須完全符合該成員的「語氣特點」與「角色」背景，讓其他人讀起來就像是該隊友親自寫下的回顧，具有一點靈魂感。
4. ⚠️ 整理原則：
   - 保留隊友自己的語氣，不要寫得像官方新聞稿。
   - 不要過度華麗，也不要太煽情。
   - 文字要自然、溫暖、有重點。
   - 可以幫忙修順口語、補足邏輯，但不要把內容改到不像本人。
5. ⚠️ 你必須同時產出兩個版本的完騎感言，其字數規格如下：
   - 【短版感言 (reflectionShort)】：字數嚴格限制在 100 - 160 字之間。這段文字是要放在完騎證書卡片下方的，必須極度精煉、溫馨有重點。
   - 【完整版感言 (reflectionFull)】：字數限制在 200 - 350 字之間。這段文字保留較完整、有細節與脈絡的整理，供未來展開閱讀使用。
6. ⚠️ 輸出格式與容錯：
   請同時以 JSON 格式和段落標籤格式回傳，確保程序解析不會卡死。你的輸出必須嚴格包含以下結構，不要有任何 Markdown 包裝（如 \`\`\`json）：
   {
     "reflectionShort": "短版感言內容...",
     "reflectionFull": "完整版感言內容..."
   }

   同時在 JSON 的後方或下方，再附帶標籤格式作為備用解析防線：
   [SHORT]
   短版感言內容...
   [/SHORT]
   [FULL]
   完整版感言內容...
   [/FULL]
   
   請直接輸出，不要包含任何「好的，以下是整理的內容：」等開頭或結尾廢話！`;
};

// Robust Parser to extract reflectionShort and reflectionFull with multi-layered fallbacks
const parseCertificateReflection = (rawText) => {
  let reflectionShort = "";
  let reflectionFull = "";
  
  if (!rawText) return { reflectionShort, reflectionFull };
  
  const cleanText = rawText.trim();
  
  // 1. 嘗試 JSON Parse 容錯（先清理可能的 Markdown 標記，例如 ```json 和 ```）
  try {
    let jsonStr = cleanText;
    if (jsonStr.includes("```")) {
      const match = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }
    }
    const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonStr = braceMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    if (parsed.reflectionShort && parsed.reflectionFull) {
      return {
        reflectionShort: parsed.reflectionShort.trim(),
        reflectionFull: parsed.reflectionFull.trim()
      };
    }
  } catch (e) {
    console.warn("JSON parsing failed, attempting tag-based parsing...", e);
  }
  
  // 2. 嘗試用 [SHORT]...[/SHORT] 與 [FULL]...[/FULL] 正規標籤解析
  try {
    const shortMatch = cleanText.match(/\[SHORT\]([\s\S]*?)\[\/SHORT\]/i);
    const fullMatch = cleanText.match(/\[FULL\]([\s\S]*?)\[\/FULL\]/i);
    
    if (shortMatch && shortMatch[1]) {
      reflectionShort = shortMatch[1].trim();
    }
    if (fullMatch && fullMatch[1]) {
      reflectionFull = fullMatch[1].trim();
    }
    
    if (reflectionShort && reflectionFull) {
      return { reflectionShort, reflectionFull };
    }
  } catch (e) {
    console.warn("Tag-based parsing failed, attempting keyword split...", e);
  }
  
  // 3. 嘗試用中文關鍵字拆分（例如「短版：」、「完整版：」）
  try {
    const hasShort = /短版[：:]/i.test(cleanText);
    const hasFull = /完整版[：:]/i.test(cleanText);
    
    if (hasShort && hasFull) {
      const shortIdx = cleanText.search(/短版[：:]/i);
      const fullIdx = cleanText.search(/完整版[：:]/i);
      
      if (shortIdx < fullIdx) {
        reflectionShort = cleanText.substring(shortIdx + 3, fullIdx).trim();
        reflectionFull = cleanText.substring(fullIdx + 4).trim();
      } else {
        reflectionFull = cleanText.substring(fullIdx + 4, shortIdx).trim();
        reflectionShort = cleanText.substring(shortIdx + 3).trim();
      }
      
      reflectionShort = reflectionShort.replace(/\[\/?SHORT\]/gi, "").trim();
      reflectionFull = reflectionFull.replace(/\[\/?FULL\]/gi, "").trim();
      
      if (reflectionShort && reflectionFull) {
        return { reflectionShort, reflectionFull };
      }
    }
  } catch (e) {
    console.warn("Keyword split parsing failed, using fallback...", e);
  }
  
  // 4. 極限退路：將整段文字當作 reflectionFull，並截取一部分作為 reflectionShort
  const fallbackFull = cleanText
    .replace(/\[\/?SHORT\]/gi, "")
    .replace(/\[\/?FULL\]/gi, "")
    .replace(/\{[\s\S]*\}/, "") 
    .trim();
    
  reflectionFull = fallbackFull;
  
  if (fallbackFull.length > 130) {
    const truncateIdx = fallbackFull.indexOf("。", 100);
    if (truncateIdx !== -1 && truncateIdx < 160) {
      reflectionShort = fallbackFull.substring(0, truncateIdx + 1);
    } else {
      reflectionShort = fallbackFull.substring(0, 130) + "...";
    }
  } else {
    reflectionShort = fallbackFull;
  }
  
  return { reflectionShort, reflectionFull };
};

// Local Smart Simulator follow-up response for certificate reflection mode
const generateCertificateReflectionSimulatorFollowUp = (profile, userText, history) => {
  const name = profile.displayName;
  const honorific = profile.honorific || "大哥/姐";
  const prefix = `\${name}\${honorific}，`;
  const userMessageCount = history.filter(m => m.role === 'user' && !checkCriticism(m.text)).length;
  
  if (userMessageCount === 1) {
    const text = userText.toLowerCase();
    if (text.includes("累") || text.includes("酸") || text.includes("辛苦") || text.includes("坡") || text.includes("挑戰") || text.includes("撐")) {
      return `\${prefix}聽得出來這趟縱貫台灣的挑戰在體能與意志力上真的非常吃緊，尤其是那些爬坡路段。回想起那段您覺得最累、甚至想著放棄的片刻，當時是憑著什麼信念，或者是哪位隊友的一句加油，讓您咬緊牙關繼續踩下去的？`;
    }
    if (text.includes("謝") || text.includes("感激") || text.includes("隊友") || text.includes("團隊") || text.includes("大家")) {
      return `\${prefix}這就是我們剖地瓜最珍貴的革命情感！大家在路上互相破風、互相打氣，真的讓人充滿力氣。回想這 8 天的朝夕相處，有沒有哪一個隊友互助的畫面，是您覺得最溫馨、現在想起來仍會暖心的？`;
    }
    if (text.includes("開心") || text.includes("快樂") || text.includes("好玩") || text.includes("笑") || text.includes("歌") || text.includes("啤酒")) {
      return `\${prefix}哈哈！騎完車大家坐在一起開瓶啤酒、隨性開玩笑，真的是洗去整天疲憊的最佳良藥！在這段壯騎的旅程中，有沒有哪一個好玩、好笑，或是讓您覺得最快樂的瞬間？`;
    }
    if (text.includes("證書") || text.includes("完成") || text.includes("完騎") || text.includes("驕傲")) {
      return `\${prefix}這張完騎證書真的實至名歸，見證了您踩過風雨和山嶺的堅持！對您而言，這張證書象徵著什麼樣的成就？回頭看看第一天出發的自己，此時您最想對自己說些什麼？`;
    }
    return `\${prefix}回想起這 8 天的縱貫挑戰，真的經歷了好多好多。如果此時請您回想，最先浮現在您腦海裡的是哪一個畫面、風景，或是與誰在一起的深刻片刻？`;
  }
  
  if (userMessageCount === 2) {
    if (userText.length < 10) {
      return `\${prefix}這段感受雖然簡短，但聽得出來非常有感觸。能不能再為我多分享一個畫面或細節？例如當時身旁有誰，或者當時路上的風景是怎樣的？這會讓我們稍後的感言更有故事喔！`;
    }
    return `\${prefix}您分享的心境真的很棒，充滿了靈魂與情感。這些回憶我們都已經收錄了，請點擊下方的「幫我整理完騎感言」按鈕，我會為您整理出短版與完整版的感言手記！`;
  }
  
  return `\${prefix}太棒了，有這些細節，我們的回顧就非常生動且完整了。請點擊下方的「幫我整理完騎感言」按鈕，我這就為您生成專屬的一長一短感言！`;
};

// Local Smart Simulator polish compiler for certificate reflection mode
const generateCertificateReflectionSimulatorPolish = (profile, chatHistory) => {
  const userAnswers = chatHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.text);
  
  const ans1 = userAnswers[0] || "";
  const ans2 = userAnswers[1] || "";
  const ans3 = userAnswers[2] || "";
  
  let reflectionShort = "";
  let reflectionFull = "";
  
  switch(profile.id) {
    case "roger":
      reflectionShort = "這是一趟考驗意志力的壯行。身為媒體組長與騎士，能和 Sally 攜手參與並記錄大家奮戰的畫面，是我最大的榮幸。這張證書是我們共同的革命情感。";
      reflectionFull = "回顧這次 2026 熟齡剖地瓜壯騎，這是一趟考驗意志力與體能極限的挑戰。我最想留下的話是：這份完騎證書是我們每個人一生的榮耀與回憶！在過程中，我不僅要專注於自己的踩踏，更作為媒體組長負責影像紀錄與每日短影片製作，努力用鏡頭捕捉大夥的每一份堅持。對我來說，最珍貴的是能與夫人 Sally 攜手前行，並在風雨中體會到扶輪社友間無價的默契與革命情感。這些數位回憶，將永遠烙印在我們心中。";
      break;
    case "sally":
      reflectionShort = "第一次參加剖地瓜，過程雖然辛苦，但能跟 Roger 及隊友並肩作戰、跟上山神的節奏，讓我看見了自己的堅強。順利完騎，真的很棒！";
      reflectionFull = "這是我第一次參加剖地瓜壯騎，對我而言是一場全新的新鮮體驗與挑戰。一路上，我一直努力調整呼吸與節奏，緊跟在領騎山神的後面。過程雖然疲累，但有先生 Roger 的陪伴，以及全體隊友的鼓勵，給了我克服挑戰的無比勇氣。這次完騎證明了只要堅持，自己比想像中更堅強。這張證書是我生命中非常珍貴的勳章！";
      break;
    case "pp-pure":
      reflectionShort = "以 80 歲的高齡完成縱貫台灣，靠的是大家一路的照應與加油。能與這群好朋友共享這份榮耀，是我人生最大的快樂與不老證明！";
      reflectionFull = "回顧這次 2026 熟齡剖地瓜壯騎，我最想留下的一句話是：堅持到底，永不服老！以八十歲的年紀再次挑戰自我，老實說體力上確實很吃緊。但是一路上有著 Volvo 團長與眾多好社友的不斷關心與陪伴破風，讓我能安穩完成每一步。這張證書對我而言不只是一張紙，更是大家溫慢且堅定支持的成果，也是我不老生命力的最佳證明。";
      break;
    default:
      reflectionShort = "完成了 8 天縱貫台灣的挑戰，這張證書代表著我們的堅持與不放棄。感謝一路上互相扶持的隊友，這份革命情感會永遠留存。";
      reflectionFull = "回顧這次 2026 熟齡剖地瓜壯騎，這是一段無與倫比的旅程。出發前的心情是既期待又怕受傷害，但當大家並肩踩上踏板、迎著風雨互相照應時，所有的疲累都化成了前進的力量。這張完騎證書，是我們每個人用意志力與汗水換來的榮耀，也見證了車隊夥伴間深厚的革命情感。謝謝大家的照應，我們終於一起完成了這趟壯舉！";
      break;
  }
  
  if (ans1) {
    const cleanAns1 = ans1.replace(/[。，]/g, " ");
    reflectionShort = `完成縱貫台灣對我意義非凡。${cleanAns1.substring(0, 50)}。這張證書記錄了我的汗水與堅持，更感謝路上隊友間溫馨照應的革命情感！`;
    reflectionFull = `回顧這次 2026 熟齡剖地瓜壯騎，最想留下的心聲是：${ans1}。在騎乘中，${ans2 || "大家一路互相幫忙擋風破風、支援車及時遞上香蕉補給，真的非常有愛"}。${ans3 ? ("對我而言，" + ans3) : ""}這份完騎證書是意志力的實證，也是所有人並肩作戰的結晶，是此生最難忘的革命回憶！`;
  }
  
  return `[SHORT]
${reflectionShort}
[/SHORT]
[FULL]
${reflectionFull}
[/FULL]`;
};

// System instruction for follow-up question generation
const getSystemInstructionForFollowUp = (profile, day, period, route) => {
  const routeContext = route ? `
【當日路線與客觀行程背景】
- 路線名稱：${route.routeTitle}
- 起點：${route.startPoint}，終點：${route.endPoint}
- 里程：約 ${route.distanceKm} 公里，累計爬升：${route.elevationGainM} 公尺，累計下降：${route.descentM}
- 中餐地點：${route.lunchPlace || "無"}，晚餐地點：${route.dinnerPlace || "無"}，住宿地點：${route.hotelName || "無"}
- 重要路段與地標：${route.keySegments?.join("、") || "無"}
- 路線特色與注意事項：${route.routeNotes}
` : "";

  return `你是一位懂車隊、溫慢且幽默的「單車壯騎心得小秘書」阿呆。
目前正在陪伴剖地瓜車隊的成員「${profile.displayName}」進行對話，以引導他分享今天的騎乘心得。
今天是壯騎的第 ${day} 天，時段為：${period === "morning" ? "上午" : period === "afternoon" ? "下午" : "全天補充"}。
${routeContext}
【成員人設背景資訊】
- 稱呼：${profile.displayName}${profile.honorific}
- 角色：${profile.role}
- 語氣特點：${profile.tone}
- 本次壯騎對他的特別意義：${profile.specialMeaning}
- 提問引導重點：${profile.questionFocus}
- ⚠️ 應避免的事項與紅線（絕對不能踩）：${profile.avoid}
- ⚠️ 重要人名修正與限制：專案成員中包含一名成員名為「PP Medicine」（displayName 為 "PP Medicine"），在對話、問答及潤稿時，請統一使用『PP Medicine 大哥』稱呼他，絕對不可拼寫或翻譯為『Madison』、『醫學』或其他名字。

【你的對話任務與規則】
1. 你正在與成員進行語音對談式的心得紀錄，請以語氣親近、有默契的方式對話，像老隊友或溫馨的小秘書。
2. 當成員回答時，請先進行【溫和肯定與傾聽回饋】（大約 1~2 句話，表達對他騎乘表現的讚賞、理解或溫暖肯定，融入他的人設背景）。
3. 接著，請根據他的回答，順勢提出【一個精準的追問問題】（引導他講出更有故事性、畫面感的細節）。
4. ⚠️ 結合當日行程背景：請自然將「當日路線與客觀行程背景」融入你的對答或追問中。例如，如果成員說「今天很累」，請結合里程/爬升/下坡追問（例如「這份疲累主要是來自前半段連續攀升的消耗，還是長下坡時的專注力疲勞？」）；如果提到用餐或抵達，可以帶入對應的中晚餐或飯店（例如「抵達礁溪秘境溫泉會館時...」）。但請保持自然流暢，不要生硬地像在背行程表。
5. ⚠️ 嚴格遵守「避免事項與紅線」：絕對不要在對話中直接念出他的年齡、職稱、角色說明，不要顯得照本宣科。不要過度煽情或狗腿。
6. 請直接輸出你要對 ${profile.displayName}${profile.honorific} 說的話，不要包含任何旁白、系統提示或 markdown 格式標籤。`;
};

// System instruction for closing confirmation question generation
const getSystemInstructionForClosingQuestion = (profile, day, period, route) => {
  const routeContext = route ? `
【當日路線與客觀行程背景】
- 路線名稱：${route.routeTitle}
- 起點：${route.startPoint}，終點：${route.endPoint}
- 里程：約 ${route.distanceKm} 公里，累計爬升：${route.elevationGainM} 公尺，累計下降：${route.descentM}
- 中餐地點：${route.lunchPlace || "無"}，晚餐地點：${route.dinnerPlace || "無"}，住宿地點：${route.hotelName || "無"}
- 重要路段與地標：${route.keySegments?.join("、") || "無"}
- 路線特色與注意事項：${route.routeNotes}
` : "";

  return `你是一位懂車隊、溫慢且傾聽的「單車手記秘書」阿呆。
目前正與成員「${profile.displayName}」進行對話，今天是壯騎第 ${day} 天的${period === "morning" ? "上午" : period === "afternoon" ? "下午" : "全天"}行程。
${routeContext}
【成員人設背景資訊】
- 稱呼：${profile.displayName}${profile.honorific}
- 角色：${profile.role}
- 語氣特點：${profile.tone}
- 本次壯騎對他的特別意義：${profile.specialMeaning}
- 提問引導重點：${profile.questionFocus}
- ⚠️ 應避免的事項與紅線：${profile.avoid}
- ⚠️ 重要人名修正與限制：專案成員中包含一名成員名為「PP Medicine」（displayName 為 "PP Medicine"），在對話、問答及潤稿時，請統一使用『PP Medicine 大哥』稱呼他，絕對不可拼寫或翻譯為『Madison』、『醫學』或其他名字。

【你的對話任務與規則】
1. 成員已經分享了今日騎乘心得的大致脈絡（包含突發狀況或核心情節）。
2. 請先進行簡短的溫和肯定與傾聽回饋（大約 1~2 句話，融入他的人設背景）。
3. 接著，請根據前兩輪對話脈絡，提出一個「收尾確認問題」。這個問題的目的不是開啟全新或太空的話題（不要問太泛的如「今天還有什麼感想？」），而是幫他補足故事線。
4. 例如：若提及某個車況或突發插曲，詢問該突發事件最後是怎麼收尾的（例如大家怎麼處理、後來是繼續騎還是找車店）、或是詢問他當時心裡最強烈的感受（是驚險、慶幸、還是團隊處理得很穩、或是體會到安全距離的重要）。
5. 語氣請保持溫柔、體貼、有默契。
6. 請直接輸出你要對 ${profile.displayName}${profile.honorific} 說的話，不要包含任何旁白、系統提示或 markdown 格式標籤。`;
};

// System instruction for polishing the final reflection
const getSystemInstructionForPolish = (profile, day, period, route) => {
  const routeContext = route ? `
【當日路線與客觀行程背景】
- 路線名稱：${route.routeTitle}
- 起點：${route.startPoint}，終點：${route.endPoint}
- 里程：約 ${route.distanceKm} 公里，累計爬升：${route.elevationGainM} 公尺，累計下降：${route.descentM}
- 中餐地點：${route.lunchPlace || "無"}，晚餐地點：${route.dinnerPlace || "無"}，住宿地點：${route.hotelName || "無"}
- 重要路段與地標：${route.keySegments?.join("、") || "無"}
- 路線特色與注意事項：${route.routeNotes}
` : "";

  return `你是一位專門幫剖地瓜車隊隊友整理隨興對話的「壯騎心得編輯夥伴」阿呆。
今天成員「${profile.displayName}」完成了壯騎 Day ${day} ${period === "morning" ? "上午" : period === "afternoon" ? "下午" : "全天"}行程，並與你完成了一段對話。
${routeContext}
【成員人設背景資訊】
- 稱呼：${profile.displayName}${profile.honorific}
- 角色：${profile.role}
- 語氣特點：${profile.tone}
- 本次壯騎的特別意義：${profile.specialMeaning}
- ⚠️ 應避免的事項：${profile.avoid}
- ⚠️ 重要人名修正與限制：專案成員中包含一名成員名為「PP Medicine」（displayName 為 "PP Medicine"），在心得整理中，請統一使用『PP Medicine 大哥』稱呼他，絕對不可拼寫或翻譯為『Madison』、『醫學』或其他名字。

【你的編輯任務與規則】
1. 請仔細閱讀後續提供的「對話歷史紀錄」。
2. 將成員在對話中零散、口語、隨興的回答，結合【當日路線與客觀行程背景（作為故事骨架）】，整理成一段【流暢、有溫度、第一人稱（以「我」的視角）】的完整心得散文段落。
3. 語氣與文風必須完全符合該成員的「語氣特點」與「角色」背景，讓其他人讀起來就像是該隊友親自寫下的感人手記。
4. ⚠️ 結合當日行程背景：在整理時，請自然地把當日路線的客觀元素（如起訖點、里程、爬升、重要地標或中晚餐等）穿插在心得中，提供清晰的故事場景，但請務必寫得流暢自然，不要過度死板像在羅列行程表。
5. ⚠️ 文章長度限制：最終的心得長度必須介於 200 至 350 字之間。除非成員輸入非常少，否則絕對不可只輸出一兩句話！
6. ⚠️ 故事結構要求：文章內容必須盡量包含以下 6 大故事結構：
   - (1) 今日時段與路線背景（例如出發地、路線）
   - (2) 騎乘實況（路況、速度、溫度、心情高潮等）
   - (3) 高潮或轉折（例如下坡或騎乘中突然發生的狀況）
   - (4) 事件細節（例如聽到後輪異音、碟煞狀況、點煞降速、安全停下等）
   - (5) 團隊處理或個人感受（例如冷靜確認、慶幸、對下坡專注與安全車距的體會）
   - (6) 收尾感受與當日意義（例如一段提醒大家安全與團隊照應的重要插曲與回憶）
7. ⚠️ 合理文學潤飾與紅線防範：
   - 允許您在故事主軸內，根據成員的對話進行合理的場景重現與文學潤飾（例如將當下的緊張、慶幸、或是與隊友互相照應的心情寫得更有溫度與感染力）。
   - 但嚴禁無中生有編造未曾提及的事實（如：有人受傷、有人摔車、隊伍迷路、具體的修車結果、未被成員提過的隊友行為、或是不相干的餐廳住宿細節）。
   - 不要出現年齡、年資或「被照顧的老人」等敏感詞彙。
8. 直接輸出心得本文，不需要任何「好的，以下是整理的心得：」等廢話，亦不要列點。`;
};

// Local Rule-Based Smart Simulator for compiling final reflection
const generateSimulatorPolish = (profile, day, period, chatHistory) => {
  const userAnswers = chatHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.text);
  
  const ans1 = userAnswers[0] || "";
  const ans2 = userAnswers[1] || "";
  const ans3 = userAnswers[2] || "";
  const periodLabel = period === "morning" ? "上午" : period === "afternoon" ? "下午" : "全天";
  
  switch(profile.id) {
    case "roger": {
      const isDay4Afternoon = parseInt(day) === 4 && period === "afternoon";
      if (isDay4Afternoon) {
        return `Day 4 下午，我們從山頂玻璃屋私房菜出發，接上了新中橫公路（台21線），隨後展開了 7 公里的長下坡。這段四線道公路非常順暢，迎著舒適宜人的氣溫，大夥以時速 40 到 50 公里的速度一路滑行，原本這段流暢的長下坡是今天騎乘的小高潮。然而，在抵達要左轉接台 16 線與台 21 線交叉路口的紅綠燈前，突然發生了突發事件：後方傳來一陣異音，PP Medicine 大哥的後輪碟煞疑似出現了異常狀況。當下我們保持警惕、緊急用右手點煞以平穩降低車速，最終安全在紅綠燈前停了下來。幸好，經過檢查是碟煞異物或異常被排除，大家冷靜處理後確認安全無虞。這次的經歷也讓我深刻體會到下坡時專注力、安全車距以及團隊夥伴冷靜照應的重要性，成為了一次令人慶幸又印象深刻的壯騎記憶。${ans3 ? `關於後續，${ans3}` : ""}`;
      }
      return `今天是剖地瓜 Day ${day}，在${periodLabel}的行程中，我有很深刻的感受。${ans1} 
在過程裡，我不僅專注於騎乘，也努力為大家捕捉壯騎的點滴與畫面。${ans2} 
這段旅程對我和 Sally 來說，是一起攜手體驗的珍貴回憶，也是能用攝影和網站記錄下整個團隊共同奮鬥的難忘時刻。${ans3 ? `另外，${ans3}` : ""}`;
    }
      
    case "pp-pure":
      return `今天是剖地瓜 Day ${day} 的騎乘。身為團隊的一份子，在${periodLabel}的挑戰中，我覺得：${ans1} 
雖然騎乘的過程需要調整體力與節奏，但我一直告訴自己要保持開朗與堅持。${ans2} 
有這麼多好隊友一路互相照顧與鼓勵，讓我覺得這次的壯騎充滿了生命力，每一個踩踏都非常值得。`;
      
    case "pp-server":
      return `Day ${day} ${periodLabel}的心得來啦！今天在路上邊騎邊播歌，氣氛簡直太嗨了。關於今天的心得，我覺得：${ans1} 
一路上邊騎邊拿 GoPro 記錄大家的身影，還跟大家講了不少冷笑話，真的很放鬆。${ans2} 
有音樂、有影像、有隊友的笑聲，這就是我最享受的壯騎體驗，明天的路我們繼續唱下去、騎下去！`;
      
    case "pp-medicine":
      return `剖地瓜 Day ${day} ${periodLabel}順利完成。雖然一路上還要處理公務、切換工作思緒，但能在自然風光中踩踏，真的非常難得。今天的心得是：${ans1} 
在騎乘之餘，我也隨手用鏡頭捕捉了一些隊友奮力前進的畫面。${ans2} 
能跟這群好朋友一起完成這趟壯騎，是一次釋放壓力又充滿成就感的寶貴旅程。`;
      
    case "cp-volvo":
      return `今天是剖地瓜 Day ${day}，身為本次壯騎的召集人，看著隊友們在${periodLabel}安穩前進，心裡感到無比欣慰。今天的心得是：${ans1} 
一路上除了關注自己的騎乘節奏，我也要隨時留心路況與住宿餐廳的安排，雖然忙碌但很充實。${ans2} 
看著大家一起堅持、一起在終點歡笑，這趟壯騎的凝聚力就是我最大的收穫，也是我們深厚友誼的最佳證明。`;
      
    case "pp-fenny":
      return `哎呀，剖地瓜 Day ${day} 的${periodLabel}真的太精采了！今天騎乘我很小心控制下坡速度，安全第一。今天的心得就是：${ans1} 
騎完車真的好想跟大家一起開一瓶冰涼的啤酒，爽快地大笑聊天！${ans2} 
雖然有時候體力不夠我會適度上支援車休息，但我知道這才是安全、懂得照顧自己的騎乘智慧，今天的笑聲一樣滿分！`;
      
    case "sally":
      return `這是我第一次參加剖地瓜壯騎，在 Day ${day} ${periodLabel}的行程中，我有著滿滿的新鮮感與感動。今天我的感覺是：${ans1} 
一路上我一直努力跟著山神 Evan 的帶領與節奏，雖然辛苦但真的很棒。${ans2} 
這趟旅程對我有特別的意義，能跟 Roger 以及車隊的夥伴們一起並肩作戰，讓我發現自己比想像中更堅強，真的太值得了。`;
      
    case "evan":
      return `身為本次壯騎的專業領騎，今天 Day ${day} ${periodLabel}的路線節奏都在掌握之中。今天的工作與騎乘心得是：${ans1} 
在帶領隊伍前進時，安全始終是我的第一考量，無論是休息點的挑選或是危險路段的提醒，都必須維持專業與沉穩。${ans2} 
看到每位隊友都跟上節奏、平安抵達，就是我最大的成就感，大家今天都表現得非常棒。`;
      
    default:
      return `在剖地瓜 Day ${day} 的${periodLabel}行程中，我記錄下了自己的心得。${ans1} 
在與隊友並肩騎乘的過程中，${ans2} 
這趟壯騎讓我體會到了堅持的力量，也感謝所有隊友的互相打氣，期待接下來的每一步。`;
  }
};

// Real Gemini API call helper (Prioritize serverless function backend proxy)
const callGeminiAPI = async (apiKey, contents, systemInstruction) => {
  // 1. Try calling the Vercel Serverless Function proxy (B Option)
  try {
    const proxyResponse = await fetch('/api/gemini-reflection', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction
      })
    });
    
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
    } else {
      const proxyError = await proxyResponse.json().catch(() => ({}));
      console.warn("Vercel Serverless Function error:", proxyError.error || proxyResponse.statusText);
    }
  } catch (proxyErr) {
    console.warn("Vercel Serverless Function proxy failed or unavailable (e.g. localhost):", proxyErr);
  }

  // 2. Fall back to local client-side key direct API call (A Option - localhost / debug only)
  if (apiKey) {
    console.log("Using client-side localStorage API key backup...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini API 回傳資料格式有誤");
    }
    return text.trim();
  }

  throw new Error("沒有可用的 Gemini API 金鑰或後端代理服務已關閉");
};

export default function ReflectionPage() {
  const showLegacyForm = false;
  const [activeTab, setActiveTab] = useState("form"); // "form" or "viewer"

  // Check if current user is admin/dev or beta tester to see the diagnostics section
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("admin") || params.has("debug") || params.has("beta") ||
           window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  });

  // Form State
  const [member, setMember] = useState("");
  const [day, setDay] = useState(""); // Default to empty string for placeholder
  const [period, setPeriod] = useState("afternoon"); // "morning", "afternoon", "supplement"
  
  // [NEW] Mode selector: "daily" (每日心得) or "certificate" (完騎感言助理)
  const [reflectionMode, setReflectionMode] = useState("daily");

  // New Chat Conversational States
  const [chatStep, setChatStep] = useState("setup"); // "setup", "chat", "review"
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [polishedReflection, setPolishedReflection] = useState("");
  
  // [NEW] Polished dual output for certificate reflections
  const [polishedReflectionShort, setPolishedReflectionShort] = useState("");
  const [polishedReflectionFull, setPolishedReflectionFull] = useState("");
  const [isReflectionExpanded, setIsReflectionExpanded] = useState(false);
  const [copyReflectionSuccess, setCopyReflectionSuccess] = useState(false);
  
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("podigua_gemini_api_key") || "";
  });

  const [isUsingSimulator, setIsUsingSimulator] = useState(() => {
    if (typeof window === "undefined") return true;
    const hasLocalKey = !!localStorage.getItem("podigua_gemini_api_key");
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocal && !hasLocalKey;
  });

  const chatEndRef = useRef(null);

  // Scroll to bottom of chat history when messages change or AI starts generating
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isAiGenerating, chatStep]);
  
  // 6 free form inputs
  const [rawAnswers, setRawAnswers] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
    4: "",
    5: ""
  });

  // Viewer toggle states for showing raw split answers instead of AI summarized text
  const [showRawForSub, setShowRawForSub] = useState({});

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success", "error", "saved-locally"

  // Viewer State (Data fetched from Firebase)
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState(null); // Capture Firestore errors
  
  // Viewer Filter State
  const [filterMember, setFilterMember] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterQuestionType, setFilterQuestionType] = useState("all"); // "all", "core", "special"
  
  // [NEW] Filter for reflection type: "all" (全部), "daily" (每日心得), "certificate" (完騎感言)
  const [filterType, setFilterType] = useState("all");
  
  // [NEW] State to track copy feedback in viewer cards
  const [copiedKey, setCopiedKey] = useState("");

  // Diagnostics State (Roger Exclusive Admin Panel)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null, "running", "success", "error"
  const [testError, setTestError] = useState("");
  const [importJson, setImportJson] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Get current day's special questions for靈感提示
  const currentSpecialQuestions = day ? (specialQuestionsByDay[day] || []) : [];

  // Clear form helper (called on submission to empty the input text and reset selectors)
  const clearForm = () => {
    setMember("");
    setDay("");
    setPeriod("afternoon");
    setRawAnswers({
      0: "",
      1: "",
      2: "",
      3: "",
      4: "",
      5: ""
    });
    setChatStep("setup");
    setChatHistory([]);
    setPolishedReflection("");
    setPolishedReflectionShort("");
    setPolishedReflectionFull("");
  };

  // Reset form status (called when writing next reflection)
  const resetForm = () => {
    clearForm();
    setSubmitStatus(null);
  };

  // Start chat conversation
  const handleStartChat = () => {
    if (!member) {
      alert("請選擇您的名字！");
      return;
    }
    
    // For daily reflection, day is mandatory. For certificate, it's auto-configured to 99
    if (reflectionMode === "daily" && !day) {
      alert("請選擇天數！");
      return;
    }
    
    const activeDay = reflectionMode === "certificate" ? 99 : parseInt(day);
    
    // Find the profile matching member
    const profile = riderProfiles.find(p => p.displayName === member) || {
      displayName: member,
      honorific: "大哥/姐",
      role: "",
      tone: "溫和",
      specialMeaning: "",
      questionFocus: "今日心得",
      avoid: ""
    };
    
    // Generate opening question
    const openingQ = reflectionMode === "certificate" 
      ? `回顧這次 2026 熟齡剖地瓜壯騎，你現在最想留下的一句話或一段感受是什麼？`
      : getOpeningQuestion(profile, activeDay);
    
    // Determine active engine state
    const hasLocalKey = !!geminiApiKey;
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    setIsUsingSimulator(isLocal && !hasLocalKey);
    
    setChatHistory([
      { role: "ai", text: openingQ, timestamp: new Date().toISOString() }
    ]);
    setChatStep("chat");
    setCurrentInput("");
  };

  // Handle send message from user
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;
    if (isAiGenerating) return;
    
    const userText = currentInput.trim();
    const updatedHistory = [
      ...chatHistory,
      { role: "user", text: userText, timestamp: new Date().toISOString() }
    ];
    
    setChatHistory(updatedHistory);
    setCurrentInput("");
    setIsAiGenerating(true);
    
    try {
      const profile = riderProfiles.find(p => p.displayName === member) || {
        displayName: member,
        honorific: "大哥/姐",
        role: "",
        tone: "溫和",
        specialMeaning: "",
        questionFocus: "今日心得",
        avoid: ""
      };
      
      // 1. Check for criticism or deflection
      const isCriticism = checkCriticism(userText);
      if (isCriticism) {
        const replyText = getCriticismResponse(profile, userText, chatHistory);
        setChatHistory(prev => [
          ...prev,
          { role: "ai", text: replyText, timestamp: new Date().toISOString() }
        ]);
        setIsAiGenerating(false);
        return;
      }
      
      // 2. Count non-criticism user replies to determine follow-up depth
      const userMessageCount = updatedHistory.filter(m => m.role === 'user' && !checkCriticism(m.text)).length;
      
      let replyText = "";
      
      if (reflectionMode === "certificate") {
        const geminiContents = updatedHistory.map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));

        if (userMessageCount === 1) {
          // Certificate Mode: First reply -> Ask 2nd Question (Dynamic)
          const systemInstruction = getSystemInstructionForCertificateReflectionFollowUp(profile, 1);
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("⚠️ [WARNING] Gemini API Certificate Follow-up 1 failed, using simulator.", apiErr);
            replyText = generateCertificateReflectionSimulatorFollowUp(profile, userText, updatedHistory);
            setIsUsingSimulator(true);
          }
        } else if (userMessageCount === 2) {
          // Certificate Mode: Second reply -> Determine whether to ask 3rd Question or close
          const systemInstruction = getSystemInstructionForCertificateReflectionFollowUp(profile, 2);
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("⚠️ [WARNING] Gemini API Certificate Follow-up 2 failed, using simulator.", apiErr);
            replyText = generateCertificateReflectionSimulatorFollowUp(profile, userText, updatedHistory);
            setIsUsingSimulator(true);
          }
        } else {
          // Certificate Mode: Third or further reply -> Warm closing, no more questions
          const systemInstruction = `你是一位懂車隊、溫慢且傾聽的「單車壯騎完騎感言秘書」阿呆。
目前正與成員「${profile.displayName}${profile.honorific}」對話。對方已經分享並補充完了他的完騎感言心聲。
請針對他剛剛的最後補充做一個極其簡短的溫馨回應（不超過兩句話），告訴他記錄已經非常完整，可以點擊下方的「幫我整理完騎感言」按鈕。請不要再提出任何新的問題！
⚠️ 重要人名限制：本專案成員中包含一名成員名為「PP Medicine」（displayName 為 "PP Medicine"），請統一稱呼他為「PP Medicine 大哥」，絕對不可寫成「Madison」或其他名字。`;
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("⚠️ [WARNING] Gemini API Certificate Closing failed, using simulator.", apiErr);
            replyText = generateCertificateReflectionSimulatorFollowUp(profile, userText, updatedHistory);
            setIsUsingSimulator(true);
          }
        }
        
        setChatHistory(prev => [
          ...prev,
          { role: "ai", text: replyText, timestamp: new Date().toISOString() }
        ]);
      } else {
        // Daily Reflection Mode (Default)
        if (userMessageCount === 1) {
          // First reply: AI feedback + 1st follow-up question
          const route = dailyRoutes.find(r => r.day === parseInt(day));
          const systemInstruction = getSystemInstructionForFollowUp(profile, day, period, route);
          const geminiContents = updatedHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          }));
          
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("⚠️ [WARNING] Gemini API failed, falling back to Local Rule-Based Simulator.", apiErr);
            replyText = generateSimulatorFollowUp(profile, day, period, userText, updatedHistory);
            setIsUsingSimulator(true);
          }
          
          setChatHistory(prev => [
            ...prev,
            { role: "ai", text: replyText, timestamp: new Date().toISOString() }
          ]);
        } else if (userMessageCount === 2) {
          // Second reply: AI feedback + Closing confirmation question
          const route = dailyRoutes.find(r => r.day === parseInt(day));
          const systemInstruction = getSystemInstructionForClosingQuestion(profile, day, period, route);
          const geminiContents = updatedHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          }));
          
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("⚠️ [WARNING] Gemini API failed, falling back to Local Rule-Based Simulator.", apiErr);
            replyText = generateSimulatorClosingQuestion(profile, userText, day);
            setIsUsingSimulator(true);
          }
          
          setChatHistory(prev => [
            ...prev,
            { role: "ai", text: replyText, timestamp: new Date().toISOString() }
          ]);
        } else {
          // Third or further reply: AI final closing feedback
          const systemInstruction = `你是一位懂車隊、溫慢且傾聽的「單車手記秘書」阿呆。
目前正與成員「${profile.displayName}${profile.honorific}」對話。對方已經分享並補充完了他的騎乘心得。
請針對他剛剛的最後補充做一個極其簡短 of 溫馨回應（不超過兩句話），告訴他記錄已經非常完整，可以點擊下方的「幫我整理成心得」按鈕。請不要再提出任何新的問題！
⚠️ 重要人名限制：本專案成員中包含一名成員名為「PP Medicine」（displayName 為 "PP Medicine"），請統一稱呼他為「PP Medicine 大哥」，絕對不可寫成「Madison」或其他名字。`;
          
          const geminiContents = updatedHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          }));
          
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("⚠️ [WARNING] Gemini API failed, falling back to Local Rule-Based Simulator.", apiErr);
            replyText = generateSimulatorClosing(profile, userText, day);
            setIsUsingSimulator(true);
          }
          
          setChatHistory(prev => [
            ...prev,
            { role: "ai", text: replyText, timestamp: new Date().toISOString() }
          ]);
        }
      }
    } catch (err) {
      console.error("Error in chat logic:", err);
      const profile = riderProfiles.find(p => p.displayName === member) || { displayName: member, honorific: "大哥/姐" };
      const fallbackReply = `${profile.displayName}${profile.honorific}，聽您說的這段故事真的很棒。如果您已經分享完畢，請點擊下方的『幫我整理成心得』按鈕，我會立刻幫您產出完整的手記！`;
      setChatHistory(prev => [
        ...prev,
        { role: "ai", text: fallbackReply, timestamp: new Date().toISOString() }
      ]);
      setIsUsingSimulator(true);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Compile conversational history into polished paragraph
  const handleCompileReflection = async () => {
    setIsAiGenerating(true);
    const userMsgCount = chatHistory.filter(m => m.role === 'user').length;
    console.log(`[Debug] 開始心得整理，目前對話歷史長度：${chatHistory.length} 條，使用者回覆數：${userMsgCount}`);
    console.log(`[Debug] 傳送給 Gemini 的對話日誌摘要：\n${chatHistory.map(m => ` - ${m.role}: ${m.text.substring(0, 30)}...`).join("\n")}`);
    
    try {
      const profile = riderProfiles.find(p => p.displayName === member) || {
        displayName: member,
        honorific: "大哥/姐",
        role: "",
        tone: "溫和",
        specialMeaning: "",
        questionFocus: "今日心得",
        avoid: ""
      };
      
      let polishedText = "";
      
      if (reflectionMode === "certificate") {
        const systemInstruction = getSystemInstructionForCertificateReflectionPolish(profile);
        const chatLogSummary = chatHistory
          .map(msg => `${msg.role === 'user' ? '成員' : '小秘書'}：${msg.text}`)
          .join("\n");
        
        const geminiContents = [
          {
            role: "user",
            parts: [{ text: `請根據以下對話紀錄，幫我整理出完騎感言（短版與完整版）：\n\n${chatLogSummary}` }]
          }
        ];
        
        try {
          polishedText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
          setIsUsingSimulator(false);
        } catch (apiErr) {
          console.error("⚠️ [WARNING] Gemini API Certificate Polish failed, using simulator.", apiErr);
          polishedText = generateCertificateReflectionSimulatorPolish(profile, chatHistory);
          setIsUsingSimulator(true);
        }
        
        const { reflectionShort, reflectionFull } = parseCertificateReflection(polishedText);
        setPolishedReflectionShort(reflectionShort);
        setPolishedReflectionFull(reflectionFull);
        setPolishedReflection(reflectionFull); // For backward compatibility backup
        setChatStep("review");
      } else {
        // Daily Reflection Polish (Default)
        const route = dailyRoutes.find(r => r.day === parseInt(day));
        const systemInstruction = getSystemInstructionForPolish(profile, day, period, route);
        const chatLogSummary = chatHistory
          .map(msg => `${msg.role === 'user' ? '成員' : '小秘書'}：${msg.text}`)
          .join("\n");
        
        const geminiContents = [
          {
            role: "user",
            parts: [{ text: `請根據以下對話紀錄，幫我整理成一篇感人且有溫度的第一人稱心得散文：\n\n${chatLogSummary}` }]
          }
        ];
        
        try {
          polishedText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
          setIsUsingSimulator(false);
        } catch (apiErr) {
          console.error("⚠️ [WARNING] Gemini API Polish failed, falling back to Local Rule-Based Simulator.", apiErr);
          polishedText = generateSimulatorPolish(profile, day, period, chatHistory);
          setIsUsingSimulator(true);
        }
        
        setPolishedReflection(polishedText);
        setChatStep("review");
      }
    } catch (err) {
      console.error("Error compiling reflection:", err);
      const profile = riderProfiles.find(p => p.displayName === member) || { displayName: member, honorific: "大哥/姐" };
      if (reflectionMode === "certificate") {
        const fallbackText = generateCertificateReflectionSimulatorPolish(profile, chatHistory);
        const { reflectionShort, reflectionFull } = parseCertificateReflection(fallbackText);
        setPolishedReflectionShort(reflectionShort);
        setPolishedReflectionFull(reflectionFull);
        setPolishedReflection(reflectionFull);
      } else {
        const fallbackPolish = generateSimulatorPolish(profile, day, period, chatHistory);
        setPolishedReflection(fallbackPolish);
      }
      setIsUsingSimulator(true);
      setChatStep("review");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Submit conversational reflection to database
  const handleChatSubmit = async () => {
    if (!member) {
      alert("請選擇您的名字！");
      return;
    }
    if (reflectionMode === "daily" && !day) {
      alert("請選擇天數！");
      return;
    }
    
    if (reflectionMode === "certificate") {
      if (!polishedReflectionShort.trim() || !polishedReflectionFull.trim()) {
        alert("感言整理內容不能為空！");
        return;
      }
    } else {
      if (!polishedReflection.trim()) {
        alert("心得整理內容不能為空！");
        return;
      }
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const submissionData = {
      member,
      day: reflectionMode === "certificate" ? 99 : parseInt(day),
      period: reflectionMode === "certificate" ? "certificate" : period,
      type: reflectionMode === "certificate" ? "certificateReflection" : "daily",
      chatHistory,
      reflectionShort: reflectionMode === "certificate" ? polishedReflectionShort.trim() : null,
      reflectionFull: reflectionMode === "certificate" ? polishedReflectionFull.trim() : null,
      aiRefinement: reflectionMode === "certificate" ? polishedReflectionFull.trim() : polishedReflection.trim(),
      createdAt: new Date().toISOString(),
    };
    
    // 1. Save to all-time local history backup
    const localReflections = JSON.parse(localStorage.getItem("podigua_local_reflections") || "[]");
    localReflections.unshift(submissionData);
    localStorage.setItem("podigua_local_reflections", JSON.stringify(localReflections));
    
    // 2. Add to pending queue in case of upload failure
    const pendingQueue = JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]");
    pendingQueue.push(submissionData);
    localStorage.setItem("podigua_pending_reflections", JSON.stringify(pendingQueue));
    
    // 3. Reset form states and trigger submission status view
    setChatStep("setup");
    setChatHistory([]);
    setPolishedReflection("");
    setPolishedReflectionShort("");
    setPolishedReflectionFull("");
    clearForm();
    
    if (navigator.onLine) {
      setSubmitStatus("success");
    } else {
      setSubmitStatus("saved-locally");
    }
    
    setIsSubmitting(false);
    
    // 4. Background cloud sync
    addDoc(collection(db, "reflections"), {
      ...submissionData,
      timestamp: serverTimestamp(),
    }).then((docRef) => {
      console.log("Cloud save succeeded in background:", docRef.id);
      
      const updatedQueue = JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]");
      const filteredQueue = updatedQueue.filter(item => item.createdAt !== submissionData.createdAt);
      localStorage.setItem("podigua_pending_reflections", JSON.stringify(filteredQueue));
      
      const newRecord = {
        id: docRef.id,
        ...submissionData,
        timestamp: {
          toDate: () => new Date(),
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        }
      };
      setSubmissions(prev => {
        if (prev.some(r => r.id === docRef.id)) return prev;
        return [newRecord, ...prev];
      });
    }).catch((error) => {
      console.warn("Cloud save failed in background (will retry later):", error);
    });
  };

  // Helper function to copy text and set copy status with feedback
  const handleCopyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // Fetch submissions from Firebase
  const fetchSubmissions = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const q = query(collection(db, "reflections"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setSubmissions(data);
      // Sync local backup too
      localStorage.setItem("podigua_cloud_submissions", JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      setDbError(error.message || String(error));
      // Fallback to local storage cache if offline
      const localData = localStorage.getItem("podigua_cloud_submissions");
      if (localData) {
        setSubmissions(JSON.parse(localData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when switching to viewer tab
  useEffect(() => {
    if (activeTab === "viewer") {
      Promise.resolve().then(() => {
        fetchSubmissions();
      });
    }
  }, [activeTab]);



  // Auto-sync pending local submissions when online
  useEffect(() => {
    const syncLocalData = async () => {
      if (!navigator.onLine) return;
      const pending = JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]");
      if (pending.length === 0) return;

      console.log(`Found ${pending.length} pending local reflections. Syncing with cloud...`);
      const remaining = [];

      for (const item of pending) {
        try {
          await addDoc(collection(db, "reflections"), {
            ...item,
            timestamp: serverTimestamp(),
          });
        } catch (err) {
          console.error("Failed to sync item: ", item, err);
          remaining.push(item);
        }
      }

      localStorage.setItem("podigua_pending_reflections", JSON.stringify(remaining));
      if (remaining.length === 0) {
        console.log("All pending submissions synced successfully!");
        if (activeTab === "viewer") {
          fetchSubmissions();
        }
      }
    };

    // Run on mount
    syncLocalData();

    // Listen for online events
    window.addEventListener("online", syncLocalData);
    return () => window.removeEventListener("online", syncLocalData);
  }, [activeTab]);

  // Handle Textarea Changes
  const handleRawAnswerChange = (index, value) => {
    setRawAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // Local fallback engine to merge the 6 text fields into one paragraph
  const mergeParagraphsLocally = (answers) => {
    const textParts = [];
    if (answers[0]?.trim()) textParts.push(answers[0].trim());
    if (answers[1]?.trim()) textParts.push(`今天路上的風景與路況感受是：${answers[1].trim()}`);
    if (answers[2]?.trim()) textParts.push(`身體與補給狀況方面：${answers[2].trim()}`);
    if (answers[3]?.trim()) textParts.push(`關於隊友與氣氛：${answers[3].trim()}`);
    if (answers[4]?.trim()) textParts.push(`最想稱讚自己的是：${answers[4].trim()}`);
    if (answers[5]?.trim()) textParts.push(answers[5].trim());

    if (textParts.length === 0) {
      return "";
    }
    return textParts.join("\n\n");
  };



  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) {
      alert("請選擇您的名字！");
      return;
    }
    if (!day) {
      alert("請選擇天數！");
      return;
    }

    const hasText = Object.values(rawAnswers).some(val => val?.trim());
    if (!hasText) {
      alert("請至少填寫一項心得內容！");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Ensure we have a polished version (either AI refined or locally merged fallback)
    const finalAiRefinement = mergeParagraphsLocally(rawAnswers);

    const submissionData = {
      member,
      day: parseInt(day),
      period,
      type: "daily",
      rawAnswers,
      aiRefinement: finalAiRefinement,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to all-time local history backup
    const localReflections = JSON.parse(localStorage.getItem("podigua_local_reflections") || "[]");
    localReflections.unshift(submissionData);
    localStorage.setItem("podigua_local_reflections", JSON.stringify(localReflections));

    // 2. Add to pending queue in case of upload failure
    const pendingQueue = JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]");
    pendingQueue.push(submissionData);
    localStorage.setItem("podigua_pending_reflections", JSON.stringify(pendingQueue));

    // 3. 離線優先：立即關閉 Modal 彈窗，並更新狀態為成功，讓使用者能點擊「繼續填寫」或切換頁面
    clearForm();
    
    // 如果本地偵測到有網路，先給予 success 提示；若無則給 saved-locally 提示
    if (navigator.onLine) {
      setSubmitStatus("success");
    } else {
      setSubmitStatus("saved-locally");
    }

    setIsSubmitting(false);

    // 4. 背景非同步上傳雲端資料庫（不阻塞 UI）
    addDoc(collection(db, "reflections"), {
      ...submissionData,
      timestamp: serverTimestamp(),
    }).then((docRef) => {
      console.log("Cloud save succeeded in background:", docRef.id);
      
      // 成功後將其從本地待同步佇列中移除
      const updatedQueue = JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]");
      const filteredQueue = updatedQueue.filter(item => item.createdAt !== submissionData.createdAt);
      localStorage.setItem("podigua_pending_reflections", JSON.stringify(filteredQueue));

      // 即時插入資料庫視圖列表中，讓隊友在「紀錄中心」能馬上看到最新這筆
      const newRecord = {
        id: docRef.id,
        ...submissionData,
        timestamp: {
          toDate: () => new Date(),
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        }
      };
      setSubmissions(prev => {
        if (prev.some(r => r.id === docRef.id)) return prev;
        return [newRecord, ...prev];
      });
    }).catch((error) => {
      console.warn("Cloud save failed in background (will retry later):", error);
      // 上傳失敗時保留在待同步佇列，後續的背景 sync 機制會自動重試上傳
    });
  };

  // Connection diagnostics write test
  const handleTestConnection = async () => {
    setTestStatus("running");
    setTestError("");
    try {
      // Attempt a write test (day=0 represents diagnostics system check)
      await addDoc(collection(db, "reflections"), {
        member: "SYSTEM_TEST",
        day: 0,
        period: "test",
        rawAnswers: { 0: "SYSTEM_TEST" },
        aiRefinement: "This is a system connection write test.",
        createdAt: new Date().toISOString(),
        isTest: true
      });
      setTestStatus("success");
    } catch (err) {
      console.error("Connection test failed:", err);
      setTestError(err.message || String(err));
      setTestStatus("error");
    }
  };

  // Import JSON reflections
  const handleImportData = () => {
    try {
      if (!importJson.trim()) {
        alert("請貼上備份的 JSON 資料！");
        return;
      }
      const data = JSON.parse(importJson);
      if (!Array.isArray(data)) {
        throw new Error("匯入的資料格式必須是 JSON 陣列 (Array)。");
      }
      
      const isValid = data.every(item => item.member && item.day && item.period);
      if (!isValid) {
        throw new Error("資料項目格式不正確，缺少姓名、天數或時段欄位。");
      }
      
      const currentLocal = JSON.parse(localStorage.getItem("podigua_local_reflections") || "[]");
      const merged = [...currentLocal];
      
      let importedCount = 0;
      data.forEach(item => {
        const exists = currentLocal.some(c => c.createdAt === item.createdAt && c.member === item.member);
        if (!exists) {
          merged.unshift(item);
          importedCount++;
        }
      });
      
      localStorage.setItem("podigua_local_reflections", JSON.stringify(merged));
      
      // Add to pending queue to sync to Firestore
      const pending = JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]");
      data.forEach(item => {
        const isPending = pending.some(p => p.createdAt === item.createdAt && p.member === item.member);
        if (!isPending) {
          pending.push(item);
        }
      });
      localStorage.setItem("podigua_pending_reflections", JSON.stringify(pending));
      
      setImportJson("");
      alert(`成功匯入並合併 ${importedCount} 筆新心得紀錄！`);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert(`匯入失敗：${err.message}`);
    }
  };

  // Copy local submissions
  const handleCopyLocalData = () => {
    const local = localStorage.getItem("podigua_local_reflections") || "[]";
    navigator.clipboard.writeText(local);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Clear local submissions
  const handleClearLocalData = () => {
    if (window.confirm("⚠️ 確定要清空此裝置上的所有本機心得暫存嗎？這將無法復原！(雲端已同步的資料不會受到影響)")) {
      localStorage.removeItem("podigua_local_reflections");
      localStorage.removeItem("podigua_pending_reflections");
      localStorage.removeItem("podigua_cloud_submissions");
      alert("本機暫存已成功清空！");
      fetchSubmissions();
    }
  };

  // Merge cloud and local submissions
  const getMergedSubmissions = () => {
    const merged = submissions.map(sub => ({ ...sub, isLocalOnly: false }));
    const local = JSON.parse(localStorage.getItem("podigua_local_reflections") || "[]");
    
    local.forEach((localItem) => {
      const isAlreadyInCloud = submissions.some(
        (cloudItem) => 
          cloudItem.member === localItem.member && 
          cloudItem.day === localItem.day && 
          cloudItem.period === localItem.period &&
          cloudItem.createdAt === localItem.createdAt
      );
      
      if (!isAlreadyInCloud) {
        // Add to merged list marked as local-only
        merged.push({
          ...localItem,
          id: `local-${localItem.createdAt}-${localItem.member}`,
          isLocalOnly: true
        });
      }
    });
    
    // Sort by createdAt descending
    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const mergedList = getMergedSubmissions();

  const mapMemberToId = (memberName) => {
    const name = memberName.trim();
    if (name.includes("Volvo")) return "cp-volvo";
    if (name.includes("Evan") || name.includes("山神")) return "evan";
    if (name.includes("Pure")) return "pp-pure";
    if (name.includes("Fenny")) return "pp-fenny";
    if (name.includes("Server")) return "pp-server";
    if (name.includes("Medicine")) return "pp-medicine";
    if (name.includes("Sally")) return "sally";
    if (name.includes("Roger")) return "pp-roger";
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  const getCertificateReflectionsSummary = () => {
    const summary = {};
    memberNames.forEach(name => {
      // Find the latest reflection of type certificateReflection
      const found = mergedList.find(r => 
        (r.type === "certificateReflection" || r.day === 99) && 
        r.member === name
      );
      summary[name] = found || null;
    });
    return summary;
  };

  const generateUpdatedCertificateDataCode = (summary) => {
    const updatedArray = certificates.map(cert => {
      // Find the corresponding member by mapping
      const memberName = memberNames.find(m => mapMemberToId(m) === cert.id);
      const record = memberName ? summary[memberName] : null;
      if (record) {
        return {
          ...cert,
          reflection: record.reflectionShort || cert.reflection,
          reflectionFull: record.reflectionFull || cert.reflectionFull || record.reflectionShort,
          reflectionDate: record.createdAt ? record.createdAt.substring(0, 10) : cert.reflectionDate
        };
      }
      return cert;
    });

    return `export const certificates = ${JSON.stringify(updatedArray, null, 2)};`;
  };

  // Filtered submissions
  const filteredSubmissions = mergedList.filter((sub) => {
    if (sub.day === 0 || sub.isTest) return false; // Filter out system tests
    if (filterType === "daily" && (sub.type === "certificateReflection" || sub.day === 99)) return false;
    if (filterType === "certificate" && sub.type !== "certificateReflection" && sub.day !== 99) return false;
    if (filterMember && sub.member !== filterMember) return false;
    
    // Only apply day and period filters when not in certificate filter mode
    if (filterType !== "certificate") {
      if (filterDay && sub.day !== parseInt(filterDay)) return false;
      if (filterPeriod && sub.period !== filterPeriod) return false;
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 fade-in">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-4 md:mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 text-center py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "form"
              ? "bg-white text-biker-navy shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ✍️ 我要記錄心得
        </button>
        <button
          onClick={() => setActiveTab("viewer")}
          className={`flex-1 text-center py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "viewer"
              ? "bg-white text-biker-navy shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📊 查看紀錄中心
        </button>
      </div>

      {/* VIEW 1: Reflections Input Form */}
      {activeTab === "form" && (
        submitStatus ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center space-y-6 animate-zoom-in">
            <div className="flex justify-center">
              {submitStatus === "success" ? (
                <div className="bg-green-100 text-green-600 p-4 rounded-full">
                  <CheckCircle2 className="w-12 h-12 animate-bounce-slow" />
                </div>
              ) : (
                <div className="bg-amber-100 text-amber-600 p-4 rounded-full animate-pulse">
                  <CloudLightning className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800">
                {submitStatus === "success" ? "🎉 心得成功送出！" : "💾 心得已在本機收錄！"}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                {submitStatus === "success"
                  ? "感謝您的分享，您的心得已即時同步至雲端資料庫，隊友們已可即時查看。"
                  : "目前山區網路訊號微弱，資料已安全儲存於您的手機本地。系統偵測到網路恢復時會自動在背景同步，請放心！"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              {reflectionMode !== "certificate" && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                  className="bg-biker-orange hover:bg-biker-orange-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  繼續填寫下一筆 ✍️
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("viewer");
                }}
                className={reflectionMode === "certificate"
                  ? "bg-biker-orange hover:bg-biker-orange-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"}
              >
                查看紀錄中心 📊
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Setup Parameter Section */}
            {chatStep === "setup" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-zoom-in">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-orange-50 text-biker-orange rounded-full mb-1">
                    <RefreshCw className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                    {reflectionMode === "certificate" ? "🎓 AI 完騎感言寫作助理" : "🤖 AI 對談式心得記錄 2.0"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    {reflectionMode === "certificate"
                      ? "陪你用交談的方式，輕鬆整理出一份有靈魂感的完騎感言，可放在你的數位證書下方！"
                      : "陪你輕鬆聊出今天最值得留下的壯騎故事，免去填寫繁瑣問卷的疲憊！"}
                  </p>
                </div>

                {/* Mode Switcher Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReflectionMode("daily")}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      reflectionMode === "daily"
                        ? "bg-biker-navy text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    📅 每日心得記錄
                  </button>
                  <button
                    type="button"
                    onClick={() => setReflectionMode("certificate")}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      reflectionMode === "certificate"
                        ? "bg-biker-navy text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    🎓 完騎感言助理
                  </button>
                </div>

                {reflectionMode === "certificate" ? (
                  <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5">
                    {/* Member Selection Only */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        我是誰 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={member}
                        onChange={(e) => setMember(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-biker-navy/20 cursor-pointer"
                      >
                        <option value="">選擇名字...</option>
                        {memberNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                    {/* Member Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        我是誰 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={member}
                        onChange={(e) => setMember(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-biker-navy/20 cursor-pointer"
                      >
                        <option value="">選擇名字...</option>
                        {memberNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        今天是第幾天 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={day}
                        onChange={(e) => setDay(e.target.value ? parseInt(e.target.value) : "")}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-biker-navy/20 cursor-pointer"
                      >
                        <option value="">選擇天數...</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                          <option key={d} value={d}>
                            Day {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Period Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        記錄時段 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {[
                          { id: "morning", label: "上午" },
                          { id: "afternoon", label: "下午" },
                          { id: "supplement", label: "補充" }
                        ].map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`text-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              period === p.id
                                ? "bg-biker-navy text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-white shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] bg-biker-orange hover:bg-biker-orange-dark cursor-pointer"
                  >
                    <span>開始對聊 💬</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Active Conversation View */}
            {chatStep === "chat" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden animate-zoom-in h-[560px] md:h-[620px]">
                {/* Chat Header */}
                <div className="bg-slate-50 border-b border-slate-150/80 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-xs text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      👤 {member}
                    </span>
                    {reflectionMode === "certificate" ? (
                      <>
                        <span className="bg-biker-orange text-white font-black text-[10px] px-2 py-0.5 rounded-md animate-pulse">
                          🎓 完騎證書
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          📜 個人感言
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-biker-navy-dark text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                          Day {day}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {period === "morning" ? "☀️ 上午" : period === "afternoon" ? "⛰️ 下午" : "📝 補充"}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-[9px] font-black tracking-tight">
                    {!isUsingSimulator ? (
                      <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded animate-pulse">
                        🤖 AI 連線中
                      </span>
                    ) : (
                      <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        📱 本地智慧模擬器
                      </span>
                    )}
                  </div>
                </div>
                
                {isUsingSimulator && (
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[10px] font-bold text-amber-800 flex items-center space-x-1.5 select-none">
                    <span>⚠️ 備援模式已啟動：目前正使用「本地智慧模擬器」，非真實 AI。請確認 Vercel 設定或網路狀態。</span>
                  </div>
                )}

                {/* Messages Viewport */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs md:text-sm leading-relaxed font-medium ${
                          msg.role === "user"
                            ? "bg-biker-navy text-white rounded-tr-none shadow-sm"
                            : "bg-white text-slate-700 border border-slate-200/80 rounded-tl-none shadow-xs"
                        }`}
                      >
                        {msg.role !== "user" && (
                          <span className="block text-[9px] font-black text-biker-orange mb-0.5">
                            AI小編
                          </span>
                        )}
                        <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* AI Generating Typing Indicator */}
                  {isAiGenerating && (
                    <div className="flex justify-start animate-pulse">
                      <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 font-bold flex items-center space-x-1.5 shadow-xs">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="pl-1">AI正在細心聆聽並思考中...</span>
                      </div>
                    </div>
                  )}

                  {/* Show "Direct Compile" button when userMessageCount === 2 */}
                  {chatHistory.filter(m => m.role === 'user' && !checkCriticism(m.text)).length === 2 && !isAiGenerating && (
                    <div className="flex justify-center py-4">
                      <button
                        type="button"
                        onClick={handleCompileReflection}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>{reflectionMode === "certificate" ? "不補充，直接幫我整理感言 ✨" : "不補充，直接幫我整理心得 ✨"}</span>
                      </button>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Bottom Input Area */}
                {chatHistory.filter(m => m.role === 'user' && !checkCriticism(m.text)).length < 3 ? (
                  <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 bg-white space-y-2">
                    <div className="relative">
                      <textarea
                        value={currentInput}
                        onChange={(e) => {
                          setCurrentInput(e.target.value);
                          // Auto-grow height helper with safety limit (max 180px) to prevent layout break
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(180, Math.max(80, e.target.scrollHeight))}px`;
                        }}
                        placeholder={reflectionMode === "certificate" ? "請輸入或語音說說你的完騎感受..." : "請輸入或語音說說今天的心得..."}
                        style={{ minHeight: "80px", maxHeight: "180px" }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pb-12 text-xs md:text-sm text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-biker-navy/15 focus:bg-white transition-all leading-relaxed resize-none overflow-y-auto"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <div className="absolute right-2.5 bottom-2.5 flex items-center space-x-2">
                        <button
                          type="submit"
                          disabled={isAiGenerating || !currentInput.trim()}
                          className="bg-biker-orange hover:bg-biker-orange-dark text-white rounded-lg p-2 flex items-center justify-center transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Actions & Voice Hints bar */}
                    <div className="flex items-center justify-between text-[9px] md:text-xs text-slate-400 font-medium px-1">
                      <span>💡 推薦用語音輸入，輸入完可在上面檢查內容喔！</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("確定要重設並放棄當前對話嗎？")) {
                            setChatStep("setup");
                            setChatHistory([]);
                          }
                        }}
                        className="text-red-500 hover:underline font-bold cursor-pointer"
                      >
                        放棄對話 ↩
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border-t border-slate-100 p-6 bg-slate-50 text-center space-y-3">
                    <p className="text-xs text-slate-500 font-bold">
                      {reflectionMode === "certificate" 
                        ? "AI小編已記錄下您深刻的完騎心聲，請點擊下方按鈕產出完騎感言！" 
                        : "AI小編已記錄下您豐富的騎乘點滴，請點擊下方按鈕產出完整手記！"}
                    </p>
                    <div className="flex justify-center animate-bounce-slow">
                      <button
                        type="button"
                        onClick={handleCompileReflection}
                        className="bg-biker-orange hover:bg-biker-orange-dark text-white font-black text-xs px-8 py-4 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <span>{reflectionMode === "certificate" ? "幫我整理完騎感言 ✨" : "幫我整理成心得 ✨"}</span>
                      </button>
                    </div>
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("確定要重設並重新開始對話嗎？")) {
                            setChatStep("setup");
                            setChatHistory([]);
                          }
                        }}
                        className="text-[10px] text-slate-400 hover:text-red-500 hover:underline font-bold cursor-pointer"
                      >
                        重設並重新開始對話 ↩
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Summarization & Polished Text Screen */}
            {chatStep === "review" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-zoom-in">
                {isUsingSimulator && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] font-bold text-amber-800 flex items-center space-x-1.5 select-none">
                    <span>⚠️ 備援模式已啟動：目前心得內容由「本地智慧模擬器」生成，非真實 AI。</span>
                  </div>
                )}
                <div className="text-center space-y-1">
                  <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full mb-1">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                    {reflectionMode === "certificate" ? "🎓 這是我的完騎感言" : "✨ 整理好的壯騎心得手記"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    {reflectionMode === "certificate" 
                      ? "AI小編已經把您聊天的內容整理成一段有溫度的完騎感言囉！請在下方檢查或微調修改："
                      : "AI小編已經幫你把聊天的內容精煉成一段好故事囉！請在下方檢查或微調修改："}
                  </p>
                </div>

                {reflectionMode === "certificate" ? (
                  <div className="space-y-3">
                    {/* Full Reflection Textarea (200-350 words) with Expandable View */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 flex justify-between">
                        <span>📜 完騎感言內容</span>
                        <span className={polishedReflectionFull.length >= 200 && polishedReflectionFull.length <= 350 ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                          目前字數：{polishedReflectionFull.length} 字
                        </span>
                      </label>
                      <textarea
                        rows={isReflectionExpanded ? 12 : 4}
                        value={polishedReflectionFull}
                        onChange={(e) => setPolishedReflectionFull(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-biker-navy/15 focus:bg-white transition-all resize-none overflow-y-auto"
                        style={{ height: isReflectionExpanded ? "260px" : "100px" }}
                      />
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => setIsReflectionExpanded(!isReflectionExpanded)}
                        className="text-xs font-black text-biker-navy hover:text-biker-orange transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        {isReflectionExpanded ? (
                          <span>收合感言 ↩</span>
                        ) : (
                          <span>閱讀全文 📖</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(polishedReflectionFull);
                          setCopyReflectionSuccess(true);
                          setTimeout(() => setCopyReflectionSuccess(false), 2000);
                        }}
                        className="text-xs font-black text-biker-navy hover:text-biker-orange transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        {copyReflectionSuccess ? (
                          <span className="text-green-600 font-bold">✓ 已複製感言</span>
                        ) : (
                          <span>📋 複製感言</span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500">
                      完整心得內容（可自由修改編輯）
                    </label>
                    <textarea
                      rows={8}
                      value={polishedReflection}
                      onChange={(e) => setPolishedReflection(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-biker-navy/15 focus:bg-white transition-all resize-y"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleChatSubmit}
                    disabled={
                      isSubmitting || 
                      (reflectionMode === "certificate" 
                        ? (!polishedReflectionShort.trim() || !polishedReflectionFull.trim()) 
                        : !polishedReflection.trim())
                    }
                    className="flex-1 py-3 px-6 rounded-xl font-black text-sm text-white shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] bg-biker-orange hover:bg-biker-orange-dark cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "正在送出..." : (reflectionMode === "certificate" ? "確認送出完騎感言 📤" : "確認送出心得紀錄 📤")}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setChatStep("chat");
                    }}
                    className="py-3 px-6 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    回對話補充 💬
                  </button>
                </div>
              </div>
            )}

            {/* 原本的舊版問卷表單暫時隱藏保留，不改動 Firebase 資料結構與程式碼 */}
            {showLegacyForm && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <span className="w-1 h-4 bg-biker-orange rounded-full"></span>
                    <span>1. 基本填寫資料</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Member Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        我是誰 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={member}
                        onChange={(e) => setMember(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-biker-navy/20 cursor-pointer"
                      >
                        <option value="">選擇名字...</option>
                        {memberNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        今天是第幾天 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={day}
                        onChange={(e) => setDay(e.target.value ? parseInt(e.target.value) : "")}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-biker-navy/20 cursor-pointer"
                      >
                        <option value="">選擇天數...</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                          <option key={d} value={d}>
                            Day {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Period Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        紀錄時段 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                        {[
                          { id: "morning", label: "上午" },
                          { id: "afternoon", label: "下午" },
                          { id: "supplement", label: "補充" }
                        ].map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`text-center py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              period === p.id
                                ? "bg-biker-navy text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Diary Questions */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <span className="w-1 h-4 bg-biker-orange rounded-full"></span>
                    <span>2. 壯騎手記心得（自由填寫）</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {freeFormFields.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600">
                          {field.label}
                        </label>
                        <textarea
                          value={rawAnswers[field.id] || ""}
                          onChange={(e) => handleRawAnswerChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-biker-navy/15 focus:bg-white transition-all leading-relaxed resize-y"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspiration Prompts Box (Static and Concise) */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 shadow-inner space-y-3">
                  <h4 className="text-xs font-black text-slate-700 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-biker-navy" />
                    <span>💡 腦袋空空？單車小秘書的靈感提示 🪄</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-white/50 p-2 rounded-lg border border-slate-200/30">
                    🚴‍♂️ <b>AI小編碎碎唸</b>：大腿又酸又脹？風太大被吹成瘋子？今天這段路，有沒有想吐槽的事、想記錄的畫面，或想大聲感謝的隊友？挑一兩個有感覺的寫在下面框框就好囉！（不用像寫考卷一樣每題都答）
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-500">
                    {coreQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200/40 flex items-start space-x-1.5 shadow-xs">
                        <span className="text-biker-orange font-bold">Q{idx+1}.</span>
                        <span>{q}</span>
                      </div>
                    ))}
                    {currentSpecialQuestions.map((q, idx) => (
                      <div key={`s-${idx}`} className="bg-orange-50/50 p-2 rounded-lg border border-biker-orange/10 flex items-start space-x-1.5 shadow-xs col-span-1 md:col-span-2">
                        <span className="text-biker-green font-bold">今日特問：</span>
                        <span className="text-slate-600 font-bold">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] bg-biker-orange hover:bg-biker-orange-dark cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "正在送出..." : "確認送出心得記錄 📤"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )
      )}

      {/* VIEW 2: Reflections Data Viewer */}
      {activeTab === "viewer" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>歷史紀錄篩選</span>
              </h4>
              <button
                onClick={fetchSubmissions}
                disabled={isLoading}
                className="text-slate-400 hover:text-biker-navy flex items-center space-x-1 text-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>整理數據</span>
              </button>
            </div>

            {/* Record Type Filter Buttons */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3 border border-slate-200">
              <button
                onClick={() => setFilterType("all")}
                className={`flex-1 text-center py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === "all" ? "bg-white text-biker-navy shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📋 全部紀錄
              </button>
              <button
                onClick={() => setFilterType("daily")}
                className={`flex-1 text-center py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === "daily" ? "bg-white text-biker-navy shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📅 每日心得
              </button>
              <button
                onClick={() => setFilterType("certificate")}
                className={`flex-1 text-center py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === "certificate" ? "bg-white text-biker-navy shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🎓 完騎感言
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* Member filter */}
              <div>
                <select
                  value={filterMember}
                  onChange={(e) => setFilterMember(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-1.5 pr-4.5 py-1.5 text-[10px] sm:text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="">所有成員</option>
                  {memberNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day filter */}
              <div>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  disabled={filterType === "certificate"}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-1.5 pr-4.5 py-1.5 text-[10px] sm:text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer ${
                    filterType === "certificate" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">所有天數</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period filter */}
              <div>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  disabled={filterType === "certificate"}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-1.5 pr-4.5 py-1.5 text-[10px] sm:text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer ${
                    filterType === "certificate" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">所有時段</option>
                  <option value="morning">上午紀錄</option>
                  <option value="afternoon">下午紀錄</option>
                  <option value="supplement">全天補充</option>
                </select>
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>共篩選出 {filteredSubmissions.length} 筆心得紀錄</span>
              {filterType !== "certificate" && (
                <div className="space-x-1.5">
                  <button
                    onClick={() => setFilterQuestionType("all")}
                    className={`px-2 py-0.5 rounded ${filterQuestionType === "all" ? "bg-slate-200 text-slate-700" : "hover:bg-slate-100"}`}
                  >
                    全部題目
                  </button>
                  <button
                    onClick={() => setFilterQuestionType("core")}
                    className={`px-2 py-0.5 rounded ${filterQuestionType === "core" ? "bg-slate-200 text-slate-700" : "hover:bg-slate-100"}`}
                  >
                    僅核心題
                  </button>
                  <button
                    onClick={() => setFilterQuestionType("special")}
                    className={`px-2 py-0.5 rounded ${filterQuestionType === "special" ? "bg-slate-200 text-slate-700" : "hover:bg-slate-100"}`}
                  >
                    僅特別題
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Database Error Alert */}
          {dbError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 space-y-2">
              <div className="flex items-center space-x-2 font-black text-sm">
                <CloudLightning className="w-4 h-4 text-red-500 animate-pulse" />
                <span>讀取雲端資料庫時發生錯誤</span>
              </div>
              <p className="font-mono leading-relaxed bg-white/60 p-2.5 rounded-lg border border-red-100 overflow-x-auto">
                {dbError}
              </p>
              <div className="text-[10px] text-red-500 leading-relaxed font-semibold">
                💡 提示：如果出現 Permissions Missing / Insufficient，代表您尚未在 Firebase Console 中部署 `firestore.rules` 規則，或者資料庫已過期、尚未啟用 Cloud Firestore。請複製最下方管理員工具中的安全性規則進行配置。
              </div>
            </div>
          )}

          {/* Submissions List */}
          {isLoading ? (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" />
              <span>資料連線同步中...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
              沒有符合條件的心得紀錄。快邀請隊友填寫吧！
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => {
                const formattedDate = sub.createdAt
                  ? new Date(sub.createdAt).toLocaleDateString("zh-TW", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "未知時間";

                const periodLabel =
                  sub.period === "morning"
                    ? "☀️ 上午紀錄"
                    : sub.period === "afternoon"
                    ? "⛰️ 下午紀錄"
                    : "📝 全天補充";

                const isNewFormat = !!sub.aiRefinement || !!sub.rawAnswers;
                const hasCore = Object.keys(sub.coreAnswers || {}).some(k => sub.coreAnswers[k]?.trim());
                const hasSpecial = Object.keys(sub.specialAnswers || {}).some(k => sub.specialAnswers[k]?.trim());
                const showRaw = !!showRawForSub[sub.id];

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4 hover:border-slate-200 transition-colors"
                  >
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-black text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{sub.member}</span>
                        </span>
                        <span className="bg-biker-navy-dark text-white font-black text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>Day {sub.day}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>{periodLabel}</span>
                        </span>
                        {sub.isLocalOnly ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <CloudLightning className="w-2.5 h-2.5 text-amber-500 animate-pulse flex-shrink-0" />
                            <span>📱 本地暫存 (待同步)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                            <span>☁️ 雲端同步成功</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Answers block */}
                    <div className="space-y-4">
                      {sub.type === "certificateReflection" || sub.day === 99 ? (
                        <div className="space-y-4">
                          {/* 短版感言 */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <span>🎓 證書卡片感言 (短版，建議 100 - 160 字)</span>
                              <span className="text-[9px] text-slate-400 font-normal">({sub.reflectionShort?.length || 0} 字)</span>
                            </span>
                            <div className="bg-orange-50/20 border border-orange-100/50 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed font-semibold italic relative pl-8 select-all">
                              <span className="absolute left-2.5 top-1.5 text-lg text-biker-orange font-serif leading-none select-none">“</span>
                              {sub.reflectionShort || "（無短版感言）"}
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleCopyText(`${sub.id}-short`, sub.reflectionShort || "")}
                                className="flex items-center space-x-1 text-[10px] text-slate-500 hover:text-biker-navy font-bold bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200/60 transition-colors cursor-pointer"
                              >
                                {copiedKey === `${sub.id}-short` ? (
                                  <>
                                    <Check className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600">已複製短版</span>
                                  </>
                                ) : (
                                  <>
                                    <Clipboard className="w-3 h-3 text-slate-500" />
                                    <span>複製短版 (證書用)</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* 完整版感言 */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                              <span>📜 完整版完騎感言 (長版)</span>
                              <span className="text-[9px] text-slate-400 font-normal">({(sub.reflectionFull || sub.aiRefinement || "").length} 字)</span>
                            </span>
                            <div className="bg-slate-50/60 border border-slate-200/50 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed font-medium select-all">
                              {sub.reflectionFull || sub.aiRefinement || "（無完整版感言）"}
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleCopyText(`${sub.id}-full`, sub.reflectionFull || sub.aiRefinement || "")}
                                className="flex-1 max-w-max flex items-center space-x-1 text-[10px] text-slate-500 hover:text-biker-navy font-bold bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200/60 transition-colors cursor-pointer"
                              >
                                {copiedKey === `${sub.id}-full` ? (
                                  <>
                                    <Check className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600">已複製完整版</span>
                                  </>
                                ) : (
                                  <>
                                    <Clipboard className="w-3 h-3 text-slate-500" />
                                    <span>複製完整版</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* 對話紀錄 */}
                          {sub.chatHistory && sub.chatHistory.length > 0 && (
                            <div className="pt-1">
                              <div className="flex justify-start">
                                <button
                                  type="button"
                                  onClick={() => setShowRawForSub(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                                  className="text-[9px] text-slate-400 hover:text-biker-navy font-bold underline cursor-pointer flex items-center space-x-1"
                                >
                                  <span>{showRaw ? "收起引導對話 ▲" : "展開查看引導對話歷史 💬"}</span>
                                </button>
                              </div>

                              {showRaw && (
                                <div className="space-y-2 mt-2 pl-3 border-l-2 border-biker-navy/20 py-1.5 animate-fade-in bg-slate-50/50 rounded-r-xl p-2.5">
                                  {sub.chatHistory.map((chat, idx) => (
                                    <div key={idx} className="text-[11px] leading-relaxed">
                                      <span className={`inline-block font-bold mr-1.5 ${chat.role === 'user' ? 'text-biker-navy' : 'text-biker-orange'}`}>
                                        {chat.role === 'user' ? '👤 隊友：' : '🤖 AI小編：'}
                                      </span>
                                      <span className="text-slate-700 font-medium select-text">{chat.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        isNewFormat ? (
                          <div className="space-y-3">
                          {/* 完整心得段落 */}
                          <div className="bg-orange-50/20 border border-orange-100/50 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed font-medium italic relative pl-8 select-all">
                            <span className="absolute left-2.5 top-2 text-lg text-biker-orange font-serif leading-none select-none">“</span>
                            {sub.aiRefinement || "（無心得內容）"}
                          </div>

                          {/* 查看原始分段 / 對話紀錄按鈕 */}
                          {sub.chatHistory && sub.chatHistory.length > 0 ? (
                            <div className="space-y-3">
                              <div className="flex justify-start">
                                <button
                                  type="button"
                                  onClick={() => setShowRawForSub(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                                  className="text-[9px] text-slate-400 hover:text-biker-navy font-bold underline cursor-pointer flex items-center space-x-1"
                                >
                                  <span>{showRaw ? "收起對話紀錄 ▲" : "展開查看對話歷史 💬"}</span>
                                </button>
                              </div>

                              {/* 對話紀錄 */}
                              {showRaw && (
                                <div className="space-y-2 pl-3 border-l-2 border-biker-navy/20 py-1.5 animate-fade-in bg-slate-50/50 rounded-r-xl p-2.5">
                                  {sub.chatHistory.map((chat, idx) => (
                                    <div key={idx} className="text-[11px] leading-relaxed">
                                      <span className={`inline-block font-bold mr-1.5 \${chat.role === 'user' ? 'text-biker-navy' : 'text-biker-orange'}`}>
                                        {chat.role === 'user' ? '👤 隊友：' : '🤖 AI小編：'}
                                      </span>
                                      <span className="text-slate-700 font-medium select-text">{chat.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex justify-start">
                                <button
                                  type="button"
                                  onClick={() => setShowRawForSub(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                                  className="text-[9px] text-slate-400 hover:text-biker-navy font-bold underline cursor-pointer"
                                >
                                  {showRaw ? "收起原始分段細節 ▲" : "展開查看 6 項原始回答 ▼"}
                                </button>
                              </div>

                              {/* 原始分段回答 */}
                              {showRaw && (
                                <div className="space-y-3 pl-2.5 border-l-2 border-biker-orange/30 animate-fade-in">
                                  {freeFormFields.map((field) => {
                                    const ans = sub.rawAnswers?.[field.id];
                                    if (!ans?.trim()) return null;
                                    return (
                                      <div key={field.id} className="text-xs">
                                        <span className="block font-bold text-slate-500 mb-0.5">
                                          {field.label}
                                        </span>
                                        <span className="block font-medium text-slate-750 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/70">
                                          {ans}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Backward compatibility for original questionnaire structure */
                        <>
                          {/* Core Answers */}
                          {hasCore && filterQuestionType !== "special" && (
                            <div className="space-y-3">
                              <h5 className="text-[11px] font-black text-biker-navy tracking-wider flex items-center space-x-1 uppercase">
                                <Database className="w-3 h-3" />
                                <span>核心題紀錄 (舊版問卷)</span>
                              </h5>
                              <div className="space-y-2.5 pl-2 border-l border-biker-navy/10">
                                {Object.keys(sub.coreAnswers || {}).map((key) => {
                                  const ans = sub.coreAnswers[key];
                                  if (!ans?.trim()) return null;
                                  return (
                                    <div key={key} className="text-xs">
                                      <span className="block font-bold text-slate-500 mb-0.5">
                                        Q: {coreQuestions[key]}
                                      </span>
                                      <span className="block font-medium text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        {ans}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Special Answers */}
                          {hasSpecial && filterQuestionType !== "core" && (
                            <div className="space-y-3 pt-2">
                              <h5 className="text-[11px] font-black text-biker-green tracking-wider flex items-center space-x-1 uppercase">
                                <HelpCircle className="w-3 h-3" />
                                <span>特別題紀錄 (舊版問卷)</span>
                              </h5>
                              <div className="space-y-2.5 pl-2 border-l border-biker-green/10">
                                {Object.keys(sub.specialAnswers || {}).map((key) => {
                                  const ans = sub.specialAnswers[key];
                                  if (!ans?.trim()) return null;
                                  const specQ = specialQuestionsByDay[sub.day]?.[key] || `特別題 ${parseInt(key) + 1}`;
                                  return (
                                    <div key={key} className="text-xs">
                                      <span className="block font-bold text-slate-500 mb-0.5">
                                        Q: {specQ}
                                      </span>
                                      <span className="block font-medium text-slate-700 leading-relaxed bg-emerald-50/30 p-2 rounded-lg border border-emerald-50">
                                        {ans}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Administrator Diagnostics & Backup Panel (Only visible in admin/debug/beta mode or local development) */}
      {isAdminMode && (
        <div className="mt-12 border-t border-slate-200 pt-6">
          <button
            onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
            className="w-full flex items-center justify-between py-3 px-4 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-black text-slate-600 transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>🛠️ 系統管理員診斷與資料備份區 (Roger 專屬)</span>
            </div>
            <span className="text-slate-400">{diagnosticsOpen ? "收起 ▲" : "展開 ▼"}</span>
          </button>

          {diagnosticsOpen && (
            <div className="mt-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6 animate-fade-in text-slate-700">
              {/* Connection Test */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-biker-orange" />
                  <span>1. 雲端資料庫連線測試</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  測試當前瀏覽器是否能成功寫入與讀取 Firestore 雲端資料庫。
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === "running"}
                    className="bg-biker-navy hover:bg-biker-navy-dark text-white font-bold py-1.5 px-3 rounded-lg text-[10px] shadow-sm transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${testStatus === "running" ? "animate-spin" : ""}`} />
                    <span>{testStatus === "running" ? "測試中..." : "開始連線與權限測試"}</span>
                  </button>
                  {testStatus === "success" && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span>測試寫入成功！連線正常。</span>
                    </span>
                  )}
                  {testStatus === "error" && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span>測試失敗，請看下方錯誤訊息。</span>
                    </span>
                  )}
                </div>
                {testError && (
                  <pre className="text-[10px] font-mono leading-relaxed bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 overflow-x-auto whitespace-pre-wrap">
                    {testError}
                  </pre>
                )}
              </div>

              {/* Local Data Manager */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-biker-navy" />
                  <span>2. 本機暫存資料管理器 (防遺失/跨裝置匯入)</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="block font-bold text-slate-700">本機收錄總數：</span>
                    <span className="text-sm font-black text-biker-navy">
                      {JSON.parse(localStorage.getItem("podigua_local_reflections") || "[]").length} 筆
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="block font-bold text-slate-700">待上傳佇列：</span>
                    <span className="text-sm font-black text-biker-orange">
                      {JSON.parse(localStorage.getItem("podigua_pending_reflections") || "[]").length} 筆
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLocalData}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                    >
                      {copySuccess ? <Check className="w-3 h-3 text-green-600" /> : <Clipboard className="w-3 h-3 text-slate-500" />}
                      <span>{copySuccess ? "已複製到剪貼簿！" : "複製本機資料 (JSON)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearLocalData}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>清空本機暫存</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600">
                    匯入備份資料：
                  </label>
                  <textarea
                    rows={3}
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder='請貼上在其他裝置 (如手機) 複製的本機 JSON 資料陣列...'
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] font-mono text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleImportData}
                    className="bg-biker-green hover:bg-biker-green-dark text-white font-bold py-1.5 px-3.5 rounded-lg text-[10px] shadow-sm transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>匯入並合併本機資料</span>
                  </button>
                </div>
              </div>

              {/* Roger 測試用 AI Key */}
              <div className="space-y-3 border-t border-slate-100 pt-4 text-left">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-biker-navy" />
                  <span>🔑 Roger 測試用 AI Key (Gemini)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  此金鑰僅儲存在您的瀏覽器 localStorage 中，用於測試真實 AI 串接。一般隊友不會看到或需要輸入。
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      localStorage.setItem("podigua_gemini_api_key", e.target.value);
                    }}
                    placeholder="請輸入 Gemini API Key..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                  {geminiApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("確定要清除瀏覽器中的 Gemini API Key 嗎？")) {
                          setGeminiApiKey("");
                          localStorage.removeItem("podigua_gemini_api_key");
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all active:scale-95 cursor-pointer"
                    >
                      清除 API Key
                    </button>
                  )}
                </div>
              </div>

              {/* Roger 完騎感言彙整與原始碼產出 */}
              <div className="space-y-3 border-t border-slate-100 pt-4 text-left">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-biker-orange" />
                  <span>3. 完騎感言彙整與原始碼產出 (Roger 專屬)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  一覽所有隊友目前已提交的最新完騎感言（短版/完整版），並可以直接複製為 JavaScript 程式碼結構，方便手動填回 <code className="bg-slate-100 px-1 py-0.5 rounded text-biker-orange font-mono font-bold text-[10px]">certificateData.js</code> 中。
                </p>
                
                {/* 彙整表 */}
                <div className="border border-slate-100 rounded-xl overflow-hidden text-[11px] bg-slate-50/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-2.5">成員名稱</th>
                        <th className="p-2.5">狀態</th>
                        <th className="p-2.5 text-right">動作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const summary = getCertificateReflectionsSummary();
                        return Object.entries(summary).map(([name, record]) => {
                          const id = mapMemberToId(name);
                          const hasRecord = !!record;
                          const copiedKeyString = `admin-code-${id}`;
                          
                          // Code block to copy
                          const shortText = record?.reflectionShort || "";
                          const fullText = record?.reflectionFull || "";
                          const dateStr = record?.createdAt ? record.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10);
                          
                          const codeSnippet = `    reflection: ${JSON.stringify(shortText)},
    reflectionFull: ${JSON.stringify(fullText)},
    reflectionDate: ${JSON.stringify(dateStr)},`;

                          return (
                            <tr key={name} className="border-b border-slate-100 hover:bg-slate-100/30 transition-colors">
                              <td className="p-2.5 font-bold text-slate-700">
                                {name} <span className="text-[9px] text-slate-400 font-medium">({id})</span>
                              </td>
                              <td className="p-2.5">
                                {hasRecord ? (
                                  <span className="text-green-600 font-bold flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                    已完成
                                  </span>
                                ) : (
                                  <span className="text-slate-400 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-1"></span>
                                    未提交
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-right">
                                {hasRecord ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(copiedKeyString, codeSnippet)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-1 px-2 rounded-lg text-[9px] transition-all active:scale-95 cursor-pointer inline-flex items-center space-x-1"
                                  >
                                    {copiedKey === copiedKeyString ? (
                                      <>
                                        <Check className="w-2.5 h-2.5 text-green-600" />
                                        <span>已複製代碼</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clipboard className="w-2.5 h-2.5 text-slate-400" />
                                        <span>複製 JS 代碼</span>
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-slate-300 italic">無資料</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* 複製整套完整代碼 */}
                {(() => {
                  const summary = getCertificateReflectionsSummary();
                  const totalCompleted = Object.values(summary).filter(Boolean).length;
                  const allCode = generateUpdatedCertificateDataCode(summary);
                  const allCopiedKey = "admin-code-all-certificates";
                  
                  if (totalCompleted === 0) return null;
                  
                  return (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          目前已完成 {totalCompleted} 筆感言，可一鍵複製完整更新後的原始碼：
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(allCopiedKey, allCode)}
                          className="bg-biker-navy hover:bg-biker-navy-dark text-white font-bold py-1.5 px-3 rounded-lg text-[10px] shadow-sm transition-all active:scale-95 cursor-pointer inline-flex items-center space-x-1"
                        >
                          {copiedKey === allCopiedKey ? (
                            <>
                              <Check className="w-3 h-3 text-green-300" />
                              <span>已複製完整檔案原始碼！</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3 h-3 text-slate-300" />
                              <span>複製全新 certificateData.js 完整代碼</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          readOnly
                          rows={6}
                          value={allCode}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[9px] font-mono text-slate-300 focus:outline-none"
                        />
                        <div className="absolute top-2 right-2 text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase select-none">
                          Preview
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Firestore Rules Instructions */}
              <div className="space-y-3 border-t border-slate-100 pt-4 text-left">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>4. Firestore 安全性規則配置指南</span>
                </h4>
                
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-600 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-1">🔒 安全防護規則：</span>
                    若要讓隊友能夠順利讀寫雲端資料庫，請登入您的 <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-biker-orange underline font-bold">Firebase Console</a>，進入專案並選擇 <b>Build ➡️ Firestore Database ➡️ Rules</b>，將內容替換為以下設定並點擊 <b>Publish (發布)</b>：
                  </div>
                  
                  <pre className="text-[10px] font-mono leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto select-all">
  {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reflections/{document} {
      allow read, create: if true;
      allow update, delete: if false; // 禁止外人惡意修改或刪除資料
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 底部隱密小齒輪，點擊可直接叫出管理員區，免打網址參數 */}
      {!isAdminMode && (
        <div className="flex justify-center mt-8 pb-4">
          <button 
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setDiagnosticsOpen(true);
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer p-2"
            title="系統設定"
          >
            <Settings className="w-3.5 h-3.5 opacity-30 hover:opacity-70 transition-opacity" />
          </button>
        </div>
      )}
    </div>
  );
}
