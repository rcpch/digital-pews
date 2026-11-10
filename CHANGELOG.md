# Changelog

Notable development changes, generated with git-cliff from conventional commits.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
All 0.x releases are development prereleases, not clinical deployment approvals.

## [Unreleased]


### Added
- enhance observation data and UI layout ([e41148a](https://github.com/rcpch/digital-pews/commit/e41148a68b877c978daf05152183cb1053dd7685))
- add script to start Storybook in development mode ([c523f73](https://github.com/rcpch/digital-pews/commit/c523f734cee306287618a2c71cd2624395de6750))
- add Docker Compose script to serve chart-ui app and Storybook ([c7eb418](https://github.com/rcpch/digital-pews/commit/c7eb418d07b10650041325c940f4ea3f2911a115))
- add docker-compose configuration for demo and Storybook servers ([0f7ecbe](https://github.com/rcpch/digital-pews/commit/0f7ecbe23103f9e946e7fd7308f77d07c1a1c141))
- add comprehensive NPEWS data model documentation ([048dc63](https://github.com/rcpch/digital-pews/commit/048dc631dbbf9e54bfff1793147546484386d187))
- add script to run Storybook locally with automatic dependency installation ([f61022c](https://github.com/rcpch/digital-pews/commit/f61022cfd1aa9527550ddb7e01d09699b0c20996))
- canonical JSON scoring spec with generator and drift guards ([4999c70](https://github.com/rcpch/digital-pews/commit/4999c70377c54254fa7e2d170176c7410c9c523a))
- add FHIR chart adapter and conformance test harness ([bd7e26b](https://github.com/rcpch/digital-pews/commit/bd7e26b654c50fbf67b30d28ad53d9dd60c345b1))
- wire scorer, canonical age bands and seamless boundary crossing ([8387858](https://github.com/rcpch/digital-pews/commit/83878584487f1591758d4dfea565205169f77f94))
- replace Storybook with a bespoke scenario harness ([05eaab3](https://github.com/rcpch/digital-pews/commit/05eaab3b033f1f0ef83ee4c214c54ec25d5b4f34))
- add framework-neutral &lt;npews-chart&gt; Web Component ([e5fba65](https://github.com/rcpch/digital-pews/commit/e5fba652de54b07f4a37799b09908feef52f7c0a))
- add theme picker, RCPCH branding, and visual probe pages ([07c426a](https://github.com/rcpch/digital-pews/commit/07c426a51831d5fbdb1b7e436a641ae2d0861a88))
- add minimal embed example.html in chart&#x2F; ([2286ea8](https://github.com/rcpch/digital-pews/commit/2286ea8eaa500a70ad454b4920060a3db8e55f1c))
- add CONTRIBUTING.md, SECURITY.md, issue templates, and GitHub Pages demo ([e3ff776](https://github.com/rcpch/digital-pews/commit/e3ff77689d9120b6e1e27f1e9c981804f22786eb))
- add timeline scrubber for scrolling through PEWS scores ([15626e7](https://github.com/rcpch/digital-pews/commit/15626e7afbb45649383a1f958b133c44eb437ff4))
- add time windows and escalation triggers ([e3c3ebb](https://github.com/rcpch/digital-pews/commit/e3c3ebb19a4caf6e154f57f28cbe9d4fa01cc8fc))
- make demographics header optional ([c95558a](https://github.com/rcpch/digital-pews/commit/c95558a76f881bfa5a5568cfebcdeb8d5f659c1e))
- keep patient status visible ([0fd012d](https://github.com/rcpch/digital-pews/commit/0fd012d78886f825615118a30368df63ad1948f5))
- complete non-score escalation handling ([3fed61c](https://github.com/rcpch/digital-pews/commit/3fed61cc0e829e8a9a5dda929891bd4fc42ddcb7))
- use specific concern criteria ([eeb5bec](https://github.com/rcpch/digital-pews/commit/eeb5beca38faa7a2912f97bd58262501bd7bf242))
- add source-derived scorer vectors (R11) ([144de73](https://github.com/rcpch/digital-pews/commit/144de73e1fd181c4504b65e14d42369ccf3df4f8))
- add typed presentation options (R23) ([917ae89](https://github.com/rcpch/digital-pews/commit/917ae8991d97291f676659a44fc31bb5127b846b))
- display component version in toolbar (R60) ([e0c19ca](https://github.com/rcpch/digital-pews/commit/e0c19ca49939cde5ca138397c316441b1a86909f))
- add Zensical site with guided demo scenarios ([6d2ed9f](https://github.com/rcpch/digital-pews/commit/6d2ed9f878b14230383ec6943f065fc6dda3b0f1))


### Changed
- restructure data handling and remove legacy data.js ([7bebf07](https://github.com/rcpch/digital-pews/commit/7bebf07a47a8b6b7bd06c9deac6c1101eee4c6b1))
- make the chart a props-driven visualisation component ([8e8516b](https://github.com/rcpch/digital-pews/commit/8e8516b4d913c92bdf412916ad0686b839f1f8c3))
- split pews-chart&#x2F; into chart&#x2F; (component) and demo&#x2F; (harness) ([fddb56d](https://github.com/rcpch/digital-pews/commit/fddb56ddfea3c8811272f93be7fbc2c614d832cf))
- remove non-functional toolbar controls, add generic AGENTS.md ([66fd4c5](https://github.com/rcpch/digital-pews/commit/66fd4c591bd02ec909bc9066aff6e6a3836fff9c))
- decouple observation playback ([b586d82](https://github.com/rcpch/digital-pews/commit/b586d82adf2680db2aef916b2173560cb2f8c5c1))


### Documentation
- update README for Docker Compose usage and clarify prerequisites ([284c290](https://github.com/rcpch/digital-pews/commit/284c2908192363535f6a2c4a05029301a142971c))
- update README to clarify live-reload setup and Storybook story location ([92368ea](https://github.com/rcpch/digital-pews/commit/92368eacc9a6f609b1b913a516bad3d7e0937329))
- add CLAUDE.md with design system, clinical constraints, and UI vision ([baa06e9](https://github.com/rcpch/digital-pews/commit/baa06e978b55df06d96e9ac09530faf316f33555))
- consolidate spec&#x2F; from 19 files to 12, grounded in reference sources ([a62a8af](https://github.com/rcpch/digital-pews/commit/a62a8af9afd04d5611a19a5678c2fc04eae03951))
- add spec&#x2F;README.md index and landing page ([6b70675](https://github.com/rcpch/digital-pews/commit/6b70675261a286e14d1ba8108a414a04e1e3a1ec))
- tidy roadmap, add house-style audit, reconcile supporting plans ([35e1535](https://github.com/rcpch/digital-pews/commit/35e1535a67dd2bec184c83c2d7ac1500d9c4a109))
- warn about file:&#x2F;&#x2F; CORS error in embed examples ([b2f10b6](https://github.com/rcpch/digital-pews/commit/b2f10b6d4be18501f3374e1aac2abb4660061ae4))
- define component boundary and hazards ([58f4352](https://github.com/rcpch/digital-pews/commit/58f4352846bd9b370a1109d797f332fd9003a187))
- restructure roadmap and synthetic data plan ([041912f](https://github.com/rcpch/digital-pews/commit/041912f92569984fd345ccedaa0af3e82d774d09))
- document age-band boundary policy (R46) ([11ff5d4](https://github.com/rcpch/digital-pews/commit/11ff5d4cd058518a56cf6f63287077ce9e75a49a))
- investigate SMART version pass-back, find no safe channel (R61) ([e096f84](https://github.com/rcpch/digital-pews/commit/e096f84850def31c2594c08afc04ba316b34affa))
- add house-style audit findings to roadmap ([3499084](https://github.com/rcpch/digital-pews/commit/349908449c4911b3f7715b387d47126883525dad))
- add R62 - display release commit hash in version marker ([fa65b1a](https://github.com/rcpch/digital-pews/commit/fa65b1aa0b96a39ded8edad1cb7acaeef93669f9))
- research and document Oracle Cerner code Console registration (R42) ([89da628](https://github.com/rcpch/digital-pews/commit/89da6289a495d102400962ccaafb55badaf90b9a))
- preserve NHS charts and define development scope ([73fc999](https://github.com/rcpch/digital-pews/commit/73fc9991b123070223fad245669d55b84f555a16))


### Fixed
- serve demo at server root so s&#x2F;up shows it, not a listing ([69b805c](https://github.com/rcpch/digital-pews/commit/69b805c252a7e7c42819619dbf32fbfcc612964b))
- update SMART-on-FHIR PR for merge readiness ([1b2175c](https://github.com/rcpch/digital-pews/commit/1b2175cb4c2600f0e5a0cf0bb2d652ca307870b7))
- guard renderAll against pre-init calls and fix scrubber init order ([b6a68b7](https://github.com/rcpch/digital-pews/commit/b6a68b70cc8eda8d5ae42f34bc1513083351dcd8))
- align scrubber and Pages paths ([a49665c](https://github.com/rcpch/digital-pews/commit/a49665cc38d7f1a621890c74a988f3abe2325b1c))
- increase parameter heading legibility ([eb001b2](https://github.com/rcpch/digital-pews/commit/eb001b27dccfe672376aaa9de828cc118028aae3))
- replace age strip with chart identifier ([a00a247](https://github.com/rcpch/digital-pews/commit/a00a24776e9d8421b958c14f65a389ae7ea08fda))
- refine blood pressure markers ([e2b776e](https://github.com/rcpch/digital-pews/commit/e2b776e5751cfc4bf65f360ead6f8ae95fc62195))
- match reference band colours ([a5fd15f](https://github.com/rcpch/digital-pews/commit/a5fd15ff70a8f605d0732e702049e79b3eac0a9b))
- use interim web-rendered band colours ([84f3e67](https://github.com/rcpch/digital-pews/commit/84f3e674e44e6732435c60f8ae3fbe8e91454047))
- keep PEWS status bar stable ([9d614e9](https://github.com/rcpch/digital-pews/commit/9d614e903cfdcbbe5a620ec97bb3448c71de1d2b))
- equalize neutral status height ([d7be24a](https://github.com/rcpch/digital-pews/commit/d7be24a091fbc8c8c0b311f15e12a72e42c18466))
- remove excess plot bottom padding ([b3f239a](https://github.com/rcpch/digital-pews/commit/b3f239a89298a0690ca6e094058bf9cbf28c33b2))
- use open font fallbacks ([50c4cbe](https://github.com/rcpch/digital-pews/commit/50c4cbe25725ba2b1ee7899f65f23d0eb2842f24))
- restore executable bit on s&#x2F;up and s&#x2F;down ([c6a3945](https://github.com/rcpch/digital-pews/commit/c6a39454b10a2d5eedd1a3b303fe20d53c3ec02c))
- add LICENSES directory and cover remaining files for REUSE compliance ([b5a7007](https://github.com/rcpch/digital-pews/commit/b5a70079af40b78e0d6ac59ec186a48e45379b90))
- install zizmor via pip instead of taiki-e&#x2F;install-action ([4d195c9](https://github.com/rcpch/digital-pews/commit/4d195c9bda220a3545a17d2bef5c4f6dd2940f41))
- correct action SHAs and bump dependabot cooldown to satisfy zizmor ([1aaebe4](https://github.com/rcpch/digital-pews/commit/1aaebe455d03095995b0bb4ce26f39c191d417f0))
- use commit SHA not annotated-tag SHA for reuse-action ([467e9b7](https://github.com/rcpch/digital-pews/commit/467e9b792557d239f4cb067779849f4ed23b2574))


