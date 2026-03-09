# Antigravity Agent Template

This template initializes an AI-driven workspace using the **3-Layer Agentic Architecture**. Use this to ensure high reliability and consistency in your projects.

## How to Initialize a New Project

1. **Copy the `.agent` folder** into your new project's root directory.
2. **Open the project** in Antigravity.
3. **Prompt the Agent**: *"I have initialized this project with the Agent Template. Read `.agent/AGENTS.md` and let's get started."*

## The 3-Layer Structure

Once initialized, your project should follow this organization:

- `directives/`: Standard Operating Procedures (SOPs) in Markdown. Tell the agent *what* to do here.
- `execution/`: Deterministic Python/Node scripts. This is where the actual work happens. 
- `.agent/`: The core reasoning instructions (already included).
- `.tmp/`: A folder for intermediate files (do not commit to git).

## Core Principles

1. **Be Deterministic**: Don't let the AI "guess" complex logic. Create a script in `execution/` and have the AI run it.
2. **Update Directives**: Treat `directives/` as a living document. If the agent learns a new edge case, update the directive.
3. **Pragmatism**: The AI is the glue (Orchestration) between human intent (Directives) and code (Execution).
