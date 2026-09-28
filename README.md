# Supanova Labs: paid build task

## Your mission: Calibration-profile editor with live preview

Build: Edit per-project weights; see the re-ranking a change causes before saving.

Server work: Deterministic re-rank on the server; save versioned profiles.

How would you explain to a non-technical founder what a weight change did?

You have been invited to the paid stage. This is real work on a real internal product. We pay ₹1,000 for a completed submission, whether or not we take you further.

## Context: the product you are building on

We run several products and client engagements in parallel. The record of that work arrives as exhaust: meeting notes and transcripts, recordings, chat threads, files dropped in a folder. **Inbox** is our internal system that detects each of those signals, gives it a stable identity, routes it to the right project, and records it in one ledger. A deterministic core does detection and routing; an AI step drafts the judgement work; a human approves anything that gets committed.

Inbox works today and is used daily, but it has **no interface at all**. Everything happens through command-line tools and a JSON ledger. That is the gap you are filling: the first piece of its visual control plane.

This repository is private to you. It holds a **synthetic ledger** in [`fixture/`](fixture/) (invented projects, people and meetings) with the same shape as the real one, and a short data-model note in [`fixture/README.md`](fixture/README.md). You will never touch live or client data, and nothing you build is deployed to production during this task.

## Your assignment

Your mission is in your Internshala invite. It names what to build and the server work it needs, and asks one question.

Every mission needs three things:
1. **A usable interface.** Someone who has never seen the data should understand the screen in ten seconds and be able to act on it.
2. **Back-end connective tissue.** The fixture pack is your back end's data: read the JSON ledger through your own server routes, and where your mission writes, write through a single guarded path with validation, never straight from the browser. There is no API to integrate with; designing that server layer is part of the task.
3. **A product decision, made and defended.** Your mission hides at least one product decision we have not made. Find it, make it, and tell us why in your walkthrough.

## Stack

**The stack is your choice.** We are not asking for a particular framework, language or runtime, and no choice scores better than another. We care about clarity, states and judgement, not a house style.

Four things do matter, whatever you pick:

- It runs on our machine from a clean clone, with the commands in your README and nothing else installed by hand.
- The fixture pack is read through your own server layer, not imported straight into a browser component.
- Where your mission writes, it writes through one guarded, validating path.
- Persist to a local file or an embedded database. No cloud services, no accounts, no secrets, nothing that needs an API key.

## Use AI freely

We expect it. You are accountable for what you ship, so be able to explain any line of it. Part of what we are assessing is *how* you work with an agent: how you plan, how you split front-end from back-end, how you check the output, and how you catch the agent being confidently wrong.

## What to submit

By the deadline in your invite message, reply in the Internshala chat with:

1. **Your own GitHub repo** (public, or private and shared with GitHub user `supanova-furney`), with PR-style history. Build there, not in this repository. Work on a branch, open at least one pull request, and write commit messages someone else can follow. It must run locally from a clean clone, and the README must give the exact commands (install, then run) for whatever you built it with. In the README, also tell us roughly how long you spent.
2. **A 5 to 8 minute face-on walkthrough video.** You on camera, showing what you built, the product decision you made and why, one thing you would do next, and one thing you got wrong.
3. **A full-screen recording of the build itself, 30 to 60 minutes**, from the moment you start. Show your actual workflow: which agent or harness and model, how you planned, how you moved between front-end and back-end, how you verified. Speeding up or silence is fine; narration is not required.

Both videos as **unlisted YouTube links**, kept available for at least 60 days.

**Build as much as you think the problem deserves.** If you run out of time, ship what works and tell us what you cut.

## How we assess it

| What we look at | Weight |
|---|---|
| How you work with agents: planning, splitting work, verifying, catching errors | 20% |
| Front-end vs back-end judgement: what lives where, what you chose not to build | 20% |
| Product thinking: the decisions you found and made, and your reasoning | 20% |
| Code quality: readable, sensibly structured, honest error and empty states | 20% |
| Communication: the walkthrough, the README, the PR | 20% |

## Consent, credit and IP

Your submission and recordings are reviewed internally by Supanova only and are deleted within 60 days of the process closing. You keep authorship credit for what you build and the repo stays yours. Ideas explored in this task may inform and inspire Supanova's work. Please do not include confidential information from anyone else's employer or coursework.

## Payment

₹1,000 for a completed submission: all three links in by the deadline, a repo with your own code in it, a build recording of at least 30 minutes, and the walkthrough. Paid within five working days of the deadline by UPI or bank transfer; we will ask for your details after you submit, through Internshala. A submission that ignores solving the problem is not paid.

## Questions

Reply on Internshala. We answer questions about the brief, not about how to build it: the point is to see how you handle an unclear problem.
