import type { Report } from "@/lib/report-types";

export const sampleReport: Report = {
  title: "Sierra Agent Strategist Interview Prep",
  subtitle:
    "A mock prep pack showing the target report structure, reading experience, source-aware guidance, and export behavior.",
  sourceCount: 4,
  sections: [
    {
      id: "candidate-thesis",
      title: "Candidate Thesis",
      summary:
        "The strongest angle is commercial strategy plus practical AI workflow execution, not generic enthusiasm for AI.",
      evidence: [{ sourceType: "resume", confidence: "high" }],
      callouts: [
        {
          type: "say_this",
          title: "Core positioning",
          content:
            "I help turn ambiguous customer and business problems into structured workflows that teams can actually ship.",
          evidence: [{ sourceType: "resume", confidence: "high" }],
        },
        {
          type: "avoid_this",
          title: "Weak framing",
          content:
            "Do not lead with broad excitement about AI. Anchor the answer in customer problems, operating models, and measurable outcomes.",
          evidence: [{ sourceType: "inference", confidence: "medium" }],
        },
      ],
      subsections: [
        {
          id: "core-pitch",
          title: "30-second pitch",
          contentMarkdown:
            "My background sits between strategy, customer discovery, and execution. For this role, I would position myself as someone who can understand messy client workflows, identify where an agent should or should not be used, and translate that into a practical rollout plan.",
          evidence: [{ sourceType: "resume", confidence: "high" }],
        },
      ],
      tables: [
        {
          title: "What to Emphasize",
          columns: ["Theme", "Why it matters", "Proof to prepare"],
          rows: [
            [
              "Ambiguity",
              "Agent strategy roles often begin with unclear customer workflows.",
              "A story where you created structure from a vague business problem.",
            ],
            [
              "Stakeholders",
              "The role likely touches commercial, product, and technical teams.",
              "A story where you aligned teams with different incentives.",
            ],
          ],
        },
      ],
    },
    {
      id: "company-snapshot",
      title: "Company Snapshot",
      summary:
        "Use the company context to show you understand why agent design is a business problem, not only a technical problem.",
      evidence: [{ sourceId: "source-1", sourceType: "user_source", confidence: "medium" }],
      callouts: [
        {
          type: "source_note",
          title: "Evidence label",
          content:
            "In the real workflow, company facts must be tied to user sources, web sources, or clearly marked as inference.",
          evidence: [{ sourceType: "inference", confidence: "high" }],
        },
      ],
      subsections: [
        {
          id: "what-company-does",
          title: "What to understand",
          contentMarkdown:
            "Prepare a plain-English explanation of the company, the customer problem, the buying audience, and why the role exists now. If a fact is not sourced, treat it as a hypothesis to verify in the interview.",
        },
      ],
      tables: [],
    },
    {
      id: "role-interpretation",
      title: "Role Interpretation",
      summary:
        "The likely job is to translate business context into agent strategy, implementation priorities, and customer confidence.",
      callouts: [
        {
          type: "remember",
          title: "Hidden expectation",
          content:
            "They may be testing whether you can be credible with executives and useful to builders in the same week.",
        },
      ],
      subsections: [
        {
          id: "success-metrics",
          title: "Likely success metrics",
          contentMarkdown:
            "- Quality of customer discovery\n- Clarity of agent workflow recommendations\n- Speed from problem framing to implementation plan\n- Stakeholder confidence during rollout",
        },
      ],
      tables: [],
    },
    {
      id: "source-insights",
      title: "Source Library Insights",
      summary:
        "The report should turn source material into interview actions rather than summarizing it passively.",
      callouts: [
        {
          type: "example",
          title: "Good source translation",
          content:
            "If a source says enterprise customers are a focus, connect that to stakeholder management, security concerns, rollout planning, and change management.",
        },
      ],
      subsections: [
        {
          id: "source-actions",
          title: "How to use sources",
          contentMarkdown:
            "Pull phrases from recruiter notes and company materials into your answers. The strongest use of source material is to make your questions sharper and your examples more relevant.",
        },
      ],
      tables: [],
    },
    {
      id: "candidate-fit",
      title: "Candidate Fit and Pitch",
      summary:
        "The fit section should map resume evidence to role needs and prepare direct responses to likely objections.",
      callouts: [
        {
          type: "risk",
          title: "Likely objection",
          content:
            "If the candidate lacks direct agent implementation experience, answer with adjacent evidence: workflow design, customer discovery, stakeholder alignment, and technical collaboration.",
        },
      ],
      subsections: [],
      tables: [
        {
          title: "Fit Map",
          columns: ["Role need", "Candidate evidence", "Interview implication"],
          rows: [
            [
              "Customer workflow diagnosis",
              "Strategy and operating model work",
              "Prepare one example with messy inputs and a clear final recommendation.",
            ],
            [
              "Cross-functional execution",
              "Work across commercial and technical stakeholders",
              "Show how you make progress without owning every function.",
            ],
          ],
        },
      ],
    },
    {
      id: "likely-questions",
      title: "Likely Interview Questions",
      summary:
        "Questions should be role-specific and include what the interviewer is testing.",
      callouts: [],
      subsections: [],
      tables: [
        {
          title: "Questions to Prepare",
          columns: ["Question", "What they are testing", "Answer angle"],
          rows: [
            [
              "Tell me about a time you turned an ambiguous problem into a plan.",
              "Structured thinking and execution judgment.",
              "Use a STAR story with explicit tradeoffs and measurable outcome.",
            ],
            [
              "How would you decide whether a workflow should use an AI agent?",
              "Product judgment and practical AI understanding.",
              "Discuss user need, risk, data availability, fallback paths, and ROI.",
            ],
          ],
        },
      ],
    },
    {
      id: "questions-to-ask",
      title: "Questions to Ask Them",
      summary:
        "Strong questions should make the candidate sound commercially alert and operationally useful.",
      callouts: [
        {
          type: "say_this",
          title: "Best closing question",
          content:
            "What would make the first six months in this role clearly successful from your perspective?",
        },
      ],
      subsections: [],
      tables: [
        {
          title: "By Interviewer Type",
          columns: ["Interviewer", "Question"],
          rows: [
            ["Recruiter", "What signals are most important in this stage of the process?"],
            ["Hiring manager", "Where does this role need to create clarity first?"],
            ["Executive", "What customer or market shift makes this role especially important now?"],
          ],
        },
      ],
    },
    {
      id: "plan",
      title: "30/60/90-Day Plan",
      summary:
        "The plan should show a bias toward learning the business, finding leverage, and building an operating cadence.",
      callouts: [],
      subsections: [
        {
          id: "first-30",
          title: "First 30 days",
          contentMarkdown:
            "Learn the customer workflows, shadow live examples, understand stakeholder expectations, and identify the first few places where clearer agent strategy could reduce friction.",
        },
        {
          id: "first-90",
          title: "By 90 days",
          contentMarkdown:
            "Own a meaningful workstream, establish a repeatable discovery-to-recommendation process, and show measurable progress on one priority customer or internal workflow.",
        },
      ],
      tables: [],
    },
    {
      id: "risks",
      title: "Risks, Gaps, and Red Flags",
      summary:
        "This section helps the candidate prepare for objections and assess whether the opportunity is well-scoped.",
      callouts: [
        {
          type: "risk",
          title: "Scope risk",
          content:
            "Ask how the company separates strategy, implementation, customer success, and product responsibilities.",
        },
      ],
      subsections: [],
      tables: [],
    },
  ],
  cheatSheet: {
    title: "Final Cheat Sheet",
    contentMarkdown:
      "- **Thesis:** I turn ambiguous workflows into clear, shippable agent strategies.\n- **Proof points:** ambiguity, stakeholder alignment, execution discipline.\n- **Ask them:** what success looks like after six months.\n- **Avoid:** generic AI enthusiasm without business context.\n- **Remember:** tie every answer back to customer workflow quality and operational impact.",
  },
};
