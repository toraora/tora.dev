---
title: "Mystery Hunt 2023: Technology"
description: "A look into the tech behind Mystery Hunt 2023, from a teammate on teammate"
publishDate: "Jan 27, 2022"
---

_(note: this contains very minor spoilers, but nothing by name)_

## Pre-hunt: Writing and Editing

Managing the puzzle production process for an event the scale of Mystery Hunt is a massive challenge. Aside from just tracking and shepherding 100+ puzzles through a state machine with 30 nodes, one of the highest priorities during writing is keeping as many of the limited pool of testsolvers unspoiled. To those ends, tooling like [Puzzletron](https://github.com/mysteryhunt/puzzle-editing/) and [Puzzlord](https://github.com/galacticpuzzlehunt/puzzlord) are traditionally employed to oversee the process. This year, teammate used a fork of Puzzlord, with added features like:

- automatic management of Discord channels for individual puzzles and testsolving sessions
- one-click postproduction of puzzles that don't have interactivity or other complex needs

After some rest, we do plan on extricating the changes that are broadly useful and submitting them back upstream into Puzzlord for other teams to take advantage of.

## Hunt Website

[tph-site](https://github.com/teammatehunt/tph-site), the core technology behind this year's Hunt website, is largely unchanged from previous teammate events. Past technical write-ups can be found [here (2020)](https://2020.teammatehunt.com/wrapup#tech) and [here (2021)](https://2021.teammatehunt.com/wrapup#technical-details). From a traffic scaling perspective, Mystery Hunt (with just shy of 5000 participants) isn't significantly larger than the largest online puzzlehunts. We were able to get away with running the entirety of Hunt — reverse proxy, frontend, backend, database, caching layer, task queue — all off of a single rather beefy cloud server as we normally do...

### ... mostly.

Anyone who has run large events knows that things don't go to plan, and that backup plans are important, and sometimes backup plans for your backup plans even more so. Regarding this Hunt and "things that didn't go to plan," there's an elephant in the room that I'm going to avoid discussing to instead focus on some specific technical difficulties we ran into.

We hit a technical snafu in the wee hours of hunt that manifested as the occasional slow or failed page load. There were no obvious bottlenecks in terms of CPU or memory usage, so we figured we were running up against some kind of artificial limit. We had already anticipated this in a few places and had deployed PgBouncer to pool connections to the database. Armed with a hypothesis, we poked around at things like Caddy configurations and counting file descriptors before eventually finding the culprit to be Redis' default connection limit of 10,000.

See, even though the number of participants hadn't grown by more than an order of magnitude, the number of sessions to our backend had — not only did each browser tab contribute a persistent websocket connection (you may have noticed that each tab would independently play the solved puzzle jingle, sorry for the noise), but our addition of a chatbot also resulted in an additional websocket per tab. And those doing Mystery Hunt tend to have _a lot_ of tabs open, not to mention teams that have developed their own hunt tooling that embeds the Hunt website.

Thankfully we were able to locate the issue and patch it before teams reached breakout, and now on the to-do list is better monitoring to get ahead of issues like this. Technically, the remainder of Hunt was smooth sailing until late Sunday night when around a dozen teams were concurrently trying to play a certain roguelike.

Reports that the game was laggy began to roll in, with some teams eventually reporting that the stuttering was actually making the game impossible to win within the time constraints. Remember the improvements to monitoring I just mentioned? We would really have liked them here, since no amount of looking at the metrics we had available to us or sifting through source code were getting us closer to a root cause. At some point we cut our losses and pulled out the tried and true solution of throwing money at the problem — we simply propped up a second Hunt server and migrated some teams over to it. Big kudos to the tech people on-call for cleanly executing this while sleep-deprived and under pressure.

### Accessibility

We got a number of early reports about accessibility issues with the Hunt website. Another huge thanks out to the community for being really on top of this blind spot of ours. After dealing with the Redis issue, a number of the tech team spent Friday afternoon quickly attempting to implement accessibility suggestions. In retrospect, two primary factors complicated our attempts to fully adhere to accessibility best-practices:

- while we did have a final accessibility signoff as part of postproduction, it was not comprehensive and we didn't have a dedicated accessibility champion to oversee the effort
- some of our puzzles, rounds, and overall web design were technically complex and we didn't have the expertise or time to iron out all of the accessibility issues (or even regular issues in many cases)

I want to reiterate the previous point a little bit, because getting things to work at all for us was already _really hard_. Hunt tech itself was already a patchwork mess of hacks, and the way we made things accessible was often yet another pile of hacks, and hacks on top of hacks is a complete nightmare to work with. As an example, the Puzzle Factory is a side-scrolling point-and-click experience implemented directly in the browser. We hotfixed an issue with not being able to use arrow keys to scroll in Factory puzzles, and in doing so we simultaneously broke copy-to-clipboard (the button ended up outside of the viewport) and the ability to print puzzles (we didn't even know until it was reported after wrap-up).

![css hell](/assets/images/css.png)

### Miscellaneous Stats

- 6,800+ CI builds, each taking ~10 minutes
- 1,700+ pull requests merged to the main repository
- 180,000+ significant lines of Typescript
- 32,000+ significant lines of Python

## Hunt Ops / HQ

Being back on campus in person felt amazing, and the weather even (mostly) cooperated! There were a mountain of logistical challenges to overcome to make things happen, and once again I'll mostly focus on the more technical ones.

### You've heard of SlackOps, now get ready for...

DiscordOps! Pretty much all aspects of HQ were organized through Discord. A natural extension of hooking up all of your hunt-writing software to Discord is that the same is probably true of your hunt-running software — every answer submission, hint request, story progression, and really just about anything made its way to a Discord channel in real-time. Due to the sheer number of people HQ needed to coordinate and the asynchronous nature of running, eating, sleeping, and so on, we found text communications to be the most effective, with simply yelling in-person coming in second. This means that HQ operations were largely unaffected by the untimely realization that Discord voice didn't work on the MIT guest network, the unfortunate consequence of a network-wide upgrade that happened just hours before kick-off. We do realize that it affected many teams' ability to work remotely though, and hope that there is a clear solution before next year's Hunt.

### On Hunt Phones

There's already plenty of differing opinion over Mystery Hunt's tradition of phone callbacks, so I'd just like to offer some practical considerations here. The most obtuse hint that teammate just isn't the right team to operate phones was the staggering number of person hours it took for us to find and set up the Contact HQ phone (true story!):

1. Grab a phone from storage and plug it in incorrectly
2. Randomly try different wall sockets until it finally works
3. Discover that the phone we grabbed has the wrong number
4. Find 11 more phones in storage
5. Despair about plugging them in one-by-one to find the correct one, since it was raining and there was no Ethernet nearby
6. Find that the phones are labeled and rejoice
7. Despair about not finding the correct number on any of the phones
8. Contact Puzzle Club to find the MAC address mapped to the correct phone number
9. Locate phone with said MAC address
10. Discover later that the phones are each labeled with multiple numbers, presumably because multiple people had done the same thing before us and tried to be helpful
11. Discover later that the mapping between MAC address and phone number is configurable
12. Discover later that said configuration works sporadically at best, as does call forwarding (important for HQ closure between 1 and 6 AM)

While this is meant partially in jest, and realistically callbacks can be done with an army of cell phones, it was unanimously clear to us that teammate was not the team to do it. It would have major implications on another big reason we don't operate phones:

### Hints!

Anyone at HQ without another job, as well as a sizable remote group of people, was put onto hint duty. There was simply no spare capacity to operate phones unless we significantly compromised on hinting, something we were not willing to do to ensure less experienced teams had a better experience. We probably averaged 6-8 people manning the hint queue at all times of day, even during HQ closure between 1 and 6 AM. Part of that was how much fun we were having and the creativity some teams put into their requests, so thanks everyone for entertaining us!

![zappy hint](/assets/images/hint.png)

Hints are handled by an internal tool called Spoilr that gets passed from writing team to writing team, which provides hinters with the full history of a hint request. And in addition to verifying correctness, we mandated that all puzzles must have complete solutions written prior to kick-off in order to facilitate hinting. Together with a half-dozen or so canned hints per puzzle, this meant that we were able to respond to more than 5,000 hint requests in ways that hopefully both were contextually appropriate and didn't spoil major beats.

## Post-hunt: Archival and Open Source

Broadly useful features will be backported to the open-source projects [Puzzlord](https://github.com/galacticpuzzlehunt/puzzlord) and [tph-site](https://github.com/teammatehunt/tph-site) soon&#8482;. Archival of the 2023 Mystery Hunt will follow with no promised timeline, and in the meantime you can use Public Access to enjoy the [museum exhibits](https://interestingthings.museum/).

## Closing Thoughts

Tech has encroached just about all aspects of our lives, and Mystery Hunt is no exception. The Hunt website may once have just been another piece of the puzzle, but contemporary expectations effectively mandate that it be the central delivery mechanism of the Hunt experience. Here on teammate we're gifted to have a large contingent comfortable working in software in order to make that happen, and that's also part of what enables and drives us to be more ambitious on the technical side of things.

This is certainly not true of all teams, and I want to (personally) emphasize to future creators that you need not one-up or even meet previous writing teams in all aspects. You should feel empowered to create the event that you want and feel equipped to handle, and I believe the Hunt community should be supportive in that pursuit. The areas of Hunt in which teammate compromised on this year were out of a sharp focus on what we feel most passionate about: breaking norms in structure and storytelling through tight integration between art and technology.
