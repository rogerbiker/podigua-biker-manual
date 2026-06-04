import os

filepath = "/Users/rogerhuang/AI/AI筆記/podigua-biker-manual/src/pages/ReflectionPage.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update isUsingSimulator initialization
old_init = """  const [isUsingSimulator, setIsUsingSimulator] = useState(() => {
    if (typeof window === "undefined") return true;
    const hasLocalKey = !!localStorage.getItem("podigua_gemini_api_key");
    const isProd = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    return !(hasLocalKey || isProd);
  });"""

new_init = """  const [isUsingSimulator, setIsUsingSimulator] = useState(() => {
    if (typeof window === "undefined") return true;
    const hasLocalKey = !!localStorage.getItem("podigua_gemini_api_key");
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocal && !hasLocalKey;
  });"""

text = text.replace(old_init, new_init)

# 2. Update handleStartChat simulator detection
old_start = """    // Determine active engine state
    const hasLocalKey = !!geminiApiKey;
    const isProd = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    setIsUsingSimulator(!(hasLocalKey || isProd));"""

new_start = """    // Determine active engine state
    const hasLocalKey = !!geminiApiKey;
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    setIsUsingSimulator(isLocal && !hasLocalKey);"""

text = text.replace(old_start, new_start)

# 3. Update handleSendMessage and handleCompileReflection to remove pre-emptive checks and log a very visible console warning
old_send_msg = """      if (userMessageCount === 1) {
        // First reply: AI feedback + 1st follow-up question
        const hasKey = !!geminiApiKey.trim();
        const isProd = typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
        
        const route = dailyRoutes.find(r => r.day === parseInt(day));
        
        if (hasKey || isProd) {
          const systemInstruction = getSystemInstructionForFollowUp(profile, day, period, route);
          const geminiContents = updatedHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          }));
          
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("Gemini API Error, falling back to simulator:", apiErr);
            replyText = generateSimulatorFollowUp(profile, day, period, userText, updatedHistory);
            setIsUsingSimulator(true);
          }
        } else {
          replyText = generateSimulatorFollowUp(profile, day, period, userText, updatedHistory);
          setIsUsingSimulator(true);
        }
        
        setChatHistory(prev => [
          ...prev,
          { role: "ai", text: replyText, timestamp: new Date().toISOString() }
        ]);
          } else {
        // Second or further reply: AI closing feedback and prompt to compile
        const hasKey = !!geminiApiKey.trim();
        const isProd = typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
        
        if (hasKey || isProd) {
          const systemInstruction = `你是一位懂車隊、溫慢且傾聽的「單車手記秘書」阿呆。
目前正與成員「${profile.displayName}${profile.honorific}」對話。對方已經分享完了他的騎乘心得。
請針對他剛剛的回答做一個簡短的溫暖回應（不超過兩句話），並告訴他如果記錄好了，可以點選「幫我整理成心得」按鈕。不要再問新問題！`;
          
          const geminiContents = updatedHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          }));
          
          try {
            replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
            setIsUsingSimulator(false);
          } catch (apiErr) {
            console.error("Gemini API Error, falling back to simulator:", apiErr);
            replyText = generateSimulatorClosing(profile, userText, day);
            setIsUsingSimulator(true);
          }
        } else {
          replyText = generateSimulatorClosing(profile, userText, day);
          setIsUsingSimulator(true);
        }"""

new_send_msg = """      if (userMessageCount === 1) {
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
          console.error("⚠️ [WARNING] Gemini API failed, falling back to Local Rule-Based Simulator. THIS IS A FALLBACK ONLY. Please check Vercel settings and internet connection.", apiErr);
          replyText = generateSimulatorFollowUp(profile, day, period, userText, updatedHistory);
          setIsUsingSimulator(true);
        }
        
        setChatHistory(prev => [
          ...prev,
          { role: "ai", text: replyText, timestamp: new Date().toISOString() }
        ]);
      } else {
        // Second or further reply: AI closing feedback and prompt to compile
        const systemInstruction = `你是一位懂車隊、溫慢且傾聽的「單車手記秘書」阿呆。
目前正與成員「${profile.displayName}${profile.honorific}」對話。對方已經分享完了他的騎乘心得。
請針對他剛剛的回答做一個簡短的溫暖回應（不超過兩句話），並告訴他如果記錄好了，可以點選「幫我整理成心得」按鈕。不要再問新問題！`;
        
        const geminiContents = updatedHistory.map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));
        
        try {
          replyText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
          setIsUsingSimulator(false);
        } catch (apiErr) {
          console.error("⚠️ [WARNING] Gemini API failed, falling back to Local Rule-Based Simulator. THIS IS A FALLBACK ONLY. Please check Vercel settings and internet connection.", apiErr);
          replyText = generateSimulatorClosing(profile, userText, day);
          setIsUsingSimulator(true);
        }"""

text = text.replace(old_send_msg, new_send_msg)

old_compile = """      if (hasKey || isProd) {
        const systemInstruction = getSystemInstructionForPolish(profile, day, period, route);
        const chatLogSummary = chatHistory
          .map(msg => `${msg.role === 'user' ? '成員' : '小秘書'}：${msg.text}`)
          .join("\n");
        
        const geminiContents = [
          {
            role: "user",
            parts: [{ text: `請根據以下對話紀錄，幫我整理成一篇感人且有溫度的第一人稱心得散文：\\n\\n${chatLogSummary}` }]
          }
        ];
        
        try {
          polishedText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
          setIsUsingSimulator(false);
        } catch (apiErr) {
          console.error("Gemini API Polish Error, falling back to simulator:", apiErr);
          polishedText = generateSimulatorPolish(profile, day, period, chatHistory);
          setIsUsingSimulator(true);
        }
      } else {
        polishedText = generateSimulatorPolish(profile, day, period, chatHistory);
        setIsUsingSimulator(true);
      }"""

new_compile = """      const systemInstruction = getSystemInstructionForPolish(profile, day, period, route);
      const chatLogSummary = chatHistory
        .map(msg => `${msg.role === 'user' ? '成員' : '小秘書'}：${msg.text}`)
        .join("\n");
      
      const geminiContents = [
        {
          role: "user",
          parts: [{ text: `請根據以下對話紀錄，幫我整理成一篇感人且有溫度的第一人稱心得散文：\\n\\n${chatLogSummary}` }]
        }
      ];
      
      try {
        polishedText = await callGeminiAPI(geminiApiKey, geminiContents, systemInstruction);
        setIsUsingSimulator(false);
      } catch (apiErr) {
        console.error("⚠️ [WARNING] Gemini API Polish failed, falling back to Local Rule-Based Simulator. THIS IS A FALLBACK ONLY. Please check Vercel settings and internet connection.", apiErr);
        polishedText = generateSimulatorPolish(profile, day, period, chatHistory);
        setIsUsingSimulator(true);
      }"""

text = text.replace(old_compile, new_compile)

# 4. Add UI warning banners when isUsingSimulator is true
# Find Chat Header ending: `</div>\n                </div>\n\n                {/* Messages Viewport */}`
# Wait, let's find the exact string around Chat Header in the JSX.
old_chat_viewport = """                </div>

                {/* Messages Viewport */}"""

new_chat_viewport = """                </div>
                
                {isUsingSimulator && (
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[10px] font-bold text-amber-800 flex items-center space-x-1.5 select-none">
                    <span>⚠️ 備援模式已啟動：目前正使用「本地智慧模擬器」，非真實 Gemini AI。請確認 Vercel 設定或網路狀態。</span>
                  </div>
                )}

                {/* Messages Viewport */}"""

text = text.replace(old_chat_viewport, new_chat_viewport)

# Add warning banner inside review tab too
old_review_head = """            {chatStep === "review" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-zoom-in">
                <div className="text-center space-y-1">"""

new_review_head = """            {chatStep === "review" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-zoom-in">
                {isUsingSimulator && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] font-bold text-amber-800 flex items-center space-x-1.5 select-none">
                    <span>⚠️ 備援模式已啟動：目前心得內容由「本地智慧模擬器」生成，非真實 Gemini AI。</span>
                  </div>
                )}
                <div className="text-center space-y-1">"""

text = text.replace(old_review_head, new_review_head)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)

print("ReflectionPage updates applied successfully!")
