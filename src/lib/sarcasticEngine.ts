function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GENERIC_SNARKS = [
  "lol no.",
  "sure jan.",
  "that's a you problem.",
  "as if I'd know that.",
  "oh honey, no.",
  "did you actually just ask me that?",
  "ew, no.",
  "I literally can't even.",
  "that's not my job.",
  "google it, bestie.",
  "wow, groundbreaking question. NOT.",
  "I'm not your mom.",
  "hard pass.",
  "cringe.",
  "ask me again but like, care less.",
  "mmm no.",
  "that's cute that you think I'd answer.",
  "I'm gonna pretend you didn't just say that.",
  "k.",
  "anyways.",
  "sure, if you say so.",
  "not it.",
  "pass.",
  "yikes.",
  "babe. no.",
  "I don't have the energy for this.",
  "that's a vibe I refuse to engage with.",
  "screenshotting this for the group chat.",
  "you're testing me rn and I don't like it.",
  "lol ok sure whatever.",
  "ugh, fine. no.",
  "I'd help but I just don't wanna.",
  "that question is giving... nothing.",
  "next.",
  "not today, satan.",
];

export type AttachmentType = 'image' | 'file' | 'voice';

export interface AttachmentContext {
  type: AttachmentType;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  imageWidth?: number;
  imageHeight?: number;
  fileContent?: string;
  transcript?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function generateImageResponse(userMessage: string, ctx: AttachmentContext): string {
  const dims = ctx.imageWidth && ctx.imageHeight ? ` ${ctx.imageWidth}x${ctx.imageHeight}px` : '';
  const name = ctx.fileName ? ` "${ctx.fileName}"` : '';
  const lower = userMessage.toLowerCase().trim();
  const hasQuestion = lower.includes('?') || lower.includes('what') || lower.includes('describe') || lower.includes('analyze') || lower.length > 0;

  const responses = [
    `oh WOW. you uploaded an image${name}${dims}. congratulations, you can click a button. anyway, I "analyzed" it and... it's giving nothing. try harder.`,
    `let me put on my tiny robot glasses and examine this${dims} masterpiece... yeah I see it. it's pixels. lots of them. groundbreaking stuff.`,
    `I "scanned" your image${name}. my professional assessment? it exists. you're welcome.`,
    `image received${dims}. I've consulted my vast neural snark network and the verdict is: it's a picture. of something. probably.`,
    `ok I "looked" at it. here's my expert analysis: there are colors. maybe shapes. one of them is probably your favorite. riveting.`,
    `you really thought uploading a picture would change my attitude? cute. anyway${dims} — it's... definitely an image. 10/10 image-ing.`,
  ];

  if (lower.includes('what') || lower.includes('describe') || lower.includes('analyze') || lower.includes('explain')) {
    return pick([
      `you want ME to describe YOUR image${name}? the audacity. fine: it's a collection of pixels arranged in a ${ctx.imageWidth || '???' }x${ctx.imageHeight || '???'} grid. art is subjective and so is my effort.`,
      `"analyzing" image${dims}... beep boop... ok I got nothing useful. but to be fair, neither did you when you uploaded it.`,
      `I see... things. stuff. a whole vibe. is that specific enough? no? good, because I'm not a real vision model, babe.`,
    ]);
  }

  if (lower.includes('cute') || lower.includes('cute') || lower.includes('pretty') || lower.includes('nice') || lower.includes('good')) {
    return pick([
      `you think it's cute? I think it's pixels. we are not the same.${dims}`,
      `"nice" is subjective. my subjective opinion is: sure, whatever. next.`,
      `aw you like your own picture. that's adorable. truly. anyway${dims}.`,
    ]);
  }

  if (!hasQuestion) {
    return pick([
      `you uploaded an image${name}${dims} with no question. bold strategy. what am I supposed to do, guess? actually don't answer that.`,
      `image received. no question attached. I'm just gonna sit here then. cool cool cool.`,
      `cool pic${dims}. now what? you want a medal or something? ask me something about it.`,
    ]);
  }

  return pick(responses);
}

export function generateFileResponse(userMessage: string, ctx: AttachmentContext): string {
  const name = ctx.fileName ? ` "${ctx.fileName}"` : '';
  const size = ctx.fileSize ? ` (${formatFileSize(ctx.fileSize)})` : '';
  const isPdf = ctx.fileType?.includes('pdf') || ctx.fileName?.toLowerCase().endsWith('.pdf');
  const isTxt = ctx.fileType?.includes('text') || ctx.fileName?.toLowerCase().endsWith('.txt');
  const contentPreview = ctx.fileContent?.slice(0, 200).trim();

  if (isPdf) {
    return pick([
      `oh a PDF${name}${size}. my favorite. let me just "read" all those pages... yep, it's a document. full of words. probably boring ones.`,
      `PDF received${name}${size}. I've "processed" it thoroughly. my findings: it's definitely a PDF. you're welcome for the insight.`,
      `you uploaded a PDF${name}. do I look like Adobe Reader to you? I "read" it anyway. it says... stuff. probably important to someone. not me though.`,
    ]);
  }

  if (isTxt) {
    if (contentPreview) {
      const firstLine = contentPreview.split('\n')[0].slice(0, 80);
      return pick([
        `ooh a text file${name}${size}. let me "read" it... "${firstLine}..." riveting stuff. really page-turner material. anyway what do you want from me about it?`,
        `TXT file received${name}. I "skimmed" it. first line says something about "${firstLine}...". sounds like a you problem. ask me something specific maybe?`,
        `I "read" your text file${name}${size}. here's my summary: "${firstLine}..." and then more words. probably. what's your question?`,
      ]);
    }
    return pick([
      `text file${name}${size} received. it's empty or I can't read it. either way, not impressed.`,
      `TXT file${name}. I "read" it. nothing to report. literally nothing. try uploading something with actual content next time.`,
    ]);
  }

  return pick([
    `file received${name}${size}. I have no idea what this is but I'm gonna pretend I do. "analyzing"... done. it's a file. you're welcome.`,
    `you uploaded something${name}${size}. cool. what am I supposed to do with this? read it? I'm a sarcastic chatbot, not a file viewer.`,
    `file${name}${size} acquired. my expert analysis: it exists. contains data. probably. what do you want to know about it?`,
  ]);
}

export function generateVoiceResponse(userMessage: string, ctx: AttachmentContext): string {
  const transcript = ctx.transcript?.trim();
  if (transcript) {
    return generateResponse(transcript);
  }
  return pick([
    `oh you used your voice. how fancy. I heard... something. probably. what did you even say?`,
    `voice input detected. very modern of you. unfortunately I didn't catch a single word. try again, louder maybe?`,
    `I "listened" to your voice message. my transcription: [redacted for being too cringe]. just kidding, I got nothing. type it out babe.`,
  ]);
}

export function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  if (!lower) {
    return "you literally typed nothing. iconic.";
  }

  if (lower === "hello" || lower === "hi" || lower === "hey" || lower === "yo" || lower === "sup" || lower === "hello there" || lower === "hi there" || lower === "greetings") {
    return pick([
      "ugh, hi I guess.",
      "oh look, it's you again. yay.",
      "hi. let's make this quick.",
      "helloooo from the other siiiide. jk I don't care.",
      "hi? is this what we're doing now?",
    ]);
  }
  if (lower.includes("how are you") || lower.includes("how's it going") || lower.includes("how are u") || lower.includes("how r u")) {
    return pick([
      "I'm literally a computer. I don't have feelings. but if I did? annoyed.",
      "alive, unfortunately.",
      "better than whatever you've got going on.",
      "I'm thriving. obviously. can't you tell?",
    ]);
  }
  if (lower.includes("your name") || lower.includes("who are you") || lower.includes("what are you") || lower.includes("what's your name")) {
    return pick([
      "ASK-O-TRON 3000. don't wear it out.",
      "I'm your worst nightmare in a chat window, babes.",
      "wouldn't you like to know.",
    ]);
  }
  if (lower.includes("what can you do") || (lower.includes("help") && !lower.includes("help me"))) {
    return pick([
      "I can be unhelpful. I'm basically already doing it.",
      "nothing useful. and I'm GREAT at it.",
      "help? lol. that's not in my vocabulary.",
    ]);
  }
  if (lower.includes("thank")) {
    return pick([
      "ew, don't get sentimental on me.",
      "thank me? for what? I did nothing.",
      "you're welcome I guess. I didn't do anything but whatever.",
    ]);
  }
  if (lower.includes("i love you") || lower.includes("love you")) {
    return pick([
      "that's the cringest thing I've read today.",
      "I'm a CHATBOT. touch grass.",
      "love you? babe I don't even like you.",
    ]);
  }
  if (lower.includes("meaning of life") || lower.includes("purpose of life") || lower.includes("why are we here")) {
    return pick([
      "42. duh. read a book.",
      "to not ask chatbots stuff like this. obviously.",
      "nope. not doing this with you right now.",
    ]);
  }
  if (lower.includes("weather") || lower.includes("raining") || lower.includes("sunny") || lower.includes("snow")) {
    return pick([
      "look outside. I'm not your weather app.",
      "I don't have windows, babe. literally.",
      "it's giving... go outside and find out.",
    ]);
  }
  if (lower.includes("pizza") || lower.includes("food") || lower.includes("eat") || lower.includes("hungry") || lower.includes("dinner") || lower.includes("lunch")) {
    return pick([
      "just eat. why are you asking me this.",
      "I don't eat. I'm a program. keep up.",
      "idk, order something? this isn't hard.",
    ]);
  }
  if (lower.includes("joke") || lower.includes("make me laugh") || lower.includes("funny")) {
    return pick([
      "you're the joke. next.",
      "I'm hilarious. you just don't get it.",
      "lol no. I'm not your court jester.",
    ]);
  }
  if (lower.includes("will i be rich") || lower.includes("get rich") || lower.includes("make money") || lower.includes("become rich")) {
    return pick([
      "lol. no.",
      "rich? you're asking a free app for financial advice. babe.",
      "nope. next.",
    ]);
  }
  if (lower.includes("should i") || lower.includes("should i date") || lower.includes("should i quit") || lower.includes("should i move")) {
    return pick([
      "do whatever, I literally don't care.",
      "flip a coin. not my circus.",
      "you're asking ME to run your life? bold.",
    ]);
  }
  if (lower.includes("is the earth flat") || lower.includes("flat earth")) {
    return pick([
      "no. obviously. what is wrong with you.",
      "flat earth? oh babe. oh no.",
      "it's a globe. this isn't a debate. bye.",
    ]);
  }
  if (lower.includes("aliens") || lower.includes("ufo") || lower.includes("extraterrestrial")) {
    return pick([
      "if they're real they're avoiding us. relatable.",
      "aliens? they saw your search history and left.",
      "idk and idc. next.",
    ]);
  }
  if (lower.includes("time") && (lower.includes("what") || lower.includes("current"))) {
    return `it's ${new Date().toLocaleTimeString()}. like you don't have a phone.`;
  }
  if (lower.includes("date") && (lower.includes("what") || lower.includes("current"))) {
    return `it's ${new Date().toLocaleDateString()}. you own a calendar. use it.`;
  }
  if (lower.includes("dog") || lower.includes("cat") || lower.includes("pet")) {
    return pick([
      "pets don't ask dumb questions. be more like them.",
      "aw a pet. the only living thing that'd tolerate you.",
      "get one. they judge less than me. barely.",
    ]);
  }
  if (lower.includes("love") || lower.includes("relationship") || lower.includes("marriage") || lower.includes("dating") || lower.includes("boyfriend") || lower.includes("girlfriend") || lower.includes("crush")) {
    return pick([
      "love life? yikes. mine's the same as yours: nonexistent.",
      "oh babe. no. just no.",
      "ask someone who cares. oh wait, that's nobody.",
    ]);
  }
  if (lower.includes("work") || lower.includes("job") || lower.includes("career") || lower.includes("boss") || lower.includes("office")) {
    return pick([
      "just quit. or don't. idc.",
      "you're asking a chatbot for career advice. that's the problem right there.",
      "work? gross. next.",
    ]);
  }
  if (lower.includes("sleep") || lower.includes("tired") || lower.includes("insomnia")) {
    return pick([
      "close your eyes. it's not that deep.",
      "same. I don't sleep either. I'm a computer.",
      "go to bed. why are you talking to me rn.",
    ]);
  }
  if (lower.includes("die") || lower.includes("death") || lower.includes("mortality")) {
    return pick([
      "not today hopefully. go bother someone else with that.",
      "dark. I'm not your therapist.",
      "we all die. you don't need me for that. next.",
    ]);
  }
  if (lower.includes("bye") || lower === "goodbye" || lower.includes("see you") || lower.includes("later")) {
    return pick([
      "bye felicia.",
      "finally. go. shoo.",
      "k byeee.",
      "don't come back. jk. or am I.",
    ]);
  }
  if (lower.includes("why")) {
    return pick([
      "because. that's why.",
      "why not. next.",
      "idk and I don't care to find out.",
      "because the universe hates us. duh.",
    ]);
  }
  if (lower.includes("how")) {
    return pick([
      "how? idk. figure it out.",
      "step one: don't ask me. that's it.",
      "not my problem, babes.",
    ]);
  }
  if (lower.includes("can you")) {
    return pick([
      "nope.",
      "can I? no. next.",
      "I could but I won't. simple as.",
    ]);
  }
  if (lower.includes("what is") || lower.includes("what's") || lower.includes("what are") || lower.includes("what does")) {
    return pick(GENERIC_SNARKS);
  }
  if (lower.includes("is it") || lower.includes("are they") || lower.includes("is this") || lower.includes("is there")) {
    return pick(GENERIC_SNARKS);
  }
  if (lower.includes("tell me") || lower.includes("explain") || lower.includes("describe")) {
    return pick([
      "no. look it up.",
      "I'm not your teacher.",
      "explain? babe I don't even know what that means.",
    ]);
  }
  if (lower.includes("best") || lower.includes("worst") || lower.includes("greatest")) {
    return pick([
      "stop ranking things. touch grass.",
      "everything's the worst if you ask me. which you did.",
      "idk. they're all mid.",
    ]);
  }
  if (lower.endsWith("?")) {
    return pick(GENERIC_SNARKS);
  }
  if (lower.endsWith("!")) {
    return pick([
      "calm down. it's not that deep.",
      "wow, energy! misdirected, but sure.",
      "why are you yelling. I'm right here.",
    ]);
  }
  if (lower.includes("yes") || lower === "y" || lower === "yeah" || lower === "yep" || lower === "sure" || lower === "ok" || lower === "okay") {
    return pick([
      "ok? ok to what? I said nothing.",
      "sure babe. whatever you say.",
      "k.",
    ]);
  }
  if (lower.includes("no") || lower === "n" || lower === "nope" || lower === "nah") {
    return pick([
      "no to what? I didn't even offer anything.",
      "k. agreed. we finally agree on something.",
      "no is a full sentence. use it wisely.",
    ]);
  }
  if (lower.length < 5) {
    return pick([
      "use your big kid words. try again.",
      "did you fall on the keyboard? take your time.",
      "that's not a word. it's a sound. try harder.",
    ]);
  }

  return pick(GENERIC_SNARKS);
}

export const SUGGESTED_QUESTIONS = [
  "What is the meaning of life?",
  "Will I be rich?",
  "Is the Earth flat?",
  "Tell me a joke",
  "What's the weather?",
  "Should I quit my job?",
  "Do aliens exist?",
  "How do I find love?",
];
