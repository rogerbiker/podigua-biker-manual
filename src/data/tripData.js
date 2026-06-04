export const members = [
  {
    name: "CP Volvo",
    socialTitle: "扶輪領導人",
    cyclingStartYear: 2008,
    podiguaYears: [2025, 2026],
    teamRole: "團長兼專案發起人",
    description: "負責行程設計、住宿餐飲安排，並於全程行進中押隊，展現全方位領導風格。",
    photoUrl: "/images/members/cp-volvo.jpg"
  },
  {
    name: "山神 Evan",
    socialTitle: "專業領騎",
    cyclingStartYear: 2006,
    podiguaYears: [],
    experienceCount: 5,
    teamRole: "專業旅程領騎",
    description: "負責全程行進中掌控節奏、確保車隊安全、處理臨機應變事項、住宿及餐飲廠商窗口溝通，並隨時提醒隊友旅程細節。",
    photoUrl: "/images/members/shan-shen.jpg"
  },
  {
    name: "PP Pure",
    socialTitle: "扶輪領導人",
    cyclingStartYear: 2014,
    podiguaYears: [2026],
    teamRole: "車隊精神領袖",
    description: "熟齡資深騎士，年屆80歲，第一次參加剖地瓜。長期擔任水上救生員訓練教練。",
    photoUrl: "/images/members/pp-pure.jpg"
  },
  {
    name: "PP Fenny",
    socialTitle: "扶輪領導人",
    cyclingStartYear: 2008,
    podiguaYears: [],
    experienceCount: 3,
    teamRole: "康樂組組長",
    description: "全程擔任住宿及餐廳廠商公關互動，無時不刻提供爽朗笑聲，並全程關注每位成員。",
    photoUrl: "/images/members/fenny.jpg"
  },
  {
    name: "PP Roger",
    socialTitle: "扶輪領導人",
    cyclingStartYear: 1999,
    podiguaYears: [2025, 2026],
    teamRole: "媒體組組長",
    description: "負責製作專案網站，全程協助攝影及錄影，每日製作短影片上傳網站，並協助記錄圖文敘事卡。",
    photoUrl: "/images/members/pp-roger.jpg"
  },
  {
    name: "Sally",
    socialTitle: "金融高管  任職香港",
    cyclingStartYear: 2007,
    podiguaYears: [2026],
    teamRole: "首次受邀體驗成員",
    description: "PP Roger 夫人，受邀首次體驗剖地瓜行程的挑戰與魅力，全程緊跟領騎，協助車隊行進節奏。",
    photoUrl: "/images/members/sally.jpg"
  },
  {
    name: "PP Medicine",
    socialTitle: "企業主",
    cyclingStartYear: 2021,
    podiguaYears: [2025, 2026],
    teamRole: "媒體／康樂組整合",
    description: "全程擔任主要攝影機行進中攝錄影作業，並在住宿及用餐期間負責康樂發起與主持。",
    photoUrl: "/images/members/medicine.jpg"
  },
  {
    name: "PP Server",
    socialTitle: "資訊電子業務高管",
    cyclingStartYear: 1991,
    podiguaYears: [2026],
    teamRole: "媒體／康樂組整合",
    description: "全程協助攝影機行進中攝錄影作業，並於住宿及用餐期間發起與主持康樂活動，同時在行進中提供音樂音響 DJ 支援。",
    photoUrl: "/images/members/pp-server.jpg"
  },
  {
    name: "莊茂昌",
    socialTitle: "支援後勤核心成員",
    teamRole: "支援車司機暨單車維修技師",
    description: "全程緊跟車隊進行補給作業，隨時處置突發異常事項，例如成員上車休息、運送受損單車、緊急維修等；並因應天候惡劣時調整車隊行進模式，全程支持隊員行李及車輛上下作業，特別支援隊友返家及租車返還作業。",
    photoUrl: "/images/members/driver.jpg"
  }
];

export const globalReminders = [
  {
    dayIndex: 1,
    title: "5/27 礁溪秘境需帶泳衣",
    content: "戶外溫泉池開放使用，需穿泳裝。"
  },
  {
    dayIndex: 5,
    title: "5/31 阿宏の家需提前點餐",
    content: "最晚 5/29 點餐。菜單有沙茶鍋、沒有大骨鍋的版本才是最新版。"
  },
  {
    dayIndex: 8,
    title: "6/3 返程安排待補",
    content: "需補上人員返程、單車運送、支援車與行李分流方式。"
  },
  {
    dayIndex: null,
    title: "支援車司機已決定",
    content: "本次後勤支援車司機由莊茂昌大哥擔任，將全程協助隊伍安全補給與行李運送。"
  }
];

export const tripDays = [
  {
    day: 1,
    date: "2026-05-27",
    title: "富貴角燈塔 ～ 礁溪秘境",
    distanceKm: 120,
    elevationM: 2370,
    routeUrl: "https://maps.app.goo.gl/gkiHLBJNLSV3wyEm9",
    lunch: {
      name: "碧潭老街牛肉麵",
      url: "https://maps.app.goo.gl/HHHkoQAet3FdzFew8",
      cost: "牛肉麵",
      note: ""
    },
    lodging: {
      name: "礁溪秘境",
      address: "宜蘭縣礁溪鄉德陽路66巷5號",
      url: "https://maps.app.goo.gl/A6LJjGcujovLNDCx9",
      rooms: "五間房",
      cost: 25000,
      depositPaid: null,
      note: "設施只使用湯屋；會開放戶外溫泉池，需穿泳裝。早餐 7:00 吃飯，8:00 離開。"
    },
    dinner: {
      name: "玉仁八寶冬粉 2號店",
      url: "https://maps.app.goo.gl/Fo7gRg1CDtr65DNJ8",
      cost: "",
      note: ""
    },
    reminders: [
      "請帶泳衣",
      "戶外溫泉池需穿泳裝",
      "隔日早餐 7:00 吃飯，8:00 離開"
    ],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 2,
    date: "2026-05-28",
    title: "礁溪 ～ 南山亞爸的山",
    distanceKm: 86,
    elevationM: 1725,
    routeUrl: "https://maps.app.goo.gl/e5zomxT25Ra1EEaZA",
    lunch: {
      name: "鉄木部落廚房",
      url: "https://maps.app.goo.gl/khwDVaknVyokf2fm6",
      cost: "4,999元/桌",
      note: "泰雅獵人海陸空饗宴"
    },
    lodging: {
      name: "亞爸的山",
      address: "",
      url: "",
      rooms: "包棟，5間房",
      cost: 18900,
      depositPaid: 16800,
      note: ""
    },
    dinner: {
      name: "亞爸的家",
      url: "",
      cost: "",
      note: ""
    },
    reminders: [],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 3,
    date: "2026-05-29",
    title: "南山亞爸的山 ～ 清境",
    distanceKm: 104,
    elevationM: 2735,
    routeUrl: "https://maps.app.goo.gl/5pPxf9jFUdwxQShb7?g_st=ic",
    lunch: {
      name: "梨山好來屋",
      url: "https://maps.app.goo.gl/fQFBVkxyeKSAnr2fA",
      cost: "3,000元/桌",
      note: ""
    },
    lodging: {
      name: "清境宿霧山宛",
      address: "",
      url: "https://maps.app.goo.gl/HxURD4zsB5UYWt7cA",
      rooms: "二人房有陽台 2,000×2；二人房無陽台 1,800×2；一大床有陽台 1,800",
      cost: 9400,
      depositPaid: 2400,
      note: ""
    },
    dinner: {
      name: "清境七彩屋景觀餐廳",
      url: "https://maps.app.goo.gl/FNWvdZLhck6ZNGaw9",
      cost: "3,580元/桌",
      note: "8菜1湯"
    },
    reminders: [],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 4,
    date: "2026-05-30",
    title: "清境 ～ 沙里仙溫泉飯店",
    distanceKm: 98,
    elevationM: 1278,
    routeUrl: "https://maps.app.goo.gl/rsAWND5BA9QMRj5K7?g_st=ic",
    lunch: {
      name: "山頂玻璃屋私房菜",
      url: "https://maps.app.goo.gl/9uwSfCWiSA4FSBNo9",
      cost: "500元/人",
      note: ""
    },
    lodging: {
      name: "沙里仙溫泉飯店",
      address: "",
      url: "",
      rooms: "5間房",
      cost: 22000,
      depositPaid: null,
      note: "每間 4,400 元"
    },
    dinner: {
      name: "飯店內",
      url: "",
      cost: "250元/人",
      note: ""
    },
    reminders: [],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 5,
    date: "2026-05-31",
    title: "沙里仙溫泉飯店 ～ 隙頂",
    distanceKm: 82,
    elevationM: 2068,
    routeUrl: "https://maps.app.goo.gl/sZkNQ2FzKSyppJZc9?g_st=ic",
    lunch: {
      name: "山芝鄉風味館",
      url: "https://maps.app.goo.gl/FRwPcvNTkuK1RtNX8",
      cost: "3,500元/桌",
      note: ""
    },
    lodging: {
      name: "大方茶業民宿",
      address: "",
      url: "",
      rooms: "山景 2,880×2；經濟 2,580×2；4人房山景 3,800",
      cost: 14720,
      depositPaid: 5460,
      note: "320優惠"
    },
    dinner: {
      name: "阿宏の家",
      url: "https://maps.app.goo.gl/9133jYyXWLMvw9p88",
      cost: "",
      note: "最晚 5/29 點餐；菜單有沙茶鍋、沒有大骨鍋的版本才是最新版"
    },
    reminders: [
      "最晚 5/29 點餐",
      "阿宏の家菜單有沙茶鍋、沒有大骨鍋的版本才是最新版"
    ],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 6,
    date: "2026-06-01",
    title: "隙頂 ～ 高樹",
    distanceKm: 122,
    elevationM: 1381,
    routeUrl: "https://maps.app.goo.gl/nuLqqdqJdzRTcjyY7?g_st=ic",
    lunch: {
      name: "樂鳴食堂",
      url: "https://maps.app.goo.gl/S2Mgoq7JGLYFsJ1BA",
      cost: "3,000元/桌",
      note: ""
    },
    lodging: {
      name: "阿伯的店民宿",
      address: "",
      url: "https://maps.app.goo.gl/ksmmRu6aJL8NymNr8",
      rooms: "2樓2間＋3樓1間，可住6位",
      cost: 6100,
      depositPaid: null,
      note: ""
    },
    dinner: {
      name: "民宿隔壁羊肉爐",
      url: "",
      cost: "",
      note: ""
    },
    reminders: [],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 7,
    date: "2026-06-02",
    title: "高樹 ～ 鵝鑾鼻燈塔",
    distanceKm: 124,
    elevationM: 284,
    routeUrl: "https://maps.app.goo.gl/jCU2km2j5aWX5A7FA?g_st=ic",
    lunch: {
      name: "大珍海鮮餐廳",
      url: "https://maps.app.goo.gl/TUN4tjYHJTeTmWsH6",
      cost: "3,500元/桌",
      note: ""
    },
    lodging: {
      name: "秀舍民宿",
      address: "",
      url: "https://maps.app.goo.gl/XtQXxkoQos7HFHTY7",
      rooms: "5間4人房，雙床",
      cost: 10000,
      depositPaid: null,
      note: "不供早餐，每間 2,000 元"
    },
    dinner: {
      name: "恆春鎮小吃",
      url: "",
      cost: "",
      note: ""
    },
    reminders: [],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    }
  },
  {
    day: 8,
    date: "2026-06-03",
    title: "恆春 ～ 家",
    distanceKm: 0,
    elevationM: 0,
    routeUrl: "",
    lunch: null,
    lodging: null,
    dinner: null,
    reminders: [
      "返程安排待補：需補上人員返程、單車運送、支援車與行李分流方式"
    ],
    media: {
      teamVideoUrl: "",
      photos: [],
      videos: []
    },
    reflections: {
      rogerNote: "",
      teamNotes: [],
      personalComments: []
    },
    otherNotes: "人車返程安排、支援車與單車運送、隊員返家動線。返程細節待補。"
  }
];

export const dailyVideos = [
  {
    day: 1,
    title: "Day 1 精選短片",
    videoType: "youtube",
    youtubeUrl: "https://youtu.be/Y-Wzr0-Mt-M",
    youtubeEmbedUrl: "https://www.youtube.com/embed/Y-Wzr0-Mt-M",
    googlePhotosUrl: "https://photos.app.goo.gl/qcddGxCvxcCHvWBn8",
    thumbnail: "/images/videos/day1-video-cover.jpg"
  },
  {
    day: 2,
    title: "Day 2 精選短片",
    videoType: "youtube",
    youtubeUrl: "https://youtu.be/6jlrhyEhALA",
    youtubeEmbedUrl: "https://www.youtube.com/embed/6jlrhyEhALA",
    googlePhotosUrl: "https://photos.app.goo.gl/UAzYEdXUHgujz3N7A",
    thumbnail: "/images/videos/day2-video-cover.jpg"
  },
  {
    day: 3,
    title: "Day 3 精選短片",
    videoType: "googlePhotos",
    googlePhotosUrl: "",
    thumbnail: ""
  },
  {
    day: 4,
    title: "Day 4 精選短片",
    videoType: "googlePhotos",
    googlePhotosUrl: "",
    thumbnail: ""
  },
  {
    day: 5,
    title: "Day 5 精選短片",
    videoType: "googlePhotos",
    googlePhotosUrl: "",
    thumbnail: ""
  },
  {
    day: 6,
    title: "Day 6 精選短片",
    videoType: "googlePhotos",
    googlePhotosUrl: "",
    thumbnail: ""
  },
  {
    day: 7,
    title: "Day 7 精選短片",
    videoType: "googlePhotos",
    googlePhotosUrl: "",
    thumbnail: ""
  },
  {
    day: 8,
    title: "Day 8 精選短片",
    videoType: "googlePhotos",
    googlePhotosUrl: "",
    thumbnail: ""
  }
];

