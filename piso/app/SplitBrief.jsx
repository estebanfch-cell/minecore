import { useEffect, useState } from "react";
import { AGENT_BY_ID, agentCallName } from "./constants.js";

export function SplitBrief({ run }) {
  const [now, setNow] = useState(() => Date.now());
  const agentId = run?.agentId;
  const briefAt = run?.briefAt;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [agentId, briefAt]);

  if (!run?.split || !run.briefing) return null;
  const agent = AGENT_BY_ID[run.agentId];
  const name = agentCallName(agent);
  const steps = run.briefing.steps || [];
  const elapsed = Math.max(0, now - (run.briefAt || now));
  let current = 0;
  steps.forEach((step, index) => {
    if (elapsed >= step.at) current = index;
  });

  return (
    <aside className="split-brief notranslate is-swap" translate="no" key={run.agentId} aria-label="Qué está haciendo">
      <p className="split-kicker">En su puesto</p>
      <h2>{name}</h2>
      <p className="split-role">{run.briefing.role}</p>
      <p className="split-purpose">{run.briefing.purpose}</p>
      <ol>
        {steps.map((step, index) => {
          const state = index < current ? "done" : index === current ? "run" : "wait";
          return (
            <li key={step.text} className={state}>
              <span className="split-mark" aria-hidden="true">
                {state === "done" ? "✓" : ""}
              </span>
              <span>{step.text}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function SplitPortrait({ run }) {
  if (!run?.split) return null;
  const agent = AGENT_BY_ID[run.agentId];
  return (
    <aside className="split-portrait notranslate is-swap" translate="no" key={run.agentId} aria-label={agentCallName(agent)}>
      <div className="split-portrait-stage" />
      <p className="split-portrait-name">{agentCallName(agent)}</p>
    </aside>
  );
}
