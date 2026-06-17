from pydantic import BaseModel, field_validator
from typing import List, Optional
from enum import Enum
from config import settings


# ── Enums ────────────────────────────────────────────────────────

class ProductStage(str, Enum):
    IDEA        = "idea"
    PRE_MVP     = "pre-mvp"
    MVP         = "mvp"
    POST_LAUNCH = "post-launch"

class TechSavviness(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"

class Tone(str, Enum):
    POSITIVE = "positive"
    NEUTRAL  = "neutral"
    NEGATIVE = "negative"
    MIXED    = "mixed"

class QualityFlag(str, Enum):
    ADEQUATE = "adequate"
    THIN     = "thin"

class Confidence(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"

class Priority(str, Enum):
    HIGH   = "high"
    MEDIUM = "medium"
    LOW    = "low"

class Effort(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"

class BehaviorEvent(str, Enum):
    GATE1_PERSONA_EDITED        = "gate1_persona_edited"
    GATE1_PERSONA_DELETED       = "gate1_persona_deleted"
    GATE1_PERSONA_ADDED         = "gate1_persona_added"
    GATE1_PERSONA_REGENERATED   = "gate1_persona_regenerated"
    GATE2_QUESTION_EDITED       = "gate2_question_edited"
    GATE2_QUESTION_DELETED      = "gate2_question_deleted"
    GATE2_QUESTION_ADDED        = "gate2_question_added"
    GATE2_QUESTION_REGENERATED  = "gate2_question_regenerated"
    GATE3_TRANSCRIPT_REGENERATED = "gate3_transcript_regenerated"
    GATE3_TRANSCRIPT_EXCLUDED   = "gate3_transcript_excluded"
    GATE4_HYPOTHESIS_EDITED     = "gate4_hypothesis_edited"
    GATE4_HYPOTHESIS_DELETED    = "gate4_hypothesis_deleted"
    GATE4_REC_REORDERED         = "gate4_rec_reordered"
    GATE4_REC_DELETED           = "gate4_rec_deleted"


# ── Intake ───────────────────────────────────────────────────────

class IntakeForm(BaseModel):
    product_description: str
    target_user: str
    research_goal: str
    product_stage: ProductStage
    persona_count: int
    question_count: int

    @field_validator("product_description")
    @classmethod
    def check_product_description(cls, v: str) -> str:
        if len(v.strip()) < settings.MIN_PRODUCT_DESCRIPTION_CHARS:
            raise ValueError(f"Must be at least {settings.MIN_PRODUCT_DESCRIPTION_CHARS} characters")
        return v.strip()

    @field_validator("target_user")
    @classmethod
    def check_target_user(cls, v: str) -> str:
        if len(v.strip()) < settings.MIN_TARGET_USER_CHARS:
            raise ValueError(f"Must be at least {settings.MIN_TARGET_USER_CHARS} characters")
        return v.strip()

    @field_validator("research_goal")
    @classmethod
    def check_research_goal(cls, v: str) -> str:
        if len(v.strip()) < settings.MIN_RESEARCH_GOAL_CHARS:
            raise ValueError(f"Must be at least {settings.MIN_RESEARCH_GOAL_CHARS} characters")
        return v.strip()

    @field_validator("persona_count")
    @classmethod
    def check_persona_count(cls, v: int) -> int:
        if not (settings.MIN_PERSONAS <= v <= settings.MAX_PERSONAS):
            raise ValueError(f"Must be between {settings.MIN_PERSONAS} and {settings.MAX_PERSONAS}")
        return v

    @field_validator("question_count")
    @classmethod
    def check_question_count(cls, v: int) -> int:
        if not (settings.MIN_QUESTIONS <= v <= settings.MAX_QUESTIONS):
            raise ValueError(f"Must be between {settings.MIN_QUESTIONS} and {settings.MAX_QUESTIONS}")
        return v


# ── Persona ──────────────────────────────────────────────────────

class Persona(BaseModel):
    id: str
    name: str
    age: int
    role: str
    location: str
    background: str
    goals: List[str]
    frustrations: List[str]
    behavioral_context: str
    relationship_to_problem: str
    tech_savviness: TechSavviness
    quote: str


# ── Interview Guide ──────────────────────────────────────────────

class Question(BaseModel):
    id: str
    question: str
    intent: str
    follow_up_probes: List[str]

class InterviewGuide(BaseModel):
    research_goal: str
    warmup_question: str
    questions: List[Question]
    closing_question: str


# ── Transcript ───────────────────────────────────────────────────

class QuestionResponse(BaseModel):
    question_id: str
    question: str
    response: str
    tone: Tone
    quality_flag: QualityFlag

class Transcript(BaseModel):
    persona_id: str
    persona_name: str
    responses: List[QuestionResponse]


# ── Report ───────────────────────────────────────────────────────

class EvidenceQuote(BaseModel):
    persona_name: str
    quote: str
    question_id: str

class Theme(BaseModel):
    id: str
    title: str
    description: str
    frequency: int
    evidence_quotes: List[EvidenceQuote]

class Hypothesis(BaseModel):
    id: str
    statement: str
    confidence: Confidence
    supporting_themes: List[str]
    suggested_validation_method: str

class Recommendation(BaseModel):
    rank: int
    action: str
    rationale: str
    priority: Priority
    effort: Effort

class InsightReport(BaseModel):
    research_goal: str
    persona_count: int
    themes: List[Theme]
    cross_persona_patterns: List[str]
    hypotheses: List[Hypothesis]
    recommendations: List[Recommendation]
    confidence_disclaimer: str


# ── API Request models ───────────────────────────────────────────

class CreateRunRequest(BaseModel):
    intake: IntakeForm
    user_email: Optional[str] = None
    session_id: str

class PersonasRequest(BaseModel):
    run_id: str

class GuideRequest(BaseModel):
    run_id: str
    personas: List[Persona]

class SimulateRequest(BaseModel):
    run_id: str
    personas: List[Persona]
    guide: InterviewGuide

class SynthesiseRequest(BaseModel):
    run_id: str
    transcripts: List[dict]   # includes _excluded flag set by frontend

class BehaviorRequest(BaseModel):
    event: BehaviorEvent
