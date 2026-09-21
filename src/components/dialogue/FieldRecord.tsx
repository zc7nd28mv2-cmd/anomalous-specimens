"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { useArchive } from "@/context/ArchiveContext";
import { TypingIndicator } from "@/components/dialogue/TypingIndicator";
import { SensoryChoice } from "@/components/dialogue/SensoryChoice";
import {
  ANALYSIS,
  INVESTIGATION,
  charInterval,
  DIALOGUE,
  TYPING_INDICATOR_DELAY,
  KAI_HOLD_MS,
  messagePause,
  type DialogueBeat,
} from "@/lib/dialogue";
import { SENSORY, type SensoryId } from "@/lib/sensory";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import {
  beatKey,
  loadFieldSession,
  logHas,
  type FieldLogItem,
  type FieldStatus,
  type InvestGate,
} from "@/lib/field-session";

const INJECT = [...SOURCE_BOOT, ...SOURCE_BIND] as const;

type LogItem = FieldLogItem;
type Status = FieldStatus;
type TimerRef = { current: number | null };

function nameOf(speaker: "LIN" | "KAI" | null) {
  if (speaker === "LIN") {
    return "Lin";
  }
  if (speaker === "KAI") {
    return "Kai";
  }
  return "";
}

function pausePhase(index: number) {
  const seen = DIALOGUE.slice(0, index + 1);
  const times = seen.filter(
    (item): item is Extract<DialogueBeat, { kind: "time" }> => item.kind === "time",
  );
  const last = times[times.length - 1];
  if (seen.some((item) => item.kind === "lost") || last?.text === "21:19:47") {
    return "lost" as const;
  }
  if (seen.some((item) => item.kind === "warn") || last?.text === "21:18:02") {
    return "warn" as const;
  }
  if (last?.text === "21:12:33") {
    return "mid" as const;
  }
  return "early" as const;
}

function clearTimer(ref: TimerRef) {
  if (ref.current != null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

export function FieldRecord({
  active = true,
  onComplete,
  onWarning,
  warningCleared = false,
  onAnalysis,
  analysisCleared = false,
  onReadyToLeave,
}: {
  active?: boolean;
  onComplete: () => void;
  onWarning?: () => void;
  warningCleared?: boolean;
  onAnalysis?: (lines: string[]) => void;
  analysisCleared?: boolean;
  onReadyToLeave?: () => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const { persistField } = useArchive();
  const saved = useRef(loadFieldSession());
  const resumeHold =
    saved.current.status === "hold" ||
    (saved.current.picked && saved.current.status === "choice");

  const [index, setIndex] = useState(saved.current.index);
  const [status, setStatus] = useState<Status>(
    resumeHold ? "hold" : saved.current.status,
  );
  const [log, setLog] = useState<LogItem[]>(saved.current.log);
  const [draft, setDraft] = useState(saved.current.draft);
  const [typing, setTyping] = useState(false);
  const [indicator, setIndicator] = useState(
    resumeHold ? "Kai" : saved.current.indicator,
  );
  const [choice, setChoice] = useState<SensoryId | null>(
    resumeHold ? null : saved.current.choice,
  );
  const [choiceLeaving, setChoiceLeaving] = useState(false);

  const indexRef = useRef(index);
  const statusRef = useRef(status);
  const logRef = useRef(log);
  const draftRef = useRef(draft);
  const typingRef = useRef(typing);
  const indicatorRef = useRef(indicator);
  const choiceRef = useRef(choice);
  const kaiHoldRef = useRef(resumeHold);
  const activeRef = useRef(active);
  const scaleRef = useRef(scale);
  const audioRef = useRef(audio);
  const persistRef = useRef(persistField);
  const onWarningRef = useRef(onWarning);
  const onAnalysisRef = useRef(onAnalysis);
  const warningClearedRef = useRef(warningCleared);
  const analysisClearedRef = useRef(analysisCleared);

  indexRef.current = index;
  statusRef.current = status;
  logRef.current = log;
  draftRef.current = draft;
  typingRef.current = typing;
  indicatorRef.current = indicator;
  choiceRef.current = choice;
  activeRef.current = active;
  scaleRef.current = scale;
  audioRef.current = audio;
  persistRef.current = persistField;
  onWarningRef.current = onWarning;
  onAnalysisRef.current = onAnalysis;
  warningClearedRef.current = warningCleared;
  analysisClearedRef.current = analysisCleared;

  const force = useRef(false);
  const picked = useRef(saved.current.picked);
  const skipIndicator = useRef(false);
  const holdFrom = useRef<number | null>(resumeHold ? saved.current.index : null);
  const typedCount = useRef(saved.current.draft.length);
  const pinBottom = useRef(saved.current.pinBottom);
  const scroller = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const restoring = useRef(false);
  const needScrollRestore = useRef(
    saved.current.scroll > 0 || saved.current.log.length > 0,
  );
  const savedScroll = useRef(saved.current.scroll);
  const running = useRef(false);

  const dialogueTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const playRef = useRef<() => void>(() => undefined);

  function persistProgress() {
    persistRef.current({
      index: indexRef.current,
      status: statusRef.current,
      log: logRef.current,
      picked: picked.current,
      choice: choiceRef.current,
      scroll: scroller.current?.scrollTop ?? savedScroll.current,
      pinBottom: pinBottom.current,
      draft: draftRef.current,
      indicator: indicatorRef.current,
    });
  }

  function clearAllAsync() {
    clearTimer(dialogueTimerRef);
    clearTimer(typingTimerRef);
    clearTimer(holdTimerRef);
    clearTimer(fadeTimerRef);
    if (animationFrameRef.current != null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    running.current = false;
  }

  function scheduleDialogue(fn: () => void, ms: number) {
    clearTimer(dialogueTimerRef);
    dialogueTimerRef.current = window.setTimeout(() => {
      dialogueTimerRef.current = null;
      if (!activeRef.current) {
        return;
      }
      fn();
    }, ms);
  }

  function scheduleTyping(fn: () => void, ms: number) {
    clearTimer(typingTimerRef);
    typingTimerRef.current = window.setTimeout(() => {
      typingTimerRef.current = null;
      if (!activeRef.current) {
        return;
      }
      fn();
    }, ms);
  }

  function setIndexNow(next: number) {
    indexRef.current = next;
    setIndex(next);
  }

  function setStatusNow(next: Status) {
    statusRef.current = next;
    setStatus(next);
  }

  function setDraftNow(next: string) {
    draftRef.current = next;
    setDraft(next);
  }

  function setTypingNow(next: boolean) {
    typingRef.current = next;
    setTyping(next);
  }

  function setIndicatorNow(next: string) {
    indicatorRef.current = next;
    setIndicator(next);
  }

  function setChoiceNow(next: SensoryId | null) {
    choiceRef.current = next;
    setChoice(next);
  }

  function pushOnce(item: LogItem) {
    if (logHas(logRef.current, item.key)) {
      return false;
    }
    const next = [...logRef.current, item];
    logRef.current = next;
    setLog(next);
    persistProgress();
    return true;
  }

  function resetLineUi() {
    setDraftNow("");
    setTypingNow(false);
    setIndicatorNow("");
    force.current = false;
    typedCount.current = 0;
  }

  function advanceAndPlay() {
    resetLineUi();
    setIndexNow(indexRef.current + 1);
    persistProgress();
    running.current = false;
    playRef.current();
  }

  function enterNextBeat(from: number) {
    let next = from + 1;
    while (next < DIALOGUE.length) {
      const beat = DIALOGUE[next];
      if (beat.kind === "time") {
        pushOnce({ key: beatKey(next), kind: "time", text: beat.text });
        next += 1;
        continue;
      }
      if (beat.kind === "line" && beat.hidden) {
        next += 1;
        continue;
      }
      break;
    }
    resetLineUi();
    if (skipIndicator.current) {
      setIndicatorNow("");
    } else {
      const beat = DIALOGUE[next] as DialogueBeat | undefined;
      setIndicatorNow(beat?.kind === "line" ? nameOf(beat.speaker) : "");
    }
    setIndexNow(next);
    setStatusNow("play");
    persistProgress();
    running.current = false;
    playRef.current();
  }

  function startHold() {
    if (holdTimerRef.current != null) {
      return;
    }
    kaiHoldRef.current = true;
    setIndicatorNow("Kai");
    setStatusNow("hold");
    persistProgress();
    const from = holdFrom.current ?? indexRef.current;
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      if (!activeRef.current) {
        return;
      }
      kaiHoldRef.current = false;
      skipIndicator.current = true;
      enterNextBeat(from);
    }, KAI_HOLD_MS);
  }

  function playInject(step: number) {
    const beatIndex = indexRef.current;
    if (step < INJECT.length) {
      scheduleDialogue(() => {
        pushOnce({
          key: beatKey(beatIndex, `inj-${step}`),
          kind: "code",
          text: INJECT[step],
        });
        playInject(step + 1);
      }, scaleRef.current(220));
      return;
    }
    scheduleDialogue(() => {
      running.current = false;
      advanceAndPlay();
    }, scaleRef.current(200));
  }

  function playLine(beat: Extract<DialogueBeat, { kind: "line" }>, beatIndex: number) {
    const beginLine = () => {
      setIndicatorNow("");
      setTypingNow(true);
      let n = typedCount.current;
      if (n > 0) {
        setDraftNow(beat.text.slice(0, n));
      }
      const hold = beat.freeze ?? messagePause(pausePhase(beatIndex));

      const commitLine = () => {
        pushOnce({
          key: beatKey(beatIndex),
          kind: "msg",
          speaker: nameOf(beat.speaker),
          text: beat.text,
        });
        audioRef.current.message();
        setDraftNow("");
        setTypingNow(false);
        typedCount.current = 0;
        scheduleDialogue(() => {
          running.current = false;
          advanceAndPlay();
        }, scaleRef.current(hold));
      };

      const tick = () => {
        if (!activeRef.current) {
          return;
        }
        if (force.current) {
          setDraftNow(beat.text);
          typedCount.current = beat.text.length;
          setTypingNow(false);
          scheduleDialogue(commitLine, scaleRef.current(40));
          return;
        }
        n += 1;
        typedCount.current = n;
        setDraftNow(beat.text.slice(0, n));
        audioRef.current.tick();
        if (n >= beat.text.length) {
          setTypingNow(false);
          scheduleDialogue(commitLine, scaleRef.current(50));
          return;
        }
        scheduleTyping(tick, scaleRef.current(charInterval(beat.pace, beat.text[n] ?? "")));
      };

      scheduleTyping(tick, scaleRef.current(charInterval(beat.pace, beat.text[n] ?? "")));
    };

    if (skipIndicator.current) {
      skipIndicator.current = false;
      beginLine();
      return;
    }
    if (typedCount.current > 0) {
      beginLine();
      return;
    }
    setIndicatorNow(nameOf(beat.speaker));
    scheduleTyping(beginLine, scaleRef.current(TYPING_INDICATOR_DELAY));
  }

  function playCurrentBeat() {
    if (!activeRef.current || running.current) {
      return;
    }

    const currentStatus = statusRef.current;

    if (currentStatus === "choice") {
      if (picked.current) {
        setChoiceNow(null);
        setChoiceLeaving(false);
        setStatusNow("hold");
        playCurrentBeat();
        return;
      }
      const beat = DIALOGUE[indexRef.current];
      if (beat?.kind === "choice" && !choiceRef.current) {
        setChoiceNow(beat.id);
      }
      return;
    }

    if (currentStatus === "warn") {
      if (warningClearedRef.current) {
        setStatusNow("play");
        advanceAndPlay();
      }
      return;
    }

    if (currentStatus === "analysis") {
      if (analysisClearedRef.current) {
        setStatusNow("play");
        playCurrentBeat();
      }
      return;
    }

    if (currentStatus === "after") {
      return;
    }

    if (currentStatus === "hold") {
      startHold();
      return;
    }

    const beatIndex = indexRef.current;
    const beat = DIALOGUE[beatIndex] as DialogueBeat | undefined;

    if (!beat) {
      running.current = true;
      scheduleDialogue(() => {
        running.current = false;
        setStatusNow("after");
        persistProgress();
      }, scaleRef.current(600));
      return;
    }

    if (beat.kind === "line" && beat.hidden) {
      setIndexNow(beatIndex + 1);
      persistProgress();
      playCurrentBeat();
      return;
    }

    if (beat.kind === "choice") {
      if (picked.current) {
        enterNextBeat(beatIndex);
        return;
      }
      running.current = true;
      scheduleDialogue(() => {
        setChoiceNow(beat.id);
        setStatusNow("choice");
        running.current = false;
        persistProgress();
      }, scaleRef.current(180));
      return;
    }

    if (logHas(logRef.current, beatKey(beatIndex))) {
      if (beat.kind === "lost" && !logHas(logRef.current, beatKey(beatIndex, "invest"))) {
        running.current = true;
        scheduleDialogue(() => {
          pushOnce({ key: beatKey(beatIndex, "invest"), kind: "invest" });
          setStatusNow("after");
          running.current = false;
          persistProgress();
        }, scaleRef.current(700));
        return;
      }
      if (beat.kind === "inject") {
        const start = INJECT.findIndex(
          (_, step) => !logHas(logRef.current, beatKey(beatIndex, `inj-${step}`)),
        );
        if (start >= 0) {
          running.current = true;
          playInject(start);
          return;
        }
      }
      advanceAndPlay();
      return;
    }

    running.current = true;

    if (beat.kind === "time") {
      scheduleDialogue(() => {
        pushOnce({ key: beatKey(beatIndex), kind: "time", text: beat.text });
        running.current = false;
        advanceAndPlay();
      }, scaleRef.current(280));
      return;
    }

    if (beat.kind === "sys") {
      scheduleDialogue(() => {
        pushOnce({ key: beatKey(beatIndex), kind: "sys", k: beat.k, v: beat.v });
        running.current = false;
        advanceAndPlay();
      }, scaleRef.current(500));
      return;
    }

    if (beat.kind === "flash") {
      scheduleDialogue(() => {
        pushOnce({ key: beatKey(beatIndex), kind: "code", text: beat.code });
        running.current = false;
        advanceAndPlay();
      }, scaleRef.current(320));
      return;
    }

    if (beat.kind === "warn") {
      scheduleDialogue(() => {
        audioRef.current.alert();
        if (!onWarningRef.current) {
          running.current = false;
          advanceAndPlay();
          return;
        }
        onWarningRef.current();
        setStatusNow("warn");
        running.current = false;
        persistProgress();
      }, scaleRef.current(40));
      return;
    }

    if (beat.kind === "inject") {
      const start = INJECT.findIndex(
        (_, step) => !logHas(logRef.current, beatKey(beatIndex, `inj-${step}`)),
      );
      playInject(start < 0 ? INJECT.length : start);
      return;
    }

    if (beat.kind === "exitreq") {
      scheduleDialogue(() => {
        running.current = false;
        advanceAndPlay();
      }, scaleRef.current(40));
      return;
    }

    if (beat.kind === "lost") {
      scheduleDialogue(() => {
        pushOnce({ key: beatKey(beatIndex), kind: "lost" });
        scheduleDialogue(() => {
          pushOnce({ key: beatKey(beatIndex, "invest"), kind: "invest" });
          setStatusNow("after");
          running.current = false;
          persistProgress();
        }, scaleRef.current(700));
      }, scaleRef.current(200));
      return;
    }

    if (beat.kind === "line") {
      playLine(beat, beatIndex);
      return;
    }

    running.current = false;
  }

  playRef.current = playCurrentBeat;

  useEffect(() => {
    activeRef.current = active;
    if (!active) {
      clearAllAsync();
      persistProgress();
      return;
    }
    playRef.current();
    return () => {
      clearAllAsync();
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (statusRef.current === "warn" && warningCleared) {
      playRef.current();
    }
    if (statusRef.current === "analysis" && analysisCleared) {
      playRef.current();
    }
  }, [active, analysisCleared, warningCleared]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    const handleScroll = () => {
      if (restoring.current) {
        return;
      }
      pinBottom.current =
        node.scrollHeight - node.scrollTop - node.clientHeight < 56;
      savedScroll.current = node.scrollTop;
      persistRef.current({
        scroll: node.scrollTop,
        pinBottom: pinBottom.current,
      });
    };
    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (!active || !needScrollRestore.current) {
      return;
    }
    const node = scroller.current;
    if (!node) {
      return;
    }
    restoring.current = true;
    const top = savedScroll.current;
    node.scrollTop = top;
    const id = window.requestAnimationFrame(() => {
      node.scrollTop = top;
      pinBottom.current = saved.current.pinBottom;
      restoring.current = false;
      needScrollRestore.current = false;
      animationFrameRef.current = null;
    });
    animationFrameRef.current = id;
    return () => window.cancelAnimationFrame(id);
  }, [active]);

  useEffect(() => {
    if (!active || restoring.current || needScrollRestore.current || !pinBottom.current) {
      return;
    }
    end.current?.scrollIntoView({ block: "end" });
  }, [active, choice, draft, indicator, log]);

  useEffect(() => {
    return () => {
      persistProgress();
      clearAllAsync();
    };
  }, []);

  function onPick(optionId: string) {
    if (
      !choiceRef.current ||
      picked.current ||
      choiceLeaving ||
      kaiHoldRef.current ||
      statusRef.current === "hold"
    ) {
      return;
    }
    const option = SENSORY[choiceRef.current].options.find((item) => item.id === optionId);
    if (!option) {
      return;
    }
    picked.current = true;
    holdFrom.current = indexRef.current;
    setChoiceLeaving(true);
    persistRef.current({ picked: true });
    onAnalysisRef.current?.(option.lines);
    clearTimer(fadeTimerRef);
    fadeTimerRef.current = window.setTimeout(() => {
      fadeTimerRef.current = null;
      if (!activeRef.current) {
        return;
      }
      setChoiceNow(null);
      setChoiceLeaving(false);
      setStatusNow("hold");
      persistProgress();
      running.current = false;
      playRef.current();
    }, scaleRef.current(260));
  }

  function onBoxClick() {
    if (statusRef.current !== "play" || !typingRef.current) {
      return;
    }
    force.current = true;
    const beat = DIALOGUE[indexRef.current];
    if (beat?.kind === "line") {
      setDraftNow(beat.text);
      setTypingNow(false);
      setIndicatorNow("");
    }
  }

  return (
    <div ref={scroller} onClick={onBoxClick} className="chat-content px-5 py-4">
      <div className="sys-meta space-y-1 text-green-dim">
        <p>ARCHIVE LOG</p>
        <p>ID: PD-001</p>
        <p>STATUS: Recovered 91%</p>
        <p>SOURCE: Unknown Neural Relay</p>
      </div>

      <div className="mt-6 space-y-5 pb-4">
        {log.map((item) => (
          <LogLine
            key={item.key}
            item={item}
            active={active}
            onInvestDone={onComplete}
            onReadyToLeave={onReadyToLeave}
            investGate={saved.current.investGate}
            investStep={saved.current.investStep}
            onInvestChange={(investGate, investStep) => {
              saved.current.investGate = investGate;
              saved.current.investStep = investStep;
              persistRef.current({ investGate, investStep });
            }}
          />
        ))}

        {indicator ? <TypingIndicator name={indicator} /> : null}

        {draft && !indicator ? (
          <div className="font-sans text-[14px] leading-7 text-green">
            {DIALOGUE[index]?.kind === "line" && DIALOGUE[index].speaker ? (
              <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
                {nameOf(DIALOGUE[index].speaker)}
              </p>
            ) : null}
            <p>{draft}</p>
          </div>
        ) : null}

        {choice ? (
          <SensoryChoice id={choice} leaving={choiceLeaving} onPick={onPick} />
        ) : null}

        <div ref={end} />
      </div>
    </div>
  );
}

function InvestigationRecord({
  active,
  onDone,
  onReadyToLeave,
  initialGate = "idle",
  initialStep = 0,
  onInvestChange,
}: {
  active: boolean;
  onDone: () => void;
  onReadyToLeave?: () => void;
  initialGate?: InvestGate;
  initialStep?: number;
  onInvestChange?: (gate: InvestGate, step: number) => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const unlocked = initialGate !== "idle" || initialStep > 0;
  const [gate, setGate] = useState<InvestGate>(unlocked ? "open" : initialGate);
  const [step, setStep] = useState(unlocked ? 4 : initialStep);
  const investChange = useRef(onInvestChange);
  investChange.current = onInvestChange;

  useEffect(() => {
    if (!active) {
      return;
    }
    if (unlocked) {
      investChange.current?.("open", 4);
      return;
    }
    if (gate === "idle") {
      return;
    }
    if (gate === "opening") {
      const id = window.setTimeout(() => setGate("recovering"), scale(400));
      return () => window.clearTimeout(id);
    }
    if (gate === "recovering") {
      const id = window.setTimeout(() => {
        setGate("open");
        investChange.current?.("open", 0);
      }, scale(500));
      return () => window.clearTimeout(id);
    }
    if (gate !== "open" || step >= 4) {
      return;
    }
    const waits = [80, 420, 1400, 420, 420];
    const id = window.setTimeout(() => {
      const next = step + 1;
      setStep(next);
      investChange.current?.("open", next);
    }, scale(waits[step] ?? 420));
    return () => window.clearTimeout(id);
  }, [active, gate, scale, step, unlocked]);

  return (
    <div className="invest-panel is-enter">
      <div className="invest-head">
        <p className="invest-en font-mono text-[11px] tracking-[0.12em] text-sys">
          {INVESTIGATION.en}
        </p>
        <p className="invest-zh mt-2 font-sans text-[14px] text-ink">{INVESTIGATION.zh}</p>
      </div>

      <div className="invest-body">
        {gate === "idle" ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              audio.click();
              onReadyToLeave?.();
              investChange.current?.("opening", 0);
              setGate("opening");
            }}
            className="invest-open is-enter"
          >
            [ {INVESTIGATION.prompt} ]
          </button>
        ) : null}

        {gate === "opening" ? (
          <p className="font-mono text-[12px] tracking-[0.1em] text-green-dim">
            {INVESTIGATION.opening}
          </p>
        ) : null}

        {gate === "recovering" ? (
          <p className="font-mono text-[12px] tracking-[0.1em] text-green-dim">
            {INVESTIGATION.recovering}
          </p>
        ) : null}

        {gate === "open" ? (
          <div className="space-y-5">
            {step >= 1 ? (
              <p className="font-sans text-[14px] leading-7 text-ink">
                {INVESTIGATION.foundNote}
              </p>
            ) : null}
            {step >= 2 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
                  {INVESTIGATION.nameLabel}
                </p>
                <CorruptName active={active} settled={unlocked} />
              </div>
            ) : null}
            {step >= 3 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
                  {INVESTIGATION.versionLabel}
                </p>
                <p className="mt-1 font-sans text-[14px] text-ink">{INVESTIGATION.version}</p>
              </div>
            ) : null}
            {step >= 4 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
                  {INVESTIGATION.noteLabel}
                </p>
                <p className="mt-1 font-sans text-[14px] text-ink">{INVESTIGATION.note}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {gate === "open" ? (
        <div className="invest-foot">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDone();
            }}
            className="invest-exit"
          >
            [ EXIT ]
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CorruptName({
  active,
  settled = false,
}: {
  active: boolean;
  settled?: boolean;
}) {
  const scale = useScaledMs();
  const [index, setIndex] = useState(settled ? INVESTIGATION.garbles.length : -1);
  const clear = index >= INVESTIGATION.garbles.length;

  useEffect(() => {
    if (!active || settled || index >= 0) {
      return;
    }
    const start = window.setTimeout(() => setIndex(0), scale(340));
    return () => window.clearTimeout(start);
  }, [active, index, scale, settled]);

  useEffect(() => {
    if (!active || settled || index < 0 || index >= INVESTIGATION.garbles.length) {
      return;
    }
    const wait = index === INVESTIGATION.garbles.length - 1 ? 280 : 150;
    const id = window.setTimeout(() => setIndex((value) => value + 1), scale(wait));
    return () => window.clearTimeout(id);
  }, [active, index, scale, settled]);

  if (settled) {
    return <p className="recover-name is-clear">{INVESTIGATION.name}</p>;
  }

  if (index < 0) {
    return null;
  }

  return (
    <p className={clear ? "recover-name is-clear" : "recover-name"}>
      {clear ? INVESTIGATION.name : INVESTIGATION.garbles[index]}
    </p>
  );
}

function LogLine({
  item,
  active,
  onInvestDone,
  onReadyToLeave,
  investGate,
  investStep,
  onInvestChange,
}: {
  item: LogItem;
  active: boolean;
  onInvestDone: () => void;
  onReadyToLeave?: () => void;
  investGate?: InvestGate;
  investStep?: number;
  onInvestChange?: (gate: InvestGate, step: number) => void;
}) {
  if (item.kind === "time") {
    return (
      <p className="font-mono text-[12px] tracking-[0.14em] text-green-dim">{item.text}</p>
    );
  }
  if (item.kind === "msg") {
    return (
      <div className="font-sans text-[14px] leading-7 text-green">
        {item.speaker ? (
          <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
            {item.speaker}
          </p>
        ) : null}
        <p>{item.text}</p>
      </div>
    );
  }
  if (item.kind === "sys") {
    return (
      <p className="font-mono text-[11px] tracking-[0.12em] text-green-dim">
        {item.k} / {item.v}
      </p>
    );
  }
  if (item.kind === "code") {
    return <p className="font-mono text-[12px] text-sys">{item.text}</p>;
  }
  if (item.kind === "warn") {
    return null;
  }
  if (item.kind === "analysis") {
    return (
      <div className="analysis-panel space-y-2">
        <p className="font-mono text-[12px] text-green">{ANALYSIS.complete}</p>
        {item.result.map((line) => (
          <p
            key={line}
            className={
              line === "WARNING"
                ? "font-mono text-[12px] text-danger"
                : "font-mono text-[12px] text-green-dim"
            }
          >
            {line}
          </p>
        ))}
      </div>
    );
  }
  if (item.kind === "invest") {
    return (
      <InvestigationRecord
        active={active}
        onDone={onInvestDone}
        onReadyToLeave={onReadyToLeave}
        initialGate={investGate}
        initialStep={investStep}
        onInvestChange={onInvestChange}
      />
    );
  }
  if (item.kind === "lost") {
    return (
      <p className="font-mono text-[14px] tracking-[0.1em] text-danger">
        Connection Lost.
      </p>
    );
  }
  return (
    <p
      className={
        item.danger
          ? "font-mono text-[12px] text-danger"
          : "font-sans text-[14px] leading-8 text-ink/90"
      }
    >
      {item.text}
    </p>
  );
}
