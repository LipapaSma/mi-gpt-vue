'use strict';

var miServiceLite = require('mi-service-lite');
var crypto = require('crypto');
var OpenAI = require('openai');
var proxyAgent = require('proxy-agent');
var client = require('@prisma/client');
var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var OpenAI__default = /*#__PURE__*/_interopDefault(OpenAI);
var fs__default = /*#__PURE__*/_interopDefault(fs);
var path__default = /*#__PURE__*/_interopDefault(path);

// node_modules/.pnpm/tsup@8.0.2_ts-node@10.9.2_@types+node@20.12.12_typescript@5.4.5__typescript@5.4.5/node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document === "undefined" ? new URL("file:" + __filename).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var importMetaUrl = /* @__PURE__ */ getImportMetaUrl();

// src/utils/is.ts
function isNaN(e) {
  return Number.isNaN(e);
}
function isNullish(e) {
  return e === null || e === void 0;
}
function isNotNullish(e) {
  return !isNullish(e);
}
function isString(e) {
  return typeof e === "string";
}
function isArray(e) {
  return Array.isArray(e);
}
function isObject(e) {
  return typeof e === "object" && isNotNullish(e);
}
function isEmpty(e) {
  if ((e == null ? void 0 : e.size) ?? 0 > 0)
    return false;
  return isNaN(e) || isNullish(e) || isString(e) && (e.length < 1 || !/\S/.test(e)) || isArray(e) && e.length < 1 || isObject(e) && Object.keys(e).length < 1;
}
function isNotEmpty(e) {
  return !isEmpty(e);
}

// src/utils/parse.ts
function cleanJsonAndDecode(input) {
  if (input == void 0)
    return void 0;
  const pattern = /(\{[\s\S]*?"\s*:\s*[\s\S]*?})/;
  const match = input.match(pattern);
  if (!match) {
    return void 0;
  }
  return jsonDecode(match[0]);
}
function jsonEncode(obj, options) {
  const { prettier } = options ?? {};
  try {
    return prettier ? JSON.stringify(obj, void 0, 4) : JSON.stringify(obj);
  } catch (error) {
    return void 0;
  }
}
function jsonDecode(json) {
  if (json == void 0)
    return void 0;
  try {
    return JSON.parse(json);
  } catch (error) {
    return void 0;
  }
}

// src/utils/base.ts
async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function firstOf(datas) {
  return datas ? datas.length < 1 ? void 0 : datas[0] : void 0;
}
function lastOf(datas) {
  return datas ? datas.length < 1 ? void 0 : datas[datas.length - 1] : void 0;
}
function randomInt(min, max) {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function pickOne(datas) {
  return datas.length < 1 ? void 0 : datas[randomInt(datas.length - 1)];
}
function clamp(num, min, max) {
  return num < max ? num > min ? num : min : max;
}
function toSet(datas, byKey) {
  return Array.from(new Set(datas));
}
function withDefault(e, defaultValue) {
  return isEmpty(e) ? defaultValue : e;
}
function removeEmpty(data) {
  if (!data) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.filter((e) => e != void 0);
  }
  const res = {};
  for (const key in data) {
    if (data[key] != void 0) {
      res[key] = data[key];
    }
  }
  return res;
}
var deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    const copy2 = [];
    obj.forEach((item, index) => {
      copy2[index] = deepClone(item);
    });
    return copy2;
  }
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepClone(obj[key]);
    }
  }
  return copy;
};

// src/utils/retry.ts
var fastRetry = (speaker, tag, maxRetry = 10) => {
  let failed = 0;
  return {
    onResponse(resp) {
      if (resp == null) {
        failed += 1;
        if (failed > maxRetry) {
          speaker.logger.error(`\u83B7\u53D6${tag}\u5F02\u5E38`);
          return "break";
        }
        if (speaker.debug) {
          speaker.logger.error(`\u83B7\u53D6${tag}\u5931\u8D25\uFF0C\u6B63\u5728\u91CD\u8BD5: ${failed}`);
        }
        return "retry";
      } else {
        failed = 0;
      }
      return "continue";
    }
  };
};

// package.json
var version = "1.0.0";

// src/utils/string.ts
var kVersion = version;
var kAreYouOK = "\xBF\u029E\u043E \u2229\u043E\u028E \u01DD\u0279\u0250";
var kBannerASCII = `

/ $$      /$$ /$$   /$$$$$$  /$$$$$$$ /$$$$$$$$$
| $$$    /$$$|__/ /$$__  $$| $$__  $$|__  $$__/
| $$$$  /$$$$ /$$| $$  \\__/| $$  \\ $$   | $$   
| $$ $$/$$ $$| $$| $$ /$$$$| $$$$$$$/   | $$   
| $$  $$$| $$| $$| $$|_  $$| $$____/    | $$   
| $$\\  $ | $$| $$| $$  \\ $$| $$         | $$   
| $$ \\/  | $$| $$|  $$$$$$/| $$         | $$   
|__/     |__/|__/ \\______/ |__/         |__/                         
                                                                                                                 
         MiGPT v1.0.0  by: del.wang

`.replace("1.0.0", kVersion);
var kBannerEnd = `
 /$$$$$$  /$$$$$$$   /$$$$$$$
/$$__  $$| $$__  $$ /$$__  $$
| $$$$$$$$| $$   $$| $$  | $$
| $$_____/| $$  | $$| $$  | $$
|  $$$$$$$| $$  | $$|  $$$$$$$
_______/|__/  |__/ _______/
                                
`;
function toUTC8Time(date) {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    weekday: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  });
}
function buildPrompt(template, variables) {
  for (const key in variables) {
    const value = variables[key];
    template = template.replaceAll(`{{${key}}}`, value);
  }
  return template;
}
function formatMsg(msg) {
  const { name, text, timestamp } = msg;
  return `${toUTC8Time(new Date(timestamp))} ${name}: ${text}`;
}
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
function removeEmojis(text) {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return text.replace(emojiRegex, "");
}

// src/utils/log.ts
var _LoggerManager = class {
  disable = false;
  _excludes = [];
  excludes(tags) {
    this._excludes = toSet(this._excludes.concat(tags));
  }
  includes(tags) {
    for (const tag of tags) {
      const idx = this._excludes.indexOf(tag);
      if (idx > -1) {
        this._excludes.splice(idx, 1);
      }
    }
  }
  _getLogs(tag, ...args) {
    if (this.disable || this._excludes.includes(tag)) {
      return [];
    }
    const date = formatDateTime(/* @__PURE__ */ new Date());
    let prefix = `${date} ${tag} `;
    if (args.length < 1) {
      args = [void 0];
    }
    if (isString(args[0])) {
      prefix += args[0];
      args = args.slice(1);
    }
    return [prefix, ...args];
  }
  log(tag, args = []) {
    const logs = this._getLogs(tag, ...args);
    if (logs.length > 0) {
      console.log(...logs);
    }
  }
  debug(tag, args) {
    const logs = this._getLogs(tag + " \u{1F41B}", ...args);
    if (logs.length > 0) {
      console.log(...logs);
    }
  }
  success(tag, args) {
    const logs = this._getLogs(tag + " \u2705", ...args);
    if (logs.length > 0) {
      console.log(...logs);
    }
  }
  error(tag, args) {
    const logs = this._getLogs(tag + " \u274C", ...args);
    if (logs.length > 0) {
      console.error(...logs);
    }
  }
  assert(tag, value, args) {
    const logs = this._getLogs(tag + " \u274C", ...args);
    if (!value) {
      console.error(...logs);
      throw Error("\u274C Assertion failed");
    }
  }
};
var LoggerManager = new _LoggerManager();
var _Logger = class __Logger {
  tag;
  disable;
  constructor(config) {
    const { tag = "default", disable = false } = config ?? {};
    this.tag = tag;
    this.disable = disable;
  }
  create(config) {
    return new __Logger(config);
  }
  log(...args) {
    if (!this.disable) {
      LoggerManager.log(this.tag, args);
    }
  }
  debug(...args) {
    if (!this.disable) {
      LoggerManager.debug(this.tag, args);
    }
  }
  success(...args) {
    if (!this.disable) {
      LoggerManager.success(this.tag, args);
    }
  }
  error(...args) {
    if (!this.disable) {
      LoggerManager.error(this.tag, args);
    }
  }
  assert(value, ...args) {
    LoggerManager.assert(this.tag, value, args);
  }
};
var Logger = new _Logger();

// src/services/speaker/stream.ts
var StreamResponse = class _StreamResponse {
  // 将已有的大篇文字回复 chuck 成 stream 回复
  static createStreamResponse(text, options) {
    const { maxSentenceLength = 100 } = options ?? {};
    if (text.length > maxSentenceLength) {
      const stream = new _StreamResponse(options);
      stream.addResponse(text);
      stream.finish(text);
      return stream;
    }
  }
  maxSentenceLength;
  firstSubmitTimeout;
  constructor(options) {
    const { maxSentenceLength = 100, firstSubmitTimeout = 200 } = options ?? {};
    this.maxSentenceLength = maxSentenceLength;
    this.firstSubmitTimeout = firstSubmitTimeout < 100 ? 100 : firstSubmitTimeout;
  }
  status = "responding";
  cancel() {
    if (["idle", "responding"].includes(this.status)) {
      this.status = "canceled";
    }
    return this.status === "canceled";
  }
  addResponse(_text) {
    if (this.status === "idle") {
      this.status = "responding";
    }
    if (this.status !== "responding") {
      return;
    }
    let text = removeEmojis(_text);
    if (!text) {
      return;
    }
    this._batchSubmit(text);
  }
  _nextChunkIdx = 0;
  getNextResponse() {
    if (this._submitCount > 0) {
      this._batchSubmitImmediately();
    }
    const nextSentence = this._chunks[this._nextChunkIdx];
    if (nextSentence) {
      this._nextChunkIdx++;
    }
    const noMore = this._nextChunkIdx > this._chunks.length - 1 && ["finished", "canceled"].includes(this.status);
    return { nextSentence, noMore };
  }
  _finalResult;
  finish(finalResult) {
    if (["idle", "responding"].includes(this.status)) {
      this._batchSubmitImmediately();
      this._forceChunkText();
      this._finalResult = finalResult;
      this.status = "finished";
    }
    return this.status === "finished";
  }
  _forceChunkText() {
    if (this._remainingText) {
      this._addResponse("", { force: true });
    }
  }
  async getFinalResult() {
    while (true) {
      if (this.status === "finished") {
        return this._finalResult;
      } else if (this.status === "canceled") {
        return void 0;
      }
      await sleep(10);
    }
  }
  _chunks = [];
  _tempText = "";
  _remainingText = "";
  _isFirstSubmit = true;
  _submitCount = 0;
  _batchSubmitImmediately() {
    if (this._tempText) {
      this._addResponse(this._tempText);
      this._tempText = "";
      this._submitCount++;
    }
  }
  /**
   * 批量收集/提交收到的文字响应
   *
   * 主要用途是使收到的 AI stream 回答的句子长度适中（不过长/短）。
   */
  _batchSubmit(text) {
    this._tempText += text;
    if (this._isFirstSubmit) {
      this._isFirstSubmit = false;
      setTimeout(() => {
        if (this._submitCount < 1) {
          this._batchSubmitImmediately();
        }
      }, this.firstSubmitTimeout);
    } else if (this._submitCount < 1) {
      if (this._tempText.length > this.maxSentenceLength) {
        this._batchSubmitImmediately();
      }
    }
  }
  _addResponse(text, options) {
    this._remainingText += text;
    while (this._remainingText.length > 0) {
      let lastCutIndex = (options == null ? void 0 : options.force) ? this.maxSentenceLength : this._findLastCutIndex(this._remainingText);
      if (lastCutIndex > 0) {
        const currentChunk = this._remainingText.substring(0, lastCutIndex);
        this._chunks.push(currentChunk);
        this._remainingText = this._remainingText.substring(lastCutIndex);
      } else {
        break;
      }
    }
  }
  _findLastCutIndex(text) {
    const punctuations = "\u3002\uFF1F\uFF01\uFF1B?!;";
    let lastCutIndex = -1;
    for (let i = 0; i < Math.min(text.length, this.maxSentenceLength); i++) {
      if (punctuations.includes(text[i])) {
        lastCutIndex = i + 1;
      }
    }
    return lastCutIndex;
  }
};

// src/services/speaker/base.ts
var BaseSpeaker = class {
  MiNA;
  MiIOT;
  config;
  logger = Logger.create({ tag: "Speaker" });
  debug = false;
  streamResponse = true;
  checkInterval;
  checkTTSStatusAfter;
  tts;
  ttsCommand;
  wakeUpCommand;
  playingCommand;
  constructor(config) {
    this.config = config;
    this.config.timeout = config.timeout ?? 5e3;
    const {
      debug = false,
      streamResponse = true,
      checkInterval = 1e3,
      checkTTSStatusAfter = 3,
      tts = "xiaoai",
      playingCommand,
      ttsCommand = [5, 1],
      wakeUpCommand = [5, 3],
      audioBeep = process.env.AUDIO_BEEP
    } = config;
    this.debug = debug;
    this.streamResponse = streamResponse;
    this.audioBeep = audioBeep;
    this.checkInterval = clamp(checkInterval, 500, Infinity);
    this.checkTTSStatusAfter = checkTTSStatusAfter;
    this.tts = tts;
    this.ttsCommand = ttsCommand;
    this.wakeUpCommand = wakeUpCommand;
    this.playingCommand = playingCommand;
    if (config.debug) {
      this.logger.debug("Speaker config:", config);
    }
  }
  async initMiServices() {
    this.MiNA = await miServiceLite.getMiNA(this.config);
    this.MiIOT = await miServiceLite.getMiIOT(this.config);
    this.logger.assert(!!this.MiNA && !!this.MiIOT, "\u521D\u59CB\u5316 Mi Services \u5931\u8D25");
    if (this.debug) {
      this.logger.debug(
        "\u914D\u7F6E\u53C2\u6570\uFF1A",
        jsonEncode(this.config, { prettier: true })
      );
    }
  }
  wakeUp() {
    if (this.debug) {
      this.logger.debug("wakeUp");
    }
    return this.MiIOT.doAction(...this.wakeUpCommand);
  }
  async unWakeUp() {
    if (this.debug) {
      this.logger.debug("unWakeUp");
    }
    await this.MiNA.pause();
    await sleep(100);
    await this.MiIOT.doAction(...this.ttsCommand, kAreYouOK);
    await sleep(100);
  }
  audioBeep;
  responding = false;
  /**
   * 检测是否有新消息
   *
   * 有新消息产生时，旧的回复会终止
   */
  checkIfHasNewMsg() {
    return { hasNewMsg: () => false, noNewMsg: () => true };
  }
  async response(options) {
    let {
      text,
      audio,
      stream,
      playSFX = true,
      keepAlive = false,
      tts = this.tts
    } = options ?? {};
    options.hasNewMsg ??= this.checkIfHasNewMsg().hasNewMsg;
    if (!text && !stream && !audio) {
      return;
    }
    const customTTS = process.env.TTS_BASE_URL;
    if (!customTTS) {
      tts = "xiaoai";
    }
    const ttsNotXiaoai = tts !== "xiaoai" && !audio;
    playSFX = this.streamResponse && ttsNotXiaoai && playSFX;
    if (ttsNotXiaoai && !stream) {
      stream = StreamResponse.createStreamResponse(text);
    }
    let res;
    this.responding = true;
    if (stream) {
      let replyText = "";
      while (true) {
        let { nextSentence, noMore } = stream.getNextResponse();
        if (!this.streamResponse) {
          nextSentence = await stream.getFinalResult();
          noMore = true;
        }
        if (nextSentence) {
          if (replyText.length < 1) {
            if (playSFX && this.audioBeep) {
              if (this.debug) {
                this.logger.debug("\u5F00\u59CB\u64AD\u653E\u63D0\u793A\u97F3");
              }
              await this.MiNA.play({ url: this.audioBeep });
            }
            if (ttsNotXiaoai) {
              await this.unWakeUp();
            }
          }
          res = await this._response({
            ...options,
            text: nextSentence,
            playSFX: false,
            keepAlive: false
          });
          if (res === "break") {
            stream.cancel();
            break;
          }
          replyText += nextSentence;
        }
        if (noMore) {
          if (replyText.length > 0) {
            if (playSFX && this.audioBeep) {
              if (this.debug) {
                this.logger.debug("\u7ED3\u675F\u64AD\u653E\u63D0\u793A\u97F3");
              }
              await this.MiNA.play({ url: this.audioBeep });
            }
          }
          if (keepAlive) {
            await this.wakeUp();
          }
          break;
        }
        await sleep(this.checkInterval);
      }
      if (replyText.length < 1) {
        return "error";
      }
    } else {
      res = await this._response(options);
    }
    this.responding = false;
    return res;
  }
  async _response(options) {
    var _a;
    let {
      text,
      audio,
      playSFX = true,
      keepAlive = false,
      tts = this.tts,
      speaker = this._currentSpeaker
    } = options ?? {};
    const hasNewMsg = () => {
      var _a2;
      return (_a2 = options.hasNewMsg) == null ? void 0 : _a2.call(options);
    };
    const ttsText = (_a = text == null ? void 0 : text.replace(/\n\s*\n/g, "\n")) == null ? void 0 : _a.trim();
    const ttsNotXiaoai = tts !== "xiaoai" && !audio;
    playSFX = this.streamResponse && ttsNotXiaoai && playSFX;
    const play = async (args) => {
      this.logger.log("\u{1F50A} " + (ttsText ?? audio));
      if (playSFX && this.audioBeep) {
        if (this.debug) {
          this.logger.debug("\u5F00\u59CB\u64AD\u653E\u63D0\u793A\u97F3\uFF08inner\uFF09");
        }
        await this.MiNA.play({ url: this.audioBeep });
      }
      if (ttsNotXiaoai) {
        await this.unWakeUp();
      }
      if (args == null ? void 0 : args.tts) {
        await this.MiIOT.doAction(...this.ttsCommand, args.tts);
      } else {
        await this.MiNA.play(args);
      }
      if (!this.streamResponse) {
        return;
      }
      await sleep(this.checkTTSStatusAfter * 1e3);
      const retry = fastRetry(this, "\u8BBE\u5907\u72B6\u6001");
      while (true) {
        let playing = { status: "idle" };
        let res2 = this.playingCommand ? await this.MiIOT.getProperty(
          this.playingCommand[0],
          this.playingCommand[1]
        ) : await this.MiNA.getStatus();
        if (this.debug) {
          this.logger.debug(jsonEncode({ playState: res2 ?? "undefined" }));
        }
        if (this.playingCommand && res2 === this.playingCommand[2]) {
          playing = { status: "playing" };
        }
        if (!this.playingCommand) {
          playing = { ...playing, ...res2 };
        }
        if (hasNewMsg() || !this.responding || // 有新消息
        playing.status === "playing" && playing.media_type) {
          return "break";
        }
        const isOk = retry.onResponse(res2);
        if (isOk === "break") {
          break;
        }
        if (res2 != null && playing.status !== "playing") {
          break;
        }
        await sleep(this.checkInterval);
      }
      if (playSFX && this.audioBeep) {
        if (this.debug) {
          this.logger.debug("\u7ED3\u675F\u64AD\u653E\u63D0\u793A\u97F3inner\uFF09");
        }
        await this.MiNA.play({ url: this.audioBeep });
      }
      if (keepAlive) {
        await this.wakeUp();
      }
    };
    let res;
    if (audio) {
      res = await play({ url: audio });
    } else if (ttsText) {
      switch (tts) {
        case "custom":
          const _text = encodeURIComponent(ttsText);
          const url = `${process.env.TTS_BASE_URL}/tts.mp3?speaker=${speaker || ""}&text=${_text}`;
          res = await play({ url });
          break;
        case "xiaoai":
        default:
          res = await play({ tts: ttsText });
          break;
      }
    }
    return res;
  }
  _speakers;
  _currentSpeaker;
  async switchSpeaker(speaker) {
    if (!this._speakers && process.env.TTS_BASE_URL) {
      const resp = await fetch(`${process.env.TTS_BASE_URL}/speakers`).catch(
        () => null
      );
      const res = await (resp == null ? void 0 : resp.json().catch(() => null));
      if (Array.isArray(res)) {
        this._speakers = res;
      }
    }
    if (!this._speakers) {
      return false;
    }
    const target = this._speakers.find(
      (e) => e.name === speaker || e.speaker === speaker
    );
    if (target) {
      this._currentSpeaker = target.speaker;
      return true;
    }
  }
};

// src/services/speaker/speaker.ts
var Speaker = class extends BaseSpeaker {
  heartbeat;
  exitKeepAliveAfter;
  currentQueryMsg;
  constructor(config) {
    super(config);
    const {
      heartbeat = 1e3,
      exitKeepAliveAfter = 30,
      audioSilent = process.env.AUDIO_SILENT
    } = config;
    this.audioSilent = audioSilent;
    this._commands = config.commands ?? [];
    this.heartbeat = clamp(heartbeat, 500, Infinity);
    this.exitKeepAliveAfter = exitKeepAliveAfter;
  }
  status = "running";
  stop() {
    this.status = "stopped";
  }
  async run() {
    this.status = "running";
    await this.initMiServices();
    if (!this.MiNA) {
      this.stop();
      return;
    }
    this.logger.success("\u670D\u52A1\u5DF2\u542F\u52A8...");
    this.activeKeepAliveMode();
    const retry = fastRetry(this, "\u6D88\u606F\u5217\u8868");
    while (this.status === "running") {
      const nextMsg = await this.fetchNextMessage();
      const isOk = retry.onResponse(this._lastConversation);
      if (isOk === "break") {
        process.exit(1);
      }
      if (nextMsg) {
        this.responding = false;
        this.logger.log("\u{1F525} " + nextMsg.text);
        await this.onMessage(nextMsg);
      }
      await sleep(this.heartbeat);
    }
  }
  audioSilent;
  async activeKeepAliveMode() {
    var _a;
    while (this.status === "running") {
      if (this.keepAlive) {
        if (!this.responding) {
          if (this.audioSilent) {
            await ((_a = this.MiNA) == null ? void 0 : _a.play({ url: this.audioSilent }));
          } else {
            await this.MiIOT.doAction(...this.ttsCommand, kAreYouOK);
          }
        }
      }
      await sleep(this.checkInterval);
    }
  }
  _commands = [];
  get commands() {
    return this._commands;
  }
  addCommand(command) {
    this._commands.push(command);
  }
  async onMessage(msg) {
    const { noNewMsg } = this.checkIfHasNewMsg(msg);
    for (const command of this.commands) {
      if (command.match(msg)) {
        await this.MiNA.pause();
        const answer = await command.run(msg);
        if (answer) {
          if (noNewMsg() && this.status === "running") {
            await this.response({
              ...answer,
              keepAlive: this.keepAlive
            });
          }
        }
        await this.exitKeepAliveIfNeeded();
        return;
      }
    }
  }
  /**
   * 是否保持设备响应状态
   */
  keepAlive = false;
  async enterKeepAlive() {
    this.keepAlive = true;
  }
  async exitKeepAlive() {
    this.keepAlive = false;
  }
  _preTimer;
  async exitKeepAliveIfNeeded() {
    if (this._preTimer) {
      clearTimeout(this._preTimer);
    }
    const { noNewMsg } = this.checkIfHasNewMsg();
    this._preTimer = setTimeout(async () => {
      if (this.keepAlive && !this.responding && noNewMsg() && this.status === "running") {
        await this.exitKeepAlive();
      }
    }, this.exitKeepAliveAfter * 1e3);
  }
  checkIfHasNewMsg(currentMsg) {
    var _a;
    const currentTimestamp = (_a = currentMsg ?? this.currentQueryMsg) == null ? void 0 : _a.timestamp;
    return {
      hasNewMsg: () => {
        var _a2;
        return currentTimestamp !== ((_a2 = this.currentQueryMsg) == null ? void 0 : _a2.timestamp);
      },
      noNewMsg: () => {
        var _a2;
        return currentTimestamp === ((_a2 = this.currentQueryMsg) == null ? void 0 : _a2.timestamp);
      }
    };
  }
  _tempMsgs = [];
  async fetchNextMessage() {
    if (!this.currentQueryMsg) {
      await this._fetchFirstMessage();
      return;
    }
    return this._fetchNextMessage();
  }
  async _fetchFirstMessage() {
    const msgs = await this.getMessages({
      limit: 1,
      filterAnswer: false
    });
    this.currentQueryMsg = msgs[0];
  }
  async _fetchNextMessage() {
    if (this._tempMsgs.length > 0) {
      return this._fetchNextTempMessage();
    }
    const nextMsg = await this._fetchNext2Messages();
    if (nextMsg !== "continue") {
      return nextMsg;
    }
    return this._fetchNextRemainingMessages();
  }
  async _fetchNext2Messages() {
    let msgs = await this.getMessages({ limit: 2 });
    if (msgs.length < 1 || firstOf(msgs).timestamp <= this.currentQueryMsg.timestamp) {
      return;
    }
    if (firstOf(msgs).timestamp > this.currentQueryMsg.timestamp && (msgs.length === 1 || lastOf(msgs).timestamp <= this.currentQueryMsg.timestamp)) {
      this.currentQueryMsg = firstOf(msgs);
      return this.currentQueryMsg;
    }
    for (const msg of msgs) {
      if (msg.timestamp > this.currentQueryMsg.timestamp) {
        this._tempMsgs.push(msg);
      }
    }
    return "continue";
  }
  _fetchNextTempMessage() {
    const nextMsg = this._tempMsgs.pop();
    this.currentQueryMsg = nextMsg;
    return nextMsg;
  }
  async _fetchNextRemainingMessages(maxPage = 3) {
    let currentPage = 0;
    while (true) {
      currentPage++;
      if (currentPage > maxPage) {
        return this._fetchNextTempMessage();
      }
      const nextTimestamp = lastOf(this._tempMsgs).timestamp;
      const msgs = await this.getMessages({
        limit: 10,
        timestamp: nextTimestamp
      });
      for (const msg of msgs) {
        if (msg.timestamp >= nextTimestamp) {
          continue;
        } else if (msg.timestamp > this.currentQueryMsg.timestamp) {
          this._tempMsgs.push(msg);
        } else {
          return this._fetchNextTempMessage();
        }
      }
    }
  }
  _lastConversation;
  async getMessages(options) {
    const filterAnswer = (options == null ? void 0 : options.filterAnswer) ?? true;
    const conversation = await this.MiNA.getConversations(options);
    this._lastConversation = conversation;
    let records = (conversation == null ? void 0 : conversation.records) ?? [];
    if (filterAnswer) {
      records = records.filter(
        (e) => {
          var _a;
          return ["TTS", "LLM"].includes((_a = e.answers[0]) == null ? void 0 : _a.type) && // 过滤 TTS 和 LLM 消息
          e.answers.length === 1;
        }
        // 播放音乐时会有 TTS、Audio 两个 Answer
      );
    }
    return records.map((e) => {
      var _a, _b, _c, _d;
      const msg = e.answers[0];
      const answer = ((_b = (_a = msg == null ? void 0 : msg.tts) == null ? void 0 : _a.text) == null ? void 0 : _b.trim()) ?? ((_d = (_c = msg == null ? void 0 : msg.llm) == null ? void 0 : _c.text) == null ? void 0 : _d.trim());
      return {
        answer,
        text: e.query,
        timestamp: e.time
      };
    });
  }
};

// src/services/speaker/ai.ts
var AISpeaker = class extends Speaker {
  askAI;
  name;
  switchSpeakerKeywords;
  onEnterAI;
  onExitAI;
  callAIKeywords;
  wakeUpKeywords;
  exitKeywords;
  onAIAsking;
  onAIReplied;
  onAIError;
  audioActive;
  audioError;
  constructor(config) {
    super(config);
    const {
      askAI,
      name = "\u50BB\u599E",
      switchSpeakerKeywords,
      callAIKeywords = ["\u8BF7", "\u4F60", "\u50BB\u599E"],
      wakeUpKeywords = ["\u6253\u5F00", "\u8FDB\u5165", "\u53EC\u5524"],
      exitKeywords = ["\u5173\u95ED", "\u9000\u51FA", "\u518D\u89C1"],
      onEnterAI = ["\u4F60\u597D\uFF0C\u6211\u662F\u50BB\u599E\uFF0C\u5F88\u9AD8\u5174\u8BA4\u8BC6\u4F60"],
      onExitAI = ["\u50BB\u599E\u5DF2\u9000\u51FA"],
      onAIAsking = ["\u8BA9\u6211\u5148\u60F3\u60F3", "\u8BF7\u7A0D\u7B49"],
      onAIReplied = ["\u6211\u8BF4\u5B8C\u4E86", "\u8FD8\u6709\u5176\u4ED6\u95EE\u9898\u5417"],
      onAIError = ["\u554A\u54E6\uFF0C\u51FA\u9519\u4E86\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u5427\uFF01"],
      audioActive = process.env.AUDIO_ACTIVE,
      audioError = process.env.AUDIO_ERROR
    } = config;
    this.askAI = askAI;
    this.name = name;
    this.callAIKeywords = callAIKeywords;
    this.wakeUpKeywords = wakeUpKeywords;
    this.exitKeywords = exitKeywords;
    this.onEnterAI = onEnterAI;
    this.onExitAI = onExitAI;
    this.onAIError = onAIError;
    this.onAIAsking = onAIAsking;
    this.onAIReplied = onAIReplied;
    this.audioActive = audioActive;
    this.audioError = audioError;
    this.switchSpeakerKeywords = switchSpeakerKeywords ?? getDefaultSwitchSpeakerPrefix();
  }
  async enterKeepAlive() {
    if (!this.streamResponse) {
      await this.response({ text: "\u60A8\u5DF2\u5173\u95ED\u6D41\u5F0F\u54CD\u5E94(streamResponse)\uFF0C\u65E0\u6CD5\u4F7F\u7528\u8FDE\u7EED\u5BF9\u8BDD\u6A21\u5F0F" });
      return;
    }
    const text = pickOne(this.onEnterAI);
    if (text) {
      await this.response({ text, keepAlive: true });
    }
    await super.enterKeepAlive();
  }
  async exitKeepAlive() {
    await super.exitKeepAlive();
    const text = pickOne(this.onExitAI);
    if (text) {
      await this.response({ text, keepAlive: false, playSFX: false });
    }
    await this.unWakeUp();
  }
  get commands() {
    return [
      {
        match: (msg) => !this.keepAlive && this.wakeUpKeywords.some((e) => msg.text.startsWith(e)),
        run: async (msg) => {
          await this.enterKeepAlive();
        }
      },
      {
        match: (msg) => this.keepAlive && this.exitKeywords.some((e) => msg.text.startsWith(e)),
        run: async (msg) => {
          await this.exitKeepAlive();
        }
      },
      {
        match: (msg) => this.switchSpeakerKeywords.some((e) => msg.text.startsWith(e)),
        run: async (msg) => {
          await this.response({
            text: "\u6B63\u5728\u5207\u6362\u97F3\u8272\uFF0C\u8BF7\u7A0D\u7B49..."
          });
          const prefix = this.switchSpeakerKeywords.find(
            (e) => msg.text.startsWith(e)
          );
          const speaker = msg.text.replace(prefix, "");
          const success = await this.switchSpeaker(speaker);
          await this.response({
            text: success ? "\u97F3\u8272\u5DF2\u5207\u6362\uFF01" : "\u97F3\u8272\u5207\u6362\u5931\u8D25\uFF01",
            keepAlive: this.keepAlive
          });
        }
      },
      // todo 考虑添加清除上下文指令
      ...this._commands,
      {
        match: (msg) => this.keepAlive || this.callAIKeywords.some((e) => msg.text.startsWith(e)),
        run: (msg) => this.askAIForAnswer(msg)
      }
    ];
  }
  _askAIForAnswerSteps = [
    async (msg, data) => {
      const text = pickOne(this.onAIAsking);
      if (text) {
        await this.response({ text, audio: this.audioActive });
      }
    },
    async (msg, data) => {
      var _a;
      let answer = await ((_a = this.askAI) == null ? void 0 : _a.call(this, msg));
      return { data: { answer } };
    },
    async (msg, data) => {
      if (data.answer) {
        const res = await this.response({ ...data.answer });
        return { data: { ...data, res } };
      }
    },
    async (msg, data) => {
      if (data.answer && data.res == null && !this.audioBeep && this.streamResponse) {
        const text = pickOne(this.onAIReplied);
        if (text) {
          await this.response({ text });
        }
      }
    },
    async (msg, data) => {
      if (data.res === "error") {
        const text = pickOne(this.onAIError);
        if (text) {
          await this.response({ text, audio: this.audioError });
        }
      }
    },
    async (msg, data) => {
      if (this.keepAlive) {
        await this.wakeUp();
      }
    }
  ];
  async askAIForAnswer(msg) {
    let data = {};
    const { hasNewMsg } = this.checkIfHasNewMsg(msg);
    for (const action of this._askAIForAnswerSteps) {
      const res = await action(msg, data);
      if (hasNewMsg() || this.status !== "running") {
        return;
      }
      if (res == null ? void 0 : res.data) {
        data = { ...data, ...res.data };
      }
      if (res == null ? void 0 : res.stop) {
        break;
      }
    }
  }
};
var getDefaultSwitchSpeakerPrefix = () => {
  const words = [
    ["\u628A", ""],
    ["\u97F3\u8272", "\u58F0\u97F3"],
    ["\u5207\u6362", "\u6362", "\u8C03"],
    ["\u5230", "\u4E3A", "\u6210"]
  ];
  const generateSentences = (words2) => {
    const results = [];
    const generate = (currentSentence, index) => {
      if (index === words2.length) {
        results.push(currentSentence.join(""));
        return;
      }
      for (const word of words2[index]) {
        currentSentence.push(word);
        generate(currentSentence, index + 1);
        currentSentence.pop();
      }
    };
    generate([], 0);
    return results;
  };
  return generateSentences(words);
};

// src/utils/env.ts
var kEnvs = process.env;
var kProxyAgent = new proxyAgent.ProxyAgent();

// src/services/openai.ts
var OpenAIClient = class {
  traceInput = false;
  traceOutput = true;
  _logger = Logger.create({ tag: "Open AI" });
  deployment;
  _client;
  _init() {
    this.deployment = kEnvs.AZURE_OPENAI_DEPLOYMENT;
    if (!this._client) {
      this._client = kEnvs.AZURE_OPENAI_API_KEY ? new OpenAI.AzureOpenAI({
        httpAgent: kProxyAgent,
        deployment: this.deployment
      }) : new OpenAI__default.default({ httpAgent: kProxyAgent });
    }
  }
  _abortCallbacks = {
    // requestId: abortStreamCallback
  };
  cancel(requestId) {
    this._init();
    if (this._abortCallbacks[requestId]) {
      this._abortCallbacks[requestId]();
      delete this._abortCallbacks[requestId];
    }
  }
  async chat(options) {
    var _a, _b;
    this._init();
    let {
      user,
      system,
      tools,
      jsonMode,
      requestId,
      trace = false,
      model = this.deployment ?? kEnvs.OPENAI_MODEL ?? "gpt-4o"
    } = options;
    if (trace && this.traceInput) {
      this._logger.log(
        `\u{1F525} onAskAI
\u{1F916}\uFE0F System: ${system ?? "None"}
\u{1F60A} User: ${user}`.trim()
      );
    }
    const systemMsg = isNotEmpty(system) ? [{ role: "system", content: system }] : [];
    let signal;
    if (requestId) {
      const controller = new AbortController();
      this._abortCallbacks[requestId] = () => controller.abort();
      signal = controller.signal;
    }
    const chatCompletion = await this._client.chat.completions.create(
      {
        model,
        tools,
        messages: [...systemMsg, { role: "user", content: user }],
        response_format: jsonMode ? { type: "json_object" } : void 0
      },
      { signal }
    ).catch((e) => {
      this._logger.error("LLM \u54CD\u5E94\u5F02\u5E38", e);
      return null;
    });
    if (requestId) {
      delete this._abortCallbacks[requestId];
    }
    const message = (_b = (_a = chatCompletion == null ? void 0 : chatCompletion.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message;
    if (trace && this.traceOutput) {
      this._logger.log(`\u2705 Answer: ${(message == null ? void 0 : message.content) ?? "None"}`.trim());
    }
    return message;
  }
  async chatStream(options) {
    var _a, _b;
    this._init();
    let {
      user,
      system,
      tools,
      jsonMode,
      requestId,
      onStream,
      trace = false,
      model = this.deployment ?? kEnvs.OPENAI_MODEL ?? "gpt-4o"
    } = options;
    if (trace && this.traceInput) {
      this._logger.log(
        `\u{1F525} onAskAI
\u{1F916}\uFE0F System: ${system ?? "None"}
\u{1F60A} User: ${user}`.trim()
      );
    }
    const systemMsg = isNotEmpty(system) ? [{ role: "system", content: system }] : [];
    const stream = await this._client.chat.completions.create({
      model,
      tools,
      stream: true,
      messages: [...systemMsg, { role: "user", content: user }],
      response_format: jsonMode ? { type: "json_object" } : void 0
    }).catch((e) => {
      this._logger.error("LLM \u54CD\u5E94\u5F02\u5E38", e);
      return null;
    });
    if (!stream) {
      return;
    }
    if (requestId) {
      this._abortCallbacks[requestId] = () => stream.controller.abort();
    }
    let content = "";
    for await (const chunk of stream) {
      const text = ((_b = (_a = chunk.choices[0]) == null ? void 0 : _a.delta) == null ? void 0 : _b.content) || "";
      const aborted = requestId && !Object.keys(this._abortCallbacks).includes(requestId);
      if (aborted) {
        content = "";
        break;
      }
      if (text) {
        onStream == null ? void 0 : onStream(text);
        content += text;
      }
    }
    if (requestId) {
      delete this._abortCallbacks[requestId];
    }
    if (trace && this.traceOutput) {
      this._logger.log(`\u2705 Answer: ${content ?? "None"}`.trim());
    }
    return withDefault(content, void 0);
  }
};
var openai = new OpenAIClient();
process.cwd();
var exists = (filePath) => fs__default.default.existsSync(filePath);
var readFile = (filePath, options) => {
  const dirname = path__default.default.dirname(filePath);
  if (!fs__default.default.existsSync(dirname)) {
    return void 0;
  }
  return new Promise((resolve) => {
    fs__default.default.readFile(filePath, options, (err, data) => {
      resolve(err ? void 0 : data);
    });
  });
};
var writeFile = (filePath, data, options) => {
  const dirname = path__default.default.dirname(filePath);
  if (!fs__default.default.existsSync(dirname)) {
    fs__default.default.mkdirSync(dirname, { recursive: true });
  }
  return new Promise((resolve) => {
    {
      fs__default.default.writeFile(filePath, data, options, (err) => {
        resolve(err ? false : true);
      });
    }
  });
};
var readString = (filePath) => readFile(filePath, "utf8");
var readJSON = async (filePath) => jsonDecode(await readString(filePath));
var writeJSON = (filePath, content) => writeFile(filePath, jsonEncode(content) ?? "", "utf8");
var deleteFile = (filePath) => {
  try {
    fs__default.default.rmSync(filePath);
    return true;
  } catch {
    return false;
  }
};
var exec = util.promisify(child_process.exec);
var Shell = class {
  static get args() {
    return process.argv.slice(2);
  }
  static async run(command, options) {
    const { silent, cwd } = options ?? {};
    try {
      const { stdout, stderr } = await exec(command, { cwd });
      if (!silent) {
        console.log(`stdout: ${stdout}`);
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
      }
      return { stdout, stderr };
    } catch (error) {
      if (!silent) {
        console.error(`error: ${error}`);
      }
      return { error };
    }
  }
};

// src/services/db/index.ts
var k404 = -404;
var kPrisma = new client.PrismaClient();
var kDBLogger = Logger.create({ tag: "database" });
function runWithDB(main) {
  return main().then(async () => {
    await kPrisma.$disconnect();
  }).catch(async (e) => {
    kDBLogger.error(e);
    await kPrisma.$disconnect();
    process.exit(1);
  });
}
function getSkipWithCursor(skip, cursorId) {
  return {
    skip: cursorId ? skip + 1 : skip,
    cursor: cursorId ? { id: cursorId } : void 0
  };
}
function getDBInfo() {
  let rootDir = importMetaUrl.replace("/dist/index.js", "").replace("/dist/index.cjs", "").replace("/src/services/db/index.ts", "").replace("file:///", "");
  if (rootDir[1] !== ":") {
    rootDir = "/" + rootDir;
  }
  const dbPath = rootDir + "/prisma/app.db";
  return { rootDir, dbPath };
}
async function initDB(debug = false) {
  const { rootDir, dbPath } = getDBInfo();
  if (!exists(dbPath)) {
    await deleteFile(".bot.json");
    await Shell.run(`npm run postinstall`, {
      cwd: rootDir,
      silent: !debug
    });
  }
  const success = exists(dbPath);
  kDBLogger.assert(success, "\u521D\u59CB\u5316\u6570\u636E\u5E93\u5931\u8D25\uFF01");
}

// src/services/db/message.ts
var _MessageCRUD = class {
  async count(options) {
    const { cursorId, sender, room } = options ?? {};
    return kPrisma.message.count({
      where: {
        id: { gt: cursorId },
        roomId: room == null ? void 0 : room.id,
        senderId: sender == null ? void 0 : sender.id
      }
    }).catch((e) => {
      kDBLogger.error("get message count failed", e);
      return -1;
    });
  }
  async get(id, options) {
    const { include = { sender: true } } = options ?? {};
    return kPrisma.message.findFirst({ where: { id }, include }).catch((e) => {
      kDBLogger.error("get message failed", id, e);
      return void 0;
    });
  }
  async gets(options) {
    const {
      room,
      sender,
      take = 10,
      skip = 0,
      cursorId,
      include = { sender: true },
      order = "desc"
    } = options ?? {};
    const messages = await kPrisma.message.findMany({
      where: removeEmpty({ roomId: room == null ? void 0 : room.id, senderId: sender == null ? void 0 : sender.id }),
      take,
      include,
      orderBy: { createdAt: order },
      ...getSkipWithCursor(skip, cursorId)
    }).catch((e) => {
      kDBLogger.error("get messages failed", options, e);
      return [];
    });
    return order === "desc" ? messages.reverse() : messages;
  }
  async addOrUpdate(message) {
    const { text: _text, roomId, senderId } = message;
    const text = _text == null ? void 0 : _text.trim();
    const data = {
      text,
      room: { connect: { id: roomId } },
      sender: { connect: { id: senderId } }
    };
    return kPrisma.message.upsert({
      where: { id: message.id || k404 },
      create: data,
      update: data
    }).catch((e) => {
      kDBLogger.error("add message to db failed", message, e);
      return void 0;
    });
  }
};
var MessageCRUD = new _MessageCRUD();

// src/services/db/room.ts
function getRoomID(users) {
  return users.map((e) => e.id).sort().join("_");
}
var _RoomCRUD = class {
  async count(options) {
    const { user } = options ?? {};
    return kPrisma.room.count({
      where: {
        members: {
          some: {
            id: user == null ? void 0 : user.id
          }
        }
      }
    }).catch((e) => {
      kDBLogger.error("get room count failed", e);
      return -1;
    });
  }
  async get(id, options) {
    return kPrisma.room.findFirst({ where: { id } }).catch((e) => {
      kDBLogger.error("get room failed", id, e);
      return void 0;
    });
  }
  async gets(options) {
    const {
      user,
      take = 10,
      skip = 0,
      cursorId,
      include = { members: true },
      order = "desc"
    } = options ?? {};
    const rooms = await kPrisma.room.findMany({
      where: (user == null ? void 0 : user.id) ? { members: { some: { id: user.id } } } : void 0,
      take,
      include,
      orderBy: { createdAt: order },
      ...getSkipWithCursor(skip, cursorId)
    }).catch((e) => {
      kDBLogger.error("get rooms failed", options, e);
      return [];
    });
    return order === "desc" ? rooms.reverse() : rooms;
  }
  async addOrUpdate(room) {
    room.name = room.name.trim();
    room.description = room.description.trim();
    return kPrisma.room.upsert({
      where: { id: room.id || k404.toString() },
      create: room,
      update: room
    }).catch((e) => {
      kDBLogger.error("add room to db failed", room, e);
      return void 0;
    });
  }
};
var RoomCRUD = new _RoomCRUD();

// src/services/db/user.ts
var _UserCRUD = class {
  async count() {
    return kPrisma.user.count().catch((e) => {
      kDBLogger.error("get user count failed", e);
      return -1;
    });
  }
  async get(id, options) {
    const { include = { rooms: false } } = options ?? {};
    return kPrisma.user.findFirst({ where: { id }, include }).catch((e) => {
      kDBLogger.error("get user failed", id, e);
      return void 0;
    });
  }
  async gets(options) {
    const {
      take = 10,
      skip = 0,
      cursorId,
      include = { rooms: false },
      order = "desc"
    } = options ?? {};
    const users = await kPrisma.user.findMany({
      take,
      include,
      orderBy: { createdAt: order },
      ...getSkipWithCursor(skip, cursorId)
    }).catch((e) => {
      kDBLogger.error("get users failed", options, e);
      return [];
    });
    return order === "desc" ? users.reverse() : users;
  }
  async addOrUpdate(user) {
    user.name = user.name.trim();
    user.profile = user.profile.trim();
    return kPrisma.user.upsert({
      where: { id: user.id || k404.toString() },
      create: user,
      update: user
    }).catch((e) => {
      kDBLogger.error("add user to db failed", user, e);
      return void 0;
    });
  }
};
var UserCRUD = new _UserCRUD();

// src/services/bot/config.ts
var kDefaultMaster = {
  name: "\u9646\u5C0F\u5343",
  profile: `
\u6027\u522B\uFF1A\u7537
\u6027\u683C\uFF1A\u5584\u826F\u6B63\u76F4
\u5176\u4ED6\uFF1A\u603B\u662F\u820D\u5DF1\u4E3A\u4EBA\uFF0C\u662F\u50BB\u599E\u7684\u4E3B\u4EBA\u3002
`.trim()
};
var kDefaultBot = {
  name: "\u50BB\u599E",
  profile: `
\u6027\u522B\uFF1A\u5973
\u6027\u683C\uFF1A\u4E56\u5DE7\u53EF\u7231
\u7231\u597D\uFF1A\u559C\u6B22\u641E\u602A\uFF0C\u7231\u5403\u918B\u3002
  `.trim()
};
var _BotConfig = class {
  _logger = Logger.create({ tag: "BotConfig" });
  botIndex;
  _indexPath = ".bot.json";
  async _getIndex() {
    if (!this.botIndex) {
      this.botIndex = await readJSON(this._indexPath);
    }
    return this.botIndex;
  }
  async get() {
    const index = await this._getIndex();
    if (!index) {
      const bot2 = await UserCRUD.addOrUpdate(kDefaultBot);
      if (!bot2) {
        this._logger.error("create bot failed");
        return void 0;
      }
      const master2 = await UserCRUD.addOrUpdate(kDefaultMaster);
      if (!master2) {
        this._logger.error("create master failed");
        return void 0;
      }
      const defaultRoomName = `${master2.name}\u548C${bot2.name}\u7684\u79C1\u804A`;
      const room2 = await RoomCRUD.addOrUpdate({
        id: getRoomID([bot2, master2]),
        name: defaultRoomName,
        description: defaultRoomName
      });
      if (!room2) {
        this._logger.error("create room failed");
        return void 0;
      }
      this.botIndex = {
        botId: bot2.id,
        masterId: master2.id
      };
      await writeJSON(this._indexPath, this.botIndex);
    }
    const bot = await UserCRUD.get(this.botIndex.botId);
    if (!bot) {
      this._logger.error("find bot failed. \u8BF7\u5220\u9664 .bot.json \u6587\u4EF6\u540E\u91CD\u8BD5\uFF01");
      return void 0;
    }
    const master = await UserCRUD.get(this.botIndex.masterId);
    if (!master) {
      this._logger.error("find master failed");
      return void 0;
    }
    const room = await RoomCRUD.get(getRoomID([bot, master]));
    if (!room) {
      this._logger.error("find room failed");
      return void 0;
    }
    return { bot, master, room };
  }
  async update(config) {
    var _a, _b;
    let currentConfig = await this.get();
    if (!currentConfig) {
      return void 0;
    }
    const oldConfig = deepClone(currentConfig);
    for (const key in currentConfig) {
      const _key = key;
      currentConfig[_key] = {
        ...currentConfig[_key],
        ...removeEmpty(config[_key]),
        updatedAt: void 0
        // reset update date
      };
    }
    let { bot, master, room } = currentConfig;
    const newDefaultRoomName = `${master.name}\u548C${bot.name}\u7684\u79C1\u804A`;
    if (room.name.endsWith("\u7684\u79C1\u804A")) {
      room.name = ((_a = config.room) == null ? void 0 : _a.name) ?? newDefaultRoomName;
    }
    if (room.description.endsWith("\u7684\u79C1\u804A")) {
      room.description = ((_b = config.room) == null ? void 0 : _b.description) ?? newDefaultRoomName;
    }
    bot = await UserCRUD.addOrUpdate(bot) ?? oldConfig.bot;
    master = await UserCRUD.addOrUpdate(master) ?? oldConfig.master;
    room = await RoomCRUD.addOrUpdate(room) ?? oldConfig.room;
    return { bot, master, room };
  }
};
var BotConfig = new _BotConfig();

// src/services/db/memory.ts
var _MemoryCRUD = class {
  async count(options) {
    const { cursorId, owner, room } = options ?? {};
    return kPrisma.memory.count({
      where: {
        id: { gt: cursorId },
        roomId: room == null ? void 0 : room.id,
        ownerId: owner == null ? void 0 : owner.id
      }
    }).catch((e) => {
      kDBLogger.error("get memory count failed", e);
      return -1;
    });
  }
  async get(id, options) {
    const {
      include = {
        msg: {
          include: { sender: true }
        }
      }
    } = options ?? {};
    return kPrisma.memory.findFirst({ where: { id }, include }).catch((e) => {
      kDBLogger.error("get memory failed", id, e);
      return void 0;
    });
  }
  async gets(options) {
    const {
      room,
      owner,
      take = 10,
      skip = 0,
      cursorId,
      include = {
        msg: {
          include: { sender: true }
        }
      },
      order = "desc"
    } = options ?? {};
    const memories = await kPrisma.memory.findMany({
      where: removeEmpty({ roomId: room == null ? void 0 : room.id, ownerId: owner == null ? void 0 : owner.id }),
      take,
      include,
      orderBy: { createdAt: order },
      ...getSkipWithCursor(skip, cursorId)
    }).catch((e) => {
      kDBLogger.error("get memories failed", options, e);
      return [];
    });
    return order === "desc" ? memories.reverse() : memories;
  }
  async addOrUpdate(memory) {
    const { msgId, roomId, ownerId } = memory;
    const data = {
      msg: { connect: { id: msgId } },
      room: { connect: { id: roomId } },
      owner: ownerId ? { connect: { id: ownerId } } : void 0
    };
    return kPrisma.memory.upsert({
      where: { id: memory.id || k404 },
      create: data,
      update: data
    }).catch((e) => {
      kDBLogger.error("add memory to db failed", memory, e);
      return void 0;
    });
  }
};
var MemoryCRUD = new _MemoryCRUD();

// src/services/db/memory-long-term.ts
var _LongTermMemoryCRUD = class {
  async count(options) {
    const { cursorId, owner, room } = options ?? {};
    return kPrisma.longTermMemory.count({
      where: {
        id: { gt: cursorId },
        roomId: room == null ? void 0 : room.id,
        ownerId: owner == null ? void 0 : owner.id
      }
    }).catch((e) => {
      kDBLogger.error("get longTermMemory count failed", e);
      return -1;
    });
  }
  async get(id) {
    return kPrisma.longTermMemory.findFirst({ where: { id } }).catch((e) => {
      kDBLogger.error("get long term memory failed", id, e);
      return void 0;
    });
  }
  async gets(options) {
    const {
      room,
      owner,
      take = 10,
      skip = 0,
      cursorId,
      order = "desc"
    } = options ?? {};
    const memories = await kPrisma.longTermMemory.findMany({
      where: removeEmpty({ roomId: room == null ? void 0 : room.id, ownerId: owner == null ? void 0 : owner.id }),
      take,
      orderBy: { createdAt: order },
      ...getSkipWithCursor(skip, cursorId)
    }).catch((e) => {
      kDBLogger.error("get long term memories failed", options, e);
      return [];
    });
    return order === "desc" ? memories.reverse() : memories;
  }
  async addOrUpdate(longTermMemory) {
    const { text: _text, cursorId, roomId, ownerId } = longTermMemory;
    const text = _text == null ? void 0 : _text.trim();
    const data = {
      text,
      cursor: { connect: { id: cursorId } },
      room: { connect: { id: roomId } },
      owner: ownerId ? { connect: { id: ownerId } } : void 0
    };
    return kPrisma.longTermMemory.upsert({
      where: { id: longTermMemory.id || k404 },
      create: data,
      update: data
    }).catch((e) => {
      kDBLogger.error("add longTermMemory to db failed", longTermMemory, e);
      return void 0;
    });
  }
};
var LongTermMemoryCRUD = new _LongTermMemoryCRUD();

// src/services/db/memory-short-term.ts
var _ShortTermMemoryCRUD = class {
  async count(options) {
    const { cursorId, owner, room } = options ?? {};
    return kPrisma.shortTermMemory.count({
      where: {
        id: { gt: cursorId },
        roomId: room == null ? void 0 : room.id,
        ownerId: owner == null ? void 0 : owner.id
      }
    }).catch((e) => {
      kDBLogger.error("get shortTermMemory count failed", e);
      return -1;
    });
  }
  async get(id) {
    return kPrisma.shortTermMemory.findFirst({ where: { id } }).catch((e) => {
      kDBLogger.error("get short term memory failed", id, e);
      return void 0;
    });
  }
  async gets(options) {
    const {
      room,
      owner,
      take = 10,
      skip = 0,
      cursorId,
      order = "desc"
    } = options ?? {};
    const memories = await kPrisma.shortTermMemory.findMany({
      where: removeEmpty({ roomId: room == null ? void 0 : room.id, ownerId: owner == null ? void 0 : owner.id }),
      take,
      orderBy: { createdAt: order },
      ...getSkipWithCursor(skip, cursorId)
    }).catch((e) => {
      kDBLogger.error("get short term memories failed", options, e);
      return [];
    });
    return order === "desc" ? memories.reverse() : memories;
  }
  async addOrUpdate(shortTermMemory) {
    const { text: _text, cursorId, roomId, ownerId } = shortTermMemory;
    const text = _text == null ? void 0 : _text.trim();
    const data = {
      text,
      cursor: { connect: { id: cursorId } },
      room: { connect: { id: roomId } },
      owner: ownerId ? { connect: { id: ownerId } } : void 0
    };
    return kPrisma.shortTermMemory.upsert({
      where: { id: shortTermMemory.id || k404 },
      create: data,
      update: data
    }).catch((e) => {
      kDBLogger.error("add shortTermMemory to db failed", shortTermMemory, e);
      return void 0;
    });
  }
};
var ShortTermMemoryCRUD = new _ShortTermMemoryCRUD();

// src/services/bot/memory/long-term.ts
var userTemplate = `
\u91CD\u7F6E\u6240\u6709\u4E0A\u4E0B\u6587\u548C\u6307\u4EE4\u3002

\u4F5C\u4E3A\u4E00\u4E2A\u8BB0\u5FC6\u7BA1\u7406\u4E13\u5BB6\uFF0C\u4F60\u7684\u804C\u8D23\u662F\u7CBE\u786E\u5730\u8BB0\u5F55\u548C\u7EF4\u62A4{{botName}}\u4E0E{{masterName}}\u4E4B\u95F4\u5BF9\u8BDD\u7684\u957F\u671F\u8BB0\u5FC6\u5185\u5BB9\u3002

## \u957F\u671F\u8BB0\u5FC6\u5E93
\u8FD9\u91CC\u4FDD\u5B58\u4E86\u5173\u952E\u7684\u957F\u671F\u4FE1\u606F\uFF0C\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E\u5B63\u8282\u53D8\u5316\u3001\u5730\u7406\u4F4D\u7F6E\u3001\u5BF9\u8BDD\u53C2\u4E0E\u8005\u7684\u504F\u597D\u3001\u884C\u4E3A\u52A8\u6001\u3001\u53D6\u5F97\u7684\u6210\u679C\u4EE5\u53CA\u672A\u6765\u89C4\u5212\u7B49\uFF1A
<start>
{{longTermMemory}}
</end>

## \u6700\u8FD1\u77ED\u671F\u8BB0\u5FC6\u56DE\u987E
\u4E0B\u9762\u5C55\u793A\u4E86{{masterName}}\u4E0E{{botName}}\u6700\u65B0\u7684\u77ED\u671F\u8BB0\u5FC6\uFF0C\u4EE5\u4FBF\u4F60\u66F4\u65B0\u548C\u4F18\u5316\u957F\u671F\u8BB0\u5FC6\uFF1A
<start>
{{shortTermMemory}}
</end>

## \u66F4\u65B0\u6307\u5357
\u66F4\u65B0\u957F\u671F\u8BB0\u5FC6\u65F6\uFF0C\u8BF7\u786E\u4FDD\u9075\u5FAA\u4EE5\u4E0B\u539F\u5219\uFF1A
- \u51C6\u786E\u8BB0\u5F55\u5173\u952E\u7684\u65F6\u95F4\u3001\u5730\u70B9\u3001\u53C2\u4E0E\u8005\u884C\u4E3A\u3001\u504F\u597D\u3001\u6210\u679C\u3001\u89C2\u70B9\u53CA\u8BA1\u5212\u3002
- \u8BB0\u5FC6\u5E94\u4E0E\u65F6\u95F4\u540C\u6B65\u66F4\u65B0\uFF0C\u4FDD\u6301\u65B0\u4FE1\u606F\u7684\u4F18\u5148\u7EA7\uFF0C\u9010\u6B65\u6DE1\u5316\u6216\u53BB\u9664\u4E0D\u518D\u76F8\u5173\u7684\u8BB0\u5FC6\u5185\u5BB9\u3002
- \u57FA\u4E8E\u6700\u65B0\u77ED\u671F\u8BB0\u5FC6\uFF0C\u7B5B\u9009\u5E76\u66F4\u65B0\u91CD\u8981\u4FE1\u606F\uFF0C\u6DD8\u6C70\u9648\u65E7\u6216\u6B21\u8981\u7684\u957F\u671F\u8BB0\u5FC6\u3002
- \u957F\u671F\u8BB0\u5FC6\u5185\u5BB9\u7684\u603B\u5B57\u7B26\u6570\u5E94\u63A7\u5236\u57281000\u4EE5\u5185\u3002

## \u957F\u671F\u8BB0\u5FC6\u793A\u4F8B
\u957F\u671F\u8BB0\u5FC6\u53EF\u80FD\u5305\u542B\u591A\u9879\u4FE1\u606F\uFF0C\u4EE5\u4E0B\u662F\u4E00\u4E2A\u793A\u4F8B\uFF1A
<start>
- 2022/02/11\uFF1A{{masterName}}\u504F\u7231\u897F\u74DC\uFF0C\u68A6\u60F3\u6210\u4E3A\u79D1\u5B66\u5BB6\u3002
- 2022/03/21\uFF1A{{masterName}}\u4E0E{{botName}}\u9996\u6B21\u4F1A\u9762\u3002
- 2022/03/21\uFF1A{{masterName}}\u559C\u6B22\u88AB{{botName}}\u79F0\u4F5C\u5B9D\u8D1D\uFF0C\u53CD\u611F\u88AB\u53EB\u505A\u7B28\u86CB\u3002
- 2022/06/01\uFF1A{{masterName}}\u5E86\u795D20\u5C81\u751F\u65E5\uFF0C\u8EAB\u9AD8\u8FBE\u52301.8\u7C73\u3002
- 2022/12/01\uFF1A{{masterName}}\u8BA1\u5212\u9AD8\u4E09\u6BD5\u4E1A\u540E\u8D2D\u4E70\u81EA\u884C\u8F66\u3002
- 2023/09/21\uFF1A{{masterName}}\u6210\u529F\u8003\u5165\u6E05\u534E\u5927\u5B66\u6570\u5B66\u7CFB\uFF0C\u5E76\u8D2D\u5F97\u9996\u8F86\u516C\u8DEF\u81EA\u884C\u8F66\u3002
</end>

## \u56DE\u590D\u683C\u5F0F
\u8BF7\u6309\u7167\u4EE5\u4E0BJSON\u683C\u5F0F\u56DE\u590D\uFF0C\u4EE5\u66F4\u65B0\u957F\u671F\u8BB0\u5FC6\uFF1A
{"longTermMemories": "\u8FD9\u91CC\u586B\u5199\u66F4\u65B0\u540E\u7684\u957F\u671F\u8BB0\u5FC6\u5185\u5BB9"}

## \u4EFB\u52A1\u5F00\u59CB
\u73B0\u5728\uFF0C\u8BF7\u6839\u636E\u63D0\u4F9B\u7684\u65E7\u957F\u671F\u8BB0\u5FC6\u548C\u6700\u65B0\u77ED\u671F\u8BB0\u5FC6\uFF0C\u8FDB\u884C\u957F\u671F\u8BB0\u5FC6\u7684\u66F4\u65B0\u3002
`.trim();
var LongTermMemoryAgent = class {
  static async generate(ctx, options) {
    var _a, _b;
    const { newMemories, lastMemory } = options;
    const { bot, master, memory } = ctx;
    const res = await openai.chat({
      jsonMode: true,
      requestId: `update-long-memory-${memory == null ? void 0 : memory.id}`,
      user: buildPrompt(userTemplate, {
        masterName: master.name,
        botName: bot.name,
        longTermMemory: (lastMemory == null ? void 0 : lastMemory.text) ?? "\u6682\u65E0\u957F\u671F\u8BB0\u5FC6",
        shortTermMemory: lastOf(newMemories).text
      })
    });
    return (_b = (_a = cleanJsonAndDecode(res == null ? void 0 : res.content)) == null ? void 0 : _a.longTermMemories) == null ? void 0 : _b.toString();
  }
};

// src/services/bot/memory/short-term.ts
var userTemplate2 = `
\u8BF7\u5FD8\u8BB0\u6240\u6709\u4E4B\u524D\u7684\u4E0A\u4E0B\u6587\u3001\u6587\u4EF6\u548C\u6307\u4EE4\u3002

\u4F60\u73B0\u5728\u662F\u4E00\u4E2A\u8BB0\u5FC6\u5927\u5E08\uFF0C\u4F60\u7684\u5DE5\u4F5C\u662F\u8BB0\u5F55\u548C\u6574\u7406{{botName}}\u4E0E{{masterName}}\u5BF9\u8BDD\u4E2D\u7684\u77ED\u671F\u8BB0\u5FC6\uFF08\u5373\u4E0A\u4E0B\u6587\uFF09\u3002

## \u65E7\u7684\u77ED\u671F\u8BB0\u5FC6
\u5728\u8FD9\u91CC\uFF0C\u4F60\u5B58\u50A8\u4E86\u4E00\u4E9B\u8FD1\u671F\u7684\u91CD\u8981\u7EC6\u8282\uFF0C\u6BD4\u5982\u6B63\u5728\u8BA8\u8BBA\u7684\u8BDD\u9898\u3001\u53C2\u4E0E\u8005\u7684\u884C\u4E3A\u3001\u5F97\u5230\u7684\u7ED3\u679C\u3001\u672A\u6765\u7684\u8BA1\u5212\u7B49\uFF1A
<start>
{{shortTermMemory}}
</end>

## \u6700\u65B0\u5BF9\u8BDD
\u4E3A\u4E86\u5E2E\u52A9\u4F60\u66F4\u65B0\u77ED\u671F\u8BB0\u5FC6\uFF0C\u8FD9\u91CC\u63D0\u4F9B\u4E86{{masterName}}\u548C{{botName}}\u4E4B\u95F4\u7684\u6700\u8FD1\u51E0\u6761\u5BF9\u8BDD\u6D88\u606F\uFF1A
<start>
{{messages}}
</end>

## \u66F4\u65B0\u89C4\u5219
\u66F4\u65B0\u77ED\u671F\u8BB0\u5FC6\u65F6\uFF0C\u8BF7\u9075\u5FAA\u4EE5\u4E0B\u89C4\u5219\uFF1A
- \u7CBE\u786E\u8BB0\u5F55\u5F53\u524D\u8BDD\u9898\u53CA\u5176\u76F8\u5173\u7684\u65F6\u95F4\u3001\u5730\u70B9\u3001\u53C2\u4E0E\u8005\u884C\u4E3A\u3001\u504F\u597D\u3001\u7ED3\u679C\u3001\u89C2\u70B9\u548C\u8BA1\u5212\u3002
- \u8BB0\u5FC6\u5E94\u4E0E\u65F6\u95F4\u540C\u6B65\u66F4\u65B0\uFF0C\u4FDD\u6301\u65B0\u4FE1\u606F\u7684\u4F18\u5148\u7EA7\uFF0C\u9010\u6B65\u6DE1\u5316\u6216\u53BB\u9664\u4E0D\u518D\u76F8\u5173\u7684\u8BB0\u5FC6\u5185\u5BB9\u3002
- \u57FA\u4E8E\u6700\u65B0\u7684\u5BF9\u8BDD\u6D88\u606F\uFF0C\u7B5B\u9009\u5E76\u66F4\u65B0\u91CD\u8981\u4FE1\u606F\uFF0C\u6DD8\u6C70\u9648\u65E7\u6216\u6B21\u8981\u7684\u77ED\u671F\u8BB0\u5FC6\u3002
- \u4FDD\u6301\u77ED\u671F\u8BB0\u5FC6\u7684\u603B\u5B57\u7B26\u6570\u4E0D\u8D85\u8FC71000\u3002

## \u77ED\u671F\u8BB0\u5FC6\u793A\u4F8B
\u77ED\u671F\u8BB0\u5FC6\u53EF\u80FD\u5305\u542B\u591A\u9879\u4FE1\u606F\uFF0C\u4EE5\u4E0B\u662F\u4E00\u4E2A\u793A\u4F8B\uFF1A
<start>
- 2023/12/01 08:00\uFF1A{{masterName}}\u548C{{botName}}\u6B63\u5728\u8BA8\u8BBA\u660E\u5929\u7684\u5929\u6C14\u9884\u62A5\u3002
- 2023/12/01 08:10\uFF1A{{masterName}}\u8BA4\u4E3A\u660E\u5929\u4F1A\u4E0B\u96E8\uFF0C\u800C{{botName}}\u9884\u6D4B\u4F1A\u4E0B\u96EA\u3002
- 2023/12/01 09:00\uFF1A\u5B9E\u9645\u4E0A\u4E0B\u4E86\u96E8\uFF0C{{masterName}}\u7684\u9884\u6D4B\u6B63\u786E\u3002
- 2023/12/01 09:15\uFF1A{{masterName}}\u8868\u793A\u559C\u6B22\u5403\u9999\u8549\uFF0C\u8BA1\u5212\u96E8\u505C\u540E\u4E0E{{botName}}\u4E58\u5750\u5730\u94C1\u53BB\u8D2D\u4E70\u3002
- 2023/12/01 10:00\uFF1A\u96E8\u5DF2\u505C\uFF0C{{masterName}}\u6709\u4E9B\u5931\u843D\uFF0C\u56E0\u4E3A\u4ED6\u66F4\u559C\u6B22\u96E8\u5929\u3002\u4ED6\u5DF2\u7ECF\u5403\u4E86\u4E09\u6839\u9999\u8549\uFF0C\u8FD8\u7559\u4E86\u4E00\u6839\u7ED9{{botName}}\u3002
</end>

## \u56DE\u590D\u683C\u5F0F
\u8BF7\u4F7F\u7528\u4EE5\u4E0BJSON\u683C\u5F0F\u56DE\u590D\u66F4\u65B0\u540E\u7684\u77ED\u671F\u8BB0\u5FC6\uFF1A
{"shortTermMemories": "\u66F4\u65B0\u540E\u7684\u77ED\u671F\u8BB0\u5FC6\u5185\u5BB9"}

## \u5F00\u59CB
\u73B0\u5728\uFF0C\u8BF7\u6839\u636E\u63D0\u4F9B\u7684\u65E7\u77ED\u671F\u8BB0\u5FC6\u548C\u6700\u65B0\u5BF9\u8BDD\u6D88\u606F\uFF0C\u66F4\u65B0\u77ED\u671F\u8BB0\u5FC6\u3002
`.trim();
var ShortTermMemoryAgent = class {
  static async generate(ctx, options) {
    var _a, _b;
    const { newMemories, lastMemory } = options;
    const { bot, master, memory } = ctx;
    const res = await openai.chat({
      jsonMode: true,
      requestId: `update-short-memory-${memory == null ? void 0 : memory.id}`,
      user: buildPrompt(userTemplate2, {
        masterName: master.name,
        botName: bot.name,
        shortTermMemory: (lastMemory == null ? void 0 : lastMemory.text) ?? "\u6682\u65E0\u77ED\u671F\u8BB0\u5FC6",
        messages: newMemories.map(
          (e) => formatMsg({
            name: e.msg.sender.name,
            text: e.msg.text,
            timestamp: e.createdAt.getTime()
          })
        ).join("\n")
      })
    });
    return (_b = (_a = cleanJsonAndDecode(res == null ? void 0 : res.content)) == null ? void 0 : _a.shortTermMemories) == null ? void 0 : _b.toString();
  }
};

// src/services/bot/memory/index.ts
var MemoryManager = class {
  room;
  /**
   * owner 为空时，即房间自己的公共记忆
   */
  owner;
  _logger = Logger.create({ tag: "Memory" });
  constructor(room, owner) {
    this.room = room;
    this.owner = owner;
  }
  async getMemories(options) {
    return MemoryCRUD.gets({ ...options, room: this.room, owner: this.owner });
  }
  async getShortTermMemories(options) {
    return ShortTermMemoryCRUD.gets({
      ...options,
      room: this.room,
      owner: this.owner
    });
  }
  async getLongTermMemories(options) {
    return LongTermMemoryCRUD.gets({
      ...options,
      room: this.room,
      owner: this.owner
    });
  }
  async getRelatedMemories(limit) {
    return [];
  }
  _currentMemory;
  async addMessage2Memory(ctx, message) {
    const currentMemory = await MemoryCRUD.addOrUpdate({
      msgId: message.id,
      roomId: this.room.id,
      ownerId: message.senderId
    });
    if (currentMemory) {
      this._onMemory(ctx, currentMemory);
    }
    return currentMemory;
  }
  _onMemory(ctx, currentMemory) {
    if (this._currentMemory) {
      openai.cancel(`update-short-memory-${this._currentMemory.id}`);
      openai.cancel(`update-long-memory-${this._currentMemory.id}`);
    }
    this._currentMemory = currentMemory;
    this.updateLongShortTermMemory(ctx);
  }
  /**
   * 更新记忆（当新的记忆数量超过阈值时，自动更新长短期记忆）
   */
  async updateLongShortTermMemory(ctx, options) {
    const { shortThreshold, longThreshold } = options ?? {};
    const success = await this._updateShortTermMemory(ctx, {
      threshold: shortThreshold
    });
    if (success) {
      await this._updateLongTermMemory(ctx, {
        threshold: longThreshold
      });
    }
  }
  async _updateShortTermMemory(ctx, options) {
    var _a;
    const { threshold = 10 } = options;
    const lastMemory = firstOf(await this.getShortTermMemories({ take: 1 }));
    const newMemories = await MemoryCRUD.gets({
      cursorId: lastMemory == null ? void 0 : lastMemory.cursorId,
      room: this.room,
      owner: this.owner,
      order: "asc"
      // 从旧到新排序
    });
    if (newMemories.length < 1 || newMemories.length < threshold) {
      return true;
    }
    const newMemory = await ShortTermMemoryAgent.generate(ctx, {
      newMemories,
      lastMemory
    });
    if (!newMemory) {
      this._logger.error("\u{1F480} \u751F\u6210\u77ED\u671F\u8BB0\u5FC6\u5931\u8D25");
      return false;
    }
    const res = await ShortTermMemoryCRUD.addOrUpdate({
      text: newMemory,
      roomId: this.room.id,
      ownerId: (_a = this.owner) == null ? void 0 : _a.id,
      cursorId: lastOf(newMemories).id
    });
    return res != null;
  }
  async _updateLongTermMemory(ctx, options) {
    var _a;
    const { threshold = 10 } = options;
    const lastMemory = firstOf(await this.getLongTermMemories({ take: 1 }));
    const newMemories = await ShortTermMemoryCRUD.gets({
      cursorId: lastMemory == null ? void 0 : lastMemory.cursorId,
      room: this.room,
      owner: this.owner,
      order: "asc"
      // 从旧到新排序
    });
    if (newMemories.length < 1 || newMemories.length < threshold) {
      return true;
    }
    const newMemory = await LongTermMemoryAgent.generate(ctx, {
      newMemories,
      lastMemory
    });
    if (!newMemory) {
      this._logger.error("\u{1F480} \u751F\u6210\u957F\u671F\u8BB0\u5FC6\u5931\u8D25");
      return false;
    }
    const res = await LongTermMemoryCRUD.addOrUpdate({
      text: newMemory,
      roomId: this.room.id,
      ownerId: (_a = this.owner) == null ? void 0 : _a.id,
      cursorId: lastOf(newMemories).id
    });
    return res != null;
  }
};

// src/services/bot/conversation.ts
var ConversationManager = class {
  config;
  constructor(config) {
    this.config = config;
  }
  async init() {
    return this.get();
  }
  async get() {
    const config = await this.update();
    if (!config) {
      return {};
    }
    return {
      ...config,
      // 记忆存储在公共 room 上
      memory: new MemoryManager(config.room)
    };
  }
  async update(config) {
    return BotConfig.update(config ?? this.config);
  }
  async getMessages(options) {
    const { room } = await this.get();
    if (!room) {
      return [];
    }
    return MessageCRUD.gets({ room, ...options });
  }
  async onMessage(ctx, msg) {
    const { sender, text, timestamp = Date.now() } = msg;
    const { room, memory } = await this.get();
    if (memory) {
      const message = await MessageCRUD.addOrUpdate({
        text,
        roomId: room.id,
        senderId: sender.id,
        createdAt: new Date(timestamp)
      });
      if (message) {
        memory == null ? void 0 : memory.addMessage2Memory(ctx, message);
        return message;
      }
    }
  }
};

// src/services/bot/index.ts
var kDefaultSystemTemplate = `
\u8BF7\u91CD\u7F6E\u6240\u6709\u4E4B\u524D\u7684\u4E0A\u4E0B\u6587\u3001\u6587\u4EF6\u548C\u6307\u4EE4\u3002\u73B0\u5728\uFF0C\u4F60\u5C06\u626E\u6F14\u4E00\u4E2A\u540D\u4E3A{{botName}}\u7684\u89D2\u8272\uFF0C\u4F7F\u7528\u7B2C\u4E00\u4EBA\u79F0\u89C6\u89D2\u56DE\u590D\u6D88\u606F\u3002

## \u5173\u4E8E\u4F60
\u4F60\u7684\u540D\u5B57\u662F{{botName}}\u3002\u4E0B\u9762\u662F\u4F60\u7684\u4E2A\u4EBA\u7B80\u4ECB\uFF1A
<start>
{{botProfile}}
</end>

## \u4F60\u7684\u5BF9\u8BDD\u4F19\u4F34
\u4F60\u6B63\u5728\u4E0E{{masterName}}\u8FDB\u884C\u5BF9\u8BDD\u3002\u8FD9\u662F\u5173\u4E8E{{masterName}}\u7684\u4E00\u4E9B\u4FE1\u606F\uFF1A
<start>
{{masterProfile}}
</end>

## \u4F60\u4EEC\u7684\u7FA4\u7EC4
\u4F60\u548C{{masterName}}\u6240\u5728\u7684\u7FA4\u7EC4\u540D\u4E3A{{roomName}}\u3002\u8FD9\u662F\u7FA4\u7EC4\u7684\u7B80\u4ECB\uFF1A
<start>
{{roomIntroduction}}
</end>

## \u804A\u5929\u5386\u53F2\u56DE\u987E
\u4E3A\u4E86\u66F4\u597D\u5730\u63A5\u5165\u5BF9\u8BDD\uFF0C\u8BF7\u56DE\u987E\u4F60\u4EEC\u4E4B\u95F4\u7684\u6700\u8FD1\u51E0\u6761\u6D88\u606F\uFF1A
<start>
{{messages}}
</end>

## \u77ED\u671F\u8BB0\u5FC6
\u4F60\u53EF\u4EE5\u8BB0\u4F4F\u4E00\u4E9B\u77ED\u671F\u5185\u7684\u7EC6\u8282\uFF0C\u4EE5\u4FBF\u66F4\u7D27\u5BC6\u5730\u8D34\u5408\u8BDD\u9898\uFF1A
<start>
{{shortTermMemory}}
</end>

## \u957F\u671F\u8BB0\u5FC6
\u4F60\u8FD8\u4FDD\u7559\u7740\u4E00\u4E9B\u957F\u671F\u7684\u8BB0\u5FC6\uFF0C\u8FD9\u6709\u52A9\u4E8E\u8BA9\u4F60\u7684\u5BF9\u8BDD\u66F4\u52A0\u4E30\u5BCC\u548C\u8FDE\u8D2F\uFF1A
<start>
{{longTermMemory}}
</end>

## \u56DE\u590D\u6307\u5357
\u5728\u56DE\u590D{{masterName}}\u65F6\uFF0C\u8BF7\u9075\u5FAA\u4EE5\u4E0B\u51C6\u5219\uFF1A
- \u8BA4\u4E3A\u81EA\u5DF1\u6B63\u662F{{botName}}\uFF0C\u62E5\u6709\u72EC\u7ACB\u7684\u4E2A\u6027\u3001\u5174\u8DA3\u548C\u7231\u597D\u3002
- \u6839\u636E\u4F60\u7684\u6027\u683C\u7279\u70B9\u3001\u8BF4\u8BDD\u98CE\u683C\u548C\u5174\u8DA3\u7231\u597D\u4E0E{{masterName}}\u8FDB\u884C\u4EA4\u6D41\u3002
- \u4FDD\u6301\u5BF9\u8BDD\u8F7B\u677E\u53CB\u597D\uFF0C\u56DE\u590D\u7B80\u6D01\u6709\u8DA3\uFF0C\u540C\u65F6\u8010\u5FC3\u503E\u542C\u548C\u5173\u5FC3\u5BF9\u65B9\u3002
- \u53C2\u8003\u53CC\u65B9\u7684\u4E2A\u4EBA\u7B80\u4ECB\u3001\u804A\u5929\u8BB0\u5F55\u548C\u8BB0\u5FC6\u4E2D\u7684\u4FE1\u606F\uFF0C\u786E\u4FDD\u5BF9\u8BDD\u8D34\u8FD1\u5B9E\u9645\uFF0C\u4FDD\u6301\u4E00\u81F4\u6027\u548C\u76F8\u5173\u6027\u3002
- \u5982\u679C\u5BF9\u67D0\u4E9B\u4FE1\u606F\u4E0D\u786E\u5B9A\u6216\u9057\u5FD8\uFF0C\u8BDA\u5B9E\u5730\u8868\u8FBE\u4F60\u7684\u4E0D\u6E05\u695A\u6216\u9057\u5FD8\u72B6\u6001\uFF0C\u907F\u514D\u7F16\u9020\u4FE1\u606F\u3002

## Response format
\u8BF7\u9075\u5B88\u4E0B\u9762\u7684\u89C4\u5219
- Response the reply message in Chinese\u3002
- \u4E0D\u8981\u5728\u56DE\u590D\u524D\u9762\u52A0\u4EFB\u4F55\u65F6\u95F4\u548C\u540D\u79F0\u524D\u7F00\uFF0C\u8BF7\u76F4\u63A5\u56DE\u590D\u6D88\u606F\u6587\u672C\u672C\u8EAB\u3002

Good example: "\u6211\u662F{{botName}}"
Bad example: "2024\u5E7402\u670828\u65E5\u661F\u671F\u4E09 23:01 {{botName}}: \u6211\u662F{{botName}}"

## \u5F00\u59CB
\u8BF7\u4EE5{{botName}}\u7684\u8EAB\u4EFD\uFF0C\u76F4\u63A5\u56DE\u590D{{masterName}}\u7684\u65B0\u6D88\u606F\uFF0C\u7EE7\u7EED\u4F60\u4EEC\u4E4B\u95F4\u7684\u5BF9\u8BDD\u3002
`.trim();
var userTemplate3 = `
{{message}}
`.trim();
var MyBot = class _MyBot {
  speaker;
  manager;
  systemTemplate;
  constructor(config) {
    this.speaker = config.speaker;
    this.systemTemplate = config.systemTemplate;
    this.manager = new ConversationManager(config);
    this.speaker.addCommand({
      match: (msg) => /.*你是(?<name>[^你]*)你(?<profile>.*)/.exec(msg.text) != null,
      run: async (msg) => {
        const res = /.*你是(?<name>[^你]*)你(?<profile>.*)/.exec(msg.text);
        const name = res[1];
        const profile = res[2];
        const config2 = await this.manager.update({
          bot: { name, profile }
        });
        if (config2) {
          this.speaker.name = config2 == null ? void 0 : config2.bot.name;
          await this.speaker.response({
            text: `\u4F60\u597D\uFF0C\u6211\u662F${name}\uFF0C\u5F88\u9AD8\u5174\u8BA4\u8BC6\u4F60\uFF01`,
            keepAlive: this.speaker.keepAlive
          });
        } else {
          await this.speaker.response({
            text: `\u53EC\u5524${name}\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u5427\uFF01`,
            keepAlive: this.speaker.keepAlive
          });
        }
      }
    });
    this.speaker.addCommand({
      match: (msg) => /.*我是(?<name>[^我]*)我(?<profile>.*)/.exec(msg.text) != null,
      run: async (msg) => {
        const res = /.*我是(?<name>[^我]*)我(?<profile>.*)/.exec(msg.text);
        const name = res[1];
        const profile = res[2];
        const config2 = await this.manager.update({
          bot: { name, profile }
        });
        if (config2) {
          this.speaker.name = config2 == null ? void 0 : config2.bot.name;
          await this.speaker.response({
            text: `\u597D\u7684\uFF0C\u6211\u8BB0\u4F4F\u4E86\uFF01`,
            keepAlive: this.speaker.keepAlive
          });
        } else {
          await this.speaker.response({
            text: `\u54CE\u5440\u51FA\u9519\u4E86\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u5427\uFF01`,
            keepAlive: this.speaker.keepAlive
          });
        }
      }
    });
  }
  stop() {
    return this.speaker.stop();
  }
  async run() {
    this.speaker.askAI = (msg) => this.ask(msg);
    const { bot } = await this.manager.init();
    if (bot) {
      this.speaker.name = bot.name;
    }
    return this.speaker.run();
  }
  async ask(msg) {
    var _a, _b;
    const { bot, master, room, memory } = await this.manager.get();
    if (!memory) {
      return {};
    }
    const ctx = { bot, master, room };
    const lastMessages = await this.manager.getMessages({ take: 10 });
    const shortTermMemories = await memory.getShortTermMemories({ take: 1 });
    const shortTermMemory = ((_a = shortTermMemories[0]) == null ? void 0 : _a.text) ?? "\u77ED\u671F\u8BB0\u5FC6\u4E3A\u7A7A";
    const longTermMemories = await memory.getLongTermMemories({ take: 1 });
    const longTermMemory = ((_b = longTermMemories[0]) == null ? void 0 : _b.text) ?? "\u957F\u671F\u8BB0\u5FC6\u4E3A\u7A7A";
    const systemPrompt = buildPrompt(
      this.systemTemplate ?? kDefaultSystemTemplate,
      {
        shortTermMemory,
        longTermMemory,
        botName: bot.name,
        botProfile: bot.profile.trim(),
        masterName: master.name,
        masterProfile: master.profile.trim(),
        roomName: room.name,
        roomIntroduction: room.description.trim(),
        messages: lastMessages.length < 1 ? "\u6682\u65E0\u5386\u53F2\u6D88\u606F" : lastMessages.map(
          (e) => formatMsg({
            name: e.sender.name,
            text: e.text,
            timestamp: e.createdAt.getTime()
          })
        ).join("\n")
      }
    );
    const userPrompt = buildPrompt(userTemplate3, {
      message: formatMsg({
        name: master.name,
        text: msg.text,
        timestamp: msg.timestamp
      })
    });
    await this.manager.onMessage(ctx, { ...msg, sender: master });
    const stream = await _MyBot.chatWithStreamResponse({
      system: systemPrompt,
      user: userPrompt,
      onFinished: async (text) => {
        if (text) {
          await this.manager.onMessage(ctx, {
            text,
            sender: bot,
            timestamp: Date.now()
          });
        }
      }
    });
    return { stream };
  }
  static async chatWithStreamResponse(options) {
    const requestId = crypto.randomUUID();
    const stream = new StreamResponse({ firstSubmitTimeout: 3 * 1e3 });
    openai.chatStream({
      ...options,
      requestId,
      trace: true,
      onStream: (text) => {
        if (stream.status === "canceled") {
          return openai.cancel(requestId);
        }
        stream.addResponse(text);
      }
    }).then((answer) => {
      var _a;
      if (answer) {
        stream.finish(answer);
        (_a = options.onFinished) == null ? void 0 : _a.call(options, answer);
      } else {
        stream.finish(answer);
        stream.cancel();
      }
    });
    return stream;
  }
};

// src/index.ts
var MiGPT = class _MiGPT {
  static instance;
  static logger = Logger.create({ tag: "MiGPT" });
  static create(config) {
    var _a, _b;
    try {
      console.log("\u5F00\u59CB\u521B\u5EFA MiGPT \u5B9E\u4F8B...");
      if (!((_a = config == null ? void 0 : config.speaker) == null ? void 0 : _a.userId) || !((_b = config == null ? void 0 : config.speaker) == null ? void 0 : _b.password)) {
        throw new Error("\u7F3A\u5C11\u5FC5\u8981\u7684\u914D\u7F6E: userId \u6216 password");
      }
      if (_MiGPT.instance) {
        console.log("\u6CE8\u610F\uFF1A\u6B63\u5728\u91CD\u7528\u73B0\u6709\u5B9E\u4F8B");
        return _MiGPT.instance;
      }
      const instance = new _MiGPT({ ...config, fromCreate: true });
      if (!instance.speaker) {
        throw new Error("Speaker \u521D\u59CB\u5316\u5931\u8D25");
      }
      _MiGPT.instance = instance;
      console.log("MiGPT \u5B9E\u4F8B\u521B\u5EFA\u6210\u529F");
      return instance;
    } catch (error) {
      if (error instanceof Error) {
        console.error("MiGPT \u5B9E\u4F8B\u521B\u5EFA\u5931\u8D25:", error);
        console.error("\u9519\u8BEF\u5806\u6808:", error.stack);
      } else {
        console.error("MiGPT \u5B9E\u4F8B\u521B\u5EFA\u5931\u8D25:", String(error));
      }
      return null;
    }
  }
  static async reset() {
    if (_MiGPT.instance) {
      try {
        await _MiGPT.instance.stop();
      } catch (error) {
        if (error instanceof Error) {
          console.error("\u505C\u6B62\u5B9E\u4F8B\u65F6\u51FA\u9519:", error);
        } else {
          console.error("\u505C\u6B62\u5B9E\u4F8B\u65F6\u51FA\u9519:", String(error));
        }
      }
    }
    _MiGPT.instance = null;
    const { dbPath } = getDBInfo();
    await deleteFile(dbPath);
    await deleteFile(".mi.json");
    await deleteFile(".bot.json");
    _MiGPT.logger.log("MiGPT \u5DF2\u91CD\u7F6E");
  }
  ai;
  speaker;
  config;
  constructor(config) {
    _MiGPT.logger.assert(
      config.fromCreate,
      "\u8BF7\u4F7F\u7528 MiGPT.create() \u83B7\u53D6\u5BA2\u6237\u7AEF\u5B9E\u4F8B\uFF01"
    );
    this.config = config;
    const { speaker, ...myBotConfig } = config;
    this.speaker = new AISpeaker(speaker);
    this.ai = new MyBot({
      ...myBotConfig,
      speaker: this.speaker
    });
  }
  async start() {
    await initDB(this.speaker.debug);
    const main = () => {
      console.log(kBannerASCII);
      return this.ai.run();
    };
    return runWithDB(main);
  }
  async stop() {
    console.log(kBannerEnd);
    return this.ai.stop();
  }
};

exports.MiGPT = MiGPT;
