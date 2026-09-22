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
  messagePause,
  type DialogueBeat,
} from "@/lib/dialogue";
import {
  BRANCH_MERGE_TEXT,
  SENSORY,
  isSensoryBranchId,
  sensoryBranches,
  type SensoryBranchId,
  type SensoryId,
} from "@/lib/sensory";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import { cn } from "@/lib/cn";
import {
  BRANCH_MERGE_ID,
  SELECTED_SENSORY_ID,
  beatId,
  branchLineId,
  logHas,
  type FieldLogItem,
  type FieldStatus,
  type InvestGate,
} from "@/lib/field-state";

const INJECT = [...SOURCE_BOOT, ...SOURCE_BIND] as const;
const SCROLLBAR_HIDE_MS = 850;

type LogItem = FieldLogItem;
type Status = FieldStatus;

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

function clearTimer(ref: { current: number | null }) {
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
  onWarningSequence,
  warningSequenceCleared = false,
  onAnalysis,
  analysisCleared = false,
  onReadyToLeave,
}: {
  active?: boolean;
  onComplete: () => void;
  onWarning?: () => void;
  warningCleared?: boolean;
  onWarningSequence?: () => void;
  warningSequenceCleared?: boolean;
  onAnalysis?: (lines: string[]) => void;
  analysisCleared?: boolean;
  onReadyToLeave?: () => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const { persistField, field } = useArchive();
  const saved = useRef(field);
  const resumeTyping =
    saved.current.status === "kai_typing_before_choice" ||
    saved.current.status === "sensory_choice";

  const [index, setIndex] = useState(saved.current.index);
  const [status, setStatus] = useState<Status>(saved.current.status);
  const [log, setLog] = useState<LogItem[]>(saved.current.log);
  const [draft, setDraft] = useState(saved.current.draft);
  const [draftSpeaker, setDraftSpeaker] = useState("");
  const [typing, setTyping] = useState(false);
  const [indicator, setIndicator] = useState(
    resumeTyping ? "Kai" : saved.current.indicator,
  );
  const [choice, setChoice] = useState<SensoryId | null>(
    saved.current.status === "sensory_choice"
      ? (saved.current.choice ?? "see")
      : saved.current.status === "kai_typing_before_choice"
        ? null
        : saved.current.choice,
  );
  const [choiceLeaving, setChoiceLeaving] = useState(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const [investigationUnlocked, setInvestigationUnlocked] = useState(
    saved.current.isInvestigationUnlocked ||
      saved.current.investGate === "open" ||
      saved.current.investStep > 0,
  );
  const [investigationOpen, setInvestigationOpen] = useState(
    saved.current.isInvestigationOpen ?? false,
  );
  const [investigationFirstReveal, setInvestigationFirstReveal] = useState(
    !(
      saved.current.isInvestigationUnlocked ||
      saved.current.investGate === "open" ||
      saved.current.investStep > 0
    ),
  );

  const indexRef = useRef(index);
  const statusRef = useRef(status);
  const logRef = useRef(log);
  const draftRef = useRef(draft);
  const typingRef = useRef(typing);
  const indicatorRef = useRef(indicator);
  const choiceRef = useRef(choice);
  const activeRef = useRef(active);
  const scaleRef = useRef(scale);
  const audioRef = useRef(audio);
  const persistRef = useRef(persistField);
  const onWarningRef = useRef(onWarning);
  const onWarningSequenceRef = useRef(onWarningSequence);
  const onAnalysisRef = useRef(onAnalysis);
  const warningClearedRef = useRef(warningCleared);
  const warningSequenceClearedRef = useRef(warningSequenceCleared);
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
  onWarningSequenceRef.current = onWarningSequence;
  onAnalysisRef.current = onAnalysis;
  warningClearedRef.current = warningCleared;
  warningSequenceClearedRef.current = warningSequenceCleared;
  analysisClearedRef.current = analysisCleared;

  const warningSequenceStartedRef = useRef(
    saved.current.warningSequence === "run" || saved.current.warningSequence === "done",
  );
  const force = useRef(false);
  const picked = useRef(saved.current.picked);
  const pickedOptionRef = useRef<SensoryBranchId | null>(saved.current.pickedOption);
  const skipIndicator = useRef(false);
  const holdFrom = useRef<number | null>(
    saved.current.picked ? saved.current.index : null,
  );
  const liveLine = useRef<{ speaker: string; text: string } | null>(null);
  const typedCount = useRef(saved.current.draft.length);
  const pinBottom = useRef(saved.current.pinBottom);
  const scroller = useRef<HTMLDivElement>(null);
  const latest = useRef<HTMLDivElement>(null);
  const breathBottom = useRef<HTMLDivElement>(null);
  const restoring = useRef(false);
  const needScrollRestore = useRef(
    saved.current.scroll > 0 || saved.current.log.length > 0,
  );
  const savedScroll = useRef(saved.current.scroll);
  const playing = useRef(false);
  const dialogueTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const leaveOnceRef = useRef(false);
  const readyToLeaveRef = useRef(onReadyToLeave);
  const completeRef = useRef(onComplete);
  readyToLeaveRef.current = onReadyToLeave;
  completeRef.current = onComplete;
  const animationFrameRef = useRef<number | null>(null);
  const scrollbarTimerRef = useRef<number | null>(null);
  const scrollbarVisibleRef = useRef(false);
  const playRef = useRef<() => void>(() => undefined);
  const centerLatestRef = useRef<(smooth: boolean) => void>(() => undefined);
  const isShortContentRef = useRef(() => true);
  const sizeBreathRef = useRef(() => undefined);
  const pinLatestToTopRef = useRef(() => undefined);

  function persistProgress() {
    persistRef.current({
      index: indexRef.current,
      status: statusRef.current,
      log: logRef.current,
      picked: picked.current,
      pickedOption: pickedOptionRef.current,
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
    playing.current = false;
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
    if (logHas(logRef.current, item.id)) {
      return false;
    }
    const next = [...logRef.current, item];
    logRef.current = next;
    setLog(next);
    persistProgress();
    return true;
  }

  function setDraftSpeakerNow(next: string) {
    setDraftSpeaker(next);
  }

  function markTimeStatus(text: string) {
    if (text === "21:12:33") {
      setStatusNow("time_21_12_33");
    } else if (text === "21:18:02") {
      setStatusNow("time_21_18_02");
    } else if (text === "21:19:47") {
      setStatusNow("connection_lost");
    }
  }

  function startWarningSequence() {
    if (warningSequenceStartedRef.current) {
      return false;
    }
    if (
      saved.current.warningSequence === "run" ||
      saved.current.warningSequence === "done"
    ) {
      return false;
    }
    if (!onWarningSequenceRef.current) {
      return false;
    }
    warningSequenceStartedRef.current = true;
    audioRef.current.alert();
    onWarningSequenceRef.current();
    setStatusNow("time_21_18_02");
    persistProgress();
    playing.current = false;
    return true;
  }

  function resetLineUi() {
    setDraftNow("");
    setDraftSpeakerNow("");
    setTypingNow(false);
    setIndicatorNow("");
    liveLine.current = null;
    force.current = false;
    typedCount.current = 0;
  }

  function advanceAndPlay() {
    resetLineUi();
    setIndexNow(indexRef.current + 1);
    persistProgress();
    playing.current = false;
    playRef.current();
  }

  function enterNextBeat(from: number) {
    let next = from + 1;
    while (next < DIALOGUE.length) {
      const beat = DIALOGUE[next];
      if (beat.kind === "time") {
        pushOnce({ id: beatId(next), kind: "time", text: beat.text });
        markTimeStatus(beat.text);
        if (beat.text === "21:18:02" && startWarningSequence()) {
          resetLineUi();
          setIndexNow(next);
          return;
        }
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
    persistProgress();
    playing.current = false;
    playRef.current();
  }

  function beginMatching() {
    if (
      statusRef.current === "matching_result" ||
      statusRef.current === "post_matching_dialogue"
    ) {
      return;
    }
    if (analysisClearedRef.current) {
      setStatusNow("post_matching_dialogue");
      persistProgress();
      playPostMatching();
      return;
    }
    const optionId = pickedOptionRef.current;
    const option = optionId
      ? SENSORY.see.options.find((item) => item.id === optionId)
      : undefined;
    if (option) {
      onAnalysisRef.current?.(option.lines);
    }
    setStatusNow("matching_result");
    persistProgress();
    playing.current = false;
  }

  function finishBranchesAndContinue() {
    const from = holdFrom.current ?? indexRef.current;
    resetLineUi();
    skipIndicator.current = false;
    setStatusNow("time_21_12_33");
    persistProgress();
    playing.current = false;
    enterNextBeat(from);
  }

  function playSyntheticLine(
    id: string,
    speaker: "LIN" | "KAI",
    text: string,
    pace: "faster" | "fast" | "normal" | "slow" | "crawl",
    then: () => void,
  ) {
    if (logHas(logRef.current, id)) {
      then();
      return;
    }

    const who = nameOf(speaker);
    liveLine.current = { speaker: who, text };

    const beginLine = () => {
      setIndicatorNow("");
      setDraftSpeakerNow(who);
      setTypingNow(true);
      let n = typedCount.current;
      if (n > 0) {
        setDraftNow(text.slice(0, n));
      }

      const commitLine = () => {
        pushOnce({
          id,
          kind: "msg",
          speaker: who,
          text,
        });
        audioRef.current.message();
        setDraftNow("");
        setDraftSpeakerNow("");
        setTypingNow(false);
        typedCount.current = 0;
        liveLine.current = null;
        scheduleDialogue(then, scaleRef.current(messagePause("early")));
      };

      const tick = () => {
        if (!activeRef.current) {
          return;
        }
        if (force.current) {
          setDraftNow(text);
          typedCount.current = text.length;
          setTypingNow(false);
          scheduleDialogue(commitLine, scaleRef.current(40));
          return;
        }
        n += 1;
        typedCount.current = n;
        setDraftNow(text.slice(0, n));
        audioRef.current.tick();
        if (n >= text.length) {
          setTypingNow(false);
          scheduleDialogue(commitLine, scaleRef.current(50));
          return;
        }
        scheduleTyping(tick, scaleRef.current(charInterval(pace, text[n] ?? "")));
      };

      scheduleTyping(tick, scaleRef.current(charInterval(pace, text[n] ?? "")));
    };

    if (typedCount.current > 0) {
      beginLine();
      return;
    }
    setIndicatorNow(who);
    scheduleTyping(beginLine, scaleRef.current(TYPING_INDICATOR_DELAY));
  }

  function playPostMatching() {
    const optionId = pickedOptionRef.current;
    if (!optionId) {
      finishBranchesAndContinue();
      return;
    }
    const branch = sensoryBranches[optionId];
    playing.current = true;

    const playMerge = () => {
      playSyntheticLine(BRANCH_MERGE_ID, "KAI", BRANCH_MERGE_TEXT, "slow", () => {
        playing.current = false;
        finishBranchesAndContinue();
      });
    };
    const playKai = () => {
      playSyntheticLine(
        branchLineId(optionId, "kai"),
        "KAI",
        branch.kaiResponse,
        "slow",
        playMerge,
      );
    };
    playSyntheticLine(
      branchLineId(optionId, "lin"),
      "LIN",
      branch.linResponse,
      "normal",
      playKai,
    );
  }

  function playInject(step: number) {
    const beatIndex = indexRef.current;
    if (step < INJECT.length) {
      scheduleDialogue(() => {
        pushOnce({
          id: beatId(beatIndex, `inj-${step}`),
          kind: "code",
          text: INJECT[step],
        });
        playInject(step + 1);
      }, scaleRef.current(220));
      return;
    }
    scheduleDialogue(() => {
      playing.current = false;
      advanceAndPlay();
    }, scaleRef.current(200));
  }

  function playLine(beat: Extract<DialogueBeat, { kind: "line" }>, beatIndex: number) {
    const lineId = beatId(beatIndex);
    if (logHas(logRef.current, lineId)) {
      playing.current = false;
      advanceAndPlay();
      return;
    }

    liveLine.current = { speaker: nameOf(beat.speaker), text: beat.text };

    const beginLine = () => {
      setIndicatorNow("");
      setDraftSpeakerNow(nameOf(beat.speaker));
      setTypingNow(true);
      let n = typedCount.current;
      if (n > 0) {
        setDraftNow(beat.text.slice(0, n));
      }
      const hold = beat.freeze ?? messagePause(pausePhase(beatIndex));

      const commitLine = () => {
        pushOnce({
          id: lineId,
          kind: "msg",
          speaker: nameOf(beat.speaker),
          text: beat.text,
        });
        audioRef.current.message();
        setDraftNow("");
        setDraftSpeakerNow("");
        setTypingNow(false);
        typedCount.current = 0;
        liveLine.current = null;
        scheduleDialogue(() => {
          playing.current = false;
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
    if (!activeRef.current || playing.current) {
      return;
    }

    const currentStatus = statusRef.current;

    if (currentStatus === "kai_typing_before_choice") {
      playing.current = true;
      setIndicatorNow("Kai");
      if (picked.current) {
        playing.current = false;
        setChoiceNow(null);
        beginMatching();
        return;
      }
      scheduleDialogue(() => {
        const beat = DIALOGUE[indexRef.current];
        if (beat?.kind === "choice") {
          setChoiceNow(beat.id);
        }
        setStatusNow("sensory_choice");
        playing.current = false;
        persistProgress();
      }, scaleRef.current(TYPING_INDICATOR_DELAY));
      return;
    }

    if (currentStatus === "sensory_choice") {
      if (picked.current) {
        setChoiceNow(null);
        setChoiceLeaving(false);
        beginMatching();
        return;
      }
      const beat = DIALOGUE[indexRef.current];
      if (beat?.kind === "choice" && !choiceRef.current) {
        setChoiceNow(beat.id);
      }
      setIndicatorNow("Kai");
      return;
    }

    if (currentStatus === "selected_sensory_result") {
      beginMatching();
      return;
    }

    if (currentStatus === "matching_result") {
      if (analysisClearedRef.current) {
        setStatusNow("post_matching_dialogue");
        persistProgress();
        playPostMatching();
      }
      return;
    }

    if (currentStatus === "post_matching_dialogue") {
      playPostMatching();
      return;
    }

    if (currentStatus === "time_21_18_02" && !warningSequenceClearedRef.current) {
      return;
    }

    if (currentStatus === "warn") {
      if (warningClearedRef.current) {
        setStatusNow("time_21_18_02");
        advanceAndPlay();
      }
      return;
    }

    if (currentStatus === "after") {
      return;
    }

    const beatIndex = indexRef.current;
    const beat = DIALOGUE[beatIndex] as DialogueBeat | undefined;

    if (!beat) {
      playing.current = true;
      scheduleDialogue(() => {
        playing.current = false;
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
      if (picked.current && logHas(logRef.current, SELECTED_SENSORY_ID)) {
        if (analysisClearedRef.current || logHas(logRef.current, BRANCH_MERGE_ID)) {
          setStatusNow("post_matching_dialogue");
          persistProgress();
          playPostMatching();
          return;
        }
        if (saved.current.scan === "run" || saved.current.scan === "resume") {
          setStatusNow("matching_result");
          persistProgress();
          return;
        }
        beginMatching();
        return;
      }
      playing.current = true;
      setIndicatorNow("Kai");
      setStatusNow("kai_typing_before_choice");
      persistProgress();
      scheduleDialogue(() => {
        setChoiceNow(beat.id);
        setStatusNow("sensory_choice");
        playing.current = false;
        persistProgress();
      }, scaleRef.current(TYPING_INDICATOR_DELAY));
      return;
    }

    if (logHas(logRef.current, beatId(beatIndex))) {
      if (beat.kind === "lost" && !logHas(logRef.current, beatId(beatIndex, "invest"))) {
        playing.current = true;
        scheduleDialogue(() => {
          pushOnce({ id: beatId(beatIndex, "invest"), kind: "invest" });
          setStatusNow("after");
          playing.current = false;
          persistProgress();
        }, scaleRef.current(700));
        return;
      }
      if (beat.kind === "inject") {
        const start = INJECT.findIndex(
          (_, step) => !logHas(logRef.current, beatId(beatIndex, `inj-${step}`)),
        );
        if (start >= 0) {
          playing.current = true;
          playInject(start);
          return;
        }
      }
      advanceAndPlay();
      return;
    }

    playing.current = true;

    if (beat.kind === "time") {
      scheduleDialogue(() => {
        pushOnce({ id: beatId(beatIndex), kind: "time", text: beat.text });
        markTimeStatus(beat.text);
        playing.current = false;
        if (beat.text === "21:18:02" && startWarningSequence()) {
          return;
        }
        advanceAndPlay();
      }, scaleRef.current(280));
      return;
    }

    if (beat.kind === "sys") {
      scheduleDialogue(() => {
        pushOnce({ id: beatId(beatIndex), kind: "sys", k: beat.k, v: beat.v });
        playing.current = false;
        advanceAndPlay();
      }, scaleRef.current(500));
      return;
    }

    if (beat.kind === "flash") {
      scheduleDialogue(() => {
        pushOnce({ id: beatId(beatIndex), kind: "code", text: beat.code });
        playing.current = false;
        advanceAndPlay();
      }, scaleRef.current(320));
      return;
    }

    if (beat.kind === "warn") {
      scheduleDialogue(() => {
        if (warningSequenceClearedRef.current) {
          pushOnce({
            id: beatId(beatIndex),
            kind: "note",
            text: "⚠ WARNING! Host vital signs are declining.",
            danger: true,
          });
          playing.current = false;
          advanceAndPlay();
          return;
        }
        audioRef.current.alert();
        if (!onWarningRef.current) {
          playing.current = false;
          advanceAndPlay();
          return;
        }
        onWarningRef.current();
        setStatusNow("warn");
        playing.current = false;
        persistProgress();
      }, scaleRef.current(40));
      return;
    }

    if (beat.kind === "inject") {
      const start = INJECT.findIndex(
        (_, step) => !logHas(logRef.current, beatId(beatIndex, `inj-${step}`)),
      );
      playInject(start < 0 ? INJECT.length : start);
      return;
    }

    if (beat.kind === "exitreq") {
      scheduleDialogue(() => {
        playing.current = false;
        advanceAndPlay();
      }, scaleRef.current(40));
      return;
    }

    if (beat.kind === "lost") {
      scheduleDialogue(() => {
        pushOnce({ id: beatId(beatIndex), kind: "lost" });
        setStatusNow("connection_lost");
        scheduleDialogue(() => {
          pushOnce({ id: beatId(beatIndex, "invest"), kind: "invest" });
          setStatusNow("after");
          playing.current = false;
          persistProgress();
        }, scaleRef.current(700));
      }, scaleRef.current(200));
      return;
    }

    if (beat.kind === "line") {
      playLine(beat, beatIndex);
      return;
    }

    playing.current = false;
  }

  playRef.current = playCurrentBeat;

  useEffect(() => {
    if (status === "after" || investigationUnlocked || investigationOpen) {
      readyToLeaveRef.current?.();
    }
  }, [investigationOpen, investigationUnlocked, status]);

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
    if (statusRef.current === "time_21_18_02" && warningSequenceCleared) {
      playRef.current();
    }
    if (statusRef.current === "matching_result" && analysisCleared) {
      playRef.current();
    }
  }, [active, analysisCleared, warningCleared, warningSequenceCleared]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }

    const hideBar = () => {
      scrollbarTimerRef.current = null;
      scrollbarVisibleRef.current = false;
      setScrollbarVisible(false);
    };

    const showBar = () => {
      if (!scrollbarVisibleRef.current) {
        scrollbarVisibleRef.current = true;
        setScrollbarVisible(true);
      }
      if (scrollbarTimerRef.current != null) {
        window.clearTimeout(scrollbarTimerRef.current);
      }
      scrollbarTimerRef.current = window.setTimeout(hideBar, SCROLLBAR_HIDE_MS);
    };

    const handleScroll = () => {
      if (restoring.current) {
        return;
      }
      const mark = latest.current;
      // Short logs stay top-aligned. Do not treat that as "unfollow",
      // or later messages will never start moving toward the mid-frame.
      if (mark && !isShortContentRef.current()) {
        const viewMid = node.getBoundingClientRect().top + node.clientHeight * 0.5;
        const markMid = mark.getBoundingClientRect().top + mark.offsetHeight * 0.5;
        pinBottom.current = Math.abs(markMid - viewMid) < 96;
      }
      savedScroll.current = node.scrollTop;
      persistRef.current({
        scroll: node.scrollTop,
        pinBottom: pinBottom.current,
      });
      if (scrollbarVisibleRef.current) {
        showBar();
      }
    };

    const takeOver = () => {
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      restoring.current = false;
      showBar();
    };

    const fitBreath = () => {
      sizeBreathRef.current();
    };
    fitBreath();
    const resize = new ResizeObserver(fitBreath);
    resize.observe(node);

    node.addEventListener("scroll", handleScroll, { passive: true });
    node.addEventListener("wheel", takeOver, { passive: true });
    node.addEventListener("touchmove", takeOver, { passive: true });
    return () => {
      resize.disconnect();
      node.removeEventListener("scroll", handleScroll);
      node.removeEventListener("wheel", takeOver);
      node.removeEventListener("touchmove", takeOver);
      clearTimer(scrollbarTimerRef);
    };
  }, []);

  useLayoutEffect(() => {
    if (!active) {
      return;
    }
    const node = scroller.current;
    if (!node) {
      return;
    }
    if (needScrollRestore.current) {
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
    }
    if (isShortContentRef.current()) {
      restoring.current = true;
      node.scrollTop = 0;
      savedScroll.current = 0;
      const id = window.requestAnimationFrame(() => {
        node.scrollTop = 0;
        restoring.current = false;
        animationFrameRef.current = null;
      });
      animationFrameRef.current = id;
      return () => window.cancelAnimationFrame(id);
    }
  }, [active]);

  function contentHeight() {
    const view = scroller.current;
    if (!view) {
      return 0;
    }
    return view.scrollHeight - (breathBottom.current?.offsetHeight ?? 0);
  }

  function isShortContent() {
    const view = scroller.current;
    if (!view) {
      return true;
    }
    return contentHeight() <= view.clientHeight * 0.75;
  }

  function sizeBreath() {
    const view = scroller.current;
    if (!view || !breathBottom.current) {
      return;
    }
    if (isShortContent()) {
      breathBottom.current.style.height = "0px";
      return;
    }
    breathBottom.current.style.height = `${Math.round(view.clientHeight * 0.42)}px`;
  }

  function pinLatestToTop() {
    const view = scroller.current;
    if (!view) {
      return;
    }
    sizeBreath();
    if (view.scrollTop === 0) {
      return;
    }
    restoring.current = true;
    view.scrollTop = 0;
    savedScroll.current = 0;
    window.requestAnimationFrame(() => {
      restoring.current = false;
    });
  }

  function centerLatest(smooth: boolean) {
    const view = scroller.current;
    const mark = latest.current;
    if (!view || !mark) {
      return;
    }
    if (isShortContent()) {
      pinLatestToTop();
      return;
    }
    if (!pinBottom.current) {
      return;
    }
    sizeBreath();
    const viewMid = view.getBoundingClientRect().top + view.clientHeight * 0.5;
    const markMid = mark.getBoundingClientRect().top + mark.offsetHeight * 0.5;
    const max = Math.max(0, view.scrollHeight - view.clientHeight);
    const next = Math.max(0, Math.min(max, view.scrollTop + (markMid - viewMid)));
    if (Math.abs(next - view.scrollTop) < 2) {
      return;
    }
    if (animationFrameRef.current != null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (!smooth) {
      restoring.current = true;
      view.scrollTop = next;
      savedScroll.current = next;
      window.requestAnimationFrame(() => {
        restoring.current = false;
      });
      return;
    }
    const from = view.scrollTop;
    const started = performance.now();
    restoring.current = true;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 300);
      const eased = 1 - (1 - t) * (1 - t);
      view.scrollTop = from + (next - from) * eased;
      if (t < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }
      animationFrameRef.current = null;
      savedScroll.current = view.scrollTop;
      restoring.current = false;
    };
    animationFrameRef.current = window.requestAnimationFrame(tick);
  }

  isShortContentRef.current = isShortContent;
  sizeBreathRef.current = sizeBreath;
  pinLatestToTopRef.current = pinLatestToTop;
  centerLatestRef.current = centerLatest;

  useLayoutEffect(() => {
    if (!active || restoring.current || needScrollRestore.current) {
      return;
    }
    if (isShortContentRef.current()) {
      pinLatestToTopRef.current();
      return;
    }
    if (!pinBottom.current) {
      return;
    }
    centerLatestRef.current(true);
  }, [active, choice, indicator, log]);

  useLayoutEffect(() => {
    if (!active || restoring.current || needScrollRestore.current || !pinBottom.current) {
      return;
    }
    if (isShortContentRef.current()) {
      return;
    }
    centerLatestRef.current(false);
  }, [active, draft]);

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
      statusRef.current !== "sensory_choice" ||
      !isSensoryBranchId(optionId)
    ) {
      return;
    }
    const option = SENSORY[choiceRef.current].options.find((item) => item.id === optionId);
    const branch = sensoryBranches[optionId];
    if (!option || !branch) {
      return;
    }
    picked.current = true;
    pickedOptionRef.current = optionId;
    holdFrom.current = indexRef.current;
    setIndicatorNow("");
    pushOnce({
      id: SELECTED_SENSORY_ID,
      kind: "msg",
      speaker: "Kai",
      text: branch.option,
    });
    audioRef.current.message();
    setChoiceLeaving(true);
    persistProgress();
    beginMatching();
    clearTimer(fadeTimerRef);
    fadeTimerRef.current = window.setTimeout(() => {
      fadeTimerRef.current = null;
      if (!activeRef.current) {
        return;
      }
      setChoiceNow(null);
      setChoiceLeaving(false);
      persistProgress();
    }, scaleRef.current(260));
  }

  function onBoxClick() {
    if (!typingRef.current) {
      return;
    }
    if (
      statusRef.current === "kai_typing_before_choice" ||
      statusRef.current === "sensory_choice" ||
      statusRef.current === "selected_sensory_result" ||
      statusRef.current === "matching_result"
    ) {
      return;
    }
    force.current = true;
    const live = liveLine.current;
    if (live) {
      setDraftNow(live.text);
      setDraftSpeakerNow(live.speaker);
      setTypingNow(false);
      setIndicatorNow("");
      return;
    }
    const beat = DIALOGUE[indexRef.current];
    if (beat?.kind === "line") {
      setDraftNow(beat.text);
      setDraftSpeakerNow(nameOf(beat.speaker));
      setTypingNow(false);
      setIndicatorNow("");
    }
  }

  function persistInvestigation(patch: {
    isInvestigationUnlocked?: boolean;
    isInvestigationOpen?: boolean;
    investGate?: InvestGate;
    investStep?: number;
  }) {
    if (patch.isInvestigationUnlocked != null) {
      saved.current.isInvestigationUnlocked = patch.isInvestigationUnlocked;
    }
    if (patch.isInvestigationOpen != null) {
      saved.current.isInvestigationOpen = patch.isInvestigationOpen;
    }
    if (patch.investGate != null) {
      saved.current.investGate = patch.investGate;
    }
    if (patch.investStep != null) {
      saved.current.investStep = patch.investStep;
    }
    persistRef.current({
      isInvestigationUnlocked: saved.current.isInvestigationUnlocked,
      isInvestigationOpen: saved.current.isInvestigationOpen,
      investGate: saved.current.investGate,
      investStep: saved.current.investStep,
    });
  }

  function markReadyToLeave() {
    readyToLeaveRef.current?.();
  }

  function requestLeave() {
    if (leaveOnceRef.current) {
      return;
    }
    leaveOnceRef.current = true;
    markReadyToLeave();
    completeRef.current();
  }

  function openInvestigation() {
    const first = !investigationUnlocked;
    audio.click();
    setInvestigationFirstReveal(first);
    setInvestigationUnlocked(true);
    setInvestigationOpen(true);
    markReadyToLeave();
    persistInvestigation({
      isInvestigationUnlocked: true,
      isInvestigationOpen: true,
      investGate: "open",
      investStep: 4,
    });
    window.requestAnimationFrame(() => {
      centerLatestRef.current(true);
    });
  }

  const lastItem = log[log.length - 1];

  return (
    <div className="field-record-shell">
      <div
        ref={scroller}
        onClick={onBoxClick}
        className={cn("chat-content px-5 py-4", scrollbarVisible && "is-scrolling")}
      >
        <div className="chat-stack">
          <div className="sys-meta space-y-1 text-green-dim">
            <p>ARCHIVE LOG</p>
            <p>ID: PD-001</p>
            <p>STATUS: Recovered 91%</p>
            <p>SOURCE: Unknown Neural Relay</p>
          </div>

          <div className="mt-6 space-y-5">
            {log.slice(0, -1).map((item) => (
              <LogLine
                key={item.id}
                item={item}
                active={active}
                investigationOpen={investigationOpen}
                firstReveal={investigationFirstReveal}
                onOpenInvestigation={openInvestigation}
                onLeave={requestLeave}
              />
            ))}

            <div ref={latest} className="chat-latest space-y-5">
              {lastItem ? (
                <LogLine
                  key={lastItem.id}
                  item={lastItem}
                  active={active}
                  investigationOpen={investigationOpen}
                  firstReveal={investigationFirstReveal}
                  onOpenInvestigation={openInvestigation}
                  onLeave={requestLeave}
                />
              ) : null}

              {indicator ? <TypingIndicator name={indicator} /> : null}

              {draft && !indicator ? (
                <div className="font-sans text-[14px] leading-7 text-green">
                  {draftSpeaker ? (
                    <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
                      {draftSpeaker}
                    </p>
                  ) : null}
                  <p>{draft}</p>
                </div>
              ) : null}

              {choice ? (
                <SensoryChoice id={choice} leaving={choiceLeaving} onPick={onPick} />
              ) : null}
            </div>
          </div>
          <div ref={breathBottom} className="chat-breath" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function InvestigationTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="invest-trigger is-enter">
      <p className="invest-en font-mono text-[11px] tracking-[0.12em] text-sys">
        {INVESTIGATION.en}
      </p>
      <p className="invest-zh mt-2 font-sans text-[14px] text-ink">{INVESTIGATION.zh}</p>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className="invest-open is-enter mt-5"
      >
        [ {INVESTIGATION.prompt} ]
      </button>
    </div>
  );
}

function InvestigationPanel({
  active,
  firstReveal,
  onLeave,
}: {
  active: boolean;
  firstReveal: boolean;
  onLeave: () => void;
}) {
  return (
    <div className="invest-panel is-enter">
      <div className="invest-head">
        <p className="invest-en font-mono text-[11px] tracking-[0.12em] text-sys">
          {INVESTIGATION.en}
        </p>
        <p className="invest-zh mt-2 font-sans text-[14px] text-ink">{INVESTIGATION.zh}</p>
      </div>

      <div className="invest-body">
        <div className="space-y-5">
          <p className="font-sans text-[14px] leading-7 text-ink">{INVESTIGATION.title}</p>
          <p className="font-sans text-[14px] leading-7 text-ink">
            {INVESTIGATION.foundNote}
          </p>
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
              {INVESTIGATION.nameLabel}
            </p>
            <CorruptName active={active} settled={!firstReveal} />
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
              {INVESTIGATION.versionLabel}
            </p>
            <p className="mt-1 font-sans text-[14px] text-ink">{INVESTIGATION.version}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
              {INVESTIGATION.noteLabel}
            </p>
            <p className="mt-1 font-sans text-[14px] text-ink">{INVESTIGATION.note}</p>
          </div>
        </div>
      </div>

      <div className="invest-foot">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onLeave();
          }}
          className="invest-exit"
        >
          [ {INVESTIGATION.close} ]
        </button>
      </div>
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
  investigationOpen,
  firstReveal,
  onOpenInvestigation,
  onLeave,
}: {
  item: LogItem;
  active: boolean;
  investigationOpen: boolean;
  firstReveal: boolean;
  onOpenInvestigation: () => void;
  onLeave: () => void;
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
    if (investigationOpen) {
      return (
        <InvestigationPanel
          active={active}
          firstReveal={firstReveal}
          onLeave={onLeave}
        />
      );
    }
    return <InvestigationTrigger onOpen={onOpenInvestigation} />;
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
