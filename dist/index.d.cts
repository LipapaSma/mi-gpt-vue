import { MiServiceConfig, MiNA, MiIOT } from 'mi-service-lite';
import { ChatCompletionTool } from 'openai/resources';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';
import { User, Room, Memory, Message, Prisma } from '@prisma/client';

interface LoggerConfig {
    tag?: string;
    disable?: boolean;
}

type ResponseStatus = "idle" | "responding" | "finished" | "canceled";
interface StreamResponseOptions {
    /**
     * 单次响应句子的最大长度
     */
    maxSentenceLength?: number;
    /**
     * 首次响应句子的收集时长（单位：毫秒）
     *
     * 例子：100ms => 从收到第一条响应文本开始，聚合之后 100ms 内收到的文本，作为第一次 Response
     *
     * 默认值：200，(最小100)
     */
    firstSubmitTimeout?: number;
}
declare class StreamResponse {
    static createStreamResponse(text: string, options?: StreamResponseOptions): StreamResponse | undefined;
    maxSentenceLength: number;
    firstSubmitTimeout: number;
    constructor(options?: StreamResponseOptions);
    status: ResponseStatus;
    cancel(): boolean;
    addResponse(_text: string): void;
    private _nextChunkIdx;
    getNextResponse(): {
        nextSentence?: string;
        noMore: boolean;
    };
    private _finalResult?;
    finish(finalResult?: string): boolean;
    private _forceChunkText;
    getFinalResult(): Promise<string | undefined>;
    private _chunks;
    private _tempText;
    private _remainingText;
    private _isFirstSubmit;
    private _submitCount;
    private _batchSubmitImmediately;
    /**
     * 批量收集/提交收到的文字响应
     *
     * 主要用途是使收到的 AI stream 回答的句子长度适中（不过长/短）。
     */
    private _batchSubmit;
    private _addResponse;
    private _findLastCutIndex;
}

type TTSProvider = "xiaoai" | "custom";
type ActionCommand = [number, number];
type PropertyCommand = [number, number, number];
type BaseSpeakerConfig = MiServiceConfig & {
    /**
     * 启用调试（仅调试 MiGPT 相关日志）
     */
    debug?: boolean;
    /**
     * 追踪 Mi Service 相关日志（更底层）
     */
    enableTrace?: boolean;
    /**
     * 是否启用流式响应
     *
     * 部分小爱音箱型号不支持查询播放状态，需要关闭流式响应
     *
     * 关闭后会在 LLM 回答完毕后再 TTS 完整文本，且无法使用唤醒模式等功能
     */
    streamResponse?: boolean;
    /**
     * 语音合成服务商
     */
    tts?: TTSProvider;
    /**
     * 小爱音箱 TTS 指令
     *
     * 比如：小爱音箱 Pro（lx06） -> [5, 1]
     *
     * 具体指令可在此网站查询：https://home.miot-spec.com
     */
    ttsCommand?: ActionCommand;
    /**
     * 小爱音箱唤醒指令
     *
     * 比如：小爱音箱 Pro（lx06） -> [5, 3]
     *
     * 具体指令可在此网站查询：https://home.miot-spec.com
     */
    wakeUpCommand?: ActionCommand;
    /**
     * 查询小爱音响是否在播放中指令
     *
     * 比如：小爱音箱 Play（lx05） -> [3, 1, 1]
     *
     * 具体指令可在此网站查询：https://home.miot-spec.com
     */
    playingCommand?: PropertyCommand;
    /**
     * 播放状态检测间隔（单位毫秒，最低 500 毫秒，默认 1 秒）
     */
    checkInterval?: number;
    /**
     *   下发 TTS 指令多长时间后开始检测播放状态（单位秒，默认 3 秒）
     */
    checkTTSStatusAfter?: number;
    /**
     * TTS 开始/结束提示音
     */
    audioBeep?: string;
    /**
     * 网络请求超时时长，单位毫秒，默认值 3000 （3 秒）
     */
    timeout?: number;
};
declare class BaseSpeaker {
    MiNA?: MiNA;
    MiIOT?: MiIOT;
    config: MiServiceConfig;
    logger: {
        tag: string;
        disable: boolean;
        create(config?: LoggerConfig | undefined): any;
        log(...args: any[]): void;
        debug(...args: any[]): void;
        success(...args: any[]): void;
        error(...args: any[]): void;
        assert(value: any, ...args: any[]): void;
    };
    debug: boolean;
    streamResponse: boolean;
    checkInterval: number;
    checkTTSStatusAfter: number;
    tts: TTSProvider;
    ttsCommand: ActionCommand;
    wakeUpCommand: ActionCommand;
    playingCommand?: PropertyCommand;
    constructor(config: BaseSpeakerConfig);
    initMiServices(): Promise<void>;
    wakeUp(): Promise<boolean>;
    unWakeUp(): Promise<void>;
    audioBeep?: string;
    responding: boolean;
    /**
     * 检测是否有新消息
     *
     * 有新消息产生时，旧的回复会终止
     */
    checkIfHasNewMsg(): {
        hasNewMsg: () => boolean;
        noNewMsg: () => boolean;
    };
    response(options: {
        tts?: TTSProvider;
        text?: string;
        stream?: StreamResponse;
        audio?: string;
        speaker?: string;
        keepAlive?: boolean;
        playSFX?: boolean;
        hasNewMsg?: () => boolean;
    }): Promise<string | undefined>;
    private _response;
    private _speakers?;
    private _currentSpeaker;
    switchSpeaker(speaker: string): Promise<boolean | undefined>;
}

interface QueryMessage {
    text: string;
    answer?: string;
    /**
     * 毫秒
     */
    timestamp: number;
}
interface SpeakerAnswer {
    text?: string;
    url?: string;
    stream?: StreamResponse;
}
interface SpeakerCommand {
    match: (msg: QueryMessage) => boolean;
    /**
     * 命中后执行的操作，返回值非空时会自动回复给用户
     */
    run: (msg: QueryMessage) => Promise<SpeakerAnswer | undefined | void>;
}
type SpeakerConfig = BaseSpeakerConfig & {
    /**
     * 拉取消息心跳间隔（单位毫秒，最低 500 毫秒，默认 1 秒）
     */
    heartbeat?: number;
    /**
     * 自定义的消息指令
     */
    commands?: SpeakerCommand[];
    /**
     * 无响应一段时间后，多久自动退出唤醒模式（单位秒，默认30秒）
     */
    exitKeepAliveAfter?: number;
    /**
     * 静音音频链接
     */
    audioSilent?: string;
};
declare class Speaker extends BaseSpeaker {
    heartbeat: number;
    exitKeepAliveAfter: number;
    currentQueryMsg?: QueryMessage;
    constructor(config: SpeakerConfig);
    status: "running" | "stopped";
    stop(): void;
    run(): Promise<void>;
    audioSilent?: string;
    activeKeepAliveMode(): Promise<void>;
    _commands: SpeakerCommand[];
    get commands(): SpeakerCommand[];
    addCommand(command: SpeakerCommand): void;
    onMessage(msg: QueryMessage): Promise<void>;
    /**
     * 是否保持设备响应状态
     */
    keepAlive: boolean;
    enterKeepAlive(): Promise<void>;
    exitKeepAlive(): Promise<void>;
    private _preTimer;
    exitKeepAliveIfNeeded(): Promise<void>;
    checkIfHasNewMsg(currentMsg?: QueryMessage): {
        hasNewMsg: () => boolean;
        noNewMsg: () => boolean;
    };
    private _tempMsgs;
    fetchNextMessage(): Promise<QueryMessage | undefined>;
    private _fetchFirstMessage;
    private _fetchNextMessage;
    private _fetchNext2Messages;
    private _fetchNextTempMessage;
    private _fetchNextRemainingMessages;
    private _lastConversation;
    getMessages(options?: {
        limit?: number;
        timestamp?: number;
        filterAnswer?: boolean;
    }): Promise<QueryMessage[]>;
}

type AISpeakerConfig = SpeakerConfig & {
    askAI?: (msg: QueryMessage) => Promise<SpeakerAnswer>;
    /**
     * AI 开始回答时的提示语
     *
     * 比如：请稍等，让我想想
     */
    onAIAsking?: string[];
    /**
     * AI 结束回答时的提示语
     *
     * 比如：我说完了，还有替他问题吗？
     */
    onAIReplied?: string[];
    /**
     * AI 回答异常时的提示语
     *
     * 比如：出错了，请稍后再试吧！
     */
    onAIError?: string[];
    /**
     * 设备名称，用来唤醒/退出对话模式等
     *
     * 建议使用常见词语，避免使用多音字和容易混淆读音的词语
     */
    name?: string;
    /**
     * 召唤关键词
     *
     * 当消息以召唤关键词开头时，会调用 AI 来响应用户消息
     *
     * 比如：请，你，问问傻妞
     */
    callAIKeywords?: string[];
    /**
     * 切换音色前缀
     *
     * 比如：音色切换到（文静毛毛）
     */
    switchSpeakerKeywords?: string[];
    /**
     * 唤醒关键词
     *
     * 当消息中包含唤醒关键词时，会进入 AI 唤醒状态
     *
     * 比如：打开/进入/召唤傻妞
     */
    wakeUpKeywords?: string[];
    /**
     * 退出关键词
     *
     * 当消息中包含退出关键词时，会退出 AI 唤醒状态
     *
     * 比如：关闭/退出/再见傻妞
     */
    exitKeywords?: string[];
    /**
     * 进入 AI 模式的欢迎语
     *
     * 比如：你好，我是傻妞，很高兴认识你
     */
    onEnterAI?: string[];
    /**
     * 退出 AI 模式的提示语
     *
     * 比如：傻妞已退出
     */
    onExitAI?: string[];
    /**
     * AI 回答开始提示音
     */
    audioActive?: string;
    /**
     * AI 回答异常提示音
     */
    audioError?: string;
};
declare class AISpeaker extends Speaker {
    askAI: AISpeakerConfig["askAI"];
    name: string;
    switchSpeakerKeywords: string[];
    onEnterAI: string[];
    onExitAI: string[];
    callAIKeywords: string[];
    wakeUpKeywords: string[];
    exitKeywords: string[];
    onAIAsking: string[];
    onAIReplied: string[];
    onAIError: string[];
    audioActive?: string;
    audioError?: string;
    constructor(config: AISpeakerConfig);
    enterKeepAlive(): Promise<void>;
    exitKeepAlive(): Promise<void>;
    get commands(): SpeakerCommand[];
    private _askAIForAnswerSteps;
    askAIForAnswer(msg: QueryMessage): Promise<void>;
}

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface ChatOptions {
    user: string;
    system?: string;
    model?: ChatCompletionCreateParamsBase["model"];
    tools?: Array<ChatCompletionTool>;
    jsonMode?: boolean;
    requestId?: string;
    trace?: boolean;
}

interface IBotConfig {
    bot: User;
    master: User;
    room: Room;
}

declare class MemoryManager {
    private room;
    /**
     * owner 为空时，即房间自己的公共记忆
     */
    private owner?;
    private _logger;
    constructor(room: Room, owner?: User);
    getMemories(options?: {
        take?: number;
    }): Promise<({
        room: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        };
        shortTermMemories: {
            id: number;
            text: string;
            cursorId: number;
            ownerId: string | null;
            roomId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            msg: number;
            owner: number;
            room: number;
            shortTermMemories: number;
        };
        owner: {
            id: string;
            name: string;
            profile: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        msg: {
            id: number;
            text: string;
            senderId: string;
            roomId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        msgId: number;
        ownerId: string | null;
        roomId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getShortTermMemories(options?: {
        take?: number;
    }): Promise<{
        id: number;
        text: string;
        cursorId: number;
        ownerId: string | null;
        roomId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getLongTermMemories(options?: {
        take?: number;
    }): Promise<{
        id: number;
        text: string;
        cursorId: number;
        ownerId: string | null;
        roomId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRelatedMemories(limit: number): Promise<Memory[]>;
    private _currentMemory?;
    addMessage2Memory(ctx: MessageContext, message: Message): Promise<{
        id: number;
        msgId: number;
        ownerId: string | null;
        roomId: string;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    private _onMemory;
    /**
     * 更新记忆（当新的记忆数量超过阈值时，自动更新长短期记忆）
     */
    updateLongShortTermMemory(ctx: MessageContext, options?: {
        shortThreshold?: number;
        longThreshold?: number;
    }): Promise<void>;
    private _updateShortTermMemory;
    private _updateLongTermMemory;
}

interface MessageContext extends IBotConfig {
    memory?: Memory;
}
interface MessageWithSender extends MakeOptional<QueryMessage, "timestamp"> {
    sender: User;
}
declare class ConversationManager {
    private config;
    constructor(config: DeepPartial<IBotConfig>);
    init(): Promise<Partial<IBotConfig & {
        memory: MemoryManager;
    }>>;
    get(): Promise<Partial<IBotConfig & {
        memory: MemoryManager;
    }>>;
    update(config?: DeepPartial<IBotConfig>): Promise<IBotConfig | undefined>;
    getMessages(options?: {
        sender?: User;
        take?: number;
        skip?: number;
        cursorId?: number;
        include?: Prisma.MessageInclude;
        /**
         * 查询顺序（返回按从旧到新排序）
         */
        order?: "asc" | "desc";
    }): Promise<({
        room: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        };
        memories: {
            id: number;
            msgId: number;
            ownerId: string | null;
            roomId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            sender: number;
            room: number;
            memories: number;
        };
        sender: {
            id: string;
            name: string;
            profile: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        text: string;
        senderId: string;
        roomId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    onMessage(ctx: MessageContext, msg: MessageWithSender): Promise<{
        id: number;
        text: string;
        senderId: string;
        roomId: string;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
}

type MyBotConfig = DeepPartial<IBotConfig> & {
    speaker: AISpeaker;
    systemTemplate?: string;
};
declare class MyBot {
    speaker: AISpeaker;
    manager: ConversationManager;
    systemTemplate?: string;
    constructor(config: MyBotConfig);
    stop(): void;
    run(): Promise<void>;
    ask(msg: QueryMessage): Promise<SpeakerAnswer>;
    static chatWithStreamResponse(options: ChatOptions & {
        onFinished?: (text: string) => void;
    }): Promise<StreamResponse>;
}

type MiGPTConfig = Omit<MyBotConfig, "speaker"> & {
    speaker: Omit<AISpeakerConfig, "name">;
};
declare class MiGPT {
    static instance: MiGPT | null;
    static logger: {
        tag: string;
        disable: boolean;
        create(config?: LoggerConfig | undefined): any;
        log(...args: any[]): void;
        debug(...args: any[]): void;
        success(...args: any[]): void;
        error(...args: any[]): void;
        assert(value: any, ...args: any[]): void;
    };
    static create(config: MiGPTConfig): MiGPT | null;
    static reset(): Promise<void>;
    ai: MyBot;
    speaker: AISpeaker;
    config: MiGPTConfig;
    constructor(config: MiGPTConfig & {
        fromCreate?: boolean;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
}

export { MiGPT, type MiGPTConfig };
