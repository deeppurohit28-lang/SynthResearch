"use client";

import React, { useState, useEffect } from "react";

// Helper for dynamic cost and latency estimation matching the backend logic
function estimateRunCost(personas: number, questions: number) {
  const agent1_in = 1200 + personas * 150;
  const agent1_out = 1500 + personas * 350;

  const agent2_in = agent1_out + 800;
  const agent2_out = 300 + questions * 250;

  const agent3_in_per = 900 + (questions + 2) * 60;
  const agent3_out_per = (questions + 2) * 280;

  const transcript_tokens = personas * (questions + 2) * 200;
  const agent4_in = transcript_tokens + 800;
  const agent4_out = 3000;

  const total_in = agent1_in + agent2_in + (personas * agent3_in_per) + agent4_in;
  const total_out = agent1_out + agent2_out + (personas * agent3_out_per) + agent4_out;

  // Cost calculation: input tokens ($1.25/1M) + output tokens ($10/1M)
  const cost = (total_in * 0.00125) / 1000 + (total_out * 0.01000) / 1000;
  
  const agent3_latency = (questions + 2) * 4;
  const latency = 30 + agent3_latency + 70;

  return {
    costUsd: Math.round(cost * 100) / 100,
    latencySec: latency,
  };
}

export default function Home() {
  const [view, setView] = useState<
    | "landing"
    | "intake"
    | "loading_personas"
    | "personas_review"
    | "loading_guide"
    | "guide_review"
    | "loading_simulation"
    | "transcript_review"
    | "loading_synthesis"
    | "report"
  >("landing");
  const [sessionId, setSessionId] = useState("");

  // Form State
  const [description, setDescription] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [researchGoal, setResearchGoal] = useState("");
  const [productStage, setProductStage] = useState("Just an idea");
  const [personaCount, setPersonaCount] = useState(5);
  const [questionCount, setQuestionCount] = useState(6);

  // Form Validation Touched States
  const [descTouched, setDescTouched] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const [goalTouched, setGoalTouched] = useState(false);

  // Run State
  const [runId, setRunId] = useState<string | null>(null);
  const [personas, setPersonas] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState<"loading" | "error">("loading");
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Card Interaction States
  const [editingPersona, setEditingPersona] = useState<any | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [regeneratingPersonaId, setRegeneratingPersonaId] = useState<string | null>(null);

  // Add Persona State
  const [newPersona, setNewPersona] = useState({
    name: "",
    age: 30,
    role: "",
    location: "",
    background: "",
    goals: "",
    frustrations: "",
    behavioral_context: "",
    relationship_to_problem: "",
    tech_savviness: "medium",
    quote: ""
  });

  // Guide Review States
  const [guide, setGuide] = useState<any>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionFields, setEditingQuestionFields] = useState({
    question: "",
    intent: "",
    follow_up_probes: ""
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionFields, setNewQuestionFields] = useState({
    question: "",
    intent: "",
    follow_up_probes: ""
  });
  const [expandedIntentIds, setExpandedIntentIds] = useState<Set<string>>(new Set());
  const [expandedProbesIds, setExpandedProbesIds] = useState<Set<string>>(new Set());

  const toggleIntent = (id: string) => {
    setExpandedIntentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleProbes = (id: string) => {
    setExpandedProbesIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Simulation States
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [simulationProgress, setSimulationProgress] = useState<Record<string, { status: string; progressText: string }>>({});
  const [failedPersonas, setFailedPersonas] = useState<string[]>([]);

  // Transcript Review States
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [excludedPersonaIds, setExcludedPersonaIds] = useState<Set<string>>(new Set());
  const [regeneratingTranscriptPersonaId, setRegeneratingTranscriptPersonaId] = useState<string | null>(null);

  // Validation Checks
  const isDescValid = description.length >= 50;
  const isUserValid = targetUser.length >= 30;
  const isGoalValid = researchGoal.length >= 30;
  const isFormValid = isDescValid && isUserValid && isGoalValid;

  // Recalculate cost dynamically
  const { costUsd, latencySec } = estimateRunCost(personaCount, questionCount);
  const estimatedMin = Math.ceil(latencySec / 60);

  // Initialize session ID on mount
  useEffect(() => {
    let sid = localStorage.getItem("researchos_session_id");
    if (!sid) {
      sid = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("researchos_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Form Submit Action
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setView("loading_personas");
    setLoadingState("loading");
    setApiError(null);

    const stageMapping: Record<string, string> = {
      "Just an idea": "idea",
      "Pre-MVP": "pre-mvp",
      "Live MVP": "mvp",
      "Post-launch": "post-launch"
    };

    const intakePayload = {
      product_description: description,
      target_user: targetUser,
      research_goal: researchGoal,
      product_stage: stageMapping[productStage] || "idea",
      persona_count: personaCount,
      question_count: questionCount
    };

    try {
      // Create Run
      const createRes = await fetch(`${API_URL}/api/run/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intake: intakePayload,
          session_id: sessionId || "local-session",
          user_email: null
        })
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create study: ${createRes.statusText}`);
      }

      const createData = await createRes.json();
      const newRunId = createData.run_id;
      setRunId(newRunId);

      sessionStorage.setItem("researchos_run_id", newRunId);
      sessionStorage.setItem("researchos_intake", JSON.stringify(intakePayload));

      // Trigger Persona Generation
      await startPersonaGeneration(newRunId);
    } catch (err: any) {
      console.error(err);
      setLoadingState("error");
      setApiError(err.message || "Something went wrong while setting up the study.");
    }
  };

  // Trigger persona generation API
  const startPersonaGeneration = async (targetRunId: string) => {
    setLoadingState("loading");
    setApiError(null);

    try {
      const res = await fetch(`${API_URL}/api/run/${targetRunId}/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: targetRunId })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail?.message || errData.detail || `Server error: ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setPersonas(data.personas);
      sessionStorage.setItem("researchos_personas", JSON.stringify(data.personas));
      setView("personas_review");
    } catch (err: any) {
      console.error(err);
      setLoadingState("error");
      setApiError(err.message || "Failed to generate personas. Please try again.");
    }
  };

  // Card Regeneration Action
  const handleRegeneratePersona = async (personaId: string) => {
    if (regeneratingPersonaId) return;
    setRegeneratingPersonaId(personaId);

    try {
      const existingPersonas = personas.filter(p => p.id !== personaId);

      const res = await fetch(`${API_URL}/api/run/${runId}/personas/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existing_personas: existingPersonas
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to regenerate persona: ${res.statusText}`);
      }

      const data = await res.json();
      const newPersonaObj = {
        ...data.persona,
        id: personaId,
        _source: "AI Generated"
      };

      setPersonas(prev => prev.map(p => p.id === personaId ? newPersonaObj : p));

      // Track behavior
      await fetch(`${API_URL}/api/run/${runId}/behavior`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "gate1_persona_regenerated" })
      }).catch(err => console.error("Behavior tracking failed:", err));

    } catch (err: any) {
      console.error(err);
      alert(`Regeneration failed: ${err.message}`);
    } finally {
      setRegeneratingPersonaId(null);
    }
  };

  // Card Delete Action
  const handleDeletePersona = async (personaId: string) => {
    const target = personas.find(p => p.id === personaId);
    if (!target) return;

    const confirmDelete = window.confirm(`Remove ${target.name} from this study?\nThey won't be interviewed and won't appear in synthesis.`);
    if (!confirmDelete) return;

    setPersonas(prev => prev.filter(p => p.id !== personaId));

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate1_persona_deleted" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // Card Edit Init
  const handleOpenEdit = (persona: any) => {
    setEditingPersona({
      ...persona,
      goals: Array.isArray(persona.goals) ? persona.goals.join("\n") : persona.goals,
      frustrations: Array.isArray(persona.frustrations) ? persona.frustrations.join("\n") : persona.frustrations
    });
    setIsEditPanelOpen(true);
  };

  // Card Edit Save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersona) return;

    const updated = {
      ...editingPersona,
      age: Number(editingPersona.age) || 30,
      goals: typeof editingPersona.goals === "string" 
        ? editingPersona.goals.split("\n").map((g: string) => g.trim()).filter(Boolean) 
        : editingPersona.goals,
      frustrations: typeof editingPersona.frustrations === "string" 
        ? editingPersona.frustrations.split("\n").map((f: string) => f.trim()).filter(Boolean) 
        : editingPersona.frustrations,
      _source: "Edited"
    };

    setPersonas(prev => prev.map(p => p.id === editingPersona.id ? updated : p));
    setIsEditPanelOpen(false);
    setEditingPersona(null);

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate1_persona_edited" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // Manual Add Save
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `manual_${Math.random().toString(36).substring(2, 9)}`;

    const added = {
      ...newPersona,
      id: generatedId,
      age: Number(newPersona.age) || 30,
      goals: newPersona.goals.split("\n").map(g => g.trim()).filter(Boolean),
      frustrations: newPersona.frustrations.split("\n").map(f => f.trim()).filter(Boolean),
      _source: "You added"
    };

    setPersonas(prev => [...prev, added]);
    setIsAddPanelOpen(false);

    // Reset
    setNewPersona({
      name: "",
      age: 30,
      role: "",
      location: "",
      background: "",
      goals: "",
      frustrations: "",
      behavioral_context: "",
      relationship_to_problem: "",
      tech_savviness: "medium",
      quote: ""
    });

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate1_persona_added" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // ── Guide Generation ──
  const startGuideGeneration = async (targetRunId: string) => {
    setView("loading_guide");
    setLoadingState("loading");
    setApiError(null);

    try {
      const res = await fetch(`${API_URL}/api/run/${targetRunId}/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: targetRunId,
          personas: personas.map(p => ({
            id: p.id,
            name: p.name,
            age: p.age,
            role: p.role,
            location: p.location,
            background: p.background,
            goals: Array.isArray(p.goals) ? p.goals : [],
            frustrations: Array.isArray(p.frustrations) ? p.frustrations : [],
            behavioral_context: p.behavioral_context || "",
            relationship_to_problem: p.relationship_to_problem || "",
            tech_savviness: p.tech_savviness || "medium",
            quote: p.quote || ""
          }))
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail?.message || errData.detail || `Server error: ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setGuide(data.guide);
      sessionStorage.setItem("researchos_guide", JSON.stringify(data.guide));
      setView("guide_review");
    } catch (err: any) {
      console.error(err);
      setLoadingState("error");
      setApiError(err.message || "Failed to generate interview guide. Please try again.");
    }
  };

  // ── Save Question Edit ──
  const handleSaveQuestionEdit = (id: string, updatedData: any) => {
    setGuide((prev: any) => {
      if (!prev) return prev;
      if (id === "warmup") {
        return { ...prev, warmup_question: updatedData.question };
      } else if (id === "closing") {
        return { ...prev, closing_question: updatedData.question };
      } else {
        return {
          ...prev,
          questions: prev.questions.map((q: any) =>
            q.id === id
              ? {
                  ...q,
                  question: updatedData.question,
                  intent: updatedData.intent,
                  follow_up_probes: updatedData.follow_up_probes
                }
              : q
          )
        };
      }
    });
    setEditingQuestionId(null);

    // Track behavior
    fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate2_question_edited" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // ── Save Add Question ──
  const handleSaveAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionFields.question.trim()) return;

    const newId = `custom_q_${Math.random().toString(36).substring(2, 9)}`;
    const newQ = {
      id: newId,
      question: newQuestionFields.question.trim(),
      intent: newQuestionFields.intent.trim() || "User defined question",
      follow_up_probes: newQuestionFields.follow_up_probes
        ? newQuestionFields.follow_up_probes.split("\n").map(p => p.trim()).filter(Boolean)
        : ["Probe deeper on this response."]
    };

    setGuide((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [...prev.questions, newQ]
      };
    });

    setNewQuestionFields({ question: "", intent: "", follow_up_probes: "" });
    setIsAddingQuestion(false);

    // Track behavior
    fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate2_question_added" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // ── Run Interview Simulation ──
  const startSimulation = async (targetRunId: string) => {
    setView("loading_simulation");
    setLoadingState("loading");
    setApiError(null);
    setFailedPersonas([]);

    // Initialize progress for each persona
    const initialProgress: Record<string, { status: string; progressText: string }> = {};
    personas.forEach(p => {
      initialProgress[p.id] = { status: "waiting", progressText: "Waiting..." };
    });
    setSimulationProgress(initialProgress);

    const totalQ = (guide?.questions?.length || 0) + 2; // warmup + core + closing

    let elapsedSeconds = 0;
    const progressInterval = setInterval(() => {
      elapsedSeconds += 1;
      setSimulationProgress(prev => {
        const next = { ...prev };
        personas.forEach((p, idx) => {
          const state = next[p.id];
          if (!state) return;
          
          const offset = idx * 8; // offset each persona's start
          const timeForPersona = elapsedSeconds - offset;
          
          if (timeForPersona <= 0) {
            next[p.id] = { status: "waiting", progressText: "Waiting..." };
          } else if (timeForPersona > 0 && timeForPersona < 45) {
            const currentQ = Math.min(totalQ, Math.ceil(timeForPersona / 6));
            if (currentQ < totalQ) {
              next[p.id] = { 
                status: "responding", 
                progressText: `Responding... (Q${currentQ} of ${totalQ})` 
              };
            } else {
              next[p.id] = { 
                status: "responding", 
                progressText: `Responding... (${totalQ} of ${totalQ} answered)` 
              };
            }
          } else {
            next[p.id] = { 
              status: "complete", 
              progressText: `${totalQ} of ${totalQ} answered` 
            };
          }
        });
        return next;
      });
    }, 1000);

    try {
      const res = await fetch(`${API_URL}/api/run/${targetRunId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: targetRunId,
          personas: personas.map(p => ({
            id: p.id,
            name: p.name,
            age: p.age,
            role: p.role,
            location: p.location,
            background: p.background,
            goals: Array.isArray(p.goals) ? p.goals : [],
            frustrations: Array.isArray(p.frustrations) ? p.frustrations : [],
            behavioral_context: p.behavioral_context || "",
            relationship_to_problem: p.relationship_to_problem || "",
            tech_savviness: p.tech_savviness || "medium",
            quote: p.quote || ""
          })),
          guide: guide
        })
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail?.message || errData.detail || `Server error: ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      
      setFailedPersonas(data.failed_personas || []);
      
      setSimulationProgress(prev => {
        const next = { ...prev };
        personas.forEach(p => {
          if (data.failed_personas?.includes(p.id)) {
            next[p.id] = { status: "failed", progressText: "Interview failed" };
          } else {
            next[p.id] = { status: "complete", progressText: `${totalQ} of ${totalQ} answered` };
          }
        });
        return next;
      });

      setTranscripts(data.transcripts);
      sessionStorage.setItem("researchos_transcripts", JSON.stringify(data.transcripts));
      
      const firstValid = data.transcripts.find((t: any) => !data.failed_personas?.includes(t.persona_id));
      if (firstValid) {
        setSelectedPersonaId(firstValid.persona_id);
      } else {
        setSelectedPersonaId(null);
      }

      setTimeout(() => {
        setView("transcript_review");
      }, 1500);

    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      setLoadingState("error");
      setApiError(err.message || "Failed to run simulation. Please try again.");
    }
  };

  // ── Regenerate Transcript ──
  const handleRegenerateTranscript = async (personaId: string) => {
    if (regeneratingTranscriptPersonaId) return;
    setRegeneratingTranscriptPersonaId(personaId);

    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    try {
      const res = await fetch(`${API_URL}/api/run/${runId}/simulate/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: {
            id: persona.id,
            name: persona.name,
            age: persona.age,
            role: persona.role,
            location: persona.location,
            background: persona.background,
            goals: Array.isArray(persona.goals) ? persona.goals : [],
            frustrations: Array.isArray(persona.frustrations) ? persona.frustrations : [],
            behavioral_context: persona.behavioral_context || "",
            relationship_to_problem: persona.relationship_to_problem || "",
            tech_savviness: persona.tech_savviness || "medium",
            quote: persona.quote || ""
          },
          guide: guide
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to regenerate transcript: ${res.statusText}`);
      }

      const data = await res.json();
      
      setTranscripts(prev => {
        const existing = prev.filter(t => t.persona_id !== personaId);
        return [...existing, data.transcript];
      });

      setFailedPersonas(prev => prev.filter(id => id !== personaId));

      // Track behavior
      await fetch(`${API_URL}/api/run/${runId}/behavior`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "gate3_transcript_regenerated" })
      }).catch(err => console.error("Behavior tracking failed:", err));

    } catch (err: any) {
      console.error(err);
      alert(`Regeneration failed: ${err.message}`);
    } finally {
      setRegeneratingTranscriptPersonaId(null);
    }
  };

  // ── Exclude Persona Toggle ──
  const handleToggleExcludePersona = async (personaId: string) => {
    setExcludedPersonaIds(prev => {
      const next = new Set(prev);
      if (next.has(personaId)) {
        next.delete(personaId);
      } else {
        next.add(personaId);
      }
      return next;
    });

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate3_transcript_excluded" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // ── Synthesis & Report States ──
  const [report, setReport] = useState<any | null>(null);
  const [synthesisStep, setSynthesisStep] = useState(1);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Undo States
  const [lastDeletedHypothesis, setLastDeletedHypothesis] = useState<any | null>(null);
  const [showUndoHypothesis, setShowUndoHypothesis] = useState(false);
  const [lastDeletedRecommendation, setLastDeletedRecommendation] = useState<any | null>(null);
  const [showUndoRecommendation, setShowUndoRecommendation] = useState(false);

  // Editing States
  const [editingHypothesisId, setEditingHypothesisId] = useState<string | null>(null);
  const [editingHypothesisFields, setEditingHypothesisFields] = useState({ statement: "", suggested_validation_method: "" });
  const [editingRecId, setEditingRecId] = useState<number | null>(null);
  const [editingRecFields, setEditingRecFields] = useState({ action: "", rationale: "" });

  // Accordion status for participants in Screen 10
  const [expandedParticipantIds, setExpandedParticipantIds] = useState<Set<string>>(new Set());

  const toggleParticipantExpand = (id: string) => {
    setExpandedParticipantIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // startSynthesis API Integration
  const startSynthesis = async (targetRunId: string) => {
    setView("loading_synthesis");
    setLoadingState("loading");
    setApiError(null);
    setSynthesisStep(1);

    let currentStep = 1;
    const stepInterval = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 4) {
        setSynthesisStep(currentStep);
      }
    }, 2500);

    try {
      const res = await fetch(`${API_URL}/api/run/${targetRunId}/synthesise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: targetRunId,
          transcripts: transcripts.map(t => ({
            ...t,
            _excluded: excludedPersonaIds.has(t.persona_id)
          }))
        })
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail?.message || errData.detail || `Server error: ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setReport(data.report);
      sessionStorage.setItem("researchos_report", JSON.stringify(data.report));
      
      setView("report");
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setLoadingState("error");
      setApiError(err.message || "Failed to synthesise insights. Please try again.");
    }
  };

  // Deletion and editing handlers for Hypotheses
  const handleDeleteHypothesis = async (id: string) => {
    if (!report) return;
    const target = report.hypotheses.find((h: any) => h.id === id);
    if (!target) return;
    setLastDeletedHypothesis(target);
    setReport((prev: any) => ({
      ...prev,
      hypotheses: prev.hypotheses.filter((h: any) => h.id !== id)
    }));
    setShowUndoHypothesis(true);
    setTimeout(() => {
      setShowUndoHypothesis(false);
    }, 5000);

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate4_hypothesis_deleted" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  const handleUndoHypothesisDelete = () => {
    if (!lastDeletedHypothesis || !report) return;
    setReport((prev: any) => ({
      ...prev,
      hypotheses: [...prev.hypotheses, lastDeletedHypothesis].sort((a, b) => a.id.localeCompare(b.id))
    }));
    setLastDeletedHypothesis(null);
    setShowUndoHypothesis(false);
  };

  const handleStartEditHypothesis = (h: any) => {
    setEditingHypothesisId(h.id);
    setEditingHypothesisFields({
      statement: h.statement,
      suggested_validation_method: h.suggested_validation_method
    });
  };

  const handleSaveHypothesisEdit = async (id: string) => {
    setReport((prev: any) => ({
      ...prev,
      hypotheses: prev.hypotheses.map((h: any) =>
        h.id === id
          ? {
              ...h,
              statement: editingHypothesisFields.statement,
              suggested_validation_method: editingHypothesisFields.suggested_validation_method
            }
          : h
      )
    }));
    setEditingHypothesisId(null);

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate4_hypothesis_edited" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  // Deletion, reordering and editing handlers for Recommendations
  const handleDeleteRec = async (rank: number) => {
    if (!report) return;
    const target = report.recommendations.find((r: any) => r.rank === rank);
    if (!target) return;
    setLastDeletedRecommendation(target);
    setReport((prev: any) => {
      const remaining = prev.recommendations.filter((r: any) => r.rank !== rank);
      const reranked = remaining.map((r: any, idx: number) => ({
        ...r,
        rank: idx + 1
      }));
      return {
        ...prev,
        recommendations: reranked
      };
    });
    setShowUndoRecommendation(true);
    setTimeout(() => {
      setShowUndoRecommendation(false);
    }, 5000);

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate4_rec_deleted" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  const handleUndoRecDelete = () => {
    if (!lastDeletedRecommendation || !report) return;
    setReport((prev: any) => {
      const updated = [...prev.recommendations, lastDeletedRecommendation].sort((a, b) => a.rank - b.rank);
      const reranked = updated.map((r: any, idx: number) => ({
        ...r,
        rank: idx + 1
      }));
      return {
        ...prev,
        recommendations: reranked
      };
    });
    setLastDeletedRecommendation(null);
    setShowUndoRecommendation(false);
  };

  const handleMoveRec = async (index: number, direction: "up" | "down") => {
    if (!report) return;
    const list = [...report.recommendations];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Re-assign ranks based on new order
    const updated = list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    setReport((prev: any) => ({
      ...prev,
      recommendations: updated
    }));

    // Track behavior
    await fetch(`${API_URL}/api/run/${runId}/behavior`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "gate4_recs_reordered" })
    }).catch(err => console.error("Behavior tracking failed:", err));
  };

  const handleStartEditRec = (r: any) => {
    setEditingRecId(r.rank);
    setEditingRecFields({
      action: r.action,
      rationale: r.rationale
    });
  };

  const handleSaveRecEdit = async (rank: number) => {
    setReport((prev: any) => ({
      ...prev,
      recommendations: prev.recommendations.map((r: any) =>
        r.rank === rank
          ? {
              ...r,
              action: editingRecFields.action,
              rationale: editingRecFields.rationale
            }
          : r
      )
    }));
    setEditingRecId(null);
  };

  // Compile report helper
  const compileReportToMarkdown = (rep: any, pers: any[], failedP: string[], excludedP: Set<string>, run_Id: string | null) => {
    const activeCount = pers.length - failedP.length - excludedP.size;
    const exclusionsCount = excludedP.size;
    const dateStr = new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' });
    
    let md = `# ResearchOS Report\n\n`;
    md += `**Research Goal:** ${rep.research_goal}\n`;
    md += `**Date:** ${dateStr}\n`;
    md += `**Run ID:** ${run_Id || "N/A"}\n`;
    md += `**Status:** ${activeCount} of ${pers.length} personas interviewed${exclusionsCount > 0 ? ` (${exclusionsCount} excluded from synthesis)` : ""}\n\n`;
    md += `---\n\n`;

    md += `## 01 / PARTICIPANTS\n\n`;
    pers.forEach(p => {
      const isExcluded = excludedP.has(p.id);
      const isFailed = failedP.includes(p.id);
      let status = "Included";
      if (isExcluded) status = "Excluded";
      else if (isFailed) status = "Failed";
      
      md += `- **${p.name}** (${status}) — ${p.role} · ${p.age} yrs · ${p.location}\n`;
      md += `  *Background:* ${p.background}\n`;
      md += `  *Goals:* ${p.goals?.join(", ") || "None"}\n`;
      md += `  *Frustrations:* ${p.frustrations?.join(", ") || "None"}\n\n`;
    });

    md += `## 02 / WHAT WE FOUND (THEMES)\n\n`;
    rep.themes?.forEach((t: any, idx: number) => {
      md += `### Theme ${idx + 1}: ${t.title}\n`;
      md += `*Mentioned by ${t.frequency} of ${rep.persona_count} personas*\n\n`;
      md += `${t.description}\n\n`;
      
      t.evidence_quotes?.forEach((eq: any) => {
        md += `> "${eq.quote}"\n`;
        md += `> — *${eq.persona_name}*\n\n`;
      });
    });

    md += `## 03 / WHAT TO TEST NEXT (HYPOTHESES)\n\n`;
    rep.hypotheses?.forEach((h: any, idx: number) => {
      md += `### H${idx + 1}: ${h.statement}\n`;
      md += `- **Confidence:** ${h.confidence.toUpperCase()}\n`;
      md += `- **Supporting Themes:** ${h.supporting_themes?.join(", ") || "None"}\n`;
      md += `- **How to Validate:** ${h.suggested_validation_method}\n\n`;
    });

    md += `## 04 / WHAT TO DO (RECOMMENDATIONS)\n\n`;
    rep.recommendations?.forEach((r: any) => {
      md += `### ${String(r.rank).padStart(2, "0")} / ${r.action}\n`;
      md += `- **Rationale:** ${r.rationale}\n`;
      md += `- **Priority:** ${r.priority.toUpperCase()} | **Effort:** ${r.effort.toUpperCase()}\n\n`;
    });

    md += `---\n\n`;
    md += `### ABOUT THIS REPORT (CONFIDENCE DISCLAIMER)\n\n`;
    md += `${rep.confidence_disclaimer || "This report was generated using synthetic AI personas — not real users. Use these findings as directional signal to generate and prioritise hypotheses, not as validated conclusions. The output reflects what people might say, not what they would do. Consider validating the top hypothesis with 5 real users before committing to a major product decision."}\n`;

    return md;
  };

  const handleCopyReport = (rep: any) => {
    if (!rep) return;
    const mdContent = compileReportToMarkdown(rep, personas, failedPersonas, excludedPersonaIds, runId);
    if (navigator?.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(mdContent)
        .then(() => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3000);
        })
        .catch(err => {
          console.error("Failed to copy using clipboard API:", err);
          setShowExportModal(true);
        });
    } else {
      setShowExportModal(true);
    }
  };

  const minPersonasMet = personas.length >= 2;
  const maxPersonasReached = personas.length >= 8;

  return (
    <div className="flex-grow flex flex-col relative min-h-screen">
      {/* Atmospheric Grain Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay" 
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>

      {/* Ambient Background */}
      <div className="mesh-bg">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7C5CFC] rounded-full mix-blend-screen smooth-blob opacity-[0.08] animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#FF6B8A] rounded-full mix-blend-screen smooth-blob opacity-[0.05] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-[#C8F135] rounded-full mix-blend-screen smooth-blob opacity-[0.05] animate-blob animation-delay-4000"></div>
      </div>

      {/* RENDER LANDING VIEW */}
      {view === "landing" && (
        <div className="flex flex-col flex-grow">
          {/* TopNavBar */}
          <header className="fixed top-0 w-full z-50 bg-[#13131b]/80 backdrop-blur-xl border-b border-[#2A2A45] shadow-sm">
            <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
              <div className="font-display-xl text-2xl tracking-[-0.02em] text-[#F0EEE8]">
                research<span className="text-[#7C5CFC] font-semibold">os</span>
              </div>
              <button
                className="hidden md:inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#7C5CFC] text-[#F0EEE8] font-label-mono text-sm tracking-wider uppercase hover:bg-[#8A6DFD] hover:shadow-[0_0_15px_rgba(124,92,252,0.4)] transition-all duration-300 cursor-pointer"
                onClick={() => setView("intake")}
              >
                Start Research
              </button>
            </div>
          </header>

          <main className="flex-grow pt-24 pb-16">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center py-10 md:py-14 relative">
              <div className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7C5CFC]/30 bg-[#7C5CFC]/10">
                <span className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-pulse"></span>
                <span className="font-label-mono text-[#7C5CFC] uppercase text-[10px] tracking-widest">v2.0 Engine Live</span>
              </div>
              <h1 className="font-hero-syne text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl tracking-[-0.02em] leading-[1.0] mb-8 w-full text-[#F0EEE8]">
                <span className="block sm:whitespace-nowrap">Research that thinks.</span>
                <span className="liquid-text font-semibold block sm:whitespace-nowrap">Insights that ship.</span>
              </h1>
              <p className="font-body-lg text-[#8B8BA7] max-w-2xl mx-auto mb-12">
                Deploy autonomous AI researchers that execute deep-dives, synthesize data, and output production-ready briefs. Zero scheduling required.
              </p>
              <button
                className="neon-btn inline-flex items-center gap-2 group cursor-pointer"
                onClick={() => setView("intake")}
              >
                Start Research
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-[#2A2A45]/30">
              <div className="text-center mb-16">
                <span className="font-label-mono text-sm text-[#8B8BA7] tracking-widest uppercase mb-2 block">The Pipeline</span>
                <h2 className="font-hero-syne text-4xl md:text-6xl tracking-[-0.02em] mb-4 text-[#F0EEE8]">Four agents. One output. Zero scheduling.</h2>
                <p className="font-body-lg text-[#8B8BA7] max-w-2xl mx-auto">From idea to insights in minutes, not weeks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-blob glass-blob-large p-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#7C5CFC]/20 flex items-center justify-center text-[#7C5CFC] mb-4">
                    <span className="material-symbols-outlined text-2xl">edit_note</span>
                  </div>
                  <h3 className="font-display-xl text-2xl text-[#F0EEE8]">01 / Describe</h3>
                  <p className="text-[#8B8BA7] text-base leading-relaxed">Tell the engine what you want to learn. It builds a custom research plan tailored to your objectives.</p>
                </div>
                <div className="glass-blob glass-blob-large p-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF0080]/20 flex items-center justify-center text-[#FF0080] mb-4">
                    <span className="material-symbols-outlined text-2xl">build</span>
                  </div>
                  <h3 className="font-display-xl text-2xl text-[#F0EEE8]">02 / Build</h3>
                  <p className="text-[#8B8BA7] text-base leading-relaxed">The engine automatically recruits targeted participants and generates dynamic interview scripts.</p>
                </div>
                <div className="glass-blob glass-blob-large p-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ADFF2F]/20 flex items-center justify-center text-[#ADFF2F] mb-4">
                    <span className="material-symbols-outlined text-2xl">play_arrow</span>
                  </div>
                  <h3 className="font-display-xl text-2xl text-[#F0EEE8]">03 / Run</h3>
                  <p className="text-[#8B8BA7] text-base leading-relaxed">Autonomous agents conduct deep-dive interviews and gather rich qualitative data 24/7.</p>
                </div>
                <div className="glass-blob glass-blob-large p-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#7C5CFC]/20 flex items-center justify-center text-[#7C5CFC] mb-4">
                    <span className="material-symbols-outlined text-2xl">lightbulb</span>
                  </div>
                  <h3 className="font-display-xl text-2xl text-[#F0EEE8]">04 / Hypotheses</h3>
                  <p className="text-[#8B8BA7] text-base leading-relaxed">Synthesized findings are delivered as actionable insights and production-ready briefs.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* RENDER INTAKE FORM VIEW */}
      {view === "intake" && (
        <div className="w-full max-w-[720px] mx-auto z-10 py-12 md:py-24 px-6">
          <header className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <button
                className="inline-flex items-center text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors group cursor-pointer bg-transparent border-none p-0"
                onClick={() => setView("landing")}
              >
                <span className="material-symbols-outlined mr-2 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="font-label-mono text-sm tracking-widest uppercase">Back</span>
              </button>
              <div className="font-label-mono text-xs text-[#8B8BA7] tracking-widest uppercase">
                01 / RESEARCH SETUP
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl tracking-[-0.02em] leading-tight text-[#F0EEE8] mb-4 font-hero-syne font-extrabold">
              Set up your <span className="liquid-text">study.</span>
            </h1>
            <p className="font-body-lg text-[#8B8BA7]">
              The more specific you are, the sharper your output.
            </p>
          </header>

          <div className="glass-blob glass-blob-small p-6 md:p-10 relative z-10">
            <form className="space-y-8 relative z-10" onSubmit={handleFormSubmit}>
              <div className="flex flex-col gap-2">
                <label className="font-label-mono text-[11px] text-[#8B8BA7] uppercase tracking-wider" htmlFor="desc">
                  Describe your product and the problem it solves.
                </label>
                <textarea
                  className={`input-base w-full rounded-lg p-4 resize-none ${
                    descTouched && !isDescValid ? "border-[#FF6B8A] focus:border-[#FF6B8A]" : "border-[#7C5CFC]/30"
                  }`}
                  id="desc"
                  placeholder="e.g., We're building a tool that helps solo founders track MRR without a finance background. It connects to Stripe and shows revenue in plain English — no spreadsheets needed."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setDescTouched(true)}
                ></textarea>
                <div className="flex justify-between items-center mt-1">
                  <p className="font-label-sm text-[11px] text-[#8B8BA7]">
                    Minimum 50 characters — this shapes your entire run.
                  </p>
                  <p className={`font-label-mono text-[11px] ${isDescValid ? "text-[#C8F135]" : "text-[#FF6B8A]"}`}>
                    {description.length} chars
                  </p>
                </div>
                {descTouched && !isDescValid && (
                  <p className="text-[#FF6B8A] text-xs font-medium">Add more detail. This is how we build your personas.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-mono text-[11px] text-[#8B8BA7] uppercase tracking-wider" htmlFor="target_user">
                  Who is your target user?
                </label>
                <input
                  className={`input-base w-full rounded-lg px-4 py-3 ${
                    userTouched && !isUserValid ? "border-[#FF6B8A] focus:border-[#FF6B8A]" : "border-[#7C5CFC]/30"
                  }`}
                  id="target_user"
                  placeholder="e.g., Non-technical solo founders running B2B SaaS products under $10K MRR who manage their own finances."
                  type="text"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  onBlur={() => setUserTouched(true)}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="font-label-sm text-[11px] text-[#8B8BA7]">
                    Be specific. "Anyone" produces generic personas. (Min 30 chars)
                  </p>
                  <p className={`font-label-mono text-[11px] ${isUserValid ? "text-[#C8F135]" : "text-[#FF6B8A]"}`}>
                    {targetUser.length} chars
                  </p>
                </div>
                {userTouched && !isUserValid && (
                  <p className="text-[#FF6B8A] text-xs font-medium">Be more specific about who you're designing for (min 30 chars).</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-mono text-[11px] text-[#8B8BA7] uppercase tracking-wider" htmlFor="research_q">
                  What's the one question this research should answer?
                </label>
                <input
                  className={`input-base w-full rounded-lg px-4 py-3 ${
                    goalTouched && !isGoalValid ? "border-[#FF6B8A] focus:border-[#FF6B8A]" : "border-[#7C5CFC]/30"
                  }`}
                  id="research_q"
                  placeholder="e.g., What are the biggest friction points founders face when trying to understand their revenue trends?"
                  type="text"
                  value={researchGoal}
                  onChange={(e) => setResearchGoal(e.target.value)}
                  onBlur={() => setGoalTouched(true)}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="font-label-sm text-[11px] text-[#8B8BA7]">
                    Frame this as a discovery question — "what" or "how" works better than "does this work?". (Min 30 chars)
                  </p>
                  <p className={`font-label-mono text-[11px] ${isGoalValid ? "text-[#C8F135]" : "text-[#FF6B8A]"}`}>
                    {researchGoal.length} chars
                  </p>
                </div>
                {goalTouched && !isGoalValid && (
                  <p className="text-[#FF6B8A] text-xs font-medium">Give us a research question to anchor the study (min 30 chars).</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-mono text-[11px] text-[#8B8BA7] uppercase tracking-wider mb-2">
                  Where is your product right now?
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Just an idea", "Pre-MVP", "Live MVP", "Post-launch"].map((stage) => (
                    <button
                      key={stage}
                      className={`pill-segment rounded-full px-5 py-2.5 font-label-mono text-xs tracking-wider uppercase cursor-pointer ${
                        productStage === stage ? "active" : ""
                      }`}
                      type="button"
                      onClick={() => setProductStage(stage)}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#7C5CFC]/20">
                <div className="flex flex-col gap-2">
                  <label className="font-label-mono text-[11px] text-[#8B8BA7] uppercase tracking-wider" htmlFor="personas_count">
                    User Personas (2-8)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="input-base w-20 rounded-lg px-3 py-2 text-center font-label-mono font-bold"
                      id="personas_count"
                      max={8}
                      min={2}
                      type="number"
                      value={personaCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setPersonaCount(Math.max(2, Math.min(8, val)));
                      }}
                    />
                    <span className="font-label-sm text-[11px] text-[#8B8BA7]">
                      5 is the sweet spot for most studies.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-mono text-[11px] text-[#8B8BA7] uppercase tracking-wider" htmlFor="questions_count">
                    Interview Questions (4-8)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="input-base w-20 rounded-lg px-3 py-2 text-center font-label-mono font-bold"
                      id="questions_count"
                      max={8}
                      min={4}
                      type="number"
                      value={questionCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setQuestionCount(Math.max(4, Math.min(8, val)));
                      }}
                    />
                    <span className="font-label-sm text-[11px] text-[#8B8BA7]">
                      6 questions gives enough depth without fatigue.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#7C5CFC]/20 flex flex-col gap-6">
                <div className="flex justify-center">
                  <div className="bg-[#7C5CFC]/10 border border-[#7C5CFC]/30 rounded-md px-4 py-2 inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#8B8BA7]">schedule</span>
                    <span className="font-label-mono text-xs text-[#8B8BA7]">
                      Estimated run: ~{estimatedMin} min · ~${costUsd.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    className={`neon-btn w-full flex items-center justify-center gap-2 group transition-all duration-300 ${
                      isFormValid ? "cursor-pointer" : "opacity-50 cursor-not-allowed hover:shadow-none hover:scale-100"
                    }`}
                    type="submit"
                    disabled={!isFormValid}
                  >
                    Generate Personas
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                  <div className="text-center">
                    <button
                      className="bg-transparent border-none p-0 inline-flex items-center text-[#8B8BA7] hover:text-[#F0EEE8] font-label-mono text-xs uppercase tracking-widest transition-colors group cursor-pointer"
                      type="button"
                      onClick={() => setView("landing")}
                    >
                      <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER PERSONA GENERATION LOADING VIEW */}
      {view === "loading_personas" && (
        <div className="flex-grow flex items-center justify-center min-h-[80vh] relative">
          {loadingState === "loading" ? (
            <main className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center gap-8">
              {/* Pulsing Iris Glow Ring */}
              <div className="pulse-ring mb-4"></div>

              <div className="flex flex-col gap-2 items-center">
                <span className="font-label-mono text-xs text-[#8B8BA7] uppercase tracking-widest">AGENT 01 / PERSONA GENERATION</span>
                <h1 className="font-headline-lg text-3xl text-[#F0EEE8] font-semibold">Building your personas...</h1>
                <p className="font-body-md text-base text-[#8B8BA7] max-w-[480px]">Mapping your user population and generating distinct archetypes across the behavioral spectrum.</p>
              </div>

              {/* Progress Mini-Map */}
              <div className="flex items-center mt-4 bg-[#0F0F1A] px-5 py-2.5 rounded-full border border-[#2A2A45] shadow-sm">
                <span className="text-[#7C5CFC] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#7C5CFC] text-xs">●</span> Personas
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#8B8BA7]/60 font-label-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#2A2A45] text-xs">○</span> Guide
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#8B8BA7]/60 font-label-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#2A2A45] text-xs">○</span> Interviews
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#8B8BA7]/60 font-label-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#2A2A45] text-xs">○</span> Synthesis
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[#8B8BA7]">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span className="font-body-md text-xs leading-none">Usually under 30 seconds.</span>
              </div>
            </main>
          ) : (
            /* Error State */
            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
              <div className="bg-[#0F0F1A] border border-[#FF6B8A]/30 p-8 rounded-2xl shadow-2xl w-full text-center flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B8A]/10 opacity-30 blur-[40px] mix-blend-screen rounded-full"></div>
                <div className="w-12 h-12 rounded-full bg-[#FF6B8A]/10 text-[#FF6B8A] flex items-center justify-center mx-auto mb-2 border border-[#FF6B8A]/20">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <h2 className="font-headline-sm text-xl text-[#F0EEE8] font-bold">Persona generation failed.</h2>
                <p className="font-body-md text-[#8B8BA7] text-sm leading-relaxed">
                  {apiError || "This sometimes happens with very niche inputs. Try being more specific about your target user."}
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider border border-[#2A2A45] rounded-lg bg-transparent text-[#8B8BA7] hover:text-[#F0EEE8] hover:bg-[#16162A] transition-colors focus:outline-none cursor-pointer"
                    onClick={() => setView("intake")}
                  >
                    Edit setup
                  </button>
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider bg-[#7C5CFC] hover:bg-[#6945ed] text-[#F0EEE8] rounded-lg border-none flex items-center gap-2 focus:outline-none cursor-pointer shadow-lg shadow-[#7C5CFC]/30"
                    onClick={() => runId ? startPersonaGeneration(runId) : setView("intake")}
                  >
                    Retry
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER PERSONA REVIEW GATE VIEW */}
      {view === "personas_review" && (
        <div className="w-full flex-grow flex flex-col">
          {/* Top AppBar */}
          <header className="bg-[#0d0d16] border-b border-[#2A2A45] flex justify-between items-center w-full px-6 h-16 z-50 sticky top-0 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-lg font-bold tracking-tight text-[#7C5CFC] font-display-xl">researchos</span>
            </div>
            <div className="flex-1 max-w-xl mx-auto px-6 hidden md:block">
              <div className="w-full bg-[#16162A] rounded-full h-1.5 border border-[#2A2A45] overflow-hidden">
                <div className="bg-[#7C5CFC] h-full rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#16162A] cursor-pointer"
                onClick={() => {
                  const confirmQuit = window.confirm("Are you sure you want to exit? Your progress in this run will be lost.");
                  if (confirmQuit) setView("landing");
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </header>

          <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8 mb-[100px]">
            {/* Page Header */}
            <div className="mb-8 max-w-3xl">
              <div className="font-label-mono text-xs text-[#8B8BA7] mb-2 uppercase tracking-widest">02 / PERSONA REVIEW</div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-[#F0EEE8] mb-4 font-hero-syne">
                Meet your <span className="liquid-text">research participants.</span>
              </h1>
              <p className="font-body-lg text-[#8B8BA7]">
                These are the people we'll interview. Check they represent the range of users you care about — edit, regenerate, or add anyone missing.
              </p>
            </div>

            {/* Persona Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona) => (
                <div key={persona.id} className="persona-card p-6 flex flex-col h-full glass-blob relative">
                  {regeneratingPersonaId === persona.id ? (
                    /* Pulsing card load state */
                    <div className="flex flex-col items-center justify-center h-full min-h-[350px]">
                      <div className="w-12 h-12 rounded-full bg-[#16162A] border border-[#2A2A45] flex items-center justify-center mb-4">
                        <div className="w-3 h-3 rounded-full bg-[#7C5CFC] pulse-orb"></div>
                      </div>
                      <p className="font-label-mono text-[10px] text-[#8B8BA7] uppercase tracking-wider">Rewriting participant...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-label-mono uppercase tracking-wider font-semibold border ${
                          persona._source === "Edited" 
                            ? "bg-[#C8F135]/10 border-[#C8F135]/30 text-[#C8F135]"
                            : persona._source === "You added"
                              ? "bg-[#FF6B8A]/10 border-[#FF6B8A]/30 text-[#FF6B8A]"
                              : "bg-[#7C5CFC]/10 border-[#7C5CFC]/30 text-[#A78BFA]"
                        }`}>
                          {persona._source || "AI Generated"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-label-mono uppercase px-1.5 py-0.5 rounded border border-[#2A2A45] text-[#8B8BA7] ${
                            persona.tech_savviness === "high" 
                              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" 
                              : persona.tech_savviness === "low" 
                                ? "bg-rose-950/20 text-rose-400 border-rose-900/30" 
                                : "bg-[#16162A]"
                          }`}>
                            {persona.tech_savviness} tech
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 pb-4 border-b border-[#2A2A45]">
                        <h2 className="text-xl font-bold text-[#F0EEE8] leading-tight mb-1">{persona.name}</h2>
                        <p className="font-label-mono text-[10px] text-[#8B8BA7]">
                          {persona.role} · {persona.age} yrs · {persona.location}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col gap-4 text-sm">
                        <div>
                          <h3 className="font-label-mono text-[10px] text-[#8B8BA7] uppercase mb-1">Background</h3>
                          <p className="text-[13px] text-[#CAC4D6] leading-relaxed">{persona.background}</p>
                        </div>
                        
                        {persona.goals && persona.goals.length > 0 && (
                          <div>
                            <h3 className="font-label-mono text-[10px] text-[#8B8BA7] uppercase mb-1">Goals</h3>
                            <ul className="text-[13px] text-[#CAC4D6] leading-relaxed pl-4 list-disc marker:text-[#7C5CFC]">
                              {persona.goals.map((g: string, idx: number) => (
                                <li key={idx}>{g}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {persona.frustrations && persona.frustrations.length > 0 && (
                          <div>
                            <h3 className="font-label-mono text-[10px] text-[#8B8BA7] uppercase mb-1">Frustrations</h3>
                            <ul className="text-[13px] text-[#CAC4D6] leading-relaxed pl-4 list-disc marker:text-[#FF6B8A]">
                              {persona.frustrations.map((f: string, idx: number) => (
                                <li key={idx}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {persona.quote && (
                          <div className="mt-auto pt-4">
                            <div className="bg-[#16162A]/60 p-3 rounded-lg border border-[#2A2A45] relative">
                              <span className="material-symbols-outlined absolute top-1.5 left-2 text-[#7C5CFC] opacity-20 text-[20px]">format_quote</span>
                              <p className="text-[12px] text-[#A78BFA] italic pl-6 leading-relaxed relative z-10">
                                "{persona.quote}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#2A2A45] flex gap-2">
                        <button 
                          className="btn-secondary flex-1 py-1.5 rounded-md font-label-mono text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          onClick={() => handleOpenEdit(persona)}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span> Edit
                        </button>
                        <button 
                          className="btn-secondary flex-1 py-1.5 rounded-md font-label-mono text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          onClick={() => handleRegeneratePersona(persona.id)}
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span> Regen
                        </button>
                        <button 
                          className="btn-ghost px-2.5 py-1.5 rounded-md flex items-center justify-center hover:bg-[#FF6B8A]/10 hover:text-[#FF6B8A] transition-colors border border-transparent hover:border-[#FF6B8A]/30 cursor-pointer"
                          onClick={() => handleDeletePersona(persona.id)}
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add Ghost Card */}
              {!maxPersonasReached && (
                <div 
                  className="persona-card p-6 flex flex-col h-full border-dashed border-[#2A2A45] bg-transparent hover:bg-[rgba(124,92,252,0.02)] justify-center items-center text-center cursor-pointer min-h-[400px] glass-blob"
                  onClick={() => setIsAddPanelOpen(true)}
                >
                  <div className="w-14 h-14 rounded-full bg-[#7C5CFC]/10 flex items-center justify-center mb-4 border border-[#7C5CFC]/20">
                    <span className="material-symbols-outlined text-2xl text-[#A78BFA]">add</span>
                  </div>
                  <h3 className="font-headline-sm text-lg text-[#F0EEE8] mb-1">Missing someone?</h3>
                  <p className="font-body-md text-xs text-[#8B8BA7] max-w-[240px]">Add a custom persona to ensure your research covers all key user segments.</p>
                </div>
              )}
            </div>
          </main>

          {/* Sticky Action Bar */}
          <div className="fixed bottom-0 left-0 w-full bg-[#0b0c22] border-t border-[#2A2A45] px-6 py-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-center md:justify-start">
                <div className={`w-2 h-2 rounded-full ${minPersonasMet ? "bg-[#C8F135] animate-pulse" : "bg-[#FF6B8A]"}`}></div>
                <span className="font-label-mono text-xs text-[#8B8BA7]">
                  {personas.length} {personas.length === 1 ? "persona" : "personas"} selected for study
                  {!minPersonasMet && " · Add at least 2 personas to continue"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button 
                  className={`btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-lg font-body-md text-xs flex items-center justify-center gap-2 transition-all hover:border-[#7C5CFC] cursor-pointer ${
                    maxPersonasReached ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={maxPersonasReached}
                  onClick={() => setIsAddPanelOpen(true)}
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add Participant
                </button>
                <button 
                  className={`neon-btn w-full sm:w-auto px-8 py-2.5 flex items-center justify-center gap-2 group text-xs ${
                    !minPersonasMet ? "opacity-50 cursor-not-allowed hover:shadow-none hover:scale-100 bg-[#2A2A45]" : "cursor-pointer"
                  }`}
                  disabled={!minPersonasMet}
                  onClick={() => {
                    sessionStorage.setItem("researchos_personas", JSON.stringify(personas));
                    if (runId) {
                      startGuideGeneration(runId);
                    }
                  }}
                >
                  Continue to Interview Guide 
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER EDIT PERSONA SLIDE-IN PANEL */}
      {isEditPanelOpen && editingPersona && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0F0F1A] border-l border-[#2A2A45] p-6 overflow-y-auto flex flex-col h-full relative shadow-2xl">
            <button 
              className="absolute top-4 right-4 text-[#8B8BA7] hover:text-[#F0EEE8] p-1.5 hover:bg-[#16162A] rounded-full cursor-pointer transition-colors"
              onClick={() => {
                setIsEditPanelOpen(false);
                setEditingPersona(null);
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-display-xl text-xl text-[#F0EEE8] font-bold mb-6">Edit Participant</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-5 flex-1 flex flex-col">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Name</label>
                <input 
                  type="text" 
                  required
                  className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                  value={editingPersona.name}
                  onChange={e => setEditingPersona({...editingPersona, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Age</label>
                  <input 
                    type="number" 
                    required
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm text-center"
                    value={editingPersona.age}
                    onChange={e => setEditingPersona({...editingPersona, age: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Location</label>
                  <input 
                    type="text" 
                    required
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                    value={editingPersona.location}
                    onChange={e => setEditingPersona({...editingPersona, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Role</label>
                  <input 
                    type="text" 
                    required
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                    value={editingPersona.role}
                    onChange={e => setEditingPersona({...editingPersona, role: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Tech Savviness</label>
                  <select 
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm appearance-none bg-[#0F0F1A]"
                    value={editingPersona.tech_savviness}
                    onChange={e => setEditingPersona({...editingPersona, tech_savviness: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Background</label>
                <textarea 
                  required
                  rows={3}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={editingPersona.background}
                  onChange={e => setEditingPersona({...editingPersona, background: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Goals (One per line)</label>
                <textarea 
                  required
                  rows={3}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={editingPersona.goals}
                  onChange={e => setEditingPersona({...editingPersona, goals: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Frustrations (One per line)</label>
                <textarea 
                  required
                  rows={3}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={editingPersona.frustrations}
                  onChange={e => setEditingPersona({...editingPersona, frustrations: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Relationship to Problem</label>
                <input 
                  type="text" 
                  required
                  className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                  value={editingPersona.relationship_to_problem || ""}
                  onChange={e => setEditingPersona({...editingPersona, relationship_to_problem: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Their Quote / Take</label>
                <textarea 
                  required
                  rows={2}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={editingPersona.quote}
                  onChange={e => setEditingPersona({...editingPersona, quote: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  className="btn-secondary flex-1 py-2.5 rounded-lg font-label-mono text-xs uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setIsEditPanelOpen(false);
                    setEditingPersona(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="neon-btn flex-1 py-2.5 rounded-lg font-label-mono text-xs uppercase tracking-wider cursor-pointer shadow-md bg-[#7C5CFC]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER ADD PERSONA SLIDE-IN PANEL */}
      {isAddPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0F0F1A] border-l border-[#2A2A45] p-6 overflow-y-auto flex flex-col h-full relative shadow-2xl">
            <button 
              className="absolute top-4 right-4 text-[#8B8BA7] hover:text-[#F0EEE8] p-1.5 hover:bg-[#16162A] rounded-full cursor-pointer transition-colors"
              onClick={() => setIsAddPanelOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-display-xl text-xl text-[#F0EEE8] font-bold mb-6">Add Participant</h2>
            
            <form onSubmit={handleSaveAdd} className="space-y-5 flex-1 flex flex-col">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Sarah Jenkins"
                  className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                  value={newPersona.name}
                  onChange={e => setNewPersona({...newPersona, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Age</label>
                  <input 
                    type="number" 
                    required
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm text-center"
                    value={newPersona.age}
                    onChange={e => setNewPersona({...newPersona, age: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., New York, US"
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                    value={newPersona.location}
                    onChange={e => setNewPersona({...newPersona, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Role</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Tech Consultant"
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                    value={newPersona.role}
                    onChange={e => setNewPersona({...newPersona, role: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Tech Savviness</label>
                  <select 
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm appearance-none bg-[#0F0F1A]"
                    value={newPersona.tech_savviness}
                    onChange={e => setNewPersona({...newPersona, tech_savviness: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Background</label>
                <textarea 
                  required
                  placeholder="Tell us about their lifestyle and professional background..."
                  rows={3}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={newPersona.background}
                  onChange={e => setNewPersona({...newPersona, background: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Goals (One per line)</label>
                <textarea 
                  required
                  placeholder="Goal 1&#10;Goal 2..."
                  rows={3}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={newPersona.goals}
                  onChange={e => setNewPersona({...newPersona, goals: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Frustrations (One per line)</label>
                <textarea 
                  required
                  placeholder="Frustration 1&#10;Frustration 2..."
                  rows={3}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={newPersona.frustrations}
                  onChange={e => setNewPersona({...newPersona, frustrations: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Relationship to Problem</label>
                <input 
                  type="text" 
                  required
                  placeholder="How does this problem affect them directy?"
                  className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                  value={newPersona.relationship_to_problem}
                  onChange={e => setNewPersona({...newPersona, relationship_to_problem: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Their Quote / Take</label>
                <textarea 
                  required
                  placeholder="e.g., 'If it takes me more than 5 minutes to set up, I will just give up.'"
                  rows={2}
                  className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                  value={newPersona.quote}
                  onChange={e => setNewPersona({...newPersona, quote: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  className="btn-secondary flex-1 py-2.5 rounded-lg font-label-mono text-xs uppercase tracking-wider cursor-pointer"
                  onClick={() => setIsAddPanelOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="neon-btn flex-1 py-2.5 rounded-lg font-label-mono text-xs uppercase tracking-wider cursor-pointer shadow-md bg-[#7C5CFC]"
                >
                  Add to Study
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER INTERVIEW GUIDE LOADING VIEW */}
      {view === "loading_guide" && (
        <div className="flex-grow flex items-center justify-center min-h-[80vh] relative w-full">
          {loadingState === "loading" ? (
            <main className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center gap-8">
              {/* Pulsing Iris Glow Ring */}
              <div className="pulse-ring mb-4"></div>

              <div className="flex flex-col gap-2 items-center">
                <span className="font-label-mono text-xs text-[#8B8BA7] uppercase tracking-widest">AGENT 02 / INTERVIEW GUIDE</span>
                <h1 className="font-headline-lg text-3xl text-[#F0EEE8] font-semibold">Writing your questions...</h1>
                <p className="font-body-md text-base text-[#8B8BA7] max-w-[480px]">
                  Designing questions that work for every persona and stay grounded in your research goal.
                </p>
              </div>

              {/* Progress Mini-Map */}
              <div className="flex items-center mt-4 bg-[#0F0F1A] px-5 py-2.5 rounded-full border border-[#2A2A45] shadow-sm">
                <span className="text-[#C8F135] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#C8F135] text-xs">✓</span> Personas
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#7C5CFC] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#7C5CFC] text-xs">●</span> Guide
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#8B8BA7]/60 font-label-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#2A2A45] text-xs">○</span> Interviews
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#8B8BA7]/60 font-label-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#2A2A45] text-xs">○</span> Synthesis
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[#8B8BA7]">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span className="font-body-md text-xs leading-none">Usually under 20 seconds.</span>
              </div>
            </main>
          ) : (
            /* Error State */
            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
              <div className="bg-[#0F0F1A] border border-[#FF6B8A]/30 p-8 rounded-2xl shadow-2xl w-full text-center flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B8A]/10 opacity-30 blur-[40px] mix-blend-screen rounded-full"></div>
                <div className="w-12 h-12 rounded-full bg-[#FF6B8A]/10 text-[#FF6B8A] flex items-center justify-center mx-auto mb-2 border border-[#FF6B8A]/20">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <h2 className="font-headline-sm text-xl text-[#F0EEE8] font-bold">Question generation failed.</h2>
                <p className="font-body-md text-[#8B8BA7] text-sm leading-relaxed">
                  {apiError || "We had trouble writing questions for your target audience. Try again."}
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider border border-[#2A2A45] rounded-lg bg-transparent text-[#8B8BA7] hover:text-[#F0EEE8] hover:bg-[#16162A] transition-colors focus:outline-none cursor-pointer"
                    onClick={() => setView("personas_review")}
                  >
                    Back to personas
                  </button>
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider bg-[#7C5CFC] hover:bg-[#6945ed] text-[#F0EEE8] rounded-lg border-none flex items-center gap-2 focus:outline-none cursor-pointer shadow-lg shadow-[#7C5CFC]/30"
                    onClick={() => runId && startGuideGeneration(runId)}
                  >
                    Retry
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER INTERVIEW GUIDE REVIEW VIEW */}
      {view === "guide_review" && guide && (
        <div className="w-full flex-grow flex flex-col">
          {/* Top AppBar */}
          <header className="bg-[#0d0d16] border-b border-[#2A2A45] flex justify-between items-center w-full px-6 h-16 z-50 sticky top-0 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-lg font-bold tracking-tight text-[#7C5CFC] font-display-xl">researchos</span>
            </div>
            <div className="flex-1 max-w-xl mx-auto px-6 hidden md:block">
              <div className="w-full bg-[#16162A] rounded-full h-1.5 border border-[#2A2A45] overflow-hidden">
                <div className="bg-[#7C5CFC] h-full rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#16162A] cursor-pointer"
                onClick={() => {
                  const confirmQuit = window.confirm("Are you sure you want to exit? Your progress in this run will be lost.");
                  if (confirmQuit) setView("landing");
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </header>

          <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8 mb-[100px] flex flex-col gap-8">
            {/* Page Header */}
            <div>
              <div className="font-label-mono text-xs text-[#8B8BA7] mb-2 uppercase tracking-widest">03 / GUIDE REVIEW</div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-[#F0EEE8] mb-4 font-hero-syne">
                Your interview <span className="liquid-text">questions.</span>
              </h1>
              <p className="font-body-lg text-[#8B8BA7]">
                These go to every persona. Make sure they probe what you actually need to learn.
              </p>
            </div>

            {/* Research Goal Callout */}
            <div className="bg-[#0F0F1A] border border-[#7C5CFC]/30 rounded-xl p-5 flex flex-col gap-2 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFC]/5 opacity-20 blur-[40px] rounded-full"></div>
              <span className="font-label-mono text-[10px] text-[#A78BFA] tracking-wider uppercase font-semibold">RESEARCH GOAL</span>
              <p className="font-body-md text-[#F0EEE8] leading-relaxed">
                {researchGoal}
              </p>
            </div>

            {/* Questions Container */}
            <div className="flex flex-col gap-6">
              {/* 1. Warm up Question */}
              <div className="bg-[#0F0F1A] border border-[#2A2A45] rounded-xl p-6 relative">
                {editingQuestionId === "warmup" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Warmup Question</label>
                      <input
                        type="text"
                        className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                        value={editingQuestionFields.question}
                        onChange={e => setEditingQuestionFields({ ...editingQuestionFields, question: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="px-4 py-1.5 rounded-lg border border-[#2A2A45] bg-transparent text-xs font-label-mono uppercase tracking-wider text-[#8B8BA7] hover:text-[#F0EEE8] cursor-pointer"
                        onClick={() => setEditingQuestionId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-1.5 rounded-lg bg-[#7C5CFC] text-xs font-label-mono uppercase tracking-wider text-[#F0EEE8] cursor-pointer"
                        onClick={() => handleSaveQuestionEdit("warmup", { question: editingQuestionFields.question })}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-label-mono uppercase tracking-wider font-semibold border bg-[#7C5CFC]/10 border-[#7C5CFC]/30 text-[#A78BFA]">
                        WARM UP
                      </span>
                      <button
                        className="text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors p-1 hover:bg-[#16162A] rounded cursor-pointer"
                        onClick={() => {
                          setEditingQuestionId("warmup");
                          setEditingQuestionFields({ question: guide.warmup_question, intent: "", follow_up_probes: "" });
                        }}
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-[#F0EEE8] leading-snug">
                      {guide.warmup_question}
                    </h3>
                  </>
                )}
              </div>

              {/* 2. Core Questions */}
              {guide.questions.map((q: any, index: number) => {
                const isEditing = editingQuestionId === q.id;
                const isIntentExpanded = expandedIntentIds.has(q.id);
                const isProbesExpanded = expandedProbesIds.has(q.id);

                return (
                  <div key={q.id} className="bg-[#0F0F1A] border border-[#2A2A45] rounded-xl p-6 flex flex-col gap-4 relative">
                    {isEditing ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Question {index + 1}</label>
                          <input
                            type="text"
                            className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                            value={editingQuestionFields.question}
                            onChange={e => setEditingQuestionFields({ ...editingQuestionFields, question: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Why this question (Intent)</label>
                          <input
                            type="text"
                            className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                            value={editingQuestionFields.intent}
                            onChange={e => setEditingQuestionFields({ ...editingQuestionFields, intent: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Follow-up Probes (One per line)</label>
                          <textarea
                            rows={3}
                            className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                            value={editingQuestionFields.follow_up_probes}
                            onChange={e => setEditingQuestionFields({ ...editingQuestionFields, follow_up_probes: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            className="px-4 py-1.5 rounded-lg border border-[#2A2A45] bg-transparent text-xs font-label-mono uppercase tracking-wider text-[#8B8BA7] hover:text-[#F0EEE8] cursor-pointer"
                            onClick={() => setEditingQuestionId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-1.5 rounded-lg bg-[#7C5CFC] text-xs font-label-mono uppercase tracking-wider text-[#F0EEE8] cursor-pointer"
                            onClick={() => handleSaveQuestionEdit(q.id, {
                              question: editingQuestionFields.question,
                              intent: editingQuestionFields.intent,
                              follow_up_probes: editingQuestionFields.follow_up_probes.split("\n").map(p => p.trim()).filter(Boolean)
                            })}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 rounded text-[9px] font-label-mono uppercase tracking-wider font-semibold border bg-[#7C5CFC]/10 border-[#7C5CFC]/30 text-[#A78BFA]">
                            Q{index + 1}
                          </span>
                          <button
                            className="text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors p-1 hover:bg-[#16162A] rounded cursor-pointer"
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setEditingQuestionFields({
                                question: q.question,
                                intent: q.intent,
                                follow_up_probes: Array.isArray(q.follow_up_probes) ? q.follow_up_probes.join("\n") : ""
                              });
                            }}
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-[#F0EEE8] leading-snug">
                            {q.question}
                          </h3>
                        </div>

                        {/* Collapsible Intent */}
                        <div className="border-t border-[#2A2A45]/30 pt-3">
                          <button
                            className="flex items-center gap-1.5 font-label-mono text-[10px] text-[#8B8BA7] hover:text-[#F0EEE8] uppercase bg-transparent border-none p-0 cursor-pointer"
                            onClick={() => toggleIntent(q.id)}
                          >
                            <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: isIntentExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                              chevron_right
                            </span>
                            Why this question
                          </button>
                          {isIntentExpanded && (
                            <p className="mt-2 text-xs text-[#CAC4D6] leading-relaxed pl-5">
                              {q.intent}
                            </p>
                          )}
                        </div>

                        {/* Collapsible Probes */}
                        <div className="border-t border-[#2A2A45]/30 pt-3">
                          <button
                            className="flex items-center gap-1.5 font-label-mono text-[10px] text-[#8B8BA7] hover:text-[#F0EEE8] uppercase bg-transparent border-none p-0 cursor-pointer"
                            onClick={() => toggleProbes(q.id)}
                          >
                            <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: isProbesExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                              chevron_right
                            </span>
                            Probes
                          </button>
                          {isProbesExpanded && (
                            <ul className="mt-2 text-xs text-[#CAC4D6] leading-relaxed pl-9 list-disc marker:text-[#7C5CFC] flex flex-col gap-1">
                              {q.follow_up_probes.map((probe: string, pIdx: number) => (
                                <li key={pIdx}>{probe}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* 3. Closing Question */}
              <div className="bg-[#0F0F1A] border border-[#2A2A45] rounded-xl p-6 relative">
                {editingQuestionId === "closing" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Closing Question</label>
                      <input
                        type="text"
                        className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                        value={editingQuestionFields.question}
                        onChange={e => setEditingQuestionFields({ ...editingQuestionFields, question: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        className="px-4 py-1.5 rounded-lg border border-[#2A2A45] bg-transparent text-xs font-label-mono uppercase tracking-wider text-[#8B8BA7] hover:text-[#F0EEE8] cursor-pointer"
                        onClick={() => setEditingQuestionId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-1.5 rounded-lg bg-[#7C5CFC] text-xs font-label-mono uppercase tracking-wider text-[#F0EEE8] cursor-pointer"
                        onClick={() => handleSaveQuestionEdit("closing", { question: editingQuestionFields.question })}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-label-mono uppercase tracking-wider font-semibold border bg-[#7C5CFC]/10 border-[#7C5CFC]/30 text-[#A78BFA]">
                        CLOSING
                      </span>
                      <button
                        className="text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors p-1 hover:bg-[#16162A] rounded cursor-pointer"
                        onClick={() => {
                          setEditingQuestionId("closing");
                          setEditingQuestionFields({ question: guide.closing_question, intent: "", follow_up_probes: "" });
                        }}
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-[#F0EEE8] leading-snug">
                      {guide.closing_question}
                    </h3>
                  </>
                )}
              </div>
            </div>

            {/* Add Question Inline Form */}
            {isAddingQuestion ? (
              <form onSubmit={handleSaveAddQuestion} className="bg-[#0F0F1A] border-dashed border-[#7C5CFC]/40 border rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-display-xl text-[#F0EEE8] font-bold text-base">Add custom question</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Question</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., What other tools did you try before finding spreadsheets?"
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                    value={newQuestionFields.question}
                    onChange={e => setNewQuestionFields({ ...newQuestionFields, question: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Why this question (Intent)</label>
                  <input
                    type="text"
                    placeholder="e.g., Understand alternatives and comparison benchmarks."
                    className="input-base w-full rounded-md px-3.5 py-2 text-sm"
                    value={newQuestionFields.intent}
                    onChange={e => setNewQuestionFields({ ...newQuestionFields, intent: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Follow-up Probes (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Probe 1&#10;Probe 2..."
                    className="input-base w-full rounded-md p-3.5 text-sm resize-none"
                    value={newQuestionFields.follow_up_probes}
                    onChange={e => setNewQuestionFields({ ...newQuestionFields, follow_up_probes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="btn-secondary px-5 py-2 rounded-lg font-label-mono text-xs uppercase tracking-wider cursor-pointer"
                    onClick={() => setIsAddingQuestion(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="neon-btn px-5 py-2 rounded-lg font-label-mono text-xs uppercase tracking-wider cursor-pointer shadow-md bg-[#7C5CFC]"
                  >
                    Save question
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="btn-secondary w-full py-4 border-dashed border-[#2A2A45] hover:border-[#7C5CFC]/50 text-center font-label-mono text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors bg-transparent flex items-center justify-center gap-2"
                onClick={() => setIsAddingQuestion(true)}
              >
                <span className="material-symbols-outlined text-sm">add</span> Add a question
              </button>
            )}
          </main>

          {/* Sticky Action Bar */}
          <div className="fixed bottom-0 left-0 w-full bg-[#0b0c22] border-t border-[#2A2A45] px-6 py-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                className="bg-transparent border-none p-0 inline-flex items-center text-[#8B8BA7] hover:text-[#F0EEE8] font-label-mono text-xs uppercase tracking-widest transition-colors group cursor-pointer"
                onClick={() => {
                  const confirmBack = window.confirm("Going back will discard the generated interview guide. Are you sure you want to go back?");
                  if (confirmBack) {
                    setGuide(null);
                    setView("personas_review");
                  }
                }}
              >
                <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to personas
              </button>

              <button
                className={`neon-btn px-8 py-2.5 flex items-center justify-center gap-2 group text-xs ${
                  guide.questions.length < 4 ? "opacity-50 cursor-not-allowed hover:shadow-none hover:scale-100 bg-[#2A2A45]" : "cursor-pointer"
                }`}
                disabled={guide.questions.length < 4}
                onClick={() => runId && startSimulation(runId)}
              >
                Confirm & Run Interviews
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER INTERVIEW SIMULATION LOADING VIEW */}
      {view === "loading_simulation" && (
        <div className="flex-grow flex items-center justify-center min-h-[85vh] relative w-full">
          {loadingState === "loading" ? (
            <main className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center gap-8 py-10">
              {/* Pulsing Iris Glow Ring */}
              <div className="pulse-ring mb-2"></div>

              <div className="flex flex-col gap-2 items-center">
                <span className="font-label-mono text-xs text-[#8B8BA7] uppercase tracking-widest">AGENT 03 / INTERVIEW SIMULATION</span>
                <h1 className="font-headline-lg text-3xl text-[#F0EEE8] font-semibold">Running {personas.length} interviews in parallel...</h1>
                <p className="font-body-md text-base text-[#8B8BA7] max-w-[480px]">
                  Each persona is answering your questions in character. This is the longest step — sit tight.
                </p>
              </div>

              {/* Per-Persona Status Rows */}
              <div className="w-full max-w-md bg-[#0F0F1A] border border-[#2A2A45] rounded-xl p-5 flex flex-col gap-3.5 text-left shadow-lg">
                {personas.map(p => {
                  const state = simulationProgress[p.id] || { status: "waiting", progressText: "Waiting..." };
                  return (
                    <div key={p.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        {state.status === "waiting" && (
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#2A2A45] bg-transparent"></div>
                        )}
                        {state.status === "responding" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7C5CFC] iris-pulse shadow-[0_0_8px_rgba(124,92,252,0.6)]"></div>
                        )}
                        {state.status === "complete" && (
                          <span className="material-symbols-outlined text-[#C8F135] font-bold text-sm leading-none">done</span>
                        )}
                        {state.status === "failed" && (
                          <span className="material-symbols-outlined text-[#FF6B8A] font-bold text-sm leading-none">close</span>
                        )}
                        <span className={`font-semibold ${state.status === "failed" ? "text-[#FF6B8A]/80 line-through" : "text-[#F0EEE8]"}`}>
                          {p.name}
                        </span>
                        <span className="text-[#8B8BA7] hidden sm:inline">· {p.role}</span>
                      </div>
                      <span className={`font-label-mono text-[10px] uppercase tracking-wider ${
                        state.status === "complete" 
                          ? "text-[#C8F135]" 
                          : state.status === "failed" 
                            ? "text-[#FF6B8A]" 
                            : state.status === "responding"
                              ? "text-[#A78BFA]"
                              : "text-[#8B8BA7]/60"
                      }`}>
                        {state.progressText}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="font-body-md text-xs text-[#8B8BA7]/70 leading-normal max-w-[480px]">
                Responses reflect each persona's individual background — not a script. Each answer is generated independently.
              </p>

              {/* Progress Mini-Map */}
              <div className="flex items-center mt-2 bg-[#0F0F1A] px-5 py-2.5 rounded-full border border-[#2A2A45] shadow-sm">
                <span className="text-[#C8F135] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#C8F135] text-xs">✓</span> Personas
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#C8F135] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#C8F135] text-xs">✓</span> Guide
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#7C5CFC] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#7C5CFC] text-xs">●</span> Interviews
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#8B8BA7]/60 font-label-mono text-xs flex items-center gap-1.5">
                  <span className="text-[#2A2A45] text-xs">○</span> Synthesis
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#8B8BA7]">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span className="font-body-md text-xs leading-none">This step takes 1-3 minutes.</span>
              </div>
            </main>
          ) : (
            /* Error State */
            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
              <div className="bg-[#0F0F1A] border border-[#FF6B8A]/30 p-8 rounded-2xl shadow-2xl w-full text-center flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B8A]/10 opacity-30 blur-[40px] mix-blend-screen rounded-full"></div>
                <div className="w-12 h-12 rounded-full bg-[#FF6B8A]/10 text-[#FF6B8A] flex items-center justify-center mx-auto mb-2 border border-[#FF6B8A]/20">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <h2 className="font-headline-sm text-xl text-[#F0EEE8] font-bold">Interview simulation failed.</h2>
                <p className="font-body-md text-[#8B8BA7] text-sm leading-relaxed">
                  {apiError || "We had an issue simulating the interviews. Please try again."}
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider border border-[#2A2A45] rounded-lg bg-transparent text-[#8B8BA7] hover:text-[#F0EEE8] hover:bg-[#16162A] transition-colors focus:outline-none cursor-pointer"
                    onClick={() => setView("guide_review")}
                  >
                    Back to questions
                  </button>
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider bg-[#7C5CFC] hover:bg-[#6945ed] text-[#F0EEE8] rounded-lg border-none flex items-center gap-2 focus:outline-none cursor-pointer shadow-lg shadow-[#7C5CFC]/30"
                    onClick={() => runId && startSimulation(runId)}
                  >
                    Retry
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER TRANSCRIPT REVIEW VIEW */}
      {view === "transcript_review" && (
        <div className="w-full flex-grow flex flex-col h-screen overflow-hidden">
          {/* Top AppBar */}
          <header className="bg-[#0d0d16] border-b border-[#2A2A45] flex justify-between items-center w-full px-6 h-16 z-50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-lg font-bold tracking-tight text-[#7C5CFC] font-display-xl">researchos</span>
            </div>
            <div className="flex-1 max-w-xl mx-auto px-6 hidden md:block">
              <div className="w-full bg-[#16162A] rounded-full h-1.5 border border-[#2A2A45] overflow-hidden">
                <div className="bg-[#7C5CFC] h-full rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="text-[#8B8BA7] hover:text-[#F0EEE8] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#16162A] cursor-pointer"
                onClick={() => {
                  const confirmQuit = window.confirm("Are you sure you want to exit? Your progress in this run will be lost.");
                  if (confirmQuit) setView("landing");
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </header>

          {/* Header Info */}
          <div className="bg-[#0b0c22] border-b border-[#2A2A45]/50 px-6 py-5 shrink-0">
            <div className="max-w-[1440px] mx-auto">
              <div className="font-label-mono text-xs text-[#8B8BA7] mb-1.5 uppercase tracking-widest">04 / TRANSCRIPT REVIEW</div>
              <h1 className="text-2xl font-bold text-[#F0EEE8] font-hero-syne leading-tight">
                Read the interviews.
              </h1>
              <p className="text-xs text-[#8B8BA7] mt-1">
                Check the depth before we synthesise. Regenerate thin responses or exclude a persona — no direct editing.
              </p>
            </div>
          </div>

          {/* Split Panel */}
          <div className="flex-grow flex overflow-hidden w-full max-w-[1440px] mx-auto min-h-0">
            {/* Left Sidebar */}
            <aside className="w-80 border-r border-[#2A2A45]/50 flex flex-col bg-[#07070F] overflow-y-auto shrink-0">
              <div className="p-4 border-b border-[#2A2A45]/30">
                <span className="font-label-mono text-[10px] text-[#8B8BA7] uppercase tracking-wider font-semibold">PARTICIPANTS</span>
              </div>
              <div className="flex flex-col divide-y divide-[#2A2A45]/20">
                {personas.map(p => {
                  const isSelected = selectedPersonaId === p.id;
                  const isFailed = failedPersonas.includes(p.id);
                  const isExcluded = excludedPersonaIds.has(p.id);
                  
                  const transcript = transcripts.find(t => t.persona_id === p.id);
                  const hasThin = transcript?.responses?.some((r: any) => r.quality_flag === "thin");

                  let statusText = "Complete";
                  let statusColor = "text-[#C8F135] bg-[#C8F135]/10 border-[#C8F135]/20";

                  if (isExcluded) {
                    statusText = "Excluded";
                    statusColor = "text-[#8B8BA7] bg-[#16162A] border-[#2A2A45]";
                  } else if (isFailed) {
                    statusText = "Failed";
                    statusColor = "text-[#FF6B8A] bg-[#FF6B8A]/10 border-[#FF6B8A]/20";
                  } else if (hasThin) {
                    statusText = "Thin responses";
                    statusColor = "text-[#ffb86a] bg-[#ffb86a]/10 border-[#ffb86a]/20";
                  }

                  return (
                    <button
                      key={p.id}
                      className={`w-full text-left p-4 transition-all hover:bg-[#16162A]/40 flex flex-col gap-1.5 border-l-2 cursor-pointer ${
                        isSelected 
                          ? "bg-[#16162A] border-l-[#7C5CFC] text-[#F0EEE8]" 
                          : "border-l-transparent text-[#8B8BA7]"
                      }`}
                      onClick={() => setSelectedPersonaId(p.id)}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-semibold text-sm leading-tight text-[#F0EEE8]">
                          {p.name}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-label-mono uppercase tracking-wider border ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>
                      <span className="text-xs text-[#8B8BA7] truncate max-w-full">
                        {p.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Panel */}
            <main className="flex-1 flex flex-col bg-[#0F0F1A]/30 overflow-y-auto p-8 relative">
              {(() => {
                const currentPersona = personas.find(p => p.id === selectedPersonaId);
                const currentTranscript = transcripts.find(t => t.persona_id === selectedPersonaId);
                const isFailed = currentPersona ? failedPersonas.includes(currentPersona.id) : false;
                const isExcluded = currentPersona ? excludedPersonaIds.has(currentPersona.id) : false;
                const isRegenerating = currentPersona ? regeneratingTranscriptPersonaId === currentPersona.id : false;

                if (!currentPersona) {
                  return (
                    <div className="flex-grow flex items-center justify-center text-[#8B8BA7] text-sm font-label-mono">
                      Select a participant to view transcript
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col flex-grow max-w-4xl mx-auto w-full pb-[100px]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2A2A45] pb-6 mb-6 gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#F0EEE8]">{currentPersona.name}</h2>
                        <p className="font-label-mono text-xs text-[#8B8BA7] mt-1">
                          {currentPersona.role} · {currentPersona.age} yrs · {currentPersona.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Exclude Toggle */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-label-mono text-[#8B8BA7] uppercase tracking-wider">
                            Exclude from synthesis
                          </span>
                          <div 
                            className={`toggle-switch ${isExcluded ? "active" : ""}`}
                            onClick={() => handleToggleExcludePersona(currentPersona.id)}
                          />
                        </div>
                        {/* Regenerate Button */}
                        <button
                          className="btn-secondary px-4 py-2 rounded-lg font-label-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isRegenerating}
                          onClick={() => handleRegenerateTranscript(currentPersona.id)}
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          {isRegenerating ? "Regenerating..." : "Regenerate Interview"}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    {isRegenerating ? (
                      <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
                        <div className="pulse-ring mb-4"></div>
                        <p className="font-label-mono text-xs text-[#8B8BA7] uppercase tracking-widest">
                          Rerunning {currentPersona.name}'s interview...
                        </p>
                      </div>
                    ) : isFailed ? (
                      <div className="bg-[#FF6B8A]/10 border border-[#FF6B8A]/30 p-8 rounded-xl text-center flex flex-col items-center gap-4 relative overflow-hidden my-10">
                        <span className="material-symbols-outlined text-[#FF6B8A] text-4xl">warning</span>
                        <h3 className="text-lg font-bold text-[#F0EEE8]">Interview Failed</h3>
                        <p className="text-sm text-[#8B8BA7] max-w-md">
                          We had a technical issue simulating the interview for {currentPersona.name}. You can try regenerating it below.
                        </p>
                        <button
                          className="neon-btn px-6 py-2 bg-[#FF6B8A] hover:bg-[#ff5276] text-xs font-label-mono uppercase tracking-wider text-[#F0EEE8] cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,107,138,0.4)]"
                          onClick={() => handleRegenerateTranscript(currentPersona.id)}
                        >
                          <span className="material-symbols-outlined text-xs">refresh</span>
                          Regenerate Interview
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-8">
                        <div className="font-label-mono text-xs text-[#8B8BA7] tracking-wider uppercase border-b border-[#2A2A45]/30 pb-2">
                          INTERVIEW TRANSCRIPT
                        </div>
                        {currentTranscript?.responses?.map((r: any, rIdx: number) => {
                          const isWarmup = r.question_id === "warmup";
                          const isClosing = r.question_id === "closing";
                          const label = isWarmup ? "WARM UP" : isClosing ? "CLOSING" : `Q${rIdx}`;

                          let toneColor = "text-slate-400 bg-slate-950/20 border-slate-900/30";
                          if (r.tone === "positive") toneColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                          else if (r.tone === "negative") toneColor = "text-[#FF6B8A] bg-[#FF6B8A]/10 border-[#FF6B8A]/20";
                          else if (r.tone === "mixed") toneColor = "text-purple-400 bg-purple-950/20 border-purple-900/30";

                          return (
                            <div key={r.question_id} className="flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-[#2A2A45]/20 pb-1.5">
                                <span className="font-label-mono text-[10px] text-[#8B8BA7]/60 tracking-wider">
                                  {label}
                                </span>
                                <div className="flex gap-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-label-mono uppercase tracking-wider border ${toneColor}`}>
                                    {r.tone}
                                  </span>
                                  {r.quality_flag === "thin" && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-label-mono uppercase tracking-wider border border-[#ffb86a]/30 text-[#ffb86a] bg-[#ffb86a]/5 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px] font-bold">warning</span>
                                      Thin response
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <h4 className="text-sm font-bold text-[#F0EEE8] leading-snug">
                                {r.question}
                              </h4>
                              <p className="text-sm text-[#CAC4D6] leading-relaxed whitespace-pre-line bg-[#0F0F1A]/50 border border-[#2A2A45]/40 p-4 rounded-lg">
                                {r.response}
                              </p>
                              {r.quality_flag === "thin" && (
                                <p className="text-[11px] text-[#ffb86a] leading-tight italic pl-1">
                                  This response is under 100 words. You can regenerate the interview for more depth.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </main>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="bg-[#0b0c22] border-t border-[#2A2A45] px-6 py-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0 w-full">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                className="bg-transparent border-none p-0 inline-flex items-center text-[#8B8BA7] hover:text-[#F0EEE8] font-label-mono text-xs uppercase tracking-widest transition-colors group cursor-pointer"
                onClick={() => {
                  setView("guide_review");
                }}
              >
                <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back to questions
              </button>

              {(() => {
                const activeCount = transcripts.filter(
                  t => !failedPersonas.includes(t.persona_id) && !excludedPersonaIds.has(t.persona_id)
                ).length;
                const minSynthesisMet = activeCount >= 2;

                return (
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <span className="font-label-mono text-xs text-[#8B8BA7] text-center sm:text-right">
                      {activeCount} active interviews selected
                      {!minSynthesisMet && " · Select at least 2 to synthesise"}
                    </span>
                    <button
                      className={`neon-btn px-8 py-2.5 flex items-center justify-center gap-2 group text-xs ${
                        !minSynthesisMet ? "opacity-50 cursor-not-allowed hover:shadow-none hover:scale-100 bg-[#2A2A45]" : "cursor-pointer"
                      }`}
                      disabled={!minSynthesisMet}
                      onClick={() => runId && startSynthesis(runId)}
                    >
                      Synthesise Insights
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* RENDER SYNTHESIS LOADING VIEW */}
      {view === "loading_synthesis" && (
        <div className="flex-grow flex items-center justify-center min-h-[80vh] relative w-full">
          {loadingState === "loading" ? (
            <main className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center gap-8">
              {/* Pulsing Iris Glow Ring */}
              <div className="pulse-ring mb-4"></div>

              <div className="flex flex-col gap-2 items-center">
                <span className="font-label-mono text-xs text-[#8B8BA7] uppercase tracking-widest">AGENT 04 / SYNTHESIS + INSIGHT</span>
                <h1 className="font-hero-syne text-2xl sm:text-3xl text-[#F0EEE8] font-bold h-12 transition-all duration-300">
                  {synthesisStep === 1 && `Step 1: Extracting themes across ${transcripts.filter(t => !failedPersonas.includes(t.persona_id) && !excludedPersonaIds.has(t.persona_id)).length} interviews...`}
                  {synthesisStep === 2 && "Step 2: Finding patterns between personas..."}
                  {synthesisStep === 3 && "Step 3: Generating product hypotheses..."}
                  {synthesisStep === 4 && "Step 4: Ranking your recommendations..."}
                </h1>
                <p className="font-body-md text-base text-[#8B8BA7] max-w-[480px] min-h-[48px] transition-all duration-300 mt-2">
                  {synthesisStep === 1 && "Identifying core friction points, user needs, and major themes mentioned across multiple interviews."}
                  {synthesisStep === 2 && "Analyzing tensions, agreements, and contradictions across different user profiles to surface deeper insights."}
                  {synthesisStep === 3 && "Formulating testable, evidence-backed product hypotheses grounded in user themes."}
                  {synthesisStep === 4 && "Translating findings into prioritized, actionable recommendations ranked by impact and effort."}
                </p>
              </div>

              {/* Progress Mini-Map */}
              <div className="flex items-center mt-4 bg-[#0F0F1A] px-5 py-2.5 rounded-full border border-[#2A2A45] shadow-sm">
                <span className="text-[#C8F135] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#C8F135] text-xs">✓</span> Personas
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#C8F135] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#C8F135] text-xs">✓</span> Guide
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#C8F135] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#C8F135] text-xs">✓</span> Interviews
                </span>
                <span className="text-[#2A2A45] font-label-mono text-xs mx-2">-</span>
                <span className="text-[#7C5CFC] font-label-mono text-xs flex items-center gap-1.5 font-medium">
                  <span className="text-[#7C5CFC] text-xs">●</span> Synthesis
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[#8B8BA7]">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span className="font-body-md text-xs leading-none">Almost there — usually under 60 seconds.</span>
              </div>
            </main>
          ) : (
            /* Error State */
            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
              <div className="bg-[#0F0F1A] border border-[#FF6B8A]/30 p-8 rounded-2xl shadow-2xl w-full text-center flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B8A]/10 opacity-30 blur-[40px] mix-blend-screen rounded-full"></div>
                <div className="w-12 h-12 rounded-full bg-[#FF6B8A]/10 text-[#FF6B8A] flex items-center justify-center mx-auto mb-2 border border-[#FF6B8A]/20">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <h2 className="font-headline-sm text-xl text-[#F0EEE8] font-bold">Synthesis failed.</h2>
                <p className="font-body-md text-[#8B8BA7] text-sm leading-relaxed">
                  {apiError || "We had trouble synthesising insights from your interviews. Please try again."}
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider border border-[#2A2A45] rounded-lg bg-transparent text-[#8B8BA7] hover:text-[#F0EEE8] hover:bg-[#16162A] transition-colors focus:outline-none cursor-pointer"
                    onClick={() => setView("transcript_review")}
                  >
                    Back to transcripts
                  </button>
                  <button 
                    className="px-6 py-2.5 font-label-mono text-xs uppercase tracking-wider bg-[#7C5CFC] hover:bg-[#6945ed] text-[#F0EEE8] rounded-lg border-none flex items-center gap-2 focus:outline-none cursor-pointer shadow-lg shadow-[#7C5CFC]/30"
                    onClick={() => runId && startSynthesis(runId)}
                  >
                    Retry synthesis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER REPORT VIEW */}
      {view === "report" && report && (
        <div className="w-full flex-grow flex flex-col relative">
          {/* Top AppBar */}
          <header className="bg-[#0d0d16]/90 backdrop-blur-xl border-b border-[#2A2A45] flex justify-between items-center w-full px-6 h-16 z-50 sticky top-0 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("landing")}>
              <span className="font-headline-sm text-lg font-bold tracking-tight text-[#7C5CFC] font-display-xl">researchos</span>
            </div>
            <div className="flex-1 max-w-xl mx-auto px-6 text-center text-xs text-[#8B8BA7] truncate font-label-mono hidden lg:block">
              {report.research_goal}
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="px-5 py-2 rounded-full bg-[#7C5CFC] hover:bg-[#8A6DFD] hover:shadow-[0_0_15px_rgba(124,92,252,0.4)] text-[#F0EEE8] font-label-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                onClick={() => handleCopyReport(report)}
              >
                Copy report
              </button>
            </div>
          </header>

          {/* Copy Success Toast */}
          {copiedToast && (
            <div className="fixed top-20 right-6 z-50 bg-[#C8F135] text-[#07070F] px-4 py-2.5 rounded-lg font-label-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 border border-[#C8F135] animate-bounce">
              <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
              Report copied to clipboard.
            </div>
          )}

          {/* Undo Hypothesis Toast */}
          {showUndoHypothesis && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#0F0F1A] border border-[#FF6B8A]/40 text-[#F0EEE8] px-5 py-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-4 min-w-[320px]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#FF6B8A] text-lg">delete</span>
                <span className="font-body-md text-xs">Hypothesis removed.</span>
              </div>
              <button 
                className="font-label-mono text-xs text-[#C8F135] hover:text-[#b4d830] transition-colors bg-transparent border-none p-0 cursor-pointer uppercase font-bold"
                onClick={handleUndoHypothesisDelete}
              >
                Undo
              </button>
            </div>
          )}

          {/* Undo Recommendation Toast */}
          {showUndoRecommendation && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#0F0F1A] border border-[#FF6B8A]/40 text-[#F0EEE8] px-5 py-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-4 min-w-[320px]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#FF6B8A] text-lg">delete</span>
                <span className="font-body-md text-xs">Recommendation removed.</span>
              </div>
              <button 
                className="font-label-mono text-xs text-[#C8F135] hover:text-[#b4d830] transition-colors bg-transparent border-none p-0 cursor-pointer uppercase font-bold"
                onClick={handleUndoRecDelete}
              >
                Undo
              </button>
            </div>
          )}

          {/* Clipboard Fallback Modal */}
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-6">
              <div className="w-full max-w-2xl bg-[#0F0F1A] border border-[#2A2A45] rounded-2xl p-6 relative shadow-2xl flex flex-col gap-4">
                <button 
                  className="absolute top-4 right-4 text-[#8B8BA7] hover:text-[#F0EEE8] p-1.5 hover:bg-[#16162A] rounded-full cursor-pointer transition-colors"
                  onClick={() => setShowExportModal(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <div>
                  <h3 className="font-display-xl text-lg text-[#F0EEE8] font-bold">Copy your report</h3>
                  <p className="font-body-md text-xs text-[#8B8BA7] mt-1">Select all and paste into Notion, Google Docs, or Slack.</p>
                </div>
                <textarea 
                  readOnly
                  rows={14}
                  className="input-base w-full rounded-lg p-4 font-label-mono text-xs leading-relaxed resize-none"
                  value={compileReportToMarkdown(report, personas, failedPersonas, excludedPersonaIds, runId)}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <div className="flex justify-end pt-2">
                  <button 
                    className="neon-btn px-6 py-2 bg-[#7C5CFC] text-xs font-label-mono uppercase tracking-wider cursor-pointer"
                    onClick={() => setShowExportModal(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content View */}
          <main className="flex-1 w-full max-w-[840px] mx-auto px-6 py-12 flex flex-col gap-12 pb-32">
            
            {/* Header info */}
            <div className="border-b border-[#2A2A45]/30 pb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-label-mono uppercase tracking-widest font-semibold border bg-[#C8F135]/10 border-[#C8F135]/30 text-[#C8F135] shadow-[0_0_10px_rgba(200,241,53,0.1)]">
                  RESEARCH COMPLETE
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#F0EEE8] mb-6 font-hero-syne">
                {report.research_goal.replace(/\?$/, "").replace(/^(what|how|why|does|can|tell us about)/i, "").trim().replace(/^\w/, (c: string) => c.toUpperCase())} friction study.
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-label-mono text-[#8B8BA7]">
                <span>{personas.length} personas created</span>
                <span className="text-[#2A2A45]">•</span>
                <span>{new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                
                {(excludedPersonaIds.size > 0 || failedPersonas.length > 0) && (
                  <>
                    <span className="text-[#2A2A45]">•</span>
                    <span className="text-[#FF6B8A]">
                      {transcripts.filter(t => !failedPersonas.includes(t.persona_id) && !excludedPersonaIds.has(t.persona_id)).length} active (
                      {excludedPersonaIds.size > 0 && `${excludedPersonaIds.size} excluded`}
                      {excludedPersonaIds.size > 0 && failedPersonas.length > 0 && ", "}
                      {failedPersonas.length > 0 && `${failedPersonas.length} failed`}
                      )
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 01 / PARTICIPANTS */}
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#2A2A45]/30 pb-2">
                <span className="font-label-mono text-xs text-[#8B8BA7] tracking-widest uppercase font-semibold">01 / PARTICIPANTS</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {personas.map(p => {
                  const isExcluded = excludedPersonaIds.has(p.id);
                  const isFailed = failedPersonas.includes(p.id);
                  const isExpanded = expandedParticipantIds.has(p.id);
                  
                  return (
                    <div key={p.id} className={`glass-blob rounded-xl overflow-hidden transition-all duration-300 ${isExcluded || isFailed ? "opacity-50" : ""}`}>
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#16162A]/40 transition-colors"
                        onClick={() => toggleParticipantExpand(p.id)}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#F0EEE8]">{p.name}</span>
                            <span className="text-xs text-[#8B8BA7]">· {p.role}</span>
                          </div>
                          <span className="text-[11px] text-[#8B8BA7] font-label-mono">
                            {p.age} yrs · {p.location} · {p.tech_savviness} tech savviness
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-label-mono uppercase tracking-wider border ${
                            isExcluded 
                              ? "bg-[#16162A] border-[#2A2A45] text-[#8B8BA7]" 
                              : isFailed 
                                ? "bg-[#FF6B8A]/10 border-[#FF6B8A]/20 text-[#FF6B8A]" 
                                : "bg-[#C8F135]/10 border-[#C8F135]/20 text-[#C8F135]"
                          }`}>
                            {isExcluded ? "Excluded" : isFailed ? "Failed" : "Included"}
                          </span>
                          <span className="material-symbols-outlined text-[#8B8BA7] text-lg transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            expand_more
                          </span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-5 border-t border-[#2A2A45]/30 bg-[#0F0F1A]/50 flex flex-col gap-4 text-xs leading-relaxed text-[#CAC4D6]">
                          <div>
                            <h4 className="font-label-mono text-[10px] text-[#8B8BA7] uppercase mb-1">Background</h4>
                            <p>{p.background}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-label-mono text-[10px] text-[#8B8BA7] uppercase mb-1">Goals</h4>
                              <ul className="list-disc pl-4 marker:text-[#7C5CFC]">
                                {p.goals?.map((g: string, idx: number) => <li key={idx}>{g}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-label-mono text-[10px] text-[#8B8BA7] uppercase mb-1">Frustrations</h4>
                              <ul className="list-disc pl-4 marker:text-[#FF6B8A]">
                                {p.frustrations?.map((f: string, idx: number) => <li key={idx}>{f}</li>)}
                              </ul>
                            </div>
                          </div>
                          {p.quote && (
                            <div className="border-l-2 border-[#7C5CFC] pl-3 italic text-[#A78BFA] bg-[#7C5CFC]/5 py-2 rounded-r-md">
                              "{p.quote}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 02 / WHAT WE FOUND */}
            <section className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#2A2A45]/30 pb-2">
                <span className="font-label-mono text-xs text-[#8B8BA7] tracking-widest uppercase font-semibold">02 / WHAT WE FOUND (THEMES)</span>
              </div>
              
              <div className="flex flex-col gap-6">
                {report.themes?.length === 0 ? (
                  <div className="glass-blob p-6 rounded-xl text-center text-xs text-[#8B8BA7] font-label-mono">
                    Not enough signal. Try adding more personas or regenerating thin interviews.
                  </div>
                ) : (
                  report.themes?.map((t: any) => (
                    <div key={t.id} className="glass-blob p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C5CFC]/5 opacity-20 blur-[30px] rounded-full"></div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-[#F0EEE8]">{t.title}</h3>
                        <span className="px-2 py-0.5 rounded text-[9px] font-label-mono uppercase tracking-wider border bg-[#7C5CFC]/10 border-[#7C5CFC]/30 text-[#A78BFA]">
                          Mentioned by {t.frequency} of {report.persona_count} personas
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#CAC4D6] leading-relaxed">
                        {t.description}
                      </p>
                      
                      <div className="flex flex-col gap-3 mt-2 border-t border-[#2A2A45]/20 pt-4">
                        {t.evidence_quotes?.map((eq: any, qIdx: number) => (
                          <div key={qIdx} className="bg-[#16162A]/40 p-3 rounded-lg border border-[#2A2A45]/30 relative">
                            <span className="material-symbols-outlined absolute top-1.5 left-2 text-[#7C5CFC] opacity-10 text-lg">format_quote</span>
                            <p className="text-xs text-[#A78BFA] italic pl-6 leading-relaxed">
                              "{eq.quote}"
                            </p>
                            <span className="block text-[10px] text-[#8B8BA7] font-label-mono text-right mt-1.5">
                              — {eq.persona_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* SECTION 03 / WHAT TO TEST NEXT */}
            <section className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#2A2A45]/30 pb-2">
                <span className="font-label-mono text-xs text-[#8B8BA7] tracking-widest uppercase font-semibold">03 / WHAT TO TEST NEXT (HYPOTHESES)</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {report.hypotheses?.map((h: any, idx: number) => {
                  const isEditing = editingHypothesisId === h.id;
                  
                  return (
                    <div key={h.id} className="glass-blob p-6 rounded-xl flex flex-col gap-4 relative">
                      <div className="flex justify-between items-start">
                        <span className="font-label-mono text-xs font-bold text-[#7C5CFC]">H{idx + 1}</span>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-label-mono uppercase tracking-wider border ${
                            h.confidence === "high" 
                              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" 
                              : h.confidence === "low" 
                                ? "bg-rose-950/20 text-rose-400 border-rose-900/30" 
                                : "bg-[#16162A] text-[#8B8BA7] border-[#2A2A45]"
                          }`}>
                            ● {h.confidence} confidence
                          </span>
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="flex flex-col gap-4 mt-2">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Hypothesis statement</label>
                            <textarea 
                              rows={3}
                              className="input-base w-full rounded-md p-3 text-xs leading-relaxed resize-none"
                              value={editingHypothesisFields.statement}
                              onChange={e => setEditingHypothesisFields({ ...editingHypothesisFields, statement: e.target.value })}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">How to validate</label>
                            <input 
                              type="text"
                              className="input-base w-full rounded-md px-3 py-2 text-xs"
                              value={editingHypothesisFields.suggested_validation_method}
                              onChange={e => setEditingHypothesisFields({ ...editingHypothesisFields, suggested_validation_method: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              className="px-3.5 py-1.5 rounded-lg border border-[#2A2A45] bg-transparent text-[11px] font-label-mono uppercase tracking-wider text-[#8B8BA7] hover:text-[#F0EEE8] cursor-pointer"
                              onClick={() => setEditingHypothesisId(null)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="px-3.5 py-1.5 rounded-lg bg-[#7C5CFC] text-[11px] font-label-mono uppercase tracking-wider text-[#F0EEE8] cursor-pointer"
                              onClick={() => handleSaveHypothesisEdit(h.id)}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#F0EEE8] leading-relaxed">
                            {h.statement}
                          </p>
                          
                          {h.supporting_themes && h.supporting_themes.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8B8BA7]">
                              <span className="font-label-mono uppercase text-[9px]">Supported by:</span>
                              {h.supporting_themes.map((themeId: string) => {
                                const themeObj = report.themes.find((t: any) => t.id === themeId);
                                return (
                                  <span key={themeId} className="px-2 py-0.5 rounded bg-[#16162A] border border-[#2A2A45] text-xs">
                                    {themeObj ? themeObj.title : themeId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="bg-[#16162A]/30 p-3 rounded-lg border border-[#2A2A45]/30 text-xs text-[#CAC4D6] leading-relaxed flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm text-[#7C5CFC] mt-0.5">science</span>
                            <div>
                              <span className="font-label-mono text-[9px] text-[#8B8BA7] uppercase block mb-0.5">Validation method</span>
                              {h.suggested_validation_method}
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-3 border-t border-[#2A2A45]/20 flex justify-end gap-2">
                            <button 
                              className="px-2.5 py-1 rounded bg-[#16162A] hover:bg-[#1f1f3a] border border-[#2A2A45] font-label-mono text-[10px] text-[#8B8BA7] hover:text-[#F0EEE8] flex items-center gap-1 cursor-pointer transition-colors"
                              onClick={() => handleStartEditHypothesis(h)}
                            >
                              <span className="material-symbols-outlined text-xs">edit</span> Edit
                            </button>
                            <button 
                              className="px-2.5 py-1 bg-transparent hover:bg-[#FF6B8A]/10 border border-transparent hover:border-[#FF6B8A]/30 font-label-mono text-[10px] text-[#8B8BA7] hover:text-[#FF6B8A] flex items-center gap-1 cursor-pointer transition-colors rounded"
                              onClick={() => handleDeleteHypothesis(h.id)}
                            >
                              <span className="material-symbols-outlined text-xs">close</span> Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 04 / WHAT TO DO */}
            <section className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#2A2A45]/30 pb-2">
                <span className="font-label-mono text-xs text-[#8B8BA7] tracking-widest uppercase font-semibold">04 / WHAT TO DO (RECOMMENDATIONS)</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {report.recommendations?.map((r: any, idx: number) => {
                  const isEditing = editingRecId === r.rank;
                  
                  return (
                    <div key={r.rank} className="glass-blob p-6 rounded-xl flex gap-4 relative items-start">
                      {/* Drag handles / Arrows */}
                      <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                        <button 
                          className="w-6 h-6 rounded hover:bg-[#16162A] flex items-center justify-center text-[#8B8BA7] hover:text-[#F0EEE8] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          disabled={idx === 0}
                          onClick={() => handleMoveRec(idx, "up")}
                        >
                          <span className="material-symbols-outlined text-lg leading-none">arrow_drop_up</span>
                        </button>
                        <span className="font-label-mono text-[15px] font-bold text-[#7C5CFC]">
                          {String(r.rank).padStart(2, "0")}
                        </span>
                        <button 
                          className="w-6 h-6 rounded hover:bg-[#16162A] flex items-center justify-center text-[#8B8BA7] hover:text-[#F0EEE8] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          disabled={idx === report.recommendations.length - 1}
                          onClick={() => handleMoveRec(idx, "down")}
                        >
                          <span className="material-symbols-outlined text-lg leading-none">arrow_drop_down</span>
                        </button>
                      </div>
                      
                      <div className="flex-grow flex flex-col gap-3">
                        {isEditing ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Recommended Action</label>
                              <input 
                                type="text"
                                className="input-base w-full rounded-md px-3 py-2 text-xs"
                                value={editingRecFields.action}
                                onChange={e => setEditingRecFields({ ...editingRecFields, action: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-label-mono text-[10px] text-[#8B8BA7] uppercase">Rationale</label>
                              <textarea 
                                rows={2}
                                className="input-base w-full rounded-md p-3 text-xs leading-relaxed resize-none"
                                value={editingRecFields.rationale}
                                onChange={e => setEditingRecFields({ ...editingRecFields, rationale: e.target.value })}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button 
                                className="px-3.5 py-1.5 rounded-lg border border-[#2A2A45] bg-transparent text-[11px] font-label-mono uppercase tracking-wider text-[#8B8BA7] hover:text-[#F0EEE8] cursor-pointer"
                                onClick={() => setEditingRecId(null)}
                              >
                                Cancel
                              </button>
                              <button 
                                className="px-3.5 py-1.5 rounded-lg bg-[#7C5CFC] text-[11px] font-label-mono uppercase tracking-wider text-[#F0EEE8] cursor-pointer"
                                onClick={() => handleSaveRecEdit(r.rank)}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h3 className="text-base font-bold text-[#F0EEE8] leading-snug">{r.action}</h3>
                              <p className="text-xs text-[#8B8BA7] mt-1.5 leading-relaxed">
                                <span className="font-label-mono text-[9px] uppercase tracking-wider block text-[#8B8BA7]/70">Rationale</span>
                                {r.rationale}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#2A2A45]/20">
                              <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-label-mono uppercase tracking-wider border ${
                                  r.priority === "high" 
                                    ? "bg-rose-950/20 text-[#FF6B8A] border-rose-900/30" 
                                    : r.priority === "medium" 
                                      ? "bg-purple-950/20 text-purple-400 border-purple-900/30" 
                                      : "bg-[#16162A] text-[#8B8BA7] border-[#2A2A45]"
                                }`}>
                                  Priority: {r.priority}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[8px] font-label-mono uppercase tracking-wider border bg-[#16162A] text-[#CAC4D6] border-[#2A2A45]">
                                  Effort: {r.effort}
                                </span>
                              </div>
                              
                              <div className="flex gap-1.5">
                                <button 
                                  className="p-1 hover:bg-[#16162A] rounded text-[#8B8BA7] hover:text-[#F0EEE8] cursor-pointer transition-colors"
                                  onClick={() => handleStartEditRec(r)}
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button 
                                  className="p-1 hover:bg-[#FF6B8A]/10 rounded text-[#8B8BA7] hover:text-[#FF6B8A] cursor-pointer transition-colors"
                                  onClick={() => handleDeleteRec(r.rank)}
                                >
                                  <span className="material-symbols-outlined text-base">close</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CONFIDENCE DISCLAIMER */}
            <footer className="border-t border-[#2A2A45]/30 pt-8 mt-6 flex flex-col gap-3 text-xs leading-relaxed text-[#8B8BA7]">
              <span className="font-label-mono text-[10px] text-[#A78BFA] uppercase tracking-wider font-semibold">ABOUT THIS REPORT</span>
              <p>
                This report was generated using synthetic AI personas — not real users. Use these findings as directional signal to generate and prioritise hypotheses, not as validated conclusions.
              </p>
              <p>
                The output reflects what people might say, not what they would do (say-do gap). Consider validating the top hypothesis with 5 real users before committing to a major product decision.
              </p>
            </footer>

            {/* RUN ANOTHER RUN LINK */}
            <div className="text-center pt-8">
              <button 
                className="bg-transparent border-none p-0 inline-flex items-center text-[#7C5CFC] hover:text-[#8A6DFD] font-label-mono text-xs uppercase tracking-widest transition-colors group cursor-pointer font-bold"
                onClick={() => {
                  const confirmNew = window.confirm("Start a new research study? All saved progress of this run will be reset.");
                  if (confirmNew) {
                    sessionStorage.clear();
                    setView("landing");
                    setRunId(null);
                    setReport(null);
                    setPersonas([]);
                    setTranscripts([]);
                  }
                }}
              >
                Run another study
                <span className="material-symbols-outlined ml-1.5 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

          </main>
        </div>
      )}
    </div>
  );
}
