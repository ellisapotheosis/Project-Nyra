## Unreleased


### Bug Fixes

* **ci:** stabilize current CI gates, repo-scoped tooling checks, and Docker matrix follow-ups ([#395](https://github.com/ellisapotheosis/Project-Nyra/pull/395)) ([#396](https://github.com/ellisapotheosis/Project-Nyra/pull/396)) ([#397](https://github.com/ellisapotheosis/Project-Nyra/pull/397)) ([#401](https://github.com/ellisapotheosis/Project-Nyra/pull/401)) ([#405](https://github.com/ellisapotheosis/Project-Nyra/pull/405)) ([#406](https://github.com/ellisapotheosis/Project-Nyra/pull/406)) ([#407](https://github.com/ellisapotheosis/Project-Nyra/pull/407))
* **oracle:** stabilize the Cloudflare tunnel stack ([#392](https://github.com/ellisapotheosis/Project-Nyra/pull/392)) ([597214c](https://github.com/ellisapotheosis/Project-Nyra/commit/597214c07955d83d668013c8374efac1386a3614))
* fix Letta MCP routing ([#391](https://github.com/ellisapotheosis/Project-Nyra/pull/391)) ([124d83b](https://github.com/ellisapotheosis/Project-Nyra/commit/124d83b2abb27addaca3d3da9649862fb6877489))


### Features

* **infra:** complete the Nyra foundation cleanup and runtime asset reorganization ([#394](https://github.com/ellisapotheosis/Project-Nyra/pull/394)) ([#400](https://github.com/ellisapotheosis/Project-Nyra/pull/400)) ([#403](https://github.com/ellisapotheosis/Project-Nyra/pull/403)) ([#408](https://github.com/ellisapotheosis/Project-Nyra/pull/408))
* **nyra-admin:** keep broker webapp service calls server-side and unify the mortgage CRM command center ([#398](https://github.com/ellisapotheosis/Project-Nyra/pull/398)) ([#404](https://github.com/ellisapotheosis/Project-Nyra/pull/404))
* **landing:** finalize lead capture integration, attribution, and audit logging ([67d142f](https://github.com/ellisapotheosis/Project-Nyra/commit/67d142f924b18af459926e86439eb270a0e4717c))
* **webapp:** complete Campaign Builder and Quote Desk updates, including channel previews and source attribution ([e5ee598](https://github.com/ellisapotheosis/Project-Nyra/commit/e5ee5980fce362898811d0b975eb56b3311a127a)) ([eee7f7d](https://github.com/ellisapotheosis/Project-Nyra/commit/eee7f7d6f22c7c6d8c69fbdc18d83ca88f5b0bb0)) ([f1cb8a4](https://github.com/ellisapotheosis/Project-Nyra/commit/f1cb8a48780f989af39a6ad0ee2349f83eb26559))
* **infra:** restore cluster deployment pieces for Activepieces MCP and llxprt bridge ([9041281](https://github.com/ellisapotheosis/Project-Nyra/commit/904128167d3477219d52f6019c70e5c9fc2a3b49))

# [1.2.0](https://github.com/ellisapotheosis/Project-Nyra/compare/v1.1.0...v1.2.0) (2026-03-11)


### Features

* add infra/dev-stack dashboard runtime stack ([#175](https://github.com/ellisapotheosis/Project-Nyra/issues/175)) ([5e04dd6](https://github.com/ellisapotheosis/Project-Nyra/commit/5e04dd6f731d43dec4c67e921a8864bb8264a350))

# [1.1.0](https://github.com/ellisapotheosis/Project-Nyra/compare/v1.0.2...v1.1.0) (2026-03-11)


### Bug Fixes

* **ci:** auto-handle codex PR lifecycle ([#153](https://github.com/ellisapotheosis/Project-Nyra/issues/153)) ([46138d6](https://github.com/ellisapotheosis/Project-Nyra/commit/46138d62faae119538a39d281db54f0c8911d645))
* **codex:** harden environment bootstrap paths ([c68706d](https://github.com/ellisapotheosis/Project-Nyra/commit/c68706d8c18ab100957da287ce8ea245869e511e))
* **landing:** restore ratehunter app and husky hooks after consolidation ([eea7b3d](https://github.com/ellisapotheosis/Project-Nyra/commit/eea7b3dce930f013b24da253b3cc3e1a8cac5ffa))


### Features

* add environment templates and deployment configs ([79653fa](https://github.com/ellisapotheosis/Project-Nyra/commit/79653fa53f356e78adaa620e30ebaae1af012acf))
* configure cross-PC persistent memory storage ([13f5432](https://github.com/ellisapotheosis/Project-Nyra/commit/13f5432ef1dd5a2500795c0c803673097085f7c8))

## [1.0.2](https://github.com/ellisapotheosis/Project-Nyra/compare/v1.0.1...v1.0.2) (2026-03-10)


### Bug Fixes

* **ci:** auto-handle codex PR lifecycle ([#153](https://github.com/ellisapotheosis/Project-Nyra/issues/153)) ([fcd30e4](https://github.com/ellisapotheosis/Project-Nyra/commit/fcd30e491850dad9f56889cc984dca0763fdce54))
* **landing:** restore ratehunter app and husky hooks after consolidation ([3670127](https://github.com/ellisapotheosis/Project-Nyra/commit/36701271a89e10d081485263364694477e1565a4))

## [1.0.1](https://github.com/ellisapotheosis/Project-Nyra/compare/v1.0.0...v1.0.1) (2026-03-10)


### Bug Fixes

* **ci-main:** skip unresolved twenty-crm workspace during install ([1568c4f](https://github.com/ellisapotheosis/Project-Nyra/commit/1568c4f675a8caf9cae8032ad19181f920fb939b))

# 1.0.0 (2026-03-10)


### Bug Fixes

* Address code review feedback - improved security and edge case handling ([3c80497](https://github.com/ellisapotheosis/Project-Nyra/commit/3c804972f3afc6d5f3fe09493901392d293991ed))
* **ci:** harden release, mirror, and main install flows ([941dc3e](https://github.com/ellisapotheosis/Project-Nyra/commit/941dc3e71dc4a810f17b67353bb008ab452c2baf))
* **docker:** Change Claude Flow Brain dashboard port to 3333 (avoid conflict with TwentyCRM) ([f6d2581](https://github.com/ellisapotheosis/Project-Nyra/commit/f6d258149fc8f7e30553c770db53ba40789e8557))
* **infra:** Configure Nexus Router as single LLM entry point, remove LiteLLM ([e309955](https://github.com/ellisapotheosis/Project-Nyra/commit/e309955368177bea37b3d04e3a95469a091a731d))
* **infra:** Fix healthchecks and Brain startup script ([6d896ef](https://github.com/ellisapotheosis/Project-Nyra/commit/6d896efcffb9a1cc27e5d8afe7551f37beba0c45))
* **infra:** Remove LiteLLM and OpenMemory from compose stack ([9f9bad9](https://github.com/ellisapotheosis/Project-Nyra/commit/9f9bad9ff11e8b060c56da1ac833a75aace19b4d))
* **landing:** make Cloudflare Pages build non-interactive ([#111](https://github.com/ellisapotheosis/Project-Nyra/issues/111)) ([228c484](https://github.com/ellisapotheosis/Project-Nyra/commit/228c4847056fe8e056a84c83e7dbf5d2e79f995a))
* make helper scripts executable ([e613244](https://github.com/ellisapotheosis/Project-Nyra/commit/e613244eb6f03e64c5cf7beaa45926ab38e22a1f))
* Remove broken git submodules causing Cloudflare build failures ([cf8b1b5](https://github.com/ellisapotheosis/Project-Nyra/commit/cf8b1b5d2afa12122f0bd58e9c463c9495594f79))
* Resolve Claude Code startup hang and optimize system configuration ([dde551c](https://github.com/ellisapotheosis/Project-Nyra/commit/dde551c7a90cb4f580ddcd7fe8ad84c1b61a5cf4))
* resolve doctor errors and add Infisical machine configs ([6d6ada5](https://github.com/ellisapotheosis/Project-Nyra/commit/6d6ada53d7e30069823be87805e49aae09c69aa0))
* resolve PR review issues for infrastructure PRs ([b503ed9](https://github.com/ellisapotheosis/Project-Nyra/commit/b503ed9862998d91d995576a9ff3424da8908cb0)), closes [#117](https://github.com/ellisapotheosis/Project-Nyra/issues/117) [#116](https://github.com/ellisapotheosis/Project-Nyra/issues/116)
* resolve stop hook npm errors and configure Volta/pnpm environment ([13ce60f](https://github.com/ellisapotheosis/Project-Nyra/commit/13ce60f6ef2c9cadaedfd28c9731f8a4d33d7b38))
* **review:** remove dynamic port range mapping and require absolute Claude path; update env example ([00d2a72](https://github.com/ellisapotheosis/Project-Nyra/commit/00d2a7204c5004a08010f3e698fcf471533874e4))


### Features

* add nyra-stack port generator (bash) ([09cf714](https://github.com/ellisapotheosis/Project-Nyra/commit/09cf7145ce1ff201ccc3e326447cee025a754080))
* add nyra-stack port generator (PowerShell) and update dashboard starter validation ([43b53d3](https://github.com/ellisapotheosis/Project-Nyra/commit/43b53d3dea73881199d6f542feaf5e72017ca170))
* add nyra-stack port override example ([d67721e](https://github.com/ellisapotheosis/Project-Nyra/commit/d67721ea217c40553669b7234abd89f8a7d668e5))
* Add complete NYRA-AIO-Bootstrap system ([750b1d9](https://github.com/ellisapotheosis/Project-Nyra/commit/750b1d9339dc7b175d7e29b1e415ea085aab1b5d))
* Add consolidated Project Nyra to ingest folder ([9ba2191](https://github.com/ellisapotheosis/Project-Nyra/commit/9ba2191f24264b85ec855639bc0ffee82ca08a85))
* add nyra-ingestion to .gitignore to exclude from tracking ([506e749](https://github.com/ellisapotheosis/Project-Nyra/commit/506e7495fcd914255d00eb02fe2f6f86cdaf9048))
* Add observability stack, deployment scripts, and environment configuration ([9b46918](https://github.com/ellisapotheosis/Project-Nyra/commit/9b469180977c915b1dd2a78e4c99c392945af000))
* add performance optimization and networking infrastructure ([9f2f227](https://github.com/ellisapotheosis/Project-Nyra/commit/9f2f22742346e6a00e56bc2822340b4f774618c8))
* Add RateHunter Next.js 15 frontend application ([571b600](https://github.com/ellisapotheosis/Project-Nyra/commit/571b600d23292d4fa6967330bbd9ec4ec5b1b391))
* Add unified bootstrap script for 4-PC cluster ([130595c](https://github.com/ellisapotheosis/Project-Nyra/commit/130595cf3c5d23db923e0780c5e686ad846239ef))
* **claude:** add Claude helpers and dual-mode agents ([0dd8ef3](https://github.com/ellisapotheosis/Project-Nyra/commit/0dd8ef31098a4b8c24e0008043cc93280fc3c6ba))
* Complete admin dashboard, n8n workflows, and API documentation ([e7b32a6](https://github.com/ellisapotheosis/Project-Nyra/commit/e7b32a6e2ead4eb7dbeec1f5c71baebb8712f7ec))
* Complete bootstrap consolidation and React GUI installer ([e0027c2](https://github.com/ellisapotheosis/Project-Nyra/commit/e0027c22e13e5bead6dd7aaca43f4c4467820654))
* Complete business services layer with Quote Engine, Campaign Engine, Orchestrator, and Mem0 REST API ([c68e47c](https://github.com/ellisapotheosis/Project-Nyra/commit/c68e47c3ca23a07f1540d90d4edd84812152e140))
* Complete consolidation and add comprehensive documentation ([998977a](https://github.com/ellisapotheosis/Project-Nyra/commit/998977a069fa3715b690167b56660a61c138d183))
* Complete Docker Compose with 22 services and management utilities ([54fdeeb](https://github.com/ellisapotheosis/Project-Nyra/commit/54fdeeb6eec5736f1678b6139ac1c5da9b098f22))
* Complete MCP server containerization infrastructure ([de2f554](https://github.com/ellisapotheosis/Project-Nyra/commit/de2f554e17464378b8a22280ed281d060aa90431))
* Complete NYRA Multi-Device Orchestrator system ([6a744f3](https://github.com/ellisapotheosis/Project-Nyra/commit/6a744f38aae5226923eb36405748435416604d77))
* Complete Phase 2 admin dashboard with auth, real-time WebSocket, and advanced features ([3b14eb9](https://github.com/ellisapotheosis/Project-Nyra/commit/3b14eb999b01e37e5c6982b70f71bf434df7e8ab))
* Complete production-ready Cloudflare Pages configuration ([95e8b5e](https://github.com/ellisapotheosis/Project-Nyra/commit/95e8b5e1335da93d2e46e56c16f2aa7fb55d829c))
* Complete repository consolidation and MCP server organization ([7af5095](https://github.com/ellisapotheosis/Project-Nyra/commit/7af509549d23a07586884662d96847c1f037a857))
* Complete repository consolidation with 15-agent swarm ([9c5ba01](https://github.com/ellisapotheosis/Project-Nyra/commit/9c5ba01205b2fd99421224a578d0af7f091b4ad1))
* Complete TwentyCRM integration with Turborepo and MCP server ([d702d7a](https://github.com/ellisapotheosis/Project-Nyra/commit/d702d7a8e69e160d2d013323c0ce762e834b4ee8))
* Comprehensive Cloudflare Pages deployment workflow with Infisical integration ([6e4c054](https://github.com/ellisapotheosis/Project-Nyra/commit/6e4c054cc87d2bf8f76dd21cd75b3aa29c8e0a05))
* Configure RateHunter landing for Cloudflare Pages and fix git submodules ([a94188b](https://github.com/ellisapotheosis/Project-Nyra/commit/a94188b779080b5e689b9d8ca511e6f8e5f9ea15))
* Consolidate n8n and TwentyCRM integrations into organized apps structure ([ea0f0d8](https://github.com/ellisapotheosis/Project-Nyra/commit/ea0f0d86c81f65ff65263a82c4e15a53e051c908))
* Consolidate n8n and TwentyCRM integrations into organized apps structure ([#146](https://github.com/ellisapotheosis/Project-Nyra/issues/146)) ([4d85f6d](https://github.com/ellisapotheosis/Project-Nyra/commit/4d85f6dde2ade0bbbb007fc5e6be7a85c198556e))
* **hive-mind:** Deploy 20+ agent swarm for full-stack development ([24187af](https://github.com/ellisapotheosis/Project-Nyra/commit/24187afafde84cdcba24b7749c2efb5ac3d5e259))
* **hive-swarm:** Agents generating 13.5M+ tokens of code ([b306dfa](https://github.com/ellisapotheosis/Project-Nyra/commit/b306dfa877947eb5c67dff080e151475f662e151))
* **infra:** Add Claude Flow Brain + CI/CD containers, remove legacy services ([8fe95a0](https://github.com/ellisapotheosis/Project-Nyra/commit/8fe95a084df086137c77bbab2fa5b2af3a1939cf))
* **infra:** add MCP servers compose stack (context-light vs hungry vs always-on) ([6089258](https://github.com/ellisapotheosis/Project-Nyra/commit/6089258b05931df9abc24fee6c0a7671a89ca453))
* **infra:** add nyra stack v6.2 integrations ([bf700d6](https://github.com/ellisapotheosis/Project-Nyra/commit/bf700d6a13385fbc919d3ac6c9130a5aedc76129))
* **infra:** add nyra stack v6.2 integrations ([#16](https://github.com/ellisapotheosis/Project-Nyra/issues/16)) ([3d9d3c3](https://github.com/ellisapotheosis/Project-Nyra/commit/3d9d3c33075d819e039db673f856ef7701d79e6b))
* **infra:** add worker GPU models, vLLM/LMCache, and Cloudflare tunnel ([d169ee1](https://github.com/ellisapotheosis/Project-Nyra/commit/d169ee11f21796f86ef14f429e40acb4b9ca205d))
* **ingestion:** add basic cleaners stub ([33e2a0a](https://github.com/ellisapotheosis/Project-Nyra/commit/33e2a0a5123c3f740451b4aefee7908ef1ebd1c1))
* **ingestion:** add default pipeline definition ([2ed6dc0](https://github.com/ellisapotheosis/Project-Nyra/commit/2ed6dc0aa6e8faa73d6c6b2f1cf3cbb5e453082d))
* **ingestion:** add minimal ingestion runner ([89591c6](https://github.com/ellisapotheosis/Project-Nyra/commit/89591c6294e4e116c7a7929e5038cb6659dc0eb0))
* **ingestion:** add neo4j storage profile ([2c5924f](https://github.com/ellisapotheosis/Project-Nyra/commit/2c5924ffad0f6e46f65e6aa96bd7096f4af3bd03))
* **ingestion:** add postgres storage profile ([7652083](https://github.com/ellisapotheosis/Project-Nyra/commit/765208375b27f35dcf85f5df3c86e9b152313fb6))
* **ingestion:** add qdrant storage profile ([75396fb](https://github.com/ellisapotheosis/Project-Nyra/commit/75396fb513a960593a48e5a9b8806a3bf856265c))
* **ingestion:** add Windows runner ([2cf0f87](https://github.com/ellisapotheosis/Project-Nyra/commit/2cf0f87eb1efcaa29c4ce254639409a1c39091b7))
* **ingestion:** preserve original Carrd export as virgin copy ([5fbd5e0](https://github.com/ellisapotheosis/Project-Nyra/commit/5fbd5e09ea2ad30313596e391d59c25da9216ec2))
* **landing:** integrate Carrd export with personal branding ([5ee7ba9](https://github.com/ellisapotheosis/Project-Nyra/commit/5ee7ba991a66160ea1bb503183ac7773d8990202))
* **memory:** Replace Zep with letta MCP + FalkorDB (496x faster) ([b2758d7](https://github.com/ellisapotheosis/Project-Nyra/commit/b2758d7a6a5b8bcea3374a749b9e4ce5e792efd6))
* Nexus Router with fuzzy tool search + complete deployment setup ([9c44c6f](https://github.com/ellisapotheosis/Project-Nyra/commit/9c44c6f575b1ba4137ba3ee6d6821934349d886e))
* Project Nyra - clean repo with essential files and configs ([7988994](https://github.com/ellisapotheosis/Project-Nyra/commit/79889947ffe2cc07416bfeaf6e7275ec1736201c))
