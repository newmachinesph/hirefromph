# Tagalog TL;DR review

Every "TL;DR sa Tagalog" block on this site is a **draft translation**. It was
written inside this project, not by a native speaker, and the site says so on
every one of them until this checklist is cleared.

Source of truth: `data/tldr.json`, shape `{ routes: { "<route>": { tl, reviewed } } }`.
Component: `components/practice/tldr.tsx`. While `reviewed` is `false` the block
renders a "Draft translation" badge and a caption pointing the reader at the
English.

## What to check, per row

1. **Meaning matches.** Read the English page first, then the TL;DR. The Tagalog
   must not add a claim, drop a caveat, or soften a warning the English makes.
2. **Register.** Conversational Tagalog with the English loanwords a Filipino
   remote worker actually uses (client, tracker, application, rate). Not textbook
   Filipino, not straight translation of English idiom.
3. **No invented numbers.** If the English carries a figure with a source, the
   Tagalog carries the same figure. If the English says nobody knows, the Tagalog
   says `walang nakakaalam`, not a guess.
4. **Never "virtual assistant".** Use `online professional` or `remote
   professional`, in English, as the site does everywhere else.
5. **Length.** 60–90 words. Shorter loses the point; longer stops being a TL;DR.
6. **Terminology is consistent across routes.** Pick one rendering per term and
   use it in all 18. Note your choice in the Terminology table below.

## How to clear a row

1. Edit `data/tldr.json` → `routes["<route>"].tl` if the text needs changing.
2. Set `routes["<route>"].reviewed` to `true`.
3. Run `npx vitest run components/practice/tldr.test.tsx`. The third test,
   `keeps every shipped TL;DR flagged for review`, **will fail** — that test is
   the tripwire for exactly this moment. Update it to assert the reviewed set
   you intend, in the same commit.
4. Run `npm run verify:all && npm test`.
5. Commit with the reviewer's initials in the message, e.g.
   `content(tldr): native-speaker review of /start and /get-hired (JD)`.

## Rows

| # | Route | English page | Words | Reviewed | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `/start` | Stage 1 · Start Right | 80 | ☐ | | | |
| 2 | `/get-hired` | Stage 2 · Get Hired | 79 | ☐ | | | |
| 3 | `/deliver` | Stage 3 · Deliver | 79 | ☐ | | | |
| 4 | `/level-up` | Stage 4 · Level Up | 78 | ☐ | | | |
| 5 | `/own` | Stage 5 · Own | 79 | ☐ | | | |
| 6 | `/method` | The Method | 76 | ☐ | | | |
| 7 | `/learn` | How to Learn | 75 | ☐ | | | |
| 8 | `/reality` | Reality Check | 78 | ☐ | | | Carries sourced figures — check every one against the English |
| 9 | `/conduct` | Conduct & Integrity | 86 | ☐ | | | Longest row; trim toward 80 if it reads heavy |
| 10 | `/english` | English at Work | 75 | ☐ | | | About English, written in Tagalog — watch the register |
| 11 | `/indispensable` | Become Indispensable | 80 | ☐ | | | |
| 12 | `/ai-first` | AI-First | 81 | ☐ | | | Keep tool names in English |
| 13 | `/legit` | Get Legit | 75 | ☐ | | | BIR, 8%, SSS, PhilHealth stay as the agencies write them |
| 14 | `/salary` | Salary Guide | 73 | ☐ | | | Vendor-grade data must still read as vendor-grade |
| 15 | `/markets` | Client Markets | 77 | ☐ | | | |
| 16 | `/languages` | Languages | 76 | ☐ | | | |
| 17 | `/resources` | Resource Shelf | 73 | ☐ | | | |
| 18 | `/portfolio` | Portfolio Ladder | 75 | ☐ | | | |

## Terminology

Fill this in as you go, so row 18 uses the same words as row 1.

| English | Agreed Tagalog / Taglish | Decided on row |
|---|---|---|
| online professional | (keep in English) | — |
| client | | |
| rate | | |
| application | | |
| follow-up | | |
| portfolio piece | | |
| red flag | | |
