import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const url = process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL not set")
const adapter = new PrismaLibSql({ url })
const db = new PrismaClient({ adapter })

// ── Badge definitions ────────────────────────────────────────────────────────

const BADGE_DEFINITIONS = [
  { key: "first_steps",        name: "First Steps",         description: "Submitted your first AI contribution",       rarity: "COMMON"    as const, icon: "🌱" },
  { key: "ai_enthusiast",      name: "AI Enthusiast",       description: "5 approved contributions under your belt",   rarity: "COMMON"    as const, icon: "⚡" },
  { key: "meeting_master",     name: "Meeting Master",      description: "Transformed 3 meetings with AI",             rarity: "COMMON"    as const, icon: "🎙️" },
  { key: "code_alchemist",     name: "Code Alchemist",      description: "First AI-powered deliverable created",       rarity: "RARE"      as const, icon: "⚗️" },
  { key: "perfect_score",      name: "Flawless",            description: "Received a perfect validator rating of 5",   rarity: "RARE"      as const, icon: "💎" },
  { key: "trailblazer",        name: "Trailblazer",         description: "Reached Transformer status",                 rarity: "RARE"      as const, icon: "🔥" },
  { key: "productivity_pro",   name: "Productivity Pro",    description: "10 PRODUCTIVITY contributions approved",     rarity: "RARE"      as const, icon: "🚀" },
  { key: "deliverable_dynamo", name: "Deliverable Dynamo",  description: "10 DELIVERABLE contributions approved",      rarity: "RARE"      as const, icon: "⚙️" },
  { key: "innovation_spark",   name: "Innovation Spark",    description: "First INNOVATION contribution approved",     rarity: "EPIC"      as const, icon: "✨" },
  { key: "team_architect",     name: "Team Architect",      description: "3 INNOVATION contributions approved",        rarity: "EPIC"      as const, icon: "🏛️" },
  { key: "century",            name: "Century",             description: "Scored 100+ total persona points",           rarity: "EPIC"      as const, icon: "💯" },
  { key: "ainabler_legend",    name: "AINABLER Legend",     description: "Reached Innovator status — elite AI practitioner", rarity: "LEGENDARY" as const, icon: "👑" },
  { key: "forerunner",         name: "Forerunner",          description: "Reached Legend status — 100+ pts of AI mastery",   rarity: "LEGENDARY" as const, icon: "🌌" },
]

// ── Scoring helpers (mirrors gamification.ts) ────────────────────────────────

const AREA_W: Record<string, number> = { PRODUCTIVITY: 1, DELIVERABLE: 1.5, INNOVATION: 2.5, OTHER: 0.5 }
const IMPACT_W: Record<string, number> = { LOW: 1, MEDIUM: 1.5, HIGH: 2, TRANSFORMATIVE: 3 }

function calcScore(area: string, impact: string, rating: number) {
  return rating * (AREA_W[area] ?? 1) * (IMPACT_W[impact] ?? 1)
}

function derivePersona(score: number) {
  if (score >= 100) return "LEGEND"
  if (score >= 50)  return "INNOVATOR"
  if (score >= 20)  return "TRANSFORMER"
  return "ADOPTER"
}

// ── Badge logic (mirrors gamification.ts) ────────────────────────────────────

function calcBadges(
  contribs: Array<{ area: string; status: string; rating?: number | null }>,
  totalScore: number,
  persona: string
): string[] {
  const approved  = contribs.filter((c) => c.status === "APPROVED")
  const earned: string[] = []

  if (contribs.length >= 1) earned.push("first_steps")
  if (approved.length >= 5) earned.push("ai_enthusiast")

  const productivity = approved.filter((c) => c.area === "PRODUCTIVITY")
  const deliverable  = approved.filter((c) => c.area === "DELIVERABLE")
  const innovation   = approved.filter((c) => c.area === "INNOVATION")

  if (productivity.length >= 3)  earned.push("meeting_master")
  if (deliverable.length  >= 1)  earned.push("code_alchemist")
  if (deliverable.length  >= 10) earned.push("deliverable_dynamo")
  if (productivity.length >= 10) earned.push("productivity_pro")
  if (innovation.length   >= 1)  earned.push("innovation_spark")
  if (innovation.length   >= 3)  earned.push("team_architect")

  if (approved.some((c) => c.rating === 5)) earned.push("perfect_score")
  if (persona === "TRANSFORMER" || persona === "INNOVATOR" || persona === "LEGEND") earned.push("trailblazer")
  if (totalScore >= 100) earned.push("century")
  if (persona === "INNOVATOR" || persona === "LEGEND") earned.push("ainabler_legend")
  if (persona === "LEGEND") earned.push("forerunner")

  return earned
}

// ── Contribution seed data ────────────────────────────────────────────────────
//
//  validatorEmail: who approves/rejects it (cross-validation, never self)
//  daysAgo:        how many days in the past the contribution was submitted

type ContribDef = {
  title: string
  description: string
  area: "PRODUCTIVITY" | "DELIVERABLE" | "INNOVATION" | "OTHER"
  benefit: string
  impact: "LOW" | "MEDIUM" | "HIGH" | "TRANSFORMATIVE"
  scope: "CAPGEMINI" | "CLIENT" | "BOTH"
  status: "PENDING" | "APPROVED" | "REJECTED"
  daysAgo: number
  validatorEmail?: string
  rating?: number
  validatorNote?: string
}

type UserSeed = {
  email: string
  name: string
  role: "MEMBER" | "ADMIN"
  contribs: ContribDef[]
}

const USER_SEEDS: UserSeed[] = [
  // ── Ameet Gudka — INNOVATOR (target ~115 pts) ─────────────────────────────
  {
    email: "ameet@ainablers.com",
    name: "Ameet Gudka",
    role: "MEMBER",
    contribs: [
      {
        title: "AI-Powered Project Risk Forecaster",
        description: "Built a GPT-4 powered tool that analyses project data and automatically flags risk indicators, generating a weekly risk report for PMs across three client engagements.",
        area: "INNOVATION", impact: "TRANSFORMATIVE", scope: "CLIENT",
        benefit: "Reduced risk identification time by 70% and improved early warning for portfolio-level issues.",
        daysAgo: 78, status: "APPROVED",
        validatorEmail: "vivek.jain@ainablers.com", rating: 5,
        validatorNote: "Exceptional innovation. Clear business value with fully measurable outcomes — top rating well earned.",
      },
      {
        title: "Automated Client Status Reports via GPT-4",
        description: "Designed an end-to-end pipeline that pulls JIRA and Confluence data, summarises progress via GPT-4, and emails a formatted status report to the client every Monday.",
        area: "INNOVATION", impact: "HIGH", scope: "CLIENT",
        benefit: "Saved 4 hours per week per PM and eliminated manual status-report errors.",
        daysAgo: 65, status: "APPROVED",
        validatorEmail: "subramanian.iyer@ainablers.com", rating: 4,
        validatorNote: "Solid innovation with clear time-saving evidence. The pipeline design is reusable across accounts.",
      },
      {
        title: "Multi-Agent LLM Workflow for PM Tasks",
        description: "Created a multi-agent LangChain workflow that handles backlog grooming, risk assessment, and stakeholder update generation as sequential agents.",
        area: "INNOVATION", impact: "HIGH", scope: "BOTH",
        benefit: "Reduced backlog grooming meetings by 50% and provided a reusable agentic framework for the team.",
        daysAgo: 52, status: "APPROVED",
        validatorEmail: "rahul.kesarwani@ainablers.com", rating: 4,
        validatorNote: "Strong agentic AI implementation. The framework is already being replicated by two other team members.",
      },
      {
        title: "Copilot for Agile User Stories",
        description: "Leveraged GitHub Copilot to auto-generate user stories with acceptance criteria from requirements docs, integrated into the team's Confluence workflow.",
        area: "DELIVERABLE", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Cut user story writing time by 60% and improved acceptance-criteria completeness scores.",
        daysAgo: 45, status: "APPROVED",
        validatorEmail: "nabil.tajmouti@ainablers.com", rating: 4,
        validatorNote: "Great practical adoption of Copilot on a real deliverable. Outcome metrics well documented.",
      },
      {
        title: "AI Risk Scoring Dashboard",
        description: "Built a Streamlit dashboard backed by an LLM scoring model that rates each project on 12 risk dimensions and visualises trend lines.",
        area: "DELIVERABLE", impact: "MEDIUM", scope: "CLIENT",
        benefit: "Provided the client PMO with a single pane of glass for risk across 8 projects.",
        daysAgo: 38, status: "APPROVED",
        validatorEmail: "parag.parekh@ainablers.com", rating: 4,
        validatorNote: "Polished output and well-scoped for the client. Good evidence of impact.",
      },
      {
        title: "Prompt Engineering Workshop Delivery",
        description: "Designed and delivered a half-day internal workshop on prompt engineering techniques (chain-of-thought, few-shot, RAG basics) to 18 colleagues.",
        area: "PRODUCTIVITY", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "18 colleagues upskilled; three have since adopted RAG patterns on live projects.",
        daysAgo: 29, status: "APPROVED",
        validatorEmail: "subramanian.iyer@ainablers.com", rating: 3,
        validatorNote: "Good knowledge-sharing contribution. Evidence of adoption by attendees adds real value.",
      },
      {
        title: "AI Client Churn Prediction Model",
        description: "Trained a lightweight churn prediction model on anonymised CRM data and exposed it via a FastAPI endpoint consumed by the account management team.",
        area: "DELIVERABLE", impact: "HIGH", scope: "CLIENT",
        benefit: "Identified two at-risk clients two weeks before QBR, enabling proactive relationship management.",
        daysAgo: 18, status: "APPROVED",
        validatorEmail: "vivek.jain@ainablers.com", rating: 4,
        validatorNote: "Impressive practical AI engineering. The predictive value is clearly demonstrated.",
      },
      {
        title: "AI Meeting Assistant Pilot",
        description: "Piloting an AI meeting assistant that takes live transcripts, extracts action items, and pushes them to JIRA automatically.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "CAPGEMINI",
        benefit: "Expected to eliminate manual meeting minute capture for a team of 12.",
        daysAgo: 5, status: "PENDING",
      },
    ],
  },

  // ── Vivek Jain — INNOVATOR (target ~80 pts) ───────────────────────────────
  {
    email: "vivek.jain@ainablers.com",
    name: "Vivek Jain",
    role: "MEMBER",
    contribs: [
      {
        title: "Agentic Document Review Bot",
        description: "Built an autonomous LangChain agent that reviews legal and procurement documents, highlights anomalies, and produces a structured risk summary — no human in the loop.",
        area: "INNOVATION", impact: "TRANSFORMATIVE", scope: "CLIENT",
        benefit: "Reduced document review time from 3 days to 2 hours on a recent procurement exercise.",
        daysAgo: 72, status: "APPROVED",
        validatorEmail: "ameet@ainablers.com", rating: 4,
        validatorNote: "Impressive agentic implementation with documented time savings. Strong evidence of TRANSFORMATIVE impact.",
      },
      {
        title: "AI Code Review Assistant",
        description: "Integrated GPT-4o into the CI pipeline via a custom GitHub Action that posts inline code review comments before a human reviewer sees the PR.",
        area: "INNOVATION", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Average PR review cycles dropped from 2.4 to 1.1 across the engineering chapter.",
        daysAgo: 60, status: "APPROVED",
        validatorEmail: "rahul.kesarwani@ainablers.com", rating: 3,
        validatorNote: "Clean implementation. The reduction in review cycles is a strong measurable outcome.",
      },
      {
        title: "AI Pair Programming Tool Integration",
        description: "Evaluated and integrated Cursor IDE across the development team, including custom rules, prompt library, and onboarding guide.",
        area: "INNOVATION", impact: "MEDIUM", scope: "CAPGEMINI",
        benefit: "Team reported 35% faster feature delivery in first two sprints post-adoption.",
        daysAgo: 50, status: "APPROVED",
        validatorEmail: "parag.parekh@ainablers.com", rating: 2,
        validatorNote: "Good initiative. Impact evidence is anecdotal — would benefit from more rigorous measurement.",
      },
      {
        title: "LLM-Powered Test Generation",
        description: "Created a CLI tool that reads OpenAPI specs and generates pytest/Jest test scaffolding using GPT-4, covering happy path and edge cases.",
        area: "DELIVERABLE", impact: "HIGH", scope: "BOTH",
        benefit: "Cut test scaffolding effort by 75%; already used on 4 client projects.",
        daysAgo: 42, status: "APPROVED",
        validatorEmail: "varun.nadgouda@ainablers.com", rating: 4,
        validatorNote: "Excellent tooling contribution with cross-project adoption. The 4-project reuse justifies HIGH impact.",
      },
      {
        title: "AI QA Automation Framework",
        description: "Extended the test generation tool with an LLM-based assertion generator that reads acceptance criteria and writes BDD scenarios.",
        area: "DELIVERABLE", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Reduced QA spec-writing time by 50% on the delivery team.",
        daysAgo: 30, status: "APPROVED",
        validatorEmail: "ameet@ainablers.com", rating: 3,
        validatorNote: "Solid follow-on from the test generation work. Clear productivity gains for the delivery team.",
      },
      {
        title: "Automated Regression Testing with AI",
        description: "Implemented Playwright + AI-driven test repair that auto-fixes brittle selectors when the UI changes, reducing maintenance overhead.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "CLIENT",
        benefit: "Flaky tests reduced by 80%; QA team freed from 6 hours/week of test maintenance.",
        daysAgo: 20, status: "APPROVED",
        validatorEmail: "rahul.kesarwani@ainablers.com", rating: 2,
        validatorNote: "Good practical contribution. The flakiness reduction stat is compelling.",
      },
      {
        title: "Daily Standup Summariser",
        description: "Building a Slack bot that reads threaded standup messages, summarises blockers, and pings relevant engineers with context.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Will save each team member ~10 min/day of context-switching.",
        daysAgo: 3, status: "PENDING",
      },
    ],
  },

  // ── Subramanian Iyer — TRANSFORMER (target ~43 pts) ──────────────────────
  {
    email: "subramanian.iyer@ainablers.com",
    name: "Subramanian Iyer",
    role: "MEMBER",
    contribs: [
      {
        title: "GitHub Copilot Enterprise Rollout Plan",
        description: "Authored the enterprise rollout plan for GitHub Copilot across 200 engineers, including security review, licence model, onboarding tracks, and success metrics.",
        area: "DELIVERABLE", impact: "TRANSFORMATIVE", scope: "CLIENT",
        benefit: "Accelerated client's Copilot adoption by 3 months; plan adopted verbatim by the client CTO.",
        daysAgo: 69, status: "APPROVED",
        validatorEmail: "ben.cocker@ainablers.com", rating: 4,
        validatorNote: "Highly polished deliverable with real strategic impact. The client adoption story is compelling.",
      },
      {
        title: "AI-Augmented Sprint Planning",
        description: "Used GPT-4 to analyse historical velocity data and generate sprint capacity recommendations and risk flags during planning sessions.",
        area: "PRODUCTIVITY", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Sprint commitment accuracy improved from 68% to 87% over 6 sprints.",
        daysAgo: 55, status: "APPROVED",
        validatorEmail: "ameet@ainablers.com", rating: 3,
        validatorNote: "Good use of AI on a recurring process. The accuracy improvement data is solid.",
      },
      {
        title: "Meeting Intelligence with Otter.ai",
        description: "Deployed Otter.ai across the BA team with custom vocabulary, integrated summaries into Confluence, and trained the team on prompt-based search.",
        area: "PRODUCTIVITY", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Meeting documentation time reduced by 90%; search-based retrieval of past decisions now used daily.",
        daysAgo: 43, status: "APPROVED",
        validatorEmail: "parag.parekh@ainablers.com", rating: 3,
        validatorNote: "Strong adoption story. The 90% reduction is well-evidenced with usage data.",
      },
      {
        title: "Design Spec Generator",
        description: "Built a prompt chain that takes a one-paragraph feature brief and produces a detailed design spec with user flows, edge cases, and open questions.",
        area: "DELIVERABLE", impact: "MEDIUM", scope: "CAPGEMINI",
        benefit: "Design spec cycle reduced from 2 days to 3 hours for standard feature requests.",
        daysAgo: 33, status: "APPROVED",
        validatorEmail: "pratik.sharma@ainablers.com", rating: 3,
        validatorNote: "Useful contribution. The time saving is clearly documented.",
      },
      {
        title: "AI Acceptance Criteria Generator",
        description: "Extended the design spec tool to auto-generate Given/When/Then acceptance criteria from user story descriptions using GPT-4.",
        area: "DELIVERABLE", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Acceptance criteria completeness score improved 40% in sprint reviews.",
        daysAgo: 22, status: "APPROVED",
        validatorEmail: "vivek.jain@ainablers.com", rating: 2,
        validatorNote: "Good follow-on improvement. Impact is modest but measurable.",
      },
      {
        title: "AI-Driven Architecture Review Tool",
        description: "Prototyping a tool that feeds architecture diagrams and ADRs to a vision model to identify anti-patterns and missing NFRs automatically.",
        area: "INNOVATION", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Expected to cut architecture review prep from 1 day to 2 hours.",
        daysAgo: 6, status: "PENDING",
      },
    ],
  },

  // ── Rahul Kesarwani — TRANSFORMER (target ~24.5 pts) ─────────────────────
  {
    email: "rahul.kesarwani@ainablers.com",
    name: "Rahul Kesarwani",
    role: "MEMBER",
    contribs: [
      {
        title: "Copilot-Powered Code Review Checklist",
        description: "Configured GitHub Copilot with a custom system prompt that enforces team coding standards, security patterns, and naming conventions on every PR.",
        area: "DELIVERABLE", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Code quality defects in production reduced by 30% over the past quarter.",
        daysAgo: 61, status: "APPROVED",
        validatorEmail: "vivek.jain@ainablers.com", rating: 4,
        validatorNote: "Very tangible quality improvement. The 30% defect reduction is well-evidenced.",
      },
      {
        title: "AI Sprint Velocity Predictor",
        description: "Trained a lightweight regression model on 18 months of JIRA sprint data to predict velocity and flag at-risk sprints two weeks ahead.",
        area: "PRODUCTIVITY", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "PMs now receive velocity forecasts with 88% accuracy, enabling earlier resource re-allocation.",
        daysAgo: 47, status: "APPROVED",
        validatorEmail: "ameet@ainablers.com", rating: 4,
        validatorNote: "Solid ML application with well-documented predictive accuracy. Genuinely useful for the PM chapter.",
      },
      {
        title: "Automated Email Drafts via Copilot",
        description: "Created email templates with embedded Copilot prompts for the most common client communication scenarios (status update, delay notice, escalation).",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "BOTH",
        benefit: "Client-facing email drafting time reduced by 40% across the account team.",
        daysAgo: 36, status: "APPROVED",
        validatorEmail: "subramanian.iyer@ainablers.com", rating: 3,
        validatorNote: "Practical and well-adopted contribution. Good cross-team impact.",
      },
      {
        title: "AI Requirements Analyser",
        description: "Building an LLM pipeline that ingests requirements documents and flags ambiguities, contradictions, and missing NFRs automatically.",
        area: "DELIVERABLE", impact: "MEDIUM", scope: "CLIENT",
        benefit: "Expected to cut requirements clarification cycles by 50%.",
        daysAgo: 12, status: "PENDING",
      },
      {
        title: "Innovation Chatbot Prototype",
        description: "Built a quick Streamlit prototype of a knowledge-base chatbot using RAG over internal Confluence pages.",
        area: "INNOVATION", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Proof of concept for internal knowledge retrieval.",
        daysAgo: 25, status: "REJECTED",
        validatorEmail: "varun.nadgouda@ainablers.com", rating: 2,
        validatorNote: "Interesting prototype but impact evidence is thin and the use case duplicates existing tooling. Revisit with a more differentiated angle.",
      },
    ],
  },

  // ── Varun Nadgouda — TRANSFORMER (target ~20 pts) ─────────────────────────
  {
    email: "varun.nadgouda@ainablers.com",
    name: "Varun Nadgouda",
    role: "MEMBER",
    contribs: [
      {
        title: "AI-Assisted Proposal Writing",
        description: "Used a custom GPT with Capgemini proposal templates and past winning bids to generate first-draft proposal sections. Reduced proposal writing from 3 days to 1.",
        area: "DELIVERABLE", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Proposal win-rate stable while throughput increased by 3x; team can now respond to more RFPs.",
        daysAgo: 64, status: "APPROVED",
        validatorEmail: "nabil.tajmouti@ainablers.com", rating: 3,
        validatorNote: "Strong business impact story. The 3x throughput improvement is well-documented.",
      },
      {
        title: "Otter.ai Meeting Efficiency Rollout",
        description: "Deployed Otter.ai for the entire delivery team, set up shared workspaces, and created a naming convention and filing guide to make summaries searchable.",
        area: "PRODUCTIVITY", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Meeting documentation burden eliminated for 8 PMs; historical decision retrieval now under 2 min.",
        daysAgo: 50, status: "APPROVED",
        validatorEmail: "ben.cocker@ainablers.com", rating: 4,
        validatorNote: "Well-executed deployment with documented adoption. Eliminating documentation burden is a clear productivity win.",
      },
      {
        title: "PowerPoint AI Automation",
        description: "Created a Python script using python-pptx and GPT-4 to auto-populate slide templates from structured JSON data, removing manual copy-paste from status reports.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "CLIENT",
        benefit: "Weekly status deck creation time reduced from 2 hours to 15 minutes.",
        daysAgo: 37, status: "APPROVED",
        validatorEmail: "parag.parekh@ainablers.com", rating: 2,
        validatorNote: "Practical automation. The time saving is clear, though scope is narrow.",
      },
      {
        title: "AI for Client Presentation Decks",
        description: "Exploring using AI to generate content-rich presentation decks from bullet-point briefs, combining Canva AI and GPT-4 in a workflow.",
        area: "DELIVERABLE", impact: "MEDIUM", scope: "CLIENT",
        benefit: "Expected to cut deck production time by 60% for standard formats.",
        daysAgo: 8, status: "PENDING",
      },
      {
        title: "ChatGPT Brainstorming Integration",
        description: "Trialling a structured brainstorming workflow using ChatGPT to generate and challenge ideas before solution design sessions.",
        area: "INNOVATION", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Higher idea diversity in solution workshops; teams report fewer blind spots.",
        daysAgo: 4, status: "PENDING",
      },
    ],
  },

  // ── Parag Parekh — ADOPTER (target ~10.5 pts) ─────────────────────────────
  {
    email: "parag.parekh@ainablers.com",
    name: "Parag Parekh",
    role: "MEMBER",
    contribs: [
      {
        title: "Daily GitHub Copilot Usage",
        description: "Adopted GitHub Copilot as a daily coding companion for boilerplate generation, unit tests, and inline documentation across all active tickets.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "CAPGEMINI",
        benefit: "Personal coding velocity up 25%; boilerplate time down 40%.",
        daysAgo: 55, status: "APPROVED",
        validatorEmail: "ameet@ainablers.com", rating: 3,
        validatorNote: "Solid personal adoption with evidence of velocity improvement.",
      },
      {
        title: "AI Email Template Generator",
        description: "Created a set of 12 reusable ChatGPT prompts for common client communications, shared with the account team in a Notion playbook.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "BOTH",
        benefit: "Account team reports 30% faster email turnaround for standard scenarios.",
        daysAgo: 41, status: "APPROVED",
        validatorEmail: "pratik.sharma@ainablers.com", rating: 2,
        validatorNote: "Useful practical contribution. Good knowledge-sharing via the Notion playbook.",
      },
      {
        title: "AI Meeting Notes",
        description: "Started using Otter.ai for all internal meetings, exporting summaries to Confluence within 30 minutes of meeting end.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CAPGEMINI",
        benefit: "All meetings now have searchable records; follow-up action tracking improved.",
        daysAgo: 30, status: "APPROVED",
        validatorEmail: "subramanian.iyer@ainablers.com", rating: 3,
        validatorNote: "Good baseline adoption. Consistent behaviour with documented follow-through.",
      },
      {
        title: "AI Documentation Drafting",
        description: "Testing AI to generate first-draft technical documentation from code comments and function signatures.",
        area: "DELIVERABLE", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Expecting 50% reduction in documentation time for API endpoints.",
        daysAgo: 7, status: "PENDING",
      },
      {
        title: "AI Code Suggestions Experiment",
        description: "Experimenting with Copilot's inline suggestion mode for SQL query optimisation on a data migration task.",
        area: "DELIVERABLE", impact: "MEDIUM", scope: "CLIENT",
        benefit: "Preliminary tests show 20% faster query authoring.",
        daysAgo: 2, status: "PENDING",
      },
    ],
  },

  // ── Pratik Sharma — ADOPTER (target ~8 pts) ───────────────────────────────
  {
    email: "pratik.sharma@ainablers.com",
    name: "Pratik Sharma",
    role: "MEMBER",
    contribs: [
      {
        title: "Copilot Daily Adoption",
        description: "Began using GitHub Copilot for all new feature work — autocomplete, function generation, and inline comment-to-code conversion.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "CAPGEMINI",
        benefit: "Feature implementation tickets completing 20% faster in the last sprint.",
        daysAgo: 48, status: "APPROVED",
        validatorEmail: "rahul.kesarwani@ainablers.com", rating: 2,
        validatorNote: "Good first-step adoption. Impact evidence is early-stage but directionally positive.",
      },
      {
        title: "AI Email Drafting Assistant",
        description: "Using ChatGPT to draft and refine client-facing emails before sending, particularly for technically complex updates.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CLIENT",
        benefit: "Reduced email revision loops with the client from an average of 3 to 1.",
        daysAgo: 35, status: "APPROVED",
        validatorEmail: "nabil.tajmouti@ainablers.com", rating: 2,
        validatorNote: "Practical adoption. Reducing client revision loops is a real quality improvement.",
      },
      {
        title: "AI Standup Notes",
        description: "Using a custom ChatGPT prompt to format and clean up handwritten standup notes before posting them to Slack.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Standup notes are now consistently formatted and searchable; team appreciation increased.",
        daysAgo: 22, status: "APPROVED",
        validatorEmail: "ben.cocker@ainablers.com", rating: 3,
        validatorNote: "Small but consistent improvement in team communication quality.",
      },
      {
        title: "AI-Powered Test Plan",
        description: "Attempting to use AI to generate a structured test plan from user stories and acceptance criteria for the upcoming release.",
        area: "DELIVERABLE", impact: "HIGH", scope: "CAPGEMINI",
        benefit: "Expected to cut test plan authoring time by 60%.",
        daysAgo: 5, status: "PENDING",
      },
      {
        title: "AI Research Helper",
        description: "Using AI to summarise technical research papers and produce condensed briefing notes for the team.",
        area: "OTHER", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Team can consume research 3x faster via AI-condensed summaries.",
        daysAgo: 1, status: "PENDING",
      },
    ],
  },

  // ── Nabil Tajmouti — ADOPTER (target ~5 pts) ─────────────────────────────
  {
    email: "nabil.tajmouti@ainablers.com",
    name: "Nabil Tajmouti",
    role: "MEMBER",
    contribs: [
      {
        title: "GitHub Copilot Onboarding",
        description: "Completed onboarding for GitHub Copilot, worked through 5 guided exercises, and applied it on a real bug-fix ticket.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CAPGEMINI",
        benefit: "First productivity gains observed; resolved a complex bug 30 min faster than estimated.",
        daysAgo: 40, status: "APPROVED",
        validatorEmail: "varun.nadgouda@ainablers.com", rating: 3,
        validatorNote: "Good first step. Evidence of application on a real ticket is encouraging.",
      },
      {
        title: "AI Meeting Tool Trial",
        description: "Trialled Otter.ai for one sprint's worth of meetings, evaluated quality of summaries, and shared findings with the team.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Shared evaluation report helped the team choose Otter.ai over two competing tools.",
        daysAgo: 28, status: "APPROVED",
        validatorEmail: "parag.parekh@ainablers.com", rating: 2,
        validatorNote: "The comparative evaluation provides value beyond personal adoption.",
      },
      {
        title: "AI Research Prototype",
        description: "Building a small RAG prototype that queries internal knowledge bases using Ollama for local LLM inference.",
        area: "INNOVATION", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Exploring zero-egress AI tooling for sensitive data contexts.",
        daysAgo: 6, status: "PENDING",
      },
      {
        title: "AI Code Snippet Integration",
        description: "Tried using Copilot to generate reusable utility functions from docstring descriptions.",
        area: "DELIVERABLE", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Some snippets generated but required significant editing.",
        daysAgo: 15, status: "REJECTED",
        validatorEmail: "ameet@ainablers.com", rating: 1,
        validatorNote: "Insufficient evidence of productivity benefit. The snippets required more editing than writing from scratch — revisit with a clearer use case.",
      },
    ],
  },

  // ── Ben Cocker — ADOPTER (just getting started, ~3 pts) ──────────────────
  {
    email: "ben.cocker@ainablers.com",
    name: "Ben Cocker",
    role: "MEMBER",
    contribs: [
      {
        title: "First AI Tool Integration",
        description: "Set up GitHub Copilot on my dev machine, explored autocomplete and chat modes, and applied it to three tasks in the current sprint.",
        area: "PRODUCTIVITY", impact: "MEDIUM", scope: "CAPGEMINI",
        benefit: "Completed a feature ticket 1.5 hours faster than my usual estimate.",
        daysAgo: 28, status: "APPROVED",
        validatorEmail: "vivek.jain@ainablers.com", rating: 2,
        validatorNote: "Good starting point. Clear evidence of applying the tool on real work — keep building on this.",
      },
      {
        title: "AI Email Assistant Pilot",
        description: "Starting to use ChatGPT to draft first-pass emails for complex client communications.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CLIENT",
        benefit: "Hoping to reduce email drafting time and improve clarity.",
        daysAgo: 7, status: "PENDING",
      },
      {
        title: "AI Meeting Summariser",
        description: "Testing Otter.ai for the next two sprint ceremonies to evaluate its suitability for the team.",
        area: "PRODUCTIVITY", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Will inform a team-wide decision on meeting intelligence tooling.",
        daysAgo: 3, status: "PENDING",
      },
      {
        title: "Exploratory AI Use",
        description: "Using AI chatbots to help research unfamiliar technologies and summarise Stack Overflow threads during debug sessions.",
        area: "OTHER", impact: "LOW", scope: "CAPGEMINI",
        benefit: "Faster context-gathering when debugging in unfamiliar codebases.",
        daysAgo: 1, status: "PENDING",
      },
    ],
  },
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...\n")

  // 1. Badges
  for (const badge of BADGE_DEFINITIONS) {
    await db.badge.upsert({
      where: { key: badge.key },
      update: { name: badge.name, description: badge.description, icon: badge.icon, rarity: badge.rarity },
      create: badge,
    })
  }
  console.log(`✓ ${BADGE_DEFINITIONS.length} badges seeded\n`)

  // 2. Admin accounts
  const adminPw   = await bcrypt.hash("admin123!", 12)
  await db.user.upsert({ where: { email: "admin@ainablers.com" },     update: {}, create: { name: "Admin",     email: "admin@ainablers.com",     password: adminPw, role: "ADMIN" } })
  await db.user.upsert({ where: { email: "validator@ainablers.com" }, update: { role: "ADMIN", name: "Team Lead" }, create: { name: "Team Lead", email: "validator@ainablers.com", password: adminPw, role: "ADMIN" } })
  console.log("✓ admin@ainablers.com     / admin123! (ADMIN)")
  console.log("✓ validator@ainablers.com / admin123! (ADMIN — Team Lead)\n")

  // 3. Remove old placeholder test users (from previous seed run)
  const OLD_EMAILS = [
    "sarah.chen@ainablers.com", "marcus.williams@ainablers.com", "priya.patel@ainablers.com",
    "james.obrien@ainablers.com", "emma.rodriguez@ainablers.com", "david.kim@ainablers.com",
    "fatima.hassan@ainablers.com", "tom.brennan@ainablers.com", "lisa.mueller@ainablers.com",
    "raj.sharma@ainablers.com",
  ]
  for (const email of OLD_EMAILS) {
    const old = await db.user.findUnique({ where: { email } })
    if (!old) continue
    const cids = (await db.contribution.findMany({ where: { submitterId: old.id }, select: { id: true } })).map((c) => c.id)
    await db.validation.deleteMany({ where: { contributionId: { in: cids } } })
    await db.userBadge.deleteMany({ where: { userId: old.id } })
    await db.contribution.deleteMany({ where: { submitterId: old.id } })
    await db.user.delete({ where: { id: old.id } })
    console.log(`  Removed old placeholder: ${email}`)
  }

  // 4. Upsert team members
  const memberPw = await bcrypt.hash("member123!", 12)
  const userMap = new Map<string, string>() // email → id

  for (const u of USER_SEEDS) {
    const record = await db.user.upsert({
      where:  { email: u.email },
      update: { name: u.name, role: u.role },
      create: { name: u.name, email: u.email, password: memberPw, role: u.role },
    })
    userMap.set(u.email, record.id)
  }

  console.log(`\n✓ ${USER_SEEDS.length} team members upserted`)

  // 5. For each user, wipe existing contributions + validations + badges, then recreate
  for (const u of USER_SEEDS) {
    const userId = userMap.get(u.email)!
    const cids   = (await db.contribution.findMany({ where: { submitterId: userId }, select: { id: true } })).map((c) => c.id)
    await db.validation.deleteMany({ where: { contributionId: { in: cids } } })
    await db.userBadge.deleteMany({ where: { userId } })
    await db.contribution.deleteMany({ where: { submitterId: userId } })

    let totalScore = 0
    const approvedContribs: Array<{ area: string; status: string; rating?: number | null }> = []

    for (const c of u.contribs) {
      const createdAt = new Date(Date.now() - c.daysAgo * 86_400_000)
      const contrib   = await db.contribution.create({
        data: {
          title:       c.title,
          description: c.description,
          area:        c.area,
          benefit:     c.benefit,
          impact:      c.impact,
          scope:       c.scope,
          status:      c.status,
          submitterId: userId,
          createdAt,
          updatedAt:   createdAt,
        },
      })

      if ((c.status === "APPROVED" || c.status === "REJECTED") && c.validatorEmail && c.rating !== undefined) {
        const validatorId = userMap.get(c.validatorEmail)
        if (validatorId) {
          const validatedAt = new Date(createdAt.getTime() + (1 + Math.random() * 3) * 86_400_000)
          await db.validation.create({
            data: {
              contributionId: contrib.id,
              validatorId,
              decision:   c.status === "APPROVED" ? "APPROVED" : "REJECTED",
              rating:     c.rating,
              note:       c.validatorNote ?? null,
              createdAt:  validatedAt,
            },
          })

          if (c.status === "APPROVED") {
            totalScore += calcScore(c.area, c.impact, c.rating)
          }
        }
      }

      approvedContribs.push({ area: c.area, status: c.status, rating: c.rating ?? null })
    }

    const persona = derivePersona(totalScore)
    await db.user.update({ where: { id: userId }, data: { personaScore: totalScore, persona } })

    // Award badges
    const badgeKeys = calcBadges(approvedContribs, totalScore, persona)
    if (badgeKeys.length > 0) {
      const badges = await db.badge.findMany({ where: { key: { in: badgeKeys } } })
      for (const badge of badges) {
        await db.userBadge.upsert({
          where:  { userId_badgeId: { userId, badgeId: badge.id } },
          update: {},
          create: { userId, badgeId: badge.id },
        })
      }
    }

    const approvedCount = approvedContribs.filter((c) => c.status === "APPROVED").length
    console.log(`  ${u.name.padEnd(22)} | ${persona.padEnd(12)} | score ${String(Math.round(totalScore)).padStart(4)} | ${approvedCount} approved | ${badgeKeys.length} badges`)
  }

  console.log("\n✨ Seed complete!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
